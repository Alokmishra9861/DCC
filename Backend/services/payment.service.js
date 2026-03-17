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
          unit_amount: Math.round(Number(memberPrice) * 100), // dollars → cents
        },
        quantity: 1,
      },
    ],
    // All metadata fields must be strings (Stripe requirement)
    metadata: {
      type: "certificate", // lets the webhook route correctly
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

module.exports = {
  createStripeCheckoutSession,
  createStripeCertificateCheckout,
  getStripeSession,
  verifyStripeWebhook,
};
