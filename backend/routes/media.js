import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { Media } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const mediaRouter = express.Router();
mediaRouter.use(requireAuth, requireRole("admin"));

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only images and PDFs allowed"));
  },
});

mediaRouter.get("/", async (req, res) => {
  const page  = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Number(req.query.limit || 40), 100);
  const filter = {};
  if (req.query.search) filter.originalName = new RegExp(req.query.search, "i");
  if (req.query.type === "image") filter.mimeType = /^image\//;

  const [items, total] = await Promise.all([
    Media.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("uploadedBy", "name"),
    Media.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

mediaRouter.post("/", upload.array("files", 20), async (req, res) => {
  const files = req.files;
  if (!files?.length) return res.status(400).json({ error: "No files" });

  const saved = await Promise.all(files.map(f =>
    Media.create({
      filename: f.filename,
      originalName: f.originalname,
      url: `/uploads/${f.filename}`,
      mimeType: f.mimetype,
      size: f.size,
      uploadedBy: req.user._id,
    })
  ));
  res.status(201).json({ items: saved });
});

mediaRouter.patch("/:id", async (req, res) => {
  const media = await Media.findByIdAndUpdate(req.params.id, { alt: req.body.alt }, { returnDocument: "after" });
  if (!media) return res.status(404).json({ error: "Not found" });
  res.json({ media });
});

mediaRouter.delete("/:id", requireRole("admin"), async (req, res) => {
  const media = await Media.findByIdAndDelete(req.params.id);
  if (!media) return res.status(404).json({ error: "Not found" });
  const filePath = path.join(UPLOAD_DIR, media.filename);
  fs.unlink(filePath, () => {});
  res.json({ ok: true });
});
