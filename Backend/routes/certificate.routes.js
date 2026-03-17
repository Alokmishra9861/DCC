// Backend/routes/certificate.routes.js  — FULL REPLACEMENT
// Changes from original:
//   + POST /api/certificates/redeem-by-code  — business redeems by member's uniqueCode
//   + GET  /api/certificates/redemptions     — business views redemption history
// Everything else is IDENTICAL to the original.

const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/certificate.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

// ── Member routes ─────────────────────────────────────────────────────────────

router.get(
  "/available",
  protect,
  authorize("MEMBER", "BUSINESS"),
  ctrl.getAvailableCertificates,
);

router.get("/my", protect, authorize("MEMBER"), ctrl.getMyCertificates);

router.post(
  "/redeem-check",
  protect,
  authorize("MEMBER"),
  ctrl.checkRedeemEligibility,
);

router.post(
  "/purchase",
  protect,
  authorize("MEMBER"),
  ctrl.purchaseCertificate,
);

// ── Business routes ───────────────────────────────────────────────────────────

router.get(
  "/business",
  protect,
  authorize("BUSINESS"),
  ctrl.getBusinessCertificates,
);

router.post("/", protect, authorize("BUSINESS"), ctrl.createCertificate);

// Original: redeem by Certificate.claimCode (business-created QR)
router.post("/redeem", protect, authorize("BUSINESS"), ctrl.redeemCertificate);

// NEW: redeem by CertificatePurchase.uniqueCode (member's DISC-XXXX code)
router.post(
  "/redeem-by-code",
  protect,
  authorize("BUSINESS"),
  ctrl.redeemByCode,
);

// NEW: business views all redemption history for their certificates
router.get("/redemptions", protect, authorize("BUSINESS"), ctrl.getRedemptions);

// ── Webhook (no auth) ─────────────────────────────────────────────────────────
router.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  ctrl.handleCertificatePaymentWebhook,
);

module.exports = router;
