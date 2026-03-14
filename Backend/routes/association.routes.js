const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth.middleware");
const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const { bulkCreateMemberships } = require("../services/membership.service");
const { buildEmployerSummary } = require("../utils/savingsCalculator");

router.use(protect);
router.use(authorize("ASSOCIATION"));

router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    const association = await prisma.association.findUnique({
      where: { userId: req.user.id },
    });
    if (!association) throw ApiError.notFound("Association not found");
    if (!association.isApproved)
      throw ApiError.forbidden("Association not yet approved");

    const totalMembers = await prisma.member.count({
      where: { associationId: association.id },
    });
    const summary = buildEmployerSummary(association);

    const savingsByCategory = await prisma.transaction.groupBy({
      by: ["businessCategory"],
      where: { member: { associationId: association.id } },
      _sum: { savingsAmount: true },
      orderBy: { _sum: { savingsAmount: "desc" } },
    });

    return ApiResponse.success(res, {
      association,
      summary,
      totalMembers,
      savingsByCategory,
    });
  }),
);

router.get(
  "/members",
  asyncHandler(async (req, res) => {
    const association = await prisma.association.findUnique({
      where: { userId: req.user.id },
    });
    const members = await prisma.member.findMany({
      where: { associationId: association.id },
      include: { membership: true, user: { select: { email: true } } },
    });
    return ApiResponse.success(res, members);
  }),
);

router.post(
  "/members",
  asyncHandler(async (req, res) => {
    const { members, pricePerMember = 69.99 } = req.body;
    const association = await prisma.association.findUnique({
      where: { userId: req.user.id },
    });
    if (!association?.isApproved)
      throw ApiError.forbidden("Association not approved");

    const results = await bulkCreateMemberships(
      members,
      null,
      association.id,
      parseFloat(pricePerMember),
    );
    return ApiResponse.success(res, results);
  }),
);

module.exports = router;
