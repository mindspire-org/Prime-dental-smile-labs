import express from "express";
import {
  User, Clinic, Case, LabFile, Message, ActivityLog,
  Content, SeoMeta, Setting, Media, Page, Post,
  Notification, Testimonial, Service, EmailTemplate,
  Permission, RoleConfiguration, ContactEnquiry, Backup, PageView,
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

backupsRouter.get("/snapshots/:id/download", async (req, res) => {
  const snap = await Backup.findById(req.params.id);
  if (!snap || !snap.data) return res.status(404).json({ error: "Snapshot not found" });
  const filename = `${snap.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`;
  const json = JSON.stringify(snap.data, null, 2);
  res.setHeader("content-type", "application/json");
  res.setHeader("content-disposition", `attachment; filename="${filename}"`);
  res.status(200).end(json);
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
  "backup.retentionDays",
  "backup.retentionMonths",
  "backup.autoDeleteScope",
  "backup.autoDeleteEnabled",
];

backupsRouter.get("/settings", async (req, res) => {
  const saved = await Setting.find({ key: { $in: BACKUP_SETTING_KEYS } });
  const map = Object.fromEntries(saved.map(s => [s.key, s.value]));
  // Migrate old retentionMonths to retentionDays
  let retentionDays = Number(map["backup.retentionDays"]);
  if (!retentionDays && map["backup.retentionMonths"]) {
    const oldMonths = Number(map["backup.retentionMonths"]);
    retentionDays = oldMonths * 30;
  }
  if (!retentionDays) retentionDays = 90;
  res.json({
    autoBackup: map["backup.autoBackup"] ?? false,
    autoBackupIntervalDays: map["backup.autoBackupIntervalDays"] ?? 7,
    retentionDays,
    autoDeleteScope: map["backup.autoDeleteScope"] ?? "all",
    autoDeleteEnabled: map["backup.autoDeleteEnabled"] ?? false,
  });
});

backupsRouter.put("/settings", async (req, res) => {
  const { autoBackup, autoBackupIntervalDays, retentionDays, autoDeleteScope, autoDeleteEnabled } = req.body;
  const updates = [
    { key: "backup.autoBackup", value: autoBackup ?? false, type: "boolean", group: "system", label: "Auto Backup" },
    { key: "backup.autoBackupIntervalDays", value: Number(autoBackupIntervalDays) || 7, type: "number", group: "system", label: "Auto Backup Interval (Days)" },
    { key: "backup.retentionDays", value: Number(retentionDays) || 90, type: "number", group: "system", label: "Retention Period (Days)" },
    { key: "backup.autoDeleteScope", value: autoDeleteScope || "all", type: "text", group: "system", label: "Auto Delete Scope" },
    { key: "backup.autoDeleteEnabled", value: autoDeleteEnabled ?? false, type: "boolean", group: "system", label: "Auto Delete Enabled" },
  ];
  await Promise.all(updates.map(u => Setting.findOneAndUpdate({ key: u.key }, u, { upsert: true })));
  res.json({ ok: true });
});

/* ── Cleanup preview (counts only, no deletion) ───────── */
function getCutoffByDays(days) {
  const d = new Date();
  d.setDate(d.getDate() - (Number(days) || 90));
  return d;
}

backupsRouter.post("/cleanup-preview", async (req, res) => {
  const { days, scope } = req.body;
  const cutoff = getCutoffByDays(days);
  console.log("[Cleanup Preview] days:", days, "scope:", scope, "cutoff:", cutoff.toISOString());

  const counts = {};

  if (scope === "all" || scope === "cases") {
    counts.cases = await Case.countDocuments({ createdAt: { $lt: cutoff } });
    console.log("[Cleanup Preview] cases older than cutoff:", counts.cases);
  }
  if (scope === "all" || scope === "messages") {
    counts.messages = await Message.countDocuments({ createdAt: { $lt: cutoff } });
  }
  if (scope === "all" || scope === "files") {
    counts.files = await LabFile.countDocuments({ createdAt: { $lt: cutoff } });
    counts.media = await Media.countDocuments({ createdAt: { $lt: cutoff } });
  }
  if (scope === "all" || scope === "activity") {
    counts.activity = await ActivityLog.countDocuments({ createdAt: { $lt: cutoff } });
  }
  if (scope === "all" || scope === "contacts") {
    counts.contacts = await ContactEnquiry.countDocuments({ createdAt: { $lt: cutoff } });
  }

  res.json({ ok: true, cutoff: cutoff.toISOString(), counts });
});

/* ── Cleanup old data by retention ─────────────────────── */
backupsRouter.post("/cleanup", async (req, res) => {
  const { days, scope } = req.body;
  const cutoff = getCutoffByDays(days);

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

  res.json({ ok: true, deleted: results, cutoff: cutoff.toISOString() });
});

/* ── Hard Reset: delete everything except admin/lab users ── */
backupsRouter.post("/hard-reset", async (req, res) => {
  const results = {};

  // Delete all dentists (keep admin + lab_staff)
  const dentistDel = await User.deleteMany({ role: "dentist" });
  results.dentists = dentistDel.deletedCount || 0;

  // Delete all data collections
  const caseDel = await Case.deleteMany({});
  results.cases = caseDel.deletedCount || 0;
  const labDel = await LabFile.deleteMany({});
  results.labFiles = labDel.deletedCount || 0;
  const msgDel = await Message.deleteMany({});
  results.messages = msgDel.deletedCount || 0;
  const actDel = await ActivityLog.deleteMany({});
  results.activityLogs = actDel.deletedCount || 0;
  const contactDel = await ContactEnquiry.deleteMany({});
  results.contactEnquiries = contactDel.deletedCount || 0;
  const clinicDel = await Clinic.deleteMany({});
  results.clinics = clinicDel.deletedCount || 0;
  const mediaDel = await Media.deleteMany({});
  results.media = mediaDel.deletedCount || 0;
  const contentDel = await Content.deleteMany({});
  results.contents = contentDel.deletedCount || 0;
  const seoDel = await SeoMeta.deleteMany({});
  results.seoMetas = seoDel.deletedCount || 0;
  const pageDel = await Page.deleteMany({});
  results.pages = pageDel.deletedCount || 0;
  const postDel = await Post.deleteMany({});
  results.posts = postDel.deletedCount || 0;
  const notifDel = await Notification.deleteMany({});
  results.notifications = notifDel.deletedCount || 0;
  const testDel = await Testimonial.deleteMany({});
  results.testimonials = testDel.deletedCount || 0;
  const svcDel = await Service.deleteMany({});
  results.services = svcDel.deletedCount || 0;
  const emailDel = await EmailTemplate.deleteMany({});
  results.emailTemplates = emailDel.deletedCount || 0;
  const backupDel = await Backup.deleteMany({});
  results.backups = backupDel.deletedCount || 0;
  const pvDel = await PageView.deleteMany({});
  results.pageViews = pvDel.deletedCount || 0;

  // Keep: admin/lab users, Settings, RoleConfiguration, Permission

  res.json({ ok: true, deleted: results });
});
