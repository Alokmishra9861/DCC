const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const { createNotification } = require("../services/notification.service");

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

const normalizeOfferType = (type) => {
  if (!type) return "DISCOUNT";
  const upper = type.toUpperCase().trim();
  if (upper === "DISCOUNT" || upper === "STANDARD DISCOUNT") {
    return "DISCOUNT";
  }
  if (upper === "VALUE_ADDED_CERTIFICATE" || upper === "VALUE ADDED CERTIFICATE") {
    return "VALUE_ADDED_CERTIFICATE";
  }
  if (upper === "PREPAID_CERTIFICATE" || upper === "PREPAID CERTIFICATE") {
    return "PREPAID_CERTIFICATE";
  }
  if (upper.includes("VALUE") && upper.includes("CERTIFICATE")) {
    return "VALUE_ADDED_CERTIFICATE";
  }
  if (upper.includes("PREPAID")) {
    return "PREPAID_CERTIFICATE";
  }
  if (upper.includes("DISCOUNT")) {
    return "DISCOUNT";
  }
  return "DISCOUNT";
};

const getProfileAndField = async (userId, role) => {
  let profile = null;
  let field = "";
  let idField = "id";

  if (role === "BUSINESS") {
    profile = await prisma.business.findUnique({
      where: { userId },
      include: { category: true },
    });
    field = "businessId";
  } else if (role === "EMPLOYER") {
    profile = await prisma.employer.findUnique({
      where: { userId },
    });
    field = "employerId";
  } else if (role === "ASSOCIATION") {
    profile = await prisma.association.findUnique({
      where: { userId },
    });
    field = "associationId";
  } else if (role === "B2B") {
    profile = await prisma.b2BPartner.findUnique({
      where: { userId },
    });
    field = "b2bPartnerId";
  }

  return { profile, field, idField };
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
    categoryId,
  } = req.body;

  // Validate required fields
  if (!title || !description) {
    throw ApiError.badRequest("Title and description are required");
  }

  const { profile, field } = await getProfileAndField(req.user.id, req.user.role);
  if (!profile) throw ApiError.notFound(`${req.user.role} profile not found`);

  // Check approval
  const isApproved = profile.isApproved || profile.status === "APPROVED";
  if (!isApproved) {
    throw ApiError.forbidden(`${req.user.role} must be approved to create offers`);
  }

  // Ensure category is selected if business
  if (req.user.role === "BUSINESS" && (!profile.categoryId || !profile.category)) {
    throw ApiError.badRequest(
      "Business must have a category selected before creating offers",
    );
  }

  const offerData = {
    title,
    description,
    imageUrl,
    type: normalizeOfferType(type),
    discountValue: parseOptionalNumber(discountValue),
    minSpend: parseOptionalNumber(minSpend),
    expiryDate: parseOptionalDate(expiryDate),
    categoryId: categoryId || profile.categoryId || null,
  };
  offerData[field] = profile.id;

  const offer = await prisma.offer.create({
    data: offerData,
    include: {
      business: { include: { category: true } },
      employer: true,
      association: true,
      b2bPartner: true,
      category: true,
    },
  });

  // Trigger Notifications
  try {
    // 1. Notify the Owner
    await createNotification(
      profile.userId,
      "New Offer Created! 📢",
      `Your offer "${title}" is now active in the directory.`,
      "INFO"
    );

    // 2. Notify all Admin Users
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
    });
    const ownerName = profile.name || profile.companyName || "Organization";
    for (const admin of admins) {
      await createNotification(
        admin.id,
        "New Offer Created! 📢",
        `Organization "${ownerName}" created a new offer: "${title}".`,
        "SYSTEM"
      );
    }
  } catch (err) {
    console.error("Failed to send offer creation notifications:", err.message);
  }

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
    categoryId,
  } = req.body;

  const { profile, field } = await getProfileAndField(req.user.id, req.user.role);
  if (!profile) throw ApiError.notFound(`${req.user.role} profile not found`);

  const whereClause = { id };
  whereClause[field] = profile.id;

  const offer = await prisma.offer.findFirst({
    where: whereClause,
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
      categoryId: categoryId !== undefined ? (categoryId || null) : undefined,
    },
    include: {
      business: { include: { category: true } },
      employer: true,
      association: true,
      b2bPartner: true,
      category: true,
    },
  });

  return ApiResponse.success(res, updated, "Offer updated successfully");
});

// ── Delete offer ──────────────────────────────────────
exports.deleteOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { profile, field } = await getProfileAndField(req.user.id, req.user.role);
  if (!profile) throw ApiError.notFound(`${req.user.role} profile not found`);

  const whereClause = { id };
  whereClause[field] = profile.id;

  const offer = await prisma.offer.findFirst({
    where: whereClause,
  });
  if (!offer) throw ApiError.notFound("Offer not found");

  await prisma.offer.delete({ where: { id } });
  return ApiResponse.success(res, {}, "Offer deleted");
});

// ── List offers for a business (public) ───────────────
// ✨ Only MEMBER, ADMIN, or business owner can see offers
exports.getBusinessOffers = asyncHandler(async (req, res) => {
  const { businessId } = req.params;

  let entity = null;
  let type = "";
  let queryField = "";

  // 1. Try Business
  entity = await prisma.business.findUnique({
    where: { id: businessId },
    include: { category: true },
  });
  if (entity) {
    type = "BUSINESS";
    queryField = "businessId";
  } else {
    // 2. Try Employer
    entity = await prisma.employer.findUnique({
      where: { id: businessId },
    });
    if (entity) {
      type = "EMPLOYER";
      queryField = "employerId";
    } else {
      // 3. Try Association
      entity = await prisma.association.findUnique({
        where: { id: businessId },
      });
      if (entity) {
        type = "ASSOCIATION";
        queryField = "associationId";
      } else {
        // 4. Try B2BPartner
        entity = await prisma.b2BPartner.findUnique({
          where: { id: businessId },
        });
        if (entity) {
          type = "B2B";
          queryField = "b2bPartnerId";
        }
      }
    }
  }

  if (!entity) throw ApiError.notFound("Profile not found");

  // ✨ Check authorization: only MEMBER, ADMIN, or owner can see offers
  const isOwner = req.user?.id && entity.userId === req.user.id;
  const canViewOffers =
    req.user?.role === "MEMBER" ||
    req.user?.role === "ADMIN" ||
    isOwner;

  if (!canViewOffers) {
    throw ApiError.forbidden(
      "Only members can view business offers. Business users can only view their own offers.",
    );
  }

  const whereClause = {
    isActive: true,
  };
  whereClause[queryField] = businessId;

  // Additional approval checks per entity type
  if (type === "BUSINESS") {
    whereClause.business = { isApproved: true, status: "APPROVED" };
  } else if (type === "EMPLOYER") {
    whereClause.employer = { isApproved: true, status: "APPROVED" };
  } else if (type === "ASSOCIATION") {
    whereClause.association = { isApproved: true, status: "APPROVED" };
  } else if (type === "B2B") {
    whereClause.b2bPartner = { isApproved: true };
  }

  const offers = await prisma.offer.findMany({
    where: whereClause,
    include: {
      business: { include: { category: true } },
      employer: true,
      association: true,
      b2bPartner: true,
      category: true,
      certificates: { where: { status: "AVAILABLE" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const responseData = {
    offers,
    offerCount: offers.length,
    entity: {
      id: entity.id,
      name: entity.name || entity.companyName || "",
      type,
      category: entity.category || null,
    },
  };

  // Keep business property for backward compatibility if it's a BUSINESS
  if (type === "BUSINESS") {
    responseData.business = {
      id: entity.id,
      name: entity.name,
      category: entity.category,
    };
  }

  return ApiResponse.success(
    res,
    responseData,
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
      status: "APPROVED",
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
