const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const {
  createStripeCheckoutSession,
  getStripeSession,
  verifyStripeWebhook,
  createPayPalOrder,
} = require("../services/payment.service");
const { activateMembership } = require("../services/membership.service");

const MEMBERSHIP_PRICE_USD = 89.99; // Individual membership price

// ── Create membership checkout (Stripe) ───────────────
exports.createStripeCheckout = asyncHandler(async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
    include: { user: true, membership: true },
  });
  if (!member) throw ApiError.notFound("Member not found");
  if (member.membership?.status === "ACTIVE") {
    throw ApiError.conflict("You already have an active membership");
  }

  // Upsert a PENDING membership record
  const membership = await prisma.membership.upsert({
    where: { memberId: member.id },
    update: {
      status: "PENDING",
      priceUSD: MEMBERSHIP_PRICE_USD,
      paymentStatus: "PENDING",
    },
    create: {
      memberId: member.id,
      type: "INDIVIDUAL",
      status: "PENDING",
      priceUSD: MEMBERSHIP_PRICE_USD,
    },
  });

  const session = await createStripeCheckoutSession({
    memberId: member.id,
    email: member.user.email,
    priceUSD: MEMBERSHIP_PRICE_USD,
    metadata: { membershipId: membership.id, type: "membership" },
  });

  return ApiResponse.success(res, {
    checkoutUrl: session.url,
    sessionId: session.id,
  });
});

// ── Create membership order (PayPal) ──────────────────
exports.createPayPalCheckout = asyncHandler(async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
  });
  if (!member) throw ApiError.notFound("Member not found");

  const membership = await prisma.membership.upsert({
    where: { memberId: member.id },
    update: { status: "PENDING", priceUSD: MEMBERSHIP_PRICE_USD },
    create: {
      memberId: member.id,
      type: "INDIVIDUAL",
      status: "PENDING",
      priceUSD: MEMBERSHIP_PRICE_USD,
    },
  });

  const order = await createPayPalOrder({
    priceUSD: MEMBERSHIP_PRICE_USD,
    description: "DCC Annual Membership",
    metadata: { membershipId: membership.id, memberId: member.id },
  });

  return ApiResponse.success(res, { orderId: order.id, links: order.links });
});

// ── Stripe webhook (membership) ───────────────────────
exports.stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const event = verifyStripeWebhook(req.body, sig);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Only handle membership payments here
    if (session.metadata?.type !== "membership")
      return res.json({ received: true });

    const { membershipId } = session.metadata;
    await activateMembership(membershipId, session.payment_intent, "STRIPE");
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    if (session.metadata?.membershipId) {
      await prisma.membership.update({
        where: { id: session.metadata.membershipId },
        data: { paymentStatus: "FAILED" },
      });
    }
  }

  return res.json({ received: true });
});

// ── PayPal capture (called from frontend after approval) ──
exports.capturePayPal = asyncHandler(async (req, res) => {
  const { orderId, membershipId } = req.body;

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const baseUrl =
    process.env.PAYPAL_MODE === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const { access_token } = await tokenRes.json();

  const captureRes = await fetch(
    `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    },
  );
  const capture = await captureRes.json();

  if (capture.status === "COMPLETED") {
    await activateMembership(membershipId, orderId, "PAYPAL");
    return ApiResponse.success(res, {}, "Membership activated successfully");
  }

  throw ApiError.badRequest("PayPal payment not completed");
});

// ── Verify Stripe session from success page ───────────
exports.verifyStripeSession = asyncHandler(async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) throw ApiError.badRequest("Missing session_id");

  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
  });
  if (!member) throw ApiError.notFound("Member not found");

  const session = await getStripeSession(sessionId);
  if (!session || session.payment_status !== "paid") {
    throw ApiError.badRequest("Payment not completed");
  }

  if (session.metadata?.type !== "membership") {
    throw ApiError.badRequest("Invalid session type");
  }

  if (session.metadata?.memberId && session.metadata.memberId !== member.id) {
    throw ApiError.forbidden("Session does not belong to this member");
  }

  const membershipId = session.metadata?.membershipId;
  if (!membershipId) throw ApiError.badRequest("Missing membershipId");

  const current = await prisma.membership.findUnique({
    where: { id: membershipId },
  });
  if (current?.status !== "ACTIVE") {
    await activateMembership(membershipId, session.payment_intent, "STRIPE");
  }

  return ApiResponse.success(res, {}, "Membership verified");
});
