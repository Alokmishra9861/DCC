const Stripe = require("stripe");

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("⚠️  STRIPE_SECRET_KEY not set — Stripe payments will fail");
} else {
  const keyPrefix = process.env.STRIPE_SECRET_KEY.substring(0, 7);
  console.log(`ℹ️ Stripe Backend Secret Key Prefix: ${keyPrefix}... (Length: ${process.env.STRIPE_SECRET_KEY.length})`);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

module.exports = stripe;
