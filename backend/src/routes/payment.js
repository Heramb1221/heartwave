import express from "express";
import { stripe } from "../config/stripe.js";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// ========================
// CREATE CHECKOUT SESSION
// ========================
router.post("/create-checkout-session", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;

    // Fetch user to check current status
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isPremium) {
      return res.status(400).json({ error: "User already premium" });
    }

    // Get or create customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { clerkId: userId },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create session with correct price
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // "price_XXXX"
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`,
      metadata: {
        userId,
        clerkId: userId,
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("❌ Stripe session error:", err.message);
    res.status(500).json({ error: err.message || "Stripe error" });
  }
});

// ========================
// GET SESSION
// ========================
router.get("/session/:sessionId", requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json(session);
  } catch (err) {
    console.error("❌ Get session error:", err.message);
    res.status(500).json({ error: "Failed to get session" });
  }
});

// ========================
// GET SUBSCRIPTION
// ========================
router.get("/subscription", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;
    const user = await User.findOne({ clerkId: userId });

    if (!user || !user.stripeSubscriptionId) {
      return res.json({ subscription: null });
    }

    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );

    res.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  } catch (err) {
    console.error("❌ Get subscription error:", err.message);
    res.status(500).json({ error: "Failed to get subscription" });
  }
});

// ========================
// CANCEL SUBSCRIPTION
// ========================
router.post("/cancel-subscription", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;
    const user = await User.findOne({ clerkId: userId });

    if (!user || !user.stripeSubscriptionId) {
      return res.status(404).json({ error: "No subscription found" });
    }

    await stripe.subscriptions.del(user.stripeSubscriptionId);

    user.stripeSubscriptionId = null;
    user.isPremium = false;
    await user.save();

    res.json({ message: "Subscription cancelled" });
  } catch (err) {
    console.error("❌ Cancel subscription error:", err.message);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

export default router;