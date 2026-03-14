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
    const { placement } = req.query;
    const now = new Date();

    const ads = await prisma.advertisement.findMany({
      where: {
        status: "ACTIVE",
        ...(placement && { placement }),
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

// Business: create ad
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
      },
    });

    return ApiResponse.created(res, ad, "Advertisement created");
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

module.exports = router;
