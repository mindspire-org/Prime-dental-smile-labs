import express from "express";
import { Post } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { logActivity } from "../services/activity.js";

export const postsRouter = express.Router();
postsRouter.use(requireAuth, requireRole("admin"));

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

postsRouter.get("/", async (req, res) => {
  const page  = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Number(req.query.limit || 20), 100);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) filter.$or = [
    { title: new RegExp(req.query.search, "i") },
    { excerpt: new RegExp(req.query.search, "i") },
  ];
  const [items, total] = await Promise.all([
    Post.find(filter).populate("author", "name").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Post.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

postsRouter.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author", "name email");
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json({ post });
});

postsRouter.post("/", async (req, res) => {
  const { title, blocks, excerpt, featuredImage, status, tags, category, seo } = req.body;
  const slug = slugify(title) + "-" + Date.now().toString(36);
  const post = await Post.create({ title, slug, blocks: blocks || [], excerpt, featuredImage, status: status || "draft", tags, category, seo, author: req.user._id });
  await logActivity({ actor: req.user._id, action: "post.created", entityType: "Post", entityId: post._id });
  res.status(201).json({ post });
});

postsRouter.patch("/:id", async (req, res) => {
  const allowed = ["title","blocks","excerpt","featuredImage","status","publishedAt","tags","category","seo"];
  const update = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  if (update.status === "published" && !update.publishedAt) update.publishedAt = new Date();
  const post = await Post.findByIdAndUpdate(req.params.id, update, { returnDocument: "after" }).populate("author", "name");
  if (!post) return res.status(404).json({ error: "Not found" });
  await logActivity({ actor: req.user._id, action: "post.updated", entityType: "Post", entityId: post._id });
  res.json({ post });
});

postsRouter.delete("/:id", requireRole("admin"), async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});
