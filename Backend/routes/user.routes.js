const express = require("express");
const router = express.Router();
const { prisma } = require("../config/db");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { getPagination, buildPaginationMeta } = require("../utils/Paginate");

// GET /api/users (admin only)
router.get("/", protect, authorize("ADMIN"), asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { role, search } = req.query;
  const where = {
    ...(role && { role }),
    ...(search && { email: { contains: search, mode: "insensitive" } }),
  };
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, role: true, isActive: true, isEmailVerified: true, createdAt: true,
        member: { select: { firstName: true, lastName: true } },
        employer: { select: { companyName: true } },
        association: { select: { name: true } },
        business: { select: { name: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);
  return ApiResponse.paginated(res, users, buildPaginationMeta(total, page, limit));
}));

// GET /api/users/:id
router.get("/:id", protect, asyncHandler(async (req, res) => {
  if (req.user.role !== "ADMIN" && req.user.id !== req.params.id) {
    throw ApiError.forbidden("Not authorized to view this profile");
  }
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true, email: true, role: true, isActive: true, isEmailVerified: true, createdAt: true,
      member: true, employer: true, association: true, business: true, b2bPartner: true,
    },
  });
  if (!user) throw ApiError.notFound("User not found");
  return ApiResponse.success(res, user);
}));

// PUT /api/users/:id
router.put("/:id", protect, asyncHandler(async (req, res) => {
  if (req.user.role !== "ADMIN" && req.user.id !== req.params.id) {
    throw ApiError.forbidden("Not authorized");
  }
  const { password, role, ...updateData } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: updateData,
    select: { id: true, email: true, role: true },
  });
  return ApiResponse.success(res, user, "Profile updated");
}));

// DELETE /api/users/:id (admin only)
router.delete("/:id", protect, authorize("ADMIN"), asyncHandler(async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  return ApiResponse.success(res, {}, "User deleted");
}));

module.exports = router;
