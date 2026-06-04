import express from "express";
import {
  User, Clinic, Case, LabFile, Message, ActivityLog,
  Content, SeoMeta, Setting, Media, Page, Post,
  Notification, Testimonial, Service, EmailTemplate,
  Permission, RoleConfiguration, ContactEnquiry, Backup,
} from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const backupsRouter = express.Router();
backupsRouter.use(requireAuth, requireRole("admin"));

const MODELS = {
  users: User,
  clinics: Clinic,
  cases: Case,
  labFiles: LabFile,
  messages: Message,
  activityLogs: ActivityLog,
  contents: Content,
  seoMetas: SeoMeta,
  settings: Setting,
  media: Media,
  pages: Page,
  posts: Post,
  notifications: Notification,
  testimonials: Testimonial,
  services: Service,
  emailTemplates: EmailTemplate,
  permissions: Permission,
  roleConfigurations: RoleConfiguration,
  contactEnquiries: ContactEnquiry,
};

/* ── Snapshots ──────────────────────────────────────────── */
backupsRouter.get("/snapshots", async (req, res) => {
  const items = await Backup.find({ type: "snapshot" }).sort({ createdAt: -1 }).populate("createdBy", "name");
  res.json({ snapshots: items });
});

backupsRouter.post("/snapshots", async (req, res) => {
  const { name } = req.body;
  const data = {};
  for (const [key, Model] of Object.entries(MODELS)) {
    data[key] = await Model.find().lean();
  }
  const size = Buffer.byteLength(JSON.stringify(data), "utf8");
  const snapshot = await Backup.create({ name: name || `Snapshot ${new Date().toISOString().slice(0, 16)}`, type: "snapshot", data, size, createdBy: req.user._id });
  res.json({ snapshot });
});

backupsRouter.delete("/snapshots/:id", async (req, res) => {
  await Backup.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

backupsRouter.post("/snapshots/:id/restore", async (req, res) => {
  const snap = await Backup.findById(req.params.id);
  if (!snap || !snap.data) return res.status(404).json({ error: "Snapshot not found" });
  const { collections } = req.body;
  const targets = collections && collections.length ? collections : Object.keys(MODELS);
  for (const key of targets) {
    const Model = MODELS[key];
    if (!Model || !snap.data[key]) continue;
    await Model.deleteMany({});
    if (Array.isArray(snap.data[key]) && snap.data[key].length > 0) {
      await Model.insertMany(snap.data[key].map(doc => {
        const { _id, ...rest } = doc;
        return rest;
      }));
    }
  }
  res.json({ ok: true });
});

/* ── Export ─────────────────────────────────────────────── */
backupsRouter.post("/export", async (req, res) => {
  const { collections } = req.body;
  const data = {};
  const targets = collections && collections.length ? collections : Object.keys(MODELS);
  for (const key of targets) {
    const Model = MODELS[key];
    if (Model) data[key] = await Model.find().lean();
  }
  const json = JSON.stringify(data, null, 2);
  const size = Buffer.byteLength(json, "utf8");
  await Backup.create({ name: `Export ${new Date().toISOString().slice(0, 16)}`, type: "export", data, size, createdBy: req.user._id });
  res.setHeader("content-type", "application/json");
  res.setHeader("content-disposition", 'attachment; filename="prime-smile-backup.json"');
  res.send(json);
});

/* ── Import ─────────────────────────────────────────────── */
backupsRouter.post("/import", async (req, res) => {
  const { data, collections, overwrite } = req.body;
  if (!data || typeof data !== "object") return res.status(400).json({ error: "Invalid data" });
  const targets = collections && collections.length ? collections : Object.keys(MODELS);
  let imported = 0;
  for (const key of targets) {
    const Model = MODELS[key];
    const docs = data[key];
    if (!Model || !Array.isArray(docs)) continue;
    if (overwrite) await Model.deleteMany({});
    if (docs.length > 0) {
      await Model.insertMany(docs.map(doc => {
        const { _id, id, __v, createdAt, updatedAt, ...rest } = doc;
        return rest;
      }));
      imported += docs.length;
    }
  }
  res.json({ ok: true, imported });
});

/* ── Settings ─────────────────────────────────────────── */
const BACKUP_SETTING_KEYS = [
  "backup.autoBackup",
  "backup.autoBackupIntervalDays",
  "backup.retentionMonths",
  "backup.autoDeleteScope",
  "backup.autoDeleteEnabled",
];

backupsRouter.get("/settings", async (req, res) => {
  const saved = await Setting.find({ key: { $in: BACKUP_SETTING_KEYS } });
  const map = Object.fromEntries(saved.map(s => [s.key, s.value]));
  res.json({
    autoBackup: map["backup.autoBackup"] ?? false,
    autoBackupIntervalDays: map["backup.autoBackupIntervalDays"] ?? 7,
    retentionMonths: map["backup.retentionMonths"] ?? 3,
    autoDeleteScope: map["backup.autoDeleteScope"] ?? "all",
    autoDeleteEnabled: map["backup.autoDeleteEnabled"] ?? false,
  });
});

backupsRouter.put("/settings", async (req, res) => {
  const { autoBackup, autoBackupIntervalDays, retentionMonths, autoDeleteScope, autoDeleteEnabled } = req.body;
  const updates = [
    { key: "backup.autoBackup", value: autoBackup ?? false, type: "boolean", group: "system", label: "Auto Backup" },
    { key: "backup.autoBackupIntervalDays", value: Number(autoBackupIntervalDays) || 7, type: "number", group: "system", label: "Auto Backup Interval (Days)" },
    { key: "backup.retentionMonths", value: Number(retentionMonths) || 3, type: "number", group: "system", label: "Retention Period (Months)" },
    { key: "backup.autoDeleteScope", value: autoDeleteScope || "all", type: "text", group: "system", label: "Auto Delete Scope" },
    { key: "backup.autoDeleteEnabled", value: autoDeleteEnabled ?? false, type: "boolean", group: "system", label: "Auto Delete Enabled" },
  ];
  await Promise.all(updates.map(u => Setting.findOneAndUpdate({ key: u.key }, u, { upsert: true })));
  res.json({ ok: true });
});

/* ── Cleanup old data by retention ─────────────────────── */
backupsRouter.post("/cleanup", async (req, res) => {
  const { months, scope } = req.body;
  const retentionMonths = Number(months) || 3;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - retentionMonths);

  const results = {};

  if (scope === "all" || scope === "cases") {
    const r = await Case.deleteMany({ createdAt: { $lt: cutoff } });
    results.cases = r.deletedCount || 0;
  }
  if (scope === "all" || scope === "messages") {
    const r = await Message.deleteMany({ createdAt: { $lt: cutoff } });
    results.messages = r.deletedCount || 0;
  }
  if (scope === "all" || scope === "files") {
    const r = await LabFile.deleteMany({ createdAt: { $lt: cutoff } });
    results.files = r.deletedCount || 0;
    const mr = await Media.deleteMany({ createdAt: { $lt: cutoff } });
    results.media = mr.deletedCount || 0;
  }
  if (scope === "all" || scope === "activity") {
    const r = await ActivityLog.deleteMany({ createdAt: { $lt: cutoff } });
    results.activity = r.deletedCount || 0;
  }
  if (scope === "all" || scope === "contacts") {
    const r = await ContactEnquiry.deleteMany({ createdAt: { $lt: cutoff } });
    results.contacts = r.deletedCount || 0;
  }

  res.json({ ok: true, deleted: results });
});
