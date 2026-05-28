import express from "express";
import { User, Clinic, Case, CASE_STATUSES, ActivityLog, Content, SeoMeta } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { logActivity } from "../services/activity.js";
import { sendEmail, sendWelcomeEmail } from "../services/email.js";
import crypto from "node:crypto";

export const adminRouter = express.Router();

adminRouter.use(requireAuth, requireRole("admin", "lab_staff"));

/* ── Overview stats ─────────────────────────────────────── */
adminRouter.get("/stats", async (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalCases, activeCases, completedCases, dispatchedThisMonth,
    totalUsers, totalDentists, totalLabStaff, totalClinics,
    awaitingInfo, inProduction,
    casesThisMonth, casesLastMonth,
    recentActivity,
    casesByStatus,
  ] = await Promise.all([
    Case.countDocuments(),
    Case.countDocuments({ status: { $nin: ["Dispatched", "Completed"] } }),
    Case.countDocuments({ status: "Completed" }),
    Case.countDocuments({ status: "Dispatched", updatedAt: { $gte: monthStart } }),
    User.countDocuments({ active: true }),
    User.countDocuments({ role: "dentist", active: true }),
    User.countDocuments({ role: "lab_staff", active: true }),
    Clinic.countDocuments(),
    Case.countDocuments({ status: "Awaiting Information" }),
    Case.countDocuments({ status: "In Production" }),
    Case.countDocuments({ createdAt: { $gte: monthStart } }),
    Case.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: monthStart } }),
    ActivityLog.find().populate("actor", "name role").sort({ createdAt: -1 }).limit(15),
    Case.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const monthGrowth = casesLastMonth > 0
    ? Math.round(((casesThisMonth - casesLastMonth) / casesLastMonth) * 100)
    : casesThisMonth > 0 ? 100 : 0;

  res.json({
    cases: { total: totalCases, active: activeCases, completed: completedCases, dispatched: dispatchedThisMonth, awaitingInfo, inProduction, thisMonth: casesThisMonth, monthGrowth },
    users: { total: totalUsers, dentists: totalDentists, labStaff: totalLabStaff },
    clinics: { total: totalClinics },
    byStatus: Object.fromEntries(casesByStatus.map(({ _id, count }) => [_id, count])),
    recentActivity,
  });
});

/* ── Cases management ───────────────────────────────────── */
adminRouter.get("/cases", async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Number(req.query.limit || 25), 100);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) filter.$or = [
    { caseNumber: new RegExp(req.query.search, "i") },
    { patientRef: new RegExp(req.query.search, "i") },
  ];
  if (req.query.dentist) filter.dentist = req.query.dentist;
  if (req.query.urgency) filter.urgency = req.query.urgency;
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) {
      const toDate = new Date(req.query.to);
      toDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = toDate;
    }
  }

  const [items, total] = await Promise.all([
    Case.find(filter).populate("dentist", "name email").populate("clinic", "name city").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Case.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

adminRouter.patch("/cases/:id/status", async (req, res) => {
  const { status, note } = req.body;
  if (!CASE_STATUSES.includes(status)) return res.status(400).json({ error: "Invalid status" });
  const dentalCase = await Case.findById(req.params.id).populate("dentist", "name email");
  if (!dentalCase) return res.status(404).json({ error: "Case not found" });
  dentalCase.status = status;
  dentalCase.statusHistory.push({ status, note, by: req.user._id });
  await dentalCase.save();
  await logActivity({ actor: req.user._id, action: "case.status_changed", entityType: "Case", entityId: dentalCase._id, metadata: { status, note } });
  await sendEmail({ to: dentalCase.dentist.email, subject: `Case ${dentalCase.caseNumber} updated`, text: `Status changed to: ${status}` });
  res.json({ case: dentalCase });
});

adminRouter.delete("/cases/:id", requireRole("admin"), async (req, res) => {
  await Case.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

/* ── Users management ───────────────────────────────────── */
adminRouter.get("/users", requireRole("admin"), async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Number(req.query.limit || 30), 100);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) filter.$or = [
    { name: new RegExp(req.query.search, "i") },
    { email: new RegExp(req.query.search, "i") },
  ];

  const [users, total] = await Promise.all([
    User.find(filter).select("-passwordHash -refreshTokens").populate("clinic", "name city").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ users, total, page, pages: Math.ceil(total / limit) });
});

adminRouter.post("/users", requireRole("admin"), async (req, res) => {
  const { name, email, role, clinicId, phone, gdcNumber, password } = req.body;
  if (!email?.trim()) return res.status(400).json({ error: "Email is required" });
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: "A user with this email already exists" });
  const pw = password || crypto.randomBytes(9).toString("base64url");
  const user = await User.create({
    name, email: email.toLowerCase(), role: role || "dentist",
    passwordHash: await User.hashPassword(pw),
    clinic: clinicId || undefined, phone, gdcNumber,
  });
  await sendWelcomeEmail({ to: user.email, name: user.name, temporaryPassword: pw });
  await logActivity({ actor: req.user._id, action: "user.created", entityType: "User", entityId: user._id });
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, temporaryPassword: pw });
});

adminRouter.patch("/users/:id", requireRole("admin"), async (req, res) => {
  const allowed = ["name", "role", "phone", "gdcNumber", "active", "clinic"];
  const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const user = await User.findByIdAndUpdate(req.params.id, update, { returnDocument: "after" }).select("-passwordHash -refreshTokens").populate("clinic", "name");
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({ user });
});

adminRouter.delete("/users/:id", requireRole("admin"), async (req, res) => {
  if (req.params.id === req.user._id.toString()) return res.status(400).json({ error: "Cannot delete yourself" });
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

adminRouter.post("/users/:id/reset-password", requireRole("admin"), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  const pw = crypto.randomBytes(9).toString("base64url");
  user.passwordHash = await User.hashPassword(pw);
  user.refreshTokens = [];
  await user.save();
  await sendWelcomeEmail({ to: user.email, name: user.name, temporaryPassword: pw });
  res.json({ temporaryPassword: pw });
});

/* ── Clinics management ─────────────────────────────────── */
adminRouter.get("/clinics", async (req, res) => {
  const clinics = await Clinic.find().sort({ name: 1 });
  const counts = await Case.aggregate([{ $group: { _id: "$clinic", count: { $sum: 1 } } }]);
  const caseMap = Object.fromEntries(counts.map(({ _id, count }) => [String(_id), count]));
  const result = clinics.map((c) => ({ ...c.toObject(), caseCount: caseMap[String(c._id)] || 0 }));
  res.json({ clinics: result });
});

adminRouter.post("/clinics", requireRole("admin"), async (req, res) => {
  const clinic = await Clinic.create(req.body);
  res.status(201).json({ clinic });
});

adminRouter.patch("/clinics/:id", requireRole("admin"), async (req, res) => {
  const clinic = await Clinic.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
  if (!clinic) return res.status(404).json({ error: "Not found" });
  res.json({ clinic });
});

adminRouter.delete("/clinics/:id", requireRole("admin"), async (req, res) => {
  await Clinic.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

/* ── Content CMS ────────────────────────────────────────── */
adminRouter.get("/content", async (req, res) => {
  const filter = {};
  if (req.query.page) filter.page = req.query.page;
  const items = await Content.find(filter).sort({ page: 1, section: 1, key: 1 });
  res.json({ items });
});

adminRouter.put("/content", requireRole("admin"), async (req, res) => {
  const { page, section, key, value, type } = req.body;
  const item = await Content.findOneAndUpdate(
    { page, section, key },
    { value, type: type || "text", updatedBy: req.user._id },
    { upsert: true, returnDocument: "after" },
  );
  await logActivity({ actor: req.user._id, action: "content.updated", entityType: "Content", entityId: item._id, metadata: { page, section, key } });
  res.json({ item });
});

adminRouter.delete("/content/:id", requireRole("admin"), async (req, res) => {
  await Content.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

/* ── SEO Meta ───────────────────────────────────────────── */
adminRouter.get("/seo", async (req, res) => {
  const items = await SeoMeta.find().sort({ page: 1 });
  res.json({ items });
});

adminRouter.put("/seo/:page", requireRole("admin"), async (req, res) => {
  const item = await SeoMeta.findOneAndUpdate(
    { page: req.params.page },
    { ...req.body, updatedBy: req.user._id },
    { upsert: true, returnDocument: "after" },
  );
  await logActivity({ actor: req.user._id, action: "seo.updated", entityType: "SeoMeta", entityId: item._id, metadata: { page: req.params.page } });
  res.json({ item });
});

/* ── Finance / Reports ──────────────────────────────────── */
adminRouter.get("/finance", async (req, res) => {
  let from, to;
  if (req.query.from && req.query.to) {
    from = new Date(req.query.from);
    to = new Date(req.query.to);
    to.setHours(23, 59, 59, 999);
  } else {
    const months = Number(req.query.months || 6);
    from = new Date();
    from.setMonth(from.getMonth() - months);
    to = new Date();
    to.setHours(23, 59, 59, 999);
  }

  const dateFilter = { createdAt: { $gte: from, $lte: to } };

  const [monthlyCases, statusBreakdown, urgencyBreakdown, topDentists, topClinics, totalCases, totalClinics, totalDentists] = await Promise.all([
    Case.aggregate([
      { $match: dateFilter },
      { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
    Case.aggregate([{ $match: dateFilter }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Case.aggregate([{ $match: dateFilter }, { $group: { _id: "$urgency", count: { $sum: 1 } } }]),
    Case.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$dentist", count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "dentist" } },
      { $unwind: "$dentist" },
      { $project: { name: "$dentist.name", email: "$dentist.email", count: 1 } },
    ]),
    Case.aggregate([
      { $match: { ...dateFilter, clinic: { $ne: null } } },
      { $group: { _id: "$clinic", count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 },
      { $lookup: { from: "clinics", localField: "_id", foreignField: "_id", as: "clinic" } },
      { $unwind: "$clinic" },
      { $project: { name: "$clinic.name", city: "$clinic.city", count: 1 } },
    ]),
    Case.countDocuments(dateFilter),
    Case.distinct("clinic", dateFilter).then(arr => arr.filter(Boolean).length),
    Case.distinct("dentist", dateFilter).then(arr => arr.length),
  ]);

  res.json({ monthlyCases, statusBreakdown, urgencyBreakdown, topDentists, topClinics, totalCases, totalClinics, totalDentists, from, to });
});

/* ── Activity Log ───────────────────────────────────────── */
adminRouter.get("/activity", async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const filter = {};
  if (req.query.action) filter.action = new RegExp(req.query.action, "i");

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter).populate("actor", "name role email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    ActivityLog.countDocuments(filter),
  ]);
  res.json({ logs, total, page, pages: Math.ceil(total / limit) });
});
