const { prisma } = require("../config/db");
const { ApiResponse } = require("../utils/ApiResponse");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../middlewares/errorhandler");

// ── Helper: check active membership ──────────────────────────────────────────
const getMemberWithMembership = async (userId) => {
  return prisma.member.findUnique({
    where: { userId },
    include: { membership: true },
  });
};

// ── GET /api/discounts ────────────────────────────────────────────────────────
// All active DISCOUNT-type offers — visible to MEMBER and ADMIN only.
// BUSINESS users see an empty list on browse (prevents seeing competitors)
// canRedeem flag tells the frontend whether to show "Redeem" or "Join Now".
exports.getAllDiscounts = asyncHandler(async (req, res) => {
  // BUSINESS users see an empty browse list; they manage their own in /my/offers
  if (req.user?.role === "BUSINESS") {
    return res.status(200).json({
      success: true,
      data: [],
      canRedeem: false,
      membershipStatus: null,
      pagination: {
        total: 0,
        page: 1,
        limit: parseInt(req.query.limit || 20),
        pages: 0,
      },
    });
  }

  const { category, businessId, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    type: "DISCOUNT",
    isActive: true,
    business: {
      isApproved: true,
      status: "APPROVED",
    },
    ...(businessId && { businessId }),
    ...(category && { business: { category } }),
  };

  const [offers, total] = await Promise.all([
    prisma.offer.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        business: {
          select: {
            id: true,
            name: true,
            category: true,
            district: true,
            logoUrl: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.offer.count({ where }),
  ]);

  // Determine if this user can redeem
  // Only MEMBER role with an ACTIVE membership can redeem
  let membershipStatus = null;
  let canRedeem = false;

  if (req.user?.role === "MEMBER") {
    const member = await getMemberWithMembership(req.user.id);
    membershipStatus = member?.membership?.status ?? null;
    canRedeem = membershipStatus === "ACTIVE";
  }

  return res.status(200).json({
    success: true,
    data: offers,
    // Frontend logic:
    //   canRedeem === true  → show "Redeem" button
    //   canRedeem === false && role === MEMBER → show "Join Now to Redeem" → /membership
    //   canRedeem === false && role !== MEMBER → hide redeem entirely (not their feature)
    canRedeem,
    membershipStatus,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// ── GET /api/discounts/:id ────────────────────────────────────────────────────
// View individual discount details
// BUSINESS users cannot view other businesses' discounts
exports.getDiscountById = asyncHandler(async (req, res) => {
  const offer = await prisma.offer.findFirst({
    where: {
      id: req.params.id,
      type: "DISCOUNT",
      business: {
        isApproved: true,
        status: "APPROVED",
      },
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          category: true,
          phone: true,
          email: true,
          address: true,
          district: true,
          logoUrl: true,
          website: true,
        },
      },
    },
  });

  if (!offer) throw ApiError.notFound("Discount not found");

  // BUSINESS users can only view their own discounts, not competitors
  if (req.user?.role === "BUSINESS") {
    const userBusiness = await prisma.business.findUnique({
      where: { userId: req.user.id },
    });
    if (!userBusiness || offer.businessId !== userBusiness.id) {
      throw ApiError.forbidden("You can only view your own discounts");
    }
  }

  return res.status(200).json({ success: true, data: offer });
});

// ── GET /api/discounts/my/offers ──────────────────────────────────────────────
// Business sees only their own offers (all types)
exports.getMyOffers = asyncHandler(async (req, res) => {
  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business) throw ApiError.notFound("Business profile not found");

  const { type, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    businessId: business.id,
    ...(type && { type }),
  };

  const [offers, total] = await Promise.all([
    prisma.offer.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        _count: { select: { certificates: true, transactions: true } },
        business: {
          select: {
            id: true,
            name: true,
            category: true,
            district: true,
            logoUrl: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.offer.count({ where }),
  ]);

  return res.status(200).json({
    success: true,
    data: offers,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// ── POST /api/discounts ───────────────────────────────────────────────────────
// Business creates a new offer
exports.createDiscount = asyncHandler(async (req, res) => {
  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business) throw ApiError.notFound("Business profile not found");
  const isApproved = business.isApproved || business.status === "APPROVED";
  if (!isApproved) {
    throw ApiError.forbidden(
      "Your business must be approved before creating offers",
    );
  }

  const {
    type = "DISCOUNT",
    title,
    description,
    imageUrl,
    discountValue,
    minSpend,
    expiryDate,
  } = req.body;

  if (!title) throw ApiError.badRequest("Title is required");

  const validTypes = [
    "DISCOUNT",
    "VALUE_ADDED_CERTIFICATE",
    "PREPAID_CERTIFICATE",
  ];
  if (!validTypes.includes(type)) {
    throw ApiError.badRequest(`type must be one of: ${validTypes.join(", ")}`);
  }

  const offer = await prisma.offer.create({
    data: {
      businessId: business.id,
      type,
      title,
      description,
      imageUrl,
      discountValue: discountValue ? parseFloat(discountValue) : null,
      minSpend: minSpend ? parseFloat(minSpend) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isActive: true,
    },
    include: {
      business: { select: { id: true, name: true, logoUrl: true } },
    },
  });

  return res.status(201).json({
    success: true,
    data: offer,
    message: "Offer created successfully",
  });
});

// ── PUT /api/discounts/:id ────────────────────────────────────────────────────
exports.updateDiscount = asyncHandler(async (req, res) => {
  const offer = await prisma.offer.findUnique({ where: { id: req.params.id } });
  if (!offer) throw ApiError.notFound("Offer not found");

  // If not admin, ensure business owns this offer
  if (req.user.role !== "ADMIN") {
    const business = await prisma.business.findUnique({
      where: { userId: req.user.id },
    });
    if (!business || offer.businessId !== business.id) {
      throw ApiError.forbidden("Not authorized to update this offer");
    }
  }

  const {
    title,
    description,
    imageUrl,
    discountValue,
    minSpend,
    expiryDate,
    isActive,
  } = req.body;

  const updated = await prisma.offer.update({
    where: { id: req.params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(discountValue !== undefined && {
        discountValue: parseFloat(discountValue),
      }),
      ...(minSpend !== undefined && { minSpend: parseFloat(minSpend) }),
      ...(expiryDate !== undefined && {
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      }),
      ...(isActive !== undefined && { isActive }),
    },
    include: {
      business: { select: { id: true, name: true, logoUrl: true } },
    },
  });

  return res
    .status(200)
    .json({ success: true, data: updated, message: "Offer updated" });
});

// ── POST /api/discounts/:id/redeem-attempt ────────────────────────────────────
// Called when any user clicks the Redeem button.
// Returns whether they can proceed or need to see the upgrade modal.
// The frontend never has to guess — it just reads the response.
exports.redeemAttempt = asyncHandler(async (req, res) => {
  const offer = await prisma.offer.findFirst({
    where: { id: req.params.id, type: "DISCOUNT", isActive: true },
    include: {
      business: { select: { id: true, name: true, logoUrl: true } },
    },
  });
  if (!offer) throw ApiError.notFound("Discount not found");

  // Non-member roles (business, employer etc.) cannot redeem member discounts
  if (req.user.role !== "MEMBER") {
    return res.status(403).json({
      success: false,
      canRedeem: false,
      reason: "NOT_A_MEMBER",
      // Frontend: don't show modal, just ignore — redeem button shouldn't
      // appear for non-members anyway
    });
  }

  const member = await getMemberWithMembership(req.user.id);
  const membershipStatus = member?.membership?.status ?? null;
  const canRedeem = membershipStatus === "ACTIVE";

  if (!canRedeem) {
    // Frontend reads showUpgradeModal: true → opens the membership upgrade modal
    return res.status(200).json({
      success: false,
      canRedeem: false,
      reason: "NO_ACTIVE_MEMBERSHIP",
      membershipStatus,
      showUpgradeModal: true, // ← frontend triggers modal on this flag
      modalData: {
        title: "Upgrade to Redeem",
        message: "You need an active DCC membership to redeem this offer.",
        offer: {
          id: offer.id,
          title: offer.title,
          discountValue: offer.discountValue,
          businessName: offer.business.name,
          businessLogo: offer.business.logoUrl,
        },
        ctaText: "Get Membership",
        ctaLink: "/membership",
      },
    });
  }

  // Member is active — they can proceed to the actual redemption flow
  return res.status(200).json({
    success: true,
    canRedeem: true,
    membershipStatus,
    offer: {
      id: offer.id,
      title: offer.title,
      discountValue: offer.discountValue,
      business: offer.business,
    },
  });
});

exports.deleteDiscount = asyncHandler(async (req, res) => {
  const offer = await prisma.offer.findUnique({ where: { id: req.params.id } });
  if (!offer) throw ApiError.notFound("Offer not found");

  if (req.user.role !== "ADMIN") {
    const business = await prisma.business.findUnique({
      where: { userId: req.user.id },
    });
    if (!business || offer.businessId !== business.id) {
      throw ApiError.forbidden("Not authorized to delete this offer");
    }
  }

  // Soft delete — just deactivate so existing certificates/transactions stay intact
  await prisma.offer.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });

  return res.status(200).json({ success: true, message: "Offer deactivated" });
});
