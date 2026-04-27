import express from "express";
import { stripe } from "../config/stripe.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-checkout-session", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",

      line_items: [
        {
          price: "price_XXXX", // 🔥 replace with your price ID
          quantity: 1,
        },
      ],

      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard`,

      metadata: {
        userId,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe error" });
  }
});

export default router;