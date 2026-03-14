const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/discount.controller");
const { protect, authorize } = require("../middlewares/auth.middleware");

// ── Public / Member browsing ──────────────────────────────────────────────────

// GET /api/discounts — list all active DISCOUNT offers
// Any logged-in user can see discounts; canRedeem flag controls the button shown
router.get("/", protect, ctrl.getAllDiscounts);

// POST /api/discounts/:id/redeem-attempt — member clicks Redeem button
// Returns { canRedeem, showUpgradeModal, modalData } — frontend drives modal from this
router.post("/:id/redeem-attempt", protect, ctrl.redeemAttempt);

// GET /api/discounts/:id — single discount detail
router.get("/:id", protect, ctrl.getDiscountById);

// ── Business — manage their own offers ───────────────────────────────────────

// POST /api/discounts — create a new discount offer
router.post("/", protect, authorize("BUSINESS"), ctrl.createDiscount);

// PUT /api/discounts/:id — update own discount
router.put(
  "/:id",
  protect,
  authorize("BUSINESS", "ADMIN"),
  ctrl.updateDiscount,
);

// DELETE /api/discounts/:id — delete own discount
router.delete(
  "/:id",
  protect,
  authorize("BUSINESS", "ADMIN"),
  ctrl.deleteDiscount,
);

// GET /api/discounts/my/offers — business sees only their own offers
router.get("/my/offers", protect, authorize("BUSINESS"), ctrl.getMyOffers);

module.exports = router;
