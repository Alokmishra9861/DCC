const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const { decodeQR } = require("../services/qr.service");
const { calcDiscountSavings } = require("../utils/savingsCalculator");
const { isMembershipActive } = require("../services/membership.service");

/**
 * POST /api/transactions/scan
 * Called by Business App after scanning member QR
 */
exports.recordTransaction = asyncHandler(async (req, res) => {
  const { qrData, saleAmount, offerId } = req.body;

  // 1. Decode QR
  const qrPayload = decodeQR(qrData);

  // 2. Find member
  const member = await prisma.member.findUnique({
    where: { id: qrPayload.memberId },
    include: { user: true },
  });
  if (!member) throw ApiError.notFound("Member not found");

  // 3. Check active membership
  const active = await isMembershipActive(member.id);
  if (!active)
    throw ApiError.forbidden("Member does not have an active membership");

  // 4. Get business (from authenticated business user)
  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business)
    throw ApiError.forbidden(
      "Only registered businesses can record transactions",
    );

  // 5. Get offer (optional)
  let offer = null;
  if (offerId) {
    offer = await prisma.offer.findUnique({ where: { id: offerId } });
    if (offer?.businessId !== business.id)
      throw ApiError.badRequest("Offer does not belong to your business");
  }

  // 6. Calculate savings
  const savingsAmount = calcDiscountSavings(saleAmount, offer);

  // 7. Create transaction with denormalized analytics data
  const transaction = await prisma.transaction.create({
    data: {
      memberId: member.id,
      businessId: business.id,
      offerId: offerId || null,
      saleAmount: parseFloat(saleAmount),
      savingsAmount,
      discountAmount: savingsAmount,

      // Snapshot member demographics for analytics
      memberAge: member.age,
      memberSex: member.sex,
      memberDistrict: member.district,
      memberSalaryLevel: member.salaryLevel,

      // Snapshot business info
      businessCategory: business.category,
      businessDistrict: business.district,

      status: "COMPLETED",
    },
  });

  // 8. Update member aggregate savings
  await prisma.member.update({
    where: { id: member.id },
    data: {
      totalSavings: { increment: savingsAmount },
      totalSpent: { increment: saleAmount },
    },
  });

  // 9. Propagate savings to employer/association
  if (member.employerId) {
    await prisma.employer.update({
      where: { id: member.employerId },
      data: { totalSavings: { increment: savingsAmount } },
    });
  }
  if (member.associationId) {
    await prisma.association.update({
      where: { id: member.associationId },
      data: { totalSavings: { increment: savingsAmount } },
    });
  }

  // 10. Track offer analytics
  if (offer) {
    await prisma.offer.update({
      where: { id: offer.id },
      data: { clicks: { increment: 1 } },
    });
  }

  return ApiResponse.created(res, {
    transaction,
    memberName: `${member.firstName} ${member.lastName}`,
    savingsAmount,
    message: `Transaction recorded. Member saved $${savingsAmount.toFixed(2)}.`,
  });
});

/**
 * GET /api/transactions/business
 * Business sees all their own transactions
 */
exports.getBusinessTransactions = asyncHandler(async (req, res) => {
  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business) throw ApiError.notFound("Business not found");

  const transactions = await prisma.transaction.findMany({
    where: { businessId: business.id },
    orderBy: { transactionDate: "desc" },
    take: 100,
  });

  const totalRevenue = transactions.reduce((s, t) => s + t.saleAmount, 0);
  const totalSavingsGiven = transactions.reduce(
    (s, t) => s + t.savingsAmount,
    0,
  );

  return ApiResponse.success(res, {
    transactions,
    totalRevenue,
    totalSavingsGiven,
  });
});
