const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const { decodeQR } = require("../services/qr.service");
const notificationService = require("../services/notification.service");
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

  // 4. Get business (from authenticated business user) — include category for snapshot
  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
    include: { category: { select: { name: true } } },
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

      // Snapshot business info — store the category NAME string for analytics groupBy
      businessCategory: business.category?.name || null,
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
      data: {
        totalSavings: { increment: savingsAmount },
        totalRedemptions: { increment: 1 },
      },
    });
    // BUG 3 FIX: also update the individual Employee record savings
    await prisma.employee.updateMany({
      where: { memberId: member.id, employerId: member.employerId },
      data: {
        totalSavings: { increment: savingsAmount },
        totalRedemptions: { increment: 1 },
      },
    });
  }
  if (member.associationId) {
    await prisma.association.update({
      where: { id: member.associationId },
      data: { totalSavings: { increment: savingsAmount } },
    });
    // ISSUE 9 FIX: also update AssociationMember record savings
    await prisma.associationMember.updateMany({
      where: { memberId: member.id, associationId: member.associationId },
      data: {
        totalSavings: { increment: savingsAmount },
        totalRedemptions: { increment: 1 },
      },
    });
  }

  // 10. Track offer analytics
  if (offer) {
    await prisma.offer.update({
      where: { id: offer.id },
      data: { clicks: { increment: 1 } },
    });
  }

  // Trigger Notifications
  try {
    // 1. Notify the Member (Buyer)
    await notificationService.createNotification(
      member.userId,
      "Transaction Logged! 💳",
      `You saved $${savingsAmount.toFixed(2)} on a purchase of $${parseFloat(saleAmount).toFixed(2)} at "${business.name}".`,
      "INFO"
    );

    // 2. Notify the Business Owner (Seller)
    await notificationService.createNotification(
      business.userId,
      "Transaction Recorded! 💳",
      `Logged a purchase of $${parseFloat(saleAmount).toFixed(2)} for ${member.firstName} ${member.lastName} (Member saved $${savingsAmount.toFixed(2)}).`,
      "BOOKING"
    );
  } catch (notifErr) {
    console.error("Transaction recording notification failed:", notifErr.message);
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

/**
 * POST /api/transactions/scan-details
 * Called by Business App before or after scanning a QR (member QR or certificate QR)
 * Returns comprehensive details of the scanned member, their transactions, certificates, and available offers.
 */
exports.getScanDetails = asyncHandler(async (req, res) => {
  const { qrData } = req.body;
  if (!qrData) throw ApiError.badRequest("qrData is required");

  // Get business (from authenticated business user)
  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business) {
    throw ApiError.forbidden("Only registered businesses can scan member QR codes");
  }

  let resolvedMemberId = null;
  let resolvedCertificatePurchase = null;
  let scannedType = "MEMBER";

  // 1. Try to parse as JSON (standard Member QR)
  try {
    const parsed = JSON.parse(qrData);
    if (parsed && parsed.memberId) {
      resolvedMemberId = parsed.memberId;
    }
  } catch (err) {
    // Not valid JSON, continue to other formats
  }

  // 2. Try to parse as DCC-MEMBER-userId-timestamp format
  if (!resolvedMemberId && typeof qrData === "string" && qrData.startsWith("DCC-MEMBER-")) {
    const parts = qrData.split("-");
    if (parts.length >= 3) {
      const userId = parts[2];
      const memberByUserId = await prisma.member.findUnique({
        where: { userId },
      });
      if (memberByUserId) {
        resolvedMemberId = memberByUserId.id;
      }
    }
  }

  // 3. Try to parse as Certificate uniqueCode (starts with DISC-)
  if (!resolvedMemberId && typeof qrData === "string" && qrData.toUpperCase().startsWith("DISC-")) {
    const code = qrData.trim().toUpperCase();
    const purchase = await prisma.certificatePurchase.findFirst({
      where: { uniqueCode: code },
      include: {
        certificate: {
          include: {
            offer: true,
          },
        },
      },
    });
    if (purchase) {
      resolvedCertificatePurchase = purchase;
      resolvedMemberId = purchase.memberId;
      scannedType = "CERTIFICATE";
    }
  }

  // 4. Try to parse as 24-character hexadecimal MongoDB ObjectId
  if (!resolvedMemberId && typeof qrData === "string" && /^[0-9a-fA-F]{24}$/.test(qrData)) {
    const purchase = await prisma.certificatePurchase.findUnique({
      where: { id: qrData },
      include: {
        certificate: {
          include: {
            offer: true,
          },
        },
      },
    });
    if (purchase) {
      resolvedCertificatePurchase = purchase;
      resolvedMemberId = purchase.memberId;
      scannedType = "CERTIFICATE";
    } else {
      const memberDirect = await prisma.member.findUnique({
        where: { id: qrData },
      });
      if (memberDirect) {
        resolvedMemberId = memberDirect.id;
      } else {
        const memberByUser = await prisma.member.findUnique({
          where: { userId: qrData },
        });
        if (memberByUser) {
          resolvedMemberId = memberByUser.id;
        }
      }
    }
  }

  // 5. Fallback check as uniqueCode without DISC- prefix
  if (!resolvedMemberId && typeof qrData === "string") {
    const code = qrData.trim().toUpperCase();
    const purchase = await prisma.certificatePurchase.findFirst({
      where: { uniqueCode: code },
      include: {
        certificate: {
          include: {
            offer: true,
          },
        },
      },
    });
    if (purchase) {
      resolvedCertificatePurchase = purchase;
      resolvedMemberId = purchase.memberId;
      scannedType = "CERTIFICATE";
    }
  }

  if (!resolvedMemberId) {
    throw ApiError.notFound("Could not resolve member or certificate from the scanned QR code");
  }

  // Fetch full Member profile
  const member = await prisma.member.findUnique({
    where: { id: resolvedMemberId },
    include: {
      user: {
        select: {
          email: true,
        },
      },
      membership: true,
    },
  });

  if (!member) {
    throw ApiError.notFound("Member profile not found");
  }

  // Fetch past transactions for this member at this business
  const pastTransactions = await prisma.transaction.findMany({
    where: {
      memberId: member.id,
      businessId: business.id,
    },
    include: {
      offer: {
        select: {
          title: true,
          type: true,
        },
      },
    },
    orderBy: {
      transactionDate: "desc",
    },
  });

  // Fetch eligible (unredeemed) certificate purchases for this member at this business
  const eligibleCertificates = await prisma.certificatePurchase.findMany({
    where: {
      memberId: member.id,
      certificate: {
        offer: {
          businessId: business.id,
        },
      },
      status: "PURCHASED",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch active offers for this business
  const businessOffers = await prisma.offer.findMany({
    where: {
      businessId: business.id,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Format response details
  const memberDetails = {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    fullName: `${member.firstName} ${member.lastName}`,
    email: member.user?.email || null,
    phone: member.phone || null,
    avatarUrl: member.avatarUrl || null,
    district: member.district || null,
    sex: member.sex || null,
    age: member.age || null,
    membershipStatus: member.membership?.status || "INACTIVE",
    membershipType: member.membership?.type || null,
    totalSavings: member.totalSavings,
    totalSpent: member.totalSpent,
  };

  const formattedTransactions = pastTransactions.map((t) => ({
    id: t.id,
    saleAmount: t.saleAmount,
    discountAmount: t.discountAmount,
    savingsAmount: t.savingsAmount,
    status: t.status,
    transactionDate: t.transactionDate,
    offerTitle: t.offer?.title || null,
    offerType: t.offer?.type || null,
  }));

  const responsePayload = {
    scannedType,
    member: memberDetails,
    memberTransactions: formattedTransactions,
    eligibleCertificates,
    businessOffers,
  };

  if (scannedType === "CERTIFICATE" && resolvedCertificatePurchase) {
    responsePayload.scannedCertificate = {
      id: resolvedCertificatePurchase.id,
      uniqueCode: resolvedCertificatePurchase.uniqueCode,
      type: resolvedCertificatePurchase.type,
      status: resolvedCertificatePurchase.status,
      faceValue: resolvedCertificatePurchase.faceValue,
      amountPaid: resolvedCertificatePurchase.amountPaid,
      savingsAmount: resolvedCertificatePurchase.savingsAmount,
      discountValue: resolvedCertificatePurchase.discountValue,
      minSpend: resolvedCertificatePurchase.minSpend,
      title: resolvedCertificatePurchase.title,
      businessName: resolvedCertificatePurchase.businessName,
      expiryDate: resolvedCertificatePurchase.expiryDate,
      purchasedAt: resolvedCertificatePurchase.purchasedAt,
      redeemedAt: resolvedCertificatePurchase.redeemedAt,
    };
  }

  return ApiResponse.success(res, responsePayload);
});

/**
 * GET /api/transactions/my
 * ISSUE 10: Member sees their own transaction history
 */
exports.getMemberTransactions = asyncHandler(async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
    include: { membership: true },
  });
  if (!member) throw ApiError.notFound("Member profile not found");

  const { page = 1, limit = 20, period } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Optional period filter
  let dateFilter = {};
  if (period && period !== "lifetime") {
    const days = { week: 7, month: 30, "3months": 90, year: 365 }[period];
    if (days) dateFilter = { transactionDate: { gte: new Date(Date.now() - days * 86400000) } };
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { memberId: member.id, ...dateFilter },
      include: {
        business: {
          select: { name: true, category: { select: { name: true } }, district: true, logoUrl: true },
        },
        offer: { select: { title: true, type: true, discountValue: true } },
      },
      orderBy: { transactionDate: "desc" },
      skip,
      take: parseInt(limit),
    }),
    prisma.transaction.count({ where: { memberId: member.id, ...dateFilter } }),
  ]);

  // Aggregate savings for the filtered period
  const periodSavings = await prisma.transaction.aggregate({
    _sum: { savingsAmount: true },
    where: { memberId: member.id, ...dateFilter },
  });

  return ApiResponse.success(res, {
    transactions,
    totalLifetimeSavings: member.totalSavings,
    totalLifetimeSpent: member.totalSpent,
    periodSavings: periodSavings._sum.savingsAmount || 0,
    membership: member.membership,
    pagination: { page: parseInt(page), limit: parseInt(limit), total },
  });
});

/**
 * PATCH /api/transactions/:id/cancel
 * ISSUE 7: Admin cancels a transaction and reverses all stat increments
 */
exports.cancelTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const txn = await prisma.transaction.findUnique({ where: { id } });
  if (!txn) throw ApiError.notFound("Transaction not found");
  if (txn.status === "CANCELLED") throw ApiError.badRequest("Transaction is already cancelled");

  // Mark as cancelled
  await prisma.transaction.update({ where: { id }, data: { status: "CANCELLED" } });

  const { savingsAmount, memberId } = txn;

  // Reverse member savings
  await prisma.member.update({
    where: { id: memberId },
    data: {
      totalSavings: { decrement: savingsAmount },
      totalSpent: { decrement: txn.saleAmount },
    },
  });

  // Fetch member to check employer/association linkage
  const member = await prisma.member.findUnique({ where: { id: memberId } });

  if (member?.employerId) {
    await prisma.employer.update({
      where: { id: member.employerId },
      data: {
        totalSavings: { decrement: savingsAmount },
        totalRedemptions: { decrement: 1 },
      },
    });
    await prisma.employee.updateMany({
      where: { memberId, employerId: member.employerId },
      data: {
        totalSavings: { decrement: savingsAmount },
        totalRedemptions: { decrement: 1 },
      },
    });
  }

  if (member?.associationId) {
    await prisma.association.update({
      where: { id: member.associationId },
      data: { totalSavings: { decrement: savingsAmount } },
    });
    await prisma.associationMember.updateMany({
      where: { memberId, associationId: member.associationId },
      data: {
        totalSavings: { decrement: savingsAmount },
        totalRedemptions: { decrement: 1 },
      },
    });
  }

  return ApiResponse.success(
    res,
    { id, status: "CANCELLED", savingsReversed: savingsAmount },
    `Transaction cancelled. $${savingsAmount.toFixed(2)} savings reversed across all dashboards.`,
  );
});
