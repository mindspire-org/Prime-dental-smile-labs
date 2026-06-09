import { createApiApp } from "./app.js";
import { attachWebSocketServer } from "./services/realtime.js";
import { startScheduler } from "./services/scheduler.js";
import http from "node:http";

const PORT = Number(process.env.API_PORT || 3001);

const app = await createApiApp();
const server = http.createServer(app);
attachWebSocketServer(server);

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} already in use. Kill the process holding it and retry.`);
    process.exit(1);
  } else {
    throw err;
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`API server listening on http://localhost:${PORT}`);
  startScheduler();
});
