import "dotenv/config";
import express from "express";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApiApp } from "./backend/app.js";
import { attachWebSocketServer } from "./backend/services/realtime.js";
import { startScheduler } from "./backend/services/scheduler.js";

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
    <style>body{background:#0d1e2c;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;color:rgba(255,255,255,0.5);font-family:system-ui,sans-serif;}</style>
  </head>
  <body>
    <div id="root">Loading…</div>
    ${jsTag}
  </body>
</html>`;
}

// ── Inject loading screen to prevent white blank flash while JS hydrates ──
const LOADER_STYLE = `
<style id="shell-loader-style">
  body { background: #0d1e2c; margin: 0; }
  #shell-loader {
    position: fixed; inset: 0; z-index: 9999;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: radial-gradient(ellipse at 50% 0%, #163549 0%, #0d1e2c 60%);
    transition: opacity 0.5s cubic-bezier(.4,0,.2,1);
  }
  #shell-loader .logo-wrap {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 32px;
    animation: shell-fade-in 0.6s ease-out both;
  }
  #shell-loader .logo-wrap svg {
    width: 36px; height: 36px;
    filter: drop-shadow(0 0 8px rgba(10,171,189,0.35));
  }
  #shell-loader .logo-wrap .brand {
    color: #ffffff; font-family: 'Poppins', system-ui, sans-serif;
    font-size: 20px; font-weight: 600; letter-spacing: -0.02em;
  }
  #shell-loader .logo-wrap .brand span {
    color: #0aabbd; font-weight: 500;
  }
  #shell-loader .shimmer-track {
    width: 160px; height: 3px;
    background: rgba(255,255,255,0.06);
    border-radius: 3px;
    overflow: hidden;
    position: relative;
    animation: shell-fade-in 0.6s ease-out 0.15s both;
  }
  #shell-loader .shimmer-track::after {
    content: '';
    position: absolute; top: 0; left: -60%;
    width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(10,171,189,0.7), transparent);
    animation: shell-shimmer 1.4s ease-in-out infinite;
    border-radius: 3px;
  }
  #shell-loader .tagline {
    color: rgba(255,255,255,0.35);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
    margin-top: 18px;
    animation: shell-fade-in 0.6s ease-out 0.3s both;
  }
  @keyframes shell-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shell-shimmer { 0% { left: -60%; } 100% { left: 120%; } }
  body.shell-hydrated #shell-loader { opacity: 0; pointer-events: none; }
</style>`;
const LOADER_HTML = `
<div id="shell-loader">
  <div class="logo-wrap">
    <svg viewBox="0 0 260 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="t1" cx="35%" cy="20%" r="70%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="55%" stop-color="#c8eef7"/>
          <stop offset="100%" stop-color="#7dd3e8"/>
        </radialGradient>
        <filter id="shw" x="0" y="0" width="260" height="320" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#000000" flood-opacity="0.1"/>
        </filter>
      </defs>
      <g filter="url(#shw)">
        <rect x="28" y="148" width="52" height="92" rx="10" fill="url(#t1)" stroke="#7dd3e8" stroke-width="1.5"/>
        <rect x="28" y="148" width="15" height="92" rx="10" fill="white" opacity="0.3"/>
        <rect x="35" y="162" width="38" height="6" rx="3" fill="#9ecfdb" opacity="0.5"/>
      </g>
      <g filter="url(#shw)">
        <rect x="180" y="148" width="52" height="92" rx="10" fill="url(#t1)" stroke="#7dd3e8" stroke-width="1.5"/>
        <rect x="180" y="148" width="15" height="92" rx="10" fill="white" opacity="0.3"/>
        <rect x="187" y="162" width="38" height="6" rx="3" fill="#9ecfdb" opacity="0.5"/>
      </g>
      <g filter="url(#shw)">
        <rect x="82" y="124" width="46" height="112" rx="11" fill="url(#t1)" stroke="#9ecfdb" stroke-width="1.5"/>
        <rect x="82" y="124" width="14" height="112" rx="11" fill="white" opacity="0.38"/>
        <rect x="89" y="138" width="32" height="7" rx="3.5" fill="white" opacity="0.55"/>
      </g>
      <g filter="url(#shw)">
        <rect x="132" y="124" width="46" height="112" rx="11" fill="url(#t1)" stroke="#9ecfdb" stroke-width="1.5"/>
        <rect x="132" y="124" width="14" height="112" rx="11" fill="white" opacity="0.38"/>
        <rect x="139" y="138" width="32" height="7" rx="3.5" fill="white" opacity="0.55"/>
      </g>
      <g filter="url(#shw)">
        <rect x="104" y="108" width="52" height="128" rx="13" fill="url(#t1)" stroke="#7dd3e8" stroke-width="2"/>
        <rect x="104" y="108" width="16" height="128" rx="13" fill="white" opacity="0.42"/>
        <rect x="112" y="124" width="36" height="9" rx="4.5" fill="white" opacity="0.6"/>
        <rect x="112" y="140" width="24" height="6" rx="3" fill="white" opacity="0.35"/>
      </g>
      <circle cx="100" cy="110" r="2" fill="white" opacity="0.8"/>
      <circle cx="150" cy="115" r="1.5" fill="white" opacity="0.7"/>
      <circle cx="120" cy="105" r="1" fill="white" opacity="0.6"/>
    </svg>
    <div class="brand">Prime <span>Smile</span></div>
  </div>
  <div class="shimmer-track"></div>
  <div class="tagline">Advanced Digital Dentistry</div>
</div>`;
const LOADER_SCRIPT = `
<script>(function(){function h(){document.body.classList.add('shell-hydrated');setTimeout(function(){var el=document.getElementById('shell-loader');if(el)el.remove();var st=document.getElementById('shell-loader-style');if(st)st.remove();},500);}if(document.readyState==='complete')h();else window.addEventListener('load',h);})();</script>`;

function injectLoader(html) {
  // Inject style before </head>
  html = html.replace(/<\/head>/i, `${LOADER_STYLE.trim()}\n  </head>`);
  // Inject loader div right after <body>
  html = html.replace(/<body[^>]*>/i, (match) => `${match}\n    ${LOADER_HTML.trim()}`);
  // Inject hide script before </body>
  html = html.replace(/<\/body>/i, `\n    ${LOADER_SCRIPT.trim()}\n  </body>`);
  return html;
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
    html = injectLoader(html);

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

// Serve /favicon.ico from the brand logo so browsers don't hit the SPA catch-all
app.get("/favicon.ico", async (req, res) => {
  const logoPath = path.join(CLIENT_DIR, "primesmile-logo.png");
  try {
    const data = await readFile(logoPath);
    res.setHeader("content-type", "image/png");
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
    shellHtml = injectLoader(shellHtml);
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
  startScheduler();
});

attachWebSocketServer(server);
