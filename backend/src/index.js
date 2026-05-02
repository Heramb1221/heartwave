import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.js";
import roomRoutes from "./routes/room.js";
import webhookRoute from "./routes/webhook.js";
import paymentRoutes from "./routes/payment.js";

const app = express();

// ========================
// MIDDLEWARE (ORDER MATTERS)
// ========================
app.use(express.raw({ type: "application/json" }, (req, res, next) => {
  if (req.path === "/api/payment/webhook") return next();
  express.json()(req, res, next);
}));

app.use((req, res, next) => {
  if (req.path === "/api/payment/webhook") return next();
  cors()(req, res, next);
});

app.use(cors());

// ========================
// ROUTES
// ========================
app.use("/api/payment", webhookRoute); // Raw body for webhook
app.use("/api/user", userRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/payment", paymentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// ========================
// DATABASE
// ========================
connectDB();

// ========================
// SOCKET.IO + SERVER
// ========================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// ========================
// ROOM STATE MANAGEMENT
// ========================
const roomUsers = {}; // { roomCode: [{ socketId, clerkId, name, avatar }] }
const roomState = {}; // { roomCode: { videoId, currentTime, isPlaying } }
const roomQueue = {}; // { roomCode: [{ videoId, title }] }
const peerConnections = {}; // { roomCode: { [socketId]: [{ peerId, socket }] } }

// ========================
// SOCKET.IO CONNECTION
// ========================
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // ========================
  // JOIN ROOM
  // ========================
  socket.on("join_room", ({ roomCode, user }) => {
    try {
      socket.join(roomCode);
      socket.roomCode = roomCode;
      socket.clerkId = user.clerkId;

      console.log(`📍 ${user.name} joined ${roomCode}`);

      // Initialize room if new
      if (!roomUsers[roomCode]) {
        roomUsers[roomCode] = [];
        roomState[roomCode] = {
          videoId: "dQw4w9WgXcQ",
          currentTime: 0,
          isPlaying: false,
        };
        roomQueue[roomCode] = [];
        peerConnections[roomCode] = {};
      }

      // Add user (check for duplicates)
      const existingUser = roomUsers[roomCode].find(
        (u) => u.clerkId === user.clerkId
      );

      if (!existingUser) {
        roomUsers[roomCode].push({
          socketId: socket.id,
          clerkId: user.clerkId,
          name: user.name,
          avatar: user.avatar,
        });
      } else {
        // Update socket ID for reconnections
        existingUser.socketId = socket.id;
      }

      peerConnections[roomCode][socket.id] = [];

      // Broadcast updated users
      io.to(roomCode).emit("room_users", roomUsers[roomCode]);

      // Send current state to joining user
      socket.emit("sync_state", roomState[roomCode]);
      socket.emit("queue_updated", roomQueue[roomCode]);

      // Notify others
      socket.to(roomCode).emit("user_joined", {
        name: user.name,
        count: roomUsers[roomCode].length,
      });
    } catch (error) {
      console.error("❌ Join error:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // ========================
  // DISCONNECT
  // ========================
  socket.on("disconnect", () => {
    try {
      const roomCode = socket.roomCode;
      if (!roomCode) return;

      console.log(`👋 ${socket.id} disconnected from ${roomCode}`);

      // Remove user
      if (roomUsers[roomCode]) {
        roomUsers[roomCode] = roomUsers[roomCode].filter(
          (u) => u.socketId !== socket.id
        );
        io.to(roomCode).emit("room_users", roomUsers[roomCode]);

        // Clean up empty room
        if (roomUsers[roomCode].length === 0) {
          delete roomUsers[roomCode];
          delete roomState[roomCode];
          delete roomQueue[roomCode];
          delete peerConnections[roomCode];
          console.log(`🗑️  Room ${roomCode} deleted`);
        }
      }

      // Clean up peer connections
      if (peerConnections[roomCode]) {
        delete peerConnections[roomCode][socket.id];
      }
    } catch (error) {
      console.error("❌ Disconnect error:", error);
    }
  });

  // ========================
  // PLAYBACK CONTROL
  // ========================
  socket.on("play", ({ roomCode, videoId, time, userId }) => {
    try {
      if (!validateRoom(roomCode, socket.clerkId, userId)) {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      if (roomState[roomCode]) {
        roomState[roomCode] = {
          videoId,
          currentTime: time || 0,
          isPlaying: true,
        };

        io.to(roomCode).emit("sync_state", roomState[roomCode]);
        console.log(`▶️  Room ${roomCode}: play ${videoId}`);
      }
    } catch (error) {
      console.error("❌ Play error:", error);
    }
  });

  socket.on("pause", ({ roomCode, time, userId }) => {
    try {
      if (!validateRoom(roomCode, socket.clerkId, userId)) {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      if (roomState[roomCode]) {
        roomState[roomCode].currentTime = time || 0;
        roomState[roomCode].isPlaying = false;

        io.to(roomCode).emit("sync_state", roomState[roomCode]);
        console.log(`⏸️  Room ${roomCode}: paused at ${time}s`);
      }
    } catch (error) {
      console.error("❌ Pause error:", error);
    }
  });

  socket.on("seek", ({ roomCode, time, userId }) => {
    try {
      if (!validateRoom(roomCode, socket.clerkId, userId)) {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      if (roomState[roomCode]) {
        roomState[roomCode].currentTime = time || 0;
        io.to(roomCode).emit("sync_state", roomState[roomCode]);
        console.log(`⏩ Room ${roomCode}: seeked to ${time}s`);
      }
    } catch (error) {
      console.error("❌ Seek error:", error);
    }
  });

  // ========================
  // QUEUE MANAGEMENT
  // ========================
  socket.on("add_to_queue", ({ roomCode, video, userId }) => {
    try {
      if (!roomQueue[roomCode]) {
        roomQueue[roomCode] = [];
      }

      // Prevent duplicates
      const isDuplicate = roomQueue[roomCode].some(
        (v) => v.videoId === video.videoId
      );
      if (isDuplicate) {
        socket.emit("error", { message: "Song already in queue" });
        return;
      }

      roomQueue[roomCode].push(video);
      io.to(roomCode).emit("queue_updated", roomQueue[roomCode]);
      console.log(`➕ Room ${roomCode}: added ${video.title}`);
    } catch (error) {
      console.error("❌ Add to queue error:", error);
    }
  });

  socket.on("play_from_queue", ({ roomCode, videoId, userId }) => {
    try {
      if (!validateRoom(roomCode, socket.clerkId, userId)) {
        socket.emit("error", { message: "Only host can play from queue" });
        return;
      }

      if (!roomQueue[roomCode]) return;

      const video = roomQueue[roomCode].find((v) => v.videoId === videoId);
      if (!video) return;

      // Remove from queue
      roomQueue[roomCode] = roomQueue[roomCode].filter(
        (v) => v.videoId !== videoId
      );

      // Update state
      roomState[roomCode] = {
        videoId: video.videoId,
        currentTime: 0,
        isPlaying: true,
      };

      io.to(roomCode).emit("queue_updated", roomQueue[roomCode]);
      io.to(roomCode).emit("sync_state", roomState[roomCode]);
      console.log(`▶️  Room ${roomCode}: playing ${video.title}`);
    } catch (error) {
      console.error("❌ Play from queue error:", error);
    }
  });

  socket.on("song_ended", ({ roomCode }) => {
    try {
      if (!roomQueue[roomCode] || roomQueue[roomCode].length === 0) {
        console.log(`⏹️  Room ${roomCode}: queue empty`);
        return;
      }

      const nextVideo = roomQueue[roomCode].shift();
      roomState[roomCode] = {
        videoId: nextVideo.videoId,
        currentTime: 0,
        isPlaying: true,
      };

      io.to(roomCode).emit("queue_updated", roomQueue[roomCode]);
      io.to(roomCode).emit("sync_state", roomState[roomCode]);
      console.log(`🎵 Room ${roomCode}: auto-playing ${nextVideo.title}`);
    } catch (error) {
      console.error("❌ Song ended error:", error);
    }
  });

  // ========================
  // CHAT
  // ========================
  socket.on("send_message", ({ roomCode, message, userId }) => {
    try {
      const payload = {
        ...message,
        timestamp: new Date().toISOString(),
      };

      io.to(roomCode).emit("receive_message", payload);
      console.log(`💬 Room ${roomCode}: ${message.user}`);
    } catch (error) {
      console.error("❌ Send message error:", error);
    }
  });

  // ========================
  // WEBRTC - ICE CANDIDATES
  // ========================
  socket.on("webrtc_ice", ({ roomCode, candidate, targetSocketId }) => {
    try {
      io.to(roomCode).emit("webrtc_ice", {
        candidate,
        fromSocketId: socket.id,
        targetSocketId,
      });
    } catch (error) {
      console.error("❌ ICE error:", error);
    }
  });

  // ========================
  // WEBRTC - OFFER
  // ========================
  socket.on("webrtc_offer", ({ roomCode, offer, targetSocketId }) => {
    try {
      io.to(targetSocketId).emit("webrtc_offer", {
        offer,
        fromSocketId: socket.id,
      });
    } catch (error) {
      console.error("❌ Offer error:", error);
    }
  });

  // ========================
  // WEBRTC - ANSWER
  // ========================
  socket.on("webrtc_answer", ({ roomCode, answer, targetSocketId }) => {
    try {
      io.to(targetSocketId).emit("webrtc_answer", {
        answer,
        fromSocketId: socket.id,
      });
    } catch (error) {
      console.error("❌ Answer error:", error);
    }
  });

  // ========================
  // ERROR HANDLER
  // ========================
  socket.on("error", (error) => {
    console.error("❌ Socket error:", error);
  });
});

// ========================
// VALIDATION HELPER
// ========================
function validateRoom(roomCode, userClerkId, hostClerkId) {
  // Validate that user is host
  return userClerkId === hostClerkId;
}

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🎵 HeartWave Server running on port ${PORT}\n`);
  console.log(`📍 Client: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  console.log(`💾 Database: Connected\n`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n🛑 SIGTERM received, shutting down...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});