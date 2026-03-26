const express = require("express");
const router = express.Router();
const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const {
  protect,
  authorize,
  optionalAuth,
} = require("../middlewares/auth.middleware");
const { uploadToCloudinary } = require("../middlewares/upload.middleware");
const { upload } = require("../middlewares/upload.middleware");

// Public: get active ads for a placement
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { placement, position } = req.query;
    const now = new Date();

    const ads = await prisma.advertisement.findMany({
      where: {
        status: "ACTIVE",
        ...(placement && { placement }),
        ...(position && { position }),
        OR: [{ startDate: null }, { startDate: { lte: now } }],
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
      },
      include: { business: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Rotate: pick random subset for display
    const shuffled = ads.sort(() => Math.random() - 0.5);
    return ApiResponse.success(res, shuffled.slice(0, 5));
  }),
);

// Track ad click
router.post(
  "/:id/click",
  asyncHandler(async (req, res) => {
    await prisma.advertisement.update({
      where: { id: req.params.id },
      data: { clicks: { increment: 1 } },
    });
    return ApiResponse.success(res, {});
  }),
);

// Business: create ad with file upload (legacy)
router.post(
  "/",
  protect,
  authorize("BUSINESS"),
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("Ad image is required");

    const business = await prisma.business.findUnique({
      where: { userId: req.user.id },
    });
    if (!business?.isApproved)
      throw ApiError.forbidden("Business must be approved to create ads");

    const result = await uploadToCloudinary(req.file.buffer, "advertisements");

    const { title, linkUrl, placement, startDate, endDate } = req.body;
    const ad = await prisma.advertisement.create({
      data: {
        businessId: business.id,
        title,
        imageUrl: result.secure_url,
        linkUrl,
        placement: placement || "header",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: "PENDING", // New banners need admin approval
      },
    });

    return ApiResponse.created(
      res,
      ad,
      "Advertisement created and pending approval",
    );
  }),
);

// Admin: manage ads
router.patch(
  "/:id/status",
  protect,
  authorize("ADMIN"),
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const ad = await prisma.advertisement.update({
      where: { id: req.params.id },
      data: { status },
    });
    return ApiResponse.success(res, ad, "Ad status updated");
  }),
);

// Admin: get pending advertisements for approval
router.get(
  "/admin/pending",
  protect,
  authorize("ADMIN"),
  asyncHandler(async (req, res) => {
    const pendingAds = await prisma.advertisement.findMany({
      where: { status: "PENDING" },
      include: {
        business: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return ApiResponse.success(res, pendingAds);
  }),
);

// Admin: debug — get all advertisements (for testing)
router.get(
  "/admin/all",
  protect,
  authorize("ADMIN"),
  asyncHandler(async (req, res) => {
    const allAds = await prisma.advertisement.findMany({
      include: {
        business: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    console.log("[DEBUG] Total ads in database:", allAds.length);
    console.log("[DEBUG] All ads:", allAds);
    return ApiResponse.success(res, allAds);
  }),
);

// Admin: debug — manually create a test banner (for debugging)
router.post(
  "/admin/test-create",
  protect,
  authorize("ADMIN"),
  asyncHandler(async (req, res) => {
    const { businessId, title, image, position, duration } = req.body;

    if (!businessId || !title || !image || !position) {
      throw ApiError.badRequest(
        "businessId, title, image, and position are required",
      );
    }

    console.log("[TEST-CREATE] Creating test banner with:", {
      businessId,
      title,
      image,
      position,
      duration,
    });

    const testBanner = await prisma.advertisement.create({
      data: {
        businessId,
        title,
        image,
        link: null,
        position,
        status: "PENDING",
        startDate: new Date(),
        duration: duration || "monthly",
        paymentStatus: "TEST",
        stripeSessionId: "test_session",
        stripePaymentId: "test_payment",
        pricePaid: 0,
      },
    });

    console.log("[TEST-CREATE] Test banner created:", testBanner);
    return ApiResponse.success(res, testBanner, "Test banner created");
  }),
);

// Admin: debug — get all businesses for testing
router.get(
  "/admin/businesses-list",
  protect,
  authorize("ADMIN"),
  asyncHandler(async (req, res) => {
    const allBusinesses = await prisma.business.findMany({
      select: { id: true, name: true, email: true, isApproved: true },
      orderBy: { createdAt: "desc" },
    });
    console.log("[DEBUG] Total businesses:", allBusinesses.length);
    return ApiResponse.success(res, allBusinesses);
  }),
);

module.exports = router;
