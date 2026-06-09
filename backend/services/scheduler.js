import {
  Case, Message, LabFile, Media, ActivityLog, ContactEnquiry, Setting,
} from "../models/index.js";

const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCutoffByDays(days) {
  const d = new Date();
  d.setDate(d.getDate() - (Number(days) || 90));
  return d;
}

async function runAutoCleanup() {
  try {
    const autoDelete = await Setting.findOne({ key: "backup.autoDeleteEnabled" });
    if (!autoDelete || !autoDelete.value) return;

    let retention = await Setting.findOne({ key: "backup.retentionDays" });
    if (!retention) {
      retention = await Setting.findOne({ key: "backup.retentionMonths" });
      if (retention) retention = { value: Number(retention.value) * 30 };
    }
    const scope = await Setting.findOne({ key: "backup.autoDeleteScope" });
    const retentionDays = Number(retention?.value) || 90;
    const deleteScope = scope?.value || "all";
    const cutoff = getCutoffByDays(retentionDays);

    const results = {};

    if (deleteScope === "all" || deleteScope === "cases") {
      const r = await Case.deleteMany({ createdAt: { $lt: cutoff } });
      results.cases = r.deletedCount || 0;
    }
    if (deleteScope === "all" || deleteScope === "messages") {
      const r = await Message.deleteMany({ createdAt: { $lt: cutoff } });
      results.messages = r.deletedCount || 0;
    }
    if (deleteScope === "all" || deleteScope === "files") {
      const r = await LabFile.deleteMany({ createdAt: { $lt: cutoff } });
      results.files = r.deletedCount || 0;
      const mr = await Media.deleteMany({ createdAt: { $lt: cutoff } });
      results.media = mr.deletedCount || 0;
    }
    if (deleteScope === "all" || deleteScope === "activity") {
      const r = await ActivityLog.deleteMany({ createdAt: { $lt: cutoff } });
      results.activity = r.deletedCount || 0;
    }
    if (deleteScope === "all" || deleteScope === "contacts") {
      const r = await ContactEnquiry.deleteMany({ createdAt: { $lt: cutoff } });
      results.contacts = r.deletedCount || 0;
    }

    console.log("[Scheduler] Auto-cleanup completed:", results);
  } catch (err) {
    console.error("[Scheduler] Auto-cleanup failed:", err.message);
  }
}

export function startScheduler() {
  // Run immediately on startup (with slight delay to let DB connect)
  setTimeout(runAutoCleanup, 5000);
  // Then run every 24 hours
  setInterval(runAutoCleanup, CLEANUP_INTERVAL_MS);
  console.log("[Scheduler] Auto-cleanup scheduler started (runs every 24h)");
}
