export type AuthUser = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "admin" | "lab_staff" | "dentist";
  clinic?: string;
};

// Tokens are stored in httpOnly cookies (set by the server).
// Only the non-sensitive user profile object is kept in sessionStorage
// so the UI knows the current user's name/role without an extra /me call.
const USER_KEY = "primeSmileUser";

// In-memory access token cache for Bearer header (cleared on page reload — that's fine
// because the refresh cookie will re-issue it automatically).
let _memAccessToken: string | null = null;

export function getAccessToken(): string | null {
  return _memAccessToken;
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(data: { accessToken: string; refreshToken?: string; user?: AuthUser }) {
  _memAccessToken = data.accessToken;
  if (data.user) sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function clearSession() {
  _memAccessToken = null;
  sessionStorage.removeItem(USER_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  // The server reads the refresh_token httpOnly cookie automatically.
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) return null;
  const data = await res.json();
  _memAccessToken = data.accessToken;
  return data.accessToken as string;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  if (!headers.has("content-type") && init.body) headers.set("content-type", "application/json");
  // Send Bearer header if we have an in-memory token; cookies are sent automatically.
  if (token) headers.set("authorization", `Bearer ${token}`);

  let res = await fetch(path, { ...init, headers, credentials: "include" });

  if (res.status === 401) {
    // Try to refresh via httpOnly cookie
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      headers.set("authorization", `Bearer ${nextToken}`);
      res = await fetch(path, { ...init, headers, credentials: "include" });
    } else {
      clearSession();
      throw new Error("Authentication required. Please log in again.");
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401) {
      clearSession();
      throw new Error("Authentication required. Please log in again.");
    }
    throw new Error(body.error || "Request failed");
  }

  return res.json();
}

export type RealtimeConnection = {
  ws: WebSocket;
  isConnected: boolean;
  subscribe: (events: string[]) => void;
  send: (message: any) => void;
  close: () => void;
};

export function openRealtimeConnection(onEvent: (event: any) => void): RealtimeConnection | null {
  const token = getAccessToken();
  if (!token || typeof window === "undefined") return null;

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const ws = new WebSocket(`${protocol}://${window.location.host}/ws?token=${encodeURIComponent(token)}`);
  
  let isConnected = false;
  let reconnectAttempts = 0;
  let reconnectTimer: NodeJS.Timeout | null = null;
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connection: RealtimeConnection = {
    ws,
    isConnected: false,
    subscribe: (events: string[]) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "subscribe", events }));
      }
    },
    send: (message: any) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    },
    close: () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      ws.close();
    }
  };

  const handleConnect = () => {
    isConnected = true;
    connection.isConnected = true;
    reconnectAttempts = 0;
    console.log("WebSocket connected");
  };

  const handleDisconnect = () => {
    isConnected = false;
    connection.isConnected = false;
    console.log("WebSocket disconnected");
    
    // Attempt to reconnect
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
      reconnectTimer = setTimeout(() => {
        const newConnection = openRealtimeConnection(onEvent);
        if (newConnection) {
          Object.assign(connection, newConnection);
        }
      }, reconnectDelay);
    }
  };

  const handleMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      // Handle connection events
      if (data.type === "connected") {
        handleConnect();
        onEvent(data);
        return;
      }
      
      // Handle subscription confirmation
      if (data.type === "subscribed") {
        console.log("Subscribed to events:", data.events);
        onEvent(data);
        return;
      }
      
      // Handle error messages
      if (data.type === "error") {
        console.error("WebSocket error:", data.message);
        onEvent(data);
        return;
      }
      
      // Handle ping/pong for connection health
      if (data.type === "pong") {
        return;
      }
      
      // Pass all other events to the handler
      onEvent(data);
    } catch (error) {
      console.error("WebSocket message parsing error:", error);
    }
  };

  ws.onopen = handleConnect;
  ws.onclose = handleDisconnect;
  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    handleDisconnect();
  };
  
  ws.onmessage = handleMessage;

  // Set up ping/pong for connection health
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "ping" }));
    } else {
      clearInterval(pingInterval);
    }
  }, 30000); // Every 30 seconds

  return connection;
}

// Browser notification helper
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === "granted") {
    return new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options
    });
  }
}

// Real-time event handlers
export function createRealtimeEventHandler() {
  const handlers = new Map<string, Function[]>();
  
  return {
    on: (event: string, handler: Function) => {
      if (!handlers.has(event)) {
        handlers.set(event, []);
      }
      handlers.get(event)!.push(handler);
    },
    
    off: (event: string, handler: Function) => {
      const eventHandlers = handlers.get(event);
      if (eventHandlers) {
        const index = eventHandlers.indexOf(handler);
        if (index > -1) {
          eventHandlers.splice(index, 1);
        }
      }
    },
    
    emit: (event: string, data?: any) => {
      const eventHandlers = handlers.get(event);
      if (eventHandlers) {
        eventHandlers.forEach(handler => handler(data));
      }
    },
    
    handle: (eventData: any) => {
      if (eventData.type) {
        const eventHandlers = handlers.get(eventData.type);
        if (eventHandlers) {
          eventHandlers.forEach(handler => handler(eventData));
        }
      }
    }
  };
}
