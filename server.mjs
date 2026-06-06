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

// ── SPA shell HTML ─────────────────────────────────────────────────────
// TanStack Start is an SSR framework, not a plain SPA: its client entry
// (StartClient) needs the bootstrap markup the framework injects into the
// HTML. A hand-rolled empty <div id="root"> shell makes the client throw
// "Invariant failed". So we serve the real shell that `vite build`
// prerenders into dist/client/_shell.html (enabled via spa:{enabled:true}
// in vite.config.ts). That file already has the correct hashed asset tags.
const SHELL_FILE = path.join(CLIENT_DIR, "_shell.html");

// Legacy hand-rolled fallback — only used if the prerendered shell is
// missing (i.e. the build wasn't run with SPA mode). It will NOT hydrate
// a TanStack app correctly; it exists purely to surface a clear message.
function fallbackHtml() {
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
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    ${cssTags}
  </head>
  <body>
    <div id="root"></div>
    ${jsTag}
  </body>
</html>`;
}

async function loadShell() {
  try {
    let html = await readFile(SHELL_FILE, "utf8");
    // Inject favicon link if missing — stops browsers from auto-requesting /favicon.ico
    if (!html.includes('rel="icon"') && !html.includes("rel='icon'")) {
      html = html.replace(
        /<head[^>]*>/i,
        (match) => `${match}\n    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />`
      );
    }
    console.log(`Serving prerendered shell: ${SHELL_FILE}`);
    return html;
  } catch {
    console.error(
      `WARNING: ${SHELL_FILE} not found. Build with SPA mode (spa:{enabled:true}) ` +
        `and re-run \`npm run build\`. Falling back to a non-hydrating shell.`,
    );
    return fallbackHtml();
  }
}

const SHELL = await loadShell();

// ── Startup sanity checks ──────────────────────────────────────────────
let missingAssets = [];
try {
  const clientStat = await stat(CLIENT_DIR);
  if (!clientStat.isDirectory()) {
    console.error(`CRITICAL: ${CLIENT_DIR} exists but is not a directory.`);
  } else {
    const assetDir = path.join(CLIENT_DIR, "assets");
    const assetStat = await stat(assetDir).catch(() => null);
    if (!assetStat?.isDirectory()) {
      console.error(`CRITICAL: ${assetDir} not found. Run \`npm run build\` before starting the server.`);
    }

    // Validate that every asset referenced by _shell.html actually exists.
    // Hash mismatches happen when the build is updated but the server wasn't restarted.
    const hrefSrcRe = /(?:href|src)="\/([^"]+)"/g;
    let m;
    while ((m = hrefSrcRe.exec(SHELL)) !== null) {
      const relPath = m[1];
      const fullPath = path.join(CLIENT_DIR, relPath);
      const exists = await stat(fullPath).then(s => s.isFile()).catch(() => false);
      if (!exists) missingAssets.push(relPath);
    }

    if (missingAssets.length > 0) {
      console.error("=".repeat(70));
      console.error("CRITICAL: The prerendered HTML shell references assets that do NOT exist.");
      console.error("This causes 502 Bad Gateway because the browser requests .js/.css files");
      console.error("that the server cannot find.");
      console.error("");
      console.error("Missing files:");
      missingAssets.forEach(f => console.error(`  - ${f}`));
      console.error("");
      console.error("Fix: run `npm run build` on this machine, then restart the server.");
      console.error("=".repeat(70));
    }
  }
} catch {
  console.error(`CRITICAL: ${CLIENT_DIR} does not exist. Run \`npm run build\` before starting the server.`);
}

const app = await createApiApp();

// ── Static file serving ────────────────────────────────────────────────
// Use express.static for reliability. Files that exist are served with
// correct MIME types and caching headers. Missing files fall through.
app.use(express.static(CLIENT_DIR, {
  maxAge: "1y",
  immutable: true,
  index: false,
  dotfiles: "ignore",
  setHeaders: (res, filepath) => {
    const ext = path.extname(filepath).toLowerCase();
    if (ext === ".html") {
      res.setHeader("cache-control", "no-cache");
    }
  },
}));

// Serve /favicon.ico from the SVG asset so browsers don't hit the SPA catch-all
app.get("/favicon.ico", async (req, res) => {
  const svgPath = path.join(CLIENT_DIR, "favicon.svg");
  try {
    const data = await readFile(svgPath);
    res.setHeader("content-type", "image/svg+xml");
    res.setHeader("cache-control", "public, max-age=86400");
    res.status(200).end(data);
  } catch {
    res.status(404).end();
  }
});

// Serve uploaded files directly from disk (local storage fallback when S3 is not configured)
// This MUST be before the SPA catch-all so binary files don't get served as HTML.
const UPLOADS_DIR = path.join(__dirname, "uploads");
app.use("/uploads", express.static(UPLOADS_DIR, {
  maxAge: "1d",
  index: false,
  dotfiles: "ignore",
  setHeaders: (res, filepath) => {
    const filename = path.basename(filepath);
    res.setHeader("content-disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
  },
}));

// ── SPA catch-all ────────────────────────────────────────────────────────
// Only serve the prerendered shell for page routes (no file extension).
// Requests for missing .js / .css / .png etc. get 404 instead of HTML,
// which prevents reverse proxies (nginx, Cloudflare) from returning 502.
const STATIC_EXT_RE = /\.(js|mjs|css|json|svg|png|jpg|jpeg|webp|ico|woff|woff2|ttf|map|zip|rar|stl|ply|obj|dcm|dicom|pdf)$/i;

app.use(async (req, res) => {
  const pathname = decodeURIComponent(req.path);

  // If it looks like a static file request but wasn't found by express.static,
  // return 404 so the browser/proxy gets a clean error instead of HTML.
  if (STATIC_EXT_RE.test(pathname)) {
    res.status(404).end();
    return;
  }

  // ALWAYS re-read the shell from disk. Reading a ~6KB file is essentially
  // free compared to network I/O, and this completely eliminates the
  // stale-shell problem where the cached SHELL references old asset hashes.
  let shellHtml;
  try {
    shellHtml = await readFile(SHELL_FILE, "utf8");
  } catch {
    shellHtml = fallbackHtml();
  }

  res.status(200).set({
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-cache",
  }).end(shellHtml);
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Client dir: ${CLIENT_DIR}`);
  console.log(`JS entry: ${assets.jsEntry || "(not found)"}`);
  console.log(`CSS files: ${assets.cssFiles.join(", ") || "(none)"}`);
});

attachWebSocketServer(server);
