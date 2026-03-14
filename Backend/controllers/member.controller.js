const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const { generateMemberQR } = require("../services/qr.service");
const { buildMemberSummary } = require("../utils/savingsCalculator");
const { getPagination, buildPaginationMeta } = require("../utils/paginate");

const parseOptionalInt = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (value === "") return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeString = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
};

const normalizeChoice = (value) => {
  const normalized = normalizeString(value);
  if (normalized === undefined) return undefined;
  return normalized ? normalized.toLowerCase() : null;
};

// ── Get my profile ────────────────────────────────────
exports.getProfile = asyncHandler(async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
    include: {
      user: { select: { email: true, isEmailVerified: true, createdAt: true } },
      membership: true,
      employer: { select: { companyName: true, logoUrl: true } },
      association: { select: { name: true, logoUrl: true } },
    },
  });
  if (!member) throw ApiError.notFound("Member profile not found");

  const summary = buildMemberSummary(member, member.membership);
  return ApiResponse.success(res, { ...member, summary });
});

// ── Update my profile ─────────────────────────────────
exports.updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, age, sex, district, salaryLevel } =
    req.body;

  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
  });
  if (!member) throw ApiError.notFound("Member not found");

  const updated = await prisma.member.update({
    where: { id: member.id },
    data: {
      firstName: normalizeString(firstName),
      lastName: normalizeString(lastName),
      phone: normalizeString(phone),
      age: parseOptionalInt(age),
      sex: normalizeChoice(sex),
      district: normalizeString(district),
      salaryLevel: normalizeChoice(salaryLevel),
    },
  });

  // Regenerate QR if demographic data changed
  const newQR = await generateMemberQR(updated);
  await prisma.member.update({
    where: { id: member.id },
    data: { qrCode: newQR },
  });

  return ApiResponse.success(res, updated, "Profile updated");
});

// ── Get my QR code ────────────────────────────────────
exports.getMyQR = asyncHandler(async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
  });
  if (!member) throw ApiError.notFound("Member not found");

  // Regenerate if missing
  let qrCode = member.qrCode;
  if (!qrCode) {
    qrCode = await generateMemberQR(member);
    await prisma.member.update({ where: { id: member.id }, data: { qrCode } });
  }

  return ApiResponse.success(res, { qrCode });
});

// ── Savings dashboard ─────────────────────────────────
exports.getSavingsDashboard = asyncHandler(async (req, res) => {
  const { period = "lifetime" } = req.query; // week | month | 3months | year | lifetime

  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
    include: { membership: true },
  });
  if (!member) throw ApiError.notFound("Member not found");

  // Date filter
  const dateFilter = buildDateFilter(period);

  const transactions = await prisma.transaction.findMany({
    where: {
      memberId: member.id,
      ...(dateFilter && { transactionDate: dateFilter }),
    },
    include: {
      business: { select: { name: true, category: true } },
      offer: { select: { title: true, type: true } },
    },
    orderBy: { transactionDate: "desc" },
  });

  const certPurchases = await prisma.certificatePurchase.findMany({
    where: {
      memberId: member.id,
      ...(dateFilter && { createdAt: dateFilter }),
    },
  });

  const transactionSavings = transactions.reduce(
    (sum, t) => sum + (t.savingsAmount || 0),
    0,
  );
  const certSavings = certPurchases.reduce(
    (sum, c) => sum + (c.savingsAmount || 0),
    0,
  );
  const totalSavings = transactionSavings + certSavings;

  const summary = buildMemberSummary(
    { ...member, totalSavings },
    member.membership,
  );

  return ApiResponse.success(res, {
    period,
    summary,
    transactions,
    certPurchases,
    savingsByCategory: groupByCategory(transactions),
  });
});

// ── Transaction history ───────────────────────────────
exports.getTransactionHistory = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
  });
  if (!member) throw ApiError.notFound("Member not found");

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { memberId: member.id },
      include: {
        business: { select: { name: true, category: true, logoUrl: true } },
        offer: true,
      },
      orderBy: { transactionDate: "desc" },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where: { memberId: member.id } }),
  ]);

  return ApiResponse.paginated(
    res,
    transactions,
    buildPaginationMeta(total, page, limit),
  );
});

// ── Helpers ───────────────────────────────────────────
function buildDateFilter(period) {
  const now = new Date();
  if (period === "week") return { gte: new Date(now - 7 * 86400000) };
  if (period === "month") return { gte: new Date(now - 30 * 86400000) };
  if (period === "3months") return { gte: new Date(now - 90 * 86400000) };
  if (period === "year") return { gte: new Date(now - 365 * 86400000) };
  return null; // lifetime
}

function groupByCategory(transactions) {
  return transactions.reduce((acc, t) => {
    const cat = t.businessCategory || "Other";
    acc[cat] = (acc[cat] || 0) + (t.savingsAmount || 0);
    return acc;
  }, {});
}
