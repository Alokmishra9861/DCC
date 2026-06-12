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

  let profile = null;
  let type = "";

  // 1. Try Business
  profile = await prisma.business.findFirst({
    where: { OR: [{ id }, { userId: id }] },
    include: {
      category: true,
      offers: {
        where: { isActive: true },
        include: { certificates: { where: { status: "AVAILABLE" } } },
      },
    },
  });

  if (profile) {
    type = "BUSINESS";
  } else {
    // 2. Try Employer
    profile = await prisma.employer.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      include: {
        offers: {
          where: { isActive: true },
          include: { certificates: { where: { status: "AVAILABLE" } } },
        },
      },
    });
    if (profile) {
      type = "EMPLOYER";
    } else {
      // 3. Try Association
      profile = await prisma.association.findFirst({
        where: { OR: [{ id }, { userId: id }] },
        include: {
          offers: {
            where: { isActive: true },
            include: { certificates: { where: { status: "AVAILABLE" } } },
          },
        },
      });
      if (profile) {
        type = "ASSOCIATION";
      } else {
        // 4. Try B2B Partner
        profile = await prisma.b2BPartner.findFirst({
          where: { OR: [{ id }, { userId: id }] },
          include: {
            offers: {
              where: { isActive: true },
              include: { certificates: { where: { status: "AVAILABLE" } } },
            },
          },
        });
        if (profile) {
          type = "B2B";
        }
      }
    }
  }

  if (!profile) throw ApiError.notFound("Profile not found");

  // Format to standard profile fields for frontend consumption
  const name = profile.name || profile.companyName || "";
  const email = profile.email || "";
  const phone = profile.phone || "";
  const logoUrl = profile.logoUrl || "";
  const website = profile.website || "";
  const description = profile.description || profile.servicesOffered || "";
  const categoryName = profile.category?.name || profile.industry || profile.orgType || profile.servicesOffered || "Organization";

  // Check authorization for viewing offers
  let offersToShow = profile.offers || [];
  const isOwner = req.user?.id && profile.userId === req.user.id;
  const canViewOffers =
    req.user?.role === "MEMBER" ||
    req.user?.role === "ADMIN" ||
    isOwner;

  if (!canViewOffers) {
    offersToShow = [];
  }

  // Views tracking placeholder
  const foreignKeyField =
    type === "BUSINESS"
      ? "businessId"
      : type === "EMPLOYER"
      ? "employerId"
      : type === "ASSOCIATION"
      ? "associationId"
      : "b2bPartnerId";

  const offerCount = await prisma.offer.count({
    where: { [foreignKeyField]: profile.id },
  });

  if (offerCount === 0) {
    try {
      await prisma.offer.create({
        data: {
          [foreignKeyField]: profile.id,
          title: "Profile Views Tracker",
          description: "Hidden system placeholder to track profile views.",
          type: "DISCOUNT",
          isActive: false,
          isSeeded: false,
          views: 0,
        },
      });
    } catch (err) {
      console.warn("⚠️ Warning creating placeholder offer:", err.message);
    }
  }

  // Increment views
  await prisma.offer.updateMany({
    where: { [foreignKeyField]: profile.id },
    data: { views: { increment: 1 } },
  });

  return ApiResponse.success(res, {
    ...profile,
    offers: offersToShow,
    profileType: type,
    name,
    email,
    phone,
    logoUrl,
    website,
    description,
    categoryName,
  });
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
      reviews: {
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      payouts: {
        orderBy: { createdAt: "desc" },
      },
      transactions: {
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { transactionDate: "desc" },
        take: 50,
      },
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
// ── Get individual business profile by ID ────────────────
exports.getBusinessProfileById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let business = await prisma.business.findUnique({
    where: { id },
    include: {
      category: true,
      offers: {
        include: { certificates: true },
        orderBy: { createdAt: "desc" },
      },
      advertisements: true,
    },
  });

  // Fall back to userId lookup if business was not found by business id directly
  if (!business) {
    business = await prisma.business.findUnique({
      where: { userId: id },
      include: {
        category: true,
        offers: {
          include: { certificates: true },
          orderBy: { createdAt: "desc" },
        },
        advertisements: true,
      },
    });
  }

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
  const {
    name,
    categoryId,
    description,
    phone,
    address,
    district,
    website,
    cuisineType,
    addressLine1,
    addressLine2,
    landmark,
    country,
    coverBannerUrl,
    socialLinks,
    videoUrl,
    workingHours,
    logoUrl,
    imageUrls,
    documentUrls
  } = req.body;

  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business) throw ApiError.notFound("Business not found");

  // If categoryId is provided and non-empty, verify it exists
  if (categoryId && categoryId.trim()) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw ApiError.notFound("Category not found");
  }

  const updated = await prisma.business.update({
    where: { id: business.id },
    data: {
      name,
      categoryId: (categoryId && categoryId.trim()) ? categoryId : undefined,
      description,
      phone,
      address,
      district,
      website,
      cuisineType,
      addressLine1,
      addressLine2,
      landmark,
      country,
      coverBannerUrl,
      socialLinks: typeof socialLinks === "object" ? JSON.stringify(socialLinks) : socialLinks,
      videoUrl,
      workingHours: typeof workingHours === "object" ? JSON.stringify(workingHours) : workingHours,
      logoUrl,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : undefined,
      documentUrls: Array.isArray(documentUrls) ? documentUrls : undefined
    },
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
