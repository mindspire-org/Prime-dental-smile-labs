import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./db.js";
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
import { cmsRouter } from "./routes/cms.js";
import { contactRouter } from "./routes/contact.js";
import { emailTemplatesRouter } from "./routes/email-templates.js";
import { rolesRouter } from "./routes/roles.js";
import { pageviewMiddleware } from "./middleware/pageview.js";

export async function createApiApp() {
  await connectDatabase();

  const app = express();
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true, credentials: true }));
  app.use(express.json({ limit: "10mb" }));
  app.use(cookieParser());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 500 }));
  app.use(pageviewMiddleware);

  app.get("/api/health", (req, res) => res.json({ ok: true }));
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

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  });

  return app;
}
