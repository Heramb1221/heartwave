import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  hostId: { type: String, required: true }, // clerkId

  users: [
    {
      clerkId: String,
      name: String,
      avatar: String,
    }
  ],

  currentVideoId: { type: String, default: null },
  isPlaying: { type: Boolean, default: false },
  currentTime: { type: Number, default: 0 },

}, { timestamps: true });

export default mongoose.model("Room", roomSchema);