// Backend/routes/payment.routes.js
// CHANGES FROM ORIGINAL:
//  • Kept ALL existing membership routes intact (Stripe checkout, PayPal, webhook, verify-session)
//  • Removed old /create-checkout-session + old /verify-session + old /redeem
//    (certificate checkout is now done via POST /api/certificates/purchase)
//  • ADDED: GET  /api/payments/verify-certificate-session  → reads CertificatePurchase by stripeSessionId
//  • ADDED: POST /api/payments/redeem                      → member marks VALUE_ADDED cert as redeemed

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

// ── Membership payments (unchanged) ──────────────────────────────────────────
router.post(
  "/stripe/checkout",
  authorize("MEMBER", "EMPLOYER"),
  createStripeCheckout,
);
router.post(
  "/paypal/checkout",
  authorize("MEMBER", "EMPLOYER"),
  createPayPalCheckout,
);
router.post("/paypal/capture", authorize("MEMBER", "EMPLOYER"), capturePayPal);
router.get(
  "/verify-session",
  authorize("MEMBER", "EMPLOYER"),
  verifyStripeSession,
);
router.get("/verify-certificate-session", protect, verifyCertificateSession);

// ── Certificate payments ──────────────────────────────────────────────────────

// GET /api/payments/verify-certificate-session?session_id=xxx
// Called by PaymentSuccessPage immediately after Stripe redirects back.
// Reads (does NOT create) the CertificatePurchase record that the webhook made.
// Polls up to ~8s if the webhook hasn't fired yet.
router.get(
  "/verify-certificate-session",
  authorize("MEMBER"),
  verifyCertificateSession,
);

// POST /api/payments/redeem
// Member clicks "Mark as Redeemed" on a VALUE_ADDED certificate in PaymentSuccessPage.
// PREPAID certificates are redeemed by businesses via POST /api/certificates/redeem (claim code).
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
    if (purchase.expiryDate && new Date(purchase.expiryDate) < new Date())
      throw ApiError.badRequest("Certificate has expired");

    const updated = await prisma.certificatePurchase.update({
      where: { id: purchaseId },
      data: { status: "REDEEMED", redeemedAt: new Date() },
    });

    return res.status(200).json({ success: true, certificate: updated });
  }),
);

module.exports = router;
