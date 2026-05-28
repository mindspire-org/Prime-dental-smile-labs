import express from "express";
import { Case, LabFile } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";
import { createDownloadUrl, createUploadUrl, createMessageUploadUrl, saveLocalFile } from "../services/storage.js";
import { logActivity } from "../services/activity.js";

export const filesRouter = express.Router();

// Local file upload endpoint (no auth — URL is only given to authenticated callers via upload-url)
filesRouter.put("/upload-local", express.raw({ type: "*/*", limit: "50mb" }), async (req, res) => {
  try {
    const key = req.query.key;
    if (!key) return res.status(400).json({ error: "key required" });
    await saveLocalFile(key, req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error("[local upload error]", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

filesRouter.use(requireAuth);

async function findAccessibleCase(id, user) {
  const filter = user.role === "dentist" ? { _id: id, dentist: user._id } : { _id: id };
  return Case.findOne(filter);
}

filesRouter.post("/upload-url", async (req, res) => {
  try {
    const { caseId, fileName, contentType, size } = req.body;
    if (!caseId || !fileName) return res.status(400).json({ error: "caseId and fileName are required" });
    const dentalCase = await findAccessibleCase(caseId, req.user);
    if (!dentalCase) return res.status(404).json({ error: "Case not found" });

    const { key, uploadUrl } = await createUploadUrl({ caseNumber: dentalCase.caseNumber, fileName, contentType });
    const file = await LabFile.create({ case: dentalCase._id, uploadedBy: req.user._id, originalName: fileName, key, mimeType: contentType, size });
    dentalCase.files.push(file._id);
    await dentalCase.save();
    await logActivity({ actor: req.user._id, action: "file.upload_url_created", entityType: "LabFile", entityId: file._id });

    res.status(201).json({ file, uploadUrl });
  } catch (err) {
    console.error("[/api/files/upload-url error]", err);
    res.status(400).json({ error: err.message || "Upload failed" });
  }
});

filesRouter.post("/message-upload-url", async (req, res) => {
  const { fileName, contentType, size } = req.body;
  try {
    const { key, uploadUrl } = await createMessageUploadUrl({ fileName, contentType });
    const file = await LabFile.create({ uploadedBy: req.user._id, originalName: fileName, key, mimeType: contentType, size });
    await logActivity({ actor: req.user._id, action: "file.message_upload_url_created", entityType: "LabFile", entityId: file._id });
    res.status(201).json({ file, uploadUrl });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

filesRouter.get("/:id/download-url", async (req, res) => {
  const file = await LabFile.findById(req.params.id).populate("case");
  if (!file) return res.status(404).json({ error: "File not found" });
  // If file is tied to a case, enforce case ownership for dentists
  if (file.case && req.user.role === "dentist" && file.case.dentist.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: "Forbidden" });
  }
  // For message attachments without a case, any authenticated user can download
  // (both sender and recipient in chat need access)

  res.json({ downloadUrl: await createDownloadUrl(file.key) });
});

filesRouter.delete("/:id", async (req, res) => {
  const file = await LabFile.findById(req.params.id).populate("case");
  if (!file) return res.status(404).json({ error: "File not found" });
  if (file.case && req.user.role === "dentist" && file.case.dentist.toString() !== req.user._id.toString()) return res.status(403).json({ error: "Forbidden" });

  if (file.case) {
    await Case.updateOne({ _id: file.case._id }, { $pull: { files: file._id } });
  }
  await LabFile.findByIdAndDelete(file._id);
  await logActivity({ actor: req.user._id, action: "file.deleted", entityType: "LabFile", entityId: file._id });
  res.json({ ok: true });
});
