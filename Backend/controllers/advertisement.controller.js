const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const { uploadToCloudinary } = require("../middlewares/upload.middleware");

// Public: get active ads for a placement
exports.getActiveAds = asyncHandler(async (req, res) => {
  const { placement, position } = req.query;
  const now = new Date();

  const ads = await prisma.advertisement.findMany({
    where: {
      status: "ACTIVE",
      ...(placement && { placement }),
      ...(position && { position }),
    },
    include: { business: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Filter by start and end dates in JS memory to bypass MongoDB $expr query bugs with null/missing fields
  const activeAds = ads.filter((ad) => {
    const startOk = !ad.startDate || new Date(ad.startDate) <= now;
    const endOk = !ad.endDate || new Date(ad.endDate) >= now;
    return startOk && endOk;
  });

  // Rotate: return all active ads for frontend-driven rotation
  const shuffled = activeAds.sort(() => Math.random() - 0.5);
  return ApiResponse.success(res, shuffled);
});

// GET /api/advertisements/prices — Get all banner prices
exports.getBannerPrices = asyncHandler(async (req, res) => {
  const prices = await prisma.bannerPrice.findMany();
  return ApiResponse.success(res, prices);
});

// PUT /api/advertisements/prices — Admin: update banner prices
exports.updateBannerPrices = asyncHandler(async (req, res) => {
  const { position, daily, weekly, monthly } = req.body;
  if (!position || daily === undefined || weekly === undefined || monthly === undefined) {
    throw ApiError.badRequest("position, daily, weekly, and monthly rates are required");
  }

  const updatedPrice = await prisma.bannerPrice.upsert({
    where: { position },
    update: {
      daily: parseFloat(daily),
      weekly: parseFloat(weekly),
      monthly: parseFloat(monthly),
    },
    create: {
      position,
      daily: parseFloat(daily),
      weekly: parseFloat(weekly),
      monthly: parseFloat(monthly),
    },
  });

  return ApiResponse.success(res, updatedPrice, "Banner pricing updated successfully");
});

// Track ad click
exports.trackAdClick = asyncHandler(async (req, res) => {
  await prisma.advertisement.update({
    where: { id: req.params.id },
    data: { clicks: { increment: 1 } },
  });
  return ApiResponse.success(res, {});
});

// Business: create ad with file upload (legacy)
exports.createAd = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("Ad image is required");

  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business?.isApproved)
    throw ApiError.forbidden("Business must be approved to create ads");

  const result = await uploadToCloudinary(req.file.buffer, "advertisements");

  const { title, linkUrl, placement, position, startDate, endDate } = req.body;
  // BUG 2 FIX: schema fields are "image" and "position" (not "imageUrl"/"placement")
  const adPosition = position || placement || "top";
  const ad = await prisma.advertisement.create({
    data: {
      businessId: business.id,
      title,
      image: result.secure_url,      // schema field is "image", not "imageUrl"
      link: linkUrl || null,          // schema field is "link", not "linkUrl"
      position: adPosition,           // schema field is "position", not "placement"
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
});

// Admin: manage ads / update ad status
exports.updateAdStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const ad = await prisma.advertisement.update({
    where: { id: req.params.id },
    data: { status },
  });
  return ApiResponse.success(res, ad, "Ad status updated");
});

// Admin: get pending advertisements for approval
exports.getPendingAds = asyncHandler(async (req, res) => {
  const pendingAds = await prisma.advertisement.findMany({
    where: { status: "PENDING" },
    include: {
      business: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return ApiResponse.success(res, pendingAds);
});

// Admin: debug — get all advertisements (for testing)
exports.getAllAds = asyncHandler(async (req, res) => {
  const allAds = await prisma.advertisement.findMany({
    include: {
      business: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  console.log("[DEBUG] Total ads in database:", allAds.length);
  console.log("[DEBUG] All ads:", allAds);
  return ApiResponse.success(res, allAds);
});

// Admin: debug — manually create a test banner (for debugging)
exports.createTestBanner = asyncHandler(async (req, res) => {
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
});

// Admin: debug — get all businesses for testing
exports.getAllBusinessesForDebug = asyncHandler(async (req, res) => {
  const allBusinesses = await prisma.business.findMany({
    select: { id: true, name: true, email: true, isApproved: true },
    orderBy: { createdAt: "desc" },
  });
  console.log("[DEBUG] Total businesses:", allBusinesses.length);
  return ApiResponse.success(res, allBusinesses);
});

// Business: get own advertisements
exports.getMyBanners = asyncHandler(async (req, res) => {
  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business) throw ApiError.notFound("Business profile not found");

  const ads = await prisma.advertisement.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
  });
  return ApiResponse.success(res, ads);
});
