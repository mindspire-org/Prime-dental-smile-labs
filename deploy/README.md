# Deploying Prime Smile Labs (permanent setup)

This app runs as **one Node process** (`server.mjs`) that serves the SPA
client, the Express API (`/api`), static uploads (`/uploads`) and the
WebSocket endpoint (`/ws`) — all on **port 8080**. nginx sits in front for
TLS. The build's `dist/server/` (TanStack Node server) is only used at
**build time** to prerender the SPA shell — it is **not run** at runtime.

> Why not the Cloudflare/TanStack SSR worker? The backend uses MongoDB
> (mongoose), disk uploads (multer) and `ws` WebSockets — none of which run
> on Cloudflare Workers. So `vite.config.ts` sets `cloudflare: false` and
> enables `spa: { enabled: true }`. Self-hosting the single Express process
> is the correct, simplest model here. Trade-off: pages render client-side
> (no per-route SSR); the prerendered shell carries homepage SEO meta.

> **SPA shell (important):** the build prerenders `dist/client/_shell.html`
> containing TanStack's bootstrap (`$_TSR.router` manifest + entry script).
> `server.mjs` serves that file for all routes. Without it, the client
> throws `Invariant failed`. This is why the build MUST run with SPA mode
> (already configured) — never hand-edit `dist/`.

---

## One-time setup

### 1. Code + env
```bash
cd /var/www/Prime-dental-smile-labs
git pull                                   # get this deploy/ folder
cp deploy/.env.example .env                # then EDIT .env with real values
# generate secrets:  openssl rand -hex 48
```

### 2. Install the systemd service
```bash
sudo cp deploy/primesmile.service /etc/systemd/system/primesmile.service
# Adjust User=/Group= in the unit if you don't use www-data.
sudo chown -R www-data:www-data /var/www/Prime-dental-smile-labs
sudo systemctl daemon-reload
sudo systemctl enable primesmile
```

### 3. Build + first start
```bash
bash deploy/deploy.sh        # installs deps, builds, creates uploads symlink
sudo systemctl start primesmile
journalctl -u primesmile -f  # watch logs; expect "Server listening on port 8080"
```

### 4. nginx + TLS
```bash
sudo cp deploy/nginx-primesmile.conf /etc/nginx/sites-available/primesmile
# edit server_name to your domain
sudo ln -s /etc/nginx/sites-available/primesmile /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d primesmile.example.com   # HTTPS
```

### 5. (Optional) seed the database
```bash
npm run seed
```

---

## Every redeploy after that
```bash
cd /var/www/Prime-dental-smile-labs
git pull
bash deploy/deploy.sh        # rebuilds + restarts automatically
```

---

## The uploads gotcha (already fixed by deploy.sh)
`media.js`, `services/storage.js` and `app.js` resolve uploads against
`process.cwd()/uploads`. In dev, cwd is `backend/`; in production cwd is the
project root. Without intervention, prod would read/write an **empty
`<root>/uploads`** and existing files in `backend/uploads` would 404.
`deploy.sh` creates a symlink `uploads -> backend/uploads` so the write path
and serve path always match. Don't delete that symlink.

---

## Troubleshooting
| Symptom | Check |
|---|---|
| 502 from nginx | `systemctl status primesmile`; is it listening on 8080? |
| Blank page / no JS | Did `npm run build` succeed? `ls dist/client/assets/index-*.js` |
| `Invariant failed` in console | Missing `dist/client/_shell.html` — rebuild (SPA mode must be on) |
| Uploaded images 404 | Is the `uploads` symlink present? `ls -l uploads` |
| WebSocket won't connect | nginx `Upgrade`/`Connection` headers + the `map` block |
| DB errors on boot | `MONGODB_URI` in `.env`; is mongod running/reachable? |
| Env changes ignored | `.env` must be at the **project root**, then restart the service |
