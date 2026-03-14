const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/certificate.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

// ── Member routes ─────────────────────────────────────────────────────────────

// GET  /api/certificates/available        — browse purchasable certificates
router.get(
  "/available",
  protect,
  authorize("MEMBER"),
  ctrl.getAvailableCertificates,
);

// GET  /api/certificates/my               — member's own purchased certificates
router.get("/my", protect, authorize("MEMBER"), ctrl.getMyCertificates);

// POST /api/certificates/redeem-check     — check if member can redeem (membership gate)
// Returns { canRedeem: bool, redirectTo: '/membership' | null }
router.post(
  "/redeem-check",
  protect,
  authorize("MEMBER"),
  ctrl.checkRedeemEligibility,
);

// POST /api/certificates/purchase         — buy a certificate (Stripe checkout)
router.post(
  "/purchase",
  protect,
  authorize("MEMBER"),
  ctrl.purchaseCertificate,
);

// ── Business routes ───────────────────────────────────────────────────────────

// GET  /api/certificates/business         — list all certificates for this business
router.get(
  "/business",
  protect,
  authorize("BUSINESS"),
  ctrl.getBusinessCertificates,
);

// POST /api/certificates                  — business creates a certificate for an offer
router.post("/", protect, authorize("BUSINESS"), ctrl.createCertificate);

// POST /api/certificates/redeem           — business redeems a cert by claim code (QR scan)
router.post("/redeem", protect, authorize("BUSINESS"), ctrl.redeemCertificate);

// ── Webhook (no auth — Stripe calls this directly) ───────────────────────────
router.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  ctrl.handleCertificatePaymentWebhook,
);

module.exports = router;
