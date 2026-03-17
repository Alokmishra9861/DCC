const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const { uploadToCloudinary } = require("../middlewares/upload.middleware");
const { getPagination, buildPaginationMeta } = require("../utils/Paginate");

const buildMonthKey = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const buildRecentMonths = (count) => {
  const now = new Date();
  const months = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: buildMonthKey(d),
      label: d.toLocaleString("en-US", { month: "short" }),
      start: d,
    });
  }
  return months;
};

// ── Public: list all approved businesses ──────────────
exports.listBusinesses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { category, district, search } = req.query;

  const where = {
    status: "APPROVED",
    ...(category && { category: { slug: category } }),
    ...(district && { district }),
    ...(search && { name: { contains: search, mode: "insensitive" } }),
  };

  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where,
      select: {
        id: true,
        name: true,
        category: { select: { id: true, name: true, slug: true } },
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
// Only MEMBER and ADMIN can see offers. BUSINESS users can't see competitor offers.
exports.getBusinessProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const business = await prisma.business.findFirst({
    where: { id, status: "APPROVED" },
    include: {
      category: true,
      offers: {
        where: { isActive: true },
        include: { certificates: { where: { status: "AVAILABLE" } } },
      },
    },
  });
  if (!business) throw ApiError.notFound("Business not found");

  // ✨ Business users can't see competitor offers - only members can
  let offersToShow = business.offers;
  if (req.user?.role === "BUSINESS") {
    // Check if this is their own business
    const isOwner = await prisma.business.findFirst({
      where: { id: business.id, userId: req.user.id },
    });
    // If not owner, hide offers
    if (!isOwner) {
      offersToShow = [];
    }
  } else if (req.user?.role !== "MEMBER" && req.user?.role !== "ADMIN") {
    // Non-members and non-business users can't see offers
    offersToShow = [];
  }

  // Track view
  await prisma.offer.updateMany({
    where: { businessId: id },
    data: { views: { increment: 1 } },
  });

  return ApiResponse.success(res, { ...business, offers: offersToShow });
});

// ── Business: get own profile ─────────────────────────
exports.getMyBusiness = asyncHandler(async (req, res) => {
  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
    include: {
      category: true,
      offers: {
        include: { certificates: true },
        orderBy: { createdAt: "desc" },
      },
      advertisements: true,
    },
  });
  if (!business) throw ApiError.notFound("Business profile not found");

  const offers = business.offers || [];
  const profileViews = offers.reduce((sum, o) => sum + (o.views || 0), 0);
  const offerSaves = offers.reduce((sum, o) => sum + (o.clicks || 0), 0);

  const certificateRedemptions = await prisma.certificatePurchase.count({
    where: {
      certificate: { offer: { businessId: business.id } },
      status: "REDEEMED",
    },
  });

  const engagementRate =
    profileViews > 0
      ? Math.round(((offerSaves + certificateRedemptions) / profileViews) * 100)
      : 0;

  const months = buildRecentMonths(5);
  const startDate = months[0]?.start;
  const now = new Date();

  const [transactions, purchases, redemptions] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        businessId: business.id,
        ...(startDate && { transactionDate: { gte: startDate, lte: now } }),
      },
      select: { transactionDate: true },
    }),
    prisma.certificatePurchase.findMany({
      where: {
        certificate: { offer: { businessId: business.id } },
        ...(startDate && { createdAt: { gte: startDate, lte: now } }),
      },
      select: { purchasedAt: true, createdAt: true },
    }),
    prisma.certificatePurchase.findMany({
      where: {
        certificate: { offer: { businessId: business.id } },
        status: "REDEEMED",
        ...(startDate && { updatedAt: { gte: startDate, lte: now } }),
      },
      select: { redeemedAt: true, updatedAt: true },
    }),
  ]);

  const monthMap = new Map(
    months.map((m) => [
      m.key,
      { month: m.label, views: 0, saves: 0, redemptions: 0 },
    ]),
  );

  transactions.forEach((t) => {
    const key = buildMonthKey(t.transactionDate);
    if (monthMap.has(key)) monthMap.get(key).views += 1;
  });

  purchases.forEach((p) => {
    const key = buildMonthKey(p.purchasedAt || p.createdAt);
    if (monthMap.has(key)) monthMap.get(key).saves += 1;
  });

  redemptions.forEach((r) => {
    const key = buildMonthKey(r.redeemedAt || r.updatedAt);
    if (monthMap.has(key)) monthMap.get(key).redemptions += 1;
  });

  const performanceOverview = months
    .map((m) => monthMap.get(m.key))
    .filter(Boolean);

  return ApiResponse.success(
    res,
    {
      ...business,
      offerCount: business.offers.length,
      profileViews,
      offerSaves,
      certificateRedemptions,
      engagementRate,
      performanceOverview,
    },
    "Business profile retrieved",
  );
});

// ── Business: update profile ──────────────────────────
exports.updateBusiness = asyncHandler(async (req, res) => {
  const { name, categoryId, description, phone, address, district, website } =
    req.body;

  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business) throw ApiError.notFound("Business not found");

  // If categoryId is provided, verify it exists
  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw ApiError.notFound("Category not found");
  }

  const updated = await prisma.business.update({
    where: { id: business.id },
    data: { name, categoryId, description, phone, address, district, website },
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
