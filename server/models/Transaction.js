import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    eventId: { type: String, required: true },
    eventTitle: { type: String, required: true },
    amount: { type: Number, required: true }, // Store in dollars (e.g., 20)
    status: { type: String, enum: ["success", "refunded", "failed"], default: "success" },
    stripePaymentId: { type: String }, // Optional: If you want to link to Stripe Dashboard
  },
  { timestamps: true }
);

// 👇 THIS IS THE FIX: Ensures a unique combination of userId and eventId
// MongoDB will reject the second attempt to save a transaction for the same user/event.
TransactionSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;