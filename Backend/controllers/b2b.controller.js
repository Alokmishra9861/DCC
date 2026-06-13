// Backend/controllers/b2b.controller.js
// Handles all B2B partner CRUD operations.
// B2B partners are service businesses (marketing agencies, office suppliers,
// logistics, professional services) that appear in the B2B Partner Directory.

const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");

// ── GET /api/b2b/profile ──────────────────────────────────────────────────────
// Returns the authenticated B2B partner's own profile
exports.getProfile = asyncHandler(async (req, res) => {
  const b2b = await prisma.b2BPartner.findUnique({
    where: { userId: req.user.id },
    include: { user: { select: { email: true, createdAt: true } } },
  });
  if (!b2b) throw ApiError.notFound("B2B partner profile not found");

  return ApiResponse.success(res, {
    id: b2b.id,
    companyName: b2b.companyName,
    servicesOffered: b2b.servicesOffered,
    phone: b2b.phone,
    email: b2b.email,
    logoUrl: b2b.logoUrl,
    coverBannerUrl: b2b.coverBannerUrl,
    website: b2b.website,
    isApproved: b2b.isApproved,
    userEmail: b2b.user.email,
    memberSince: b2b.user.createdAt,
  });
});

// ── PUT /api/b2b/profile ──────────────────────────────────────────────────────
// Update the authenticated B2B partner's profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const {
    companyName,
    servicesOffered,
    phone,
    email,
    website,
    logoUrl,
    coverBannerUrl,
    imageUrls,
    documentUrls,
    address,
    addressLine1,
    addressLine2,
    landmark,
    country,
    description,
    socialLinks,
    workingHours
  } = req.body;

  if (!companyName?.trim())
    throw ApiError.badRequest("Company name is required");
  if (!servicesOffered?.trim())
    throw ApiError.badRequest("Services description is required");

  const b2b = await prisma.b2BPartner.findUnique({
    where: { userId: req.user.id },
  });
  if (!b2b) throw ApiError.notFound("B2B partner profile not found");

  const updated = await prisma.b2BPartner.update({
    where: { userId: req.user.id },
    data: {
      companyName: companyName.trim(),
      servicesOffered: servicesOffered.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      website: website?.trim() || null,
      logoUrl: logoUrl?.trim() || null,
      coverBannerUrl: coverBannerUrl?.trim() || null,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : undefined,
      documentUrls: Array.isArray(documentUrls) ? documentUrls : undefined,
      address: address?.trim() || null,
      addressLine1: addressLine1?.trim() || null,
      addressLine2: addressLine2?.trim() || null,
      landmark: landmark?.trim() || null,
      country: country?.trim() || "Cayman Islands",
      description: description?.trim() || null,
      socialLinks: typeof socialLinks === "object" ? JSON.stringify(socialLinks) : socialLinks,
      workingHours: typeof workingHours === "object" ? JSON.stringify(workingHours) : workingHours,
    },
  });

  return ApiResponse.success(res, updated, "Profile updated successfully");
});

// ── GET /api/b2b/stats ────────────────────────────────────────────────────────
// Dashboard stats for the B2B partner
exports.getStats = asyncHandler(async (req, res) => {
  const b2b = await prisma.b2BPartner.findUnique({
    where: { userId: req.user.id },
  });
  if (!b2b) throw ApiError.notFound("B2B partner profile not found");

  // Count enquiries from contact form (uses ContactInquiry model with type="b2b")
  const [totalEnquiries, newEnquiries] = await Promise.all([
    prisma.contactInquiry.count({
      where: { type: "b2b", subject: { contains: b2b.id } },
    }),
    prisma.contactInquiry.count({
      where: { type: "b2b", subject: { contains: b2b.id }, status: "pending" },
    }),
  ]);

  return ApiResponse.success(res, {
    profileViews: 0, // Extend later with a views tracking model
    enquiries: totalEnquiries,
    newEnquiries,
    rank: null, // Extend later with ranking logic
    category: "B2B Partner",
    isApproved: b2b.isApproved,
  });
});

// ── GET /api/b2b/enquiries ────────────────────────────────────────────────────
// Enquiries submitted to this B2B partner via the directory
exports.getEnquiries = asyncHandler(async (req, res) => {
  const b2b = await prisma.b2BPartner.findUnique({
    where: { userId: req.user.id },
  });
  if (!b2b) throw ApiError.notFound("B2B partner profile not found");

  // Enquiries are stored in ContactInquiry with type="b2b" and subject containing b2b.id
  const enquiries = await prisma.contactInquiry.findMany({
    where: { type: "b2b", subject: { contains: b2b.id } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return ApiResponse.success(res, enquiries);
});

// ── GET /api/b2b/directory  (PUBLIC) ─────────────────────────────────────────
// Public directory listing — B2B partners, employers, and associations
exports.getDirectory = asyncHandler(async (req, res) => {
  const { type = "partners", search, limit = 20, page = 1 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  let partners = [];
  let total = 0;

  if (type === "employers") {
    const where = {
      status: "APPROVED",
      ...(search && {
        OR: [
          { companyName: { contains: search, mode: "insensitive" } },
          { industry: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [rawEmployers, count] = await Promise.all([
      prisma.employer.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { companyName: "asc" },
      }),
      prisma.employer.count({ where }),
    ]);

    total = count;
    partners = rawEmployers.map((emp) => ({
      id: emp.id,
      companyName: emp.companyName,
      servicesOffered: emp.industry || "Employer",
      phone: emp.phone,
      email: emp.email,
      logoUrl: emp.logoUrl,
      website: emp.website,
      coverBannerUrl: emp.coverBannerUrl,
      description: emp.description,
      type: "employer",
    }));
  } else if (type === "associations") {
    const where = {
      status: "APPROVED",
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { orgType: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [rawAssociations, count] = await Promise.all([
      prisma.association.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { name: "asc" },
      }),
      prisma.association.count({ where }),
    ]);

    total = count;
    partners = rawAssociations.map((assoc) => ({
      id: assoc.id,
      companyName: assoc.name,
      servicesOffered: assoc.orgType || "Association",
      phone: assoc.phone,
      email: assoc.email,
      logoUrl: assoc.logoUrl,
      website: assoc.website,
      coverBannerUrl: assoc.coverBannerUrl,
      description: assoc.description,
      type: "association",
    }));
  } else {
    // Default: B2B Partners
    const where = {
      isApproved: true,
      ...(search && {
        OR: [
          { companyName: { contains: search, mode: "insensitive" } },
          { servicesOffered: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [rawPartners, count] = await Promise.all([
      prisma.b2BPartner.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { companyName: "asc" },
      }),
      prisma.b2BPartner.count({ where }),
    ]);

    total = count;
    partners = rawPartners.map((p) => ({
      id: p.id,
      companyName: p.companyName,
      servicesOffered: p.servicesOffered,
      phone: p.phone,
      email: p.email,
      logoUrl: p.logoUrl,
      website: p.website,
      coverBannerUrl: p.coverBannerUrl,
      description: p.description,
      type: "partner",
    }));
  }

  return ApiResponse.success(res, {
    partners,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// ── POST /api/b2b/enquire/:partnerId  (AUTH — MEMBER/EMPLOYER/ASSOCIATION) ────
// Submit an enquiry to a B2B partner, employer, or association from the directory
exports.submitEnquiry = asyncHandler(async (req, res) => {
  const { partnerId } = req.params;
  const { name, email, phone, subject, message } = req.body;

  if (!message?.trim()) throw ApiError.badRequest("Message is required");

  let entity = await prisma.b2BPartner.findUnique({
    where: { id: partnerId },
  });
  let typeLabel = "b2b";

  if (!entity) {
    entity = await prisma.employer.findUnique({
      where: { id: partnerId },
    });
    typeLabel = "employer";
  }

  if (!entity) {
    entity = await prisma.association.findUnique({
      where: { id: partnerId },
    });
    typeLabel = "association";
  }

  if (!entity) {
    throw ApiError.notFound("B2B partner, employer, or association not found");
  }

  const isApproved = entity.isApproved || entity.status === "APPROVED";
  if (!isApproved) {
    throw ApiError.badRequest("This profile is not yet active");
  }

  // Store enquiry in ContactInquiry — subject encodes the partnerId for lookup
  const inquiry = await prisma.contactInquiry.create({
    data: {
      name: name || req.user?.name || "DCC Member",
      email: email || req.user?.email || "",
      phone: phone || null,
      subject: `${typeLabel}:${partnerId}:${subject || "General Enquiry"}`,
      message: message.trim(),
      type: "b2b",
      status: "pending",
    },
  });

  return ApiResponse.success(
    res,
    { id: inquiry.id },
    "Enquiry sent successfully",
  );
});
