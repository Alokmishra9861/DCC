const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const {
  sendEmployerApprovedEmail,
  sendMembershipConfirmationEmail,
} = require("../services/email.service");
const { generateMemberQR } = require("../services/qr.service");
const { getPagination, buildPaginationMeta } = require("../utils/paginate");

// ── Dashboard stats ───────────────────────────────────────────────────────────
// Returns FLAT object — Dashboard.jsx reads totalMembers, activeMembers etc directly
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
    prisma.business.count({ where: { isApproved: true } }),
    prisma.business.count({ where: { isApproved: false } }),
    prisma.employer.count({ where: { isApproved: false } }),
    prisma.association.count({ where: { isApproved: false } }),
    prisma.transaction.count(),
    prisma.transaction.aggregate({ _sum: { savingsAmount: true } }),
    // Recent members for the dashboard table
    prisma.member.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, isActive: true } },
        membership: { select: { status: true, type: true, expiryDate: true } },
      },
    }),
    // Recent businesses for the dashboard table
    prisma.business.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true } },
      },
    }),
  ]);

  // Flat structure — no nested { stats: {} } wrapper
  // Dashboard.jsx reads these directly after the ApiResponse unwrap
  return ApiResponse.success(res, {
    // Core counts
    totalUsers,
    totalMembers,
    activeMembers,
    totalBusinesses,
    totalTransactions,
    totalSavings: totalSavingsAgg._sum.savingsAmount ?? 0,

    // Pending counts (used for the approval badge)
    pendingBusinesses,
    pendingEmployers,
    pendingAssociations,
    totalPending: pendingBusinesses + pendingEmployers + pendingAssociations,

    // Recent activity for dashboard tables
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

  // Filter by membership status if requested (done in memory to avoid complex join)
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
    if (existing && existing.id !== member.userId) {
      throw ApiError.conflict("Email already in use");
    }
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
    if (email) {
      await tx.user.update({ where: { id: member.userId }, data: { email } });
    }
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
    if (member?.userId) {
      await tx.user.deleteMany({ where: { id: member.userId } });
    }
  });

  return ApiResponse.success(res, {}, "Member deleted");
});

// ── Pending approvals ─────────────────────────────────────────────────────────
exports.getPendingApprovals = asyncHandler(async (req, res) => {
  const [employersRaw, associationsRaw, businessesRaw] = await Promise.all([
    prisma.employer.findMany({
      where: { isApproved: false },
      select: {
        id: true,
        userId: true,
        companyName: true,
        createdAt: true,
      },
    }),
    prisma.association.findMany({
      where: { isApproved: false },
      select: {
        id: true,
        userId: true,
        name: true,
        createdAt: true,
      },
    }),
    prisma.business.findMany({
      where: { isApproved: false },
      select: {
        id: true,
        userId: true,
        name: true,
        createdAt: true,
      },
    }),
  ]);

  const userIds = [
    ...employersRaw.map((e) => e.userId),
    ...associationsRaw.map((a) => a.userId),
    ...businessesRaw.map((b) => b.userId),
  ].filter(Boolean);

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, createdAt: true },
  });
  const userById = new Map(users.map((u) => [u.id, u]));

  const employers = employersRaw.map((e) => ({
    ...e,
    user: userById.get(e.userId) || null,
  }));
  const associations = associationsRaw.map((a) => ({
    ...a,
    user: userById.get(a.userId) || null,
  }));
  const businesses = businessesRaw.map((b) => ({
    ...b,
    user: userById.get(b.userId) || null,
  }));

  return ApiResponse.success(res, { employers, associations, businesses });
});

// ── Pending memberships ───────────────────────────────────────────────────────
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

  await sendMembershipConfirmationEmail(updated.member.user.email, {
    name: `${updated.member.firstName} ${updated.member.lastName}`,
    expiryDate: updated.expiryDate,
    membershipCost: updated.priceUSD,
  });

  return ApiResponse.success(res, updated, "Membership approved");
});

// ── Approve employer ──────────────────────────────────────────────────────────
exports.approveEmployer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const employer = await prisma.employer.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!employer) throw ApiError.notFound("Employer not found");

  await prisma.employer.update({ where: { id }, data: { isApproved: true } });

  await sendEmployerApprovedEmail(employer.user.email, {
    companyName: employer.companyName,
    loginUrl: `${process.env.CLIENT_URL}/login`,
  });

  return ApiResponse.success(res, {}, "Employer approved");
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

  await prisma.business.update({ where: { id }, data: { isApproved: true } });
  return ApiResponse.success(res, {}, "Business approved");
});

// ── Get all businesses (admin) ────────────────────────────────────────────────
exports.getAdminBusinesses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { isApproved, search } = req.query;

  const where = {
    ...(isApproved !== undefined && { isApproved: isApproved === "true" }),
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
        category: true,
        district: true,
        isApproved: true,
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
    category,
    description,
    phone,
    email,
    address,
    district,
    website,
    isApproved,
  } = req.body;

  const business = await prisma.business.findUnique({ where: { id } });
  if (!business) throw ApiError.notFound("Business not found");

  const updated = await prisma.business.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(address !== undefined && { address }),
      ...(district !== undefined && { district }),
      ...(website !== undefined && { website }),
      ...(isApproved !== undefined && { isApproved }),
    },
  });

  return ApiResponse.success(res, updated, "Business updated");
});

// ── Reject business (admin) ───────────────────────────────────────────────────
exports.rejectBusiness = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const business = await prisma.business.findUnique({ where: { id } });
  if (!business) throw ApiError.notFound("Business not found");

  await prisma.$transaction([
    prisma.business.update({ where: { id }, data: { isApproved: false } }),
    prisma.user.update({
      where: { id: business.userId },
      data: { isActive: false },
    }),
  ]);

  return ApiResponse.success(res, {}, "Business rejected");
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
