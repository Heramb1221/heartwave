import express from "express";
import { stripe } from "../config/stripe.js";
import User from "../models/User.js";

const router = express.Router();

// ========================
// STRIPE WEBHOOK
// ========================
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("❌ STRIPE_WEBHOOK_SECRET not set");
      return res.status(400).json({ error: "Webhook secret missing" });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`📨 Webhook event: ${event.type}`);

    try {
      // ========================
      // CHECKOUT.SESSION.COMPLETED
      // ========================
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const clerkId = session.metadata?.clerkId || session.metadata?.userId;

        console.log(`✅ Checkout completed for user: ${clerkId}`);

        if (!clerkId) {
          console.error("❌ No clerkId in metadata");
          return res.status(400).json({ error: "Missing clerkId" });
        }

        // Update user to premium
        const user = await User.findOneAndUpdate(
          { clerkId },
          {
            isPremium: true,
            stripeCustomerId: session.customer,
          },
          { new: true }
        );

        if (!user) {
          console.error(`❌ User not found: ${clerkId}`);
          return res.status(404).json({ error: "User not found" });
        }

        console.log(`🎉 User ${clerkId} upgraded to premium`);
      }

      // ========================
      // CUSTOMER.SUBSCRIPTION.CREATED
      // ========================
      if (event.type === "customer.subscription.created") {
        const subscription = event.data.object;
        const clerkId = subscription.metadata?.clerkId;

        if (clerkId) {
          const user = await User.findOneAndUpdate(
            { clerkId },
            { stripeSubscriptionId: subscription.id, isPremium: true },
            { new: true }
          );
          console.log(`📝 Subscription created: ${subscription.id}`);
        }
      }

      // ========================
      // CUSTOMER.SUBSCRIPTION.UPDATED
      // ========================
      if (event.type === "customer.subscription.updated") {
        const subscription = event.data.object;
        const clerkId = subscription.metadata?.clerkId;

        if (clerkId) {
          const isPremium = subscription.status === "active";
          await User.findOneAndUpdate(
            { clerkId },
            { isPremium }
          );
          console.log(`🔄 Subscription updated: ${subscription.id} - ${subscription.status}`);
        }
      }

      // ========================
      // CUSTOMER.SUBSCRIPTION.DELETED
      // ========================
      if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object;
        const clerkId = subscription.metadata?.clerkId;

        if (clerkId) {
          await User.findOneAndUpdate(
            { clerkId },
            { isPremium: false, stripeSubscriptionId: null }
          );
          console.log(`❌ Subscription cancelled: ${subscription.id}`);
        }
      }

      // ========================
      // PAYMENT INTENT FAILED
      // ========================
      if (event.type === "payment_intent.payment_failed") {
        const paymentIntent = event.data.object;
        console.error(`💳 Payment failed: ${paymentIntent.id}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("❌ Webhook processing error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

export default router;