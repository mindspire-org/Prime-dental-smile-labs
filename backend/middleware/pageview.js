import { PageView } from "../models/index.js";
import crypto from "node:crypto";

const SKIP = ["/api", "/_", "/uploads", "/favicon", ".js", ".css", ".map", ".ico", ".png", ".jpg", ".svg", ".woff"];

export function pageviewMiddleware(req, res, next) {
  next();
  if (res.headersSent) return;
  if (req.method !== "GET") return;
  if (SKIP.some(s => req.path.startsWith(s) || req.path.endsWith(s))) return;

  let sessionId = req.cookies?.psSession;
  if (!sessionId) {
    sessionId = crypto.randomBytes(12).toString("hex");
    res.cookie("psSession", sessionId, { maxAge: 30 * 60 * 1000, httpOnly: true, sameSite: "lax" });
  }

  PageView.create({
    path: req.path,
    referrer: req.headers.referer || "",
    sessionId,
    userAgent: req.headers["user-agent"] || "",
    ip: req.ip,
  }).catch(() => {});
}
