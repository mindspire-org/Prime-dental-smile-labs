import express from "express";
import { Case, LabFile } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";
import { createDownloadUrl, createUploadUrl } from "../services/storage.js";
import { logActivity } from "../services/activity.js";

export const filesRouter = express.Router();

filesRouter.use(requireAuth);

async function findAccessibleCase(id, user) {
  const filter = user.role === "dentist" ? { _id: id, dentist: user._id } : { _id: id };
  return Case.findOne(filter);
}

filesRouter.post("/upload-url", async (req, res) => {
  const { caseId, fileName, contentType, size } = req.body;
  const dentalCase = await findAccessibleCase(caseId, req.user);
  if (!dentalCase) return res.status(404).json({ error: "Case not found" });

  const { key, uploadUrl } = await createUploadUrl({ caseNumber: dentalCase.caseNumber, fileName, contentType });
  const file = await LabFile.create({ case: dentalCase._id, uploadedBy: req.user._id, originalName: fileName, key, mimeType: contentType, size });
  dentalCase.files.push(file._id);
  await dentalCase.save();
  await logActivity({ actor: req.user._id, action: "file.upload_url_created", entityType: "LabFile", entityId: file._id });

  res.status(201).json({ file, uploadUrl });
});

filesRouter.get("/:id/download-url", async (req, res) => {
  const file = await LabFile.findById(req.params.id).populate("case");
  if (!file) return res.status(404).json({ error: "File not found" });
  if (req.user.role === "dentist" && file.case.dentist.toString() !== req.user._id.toString()) return res.status(403).json({ error: "Forbidden" });

  res.json({ downloadUrl: await createDownloadUrl(file.key) });
});

filesRouter.delete("/:id", async (req, res) => {
  const file = await LabFile.findById(req.params.id).populate("case");
  if (!file) return res.status(404).json({ error: "File not found" });
  if (req.user.role === "dentist" && file.case.dentist.toString() !== req.user._id.toString()) return res.status(403).json({ error: "Forbidden" });

  await Case.updateOne({ _id: file.case._id }, { $pull: { files: file._id } });
  await LabFile.findByIdAndDelete(file._id);
  await logActivity({ actor: req.user._id, action: "file.deleted", entityType: "LabFile", entityId: file._id });
  res.json({ ok: true });
});
