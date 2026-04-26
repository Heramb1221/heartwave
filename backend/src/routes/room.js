import express from "express";
import Room from "../models/Room.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { generateRoomCode } from "../utils/generateRoomCode.js";

const router = express.Router();

router.post("/create", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;

    const user = await User.findOne({ clerkId: userId });

    const room = await Room.create({
      roomCode: generateRoomCode(),
      hostId: userId,
      users: [
        {
          clerkId: user.clerkId,
          name: user.name,
          avatar: user.avatar,
        }
      ]
    });

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

export default router;

router.post("/join", requireAuth, async (req, res) => {
  try {
    const { roomCode } = req.body;
    const { userId } = req.auth;

    const room = await Room.findOne({ roomCode });

    if (!room) return res.status(404).json({ error: "Room not found" });

    const user = await User.findOne({ clerkId: userId });

    const alreadyJoined = room.users.find(u => u.clerkId === userId);

    if (!alreadyJoined) {
      room.users.push({
        clerkId: user.clerkId,
        name: user.name,
        avatar: user.avatar,
      });
    }

    await room.save();

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: "Join failed" });
  }
});