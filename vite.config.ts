// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
// We self-host on a VPS (Node + Express backend), NOT Cloudflare Workers.
// `cloudflare: false` disables the build-only CF Worker target so TanStack
// emits a Node server build — which the SPA prerender step needs (it boots
// the Node server to render the shell). The CF worker output (dist/server)
// is otherwise unused here.
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
    // SPA mode: prerender a real client shell to dist/client/_shell.html.
    // server.mjs serves that static shell (it already contains TanStack's
    // bootstrap + hashed asset tags). A hand-rolled empty <div id="root">
    // shell makes StartClient throw "Invariant failed". The Node server
    // build is only used at build time for this prerender, not at runtime.
    spa: { enabled: true },
  },
  vite: {
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
        "/uploads": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
        "/ws": {
          target: "ws://localhost:3001",
          ws: true,
        },
      },
    },
  },
});
