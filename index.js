import express from "express";
import Stripe from "stripe";
require("dotenv").config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());

app.post("/api/create-checkout-session", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Product Name",
          },
          unit_amount: 2000, // $20.00
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: "https://yourdomain.com/success",
    cancel_url: "https://yourdomain.com/cancel",
  });
  res.json({ url: session.url, id: session.id });
});
app.get("/", () => {
  res.json({ message: "done" });
});
app.listen(3000);
