const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/payment.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

// Stripe webhook — raw body, NO auth
router.post("/webhook/stripe", ctrl.stripeWebhook);

// Member checkout
router.post(
  "/stripe/checkout",
  protect,
  authorize("MEMBER"),
  ctrl.createStripeCheckout,
);
router.post(
  "/paypal/checkout",
  protect,
  authorize("MEMBER"),
  ctrl.createPayPalCheckout,
);
router.post(
  "/paypal/capture",
  protect,
  authorize("MEMBER"),
  ctrl.capturePayPal,
);

router.get(
  "/stripe/verify",
  protect,
  authorize("MEMBER"),
  ctrl.verifyStripeSession,
);

module.exports = router;
