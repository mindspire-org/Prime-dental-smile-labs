import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const clients = new Map(); // userId -> Set of WebSocket connections
export const adminClients = new Set(); // Admin WebSocket connections for system-wide events

function addClient(userId, ws, user = null) {
  const set = clients.get(userId) || new Set();
  set.add(ws);
  clients.set(userId, set);
  
  // Track admin clients for system-wide notifications
  if (user?.role === "admin") {
    adminClients.add(ws);
  }
}

function removeClient(userId, ws) {
  const set = clients.get(userId);
  if (!set) return;
  set.delete(ws);
  if (set.size === 0) clients.delete(userId);
  
  // Remove from admin clients
  adminClients.delete(ws);
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    try {
      const url = new URL(req.url, "http://localhost");
      const token = url.searchParams.get("token");
      const payload = jwt.verify(token || "", process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me");
      const userId = payload.sub;

      // Get user details for role-based broadcasting
      User.findById(userId).select('role active').then(user => {
        if (!user || !user.active) {
          ws.close(1008, "Unauthorized");
          return;
        }

        addClient(userId, ws, user);
        
        // Send initial connection message
        ws.send(JSON.stringify({ 
          type: "connected", 
          timestamp: new Date().toISOString(),
          userId 
        }));

        // Handle client messages
        ws.on("message", async (data) => {
          try {
            const message = JSON.parse(data.toString());
            await handleClientMessage(ws, userId, user, message);
          } catch (error) {
            console.error("WebSocket message error:", error);
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "Invalid message format" 
            }));
          }
        });

        ws.on("close", () => removeClient(userId, ws));
        ws.on("error", (error) => {
          console.error("WebSocket error:", error);
          removeClient(userId, ws);
        });
      }).catch(() => {
        ws.close(1008, "Unauthorized");
      });
    } catch (error) {
      console.error("WebSocket connection error:", error);
      ws.close(1008, "Unauthorized");
    }
  });

  // Periodic cleanup of dead connections
  setInterval(() => {
    for (const [userId, sockets] of clients.entries()) {
      for (const ws of sockets) {
        if (ws.readyState === ws.CLOSED || ws.readyState === ws.CLOSING) {
          sockets.delete(ws);
        }
      }
      if (sockets.size === 0) {
        clients.delete(userId);
      }
    }
    
    // Clean up admin clients
    for (const ws of adminClients) {
      if (ws.readyState === ws.CLOSED || ws.readyState === ws.CLOSING) {
        adminClients.delete(ws);
      }
    }
  }, 30000); // Every 30 seconds

  return wss;
}

async function handleClientMessage(ws, userId, user, message) {
  switch (message.type) {
    case "ping":
      ws.send(JSON.stringify({ 
        type: "pong", 
        timestamp: new Date().toISOString() 
      }));
      break;
      
    case "subscribe":
      // Handle subscription to specific events
      if (message.events && Array.isArray(message.events)) {
        // Store subscriptions on the WebSocket instance
        ws.subscriptions = message.events;
        ws.send(JSON.stringify({ 
          type: "subscribed", 
          events: message.events 
        }));
      }
      break;
      
    default:
      console.warn("Unknown WebSocket message type:", message.type);
  }
}

export function notifyUser(userId, event) {
  const sockets = clients.get(userId?.toString());
  if (!sockets) return;

  const payload = JSON.stringify({
    ...event,
    timestamp: new Date().toISOString()
  });

  let sentCount = 0;
  for (const ws of sockets) {
    if (ws.readyState === ws.OPEN) {
      ws.send(payload);
      sentCount++;
    }
  }
  
  return sentCount;
}

// Broadcast to all admin clients
export function broadcastToAdmins(event) {
  const payload = JSON.stringify({
    ...event,
    timestamp: new Date().toISOString()
  });

  let sentCount = 0;
  for (const ws of adminClients) {
    if (ws.readyState === ws.OPEN) {
      // Check if admin is subscribed to this event type
      if (!ws.subscriptions || ws.subscriptions.includes(event.type)) {
        ws.send(payload);
        sentCount++;
      }
    }
  }
  
  return sentCount;
}

// Broadcast to all connected clients
export function broadcastToAll(event) {
  const payload = JSON.stringify({
    ...event,
    timestamp: new Date().toISOString()
  });

  let sentCount = 0;
  for (const [userId, sockets] of clients.entries()) {
    for (const ws of sockets) {
      if (ws.readyState === ws.OPEN) {
        // Check if client is subscribed to this event type
        if (!ws.subscriptions || ws.subscriptions.includes(event.type)) {
          ws.send(payload);
          sentCount++;
        }
      }
    }
  }
  
  return sentCount;
}

// Get real-time statistics
export function getRealtimeStats() {
  const totalConnections = Array.from(clients.values()).reduce((sum, sockets) => sum + sockets.size, 0);
  const uniqueUsers = clients.size;
  const adminConnections = adminClients.size;
  
  return {
    totalConnections,
    uniqueUsers,
    adminConnections,
    timestamp: new Date().toISOString()
  };
}

// Specific event broadcasters
export function broadcastCaseUpdate(caseData, action = "updated") {
  const event = {
    type: "case_update",
    action,
    data: caseData
  };
  
  // Notify case owner
  if (caseData.dentist) {
    notifyUser(caseData.dentist, event);
  }
  
  // Notify all admins
  broadcastToAdmins(event);
  
  return event;
}

export function broadcastNewUser(userData) {
  const event = {
    type: "new_user",
    data: userData
  };
  
  broadcastToAdmins(event);
  return event;
}

export function broadcastSystemNotification(notification) {
  const event = {
    type: "system_notification",
    data: notification
  };
  
  broadcastToAll(event);
  return event;
}

export function broadcastActivityLog(activity) {
  const event = {
    type: "activity_log",
    data: activity
  };
  
  broadcastToAdmins(event);
  return event;
}
