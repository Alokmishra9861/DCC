const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");

const parseOptionalNumber = (value) => {
  if (value === null) return null;
  if (value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseOptionalDate = (value) => {
  if (value === null) return null;
  if (value === undefined || value === "") return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

// ── Create offer ──────────────────────────────────────
exports.createOffer = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    type,
    imageUrl,
    discountValue,
    minSpend,
    expiryDate,
  } = req.body;

  // Validate required fields
  if (!title || !description) {
    throw ApiError.badRequest("Title and description are required");
  }

  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
    include: { category: true },
  });
  if (!business) throw ApiError.notFound("Business not found");

  // Ensure business has a category selected
  if (!business.categoryId || !business.category) {
    throw ApiError.badRequest(
      "Business must have a category selected before creating offers",
    );
  }

  const isApproved = business.isApproved || business.status === "APPROVED";
  if (!isApproved) {
    throw ApiError.forbidden("Business must be approved to create offers");
  }

  const offer = await prisma.offer.create({
    data: {
      businessId: business.id,
      title,
      description,
      imageUrl,
      type,
      discountValue: parseOptionalNumber(discountValue),
      minSpend: parseOptionalNumber(minSpend),
      expiryDate: parseOptionalDate(expiryDate),
    },
    include: {
      business: {
        include: { category: true },
      },
    },
  });

  return ApiResponse.created(res, offer, "Offer created successfully");
});

// ── Update offer ──────────────────────────────────────
exports.updateOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    imageUrl,
    discountValue,
    minSpend,
    expiryDate,
    isActive,
  } = req.body;

  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business) throw ApiError.notFound("Business not found");

  const offer = await prisma.offer.findFirst({
    where: { id, businessId: business.id },
  });
  if (!offer) throw ApiError.notFound("Offer not found");

  const updated = await prisma.offer.update({
    where: { id },
    data: {
      title,
      description,
      imageUrl,
      isActive,
      discountValue: parseOptionalNumber(discountValue),
      minSpend: parseOptionalNumber(minSpend),
      expiryDate: parseOptionalDate(expiryDate),
    },
    include: {
      business: {
        include: { category: true },
      },
    },
  });

  return ApiResponse.success(res, updated, "Offer updated successfully");
});

// ── Delete offer ──────────────────────────────────────
exports.deleteOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  const offer = await prisma.offer.findFirst({
    where: { id, businessId: business.id },
  });
  if (!offer) throw ApiError.notFound("Offer not found");

  await prisma.offer.delete({ where: { id } });
  return ApiResponse.success(res, {}, "Offer deleted");
});

// ── List offers for a business (public) ───────────────
// ✨ Only MEMBER, ADMIN, or business owner can see offers
exports.getBusinessOffers = asyncHandler(async (req, res) => {
  const { businessId } = req.params;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { category: true },
  });

  if (!business) throw ApiError.notFound("Business not found");

  // ✨ Check authorization: only MEMBER, ADMIN, or business owner can see offers
  const isBusinessOwner =
    req.user?.id &&
    (await prisma.business.findFirst({
      where: { id: businessId, userId: req.user.id },
    }));

  const canViewOffers =
    req.user?.role === "MEMBER" ||
    req.user?.role === "ADMIN" ||
    isBusinessOwner;

  if (!canViewOffers) {
    throw ApiError.forbidden(
      "Only members can view business offers. Business users can only view their own offers.",
    );
  }

  const offers = await prisma.offer.findMany({
    where: { businessId, isActive: true },
    include: {
      business: {
        include: { category: true },
      },
      certificates: { where: { status: "AVAILABLE" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return ApiResponse.success(
    res,
    {
      business: {
        id: business.id,
        name: business.name,
        category: business.category,
      },
      offers,
      offerCount: offers.length,
    },
    "Business offers retrieved successfully",
  );
});

// ── Get all offers grouped by category (public) ────────
// ✨ Only MEMBER and ADMIN can view all offers. BUSINESS users see only their own.
exports.getOffersByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  // Verify category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) throw ApiError.notFound("Category not found");

  // ✨ Authorization check: Business users can't browse competitor offers
  if (req.user?.role === "BUSINESS") {
    throw ApiError.forbidden(
      "Business users cannot view all offers in a category. Members can browse all offers.",
    );
  }

  // Get all approved businesses in this category with their offers
  const businesses = await prisma.business.findMany({
    where: {
      categoryId,
      isApproved: true,
    },
    include: {
      category: true,
      offers: {
        where: { isActive: true },
        include: {
          certificates: { where: { status: "AVAILABLE" } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // Filter out businesses with no offers
  const businessesWithOffers = businesses.filter((b) => b.offers.length > 0);

  // Count total offers
  const totalOffers = businessesWithOffers.reduce(
    (sum, b) => sum + b.offers.length,
    0,
  );

  return ApiResponse.success(
    res,
    {
      category,
      businessCount: businessesWithOffers.length,
      offerCount: totalOffers,
      businesses: businessesWithOffers,
    },
    "Offers retrieved by category",
  );
});
