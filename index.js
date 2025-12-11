import express from "express";
import Stripe from "stripe";
require("dotenv").config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());

app.post("/api/create-checkout-session", async (req, res) => {
  const { products, shipping } = req.body;

  // Convert products array into Stripe line_items
  const line_items = products.map((p) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: p.name,
      },
      unit_amount: p.price, // must be in cents
    },
    quantity: p.quantity,
  }));
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
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
});
app.get("/", (res) => {
  res.json({ message: "done" });
});
app.listen(3000);
