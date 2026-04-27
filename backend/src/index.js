import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import userRoutes from "./routes/user.js";
import roomRoutes from "./routes/room.js";

dotenv.config();

const app = express();

// Middleware
app.use("/api/payment", webhookRoute);
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/payment", paymentRoutes);

// Connect DB
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const roomUsers = {};
const roomState = {};
const roomQueue = {};
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // JOIN ROOM EVENT
  socket.on("join_room", ({ roomCode, user }) => {
    socket.join(roomCode);

    console.log(`${user.name} joined room ${roomCode}`);

    // existing user logic...
    if (!roomUsers[roomCode]) {
      roomUsers[roomCode] = [];
    }

    const exists = roomUsers[roomCode].find(u => u.name === user.name);

    if (!exists) {
      roomUsers[roomCode].push(user);
    }

    io.to(roomCode).emit("room_users", roomUsers[roomCode]);

    // 🔥 SEND CURRENT STATE TO NEW USER ONLY
    if (roomState[roomCode]) {
      socket.emit("sync_state", roomState[roomCode]);
    }
  });

  socket.on("disconnect", () => {
    for (const roomCode in roomUsers) {
      roomUsers[roomCode] = roomUsers[roomCode].filter(
        (u) => u.socketId !== socket.id
      );

      io.to(roomCode).emit("room_users", roomUsers[roomCode]);
    }

    console.log("User disconnected:", socket.id);
  });

  // PLAY EVENT
  socket.on("play", ({ roomCode, videoId, time }) => {
    roomState[roomCode] = {
      videoId,
      currentTime: time,
      isPlaying: true,
    };

    socket.to(roomCode).emit("play", { videoId, time });
  });

  // PAUSE EVENT
  socket.on("pause", ({ roomCode, time }) => {
    if (!roomState[roomCode]) return;

    roomState[roomCode].currentTime = time;
    roomState[roomCode].isPlaying = false;

    socket.to(roomCode).emit("pause", { time });
  });

  // SEEK EVENT
  socket.on("seek", ({ roomCode, time }) => {
    if (!roomState[roomCode]) return;

    roomState[roomCode].currentTime = time;

    socket.to(roomCode).emit("seek", { time });
  });

  socket.on("add_to_queue", ({ roomCode, video }) => {
    if (!roomQueue[roomCode]) {
      roomQueue[roomCode] = [];
    }

    roomQueue[roomCode].push(video);

    io.to(roomCode).emit("queue_updated", roomQueue[roomCode]);
  });

  socket.on("play_from_queue", ({ roomCode, video }) => {
    if (!roomQueue[roomCode]) return;

    // remove from queue
    roomQueue[roomCode] = roomQueue[roomCode].filter(
      (v) => v.videoId !== video.videoId
    );

    // update state
    roomState[roomCode] = {
      videoId: video.videoId,
      currentTime: 0,
      isPlaying: true,
    };

    // sync queue
    io.to(roomCode).emit("queue_updated", roomQueue[roomCode]);

    // sync playback
    io.to(roomCode).emit("sync_state", roomState[roomCode]);
  });

  socket.on("song_ended", ({ roomCode }) => {
    console.log("SONG ENDED EVENT RECEIVED:", roomCode);

    if (!roomQueue[roomCode] || roomQueue[roomCode].length === 0) {
      console.log("Queue empty");
      return;
    }

    const nextVideo = roomQueue[roomCode].shift();

    console.log("NEXT VIDEO:", nextVideo);

    roomState[roomCode] = {
      videoId: nextVideo.videoId,
      currentTime: 0,
      isPlaying: true,
    };

    io.to(roomCode).emit("queue_updated", roomQueue[roomCode]);
    io.to(roomCode).emit("sync_state", roomState[roomCode]);
  });

  socket.on("send_message", ({ roomCode, message }) => {
    const payload = {
      ...message,
      timestamp: new Date().toISOString(),
    };

    io.to(roomCode).emit("receive_message", payload);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});