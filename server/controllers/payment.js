import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { eventId, eventTitle, price, userId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
       locale: 'en', 
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Ticket: ${eventTitle}`,
            },
            unit_amount: price * 100, // Stripe expects cents (2000 = $20.00)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment/success?eventId=${eventId}&userId=${userId}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard`,
    });

    // ✅ UPDATED: Send the 'url' property
    res.status(200).json({ id: session.id, url: session.url });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};