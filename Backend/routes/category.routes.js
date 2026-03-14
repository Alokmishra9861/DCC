const express = require("express");
const router = express.Router();
const { prisma } = require("../config/db");
const { ApiResponse, ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");
const { getPagination, buildPaginationMeta } = require("../utils/Paginate");

// GET /api/categories — all distinct categories from approved businesses
router.get("/", asyncHandler(async (req, res) => {
  const rows = await prisma.business.findMany({
    where: { isApproved: true, category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  const categories = rows.map((r) => r.category).filter(Boolean);
  return ApiResponse.success(res, categories);
}));

// GET /api/categories/:slug — businesses in a category (slug = url-friendly category name)
router.get("/:slug", asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const category = req.params.slug.replace(/-/g, " ");
  const [businesses, total] = await Promise.all([
    prisma.business.findMany({
      where: { isApproved: true, category: { equals: category, mode: "insensitive" } },
      select: { id: true, name: true, category: true, logoUrl: true, description: true, district: true,
        _count: { select: { offers: true } } },
      skip, take: limit,
    }),
    prisma.business.count({ where: { isApproved: true, category: { equals: category, mode: "insensitive" } } }),
  ]);
  if (!businesses.length && total === 0) throw ApiError.notFound("Category not found");
  return ApiResponse.paginated(res, { category: req.params.slug, businesses }, buildPaginationMeta(total, page, limit));
}));

module.exports = router;
