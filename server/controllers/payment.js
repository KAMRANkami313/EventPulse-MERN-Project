import Stripe from "stripe";
import dotenv from "dotenv";
import Event from "../models/Event.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Notification from "../models/Notification.js";
import { sendTicketEmail } from "../services/email.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * createCheckoutSession
 *
 * Creates a Stripe Checkout Session for a paid event.
 * SECURITY FIXES:
 * - Uses req.user.id from JWT (not req.body.userId)
 * - Verifies the event exists and the price matches
 * - Passes eventId + userId in Stripe metadata (tamper-proof, not in URL)
 * - Stores the Stripe session ID for webhook verification
 */
export const createCheckoutSession = async (req, res) => {
  try {
    const { eventId, eventTitle, price } = req.body;
    const userId = req.user.id; // SECURITY: Use JWT, not body

    // 1. Verify the event exists and price matches
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // 2. Verify the price matches the event's actual price (prevent price manipulation)
    if (Math.abs(event.price - price) > 0.01) {
      return res.status(400).json({ error: "Price mismatch. Please refresh and try again." });
    }

    // 3. Check user isn't already joined
    if (event.participants.includes(userId)) {
      return res.status(400).json({ error: "You have already joined this event." });
    }

    // 4. Get user info for metadata
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 5. Create Stripe checkout session with metadata (tamper-proof)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      locale: "en",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Ticket: ${event.title}`,
              description: `Event on ${new Date(event.date).toLocaleDateString()} at ${event.location}`,
            },
            unit_amount: Math.round(price * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Pass all data in metadata — this is tamper-proof (set server-side, can't be modified by user)
      metadata: {
        eventId: eventId,
        userId: userId,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        eventTitle: event.title,
        amount: price.toString(),
      },
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard`,
    });

    // 6. Create a pending Transaction record (status: "pending")
    // This will be updated to "success" by the webhook
    try {
      await Transaction.findOneAndUpdate(
        { userId, eventId },
        {
          userId,
          userName: `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
          eventId,
          eventTitle: event.title,
          amount: price,
          status: "pending",
          stripePaymentId: session.id, // Real Stripe session ID
        },
        { upsert: true, new: true }
      );
    } catch (txErr) {
      console.error("Transaction creation error:", txErr);
      // Continue — the webhook will handle the transaction
    }

    res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * handleStripeWebhook
 *
 * Verifies Stripe's signature and processes the checkout.session.completed event.
 * This is the ONLY reliable way to confirm payment — the success URL redirect is spoofable.
 *
 * IMPORTANT: This route must use express.raw({ type: "application/json" }) to
 * verify the Stripe signature. It is registered BEFORE express.json() middleware.
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set — webhook verification disabled");
    return res.status(500).json({ error: "Webhook not configured" });
  }

  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { eventId, userId, userName, userEmail, eventTitle, amount } = session.metadata || {};

    if (!eventId || !userId) {
      console.error("Webhook: Missing metadata in session", session.id);
      return res.status(400).json({ error: "Missing metadata" });
    }

    try {
      // 1. Update Transaction status to "success"
      await Transaction.findOneAndUpdate(
        { eventId, userId },
        {
          status: "success",
          stripePaymentId: session.payment_intent || session.id,
        },
        { upsert: true, new: true }
      );

      // 2. Add user to event participants (if not already)
      const eventDoc = await Event.findById(eventId);
      if (eventDoc && !eventDoc.participants.includes(userId)) {
        eventDoc.participants.push(userId);
        await eventDoc.save();

        // 3. Send notification to event creator
        if (eventDoc.userId !== userId) {
          try {
            const newNotif = new Notification({
              userId: eventDoc.userId,
              fromUserId: userId,
              fromUserName: userName || "A user",
              type: "join",
              message: `joined your event: ${eventTitle || eventDoc.title}`,
              eventId,
            });
            await newNotif.save();
          } catch (notifErr) {
            console.error("Webhook notification error:", notifErr);
          }
        }

        // 4. Send ticket email
        try {
          const ticketId = `${eventDoc._id.toString().slice(-6)}-${userId.toString().slice(-4)}`;
          sendTicketEmail(
            userEmail,
            userName?.split(" ")[0] || "User",
            eventTitle || eventDoc.title,
            ticketId
          );
        } catch (emailErr) {
          console.error("Webhook email error:", emailErr);
        }
      }
    } catch (err) {
      console.error("Webhook processing error:", err);
      return res.status(500).json({ error: "Webhook processing failed" });
    }
  }

  // Handle other event types (refund, etc.)
  if (event.type === "charge.refunded") {
    const charge = event.data.object;
    try {
      // Find transaction by Stripe payment ID and update status
      await Transaction.findOneAndUpdate(
        { stripePaymentId: charge.payment_intent },
        { status: "refunded" }
      );
    } catch (err) {
      console.error("Webhook refund error:", err);
    }
  }

  // Return 200 to acknowledge receipt of the event
  res.status(200).json({ received: true });
};

/**
 * verifyPayment
 *
 * Called by the PaymentSuccess page to verify a checkout session
 * actually completed (in case webhook hasn't processed yet).
 * Returns the session status from Stripe.
 */
export const verifyPayment = async (req, res) => {
  try {
    const { session_id } = req.query;
    const userId = req.user.id;

    if (!session_id) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    // Retrieve the session from Stripe to verify it's real and paid
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed", status: session.payment_status });
    }

    // Verify this session belongs to the requesting user
    if (session.metadata?.userId !== userId) {
      return res.status(403).json({ error: "Payment does not belong to you" });
    }

    const { eventId } = session.metadata;

    // Check if the user is already a participant (webhook may have done this)
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const alreadyJoined = event.participants.includes(userId);

    // If not yet joined (webhook hasn't processed), join them now
    if (!alreadyJoined) {
      event.participants.push(userId);
      await event.save();

      // Update transaction status
      await Transaction.findOneAndUpdate(
        { eventId, userId },
        {
          status: "success",
          stripePaymentId: session.payment_intent || session.id,
        },
        { upsert: true, new: true }
      );

      // Send notification
      if (event.userId !== userId) {
        try {
          const user = await User.findById(userId);
          const newNotif = new Notification({
            userId: event.userId,
            fromUserId: userId,
            fromUserName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "A user",
            type: "join",
            message: `joined your event: ${event.title}`,
            eventId,
          });
          await newNotif.save();
        } catch (notifErr) {
          console.error("Verify payment notification error:", notifErr);
        }
      }

      // Send ticket email
      try {
        const user = await User.findById(userId);
        const ticketId = `${event._id.toString().slice(-6)}-${userId.toString().slice(-4)}`;
        sendTicketEmail(
          user?.email || "",
          user?.firstName || "User",
          event.title,
          ticketId
        );
      } catch (emailErr) {
        console.error("Verify payment email error:", emailErr);
      }
    }

    // Update transaction to success if it was pending
    await Transaction.findOneAndUpdate(
      { eventId, userId, status: "pending" },
      { status: "success", stripePaymentId: session.payment_intent || session.id }
    );

    res.status(200).json({
      verified: true,
      eventId,
      alreadyJoined,
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ error: err.message });
  }
};