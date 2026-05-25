import express from "express";
import { z } from "zod";
import { Case, CASE_STATUSES, Message } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { logActivity } from "../services/activity.js";
import { sendCaseSubmittedEmail, sendStatusChangedEmail } from "../services/email.js";
import { notifyUser } from "../services/realtime.js";

export const casesRouter = express.Router();

casesRouter.use(requireAuth);

function accessFilter(user) {
  return user.role === "dentist" ? { dentist: user._id } : {};
}

const submitSchema = z.object({
  body: z.object({
    patientRef: z.string().min(1),
    clinicReference: z.string().optional(),
    patientGender: z.string().optional(),
    patientAge: z.number().optional(),
    services: z.array(z.string()).default([]),
    teeth: z.record(z.string(), z.string()).optional(),
    material: z.string().optional(),
    shade: z.any().optional(),
    implant: z.any().optional(),
    shipping: z.any().optional(),
    notes: z.string().optional(),
    urgency: z.enum(["Standard", "Express", "Urgent"]).default("Standard"),
    requestedCompletion: z.string().optional(),
  }),
});

casesRouter.get("/", async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const filter = { ...accessFilter(req.user) };

  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) filter.$or = [{ caseNumber: new RegExp(req.query.search, "i") }, { patientRef: new RegExp(req.query.search, "i") }];

  const [items, total] = await Promise.all([
    Case.find(filter).populate("dentist", "name email").populate("clinic").populate("files").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Case.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

casesRouter.post("/", validate(submitSchema), async (req, res) => {
  const data = req.validated.body;
  const dentalCase = await Case.create({
    ...data,
    requestedCompletion: data.requestedCompletion ? new Date(data.requestedCompletion) : undefined,
    dentist: req.user._id,
    clinic: req.user.clinic,
    statusHistory: [{ status: "Submitted", by: req.user._id }],
  });

  await logActivity({ actor: req.user._id, action: "case.created", entityType: "Case", entityId: dentalCase._id });
  await sendCaseSubmittedEmail({ to: req.user.email, name: req.user.name, caseNumber: dentalCase.caseNumber });
  res.status(201).json({ case: dentalCase });
});

casesRouter.get("/:id", async (req, res) => {
  const dentalCase = await Case.findOne({ _id: req.params.id, ...accessFilter(req.user) }).populate("dentist", "name email").populate("clinic").populate("files");
  if (!dentalCase) return res.status(404).json({ error: "Case not found" });
  const messages = await Message.find({ case: dentalCase._id }).populate("sender", "name role").sort({ createdAt: 1 });
  res.json({ case: dentalCase, messages });
});

casesRouter.get("/number/:caseNumber", async (req, res) => {
  const dentalCase = await Case.findOne({ caseNumber: req.params.caseNumber, ...accessFilter(req.user) }).populate("dentist", "name email").populate("clinic").populate("files");
  if (!dentalCase) return res.status(404).json({ error: "Case not found" });
  const messages = await Message.find({ case: dentalCase._id }).populate("sender", "name role").sort({ createdAt: 1 });
  res.json({ case: dentalCase, messages });
});

casesRouter.patch("/:id", async (req, res) => {
  const dentalCase = await Case.findOne({ _id: req.params.id, ...accessFilter(req.user) });
  if (!dentalCase) return res.status(404).json({ error: "Case not found" });

  const allowedForDentist = ["notes", "clinicReference", "requestedCompletion", "shipping"];
  const allowedForStaff = [...allowedForDentist, "patientRef", "services", "material", "shade", "implant", "teeth", "urgency"];
  const allowed = req.user.role === "dentist" ? allowedForDentist : allowedForStaff;

  for (const [key, value] of Object.entries(req.body)) {
    if (allowed.includes(key)) dentalCase[key] = value;
  }
  if (req.body.requestedCompletion) dentalCase.requestedCompletion = new Date(req.body.requestedCompletion);

  await dentalCase.save();
  await logActivity({ actor: req.user._id, action: "case.updated", entityType: "Case", entityId: dentalCase._id });
  notifyUser(dentalCase.dentist.toString(), { type: "case:updated", caseId: dentalCase._id });
  res.json({ case: dentalCase });
});

casesRouter.patch("/:id/status", requireRole("admin", "lab_staff"), async (req, res) => {
  const { status, note } = req.body;
  if (!CASE_STATUSES.includes(status)) return res.status(400).json({ error: "Invalid status" });

  const dentalCase = await Case.findById(req.params.id).populate("dentist", "name email");
  if (!dentalCase) return res.status(404).json({ error: "Case not found" });

  dentalCase.status = status;
  dentalCase.statusHistory.push({ status, note, by: req.user._id });
  await dentalCase.save();

  await logActivity({ actor: req.user._id, action: "case.status_changed", entityType: "Case", entityId: dentalCase._id, metadata: { status, note } });
  await sendStatusChangedEmail({ to: dentalCase.dentist.email, name: dentalCase.dentist.name, caseNumber: dentalCase.caseNumber, status, note });
  notifyUser(dentalCase.dentist._id, { type: "case:status_changed", caseId: dentalCase._id, status });

  res.json({ case: dentalCase });
});
