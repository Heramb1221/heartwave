import express from "express";
import { stripe } from "../config/stripe.js";
import User from "../models/User.js";

const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook error:", err.message);
      return res.sendStatus(400);
    }

    // 🔥 Subscription success
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = session.metadata.userId;

      await User.findOneAndUpdate(
        { clerkId: userId },
        { isPremium: true }
      );
    }

    res.json({ received: true });
  }
);

export default router;