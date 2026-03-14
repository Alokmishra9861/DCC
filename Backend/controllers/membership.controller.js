const { prisma } = require("../config/db");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../middlewares/errorhandler");

// ── Static plans (no DB model for plans in schema) ───────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/membership/plans
// ─────────────────────────────────────────────────────────────────────────────
exports.getPlans = asyncHandler(async (req, res) => {
  return res.status(200).json({ success: true, data: PLANS });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/membership/my
// Returns the member's membership record and whether it's active.
// Dashboard reads this to show the membership status badge.
// No redirect logic here — that's handled on the frontend at the redeem point.
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyMembership = asyncHandler(async (req, res) => {
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
// Body: { planType: "INDIVIDUAL"|"EMPLOYER"|"ASSOCIATION",
//         paymentProvider: "STRIPE"|"PAYPAL",
//         paymentId: "pi_xxx" | "paypal-order-id" }
// ─────────────────────────────────────────────────────────────────────────────
exports.subscribe = asyncHandler(async (req, res) => {
  const { planType, paymentProvider, paymentId } = req.body;

  if (!planType || !paymentProvider || !paymentId) {
    throw ApiError.badRequest(
      "planType, paymentProvider and paymentId are required",
    );
  }

  const validTypes = ["INDIVIDUAL", "EMPLOYER", "ASSOCIATION"];
  if (!validTypes.includes(planType)) {
    throw ApiError.badRequest(
      `planType must be one of: ${validTypes.join(", ")}`,
    );
  }

  const member = await prisma.member.findUnique({
    where: { userId: req.user.id },
    include: { membership: true },
  });
  if (!member) throw ApiError.notFound("Member profile not found");

  // Find the matching plan for price
  const plan = PLANS.find((p) => p.type === planType);
  const priceUSD = plan?.price ?? 0;

  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1-year membership

  let membership;

  if (member.membership) {
    // Update existing record
    membership = await prisma.membership.update({
      where: { id: member.membership.id },
      data: {
        type: planType,
        status: "ACTIVE",
        priceUSD,
        startDate: now,
        expiryDate,
        paymentProvider,
        paymentId,
        paymentStatus: "COMPLETED",
      },
    });
  } else {
    // Create new membership record
    membership = await prisma.membership.create({
      data: {
        memberId: member.id,
        type: planType,
        status: "ACTIVE",
        priceUSD,
        startDate: now,
        expiryDate,
        paymentProvider,
        paymentId,
        paymentStatus: "COMPLETED",
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
