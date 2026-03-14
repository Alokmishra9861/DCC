const { v4: uuidv4 } = require("uuid");
const { prisma } = require("../config/db");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../middlewares/errorhandler");
const {
  createStripeCertificateCheckout,
  verifyStripeWebhook,
} = require("../services/payment.service");
const { sendCertificatePurchaseEmail } = require("../services/email.service");

// ── Helper: get member + membership in one query ──────────────────────────────
const getMemberFull = async (userId) => {
  return prisma.member.findUnique({
    where: { userId },
    include: {
      user: true,
      membership: true,
    },
  });
};

// ── Helper: membership is active ─────────────────────────────────────────────
const hasActiveMembership = (member) => {
  return member?.membership?.status === "ACTIVE";
};

// ─────────────────────────────────────────────────────────────────────────────
// MEMBER CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/certificates/redeem-check
// Called before any redeem action — tells the frontend whether to proceed or
// redirect to /membership for upgrade.
exports.checkRedeemEligibility = asyncHandler(async (req, res) => {
  const member = await getMemberFull(req.user.id);
  if (!member) throw ApiError.notFound("Member profile not found");

  const active = hasActiveMembership(member);

  return res.status(200).json({
    success: true,
    data: {
      canRedeem: active,
      membershipStatus: member.membership?.status ?? null,
      // Frontend uses this to navigate: if false → navigate('/membership')
      redirectTo: active ? null : "/membership",
    },
  });
});

// GET /api/certificates/available
// All AVAILABLE certificates a member can purchase (membership required to buy,
// but they can still see listings)
exports.getAvailableCertificates = asyncHandler(async (req, res) => {
  const member = await getMemberFull(req.user.id);
  if (!member) throw ApiError.notFound("Member profile not found");

  const { businessId, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    status: "AVAILABLE",
    ...(businessId && { offer: { businessId } }),
  };

  const [certificates, total] = await Promise.all([
    prisma.certificate.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        offer: {
          include: {
            business: {
              select: { id: true, name: true, logoUrl: true, category: true },
            },
          },
        },
      },
      orderBy: { faceValue: "asc" },
    }),
    prisma.certificate.count({ where }),
  ]);

  return res.status(200).json({
    success: true,
    data: certificates,
    membershipStatus: member.membership?.status ?? null,
    canPurchase: hasActiveMembership(member),
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// GET /api/certificates/my
// Member's own purchased certificates
exports.getMyCertificates = asyncHandler(async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
  });
  if (!member) throw ApiError.notFound("Member profile not found");

  const purchases = await prisma.certificatePurchase.findMany({
    where: { memberId: member.id },
    include: {
      certificate: {
        include: {
          offer: {
            include: {
              business: { select: { id: true, name: true, logoUrl: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({ success: true, data: purchases });
});

// POST /api/certificates/purchase
// Member purchases a certificate — requires ACTIVE membership
exports.purchaseCertificate = asyncHandler(async (req, res) => {
  const { certificateId, paymentProvider = "STRIPE" } = req.body;

  const member = await getMemberFull(req.user.id);
  if (!member) throw ApiError.notFound("Member profile not found");

  // ── Membership gate ───────────────────────────────────────────────────────
  if (!hasActiveMembership(member)) {
    return res.status(403).json({
      success: false,
      code: "MEMBERSHIP_REQUIRED",
      message: "An active membership is required to purchase certificates",
      redirectTo: "/membership",
      membershipStatus: member.membership?.status ?? null,
    });
  }

  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: {
      offer: { include: { business: true } },
    },
  });
  if (!certificate) throw ApiError.notFound("Certificate not found");
  if (certificate.status !== "AVAILABLE") {
    throw ApiError.conflict("This certificate is no longer available");
  }

  if (paymentProvider === "STRIPE") {
    const session = await createStripeCertificateCheckout({
      memberId: member.id,
      certificateId: certificate.id,
      memberPrice: certificate.memberPrice,
      businessName: certificate.offer.business.name,
      metadata: {
        type: "certificate",
        memberId: member.id,
        certificateId: certificate.id,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
      },
    });
  }

  throw ApiError.badRequest("Unsupported payment provider");
});

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/certificates/business
// Business sees all certificates tied to their offers + redemption stats
exports.getBusinessCertificates = asyncHandler(async (req, res) => {
  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business) throw ApiError.notFound("Business profile not found");

  const certificates = await prisma.certificate.findMany({
    where: { offer: { businessId: business.id } },
    include: {
      offer: { select: { id: true, title: true, type: true } },
      purchases: { select: { id: true, redeemedAt: true, amountPaid: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = certificates.map((cert) => ({
    id: cert.id,
    offerTitle: cert.offer?.title ?? "—",
    offerType: cert.offer?.type ?? "—",
    faceValue: cert.faceValue,
    memberPrice: cert.memberPrice,
    status: cert.status,
    claimCode: cert.claimCode,
    expiryDate: cert.expiryDate,
    totalSold: cert.purchases.length,
    totalRedeemed: cert.purchases.filter((p) => p.redeemedAt).length,
    totalRevenue: cert.purchases.reduce(
      (sum, p) => sum + (p.amountPaid ?? 0),
      0,
    ),
  }));

  return res.status(200).json({ success: true, data: formatted });
});

// POST /api/certificates
// Business creates a certificate for one of their PREPAID_CERTIFICATE offers
exports.createCertificate = asyncHandler(async (req, res) => {
  const { offerId, faceValue, memberPrice, expiryDate } = req.body;

  if (!offerId || !faceValue || !memberPrice) {
    throw ApiError.badRequest(
      "offerId, faceValue and memberPrice are required",
    );
  }

  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business) throw ApiError.notFound("Business profile not found");

  const offer = await prisma.offer.findFirst({
    where: { id: offerId, businessId: business.id },
  });
  if (!offer)
    throw ApiError.notFound(
      "Offer not found or does not belong to your business",
    );
  if (offer.type !== "PREPAID_CERTIFICATE") {
    throw ApiError.badRequest(
      "Offer must be of type PREPAID_CERTIFICATE to attach certificates",
    );
  }

  const certificate = await prisma.certificate.create({
    data: {
      offerId,
      faceValue: parseFloat(faceValue),
      memberPrice: parseFloat(memberPrice),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      claimCode: uuidv4().split("-")[0].toUpperCase(),
      status: "AVAILABLE",
    },
    include: {
      offer: { select: { id: true, title: true } },
    },
  });

  return res.status(201).json({
    success: true,
    data: certificate,
    message: "Certificate created successfully",
  });
});

// POST /api/certificates/redeem
// Business staff scans a QR / enters a claim code to mark certificate as redeemed
exports.redeemCertificate = asyncHandler(async (req, res) => {
  const { claimCode } = req.body;
  if (!claimCode) throw ApiError.badRequest("claimCode is required");

  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business)
    throw ApiError.forbidden("Only businesses can redeem certificates");

  const certificate = await prisma.certificate.findUnique({
    where: { claimCode: claimCode.toUpperCase() },
    include: {
      offer: true,
      purchases: true,
    },
  });

  if (!certificate) throw ApiError.notFound("Invalid claim code");

  // Ownership check — certificate must belong to this business's offer
  if (certificate.offer.businessId !== business.id) {
    throw ApiError.forbidden(
      "This certificate does not belong to your business",
    );
  }

  if (certificate.status === "REDEEMED") {
    throw ApiError.conflict("Certificate has already been redeemed");
  }
  if (certificate.status !== "PURCHASED") {
    throw ApiError.badRequest("Certificate has not been purchased yet");
  }
  if (certificate.expiryDate && certificate.expiryDate < new Date()) {
    throw ApiError.badRequest("Certificate has expired");
  }

  // Mark redeemed in a transaction so both updates succeed or both fail
  const [updatedCert] = await prisma.$transaction([
    prisma.certificate.update({
      where: { id: certificate.id },
      data: { status: "REDEEMED" },
    }),
    prisma.certificatePurchase.updateMany({
      where: { certificateId: certificate.id },
      data: { redeemedAt: new Date() },
    }),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      claimCode: certificate.claimCode,
      faceValue: certificate.faceValue,
      memberPrice: certificate.memberPrice,
      status: updatedCert.status,
      redeemedAt: new Date(),
    },
    message: "Certificate redeemed successfully",
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// STRIPE WEBHOOK
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/certificates/webhook/stripe
exports.handleCertificatePaymentWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = verifyStripeWebhook(req.body, sig);
  } catch (err) {
    return res
      .status(400)
      .json({ error: `Webhook signature error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.metadata?.type !== "certificate") {
      return res.json({ received: true });
    }

    const { memberId, certificateId } = session.metadata;

    const [certificate, member] = await Promise.all([
      prisma.certificate.findUnique({
        where: { id: certificateId },
        include: { offer: { include: { business: true } } },
      }),
      prisma.member.findUnique({
        where: { id: memberId },
        include: { user: true },
      }),
    ]);

    if (!certificate || !member) return res.json({ received: true });

    // Idempotency: skip if already processed
    const existing = await prisma.certificatePurchase.findFirst({
      where: { certificateId, paymentId: session.payment_intent },
    });
    if (existing) return res.json({ received: true });

    const savingsAmount = certificate.faceValue - certificate.memberPrice;

    await prisma.$transaction([
      // Record the purchase
      prisma.certificatePurchase.create({
        data: {
          certificateId,
          memberId,
          amountPaid: certificate.memberPrice,
          savingsAmount,
          paymentProvider: "STRIPE",
          paymentId: session.payment_intent,
          paymentStatus: "COMPLETED",
        },
      }),
      // Mark certificate as purchased
      prisma.certificate.update({
        where: { id: certificateId },
        data: { status: "PURCHASED" },
      }),
      // Increment member's total savings
      prisma.member.update({
        where: { id: memberId },
        data: { totalSavings: { increment: savingsAmount } },
      }),
    ]);

    // Send confirmation email (non-blocking — don't fail webhook if email fails)
    try {
      await sendCertificatePurchaseEmail(member.user.email, {
        name: `${member.firstName} ${member.lastName}`,
        businessName: certificate.offer.business.name,
        faceValue: certificate.faceValue,
        memberPrice: certificate.memberPrice,
        claimCode: certificate.claimCode,
        expiryDate: certificate.expiryDate,
      });
    } catch (emailErr) {
      console.error("Certificate email failed:", emailErr.message);
    }
  }

  return res.json({ received: true });
});
