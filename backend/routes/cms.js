import express from "express";
import { Testimonial, Service, Notification } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { logActivity } from "../services/activity.js";

export const cmsRouter = express.Router();
cmsRouter.use(requireAuth, requireRole("admin", "lab_staff"));

/* ── Testimonials ─────────────────────────────────────── */
cmsRouter.get("/testimonials", async (_req, res) => {
  const items = await Testimonial.find().sort({ order: 1, createdAt: -1 });
  res.json({ items });
});
cmsRouter.post("/testimonials", async (req, res) => {
  const item = await Testimonial.create(req.body);
  res.status(201).json({ item });
});
cmsRouter.patch("/testimonials/:id", async (req, res) => {
  const item = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ item });
});
cmsRouter.delete("/testimonials/:id", requireRole("admin"), async (req, res) => {
  await Testimonial.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

/* ── Services ─────────────────────────────────────────── */
cmsRouter.get("/services", async (_req, res) => {
  const items = await Service.find().sort({ order: 1 });
  res.json({ items });
});
cmsRouter.post("/services", requireRole("admin"), async (req, res) => {
  const item = await Service.create(req.body);
  await logActivity({ actor: req.user._id, action: "service.created", entityType: "Service", entityId: item._id });
  res.status(201).json({ item });
});
cmsRouter.patch("/services/:id", requireRole("admin"), async (req, res) => {
  const item = await Service.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ item });
});
cmsRouter.delete("/services/:id", requireRole("admin"), async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

/* ── Notifications / Announcements ───────────────────── */
cmsRouter.get("/notifications", async (_req, res) => {
  const items = await Notification.find().sort({ createdAt: -1 });
  res.json({ items });
});
cmsRouter.get("/notifications/active", async (req, res) => {
  const now = new Date();
  const filter = { active: true, startAt: { $lte: now }, $or: [{ endAt: null }, { endAt: { $gte: now } }] };
  const items = await Notification.find(filter).sort({ createdAt: -1 });
  res.json({ items });
});
cmsRouter.post("/notifications", requireRole("admin"), async (req, res) => {
  const item = await Notification.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ item });
});
cmsRouter.patch("/notifications/:id", requireRole("admin"), async (req, res) => {
  const item = await Notification.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ item });
});
cmsRouter.delete("/notifications/:id", requireRole("admin"), async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});
