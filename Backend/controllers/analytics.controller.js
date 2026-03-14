const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const ExcelJS = require("exceljs");

// ── Admin: platform overview ──────────────────────────
exports.getPlatformOverview = asyncHandler(async (req, res) => {
  const { period = "month" } = req.query;
  const dateFilter = buildDateFilter(period);

  const [
    totalMembers,
    activeMembers,
    totalBusinesses,
    totalTransactions,
    totalSavings,
    totalRevenue,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.membership.count({ where: { status: "ACTIVE" } }),
    prisma.business.count({ where: { isApproved: true } }),
    prisma.transaction.count({
      where: dateFilter ? { transactionDate: dateFilter } : {},
    }),
    prisma.transaction.aggregate({
      _sum: { savingsAmount: true },
      where: dateFilter ? { transactionDate: dateFilter } : {},
    }),
    prisma.transaction.aggregate({
      _sum: { saleAmount: true },
      where: dateFilter ? { transactionDate: dateFilter } : {},
    }),
  ]);

  return ApiResponse.success(res, {
    period,
    totalMembers,
    activeMembers,
    totalBusinesses,
    totalTransactions,
    totalSavings: totalSavings._sum.savingsAmount || 0,
    totalRevenue: totalRevenue._sum.saleAmount || 0,
  });
});

// ── Admin: savings by category ─────────────────────────
exports.getSavingsByCategory = asyncHandler(async (req, res) => {
  const { period } = req.query;
  const dateFilter = buildDateFilter(period);

  const data = await prisma.transaction.groupBy({
    by: ["businessCategory"],
    where: dateFilter ? { transactionDate: dateFilter } : {},
    _sum: { savingsAmount: true, saleAmount: true },
    _count: { id: true },
    orderBy: { _sum: { savingsAmount: "desc" } },
  });

  return ApiResponse.success(res, data);
});

// ── Admin: savings by district ─────────────────────────
exports.getSavingsByDistrict = asyncHandler(async (req, res) => {
  const { period } = req.query;
  const dateFilter = buildDateFilter(period);

  const data = await prisma.transaction.groupBy({
    by: ["memberDistrict"],
    where: dateFilter ? { transactionDate: dateFilter } : {},
    _sum: { savingsAmount: true },
    _count: { id: true },
  });

  return ApiResponse.success(res, data);
});

// ── Admin: savings by demographics ────────────────────
exports.getSavingsByDemographics = asyncHandler(async (req, res) => {
  const { period } = req.query;
  const dateFilter = buildDateFilter(period);
  const where = dateFilter ? { transactionDate: dateFilter } : {};

  const [bySex, bySalaryLevel] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["memberSex"],
      where,
      _sum: { savingsAmount: true },
      _count: { id: true },
    }),
    prisma.transaction.groupBy({
      by: ["memberSalaryLevel"],
      where,
      _sum: { savingsAmount: true },
      _count: { id: true },
    }),
  ]);

  return ApiResponse.success(res, { bySex, bySalaryLevel });
});

// ── Admin: membership demographics ───────────────────
exports.getMembershipAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate, district, sex, salaryLevel, ageGroup } =
    req.query;

  const memberWhere = {};
  if (startDate && endDate) {
    memberWhere.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }
  if (district && district !== "all") memberWhere.district = district;
  if (sex && sex !== "all") memberWhere.sex = sex;
  if (salaryLevel && salaryLevel !== "all")
    memberWhere.salaryLevel = salaryLevel;

  const ageRange = parseAgeGroup(ageGroup);
  if (ageRange) {
    memberWhere.age = {
      gte: ageRange.min,
      ...(ageRange.max ? { lte: ageRange.max } : {}),
    };
  }

  const members = await prisma.member.findMany({
    where: memberWhere,
    select: {
      id: true,
      age: true,
      sex: true,
      salaryLevel: true,
      district: true,
      createdAt: true,
    },
  });

  const memberIds = members.map((m) => m.id);
  const membershipByTypeRaw = memberIds.length
    ? await prisma.membership.groupBy({
        by: ["type"],
        where: { memberId: { in: memberIds } },
        _count: { _all: true },
      })
    : [];

  const byType = membershipByTypeRaw.map((item) => ({
    name: item.type,
    value: item._count._all,
  }));

  const byDistrict = groupCounts(members, (m) => m.district);
  const bySex = groupCounts(members, (m) => m.sex);
  const bySalaryLevel = groupCounts(members, (m) => m.salaryLevel);
  const byAgeGroup = groupCounts(members, (m) => bucketAge(m.age));
  const byMonth = groupByMonth(members);

  return ApiResponse.success(res, {
    total: members.length,
    byType,
    byDistrict,
    bySex,
    bySalaryLevel,
    byAgeGroup,
    byMonth,
  });
});

// ── Admin: time-series comparison ─────────────────────
exports.getTimeSeries = asyncHandler(async (req, res) => {
  const { compareBy = "month" } = req.query; // today|week|month|quarter|year

  const { current, previous } = getComparisonRanges(compareBy);

  const [currentData, previousData] = await Promise.all([
    prisma.transaction.aggregate({
      where: { transactionDate: { gte: current.start, lte: current.end } },
      _sum: { savingsAmount: true, saleAmount: true },
      _count: { id: true },
    }),
    prisma.transaction.aggregate({
      where: { transactionDate: { gte: previous.start, lte: previous.end } },
      _sum: { savingsAmount: true, saleAmount: true },
      _count: { id: true },
    }),
  ]);

  const pctChange = (curr, prev) => {
    if (!prev) return null;
    return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
  };

  return ApiResponse.success(res, {
    compareBy,
    current: { ...currentData._sum, transactions: currentData._count.id },
    previous: { ...previousData._sum, transactions: previousData._count.id },
    changes: {
      savingsAmount: pctChange(
        currentData._sum.savingsAmount || 0,
        previousData._sum.savingsAmount || 0,
      ),
      saleAmount: pctChange(
        currentData._sum.saleAmount || 0,
        previousData._sum.saleAmount || 0,
      ),
      transactions: pctChange(currentData._count.id, previousData._count.id),
    },
  });
});

// ── Admin: export report ───────────────────────────────
exports.exportReport = asyncHandler(async (req, res) => {
  const { entity = "transactions", startDate, endDate } = req.query;

  const dateFilter =
    startDate && endDate
      ? { gte: new Date(startDate), lte: new Date(endDate) }
      : undefined;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("DCC Report");

  if (entity === "transactions") {
    const data = await prisma.transaction.findMany({
      where: dateFilter ? { transactionDate: dateFilter } : {},
      include: {
        member: { select: { firstName: true, lastName: true, district: true } },
        business: { select: { name: true, category: true } },
      },
      orderBy: { transactionDate: "desc" },
      take: 10000,
    });

    sheet.columns = [
      { header: "Date", key: "date", width: 20 },
      { header: "Member", key: "member", width: 25 },
      { header: "District", key: "district", width: 15 },
      { header: "Business", key: "business", width: 25 },
      { header: "Category", key: "category", width: 20 },
      { header: "Sale Amount", key: "saleAmount", width: 15 },
      { header: "Savings Amount", key: "savings", width: 15 },
    ];

    data.forEach((t) => {
      sheet.addRow({
        date: t.transactionDate.toISOString().split("T")[0],
        member: `${t.member.firstName} ${t.member.lastName}`,
        district: t.member.district,
        business: t.business.name,
        category: t.business.category,
        saleAmount: t.saleAmount,
        savings: t.savingsAmount,
      });
    });
  }

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=dcc-report-${entity}-${Date.now()}.xlsx`,
  );
  await workbook.xlsx.write(res);
  res.end();
});

// ── Helpers ───────────────────────────────────────────
function buildDateFilter(period) {
  if (!period || period === "lifetime") return null;
  const now = new Date();
  const map = { week: 7, month: 30, "3months": 90, year: 365 };
  const days = map[period];
  if (!days) return null;
  return { gte: new Date(now - days * 86400000) };
}

function getComparisonRanges(compareBy) {
  const now = new Date();
  const ranges = {
    today: { days: 1 },
    week: { days: 7 },
    month: { days: 30 },
    quarter: { days: 90 },
    year: { days: 365 },
  };
  const { days } = ranges[compareBy] || ranges.month;
  const ms = days * 86400000;
  return {
    current: { start: new Date(now - ms), end: now },
    previous: { start: new Date(now - ms * 2), end: new Date(now - ms) },
  };
}

function parseAgeGroup(ageGroup) {
  if (!ageGroup || ageGroup === "all") return null;
  const trimmed = String(ageGroup).trim();
  if (trimmed.endsWith("+")) {
    const min = parseInt(trimmed.replace("+", ""), 10);
    if (Number.isNaN(min)) return null;
    return { min, max: null };
  }
  const match = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
  if (!match) return null;
  const min = parseInt(match[1], 10);
  const max = parseInt(match[2], 10);
  if (Number.isNaN(min) || Number.isNaN(max)) return null;
  return { min, max };
}

function bucketAge(age) {
  if (age === null || age === undefined) return "Unknown";
  const value = Number(age);
  if (!Number.isFinite(value)) return "Unknown";
  if (value < 18) return "<18";
  if (value <= 24) return "18-24";
  if (value <= 34) return "25-34";
  if (value <= 44) return "35-44";
  if (value <= 54) return "45-54";
  return "55+";
}

function normalizeKey(value) {
  if (value === null || value === undefined || value === "") return "Unknown";
  return String(value).trim();
}

function formatLabel(value) {
  if (!value || value === "Unknown") return "Unknown";
  const cleaned = String(value).replace(/_/g, " ");
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
}

function groupCounts(items, keyFn) {
  const map = new Map();
  items.forEach((item) => {
    const key = normalizeKey(keyFn(item));
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries()).map(([name, value]) => ({
    name: formatLabel(name),
    value,
  }));
}

function groupByMonth(members) {
  const map = new Map();
  members.forEach((m) => {
    const date = m.createdAt ? new Date(m.createdAt) : null;
    if (!date || Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
    map.set(key, (map.get(key) || 0) + 1);
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([key, count]) => {
      const [year, month] = key.split("-");
      const date = new Date(`${year}-${month}-01T00:00:00Z`);
      const label = date.toLocaleString("en-US", {
        month: "short",
        year: "2-digit",
      });
      return { month: label, count };
    });
}
