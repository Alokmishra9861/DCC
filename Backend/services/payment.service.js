// Backend/services/payment.service.js
const stripe = require("../config/stripe");
const { ApiError } = require("../utils/ApiResponse");

// ── STRIPE ────────────────────────────────────────────────────────────────────

/**
 * Create a Stripe checkout session for membership purchase.
 * success_url / cancel_url read from FRONTEND_URL env var so they
 * point to localhost in dev and to Render in production.
 */
const createStripeCheckoutSession = async ({
  memberId,
  email,
  priceUSD,
  metadata = {},
}) => {
  // ✅ FIX: was CLIENT_URL — backend .env uses FRONTEND_URL
  const frontendUrl =
    process.env.FRONTEND_URL || "https://dcc-frontend-ce9z.onrender.com";

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
    metadata: {
      memberId: String(memberId),
      type: "membership",
      ...Object.fromEntries(
        Object.entries(metadata).map(([k, v]) => [k, String(v)]),
      ),
    },
    // ✅ FIX: FRONTEND_URL — local = http://localhost:5173, prod = Render URL
    success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=membership`,
    cancel_url: `${frontendUrl}/payment/cancelled`,
  });

  return session;
};

/**
 * Create Stripe checkout for certificate purchase.
 * successUrl / cancelUrl are passed in by the caller (already built
 * client-side using window.location.origin so they're always correct).
 */
const createStripeCertificateCheckout = async ({
  memberId,
  certificateId,
  memberPrice,
  businessName,
  successUrl,
  cancelUrl,
  metadata = {},
}) => {
  if (!stripe) {
    throw new Error(
      "Stripe not initialized. Check STRIPE_SECRET_KEY in environment variables.",
    );
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: metadata.title
              ? `${metadata.title} — ${businessName}`
              : `Certificate — ${businessName}`,
            description:
              metadata.offerType === "PREPAID_CERTIFICATE"
                ? `Prepaid Gift Certificate: $${metadata.faceValue} face value at ${businessName}`
                : `Value-Added Certificate: $${metadata.discountValue || metadata.faceValue} off at ${businessName}`,
          },
          unit_amount: Math.round(Number(memberPrice) * 100),
        },
        quantity: 1,
      },
    ],
    // All metadata values must be strings (Stripe requirement)
    metadata: {
      type: "certificate",
      memberId: String(memberId),
      certificateId: String(certificateId),
      offerType: metadata.offerType || "",
      faceValue: String(metadata.faceValue || ""),
      memberPrice: String(memberPrice),
      businessName: String(businessName),
      title: String(metadata.title || ""),
      discountValue: String(metadata.discountValue || ""),
      minSpend: String(metadata.minSpend || ""),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
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
 * Verify Stripe webhook signature — throws if invalid
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

// ── PAYPAL ────────────────────────────────────────────────────────────────────

/**
 * Create a PayPal order for membership purchase.
 */
const createPayPalOrder = async ({ priceUSD, description, metadata = {} }) => {
  const isLive = process.env.PAYPAL_MODE === "live";
  const baseUrl = isLive
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const { access_token } = await tokenRes.json();

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
          amount: { currency_code: "USD", value: priceUSD.toFixed(2) },
          description,
        },
      ],
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
