import express from "express";
import { Page } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { logActivity } from "../services/activity.js";
import crypto from "node:crypto";

export const pagesRouter = express.Router();

const EDITABLE_PAGES = [
  { slug: "home",                     title: "Home Page" },
  { slug: "about",                    title: "About Us" },
  { slug: "services",                 title: "Services" },
  { slug: "quality",                  title: "Quality" },
  { slug: "technology",               title: "Technology" },
  { slug: "workflow",                 title: "Workflow" },
  { slug: "contact",                  title: "Contact" },
  { slug: "fixed-restorations",       title: "Service — Fixed Restorations" },
  { slug: "implant-prosthetics",      title: "Service — Implant Prosthetics" },
  { slug: "removable-prosthetics",    title: "Service — Removable Prosthetics" },
  { slug: "metal-frameworks",         title: "Service — Metal Frameworks" },
  { slug: "splints-guards",           title: "Service — Splints & Guards" },
  { slug: "digital-design",           title: "Service — Digital Design Support" },
];

// Public read routes
pagesRouter.get("/", async (req, res) => {
  const saved = await Page.find().select("slug title published updatedAt").sort({ slug: 1 });
  const savedMap = Object.fromEntries(saved.map(p => [p.slug, p]));
  const pages = EDITABLE_PAGES.map(p => savedMap[p.slug] ? savedMap[p.slug].toObject() : { ...p, blocks: [], published: true });
  res.json({ pages });
});

pagesRouter.get("/:slug", async (req, res) => {
  let page = await Page.findOne({ slug: req.params.slug });
  if (!page) {
    const meta = EDITABLE_PAGES.find(p => p.slug === req.params.slug);
    if (!meta) return res.status(404).json({ error: "Page not found" });
    page = { slug: meta.slug, title: meta.title, blocks: [], published: true };
  }
  res.json({ page });
});

pagesRouter.use(requireAuth, requireRole("admin"));

pagesRouter.put("/:slug", requireRole("admin"), async (req, res) => {
  const { blocks, title, published } = req.body;
  const page = await Page.findOneAndUpdate(
    { slug: req.params.slug },
    { blocks, title, published, updatedBy: req.user._id },
    { upsert: true, returnDocument: "after" },
  );
  await logActivity({ actor: req.user._id, action: "page.updated", entityType: "Page", entityId: page._id, metadata: { slug: req.params.slug } });
  res.json({ page });
});

pagesRouter.post("/:slug/blocks", requireRole("admin"), async (req, res) => {
  const { type, props, order } = req.body;
  const newBlock = { id: crypto.randomUUID(), type, props: props || {}, order: order ?? 9999 };
  const page = await Page.findOneAndUpdate(
    { slug: req.params.slug },
    { $push: { blocks: newBlock } },
    { upsert: true, returnDocument: "after" },
  );
  res.json({ block: newBlock, page });
});

pagesRouter.patch("/:slug/blocks/:blockId", requireRole("admin"), async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug });
  if (!page) return res.status(404).json({ error: "Page not found" });
  const block = page.blocks.find(b => b.id === req.params.blockId);
  if (!block) return res.status(404).json({ error: "Block not found" });
  Object.assign(block.props, req.body.props || {});
  if (req.body.order !== undefined) block.order = req.body.order;
  await page.save();
  res.json({ block });
});

pagesRouter.delete("/:slug/blocks/:blockId", requireRole("admin"), async (req, res) => {
  const page = await Page.findOneAndUpdate(
    { slug: req.params.slug },
    { $pull: { blocks: { id: req.params.blockId } } },
    { returnDocument: "after" },
  );
  res.json({ page });
});
