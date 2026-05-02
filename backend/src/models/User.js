import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: String,
    name: String,
    avatar: String,
    isPremium: { type: Boolean, default: false },
    
    // Stripe fields
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);