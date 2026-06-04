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

const DEFAULT_PAGE_BLOCKS = {
  contact: [
    { id: "c-hero", type: "hero", order: 0, props: { eyebrow: "Get in Touch", heading: "Contact Prime Smile Dental Lab", highlight: "", subheading: "Reach out for case submissions, partnerships or general enquiries. We respond within one business day.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", image: "", align: "center" } },
    { id: "c-info", type: "text", order: 1, props: { content: "Email: info@primesmile.co.uk\nPhone: +44 20 0000 0000\nAddress: London, UK", align: "left", size: "base", textColor: "#374151", backgroundColor: "#ffffff", padding: "medium" } },
    { id: "c-cta", type: "cta", order: 2, props: { heading: "Ready to partner with us?", text: "Create a dentist account and start submitting cases through our digital workflow.", buttonText: "Create Account", buttonLink: "/portal", bgColor: "#0aabbd", textAlign: "center" } },
  ],
  "fixed-restorations": [
    { id: "fr-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Fixed Restorations", highlight: "", subheading: "Crowns, bridges, veneers, inlays and onlays in zirconia and lithium disilicate — crafted with digital precision.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
    { id: "fr-text", type: "image-text", order: 1, props: { heading: "Precision Fit & Aesthetics", text: "Every fixed restoration is designed in CAD software, milled on 5-axis equipment and finished under magnification. We validate marginal fit before dispatch.", image: "", imageLeft: true, cta: "Learn More", ctaLink: "/workflow", backgroundColor: "#ffffff", padding: "large" } },
    { id: "fr-cta", type: "cta", order: 2, props: { heading: "Request a consultation", text: "Not sure which material suits your case? Our technicians can advise.", buttonText: "Contact Us", buttonLink: "/contact", bgColor: "#0aabbd", textAlign: "center" } },
  ],
  "implant-prosthetics": [
    { id: "ip-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Implant Prosthetics", highlight: "", subheading: "Custom abutments, screw-retained crowns, bars and full-arch restorations with validated implant workflows.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
    { id: "ip-text", type: "image-text", order: 1, props: { heading: "Integrated Digital Workflow", text: "We accept implant scans, design abutments in CAD and validate connections on model before production. Every case is tracked from scan to dispatch.", image: "", imageLeft: true, cta: "Our Workflow", ctaLink: "/workflow", backgroundColor: "#ffffff", padding: "large" } },
    { id: "ip-cta", type: "cta", order: 2, props: { heading: "Have an implant case?", text: "Send us your scan and prescription for a free feasibility review.", buttonText: "Get Started", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
  ],
  "removable-prosthetics": [
    { id: "rp-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Removable Prosthetics", highlight: "", subheading: "Full and partial dentures with digital design and high-precision fit for optimal comfort and function.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
    { id: "rp-text", type: "image-text", order: 1, props: { heading: "Digital Denture Design", text: "Our removable prosthetics are designed digitally from validated scans, ensuring consistent base fit and tooth arrangement. Every denture goes through a trial stage when required.", image: "", imageLeft: true, cta: "Learn More", ctaLink: "/workflow", backgroundColor: "#ffffff", padding: "large" } },
    { id: "rp-cta", type: "cta", order: 2, props: { heading: "Need a denture quote?", text: "Upload your scan and we will assess the case at no charge.", buttonText: "Submit Case", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
  ],
  "metal-frameworks": [
    { id: "mf-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Metal Frameworks", highlight: "", subheading: "Cobalt-chrome frameworks via SLM metal printing for unmatched accuracy, strength and passive fit.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
    { id: "mf-text", type: "image-text", order: 1, props: { heading: "SLM Metal Printing", text: "Our VENEA SLM printer produces cobalt-chrome frameworks with layer accuracy down to 30 microns. Every framework is inspected for distortion and fit before ceramic application.", image: "", imageLeft: true, cta: "Learn More", ctaLink: "/technology", backgroundColor: "#ffffff", padding: "large" } },
    { id: "mf-cta", type: "cta", order: 2, props: { heading: "Need a metal framework?", text: "Upload your scan and prescription for a free assessment.", buttonText: "Submit Case", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
  ],
  "splints-guards": [
    { id: "sg-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Splints & Guards", highlight: "", subheading: "Night guards, bruxism splints and surgical guides from validated digital workflows.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
    { id: "sg-text", type: "image-text", order: 1, props: { heading: "Validated Guard Production", text: "Splints are designed from intraoral scans with calibrated bite data, then 3D printed or milled depending on material selection. Thickness and occlusion are checked on articulator.", image: "", imageLeft: true, cta: "Learn More", ctaLink: "/workflow", backgroundColor: "#ffffff", padding: "large" } },
    { id: "sg-cta", type: "cta", order: 2, props: { heading: "Order a splint or guard?", text: "Send us your scan and we will confirm material options and turnaround.", buttonText: "Submit Case", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
  ],
  "digital-design": [
    { id: "dd-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Digital Design Support", highlight: "", subheading: "STL design, smile design and treatment planning collaboration for complex cases.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
    { id: "dd-text", type: "image-text", order: 1, props: { heading: "Collaborative Design", text: "Our technicians work directly with your scan data to produce validated designs before production. We support smile design, full-arch planning and implant restorative design.", image: "", imageLeft: true, cta: "Learn More", ctaLink: "/workflow", backgroundColor: "#ffffff", padding: "large" } },
    { id: "dd-cta", type: "cta", order: 2, props: { heading: "Need design support?", text: "Upload your case and our team will review and advise on the best approach.", buttonText: "Get Started", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
  ],
};

// Public read routes
pagesRouter.get("/", async (req, res) => {
  const saved = await Page.find().select("slug title published updatedAt blocks").sort({ slug: 1 });
  const savedMap = Object.fromEntries(saved.map(p => [p.slug, p]));
  const pages = EDITABLE_PAGES.map(p => {
    if (savedMap[p.slug]) return savedMap[p.slug].toObject();
    return { ...p, blocks: DEFAULT_PAGE_BLOCKS[p.slug] || [], published: true };
  });
  res.json({ pages });
});

pagesRouter.get("/:slug", async (req, res) => {
  let page = await Page.findOne({ slug: req.params.slug });
  if (!page) {
    const meta = EDITABLE_PAGES.find(p => p.slug === req.params.slug);
    if (!meta) return res.status(404).json({ error: "Page not found" });
    page = { slug: meta.slug, title: meta.title, blocks: DEFAULT_PAGE_BLOCKS[req.params.slug] || [], published: true };
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
