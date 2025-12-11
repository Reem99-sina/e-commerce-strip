import express from "express";
import Stripe from "stripe";
import cors from "cors";
import dotenv from "dotenv";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ||
    "sk_test_51M9peeJJJvaHsLdecc5ypi04M0PFWT6re3FTMoSTTyv7sn9l25q549zkGWYx4KenVyiI1C2R0FpqFYDH5qgYKFJp000UdTqm1x"
);

const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());
console.log("Stripe Key:", process.env.STRIPE_SECRET_KEY);
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { products, shipping } = req.body;
    // Convert products array into Stripe line_items
    const line_items = products.map((p) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: p.name,
        },
        unit_amount: Math.round(p.price * 100), // must be in cents
      },
      quantity: p.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: "https://ecommerce-vue-dusky.vercel.app/payment/success",
      cancel_url: "https://ecommerce-vue-dusky.vercel.app/payment/cancel",

      // Optional: pass metadata so you can see shipping info in Stripe Dashboard
      metadata: {
        customer_name: shipping.first_name + " " + shipping.last_name,
        customer_address: shipping.address,
        customer_phone: shipping.phone,
      },
    });
    res.json({ url: session.url, id: session.id });
  } catch (error) {
    res.status(400).json({ message: "error in servier" });
  }
});
app.get("/", (req, res) => {
  res.json({ message: "done" });
});
app.listen(3000);
