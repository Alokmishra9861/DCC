// Backend/controllers/employer.controller.js
// Handles: bulk membership purchase, employee CRUD, employer dashboard/ROI

const crypto = require("crypto");
const { prisma } = require("../config/db");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const {
  sendEmployerApprovalEmail,
  sendEmployerRejectionEmail,
  sendEmployeeWelcomeEmail,
  sendEmployeeInviteEmail,
} = require("../services/employer.email.service");

// ── Plan config (price per seat per year in USD) ──────────────────────────────
const PLAN_CONFIG = {
  BASIC: { maxSeats: 10, pricePerSeat: 49 },
  STANDARD: { maxSeats: 50, pricePerSeat: 39 },
  ENTERPRISE: { maxSeats: Infinity, pricePerSeat: 29 },
};

// ── Helper: generate a secure invite token ────────────────────────────────────
const generateInviteToken = () => crypto.randomBytes(32).toString("hex");

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/employer/profile
// Returns the current employer's profile + seat summary
// ─────────────────────────────────────────────────────────────────────────────
exports.getProfile = asyncHandler(async (req, res) => {
  const employer = await prisma.employer.findUnique({
    where: { userId: req.user.id },
    include: {
      _count: { select: { employees: true } },
    },
  });

  if (!employer) throw ApiError.notFound("Employer profile not found");

  // Include approval status message for frontend
  const profileData = {
    ...employer,
    approvalStatus: employer.status,
    isApprovalPending: employer.status === "PENDING",
    isApprovalRejected: employer.status === "REJECTED",
    rejectionReason: employer.rejectionReason || null,
  };

  return ApiResponse.success(res, profileData);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/employer/bulk-purchase
// Employer buys X seats for a plan. Creates seat allocation on the employer.
// Actual membership records are created per-employee when they accept invite.
// Body: { planType, seatCount, paymentProvider, paymentId }
// ─────────────────────────────────────────────────────────────────────────────
exports.bulkPurchase = asyncHandler(async (req, res) => {
  const { planType, seatCount, paymentProvider, paymentId } = req.body;

  if (!planType || !seatCount || !paymentProvider || !paymentId) {
    throw ApiError.badRequest(
      "planType, seatCount, paymentProvider and paymentId are required",
    );
  }

  const plan = PLAN_CONFIG[planType];
  if (!plan) throw ApiError.badRequest("Invalid plan type");

  const validProviders = ["STRIPE", "PAYPAL", "MANUAL"];
  if (!validProviders.includes(paymentProvider)) {
    throw ApiError.badRequest("Invalid payment provider");
  }

  if (seatCount < 1) throw ApiError.badRequest("Seat count must be at least 1");
  if (seatCount > plan.maxSeats) {
    throw ApiError.badRequest(
      `${planType} plan allows max ${plan.maxSeats} seats`,
    );
  }

  const employer = await prisma.employer.findUnique({
    where: { userId: req.user.id },
  });
  if (!employer) throw ApiError.notFound("Employer not found");
  if (employer.status !== "APPROVED") {
    throw ApiError.forbidden(
      "Your account must be approved before purchasing memberships",
    );
  }

  const totalPrice = seatCount * plan.pricePerSeat;
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year plan

  const updated = await prisma.employer.update({
    where: { id: employer.id },
    data: {
      planType,
      seatsPurchased: { increment: seatCount },
      bulkPaymentProvider: paymentProvider,
      bulkPaymentId: paymentId,
      bulkPaymentStatus: "COMPLETED",
      bulkPriceUSD: { increment: totalPrice },
      totalMembershipCost: { increment: totalPrice },
      planStartDate: now,
      planExpiryDate: expiryDate,
    },
  });

  return ApiResponse.success(
    res,
    {
      planType,
      seatsPurchased: updated.seatsPurchased,
      seatsUsed: updated.seatsUsed,
      seatsAvailable: updated.seatsPurchased - updated.seatsUsed,
      totalPaid: totalPrice,
      planExpiryDate: expiryDate,
    },
    "Bulk membership purchased successfully",
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/employer/employees
// List all employees for this employer with status + savings
// ─────────────────────────────────────────────────────────────────────────────
exports.getEmployees = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const employer = await prisma.employer.findUnique({
    where: { userId: req.user.id },
  });
  if (!employer) throw ApiError.notFound("Employer not found");

  const where = {
    employerId: employer.id,
    ...(status ? { status } : {}),
  };

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: {
        member: {
          select: {
            totalSavings: true,
            membership: { select: { status: true, expiryDate: true } },
          },
        },
      },
    }),
    prisma.employee.count({ where }),
  ]);

  return ApiResponse.success(res, {
    employees,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/employer/employees
// Add a single employee manually
// Body: { name, email }
// ─────────────────────────────────────────────────────────────────────────────
exports.addEmployee = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) throw ApiError.badRequest("Name and email are required");

  const employer = await prisma.employer.findUnique({
    where: { userId: req.user.id },
  });
  if (!employer) throw ApiError.notFound("Employer not found");
  if (employer.status !== "APPROVED") {
    throw ApiError.forbidden("Account not approved");
  }

  // Check seat availability
  const available = employer.seatsPurchased - employer.seatsUsed;
  if (available <= 0) {
    throw ApiError.badRequest(
      "No seats available. Please purchase more seats.",
    );
  }

  // Check duplicate email under this employer
  const existing = await prisma.employee.findUnique({
    where: {
      employerId_email: { employerId: employer.id, email: email.toLowerCase() },
    },
  });
  if (existing) {
    throw ApiError.conflict("This employee has already been invited");
  }

  const inviteToken = generateInviteToken();
  const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const employee = await prisma.employee.create({
    data: {
      employerId: employer.id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      status: "INVITED",
      inviteToken,
      inviteExpiresAt,
      inviteSentAt: new Date(),
    },
  });

  // Increment seatsUsed immediately on invite (reserve the seat)
  await prisma.employer.update({
    where: { id: employer.id },
    data: { seatsUsed: { increment: 1 } },
  });

  // Send welcome/invite email
  await sendEmployeeInviteEmail({
    employeeName: name,
    employeeEmail: email,
    companyName: employer.companyName,
    inviteToken,
  });

  return ApiResponse.created(res, employee, "Employee invited successfully");
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/employer/employees/bulk
// Upload employees via parsed CSV array (parsed on frontend or by multer middleware)
// Body: { employees: [{ name, email }] }
// ─────────────────────────────────────────────────────────────────────────────
exports.bulkAddEmployees = asyncHandler(async (req, res) => {
  const { employees: employeeList } = req.body;

  if (!Array.isArray(employeeList) || employeeList.length === 0) {
    throw ApiError.badRequest(
      "employees array is required and must not be empty",
    );
  }

  const employer = await prisma.employer.findUnique({
    where: { userId: req.user.id },
  });
  if (!employer) throw ApiError.notFound("Employer not found");
  if (employer.status !== "APPROVED") {
    throw ApiError.forbidden("Account not approved");
  }

  const available = employer.seatsPurchased - employer.seatsUsed;
  if (employeeList.length > available) {
    throw ApiError.badRequest(
      `Not enough seats. You have ${available} seat(s) available but tried to add ${employeeList.length}`,
    );
  }

  // Deduplicate incoming list
  const uniqueList = [
    ...new Map(employeeList.map((e) => [e.email.toLowerCase(), e])).values(),
  ];

  // Find emails that already exist under this employer
  const existingEmails = await prisma.employee.findMany({
    where: {
      employerId: employer.id,
      email: { in: uniqueList.map((e) => e.email.toLowerCase()) },
    },
    select: { email: true },
  });
  const existingSet = new Set(existingEmails.map((e) => e.email));

  const toCreate = uniqueList.filter(
    (e) => !existingSet.has(e.email.toLowerCase()),
  );
  const skipped = uniqueList.filter((e) =>
    existingSet.has(e.email.toLowerCase()),
  );

  if (toCreate.length === 0) {
    return ApiResponse.success(
      res,
      { created: 0, skipped: skipped.length },
      "All employees already invited",
    );
  }

  const now = new Date();
  const inviteExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Build records with unique invite tokens
  const records = toCreate.map((e) => ({
    employerId: employer.id,
    name: e.name.trim(),
    email: e.email.toLowerCase().trim(),
    status: "INVITED",
    inviteToken: generateInviteToken(),
    inviteExpiresAt,
    inviteSentAt: now,
  }));

  await prisma.employee.createMany({ data: records });

  // Increment seatsUsed by how many were actually created
  await prisma.employer.update({
    where: { id: employer.id },
    data: { seatsUsed: { increment: toCreate.length } },
  });

  // Fire-and-forget welcome emails (don't fail the request if email fails)
  const createdEmployees = await prisma.employee.findMany({
    where: {
      employerId: employer.id,
      email: { in: toCreate.map((e) => e.email.toLowerCase()) },
    },
  });

  Promise.allSettled(
    createdEmployees.map((emp) =>
      sendEmployeeInviteEmail({
        employeeName: emp.name,
        employeeEmail: emp.email,
        companyName: employer.companyName,
        inviteToken: emp.inviteToken,
      }),
    ),
  ).catch((err) => console.error("Bulk invite email error:", err));

  return ApiResponse.created(
    res,
    {
      created: toCreate.length,
      skipped: skipped.length,
      skippedEmails: skipped.map((e) => e.email),
    },
    `${toCreate.length} employee(s) invited successfully`,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/employer/employees/:id/resend-invite
// Resend the invite email to a INVITED employee
// ─────────────────────────────────────────────────────────────────────────────
exports.resendInvite = asyncHandler(async (req, res) => {
  const employer = await prisma.employer.findUnique({
    where: { userId: req.user.id },
  });
  if (!employer) throw ApiError.notFound("Employer not found");

  const employee = await prisma.employee.findFirst({
    where: { id: req.params.id, employerId: employer.id },
  });
  if (!employee) throw ApiError.notFound("Employee not found");
  if (employee.status !== "INVITED") {
    throw ApiError.badRequest(
      "Can only resend invite to employees with INVITED status",
    );
  }

  // Refresh the token and expiry
  const inviteToken = generateInviteToken();
  const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.employee.update({
    where: { id: employee.id },
    data: { inviteToken, inviteExpiresAt, inviteSentAt: new Date() },
  });

  await sendEmployeeInviteEmail({
    employeeName: employee.name,
    employeeEmail: employee.email,
    companyName: employer.companyName,
    inviteToken,
  });

  return ApiResponse.success(res, {}, "Invite resent successfully");
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/employer/employees/:id
// Remove an employee — frees up the seat, deactivates their membership
// ─────────────────────────────────────────────────────────────────────────────
exports.removeEmployee = asyncHandler(async (req, res) => {
  const employer = await prisma.employer.findUnique({
    where: { userId: req.user.id },
  });
  if (!employer) throw ApiError.notFound("Employer not found");

  const employee = await prisma.employee.findFirst({
    where: { id: req.params.id, employerId: employer.id },
  });
  if (!employee) throw ApiError.notFound("Employee not found");
  if (employee.status === "REMOVED") {
    throw ApiError.badRequest("Employee already removed");
  }

  const wasActive = employee.status === "ACTIVE";

  // Mark employee as REMOVED
  await prisma.employee.update({
    where: { id: employee.id },
    data: { status: "REMOVED" },
  });

  // If they had a linked member + membership, cancel the membership
  if (employee.memberId) {
    await prisma.membership.updateMany({
      where: {
        memberId: employee.memberId,
        employerId: employer.id,
        status: { in: ["ACTIVE", "PENDING"] },
      },
      data: { status: "CANCELLED" },
    });

    // Deactivate their user account
    if (employee.userId) {
      await prisma.user.update({
        where: { id: employee.userId },
        data: { isActive: false },
      });
    }
  }

  // Free the seat only if they were ACTIVE or INVITED (reserved seat)
  await prisma.employer.update({
    where: { id: employer.id },
    data: { seatsUsed: { decrement: 1 } },
  });

  return ApiResponse.success(res, {}, "Employee removed successfully");
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/employer/employees/accept-invite/:token
// Called when the employee clicks the link in their welcome email.
// Creates their User + Member + Membership records, links to Employee record.
// PUBLIC route — no auth required
// ─────────────────────────────────────────────────────────────────────────────
exports.acceptInvite = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) throw ApiError.badRequest("Password is required");
  if (password.length < 6)
    throw ApiError.badRequest("Password must be at least 6 characters");

  const employee = await prisma.employee.findUnique({
    where: { inviteToken: token },
    include: { employer: true },
  });

  if (!employee) throw ApiError.badRequest("Invalid or expired invite link");
  if (employee.status === "ACTIVE") {
    throw ApiError.badRequest("Invite already accepted");
  }
  if (employee.status === "REMOVED") {
    throw ApiError.forbidden("This invite has been revoked");
  }
  if (employee.inviteExpiresAt && employee.inviteExpiresAt < new Date()) {
    throw ApiError.badRequest(
      "Invite link has expired. Ask your employer to resend.",
    );
  }

  // Check email not already registered
  const existingUser = await prisma.user.findUnique({
    where: { email: employee.email },
  });
  if (existingUser)
    throw ApiError.conflict("An account with this email already exists");

  const bcrypt = require("bcryptjs");
  const hashedPassword = await bcrypt.hash(password, 12);
  const crypto = require("crypto");

  const nameParts = employee.name.trim().split(" ");
  const firstName = nameParts[0] || employee.name;
  const lastName = nameParts.slice(1).join(" ") || firstName;

  const now = new Date();
  const membershipExpiry =
    employee.employer.planExpiryDate ||
    (() => {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() + 1);
      return d;
    })();

  // Create User → Member → Membership in one nested write
  const user = await prisma.user.create({
    data: {
      email: employee.email,
      password: hashedPassword,
      role: "MEMBER",
      isEmailVerified: true, // pre-verified via employer invite
      emailVerifyToken: null,
      member: {
        create: {
          firstName,
          lastName,
          employerId: employee.employerId,
          membership: {
            create: {
              type: "EMPLOYER",
              status: "ACTIVE",
              priceUSD: 0, // covered by employer bulk purchase
              startDate: now,
              expiryDate: membershipExpiry,
              employerId: employee.employerId,
              paymentStatus: "COMPLETED",
            },
          },
        },
      },
    },
    include: { member: { include: { membership: true } } },
  });

  // Link the Employee record to the new User + Member
  await prisma.employee.update({
    where: { id: employee.id },
    data: {
      status: "ACTIVE",
      userId: user.id,
      memberId: user.member.id,
      inviteToken: null, // consume the token
      inviteAcceptedAt: now,
    },
  });

  // Send welcome confirmation email
  await sendEmployeeWelcomeEmail({
    employeeName: employee.name,
    employeeEmail: employee.email,
    companyName: employee.employer.companyName,
    membershipExpiry,
  }).catch((err) => console.error("Welcome email failed:", err.message));

  return ApiResponse.created(
    res,
    {
      message: "Account activated successfully",
      email: employee.email,
    },
    "Welcome to Discount Club Cayman!",
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/employer/dashboard
// Returns ROI summary, employee stats, savings breakdown, top categories
// ─────────────────────────────────────────────────────────────────────────────
exports.getDashboard = asyncHandler(async (req, res) => {
  const employer = await prisma.employer.findUnique({
    where: { userId: req.user.id },
    include: {
      _count: { select: { employees: true } },
    },
  });
  if (!employer) throw ApiError.notFound("Employer not found");

  // Employee status breakdown
  const [activeCount, invitedCount, removedCount] = await Promise.all([
    prisma.employee.count({
      where: { employerId: employer.id, status: "ACTIVE" },
    }),
    prisma.employee.count({
      where: { employerId: employer.id, status: "INVITED" },
    }),
    prisma.employee.count({
      where: { employerId: employer.id, status: "REMOVED" },
    }),
  ]);

  // Aggregate all employee savings from their Member records
  const employeeMembers = await prisma.employee.findMany({
    where: {
      employerId: employer.id,
      status: "ACTIVE",
      memberId: { not: null },
    },
    select: { memberId: true, totalSavings: true, totalRedemptions: true },
  });

  const totalSavings = employeeMembers.reduce((s, e) => s + e.totalSavings, 0);
  const totalRedemptions = employeeMembers.reduce(
    (s, e) => s + e.totalRedemptions,
    0,
  );

  // ROI = totalSavings / totalMembershipCost * 100
  const roi =
    employer.totalMembershipCost > 0
      ? ((totalSavings / employer.totalMembershipCost) * 100).toFixed(1)
      : "0.0";

  // Top 5 employees by savings
  const topEmployees = await prisma.employee.findMany({
    where: { employerId: employer.id, status: "ACTIVE" },
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

  // Monthly savings trend (last 6 months) via member transactions
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const memberIds = employeeMembers
    .filter((e) => e.memberId)
    .map((e) => e.memberId);

  const transactions =
    memberIds.length > 0
      ? await prisma.transaction.findMany({
          where: {
            memberId: { in: memberIds },
            transactionDate: { gte: sixMonthsAgo },
            status: "COMPLETED",
          },
          select: {
            savingsAmount: true,
            transactionDate: true,
            businessCategory: true,
          },
        })
      : [];

  // Group by month
  const monthlyMap = {};
  transactions.forEach(({ savingsAmount, transactionDate }) => {
    const key = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = (monthlyMap[key] || 0) + savingsAmount;
  });
  const monthlySavings = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, savings]) => ({
      month,
      savings: parseFloat(savings.toFixed(2)),
    }));

  // Top categories used by employees
  const categoryMap = {};
  transactions.forEach(({ businessCategory }) => {
    if (!businessCategory) return;
    categoryMap[businessCategory] = (categoryMap[businessCategory] || 0) + 1;
  });
  const topCategories = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  return ApiResponse.success(res, {
    // Seat summary
    seatsPurchased: employer.seatsPurchased,
    seatsUsed: employer.seatsUsed,
    seatsAvailable: employer.seatsPurchased - employer.seatsUsed,
    planType: employer.planType,
    planExpiryDate: employer.planExpiryDate,

    // Employee counts
    employeeCounts: {
      total: employer._count.employees,
      active: activeCount,
      invited: invitedCount,
      removed: removedCount,
    },

    // ROI
    roi: {
      totalMembershipCost: employer.totalMembershipCost,
      totalSavings: parseFloat(totalSavings.toFixed(2)),
      totalRedemptions,
      roiPercent: parseFloat(roi),
      avgSavingsPerEmployee:
        activeCount > 0
          ? parseFloat((totalSavings / activeCount).toFixed(2))
          : 0,
    },

    // Charts
    topEmployees,
    monthlySavings,
    topCategories,
  });
});
