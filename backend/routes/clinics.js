import express from "express";
import { Clinic } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const clinicsRouter = express.Router();

clinicsRouter.use(requireAuth);

clinicsRouter.get("/", requireRole("admin", "lab_staff"), async (req, res) => {
  const clinics = await Clinic.find().sort({ name: 1 });
  res.json({ clinics });
});

clinicsRouter.post("/", requireRole("admin"), async (req, res) => {
  const clinic = await Clinic.create(req.body);
  res.status(201).json({ clinic });
});

clinicsRouter.patch("/:id", requireRole("admin"), async (req, res) => {
  const clinic = await Clinic.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!clinic) return res.status(404).json({ error: "Clinic not found" });
  res.json({ clinic });
});
