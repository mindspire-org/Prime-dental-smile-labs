import express from "express";
import { User } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const usersRouter = express.Router();

usersRouter.use(requireAuth, requireRole("admin"));

usersRouter.get("/", async (req, res) => {
  const users = await User.find().select("-passwordHash -refreshTokens").populate("clinic").sort({ createdAt: -1 });
  res.json({ users });
});

usersRouter.patch("/:id", async (req, res) => {
  const allowed = ["name", "role", "phone", "gdcNumber", "active", "clinic"];
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-passwordHash -refreshTokens");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

// Soft-delete: deactivate user — preserves audit trail per UK data retention requirements
usersRouter.delete("/:id", async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ error: "Cannot deactivate your own account" });
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { active: false, $set: { refreshTokens: [] } },
    { new: true },
  ).select("-passwordHash -refreshTokens");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user, message: "User deactivated successfully" });
});
