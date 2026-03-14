const stripe = require("../config/stripe");
const { ApiError } = require("../utils/ApiResponse");

// ── STRIPE ────────────────────────────────────────────

/**
 * Create a Stripe checkout session for membership purchase
 */
const createStripeCheckoutSession = async ({
  memberId,
  email,
  priceUSD,
  metadata = {},
}) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(priceUSD * 100),
          product_data: {
            name: "DCC Membership",
            description: "Discount Club Cayman Annual Membership",
          },
        },
        quantity: 1,
      },
    ],
    metadata: { memberId, ...metadata },
    success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment/cancelled`,
  });

  return session;
};

/**
 * Create Stripe checkout for certificate purchase
 */
const createStripeCertificateCheckout = async ({
  memberId,
  certificateId,
  memberPrice,
  businessName,
  metadata = {},
}) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(memberPrice * 100),
          product_data: {
            name: `${businessName} Certificate`,
            description: "Prepaid Certificate — Discount Club Cayman",
          },
        },
        quantity: 1,
      },
    ],
    metadata: { memberId, certificateId, type: "certificate", ...metadata },
    success_url: `${process.env.CLIENT_URL}/certificates/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/certificates`,
  });

  return session;
};

/**
 * Retrieve a completed Stripe checkout session
 */
const getStripeSession = async (sessionId) => {
  return await stripe.checkout.sessions.retrieve(sessionId);
};

/**
 * Verify Stripe webhook signature
 */
const verifyStripeWebhook = (rawBody, signature) => {
  try {
    return stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    throw ApiError.badRequest(
      `Webhook signature verification failed: ${err.message}`,
    );
  }
};

// ── PAYPAL ────────────────────────────────────────────
// Basic PayPal order creation using REST API directly
const createPayPalOrder = async ({ priceUSD, description, metadata = {} }) => {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const baseUrl =
    process.env.PAYPAL_MODE === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  // Get access token
  const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const { access_token } = await tokenRes.json();

  // Create order
  const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          description,
          amount: { currency_code: "USD", value: priceUSD.toFixed(2) },
          custom_id: JSON.stringify(metadata),
        },
      ],
      application_context: {
        return_url: `${process.env.CLIENT_URL}/payment/success`,
        cancel_url: `${process.env.CLIENT_URL}/payment/cancelled`,
      },
    }),
  });

  return await orderRes.json();
};

module.exports = {
  createStripeCheckoutSession,
  createStripeCertificateCheckout,
  getStripeSession,
  verifyStripeWebhook,
  createPayPalOrder,
};
