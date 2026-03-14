const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const { bulkCreateMemberships } = require("../services/membership.service");
const { buildEmployerSummary } = require("../utils/savingsCalculator");

// ── Get employer dashboard ────────────────────────────
exports.getDashboard = asyncHandler(async (req, res) => {
  const employer = await prisma.employer.findUnique({
    where: { userId: req.user.id },
    include: {
      members: {
        include: { membership: true },
        take: 10,
      },
      memberships: true,
    },
  });
  if (!employer) throw ApiError.notFound("Employer not found");
  if (!employer.isApproved)
    throw ApiError.forbidden("Employer account not yet approved");

  const totalMembers = await prisma.member.count({
    where: { employerId: employer.id },
  });
  const activeMembers = await prisma.membership.count({
    where: { employerId: employer.id, status: "ACTIVE" },
  });

  const summary = buildEmployerSummary(employer);

  // Savings by category
  const savingsByCategory = await prisma.transaction.groupBy({
    by: ["businessCategory"],
    where: { member: { employerId: employer.id } },
    _sum: { savingsAmount: true },
    orderBy: { _sum: { savingsAmount: "desc" } },
  });

  // Savings by district
  const savingsByDistrict = await prisma.transaction.groupBy({
    by: ["memberDistrict"],
    where: { member: { employerId: employer.id } },
    _sum: { savingsAmount: true },
  });

  return ApiResponse.success(res, {
    employer,
    summary,
    totalMembers,
    activeMembers,
    savingsByCategory,
    savingsByDistrict,
  });
});

// ── Upload employee CSV / bulk create memberships ─────
exports.uploadEmployees = asyncHandler(async (req, res) => {
  const { employees, pricePerMember = 79.99 } = req.body;
  // employees: [{ firstName, lastName, email, phone, age, sex, district }]

  const employer = await prisma.employer.findUnique({
    where: { userId: req.user.id },
  });
  if (!employer) throw ApiError.notFound("Employer not found");
  if (!employer.isApproved)
    throw ApiError.forbidden("Employer account not yet approved");

  if (!Array.isArray(employees) || !employees.length) {
    throw ApiError.badRequest("Employee list is required");
  }

  const results = await bulkCreateMemberships(
    employees,
    employer.id,
    null,
    parseFloat(pricePerMember),
  );

  return ApiResponse.success(
    res,
    results,
    `Created ${results.created} memberships`,
  );
});

// ── Get employee list ─────────────────────────────────
exports.getEmployees = asyncHandler(async (req, res) => {
  const employer = await prisma.employer.findUnique({
    where: { userId: req.user.id },
  });
  if (!employer) throw ApiError.notFound("Employer not found");

  const members = await prisma.member.findMany({
    where: { employerId: employer.id },
    include: { membership: true, user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return ApiResponse.success(res, members);
});
