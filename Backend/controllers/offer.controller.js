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

  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business) throw ApiError.notFound("Business not found");
  if (!business.isApproved)
    throw ApiError.forbidden("Business must be approved to create offers");

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
  });

  return ApiResponse.created(res, offer, "Offer created");
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
  });

  return ApiResponse.success(res, updated, "Offer updated");
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
exports.getBusinessOffers = asyncHandler(async (req, res) => {
  const { businessId } = req.params;
  const offers = await prisma.offer.findMany({
    where: { businessId, isActive: true },
    include: { certificates: { where: { status: "AVAILABLE" } } },
  });
  return ApiResponse.success(res, offers);
});
