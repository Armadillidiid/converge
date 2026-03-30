import { io } from "socket.io-client";

const API_URL = process.argv[2] || "http://localhost:4448";
const TOKEN = process.argv[3];

if (!TOKEN) {
  console.error("Usage: node test-socket.mjs <api-url> <token>");
  console.error(
    "Example: node test-socket.mjs http://localhost:4448 your-token-here",
  );
  process.exit(1);
}

console.log(
  `Connecting to ${API_URL}/api/chat with token: ${TOKEN.substring(0, 10)}...`,
);

// Using same URL format as frontend - includes /api prefix
const socket = io(`${API_URL}/api/chat`, {
  auth: {
    token: TOKEN,
  },
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("✅ Connected! Socket ID:", socket.id);
  console.log("Transport:", socket.io.engine.transport.name);

  // Test joining a room if provided
  const roomId = process.argv[4];
  if (roomId) {
    console.log(`Joining room: ${roomId}`);
    socket.emit("join_room", { roomId });
  }

  // Disconnect after 5 seconds if everything works
  setTimeout(() => {
    console.log("Disconnecting test...");
    socket.disconnect();
    process.exit(0);
  }, 5000);
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error.message);
  console.error("Error details:", error);
});

socket.on("error", (error) => {
  console.error("❌ Socket error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});

socket.on("connect_auth_error", (error) => {
  console.error("❌ Auth error on server:", error);
});

// Log all incoming events for debugging
socket.onAny((event, ...args) => {
  console.log(`📨 Event: ${event}`, args);
});
