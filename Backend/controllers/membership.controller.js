const { prisma } = require("../config/db");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../middlewares/errorhandler");

// ── Static plans fallback ───────────────────────────────────────────────────
const PLANS = [
  {
    id: "individual",
    name: "Individual Membership",
    type: "INDIVIDUAL",
    price: 89.99,
    billingCycle: "annual",
    description: "Full DCC access for one individual member",
    features: [
      "Access to all member discounts",
      "Digital QR membership card",
      "Travel deals marketplace",
      "Certificate purchasing",
      "Mobile app access",
    ],
  },
  {
    id: "employer",
    name: "Employer Group Membership",
    type: "EMPLOYER",
    price: 79.99,
    billingCycle: "annual",
    description: "Per employee, for employer-sponsored groups",
    features: [
      "All Individual features",
      "Employee management portal",
      "Group billing",
      "Usage reports",
    ],
  },
  {
    id: "association",
    name: "Association Membership",
    type: "ASSOCIATION",
    price: 69.99,
    billingCycle: "annual",
    description: "Per member, for professional associations",
    features: [
      "All Individual features",
      "Member management portal",
      "Association branding",
      "Group reporting",
    ],
  },
];

// Seed function for default plans
const seedDefaultPlans = async () => {
  const defaultPlans = [
    {
      name: "Basic",
      price: 49.00,
      currency: "KYD",
      billingCycle: "year",
      description: "Access standard discounts across selected partners.",
      badge: "",
      isActive: true,
      features: {
        "Access to all discounts": "Standard",
        "Digital membership card": true,
        "Mobile app access": true,
        "Unlimited savings": true,
        "Certificate purchases": "5 per month",
        "Support": "Email support",
        "Exclusive travel deals": false,
        "DCC VIP Events": false,
        "Priority concierge": false
      }
    },
    {
      name: "Premium",
      price: 89.00,
      currency: "KYD",
      billingCycle: "year",
      description: "Get exclusive offers, priority support and special access.",
      badge: "Most Popular",
      isActive: true,
      features: {
        "Access to all discounts": "Standard + Premium",
        "Digital membership card": true,
        "Mobile app access": true,
        "Unlimited savings": true,
        "Certificate purchases": "Unlimited",
        "Support": "Priority email & chat",
        "Exclusive travel deals": true,
        "DCC VIP Events": false,
        "Priority concierge": false
      }
    },
    {
      name: "VIP",
      price: 149.00,
      currency: "KYD",
      billingCycle: "year",
      description: "Ultimate luxury and priority. Unlocked all-inclusive benefits.",
      badge: "Elite",
      isActive: true,
      features: {
        "Access to all discounts": "All-inclusive VIP",
        "Digital membership card": true,
        "Mobile app access": true,
        "Unlimited savings": true,
        "Certificate purchases": "Unlimited (VIP rates)",
        "Support": "24/7 Dedicated phone",
        "Exclusive travel deals": true,
        "DCC VIP Events": true,
        "Priority concierge": true
      }
    }
  ];

  for (const plan of defaultPlans) {
    await prisma.membershipPlan.create({ data: plan });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/membership/plans
// ─────────────────────────────────────────────────────────────────────────────
exports.getPlans = asyncHandler(async (req, res) => {
  let plans = await prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' }
  });

  if (plans.length === 0) {
    await seedDefaultPlans();
    plans = await prisma.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });
  }

  return res.status(200).json({ success: true, data: plans });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/membership/my
// Returns the member's membership record and whether it's active.
// Dashboard reads this to show the membership status badge.
// No redirect logic here — that's handled on the frontend at the redeem point.
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyMembership = asyncHandler(async (req, res) => {
  if (req.user.role !== "MEMBER") {
    return res.status(200).json({
      success: true,
      data: null,
      isActive: false,
      membershipStatus: null,
      canRedeem: false,
    });
  }

  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
    include: { membership: true },
  });

  if (!member) throw ApiError.notFound("Member profile not found");

  const membership = member.membership;
  const isActive = membership?.status === "ACTIVE";

  return res.status(200).json({
    success: true,
    data: membership, // null if they haven't subscribed yet
    isActive,
    membershipStatus: membership?.status ?? null,
    // Used by the dashboard banner: if !isActive → show "Get Membership" CTA
    canRedeem: isActive,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/membership/subscribe
// Called after payment is confirmed. Activates or creates the membership record.
// Body: { planId, planType, paymentProvider, paymentId }
// ─────────────────────────────────────────────────────────────────────────────
exports.subscribe = asyncHandler(async (req, res) => {
  if (req.user.role !== "MEMBER") {
    throw ApiError.forbidden("Only members can subscribe to memberships");
  }
  const { planId, planType, paymentProvider, paymentId } = req.body;

  if (!paymentProvider || !paymentId) {
    throw ApiError.badRequest(
      "paymentProvider and paymentId are required",
    );
  }

  let priceUSD = 0;
  let finalPlanType = "INDIVIDUAL";

  if (planId) {
    const dbPlan = await prisma.membershipPlan.findUnique({
      where: { id: planId }
    });
    if (!dbPlan) throw ApiError.notFound("Membership plan not found");
    priceUSD = dbPlan.price;
    
    // Default to INDIVIDUAL type for custom dynamic membership plans unless named otherwise
    if (dbPlan.name.toUpperCase().includes("EMPLOYER")) {
      finalPlanType = "EMPLOYER";
    } else if (dbPlan.name.toUpperCase().includes("ASSOCIATION")) {
      finalPlanType = "ASSOCIATION";
    } else {
      finalPlanType = "INDIVIDUAL";
    }
  } else if (planType) {
    const validTypes = ["INDIVIDUAL", "EMPLOYER", "ASSOCIATION"];
    if (!validTypes.includes(planType)) {
      throw ApiError.badRequest(
        `planType must be one of: ${validTypes.join(", ")}`,
      );
    }
    const plan = PLANS.find((p) => p.type === planType);
    priceUSD = plan?.price ?? 0;
    finalPlanType = planType;
  } else {
    throw ApiError.badRequest("planId or planType is required");
  }

  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
    include: { membership: true },
  });
  if (!member) throw ApiError.notFound("Member profile not found");

  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1-year membership

  let membership;

  if (member.membership) {
    // Update existing record
    membership = await prisma.membership.update({
      where: { id: member.membership.id },
      data: {
        type: finalPlanType,
        status: "ACTIVE",
        priceUSD,
        startDate: now,
        expiryDate,
        paymentProvider,
        paymentId,
        paymentStatus: "COMPLETED",
        planId: planId || null,
      },
    });
  } else {
    // Create new membership record
    membership = await prisma.membership.create({
      data: {
        memberId: member.id,
        type: finalPlanType,
        status: "ACTIVE",
        priceUSD,
        startDate: now,
        expiryDate,
        paymentProvider,
        paymentId,
        paymentStatus: "COMPLETED",
        planId: planId || null,
      },
    });
  }

  return res.status(200).json({
    success: true,
    data: membership,
    message: "Membership activated",
    // Frontend navigates here after successful activation
    redirectTo: "/member-dashboard",
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/membership/:id/cancel
// ─────────────────────────────────────────────────────────────────────────────
exports.cancelMembership = asyncHandler(async (req, res) => {
  if (req.user.role !== "MEMBER") {
    throw ApiError.forbidden("Only members can cancel memberships");
  }
  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
  });
  if (!member) throw ApiError.notFound("Member profile not found");

  const membership = await prisma.membership.findUnique({
    where: { id: req.params.id },
  });
  if (!membership) throw ApiError.notFound("Membership not found");
  if (membership.memberId !== member.id) {
    throw ApiError.forbidden("Not authorized to cancel this membership");
  }
  if (membership.status === "CANCELLED") {
    throw ApiError.conflict("Membership is already cancelled");
  }

  const updated = await prisma.membership.update({
    where: { id: req.params.id },
    data: { status: "CANCELLED" },
  });

  return res.status(200).json({
    success: true,
    data: updated,
    message: "Membership cancelled",
  });
});
