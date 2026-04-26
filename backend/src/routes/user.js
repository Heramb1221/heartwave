import express from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { clerkClient } from "@clerk/clerk-sdk-node";

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      // 🔥 Fetch full user from Clerk
      const clerkUser = await clerkClient.users.getUser(userId);

      user = await User.create({
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`,
        avatar: clerkUser.imageUrl,
      });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;