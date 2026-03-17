// offer.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/offer.controller");
const {
  protect,
  authorize,
  optionalAuth,
} = require("../middlewares/auth.middleware");

// Public routes
router.get("/by-category/:categoryId", ctrl.getOffersByCategory);
router.get("/:businessId", optionalAuth, ctrl.getBusinessOffers);

// Business authenticated routes
router.post("/", protect, authorize("BUSINESS"), ctrl.createOffer);
router.put("/:id", protect, authorize("BUSINESS"), ctrl.updateOffer);
router.delete("/:id", protect, authorize("BUSINESS"), ctrl.deleteOffer);

module.exports = router;
