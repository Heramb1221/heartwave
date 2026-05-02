import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ["websocket", "polling"],
  autoConnect: false,
});

// ========================
// CONNECTION EVENTS
// ========================
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.warn("👋 Socket disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error);
});

socket.on("error", (error) => {
  console.error("❌ Socket error:", error);
});