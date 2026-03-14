// offer.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/offer.controller");
const {
  protect,
  authorize,
  optionalAuth,
} = require("../middlewares/auth.middleware");

router.get("/:businessId", optionalAuth, ctrl.getBusinessOffers);
router.post("/", protect, authorize("BUSINESS"), ctrl.createOffer);
router.put("/:id", protect, authorize("BUSINESS"), ctrl.updateOffer);
router.delete("/:id", protect, authorize("BUSINESS"), ctrl.deleteOffer);

module.exports = router;
