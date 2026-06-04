import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import path from "node:path";
import { connectDatabase, isConnected } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { casesRouter } from "./routes/cases.js";
import { clinicsRouter } from "./routes/clinics.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { filesRouter } from "./routes/files.js";
import { messagesRouter } from "./routes/messages.js";
import { usersRouter } from "./routes/users.js";
import { adminRouter } from "./routes/admin.js";
import { settingsRouter } from "./routes/settings.js";
import { mediaRouter } from "./routes/media.js";
import { analyticsRouter } from "./routes/analytics.js";
import { pagesRouter } from "./routes/pages.js";
import { postsRouter } from "./routes/posts.js";
import { backupsRouter } from "./routes/backups.js";
import { cmsRouter } from "./routes/cms.js";
import { contactRouter } from "./routes/contact.js";
import { emailTemplatesRouter } from "./routes/email-templates.js";
import { rolesRouter } from "./routes/roles.js";
import { pageviewMiddleware } from "./middleware/pageview.js";

async function seedTestimonials() {
  try {
    const { Testimonial } = await import("./models/index.js");
    const count = await Testimonial.countDocuments();
    if (count > 0) return;
    const defaults = [
      { name: "Dr. Andreas Petrou", title: "Prosthodontist", clinic: "Nicosia Dental Clinic, Cyprus", text: "Consistent precision across every zirconia case. Their digital workflow has cut my chairtime significantly.", rating: 5, photo: "", approved: true, order: 1 },
      { name: "Dr. Sarah Whitfield", title: "Principal Dentist", clinic: "Whitfield Dental, London UK", text: "Implant prosthetics fit beautifully. Clear communication and on-time delivery, every time.", rating: 5, photo: "", approved: true, order: 2 },
      { name: "Dr. Marios Constantinou", title: "Implantologist", clinic: "Limassol Smile Studio, Cyprus", text: "The case tracking portal is a game-changer. I always know exactly where my patient's case is.", rating: 5, photo: "", approved: true, order: 3 },
      { name: "Dr. James Mitchell", title: "General Dental Practitioner", clinic: "Mitchell & Partners, Manchester", text: "We've sent over 200 cases to Prime Smile. The fit accuracy is outstanding and the turnaround is reliable.", rating: 5, photo: "", approved: true, order: 4 },
      { name: "Dr. Elena Georgiou", title: "Orthodontist", clinic: "Georgiou Dental, Paphos, Cyprus", text: "Their clear aligner models and surgical guides are produced with incredible precision. Highly recommended.", rating: 5, photo: "", approved: true, order: 5 },
      { name: "Dr. William Chen", title: "Restorative Dentist", clinic: "Chen Dental Practice, Birmingham", text: "The e.max crowns from Prime Smile are some of the best I've seen. Shade matching is consistently excellent.", rating: 5, photo: "", approved: true, order: 6 },
      { name: "Dr. Catherine Bell", title: "Dental Surgeon", clinic: "Bell Dental Care, Glasgow", text: "Professional service with outstanding technical support. Their team understands digital dentistry inside out.", rating: 5, photo: "", approved: true, order: 7 },
      { name: "Dr. Michael Stavrou", title: "Periodontist", clinic: "Stavrou Dental, Larnaca, Cyprus", text: "Implant bars and custom abutments are delivered with excellent passive fit. Saves me hours of chair time.", rating: 5, photo: "", approved: true, order: 8 },
      { name: "Dr. Priya Sharma", title: "Cosmetic Dentist", clinic: "Sharma Aesthetics, Leeds", text: "My patients consistently comment on the aesthetics of the restorations. The team truly understands beauty.", rating: 5, photo: "", approved: true, order: 9 },
      { name: "Dr. Thomas Wright", title: "Dental Implantologist", clinic: "Wright Implants, Bristol", text: "SLM printed Co-Cr frameworks have excellent fit. Prime Smile's quality control is second to none.", rating: 5, photo: "", approved: true, order: 10 },
      { name: "Dr. Anna Philippou", title: "Prosthodontist", clinic: "Philippou Dental, Nicosia, Cyprus", text: "Full-arch zirconia cases are handled with exceptional care. The occlusion is always spot on.", rating: 5, photo: "", approved: true, order: 11 },
      { name: "Dr. Robert Foster", title: "Dental Surgeon", clinic: "Foster Dental, Liverpool", text: "Their emergency express service has saved me multiple times. Reliable partner for complex cases.", rating: 5, photo: "", approved: true, order: 12 },
      { name: "Dr. Sofia Markou", title: "General Dentist", clinic: "Markou Family Dental, Limassol", text: "The digital prescription process is seamless. Submitting a case takes under 2 minutes now.", rating: 5, photo: "", approved: true, order: 13 },
      { name: "Dr. Henry Blackwood", title: "Restorative Specialist", clinic: "Blackwood Dental, Edinburgh", text: "Every restoration comes with complete documentation and material certificates. Peace of mind guaranteed.", rating: 5, photo: "", approved: true, order: 14 },
      { name: "Dr. Natalia Ioannou", title: "Dental Surgeon", clinic: "Ioannou Dental, Famagusta, Cyprus", text: "Prime Smile has been our lab partner for 3 years. The consistency and quality never waver.", rating: 5, photo: "", approved: true, order: 15 },
    ];
    await Testimonial.insertMany(defaults);
    console.log(`[seed] Created ${defaults.length} default testimonials`);
  } catch (err) {
    console.error("[seed] Testimonials seeding failed:", err.message);
  }
}

export async function createApiApp() {
  await connectDatabase();
  await seedTestimonials();

  const app = express();
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true, credentials: true }));
  app.use(express.json({ limit: "10mb" }));
  app.use(cookieParser());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 500 }));
  app.use(pageviewMiddleware);

  app.get("/api/health", (req, res) => res.json({ ok: true, db: isConnected() ? "connected" : "disconnected" }));

  // Block all data API calls until DB is ready
  app.use("/api", (req, res, next) => {
    if (req.path === "/health") return next();
    if (!isConnected()) {
      return res.status(503).json({
        error: "Database unavailable",
        detail: "The server cannot reach MongoDB. Please ensure MongoDB is running or configure a valid MONGODB_URI in backend/.env",
      });
    }
    next();
  });

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/clinics", clinicsRouter);
  app.use("/api/cases", casesRouter);
  app.use("/api/messages", messagesRouter);
  app.use("/api/contact", contactRouter);
  app.use("/api/files", filesRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/admin/settings", settingsRouter);
  app.use("/api/admin/media", mediaRouter);
  app.use("/api/admin/analytics", analyticsRouter);
  app.use("/api/admin/pages", pagesRouter);
  app.use("/api/admin/posts", postsRouter);
  app.use("/api/admin/email-templates", emailTemplatesRouter);
  app.use("/api/admin/roles", rolesRouter);
  app.use("/api/admin/cms", cmsRouter);
  app.use("/api/admin/backups", backupsRouter);

  // Serve locally uploaded files (fallback when S3 is not configured)
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Public testimonials (only approved, no auth required)
  app.get("/api/testimonials", async (req, res) => {
    try {
      const { Testimonial } = await import("./models/index.js");
      const limit = Math.min(Number(req.query.limit || 15), 50);
      const items = await Testimonial.find({ approved: true }).sort({ order: 1, createdAt: -1 }).limit(limit);
      res.json({ items });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  });

  return app;
}
