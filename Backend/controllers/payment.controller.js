const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const {
  createStripeCheckoutSession,
  getStripeSession,
  verifyStripeWebhook,
  createPayPalOrder,
} = require("../services/payment.service");
const { activateMembership } = require("../services/membership.service");

const MEMBERSHIP_PRICE_USD = 89.99; // Individual membership price

// ── Create membership checkout (Stripe) ───────────────
exports.createStripeCheckout = asyncHandler(async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
    include: { user: true, membership: true },
  });
  if (!member) throw ApiError.notFound("Member not found");
  if (member.membership?.status === "ACTIVE") {
    throw ApiError.conflict("You already have an active membership");
  }

  // Upsert a PENDING membership record
  const membership = await prisma.membership.upsert({
    where: { memberId: member.id },
    update: {
      status: "PENDING",
      priceUSD: MEMBERSHIP_PRICE_USD,
      paymentStatus: "PENDING",
    },
    create: {
      memberId: member.id,
      type: "INDIVIDUAL",
      status: "PENDING",
      priceUSD: MEMBERSHIP_PRICE_USD,
    },
  });

  const session = await createStripeCheckoutSession({
    memberId: member.id,
    email: member.user.email,
    priceUSD: MEMBERSHIP_PRICE_USD,
    metadata: { membershipId: membership.id, type: "membership" },
  });

  return ApiResponse.success(res, {
    checkoutUrl: session.url,
    sessionId: session.id,
  });
});

// ── Create membership order (PayPal) ──────────────────
exports.createPayPalCheckout = asyncHandler(async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
  });
  if (!member) throw ApiError.notFound("Member not found");

  const membership = await prisma.membership.upsert({
    where: { memberId: member.id },
    update: { status: "PENDING", priceUSD: MEMBERSHIP_PRICE_USD },
    create: {
      memberId: member.id,
      type: "INDIVIDUAL",
      status: "PENDING",
      priceUSD: MEMBERSHIP_PRICE_USD,
    },
  });

  const order = await createPayPalOrder({
    priceUSD: MEMBERSHIP_PRICE_USD,
    description: "DCC Annual Membership",
    metadata: { membershipId: membership.id, memberId: member.id },
  });

  return ApiResponse.success(res, { orderId: order.id, links: order.links });
});

// ── Stripe webhook (membership & certificate) ───────────────────────
exports.stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const event = verifyStripeWebhook(req.body, sig);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const {
      type,
      membershipId,
      memberId,
      certificateId,
      offerType,
      faceValue,
      discountValue,
      minSpend,
      businessName,
      title,
    } = session.metadata;

    if (type === "membership") {
      await activateMembership(membershipId, session.payment_intent, "STRIPE");
    }

    if (type === "certificate") {
      // Generate unique code for certificate (DISC-XXXX-XXXX-XXXX)
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

      const savingsAmount =
        (parseFloat(faceValue) || 0) - session.amount_total / 100;

      // Create CertificatePurchase record
      const purchase = await prisma.certificatePurchase.create({
        data: {
          stripeSessionId: session.id,
          memberId: memberId,
          certificateId: certificateId,
          uniqueCode: generateUniqueCode(),
          type: offerType || "PREPAID_CERTIFICATE",
          status: "PURCHASED",
          faceValue: parseFloat(faceValue) || 0,
          discountValue: parseFloat(discountValue) || null,
          minSpend: parseFloat(minSpend) || null,
          amountPaid: session.amount_total / 100,
          savingsAmount: savingsAmount,
          businessName: businessName || "",
          title: title || "",
          paymentProvider: "STRIPE",
          paymentId: session.payment_intent,
          paymentStatus: "COMPLETED",
        },
      });

      // Fetch certificate & member info to get business & demographics
      try {
        const [cert, member, business] = await Promise.all([
          prisma.certificate.findUnique({
            where: { id: certificateId },
            include: { offer: true },
          }),
          prisma.member.findUnique({
            where: { id: memberId },
            include: { user: true },
          }),
          // Get business from certificate offer
          prisma.certificate.findUnique({
            where: { id: certificateId },
            include: { offer: { include: { business: true } } },
          }),
        ]);

        if (cert && member && business?.offer?.business) {
          // Create Transaction record for member dashboard
          await prisma.transaction.create({
            data: {
              memberId: memberId,
              businessId: business.offer.business.id,
              offerId: cert.offerId,
              saleAmount: session.amount_total / 100,
              discountAmount: 0,
              savingsAmount: savingsAmount,
              memberAge: member.age,
              memberSex: member.sex,
              memberDistrict: member.district,
              memberSalaryLevel: member.salaryLevel,
              businessCategory: business.offer.business.category,
              businessDistrict: business.offer.business.district,
              status: "COMPLETED",
            },
          });

          // Update member's totalSavings
          await prisma.member.update({
            where: { id: memberId },
            data: {
              totalSavings: { increment: savingsAmount },
              totalSpent: { increment: session.amount_total / 100 },
            },
          });
        }
      } catch (transErr) {
        // Log but don't throw — purchase was already recorded
        console.error("Error creating transaction record:", transErr.message);
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    if (session.metadata?.membershipId) {
      await prisma.membership.update({
        where: { id: session.metadata.membershipId },
        data: { paymentStatus: "FAILED" },
      });
    }
  }

  return res.json({ received: true });
});

// ── PayPal capture (called from frontend after approval) ──
exports.capturePayPal = asyncHandler(async (req, res) => {
  const { orderId, membershipId } = req.body;

  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const baseUrl =
    process.env.PAYPAL_MODE === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const { access_token } = await tokenRes.json();

  const captureRes = await fetch(
    `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    },
  );
  const capture = await captureRes.json();

  if (capture.status === "COMPLETED") {
    await activateMembership(membershipId, orderId, "PAYPAL");
    return ApiResponse.success(res, {}, "Membership activated successfully");
  }

  throw ApiError.badRequest("PayPal payment not completed");
});

// ── Verify Stripe session from success page ───────────
exports.verifyStripeSession = asyncHandler(async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) throw ApiError.badRequest("Missing session_id");

  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
  });
  if (!member) throw ApiError.notFound("Member not found");

  const session = await getStripeSession(sessionId);
  if (!session || session.payment_status !== "paid") {
    throw ApiError.badRequest("Payment not completed");
  }

  if (session.metadata?.type !== "membership") {
    throw ApiError.badRequest("Invalid session type");
  }

  if (session.metadata?.memberId && session.metadata.memberId !== member.id) {
    throw ApiError.forbidden("Session does not belong to this member");
  }

  const membershipId = session.metadata?.membershipId;
  if (!membershipId) throw ApiError.badRequest("Missing membershipId");

  const current = await prisma.membership.findUnique({
    where: { id: membershipId },
  });
  if (current?.status !== "ACTIVE") {
    await activateMembership(membershipId, session.payment_intent, "STRIPE");
  }

  return ApiResponse.success(
    res,
    { type: "membership", activated: true },
    "Membership verified",
  );
});
