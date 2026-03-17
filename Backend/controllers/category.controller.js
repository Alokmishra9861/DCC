// Backend/controllers/category.controller.js

const { prisma } = require("../config/database");
const { ApiError } = require("../utils/ApiResponse");
const { asyncHandler } = require("../middlewares/errorhandler");

// ── Default categories to seed if DB is empty ─────────────────────────────────
const DEFAULT_CATEGORIES = [
  {
    name: "Automotive & Marine",
    slug: "automotive-marine",
    icon: "TruckIcon",
    description:
      "Find the best deals on vehicle maintenance, parts, detailing, and marine services.",
    imageUrl:
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "B2B Members",
    slug: "b2b",
    icon: "BriefcaseIcon",
    description:
      "Exclusive business-to-business services, wholesale opportunities, and corporate solutions.",
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
  },
  {
    name: "Beauty Salon & Barber Shop",
    slug: "beauty",
    icon: "SparklesIcon",
    description:
      "Pamper yourself with discounts on haircuts, styling, spa treatments, and grooming.",
    imageUrl:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop",
  },
  {
    name: "Construction",
    slug: "construction",
    icon: "WrenchScrewdriverIcon",
    description:
      "Save on building materials, contractors, renovation services, and heavy equipment.",
    imageUrl:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2031&auto=format&fit=crop",
  },
  {
    name: "Electronics & Office Supplies",
    slug: "electronics",
    icon: "ComputerDesktopIcon",
    description:
      "Upgrade your tech and stock up on essential office supplies and furniture for less.",
    imageUrl:
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Recreational",
    slug: "fashion",
    icon: "ShoppingBagIcon",
    description:
      "Stay stylish with offers on apparel, accessories, footwear, and jewelry.",
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Food & Beverage",
    slug: "food",
    icon: "CakeIcon",
    description:
      "Delicious dining experiences, cafes, and beverage deals across the island.",
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Health & Fitness",
    slug: "health",
    icon: "HeartIcon",
    description:
      "Gym memberships, wellness centers, healthcare savings, and pharmacy deals.",
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Home & Garden",
    slug: "home",
    icon: "HomeIcon",
    description:
      "Furniture, decor, gardening supplies, and home improvement services.",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1678836292816-fdf0ac484cf1?fm=jpg&q=60&w=3000&auto=format&fit=crop",
  },
  {
    name: "Kids & Fashion",
    slug: "kids",
    icon: "FaceSmileIcon",
    description:
      "Fun activities, toys, educational resources, and entertainment for children.",
    imageUrl:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=2075&auto=format&fit=crop",
  },
  {
    name: "Retail",
    slug: "retail",
    icon: "TagIcon",
    description:
      "General retail shopping for gifts, hobbies, pets, and everyday items.",
    imageUrl:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
  },
];

// ── GET /api/categories ───────────────────────────────────────────────────────
exports.getCategories = asyncHandler(async (req, res) => {
  let categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  // ✅ FIX: If DB has no categories, seed them automatically then re-fetch
  if (categories.length === 0) {
    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES,
      skipDuplicates: true, // safe to call multiple times
    });
    categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  }

  // Get all approved businesses with their categoryIds
  const businesses = await prisma.business.findMany({
    where: {
      status: "APPROVED",
      categoryId: { in: categories.map((c) => c.id) },
    },
    select: { id: true, categoryId: true },
  });

  // Count active offers per business
  const offerCounts = await prisma.offer.groupBy({
    by: ["businessId"],
    where: { isActive: true },
    _count: { id: true },
  });

  const offerCountByBusiness = {};
  offerCounts.forEach(({ businessId, _count }) => {
    offerCountByBusiness[businessId] = _count.id;
  });

  // Sum up deal counts and business counts per category
  const dealCountByCategory = {};
  const bizCountByCategory = {};
  businesses.forEach(({ id, categoryId }) => {
    if (!categoryId) return;
    dealCountByCategory[categoryId] =
      (dealCountByCategory[categoryId] || 0) + (offerCountByBusiness[id] || 0);
    bizCountByCategory[categoryId] = (bizCountByCategory[categoryId] || 0) + 1;
  });

  const result = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description || null,
    imageUrl: cat.imageUrl || null,
    icon: cat.icon || null,
    dealCount: dealCountByCategory[cat.id] || 0,
    businessCount: bizCountByCategory[cat.id] || 0,
  }));

  return res.status(200).json({ success: true, data: result });
});

// ── GET /api/categories/:slug ─────────────────────────────────────────────────
exports.getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await prisma.category.findFirst({ where: { slug } });
  if (!category) throw ApiError.notFound("Category not found");

  const businesses = await prisma.business.findMany({
    where: { categoryId: category.id, status: "APPROVED" },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      address: true,
      district: true,
      phone: true,
      website: true,
      offers: {
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          type: true,
          discountValue: true,
          expiryDate: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return res.status(200).json({
    success: true,
    data: {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        imageUrl: category.imageUrl || null,
        description: category.description || null,
      },
      businesses,
      totalBusinesses: businesses.length,
      totalOffers: businesses.reduce((sum, b) => sum + b.offers.length, 0),
    },
  });
});
