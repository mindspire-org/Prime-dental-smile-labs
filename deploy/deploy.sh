#!/usr/bin/env bash
#
# Prime Smile Labs — build & (re)deploy the single-process Node app.
# Run from the project root on the server:  bash deploy/deploy.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
echo "==> Project root: $ROOT"

# ── 1. Sanity: .env must exist at the root ───────────────────────────
if [[ ! -f .env ]]; then
  echo "!! No .env at project root. Copy deploy/.env.example -> .env and fill it in." >&2
  exit 1
fi

# ── 2. Install dependencies (root + backend are separate packages) ───
echo "==> Installing root dependencies"
npm ci || npm install
echo "==> Installing backend dependencies"
npm --prefix backend ci || npm --prefix backend install

# ── 3. Build the client (also emits unused dist/server worker) ───────
echo "==> Building client (vite build)"
npm run build

# ── 4. PERMANENT uploads fix ─────────────────────────────────────────
# media.js/storage.js/app.js all use process.cwd()/uploads. In production
# cwd is the project root, so symlink it to the real backend/uploads dir
# where existing files live. Idempotent.
mkdir -p backend/uploads
if [[ -L uploads ]]; then
  echo "==> uploads symlink already present"
elif [[ -e uploads ]]; then
  echo "!! 'uploads' exists at root and is NOT a symlink. Move/merge it into backend/uploads, then re-run." >&2
  exit 1
else
  ln -s backend/uploads uploads
  echo "==> Created symlink: uploads -> backend/uploads"
fi

# ── 5. Restart the service if it's installed ─────────────────────────
if systemctl list-unit-files 2>/dev/null | grep -q '^primesmile\.service'; then
  echo "==> Restarting primesmile.service"
  sudo systemctl restart primesmile
  sleep 1
  sudo systemctl --no-pager --lines=10 status primesmile || true
else
  echo "==> primesmile.service not installed yet. See deploy/README.md step 2."
fi

echo "==> Done."
