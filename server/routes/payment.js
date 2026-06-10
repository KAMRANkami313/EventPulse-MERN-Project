import express from "express";
import { createCheckoutSession, handleStripeWebhook, verifyPayment } from "../controllers/payment.js";
import { verifyToken } from "../middleware/auth.js";
import { createCheckoutRules } from "../middleware/validate.js";

const router = express.Router();

/**
 * Stripe Webhook Endpoint
 *
 * IMPORTANT: This must use express.raw() to get the raw body for
 * Stripe signature verification. It must be defined BEFORE any
 * express.json() middleware runs on this route.
 *
 * The webhook secret is set in the Stripe Dashboard.
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

/**
 * Create Checkout Session (authenticated)
 * Uses JWT for userId (not req.body.userId)
 */
router.post(
  "/create-checkout-session",
  verifyToken,
  createCheckoutRules,
  createCheckoutSession
);

/**
 * Verify Payment (authenticated)
 * Called by PaymentSuccess page to confirm the Stripe session is real and paid.
 * Falls back to joining the event if webhook hasn't processed yet.
 */
router.get(
  "/verify",
  verifyToken,
  verifyPayment
);

export default router;