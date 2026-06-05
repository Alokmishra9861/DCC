const express = require("express");
const router = express.Router();
const {
  protect,
  authorize,
  optionalAuth,
} = require("../middlewares/auth.middleware");
const { upload } = require("../middlewares/upload.middleware");
const advertisementController = require("../controllers/advertisement.controller");

// Public: get active ads for a placement
router.get(
  "/",
  optionalAuth,
  advertisementController.getActiveAds
);

// GET /api/advertisements/prices — Get all banner prices
router.get("/prices", advertisementController.getBannerPrices);

// PUT /api/advertisements/prices — Admin: update banner prices
router.put(
  "/prices",
  protect,
  authorize("ADMIN"),
  advertisementController.updateBannerPrices
);

// Track ad click
router.post("/:id/click", advertisementController.trackAdClick);

// Business: create ad with file upload (legacy)
router.post(
  "/",
  protect,
  authorize("BUSINESS"),
  upload.single("image"),
  advertisementController.createAd
);

// Admin: manage ads
router.patch(
  "/:id/status",
  protect,
  authorize("ADMIN"),
  advertisementController.updateAdStatus
);

// Admin: get pending advertisements for approval
router.get(
  "/admin/pending",
  protect,
  authorize("ADMIN"),
  advertisementController.getPendingAds
);

// Admin: debug — get all advertisements (for testing)
router.get(
  "/admin/all",
  protect,
  authorize("ADMIN"),
  advertisementController.getAllAds
);

// Admin: debug — manually create a test banner (for debugging)
router.post(
  "/admin/test-create",
  protect,
  authorize("ADMIN"),
  advertisementController.createTestBanner
);

// Admin: debug — get all businesses for testing
router.get(
  "/admin/businesses-list",
  protect,
  authorize("ADMIN"),
  advertisementController.getAllBusinessesForDebug
);

// Business: get own advertisements
router.get(
  "/my/banners",
  protect,
  authorize("BUSINESS"),
  advertisementController.getMyBanners
);

module.exports = router;
