// Backend/routes/payment.routes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth.middleware");
const {
  createStripeCheckout,
  createPayPalCheckout,
  stripeWebhook,
  capturePayPal,
  verifyStripeSession,
} = require("../controllers/payment.controller");
const {
  verifyCertificateSession,
} = require("../controllers/certificate.controller");
const { prisma } = require("../config/database");
const { ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");

// ── Stripe webhook — raw body required, NO auth ───────────────────────────────
router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

// ── All routes below require a valid JWT ──────────────────────────────────────
router.use(protect);

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERSHIP PAYMENTS
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/payments/stripe/checkout
// Creates a Stripe checkout session for individual membership or banner purchase.
// Called by: MemberShipFormContent → paymentAPI.createStripeCheckout()
//            BusinessDashboardContent → paymentAPI.createStripeCheckout() (banner)
router.post(
  "/stripe/checkout",
  authorize("MEMBER", "EMPLOYER", "BUSINESS"),
  createStripeCheckout,
);

// POST /api/payments/paypal/checkout
router.post(
  "/paypal/checkout",
  authorize("MEMBER", "EMPLOYER"),
  createPayPalCheckout,
);

// POST /api/payments/paypal/capture
router.post("/paypal/capture", authorize("MEMBER", "EMPLOYER"), capturePayPal);

// GET /api/payments/verify-session          ← legacy alias (kept for compatibility)
// GET /api/payments/stripe/verify           ← new path (used by memberAPI.verifyPayment)
// Both hit the same controller — verifyStripeSession activates membership if needed
// and returns { type: "membership", activated: true }
router.get(
  "/verify-session",
  authorize("MEMBER", "EMPLOYER", "BUSINESS"),
  verifyStripeSession,
);

// ✅ NEW alias — matches memberAPI.verifyPayment in api.js:
//    request(`/payments/stripe/verify?session_id=${encodeURIComponent(sessionId)}`)
router.get(
  "/stripe/verify",
  authorize("MEMBER", "EMPLOYER", "BUSINESS"),
  verifyStripeSession,
);

// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICATE PAYMENTS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/payments/verify-certificate-session?session_id=xxx
// Called by stripeService.verifyPaymentSession() in the certificate purchase flow.
// ✅ FIX: removed the duplicate registration that existed before.
router.get(
  "/verify-certificate-session",
  authorize("MEMBER"),
  verifyCertificateSession,
);

// POST /api/payments/redeem
// Member marks a VALUE_ADDED certificate as redeemed.
// PREPAID certificates are redeemed by businesses via POST /api/certificates/redeem.
router.post(
  "/redeem",
  authorize("MEMBER"),
  asyncHandler(async (req, res) => {
    const { purchaseId } = req.body;
    if (!purchaseId) throw ApiError.badRequest("purchaseId is required");

    const member = await prisma.member.findUnique({
      where: { userId: req.user.id },
    });
    if (!member) throw ApiError.notFound("Member not found");

    const purchase = await prisma.certificatePurchase.findUnique({
      where: { id: purchaseId },
    });
    if (!purchase) throw ApiError.notFound("Certificate purchase not found");
    if (purchase.memberId !== member.id)
      throw ApiError.forbidden("Not your certificate");
    if (purchase.status === "REDEEMED")
      throw ApiError.badRequest("Already redeemed");
    if (purchase.expiryDate && new Date(purchase.expiryDate) < new Date()) {
      throw ApiError.badRequest("Certificate has expired");
    }

    const updated = await prisma.certificatePurchase.update({
      where: { id: purchaseId },
      data: { status: "REDEEMED", redeemedAt: new Date() },
    });

    return res.status(200).json({ success: true, certificate: updated });
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// DEBUG: Manual banner creation from Stripe session (for local development)
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/stripe/manual-banner-create",
  protect,
  authorize("ADMIN"),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) throw ApiError.badRequest("sessionId is required");

    console.log("[MANUAL] Verifying session:", sessionId);

    // Retrieve the session from Stripe
    const stripe = require("../config/stripe");
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) throw ApiError.notFound("Session not found");
    console.log("[MANUAL] Session found:", session.payment_status);

    if (session.payment_status !== "paid")
      throw ApiError.badRequest("Payment not completed");

    const {
      businessId,
      bannerTitle,
      bannerImageUrl,
      bannerLinkUrl,
      bannerPosition,
      bannerDuration,
    } = session.metadata;

    console.log("[MANUAL] Creating banner with metadata:", {
      businessId,
      bannerTitle,
      bannerImageUrl,
      bannerPosition,
      bannerDuration,
    });

    // Create the banner (same logic as webhook)
    const banner = await prisma.advertisement.create({
      data: {
        businessId: businessId,
        title: bannerTitle,
        image: bannerImageUrl,
        link: bannerLinkUrl || null,
        position: bannerPosition,
        status: "PENDING",
        startDate: new Date(),
        duration: bannerDuration,
        paymentStatus: "COMPLETED",
        stripeSessionId: session.id,
        stripePaymentId: session.payment_intent,
        pricePaid: session.amount_total / 100,
      },
    });

    console.log("[MANUAL] Banner created:", banner.id);
    return res.status(200).json({
      success: true,
      message: "Banner created successfully",
      banner: banner,
    });
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// DEBUG: Check Stripe session details
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/stripe/debug/session/:sessionId",
  protect,
  authorize("ADMIN", "BUSINESS"),
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const stripe = require("../config/stripe");

    console.log("[DEBUG] Fetching session:", sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("[DEBUG] Session data:", {
      id: session.id,
      payment_status: session.payment_status,
      payment_intent: session.payment_intent,
      metadata: session.metadata,
    });

    return res.json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        payment_intent: session.payment_intent,
        amount_total: session.amount_total,
        metadata: session.metadata,
      },
    });
  }),
);

module.exports = router;
