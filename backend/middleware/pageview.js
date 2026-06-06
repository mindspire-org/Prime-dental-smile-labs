import { PageView } from "../models/index.js";
import crypto from "node:crypto";

const SKIP = ["/api", "/_", "/uploads", "/favicon", ".js", ".css", ".map", ".ico", ".png", ".jpg", ".svg", ".woff", ".webp", ".ttf", ".woff2"];

// Known bot / crawler user-agent substrings to filter out
const BOT_PATTERNS = [
  "bot", "crawler", "spider", "scraper", "archiver", "slurp",
  "googlebot", "bingbot", "yandexbot", "baiduspider", "duckduckbot",
  "facebookexternalhit", "twitterbot", "linkedinbot", "whatsapp",
  "headless", "phantomjs", "puppeteer", "selenium", "wget", "curl",
  "python-requests", "java", "ruby", "node-fetch", "axios",
  "monitoring", "pingdom", "uptimerobot", "statuscake", "gtmetrix",
  "ahrefsbot", "semrushbot", "mj12bot", "dotbot", "rogerbot",
];

function isBot(userAgent = "") {
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some(p => ua.includes(p));
}

function shouldSkip(path, method) {
  if (method !== "GET") return true;
  return SKIP.some(s => path.startsWith(s) || path.endsWith(s));
}

export function pageviewMiddleware(req, res, next) {
  if (shouldSkip(req.path, req.method)) return next();

  const ua = req.headers["user-agent"] || "";
  if (isBot(ua)) return next();

  // Ensure a session id and set the cookie BEFORE the response is sent.
  // (Setting it inside the "finish" handler throws ERR_HTTP_HEADERS_SENT —
  // headers are already flushed by then — which crashed the process.)
  let sessionId = req.cookies?.psSession;
  if (!sessionId) {
    sessionId = crypto.randomBytes(12).toString("hex");
    res.cookie("psSession", sessionId, {
      maxAge: 30 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  // Record the pageview after the response finishes — DB write only,
  // no header mutations here.
  res.on("finish", () => {
    // Only track successful responses (2xx / 3xx)
    if (res.statusCode >= 400) return;

    PageView.create({
      path: req.path,
      referrer: req.headers.referer || "",
      sessionId,
      userAgent: ua,
      ip: req.ip || req.headers["x-forwarded-for"]?.split(",")?.[0]?.trim() || "",
    }).catch(() => {});
  });

  next();
}
