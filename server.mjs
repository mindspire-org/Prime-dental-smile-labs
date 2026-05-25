import "dotenv/config";
import express from "express";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApiApp } from "./backend/app.js";
import { attachWebSocketServer } from "./backend/services/realtime.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 8080);
const CLIENT_DIR = path.join(__dirname, "dist", "client");

// ── Discover client assets at startup ──────────────────────────────────
async function discoverAssets() {
  const assetsDir = path.join(CLIENT_DIR, "assets");
  let jsEntry = "";
  const cssFiles = [];

  try {
    const files = await readdir(assetsDir);
    for (const f of files) {
      if (f.startsWith("index-") && f.endsWith(".js")) jsEntry = f;
      if (f.endsWith(".css")) cssFiles.push(f);
    }
  } catch {
    console.error("Could not read dist/client/assets — did you run `npm run build`?");
  }

  return { jsEntry, cssFiles };
}

const assets = await discoverAssets();

// ── Generate SPA shell HTML ────────────────────────────────────────────
function spaHtml() {
  const cssTags = assets.cssFiles
    .map((f) => `<link rel="stylesheet" href="/assets/${f}">`)
    .join("\n    ");
  const jsTag = assets.jsEntry
    ? `<script type="module" src="/assets/${assets.jsEntry}"></script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Prime Smile Dental Laboratory</title>
    ${cssTags}
  </head>
  <body>
    <div id="root"></div>
    ${jsTag}
  </body>
</html>`;
}

const SHELL = spaHtml();

// ── MIME map ───────────────────────────────────────────────────────────
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function safeJoin(base, reqPath) {
  const normalized = path.normalize(reqPath).replace(/^([/\\])+/, "");
  return path.join(base, normalized);
}

const app = await createApiApp();

app.use(async (req, res) => {
  try {
    const pathname = decodeURIComponent(req.path);
    const filePath = safeJoin(CLIENT_DIR, pathname);
    const fileStat = await stat(filePath).catch(() => null);

    if (fileStat?.isFile()) {
      const data = await readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME[ext] ?? "application/octet-stream";

      res.writeHead(200, {
        "content-type": contentType,
        "cache-control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
      });
      res.end(data);
      return;
    }
  } catch (err) {
    console.error(err);
  }

  res.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-cache",
  });
  res.end(SHELL);
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Client dir: ${CLIENT_DIR}`);
  console.log(`JS entry: ${assets.jsEntry || "(not found)"}`);
  console.log(`CSS files: ${assets.cssFiles.join(", ") || "(none)"}`);
});

attachWebSocketServer(server);
