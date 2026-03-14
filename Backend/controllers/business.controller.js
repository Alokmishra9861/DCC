const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const { uploadToCloudinary } = require("../middlewares/upload.middleware");
const { getPagination, buildPaginationMeta } = require("../utils/Paginate");

// ── Public: list all approved businesses ──────────────
exports.listBusinesses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { category, district, search } = req.query;

  const where = {
    isApproved: true,
    ...(category && { category }),
    ...(district && { district }),
    ...(search && { name: { contains: search, mode: "insensitive" } }),
  };

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        district: true,
        logoUrl: true,
        imageUrls: true,
        _count: { select: { offers: true } },
      },
      skip,
      take: limit,
    }),
    prisma.business.count({ where }),
  ]);

  return ApiResponse.paginated(
    res,
    businesses,
    buildPaginationMeta(total, page, limit),
  );
});

// ── Public: get single business profile ───────────────
exports.getBusinessProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const business = await prisma.business.findFirst({
    where: { id, isApproved: true },
    include: {
      offers: {
        where: { isActive: true },
        include: { certificates: { where: { status: "AVAILABLE" } } },
      },
    },
  });
  if (!business) throw ApiError.notFound("Business not found");

  // Track view
  await prisma.offer.updateMany({
    where: { businessId: id },
    data: { views: { increment: 1 } },
  });

  return ApiResponse.success(res, business);
});

// ── Business: get own profile ─────────────────────────
exports.getMyBusiness = asyncHandler(async (req, res) => {
  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
    include: { offers: true, advertisements: true },
  });
  if (!business) throw ApiError.notFound("Business profile not found");
  return ApiResponse.success(res, business);
});

// ── Business: update profile ──────────────────────────
exports.updateBusiness = asyncHandler(async (req, res) => {
  const { name, category, description, phone, address, district, website } =
    req.body;

  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business) throw ApiError.notFound("Business not found");

  const updated = await prisma.business.update({
    where: { id: business.id },
    data: { name, category, description, phone, address, district, website },
  });

  return ApiResponse.success(res, updated, "Business profile updated");
});

// ── Business: upload logo ─────────────────────────────
exports.uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");

  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business) throw ApiError.notFound("Business not found");

  const result = await uploadToCloudinary(req.file.buffer, "business-logos");
  const updated = await prisma.business.update({
    where: { id: business.id },
    data: { logoUrl: result.secure_url },
  });

  return ApiResponse.success(
    res,
    { logoUrl: updated.logoUrl },
    "Logo uploaded",
  );
});

// ── Business: upload images ───────────────────────────
exports.uploadImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw ApiError.badRequest("No files uploaded");

  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business) throw ApiError.notFound("Business not found");

  const uploadResults = await Promise.all(
    req.files.map((f) => uploadToCloudinary(f.buffer, "business-images")),
  );
  const newUrls = uploadResults.map((r) => r.secure_url);

  const updated = await prisma.business.update({
    where: { id: business.id },
    data: { imageUrls: { push: newUrls } },
  });

  return ApiResponse.success(
    res,
    { imageUrls: updated.imageUrls },
    "Images uploaded",
  );
});

// ── Business: connect payment processor ──────────────
exports.connectPaymentProcessor = asyncHandler(async (req, res) => {
  const { stripeAccountId, paypalEmail } = req.body;

  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business) throw ApiError.notFound("Business not found");

  const updated = await prisma.business.update({
    where: { id: business.id },
    data: { stripeAccountId, paypalEmail },
  });

  return ApiResponse.success(res, {}, "Payment processor connected");
});
