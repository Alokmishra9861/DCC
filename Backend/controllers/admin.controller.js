// Backend/controllers/admin.controller.js

const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const {
  sendMembershipConfirmationEmail,
} = require("../services/email.service");
const {
  sendEmployerApprovalEmail,
  sendEmployerRejectionEmail,
} = require("../services/employer.email.service");
const {
  sendB2BApprovalEmail,
  sendB2BRejectionEmail,
} = require("../services/b2b.email.service");
const { generateMemberQR } = require("../services/qr.service");
const { getPagination, buildPaginationMeta } = require("../utils/Paginate");

// ── Dashboard stats ───────────────────────────────────────────────────────────
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalMembers,
    activeMembers,
    totalBusinesses,
    pendingBusinesses,
    pendingEmployers,
    pendingAssociations,
    totalTransactions,
    totalSavingsAgg,
    recentMembers,
    recentBusinesses,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.member.count(),
    prisma.membership.count({ where: { status: "ACTIVE" } }),
    prisma.business.count({ where: { status: "APPROVED" } }),
    prisma.business.count({ where: { status: "PENDING" } }),
    prisma.employer.count({ where: { isApproved: false } }),
    prisma.association.count({ where: { isApproved: false } }),
    prisma.transaction.count(),
    prisma.transaction.aggregate({ _sum: { savingsAmount: true } }),
    prisma.member.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        district: true,
        age: true,
        createdAt: true,
      },
    }),
    prisma.business.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        isApproved: true,
        createdAt: true,
      },
    }),
  ]);

  return ApiResponse.success(res, {
    totalUsers,
    totalMembers,
    activeMembers,
    totalBusinesses,
    totalTransactions,
    totalSavings: totalSavingsAgg._sum.savingsAmount ?? 0,
    pendingBusinesses,
    pendingEmployers,
    pendingAssociations,
    totalPending: pendingBusinesses + pendingEmployers + pendingAssociations,
    recentMembers,
    recentBusinesses,
  });
});

// ── Get all users ─────────────────────────────────────────────────────────────
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { role, search } = req.query;

  const where = {
    ...(role && { role }),
    ...(search && { email: { contains: search, mode: "insensitive" } }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        member: { select: { firstName: true, lastName: true, district: true } },
        employer: { select: { companyName: true, isApproved: true } },
        association: { select: { name: true, isApproved: true } },
        business: { select: { name: true, isApproved: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return ApiResponse.paginated(
    res,
    users,
    buildPaginationMeta(total, page, limit),
  );
});

// ── Toggle user active/inactive ───────────────────────────────────────────────
exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound("User not found");

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });

  return ApiResponse.success(
    res,
    { id: updated.id, isActive: updated.isActive },
    `User ${updated.isActive ? "activated" : "deactivated"}`,
  );
});

// ── Update user role ──────────────────────────────────────────────────────────
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const allowedRoles = [
    "MEMBER",
    "BUSINESS",
    "EMPLOYER",
    "ASSOCIATION",
    "B2B",
    "ADMIN",
  ];
  if (!allowedRoles.includes(role)) throw ApiError.badRequest("Invalid role");

  const user = await prisma.user.update({ where: { id }, data: { role } });
  return ApiResponse.success(
    res,
    { id: user.id, role: user.role },
    "User role updated",
  );
});

// ── Delete user ───────────────────────────────────────────────────────────────
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id } });
  return ApiResponse.success(res, {}, "User deleted");
});

// ── Get all members (admin) ───────────────────────────────────────────────────
exports.getAdminMembers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search, district, membershipStatus } = req.query;

  const memberWhere = {
    ...(district && district !== "all" && { district }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [membersRaw, total] = await Promise.all([
    prisma.member.findMany({
      where: memberWhere,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        phone: true,
        district: true,
        createdAt: true,
        membership: {
          select: {
            id: true,
            status: true,
            type: true,
            startDate: true,
            expiryDate: true,
            priceUSD: true,
            paymentStatus: true,
          },
        },
      },
    }),
    prisma.member.count({ where: memberWhere }),
  ]);

  const memberUserIds = membersRaw.map((m) => m.userId).filter(Boolean);
  const memberUsers = await prisma.user.findMany({
    where: { id: { in: memberUserIds } },
    select: { id: true, email: true, isActive: true, createdAt: true },
  });
  const memberUserById = new Map(memberUsers.map((u) => [u.id, u]));

  const members = membersRaw.map((m) => ({
    ...m,
    user: memberUserById.get(m.userId) || null,
  }));

  const filtered =
    membershipStatus && membershipStatus !== "all"
      ? members.filter(
          (m) => m.membership?.status === membershipStatus.toUpperCase(),
        )
      : members;

  return ApiResponse.paginated(
    res,
    filtered,
    buildPaginationMeta(total, page, limit),
  );
});

// ── Update member (admin) ─────────────────────────────────────────────────────
exports.updateMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, district, email } = req.body;

  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) throw ApiError.notFound("Member not found");

  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== member.userId)
      throw ApiError.conflict("Email already in use");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedMember = await tx.member.update({
      where: { id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(district !== undefined && { district }),
      },
    });
    if (email)
      await tx.user.update({ where: { id: member.userId }, data: { email } });
    return updatedMember;
  });

  return ApiResponse.success(res, updated, "Member updated");
});

// ── Delete member (admin) ─────────────────────────────────────────────────────
exports.deleteMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const member = await prisma.member.findUnique({ where: { id } });

  await prisma.$transaction(async (tx) => {
    await tx.membership.deleteMany({ where: { memberId: id } });
    await tx.certificatePurchase.deleteMany({ where: { memberId: id } });
    await tx.transaction.deleteMany({ where: { memberId: id } });
    await tx.member.deleteMany({ where: { id } });
    if (member?.userId)
      await tx.user.deleteMany({ where: { id: member.userId } });
  });

  return ApiResponse.success(res, {}, "Member deleted");
});

// ── Pending approvals ─────────────────────────────────────────────────────────
exports.getPendingApprovals = asyncHandler(async (req, res) => {
  // ✅ B2B partners included alongside employers, associations, businesses
  const [employersRaw, associationsRaw, businessesRaw, b2bRaw] =
    await Promise.all([
      prisma.employer.findMany({
        where: { isApproved: false },
        select: { id: true, userId: true, companyName: true, createdAt: true },
      }),
      prisma.association.findMany({
        where: { isApproved: false },
        select: { id: true, userId: true, name: true, createdAt: true },
      }),
      prisma.business.findMany({
        where: { isApproved: false },
        select: { id: true, userId: true, name: true, createdAt: true },
      }),
      prisma.b2BPartner.findMany({
        where: { isApproved: false },
        select: {
          id: true,
          userId: true,
          companyName: true,
          servicesOffered: true,
          createdAt: true,
        },
      }),
    ]);

  const userIds = [
    ...employersRaw.map((e) => e.userId),
    ...associationsRaw.map((a) => a.userId),
    ...businessesRaw.map((b) => b.userId),
    ...b2bRaw.map((b) => b.userId),
  ].filter(Boolean);

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, createdAt: true },
  });
  const userById = new Map(users.map((u) => [u.id, u]));

  return ApiResponse.success(res, {
    employers: employersRaw.map((e) => ({
      ...e,
      user: userById.get(e.userId) || null,
    })),
    associations: associationsRaw.map((a) => ({
      ...a,
      user: userById.get(a.userId) || null,
    })),
    businesses: businessesRaw.map((b) => ({
      ...b,
      user: userById.get(b.userId) || null,
    })),
    b2bPartners: b2bRaw.map((b) => ({
      ...b,
      user: userById.get(b.userId) || null,
    })),
  });
});

exports.getPendingMemberships = asyncHandler(async (req, res) => {
  const memberships = await prisma.membership.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  const memberIds = memberships.map((m) => m.memberId);
  const members = await prisma.member.findMany({
    where: { id: { in: memberIds } },
    select: {
      id: true,
      userId: true,
      firstName: true,
      lastName: true,
      district: true,
    },
  });
  const userIds = members.map((m) => m.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true },
  });

  const memberById = new Map(members.map((m) => [m.id, m]));
  const userById = new Map(users.map((u) => [u.id, u]));

  const enriched = memberships
    .map((ms) => {
      const member = memberById.get(ms.memberId);
      if (!member) return null;
      return {
        ...ms,
        member: { ...member, user: userById.get(member.userId) ?? null },
      };
    })
    .filter(Boolean);

  return ApiResponse.success(res, enriched);
});

// ── Approve membership ────────────────────────────────────────────────────────
exports.approveMembership = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const membership = await prisma.membership.findUnique({
    where: { id },
    include: { member: { include: { user: true } } },
  });
  if (!membership) throw ApiError.notFound("Membership not found");
  if (membership.status === "ACTIVE") {
    return ApiResponse.success(res, membership, "Membership already active");
  }

  const startDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 365);

  const qrCode = await generateMemberQR(membership.member);

  const updated = await prisma.membership.update({
    where: { id },
    data: {
      status: "ACTIVE",
      paymentStatus: "COMPLETED",
      startDate,
      expiryDate,
      paymentId: membership.paymentId || "ADMIN_APPROVED",
    },
    include: { member: { include: { user: true } } },
  });

  await prisma.member.update({
    where: { id: membership.member.id },
    data: { qrCode },
  });

  if (updated.member?.user?.email) {
    await sendMembershipConfirmationEmail(updated.member.user.email, {
      name: `${updated.member.firstName} ${updated.member.lastName}`,
      expiryDate: updated.expiryDate,
      membershipCost: updated.priceUSD,
    }).catch((err) =>
      console.error("Membership confirmation email failed:", err.message),
    );
  }

  return ApiResponse.success(res, updated, "Membership approved");
});

// ── Approve employer ──────────────────────────────────────────────────────────
exports.approveEmployer = asyncHandler(async (req, res) => {
  // ✅ FIX: Don't use include — fetch user separately to avoid null relation crash
  const employer = await prisma.employer.findUnique({
    where: { id: req.params.id },
  });
  if (!employer) throw ApiError.notFound("Employer not found");

  // Fetch user separately — avoids Prisma "field required but got null" error
  // when the relation exists in schema but the record was created without a user link
  const user = await prisma.user.findUnique({
    where: { id: employer.userId },
    select: { email: true },
  });

  await prisma.employer.update({
    where: { id: employer.id },
    data: { isApproved: true, status: "APPROVED" },
  });

  if (user?.email) {
    await sendEmployerApprovalEmail({
      employerEmail: user.email,
      companyName: employer.companyName,
    }).catch((err) =>
      console.error("Employer approval email failed:", err.message),
    );
  }

  return ApiResponse.success(res, {}, "Employer approved");
});

// ── Reject employer ───────────────────────────────────────────────────────────
exports.rejectEmployer = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const employer = await prisma.employer.findUnique({
    where: { id: req.params.id },
  });
  if (!employer) throw ApiError.notFound("Employer not found");

  const user = await prisma.user.findUnique({
    where: { id: employer.userId },
    select: { email: true },
  });

  await prisma.employer.update({
    where: { id: employer.id },
    data: {
      isApproved: false,
      status: "REJECTED",
      rejectionReason: reason || null,
    },
  });

  if (user?.email) {
    await sendEmployerRejectionEmail({
      employerEmail: user.email,
      companyName: employer.companyName,
      reason,
    }).catch((err) =>
      console.error("Employer rejection email failed:", err.message),
    );
  }

  return ApiResponse.success(res, {}, "Employer rejected");
});

// ── Approve association ───────────────────────────────────────────────────────
exports.approveAssociation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const association = await prisma.association.findUnique({ where: { id } });
  if (!association) throw ApiError.notFound("Association not found");

  await prisma.association.update({
    where: { id },
    data: { isApproved: true },
  });
  return ApiResponse.success(res, {}, "Association approved");
});

// ── Approve business ──────────────────────────────────────────────────────────
exports.approveBusiness = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const business = await prisma.business.findUnique({ where: { id } });
  if (!business) throw ApiError.notFound("Business not found");

  await prisma.business.update({
    where: { id },
    data: { status: "APPROVED", isApproved: true },
  });
  return ApiResponse.success(res, {}, "Business approved");
});

// ── Reject business ───────────────────────────────────────────────────────────
exports.rejectBusiness = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const business = await prisma.business.findUnique({ where: { id } });
  if (!business) throw ApiError.notFound("Business not found");

  await prisma.business.update({
    where: { id },
    data: { status: "REJECTED", isApproved: false },
  });
  return ApiResponse.success(res, {}, "Business rejected");
});

// ── Get all businesses (admin) ────────────────────────────────────────────────
const slugifyCategory = (value) => {
  if (!value) return null;
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

exports.getAdminBusinesses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, search } = req.query;

  const where = {
    ...(status && { status }),
    ...(search && { name: { contains: search, mode: "insensitive" } }),
  };

  const [businessesRaw, total] = await Promise.all([
    prisma.business.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        name: true,
        category: { select: { id: true, name: true, slug: true } },
        district: true,
        status: true,
        createdAt: true,
        logoUrl: true,
      },
    }),
    prisma.business.count({ where }),
  ]);

  const businessUserIds = businessesRaw.map((b) => b.userId).filter(Boolean);
  const businessUsers = await prisma.user.findMany({
    where: { id: { in: businessUserIds } },
    select: { id: true, email: true, isActive: true },
  });
  const businessUserById = new Map(businessUsers.map((u) => [u.id, u]));

  const businesses = businessesRaw.map((b) => ({
    ...b,
    user: businessUserById.get(b.userId) || null,
  }));

  return ApiResponse.paginated(
    res,
    businesses,
    buildPaginationMeta(total, page, limit),
  );
});

// ── Update business (admin) ───────────────────────────────────────────────────
exports.updateBusiness = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    categoryId,
    categoryName,
    categorySlug,
    description,
    phone,
    email,
    address,
    district,
    website,
    status,
  } = req.body;

  const business = await prisma.business.findUnique({ where: { id } });
  if (!business) throw ApiError.notFound("Business not found");

  let resolvedCategoryId = categoryId || null;
  if (!resolvedCategoryId && (categorySlug || categoryName)) {
    const slug = categorySlug || slugifyCategory(categoryName);
    if (slug) {
      const existing = await prisma.category.findUnique({ where: { slug } });
      if (!existing) {
        const created = await prisma.category.create({
          data: {
            slug,
            name: categoryName || slug.replace(/-/g, " "),
            description: `Businesses offering ${categoryName || slug}`,
          },
        });
        resolvedCategoryId = created.id;
      } else {
        resolvedCategoryId = existing.id;
      }
    }
  }

  const updated = await prisma.business.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(resolvedCategoryId && { categoryId: resolvedCategoryId }),
      ...(description !== undefined && { description }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(address !== undefined && { address }),
      ...(district !== undefined && { district }),
      ...(website !== undefined && { website }),
      ...(status !== undefined && { status }),
    },
  });

  return ApiResponse.success(res, updated, "Business updated");
});

// ── Contact inquiries ─────────────────────────────────────────────────────────
exports.getInquiries = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status } = req.query;
  const where = status ? { status } : {};

  const [inquiries, total] = await Promise.all([
    prisma.contactInquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactInquiry.count({ where }),
  ]);

  return ApiResponse.paginated(
    res,
    inquiries,
    buildPaginationMeta(total, page, limit),
  );
});

// ── Update inquiry status ─────────────────────────────────────────────────────
exports.updateInquiryStatus = asyncHandler(async (req, res) => {
  const { status, response } = req.body;
  const inquiry = await prisma.contactInquiry.update({
    where: { id: req.params.id },
    data: {
      status,
      ...(response && { response }),
      ...(status === "responded" && { respondedAt: new Date() }),
    },
  });
  return ApiResponse.success(res, inquiry, "Inquiry updated");
});

// ── Audit log ─────────────────────────────────────────────────────────────────
exports.getAuditLog = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  // ✅ FIX: removed stray `, a` that was causing a syntax/runtime error
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count(),
  ]);

  return ApiResponse.paginated(
    res,
    logs,
    buildPaginationMeta(total, page, limit),
  );
});

// ── Approve B2B partner ────────────────────────────────────────────────────────
// Sets isApproved: true → partner immediately appears in GET /api/b2b/directory
exports.approveB2BPartner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const partner = await prisma.b2BPartner.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });
  if (!partner) throw ApiError.notFound("B2B partner not found");

  await prisma.b2BPartner.update({
    where: { id },
    data: { isApproved: true },
  });

  // Send approval email
  try {
    await sendB2BApprovalEmail({
      b2bEmail: partner.user.email,
      companyName: partner.companyName,
    });
  } catch (emailErr) {
    console.error("❌ Failed to send B2B approval email:", emailErr.message);
    // Don't fail the approval if email fails
  }

  return ApiResponse.success(
    res,
    {},
    "B2B partner approved — now visible in directory",
  );
});

// ── Reject B2B partner ─────────────────────────────────────────────────────────
exports.rejectB2BPartner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const partner = await prisma.b2BPartner.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });
  if (!partner) throw ApiError.notFound("B2B partner not found");

  // Send rejection email
  try {
    await sendB2BRejectionEmail({
      b2bEmail: partner.user.email,
      companyName: partner.companyName,
      reason: reason || null,
    });
  } catch (emailErr) {
    console.error("❌ Failed to send B2B rejection email:", emailErr.message);
    // Don't fail the rejection if email fails
  }

  return ApiResponse.success(res, {}, "B2B partner application rejected");
});

// ── Get all B2B partners (admin list) ─────────────────────────────────────────
exports.getB2BPartners = asyncHandler(async (req, res) => {
  const { search, status } = req.query;

  const where = {
    ...(status === "approved" && { isApproved: true }),
    ...(status === "pending" && { isApproved: false }),
    ...(search && {
      OR: [
        { companyName: { contains: search, mode: "insensitive" } },
        { servicesOffered: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const partners = await prisma.b2BPartner.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, email: true, isActive: true } } },
  });

  return ApiResponse.success(res, partners);
});

// ── Get all memberships (admin) ───────────────────────────────────────────────
exports.getAllMemberships = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status } = req.query;

  const where = {
    ...(status && { status: status.toUpperCase() }),
  };

  const [membershipsRaw, total] = await Promise.all([
    prisma.membership.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        memberId: true,
        status: true,
        type: true,
        startDate: true,
        expiryDate: true,
        priceUSD: true,
        paymentStatus: true,
        paymentId: true,
        createdAt: true,
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            district: true,
            userId: true,
          },
        },
      },
    }),
    prisma.membership.count({ where }),
  ]);

  const userIds = membershipsRaw.map((m) => m.member?.userId).filter(Boolean);

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, isActive: true },
  });
  const userById = new Map(users.map((u) => [u.id, u]));

  const memberships = membershipsRaw.map((m) => ({
    ...m,
    member: m.member
      ? { ...m.member, user: userById.get(m.member.userId) || null }
      : null,
  }));

  return ApiResponse.paginated(
    res,
    memberships,
    buildPaginationMeta(total, page, limit),
  );
});

// ── Get all employers (admin) ─────────────────────────────────────────────────
exports.getAllEmployers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search, status } = req.query;

  const where = {
    ...(status === "approved" && { isApproved: true }),
    ...(status === "pending" && { isApproved: false }),
    ...(search && {
      companyName: { contains: search, mode: "insensitive" },
    }),
  };

  const [employersRaw, total] = await Promise.all([
    prisma.employer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        companyName: true,
        isApproved: true,
        status: true,
        rejectionReason: true,
        createdAt: true,
      },
    }),
    prisma.employer.count({ where }),
  ]);

  const userIds = employersRaw.map((e) => e.userId).filter(Boolean);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, isActive: true, createdAt: true },
  });
  const userById = new Map(users.map((u) => [u.id, u]));

  const employers = employersRaw.map((e) => ({
    ...e,
    user: userById.get(e.userId) || null,
  }));

  return ApiResponse.paginated(
    res,
    employers,
    buildPaginationMeta(total, page, limit),
  );
});

// ── Get all associations (admin) ──────────────────────────────────────────────
exports.getAllAssociations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search, status } = req.query;

  const where = {
    ...(status === "approved" && { isApproved: true }),
    ...(status === "pending" && { isApproved: false }),
    ...(search && {
      name: { contains: search, mode: "insensitive" },
    }),
  };

  const [associationsRaw, total] = await Promise.all([
    prisma.association.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        name: true,
        isApproved: true,
        createdAt: true,
      },
    }),
    prisma.association.count({ where }),
  ]);

  const userIds = associationsRaw.map((a) => a.userId).filter(Boolean);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, isActive: true, createdAt: true },
  });
  const userById = new Map(users.map((u) => [u.id, u]));

  const associations = associationsRaw.map((a) => ({
    ...a,
    user: userById.get(a.userId) || null,
  }));

  return ApiResponse.paginated(
    res,
    associations,
    buildPaginationMeta(total, page, limit),
  );
});
