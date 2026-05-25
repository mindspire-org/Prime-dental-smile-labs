import express from "express";
import { Case } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";

export const dashboardRouter = express.Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/", async (req, res) => {
  const filter = req.user.role === "dentist" ? { dentist: req.user._id } : {};
  const [totalCases, activeCases, awaitingAction, dispatchedThisMonth, recentCases] = await Promise.all([
    Case.countDocuments(filter),
    Case.countDocuments({ ...filter, status: { $nin: ["Dispatched", "Completed"] } }),
    Case.countDocuments({ ...filter, status: "Awaiting Information" }),
    Case.countDocuments({ ...filter, status: "Dispatched", updatedAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
    Case.find(filter).populate("dentist", "name email").populate("clinic").sort({ createdAt: -1 }).limit(10),
  ]);

  res.json({ stats: { totalCases, activeCases, awaitingAction, dispatchedThisMonth }, recentCases });
});
