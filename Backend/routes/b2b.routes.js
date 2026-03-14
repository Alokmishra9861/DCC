// b2b.routes.js
const express = require("express");
const router = express.Router();
const { prisma } = require("../config/database");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const { protect, authorize } = require("../middlewares/auth.middleware");

// Public: list all approved B2B partners
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search, services } = req.query;
    const partners = await prisma.b2BPartner.findMany({
      where: {
        isApproved: true,
        ...(search && {
          companyName: { contains: search, mode: "insensitive" },
        }),
        ...(services && {
          servicesOffered: { contains: services, mode: "insensitive" },
        }),
      },
      select: {
        id: true,
        companyName: true,
        servicesOffered: true,
        phone: true,
        email: true,
        website: true,
        logoUrl: true,
      },
    });
    return ApiResponse.success(res, partners);
  }),
);

// B2B: update own profile
router.put(
  "/me",
  protect,
  authorize("B2B"),
  asyncHandler(async (req, res) => {
    const { companyName, servicesOffered, phone, website } = req.body;
    const partner = await prisma.b2BPartner.findUnique({
      where: { userId: req.user.id },
    });
    if (!partner) throw ApiError.notFound("B2B profile not found");

    const updated = await prisma.b2BPartner.update({
      where: { id: partner.id },
      data: { companyName, servicesOffered, phone, website },
    });
    return ApiResponse.success(res, updated, "Profile updated");
  }),
);

module.exports = router;
