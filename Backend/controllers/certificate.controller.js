// Backend/controllers/certificate.controller.js
// CHANGES FROM ORIGINAL:
//  1. purchaseCertificate  — accepts successUrl/cancelUrl from req.body; passes offerType in metadata
//  2. handleCertificatePaymentWebhook — generates uniqueCode for PREPAID; sets stripeSessionId, type, status, title, businessName
//  3. verifyCertificateSession — NEW: reads CertificatePurchase by stripeSessionId (called from /api/payments/verify-certificate-session)

const { v4: uuidv4 } = require("uuid");
const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const {
  createStripeCertificateCheckout,
  verifyStripeWebhook,
  getStripeSession,
} = require("../services/payment.service");
const { sendCertificatePurchaseEmail } = require("../services/email.service");

// ── Helper: get member + membership ──────────────────────────────────────────
const getMemberFull = async (userId) =>
  prisma.member.findUnique({
    where: { userId },
    include: { user: true, membership: true },
  });

const hasActiveMembership = (member) => member?.membership?.status === "ACTIVE";

// ── Helper: generate unique redemption code ───────────────────────────────────
// e.g.  DISC-AB3X-KP7Q-MN2R
function generateUniqueCode(prefix = "DISC") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = () =>
    Array.from(
      { length: 4 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return `${prefix}-${seg()}-${seg()}-${seg()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMBER CONTROLLERS  (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────

exports.checkRedeemEligibility = asyncHandler(async (req, res) => {
  const member = await getMemberFull(req.user.id);
  if (!member) throw ApiError.notFound("Member profile not found");
  const active = hasActiveMembership(member);
  return res.status(200).json({
    success: true,
    data: {
      canRedeem: active,
      membershipStatus: member.membership?.status ?? null,
      redirectTo: active ? null : "/membership",
    },
  });
});

exports.getAvailableCertificates = asyncHandler(async (req, res) => {
  // ✨ Different behavior for MEMBER vs BUSINESS
  if (req.user.role === "MEMBER") {
    // Members can view all certificates
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
            select: {
              id: true,
              title: true,
              type: true,
              description: true,
              discountValue: true,
              minSpend: true,
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
      },
    });
  } else if (req.user.role === "BUSINESS") {
    // ✨ Business users can only see their own certificates
    const business = await prisma.business.findUnique({
      where: { userId: req.user.id },
    });
    if (!business) throw ApiError.notFound("Business not found");

    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Filter to show only this business's certificates
    const where = {
      status: "AVAILABLE",
      offer: { businessId: business.id },
    };

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          offer: {
            select: {
              id: true,
              title: true,
              type: true,
              description: true,
              discountValue: true,
              minSpend: true,
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
      businessId: business.id,
      message: "Business users can only view their own certificates",
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  }

  throw ApiError.forbidden("Invalid user role");
});

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

// ─── POST /api/certificates/purchase ─────────────────────────────────────────
// CHANGED: now accepts successUrl + cancelUrl from req.body so the frontend
// controls where Stripe redirects after payment.
// Also stores offerType in Stripe metadata so the webhook knows which code to generate.
exports.purchaseCertificate = asyncHandler(async (req, res) => {
  const {
    certificateId,
    paymentProvider = "STRIPE",
    // NEW — frontend passes these so Stripe can redirect to the right page
    successUrl,
    cancelUrl,
  } = req.body;

  const member = await getMemberFull(req.user.id);
  if (!member) throw ApiError.notFound("Member profile not found");

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
    include: { offer: { include: { business: true } } },
  });
  if (!certificate) throw ApiError.notFound("Certificate not found");
  if (certificate.status !== "AVAILABLE") {
    throw ApiError.conflict("This certificate is no longer available");
  }

  if (paymentProvider === "STRIPE") {
    const base = process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await createStripeCertificateCheckout({
      memberId: member.id,
      certificateId: certificate.id,
      memberPrice: certificate.memberPrice,
      businessName: certificate.offer.business.name,
      // Pass these so the webhook + verify-session have everything they need
      successUrl:
        successUrl ||
        `${base}/payment/success?session_id={CHECKOUT_SESSION_ID}&cert_id=${certificate.id}&type=${certificate.offer.type}`,
      cancelUrl: cancelUrl || `${base}/certification`,
      metadata: {
        type: "certificate",
        memberId: member.id,
        certificateId: certificate.id,
        // NEW fields in metadata — webhook uses these
        offerType: certificate.offer.type, // PREPAID_CERTIFICATE | VALUE_ADDED_CERTIFICATE
        faceValue: String(certificate.faceValue),
        memberPrice: String(certificate.memberPrice),
        businessName: certificate.offer.business.name,
        title: certificate.offer.title || "",
        discountValue: String(certificate.offer.discountValue ?? ""),
        minSpend: String(certificate.offer.minSpend ?? ""),
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
// BUSINESS CONTROLLERS  (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────

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
  if (
    offer.type !== "PREPAID_CERTIFICATE" &&
    offer.type !== "VALUE_ADDED_CERTIFICATE"
  ) {
    throw ApiError.badRequest(
      "Offer must be of type PREPAID_CERTIFICATE or VALUE_ADDED_CERTIFICATE",
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
    include: { offer: { select: { id: true, title: true } } },
  });

  return res.status(201).json({
    success: true,
    data: certificate,
    message: "Certificate created successfully",
  });
});

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
    include: { offer: true, purchases: true },
  });
  if (!certificate) throw ApiError.notFound("Invalid claim code");
  if (certificate.offer.businessId !== business.id) {
    throw ApiError.forbidden(
      "This certificate does not belong to your business",
    );
  }
  if (certificate.status === "REDEEMED")
    throw ApiError.conflict("Certificate has already been redeemed");
  if (certificate.status !== "PURCHASED")
    throw ApiError.badRequest("Certificate has not been purchased yet");
  if (certificate.expiryDate && certificate.expiryDate < new Date())
    throw ApiError.badRequest("Certificate has expired");

  const [updatedCert] = await prisma.$transaction([
    prisma.certificate.update({
      where: { id: certificate.id },
      data: { status: "REDEEMED" },
    }),
    prisma.certificatePurchase.updateMany({
      where: { certificateId: certificate.id },
      data: { redeemedAt: new Date(), status: "REDEEMED" },
    }),
  ]);

  // NEW: Create transaction record for each redemption
  try {
    const purchases = await prisma.certificatePurchase.findMany({
      where: { certificateId: certificate.id },
      include: { member: true },
    });

    for (const purchase of purchases) {
      await prisma.transaction.create({
        data: {
          memberId: purchase.memberId,
          businessId: business.id,
          offerId: certificate.offerId,
          saleAmount: purchase.amountPaid, // Amount member paid for certificate
          discountAmount: 0,
          savingsAmount: 0, // FIX: Don't double-count! Savings already captured at purchase time (faceValue - memberPrice)
          memberAge: purchase.member?.age,
          memberSex: purchase.member?.sex,
          memberDistrict: purchase.member?.district,
          memberSalaryLevel: purchase.member?.salaryLevel,
          businessCategory: certificate.offer?.category,
          businessDistrict: business.district,
          status: "COMPLETED",
          transactionDate: new Date(),
        },
      });
    }
  } catch (transErr) {
    // Log but don't throw — redemption was already recorded
    console.error("Error creating redemption transactions:", transErr.message);
  }

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
// STRIPE WEBHOOK  (updated to set all required fields + generate uniqueCode)
// ─────────────────────────────────────────────────────────────────────────────

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

    const {
      memberId,
      certificateId,
      offerType, // NEW — PREPAID_CERTIFICATE | VALUE_ADDED_CERTIFICATE
      faceValue, // NEW
      memberPrice, // NEW
      businessName, // NEW
      title, // NEW
      discountValue, // NEW
      minSpend, // NEW
    } = session.metadata;

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

    // ── Idempotency: skip if already processed ─────────────────────────────
    const existing = await prisma.certificatePurchase.findFirst({
      where: {
        OR: [
          { paymentId: session.payment_intent },
          { stripeSessionId: session.id }, // NEW check
        ],
      },
    });
    if (existing) return res.json({ received: true });

    // ── Generate uniqueCode for PREPAID certificates ───────────────────────
    // Retry up to 5 times for collision safety
    let uniqueCode = null;
    if (offerType === "PREPAID_CERTIFICATE") {
      for (let i = 0; i < 5; i++) {
        const candidate = generateUniqueCode("DISC");
        const clash = await prisma.certificatePurchase.findFirst({
          where: { uniqueCode: candidate },
        });
        if (!clash) {
          uniqueCode = candidate;
          break;
        }
      }
    }

    const certFaceValue = Number(faceValue) || certificate.faceValue;
    const certMemberPrice = Number(memberPrice) || certificate.memberPrice;
    const savingsAmount = certFaceValue - certMemberPrice;

    await prisma.$transaction([
      // ── Create the CertificatePurchase with ALL fields ─────────────────
      prisma.certificatePurchase.create({
        data: {
          certificateId,
          memberId,
          // NEW fields
          stripeSessionId: session.id,
          type: offerType || certificate.offer?.type || "PREPAID_CERTIFICATE",
          status: "PURCHASED",
          uniqueCode, // null for VALUE_ADDED
          title: title || certificate.offer?.title || "",
          businessName: businessName || certificate.offer?.business?.name || "",
          faceValue: certFaceValue,
          discountValue: discountValue
            ? Number(discountValue)
            : (certificate.offer?.discountValue ?? null),
          minSpend: minSpend
            ? Number(minSpend)
            : (certificate.offer?.minSpend ?? null),
          // Existing fields
          amountPaid: certMemberPrice,
          savingsAmount,
          paymentProvider: "STRIPE",
          paymentId: session.payment_intent,
          paymentStatus: "COMPLETED",
          expiryDate: certificate.expiryDate ?? null,
        },
      }),
      // ── Mark certificate as PURCHASED ──────────────────────────────────
      prisma.certificate.update({
        where: { id: certificateId },
        data: { status: "PURCHASED" },
      }),
      // ── Increment member total savings ─────────────────────────────────
      prisma.member.update({
        where: { id: memberId },
        data: { totalSavings: { increment: savingsAmount } },
      }),
    ]);

    // ── Send confirmation email (non-blocking) ─────────────────────────────
    try {
      await sendCertificatePurchaseEmail(member.user.email, {
        name: `${member.firstName} ${member.lastName}`,
        businessName: businessName || certificate.offer.business.name,
        faceValue: certFaceValue,
        memberPrice: certMemberPrice,
        claimCode: certificate.claimCode,
        uniqueCode,
        offerType,
        expiryDate: certificate.expiryDate,
      });
    } catch (emailErr) {
      console.error("Certificate email failed:", emailErr.message);
    }
  }

  return res.json({ received: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// NEW: verifyCertificateSession
// GET /api/payments/verify-certificate-session?session_id=xxx
// Reads the CertificatePurchase created by the webhook.
// If webhook hasn't fired, create the record from Stripe session data.
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyCertificateSession = asyncHandler(async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) throw ApiError.badRequest("session_id is required");

  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
  });
  if (!member) throw ApiError.notFound("Member profile not found");

  // Poll for webhook-created record (up to ~8 seconds)
  let purchase = null;
  for (let attempt = 0; attempt < 8; attempt++) {
    purchase = await prisma.certificatePurchase.findFirst({
      where: {
        stripeSessionId: session_id,
        memberId: member.id,
      },
    });
    if (purchase) break;
    await new Promise((r) => setTimeout(r, 1000));
  }

  // If webhook hasn't fired, create record from Stripe session data
  if (!purchase) {
    try {
      const stripeSession = await getStripeSession(session_id);

      // Verify payment was successful
      if (stripeSession.payment_status !== "paid") {
        return res.status(202).json({
          success: false,
          pending: true,
          message: "Payment processing... Please wait a moment.",
        });
      }

      // Extract metadata
      const {
        type,
        memberId,
        certificateId,
        offerType,
        faceValue,
        discountValue,
        minSpend,
        businessName,
        title,
      } = stripeSession.metadata;

      // Verify this belongs to the current user
      if (memberId !== member.id) {
        throw ApiError.forbidden(
          "This certificate purchase does not belong to you",
        );
      }

      // Generate unique code
      const generateUniqueCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "DISC";
        for (let i = 0; i < 3; i++) {
          code += "-";
          for (let j = 0; j < 4; j++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
          }
        }
        return code;
      };

      // Try to create the CertificatePurchase record
      try {
        const savingsAmount =
          (parseFloat(faceValue) || 0) - stripeSession.amount_total / 100;

        purchase = await prisma.certificatePurchase.create({
          data: {
            stripeSessionId: session_id,
            memberId: memberId,
            certificateId: certificateId,
            uniqueCode: generateUniqueCode(),
            type: offerType || "PREPAID_CERTIFICATE",
            status: "PURCHASED",
            faceValue: parseFloat(faceValue) || 0,
            discountValue: parseFloat(discountValue) || null,
            minSpend: parseFloat(minSpend) || null,
            amountPaid: stripeSession.amount_total / 100,
            savingsAmount: savingsAmount,
            businessName: businessName || "",
            title: title || "",
            paymentProvider: "STRIPE",
            paymentId: stripeSession.payment_intent,
            paymentStatus: "COMPLETED",
          },
        });

        // Also create transaction record for analytics
        try {
          const [cert, memberData, business] = await Promise.all([
            prisma.certificate.findUnique({
              where: { id: certificateId },
              include: { offer: true },
            }),
            prisma.member.findUnique({
              where: { id: memberId },
            }),
            prisma.certificate.findUnique({
              where: { id: certificateId },
              include: { offer: { include: { business: true } } },
            }),
          ]);

          if (cert && memberData && business?.offer?.business) {
            await prisma.transaction.create({
              data: {
                memberId: memberId,
                businessId: business.offer.business.id,
                offerId: cert.offerId,
                saleAmount: stripeSession.amount_total / 100,
                discountAmount: 0,
                savingsAmount: savingsAmount,
                memberAge: memberData.age,
                memberSex: memberData.sex,
                memberDistrict: memberData.district,
                memberSalaryLevel: memberData.salaryLevel,
                businessCategory: business.offer.business.category,
                businessDistrict: business.offer.business.district,
                status: "COMPLETED",
              },
            });

            // Update member's totals
            await prisma.member.update({
              where: { id: memberId },
              data: {
                totalSavings: { increment: savingsAmount },
                totalSpent: { increment: stripeSession.amount_total / 100 },
              },
            });
          }
        } catch (transErr) {
          // Log but don't throw — purchase was already recorded
          console.error("Error creating transaction:", transErr.message);
        }
      } catch (createErr) {
        // If unique constraint error, the webhook has already created it—fetch it instead
        if (createErr.code === "P2002") {
          purchase = await prisma.certificatePurchase.findFirst({
            where: {
              stripeSessionId: session_id,
              memberId: member.id,
            },
          });
          if (!purchase) {
            throw createErr; // Re-throw if we still can't find it
          }
        } else {
          throw createErr;
        }
      }
    } catch (err) {
      // If we can't create or fetch from Stripe data, return pending
      return res.status(202).json({
        success: false,
        pending: true,
        message:
          "Payment received. Processing your certificate... Please refresh in a moment.",
      });
    }
  }

  return res.status(200).json({
    success: true,
    certificate: purchase,
  });
});

// ─────────────────────────────────────────────────────────────────────────────

// ── POST /api/certificates/redeem-by-code ────────────────────────────────────
// Business staff enters the member's uniqueCode (DISC-XXXX-XXXX-XXXX).
// Looks up CertificatePurchase.uniqueCode (NOT Certificate.claimCode).
// Validates ownership, expiry, status — then marks REDEEMED.
exports.redeemByCode = asyncHandler(async (req, res) => {
  const { uniqueCode } = req.body;
  if (!uniqueCode) throw ApiError.badRequest("uniqueCode is required");

  // Caller must be a BUSINESS
  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business)
    throw ApiError.forbidden("Only businesses can redeem certificates");

  // Find the purchase by uniqueCode
  const purchase = await prisma.certificatePurchase.findFirst({
    where: { uniqueCode: uniqueCode.trim().toUpperCase() },
    include: {
      certificate: {
        include: {
          offer: { include: { business: true } },
        },
      },
      member: {
        include: { user: { select: { email: true } } },
      },
    },
  });

  if (!purchase)
    throw ApiError.notFound("Invalid code — certificate not found");

  // Ownership: the certificate must belong to THIS business
  const certBusinessId =
    purchase.certificate?.offer?.businessId ||
    purchase.certificate?.offer?.business?.id;

  if (certBusinessId !== business.id) {
    throw ApiError.forbidden(
      "This certificate does not belong to your business",
    );
  }

  // Status checks
  if (purchase.status === "REDEEMED") {
    return res.status(400).json({
      success: false,
      message: "Certificate already redeemed",
      data: {
        uniqueCode: purchase.uniqueCode,
        status: purchase.status,
        redeemedAt: purchase.redeemedAt,
        businessName: purchase.businessName,
        faceValue: purchase.faceValue,
        type: purchase.type,
      },
    });
  }

  if (
    purchase.status === "EXPIRED" ||
    (purchase.expiryDate && new Date(purchase.expiryDate) < new Date())
  ) {
    throw ApiError.badRequest("Certificate has expired");
  }

  // Mark redeemed
  const updated = await prisma.certificatePurchase.update({
    where: { id: purchase.id },
    data: {
      status: "REDEEMED",
      redeemedAt: new Date(),
    },
  });

  // Also update the parent Certificate status if it exists
  if (purchase.certificateId) {
    await prisma.certificate
      .update({
        where: { id: purchase.certificateId },
        data: { status: "REDEEMED" },
      })
      .catch(() => {}); // non-fatal
  }

  // NEW: Create transaction record for the redemption
  try {
    await prisma.transaction.create({
      data: {
        memberId: purchase.memberId,
        businessId: business.id,
        offerId: purchase.certificate?.offerId,
        saleAmount: purchase.amountPaid, // Amount member paid for certificate
        discountAmount: 0,
        savingsAmount: purchase.faceValue, // Full face value is now being used
        memberAge: purchase.member?.age,
        memberSex: purchase.member?.sex,
        memberDistrict: purchase.member?.district,
        memberSalaryLevel: purchase.member?.salaryLevel,
        businessCategory: purchase.certificate?.offer?.business?.category,
        businessDistrict: purchase.certificate?.offer?.business?.district,
        status: "COMPLETED",
        transactionDate: new Date(),
      },
    });
  } catch (transErr) {
    // Log but don't throw — redemption was already recorded
    console.error("Error creating redemption transaction:", transErr.message);
  }

  return res.status(200).json({
    success: true,
    message: "Certificate redeemed successfully! 🎉",
    data: {
      uniqueCode: updated.uniqueCode,
      status: updated.status,
      redeemedAt: updated.redeemedAt,
      businessName: updated.businessName,
      faceValue: updated.faceValue,
      memberPrice: updated.amountPaid,
      type: updated.type,
      discountValue: updated.discountValue,
      title: updated.title,
      memberEmail: purchase.member?.user?.email || null,
    },
  });
});

// ── GET /api/certificates/redemptions ────────────────────────────────────────
// Business sees a history of all certificate redemptions for their business.
// Used to populate the Redemption History table in BusinessDashboard.
exports.getRedemptions = asyncHandler(async (req, res) => {
  const business = await prisma.business.findUnique({
    where: { userId: req.user.id },
  });
  if (!business) throw ApiError.notFound("Business profile not found");

  const { page = 1, limit = 20, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Find all CertificatePurchases whose parent Certificate belongs to this business
  const where = {
    certificate: {
      offer: { businessId: business.id },
    },
    ...(status && { status: status.toUpperCase() }),
  };

  const [redemptions, total] = await Promise.all([
    prisma.certificatePurchase.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { purchasedAt: "desc" },
      include: {
        member: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
    }),
    prisma.certificatePurchase.count({ where }),
  ]);

  const formatted = redemptions.map((p) => ({
    id: p.id,
    uniqueCode: p.uniqueCode,
    type: p.type,
    status: p.status,
    faceValue: p.faceValue,
    amountPaid: p.amountPaid,
    discountValue: p.discountValue,
    title: p.title,
    businessName: p.businessName,
    purchasedAt: p.purchasedAt,
    redeemedAt: p.redeemedAt,
    expiryDate: p.expiryDate,
    memberEmail: p.member?.user?.email || null,
  }));

  return res.status(200).json({
    success: true,
    data: formatted,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});
