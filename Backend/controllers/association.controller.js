// Backend/controllers/association.controller.js
// Handles both AssociationType.MEMBER and AssociationType.BUSINESS flows:
//
// MEMBER association:
//   - addMembers (manual one-by-one)
//   - bulkAddMembers (CSV array)
//   - generateJoinCode / members self-join via code
//   - acceptInvite (email link)
//   - joinByCode (member uses join code)
//   - resendInvite, removeMember
//   - getDashboard (member ROI stats)
//
// BUSINESS association:
//   - linkBusiness (link existing business by ID)
//   - inviteBusiness (invite new business to register under association)
//   - acceptBusinessInvite (business accepts invite)
//   - removeBusiness
//   - getLinkedBusinesses

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { prisma } = require("../config/db");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const {
  sendAssociationApprovalEmail,
  sendAssociationRejectionEmail,
  sendAssociationMemberInviteEmail,
  sendAssociationMemberWelcomeEmail,
  sendAssociationBusinessInviteEmail,
} = require("../services/association.email.service");

// ── Helpers ───────────────────────────────────────────────────────────────────
const generateToken = () => crypto.randomBytes(32).toString("hex");
const generateJoinCode = (name) => {
  const slug = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "-")
    .slice(0, 12);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${slug}-${suffix}`;
};

// ── Guard helper: load association and verify it belongs to req.user ──────────
const loadAssociation = async (userId) => {
  const assoc = await prisma.association.findUnique({ where: { userId } });
  if (!assoc) throw ApiError.notFound("Association profile not found");
  if (assoc.status !== "APPROVED")
    throw ApiError.forbidden("Your association is pending admin approval");
  return assoc;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/association/profile
// ─────────────────────────────────────────────────────────────────────────────
exports.getProfile = asyncHandler(async (req, res) => {
  const assoc = await prisma.association.findUnique({
    where: { userId: req.user.id },
    include: {
      _count: {
        select: {
          associationMembers: true,
          associationBusinesses: true,
        },
      },
    },
  });
  if (!assoc) throw ApiError.notFound("Association profile not found");
  return ApiResponse.success(res, assoc);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/association/join-code/generate
// Generate (or regenerate) the join code for a MEMBER-type association
// ─────────────────────────────────────────────────────────────────────────────
exports.generateJoinCode = asyncHandler(async (req, res) => {
  const assoc = await loadAssociation(req.user.id);
  if (assoc.associationType !== "MEMBER") {
    throw ApiError.badRequest(
      "Join codes are only available for MEMBER-type associations",
    );
  }

  const joinCode = generateJoinCode(assoc.name);
  const updated = await prisma.association.update({
    where: { id: assoc.id },
    data: { joinCode, joinCodeEnabled: true },
  });

  return ApiResponse.success(
    res,
    { joinCode: updated.joinCode },
    "Join code generated",
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/association/join-code/toggle
// Enable or disable the join code
// Body: { enabled: boolean }
// ─────────────────────────────────────────────────────────────────────────────
exports.toggleJoinCode = asyncHandler(async (req, res) => {
  const { enabled } = req.body;
  const assoc = await loadAssociation(req.user.id);

  await prisma.association.update({
    where: { id: assoc.id },
    data: { joinCodeEnabled: Boolean(enabled) },
  });

  return ApiResponse.success(
    res,
    {},
    `Join code ${enabled ? "enabled" : "disabled"}`,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/association/members
// Manually add a single member (MEMBER-type association)
// Body: { name, email }
// ─────────────────────────────────────────────────────────────────────────────
exports.addMember = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) throw ApiError.badRequest("Name and email are required");

  const assoc = await loadAssociation(req.user.id);
  if (assoc.associationType !== "MEMBER") {
    throw ApiError.badRequest("Only MEMBER-type associations can add members");
  }

  // Check duplicate
  const existing = await prisma.associationMember.findUnique({
    where: {
      associationId_email: {
        associationId: assoc.id,
        email: email.toLowerCase(),
      },
    },
  });
  if (existing) throw ApiError.conflict("This member has already been invited");

  const inviteToken = generateToken();
  const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const member = await prisma.associationMember.create({
    data: {
      associationId: assoc.id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      status: "INVITED",
      inviteToken,
      inviteExpiresAt,
      inviteSentAt: new Date(),
    },
  });

  await sendAssociationMemberInviteEmail({
    memberName: name,
    memberEmail: email,
    associationName: assoc.name,
    inviteToken,
  }).catch((err) => console.error("Member invite email failed:", err.message));

  return ApiResponse.created(res, member, "Member invited successfully");
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/association/members/bulk
// Bulk add members from CSV (MEMBER-type association)
// Body: { members: [{ name, email }] }
// ─────────────────────────────────────────────────────────────────────────────
exports.bulkAddMembers = asyncHandler(async (req, res) => {
  const { members: memberList } = req.body;
  if (!Array.isArray(memberList) || memberList.length === 0) {
    throw ApiError.badRequest(
      "members array is required and must not be empty",
    );
  }

  const assoc = await loadAssociation(req.user.id);
  if (assoc.associationType !== "MEMBER") {
    throw ApiError.badRequest(
      "Only MEMBER-type associations can bulk-add members",
    );
  }

  // Deduplicate incoming list
  const unique = [
    ...new Map(memberList.map((m) => [m.email.toLowerCase(), m])).values(),
  ];

  // Find already-invited emails
  const existingEmails = await prisma.associationMember.findMany({
    where: {
      associationId: assoc.id,
      email: { in: unique.map((m) => m.email.toLowerCase()) },
    },
    select: { email: true },
  });
  const existingSet = new Set(existingEmails.map((e) => e.email));

  const toCreate = unique.filter(
    (m) => !existingSet.has(m.email.toLowerCase()),
  );
  const skipped = unique.filter((m) => existingSet.has(m.email.toLowerCase()));

  if (toCreate.length === 0) {
    return ApiResponse.success(
      res,
      { created: 0, skipped: skipped.length },
      "All members already invited",
    );
  }

  const now = new Date();
  const inviteExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const records = toCreate.map((m) => ({
    associationId: assoc.id,
    name: m.name.trim(),
    email: m.email.toLowerCase().trim(),
    status: "INVITED",
    inviteToken: generateToken(),
    inviteExpiresAt,
    inviteSentAt: now,
  }));

  await prisma.associationMember.createMany({
    data: records,
    skipDuplicates: true,
  });

  // Fetch created records to get tokens for emails
  const created = await prisma.associationMember.findMany({
    where: {
      associationId: assoc.id,
      email: { in: toCreate.map((m) => m.email.toLowerCase()) },
    },
  });

  // Fire-and-forget invite emails
  Promise.allSettled(
    created.map((m) =>
      sendAssociationMemberInviteEmail({
        memberName: m.name,
        memberEmail: m.email,
        associationName: assoc.name,
        inviteToken: m.inviteToken,
      }),
    ),
  ).catch((err) => console.error("Bulk member invite email error:", err));

  return ApiResponse.created(
    res,
    {
      created: toCreate.length,
      skipped: skipped.length,
      skippedEmails: skipped.map((m) => m.email),
    },
    `${toCreate.length} member(s) invited successfully`,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/association/members/accept-invite/:token
// Member clicks invite link → sets password → account created + linked
// PUBLIC route — no auth required
// ─────────────────────────────────────────────────────────────────────────────
exports.acceptMemberInvite = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) throw ApiError.badRequest("Password is required");
  if (password.length < 6)
    throw ApiError.badRequest("Password must be at least 6 characters");

  const assocMember = await prisma.associationMember.findUnique({
    where: { inviteToken: token },
    include: { association: true },
  });

  if (!assocMember) throw ApiError.badRequest("Invalid or expired invite link");
  if (assocMember.status === "ACTIVE")
    throw ApiError.badRequest("Invite already accepted");
  if (assocMember.status === "REMOVED")
    throw ApiError.forbidden("This invite has been revoked");
  if (assocMember.inviteExpiresAt && assocMember.inviteExpiresAt < new Date()) {
    throw ApiError.badRequest(
      "Invite link has expired. Ask your association to resend.",
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: assocMember.email },
  });
  if (existingUser)
    throw ApiError.conflict("An account with this email already exists");

  const hashedPassword = await bcrypt.hash(password, 12);
  const nameParts = assocMember.name.trim().split(" ");
  const firstName = nameParts[0] || assocMember.name;
  const lastName = nameParts.slice(1).join(" ") || firstName;

  const now = new Date();

  const user = await prisma.user.create({
    data: {
      email: assocMember.email,
      password: hashedPassword,
      role: "MEMBER",
      isEmailVerified: true,
      member: {
        create: {
          firstName,
          lastName,
          associationId: assocMember.associationId,
        },
      },
    },
    include: { member: true },
  });

  await prisma.associationMember.update({
    where: { id: assocMember.id },
    data: {
      status: "ACTIVE",
      userId: user.id,
      memberId: user.member.id,
      inviteToken: null,
      inviteAcceptedAt: now,
    },
  });

  await sendAssociationMemberWelcomeEmail({
    memberName: assocMember.name,
    memberEmail: assocMember.email,
    associationName: assocMember.association.name,
  }).catch((err) => console.error("Welcome email failed:", err.message));

  return ApiResponse.created(
    res,
    { email: assocMember.email },
    "Account activated successfully",
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/association/join
// Member uses a join code to link themselves to a MEMBER-type association
// Body: { joinCode }
// Requires: authenticated MEMBER role
// ─────────────────────────────────────────────────────────────────────────────
exports.joinByCode = asyncHandler(async (req, res) => {
  const { joinCode } = req.body;
  if (!joinCode) throw ApiError.badRequest("Join code is required");

  const assoc = await prisma.association.findFirst({
    where: { joinCode: joinCode.trim().toUpperCase(), joinCodeEnabled: true },
  });
  if (!assoc) throw ApiError.notFound("Invalid or expired join code");
  if (assoc.status !== "APPROVED")
    throw ApiError.badRequest("This association is not currently active");
  if (assoc.associationType !== "MEMBER")
    throw ApiError.badRequest("This join code is not for a member association");

  // Get the member profile of the logged-in user
  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
  });
  if (!member) throw ApiError.notFound("Member profile not found");

  // Check if already linked
  const alreadyLinked = await prisma.associationMember.findFirst({
    where: { associationId: assoc.id, userId: req.user.id },
  });
  if (alreadyLinked)
    throw ApiError.conflict("You are already a member of this association");

  // Link the existing member to the association
  await prisma.associationMember.create({
    data: {
      associationId: assoc.id,
      email: member.user?.email || req.user.email,
      name: `${member.firstName} ${member.lastName}`.trim(),
      status: "ACTIVE",
      userId: req.user.id,
      memberId: member.id,
      inviteAcceptedAt: new Date(),
    },
  });

  // Also update the member's associationId for backward compat
  await prisma.member.update({
    where: { id: member.id },
    data: { associationId: assoc.id },
  });

  return ApiResponse.success(
    res,
    { associationName: assoc.name },
    `Joined ${assoc.name} successfully`,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/association/members/:id/resend-invite
// ─────────────────────────────────────────────────────────────────────────────
exports.resendMemberInvite = asyncHandler(async (req, res) => {
  const assoc = await loadAssociation(req.user.id);

  const assocMember = await prisma.associationMember.findFirst({
    where: { id: req.params.id, associationId: assoc.id },
  });
  if (!assocMember) throw ApiError.notFound("Member not found");
  if (assocMember.status !== "INVITED")
    throw ApiError.badRequest("Can only resend to INVITED members");

  const inviteToken = generateToken();
  const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.associationMember.update({
    where: { id: assocMember.id },
    data: { inviteToken, inviteExpiresAt, inviteSentAt: new Date() },
  });

  await sendAssociationMemberInviteEmail({
    memberName: assocMember.name,
    memberEmail: assocMember.email,
    associationName: assoc.name,
    inviteToken,
  });

  return ApiResponse.success(res, {}, "Invite resent successfully");
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/association/members/:id
// ─────────────────────────────────────────────────────────────────────────────
exports.removeMember = asyncHandler(async (req, res) => {
  const assoc = await loadAssociation(req.user.id);

  const assocMember = await prisma.associationMember.findFirst({
    where: { id: req.params.id, associationId: assoc.id },
  });
  if (!assocMember) throw ApiError.notFound("Member not found");
  if (assocMember.status === "REMOVED")
    throw ApiError.badRequest("Member already removed");

  await prisma.associationMember.update({
    where: { id: assocMember.id },
    data: { status: "REMOVED" },
  });

  // Unlink from member's associationId if set
  if (assocMember.memberId) {
    await prisma.member.updateMany({
      where: { id: assocMember.memberId, associationId: assoc.id },
      data: { associationId: null },
    });
  }

  return ApiResponse.success(res, {}, "Member removed successfully");
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/association/members
// List all association members with status + savings
// ─────────────────────────────────────────────────────────────────────────────
exports.getMembers = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const assoc = await loadAssociation(req.user.id);

  const where = {
    associationId: assoc.id,
    ...(status ? { status } : {}),
  };

  const [members, total] = await Promise.all([
    prisma.associationMember.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.associationMember.count({ where }),
  ]);

  return ApiResponse.success(res, {
    members,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/association/businesses/link
// Link an existing business to a BUSINESS-type association by businessId
// Body: { businessId }
// ─────────────────────────────────────────────────────────────────────────────
exports.linkBusiness = asyncHandler(async (req, res) => {
  const { businessId } = req.body;
  if (!businessId) throw ApiError.badRequest("businessId is required");

  const assoc = await loadAssociation(req.user.id);
  if (assoc.associationType !== "BUSINESS") {
    throw ApiError.badRequest(
      "Only BUSINESS-type associations can link businesses",
    );
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });
  if (!business) throw ApiError.notFound("Business not found");
  if (business.status !== "APPROVED")
    throw ApiError.badRequest("Business must be approved before linking");

  // Check if already linked
  const existing = await prisma.associationBusiness.findFirst({
    where: { associationId: assoc.id, businessId },
  });
  if (existing && existing.status !== "REMOVED")
    throw ApiError.conflict("Business is already linked to this association");

  let link;
  if (existing) {
    // Re-link a previously removed business
    link = await prisma.associationBusiness.update({
      where: { id: existing.id },
      data: { status: "LINKED", inviteAcceptedAt: new Date() },
    });
  } else {
    // Fresh link — instant, no invite email needed
    // (email is only sent by inviteBusiness for NEW unregistered businesses)
    link = await prisma.associationBusiness.create({
      data: {
        associationId: assoc.id,
        businessId,
        businessName: business.name,
        email: business.email || null,
        status: "LINKED",
        inviteAcceptedAt: new Date(),
      },
    });
  }

  return ApiResponse.created(
    res,
    {
      ...link,
      business: {
        id: business.id,
        name: business.name,
        district: business.district,
        status: business.status,
      },
    },
    `${business.name} linked successfully`,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/association/businesses/invite
// Invite a new business to register under this BUSINESS-type association
// Body: { businessName, email }
// ─────────────────────────────────────────────────────────────────────────────
exports.inviteBusiness = asyncHandler(async (req, res) => {
  const { businessName, email } = req.body;
  if (!businessName || !email)
    throw ApiError.badRequest("businessName and email are required");

  const assoc = await loadAssociation(req.user.id);
  if (assoc.associationType !== "BUSINESS") {
    throw ApiError.badRequest(
      "Only BUSINESS-type associations can invite businesses",
    );
  }

  // Check for existing pending invite to same email
  const existing = await prisma.associationBusiness.findFirst({
    where: { associationId: assoc.id, email: email.toLowerCase() },
  });
  if (existing && existing.status !== "REMOVED")
    throw ApiError.conflict("An invite to this email already exists");

  const inviteToken = generateToken();
  const inviteExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

  const invite = await prisma.associationBusiness.create({
    data: {
      associationId: assoc.id,
      businessName: businessName.trim(),
      email: email.toLowerCase().trim(),
      status: "PENDING",
      inviteToken,
      inviteExpiresAt,
      inviteSentAt: new Date(),
    },
  });

  await sendAssociationBusinessInviteEmail({
    businessName,
    businessEmail: email,
    associationName: assoc.name,
    inviteToken,
  }).catch((err) =>
    console.error("Business invite email failed:", err.message),
  );

  return ApiResponse.created(res, invite, "Business invited successfully");
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/association/businesses/accept-invite/:token
// Business accepts invite → registered under association
// PUBLIC route
// Body: { password, contactName } — used to register business user if needed
// ─────────────────────────────────────────────────────────────────────────────
exports.acceptBusinessInvite = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password, contactName, phone } = req.body;

  const invite = await prisma.associationBusiness.findUnique({
    where: { inviteToken: token },
    include: { association: true },
  });

  if (!invite) throw ApiError.badRequest("Invalid or expired invite link");
  if (invite.status === "LINKED")
    throw ApiError.badRequest("Invite already accepted");
  if (invite.status === "REMOVED")
    throw ApiError.forbidden("This invite has been revoked");
  if (invite.inviteExpiresAt && invite.inviteExpiresAt < new Date()) {
    throw ApiError.badRequest(
      "Invite link has expired. Ask the association to resend.",
    );
  }

  if (!password || password.length < 6) {
    throw ApiError.badRequest("Password must be at least 6 characters");
  }

  // Check email not already registered
  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email },
  });
  if (existingUser)
    throw ApiError.conflict("An account with this email already exists");

  const hashedPassword = await bcrypt.hash(password, 12);

  // Create User + Business record
  const user = await prisma.user.create({
    data: {
      email: invite.email,
      password: hashedPassword,
      role: "BUSINESS",
      isEmailVerified: true,
      business: {
        create: {
          name: invite.businessName || "Business",
          phone: phone || "",
          email: invite.email,
          status: "PENDING", // still needs admin approval
        },
      },
    },
    include: { business: true },
  });

  // Link the business record to the association invite
  await prisma.associationBusiness.update({
    where: { id: invite.id },
    data: {
      businessId: user.business.id,
      status: "LINKED",
      inviteToken: null,
      inviteAcceptedAt: new Date(),
    },
  });

  return ApiResponse.created(
    res,
    {
      email: invite.email,
      businessId: user.business.id,
      message: "Business registered. Pending admin approval.",
    },
    "Business registered under association",
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/association/businesses/:id
// Remove a business from association
// ─────────────────────────────────────────────────────────────────────────────
exports.removeBusiness = asyncHandler(async (req, res) => {
  const assoc = await loadAssociation(req.user.id);

  const link = await prisma.associationBusiness.findFirst({
    where: { id: req.params.id, associationId: assoc.id },
  });
  if (!link) throw ApiError.notFound("Business link not found");
  if (link.status === "REMOVED")
    throw ApiError.badRequest("Business already removed");

  await prisma.associationBusiness.update({
    where: { id: link.id },
    data: { status: "REMOVED" },
  });

  return ApiResponse.success(res, {}, "Business removed from association");
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/association/businesses
// List all businesses linked to a BUSINESS-type association
// ─────────────────────────────────────────────────────────────────────────────
exports.getLinkedBusinesses = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const assoc = await loadAssociation(req.user.id);

  const where = {
    associationId: assoc.id,
    ...(status ? { status } : { status: { not: "REMOVED" } }),
  };

  const [businesses, total] = await Promise.all([
    prisma.associationBusiness.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            status: true,
            logoUrl: true,
            category: { select: { name: true } },
            district: true,
            phone: true,
            offers: { where: { isActive: true }, select: { id: true } },
          },
        },
      },
    }),
    prisma.associationBusiness.count({ where }),
  ]);

  return ApiResponse.success(res, {
    businesses,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/association/businesses/catalog
// Returns all active offers + certificates from linked businesses
// for the association dashboard catalog view.
// ─────────────────────────────────────────────────────────────────────────────
exports.getLinkedBusinessCatalog = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const assoc = await loadAssociation(req.user.id);
  if (assoc.associationType !== "BUSINESS") {
    throw ApiError.badRequest("Only BUSINESS-type associations have a catalog");
  }

  // Get all linked (not removed) business IDs
  const linkedBusinesses = await prisma.associationBusiness.findMany({
    where: {
      associationId: assoc.id,
      status: "LINKED",
      businessId: { not: null },
    },
    select: {
      businessId: true,
      business: {
        select: { id: true, name: true, logoUrl: true, district: true },
      },
    },
  });

  const businessIds = linkedBusinesses
    .map((lb) => lb.businessId)
    .filter(Boolean);

  if (businessIds.length === 0) {
    return ApiResponse.success(res, {
      offers: [],
      certificates: [],
      businessCount: 0,
    });
  }

  // Fetch active offers and available certificates from linked businesses
  const [offers, certificates] = await Promise.all([
    prisma.offer.findMany({
      where: { businessId: { in: businessIds }, isActive: true },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            district: true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
    }),
    prisma.certificate.findMany({
      where: { businessId: { in: businessIds }, status: "AVAILABLE" },
      include: {
        business: {
          select: { id: true, name: true, logoUrl: true, district: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // Map business info onto each linked record for easy lookup
  const bizMap = Object.fromEntries(
    linkedBusinesses.map((lb) => [lb.businessId, lb.business]),
  );

  return ApiResponse.success(res, {
    businessCount: businessIds.length,
    offers,
    certificates,
    businesses: linkedBusinesses.map((lb) => lb.business).filter(Boolean),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/association/businesses/:id/detail
// Full detail of a single linked business — offers + certificates (read-only)
// The association can VIEW but not redeem. No purchase endpoints here.
// ─────────────────────────────────────────────────────────────────────────────
exports.getLinkedBusinessDetail = asyncHandler(async (req, res) => {
  const assoc = await loadAssociation(req.user.id);

  // Verify this link belongs to the association
  const link = await prisma.associationBusiness.findFirst({
    where: { id: req.params.id, associationId: assoc.id, status: "LINKED" },
  });
  if (!link) throw ApiError.notFound("Linked business not found");
  if (!link.businessId)
    throw ApiError.badRequest("Business has not registered yet");

  const business = await prisma.business.findUnique({
    where: { id: link.businessId },
    include: {
      category: { select: { name: true } },
      offers: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: {
          // Certificate actual fields: id, offerId, faceValue, memberPrice, status, claimCode, expiryDate
          // title/description/imageUrl live on the parent Offer — already available from the offer include
          certificates: {
            where: { status: "AVAILABLE" },
            select: {
              id: true,
              faceValue: true,
              memberPrice: true, // this is the selling price in your schema
              status: true,
              expiryDate: true,
            },
            take: 10,
          },
        },
      },
    },
  });

  if (!business) throw ApiError.notFound("Business not found");

  // Separate discounts from certificate offers for easier frontend rendering
  const discounts = business.offers.filter((o) => o.type === "DISCOUNT");
  const certOffers = business.offers.filter((o) => o.type !== "DISCOUNT");
  const totalCerts = certOffers.reduce((s, o) => s + o.certificates.length, 0);

  return ApiResponse.success(res, {
    link: {
      id: link.id,
      status: link.status,
      linkedAt: link.inviteAcceptedAt || link.createdAt,
    },
    business: {
      id: business.id,
      name: business.name,
      description: business.description,
      phone: business.phone,
      email: business.email,
      website: business.website,
      district: business.district,
      logoUrl: business.logoUrl,
      imageUrls: business.imageUrls,
      category: business.category,
    },
    discounts, // DISCOUNT-type offers
    certOffers, // VALUE_ADDED_CERTIFICATE / PREPAID_CERTIFICATE offers with their certs
    stats: {
      totalOffers: business.offers.length,
      totalDiscount: discounts.length,
      totalCerts,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/association/dashboard
// Combined dashboard for both association types
// ─────────────────────────────────────────────────────────────────────────────
exports.getDashboard = asyncHandler(async (req, res) => {
  const assoc = await prisma.association.findUnique({
    where: { userId: req.user.id },
    include: {
      _count: {
        select: { associationMembers: true, associationBusinesses: true },
      },
    },
  });
  if (!assoc) throw ApiError.notFound("Association not found");

  if (assoc.associationType === "MEMBER") {
    // Member association dashboard
    const [activeCount, invitedCount, removedCount] = await Promise.all([
      prisma.associationMember.count({
        where: { associationId: assoc.id, status: "ACTIVE" },
      }),
      prisma.associationMember.count({
        where: { associationId: assoc.id, status: "INVITED" },
      }),
      prisma.associationMember.count({
        where: { associationId: assoc.id, status: "REMOVED" },
      }),
    ]);

    // Aggregate savings from linked members
    const activeMembers = await prisma.associationMember.findMany({
      where: {
        associationId: assoc.id,
        status: "ACTIVE",
        memberId: { not: null },
      },
      select: { memberId: true },
    });
    const memberIds = activeMembers.map((m) => m.memberId).filter(Boolean);

    const savingsAgg =
      memberIds.length > 0
        ? await prisma.member.aggregate({
            where: { id: { in: memberIds } },
            _sum: { totalSavings: true },
          })
        : { _sum: { totalSavings: 0 } };

    const totalSavings = savingsAgg._sum.totalSavings ?? 0;

    // Top members by savings
    const topMembers = await prisma.associationMember.findMany({
      where: { associationId: assoc.id, status: "ACTIVE" },
      orderBy: { totalSavings: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        totalSavings: true,
        totalRedemptions: true,
      },
    });

    return ApiResponse.success(res, {
      associationType: "MEMBER",
      joinCode: assoc.joinCodeEnabled ? assoc.joinCode : null,
      memberCounts: {
        total: assoc._count.associationMembers,
        active: activeCount,
        invited: invitedCount,
        removed: removedCount,
      },
      totalSavings,
      topMembers,
    });
  }

  // Business association dashboard
  const [linkedCount, pendingCount, removedCount] = await Promise.all([
    prisma.associationBusiness.count({
      where: { associationId: assoc.id, status: "LINKED" },
    }),
    prisma.associationBusiness.count({
      where: { associationId: assoc.id, status: "PENDING" },
    }),
    prisma.associationBusiness.count({
      where: { associationId: assoc.id, status: "REMOVED" },
    }),
  ]);

  const linkedBusinesses = await prisma.associationBusiness.findMany({
    where: {
      associationId: assoc.id,
      status: "LINKED",
      businessId: { not: null },
    },
    include: {
      business: {
        select: { offers: { where: { isActive: true }, select: { id: true } } },
      },
    },
  });

  const totalActiveOffers = linkedBusinesses.reduce(
    (sum, lb) => sum + (lb.business?.offers?.length ?? 0),
    0,
  );

  return ApiResponse.success(res, {
    associationType: "BUSINESS",
    businessCounts: {
      total: assoc._count.associationBusinesses,
      linked: linkedCount,
      pending: pendingCount,
      removed: removedCount,
    },
    totalActiveOffers,
  });
});
