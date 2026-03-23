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
// Creates a Stripe checkout session for individual membership.
// Called by: MemberShipFormContent → paymentAPI.createStripeCheckout()
router.post(
  "/stripe/checkout",
  authorize("MEMBER", "EMPLOYER"),
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
  authorize("MEMBER", "EMPLOYER"),
  verifyStripeSession,
);

// ✅ NEW alias — matches memberAPI.verifyPayment in api.js:
//    request(`/payments/stripe/verify?session_id=${encodeURIComponent(sessionId)}`)
router.get(
  "/stripe/verify",
  authorize("MEMBER", "EMPLOYER"),
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

module.exports = router;
