// Backend/scripts/seed-categories.js
// Seed the categories table with core discount categories

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CATEGORIES = [
  {
    name: "Automotive & Marine",
    slug: "automotive-marine",
    icon: "TruckIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070&auto=format&fit=crop",
    description:
      "Find the best deals on vehicle maintenance, parts, detailing, and marine services.",
  },
  {
    name: "B2B Members",
    slug: "b2b",
    icon: "BriefcaseIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
    description:
      "Exclusive business-to-business services, wholesale opportunities, and corporate solutions.",
  },
  {
    name: "Beauty Salon & Barber Shop",
    slug: "beauty",
    icon: "SparklesIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop",
    description:
      "Pamper yourself with discounts on haircuts, styling, spa treatments, and grooming.",
  },
  {
    name: "Construction",
    slug: "construction",
    icon: "WrenchScrewdriverIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2031&auto=format&fit=crop",
    description:
      "Save on building materials, contractors, renovation services, and heavy equipment.",
  },
  {
    name: "Electronics & Office Supplies",
    slug: "electronics",
    icon: "ComputerDesktopIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop",
    description:
      "Upgrade your tech and stock up on essential office supplies and furniture for less.",
  },
  {
    name: "Recreational",
    slug: "fashion",
    icon: "ShoppingBagIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
    description:
      "Stay stylish with offers on apparel, accessories, footwear, and jewelry.",
  },
  {
    name: "Food & Beverage",
    slug: "food",
    icon: "CakeIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
    description:
      "Delicious dining experiences, cafes, and beverage deals across the island.",
  },
  {
    name: "Health & Fitness",
    slug: "health",
    icon: "HeartIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
    description:
      "Gym memberships, wellness centers, healthcare savings, and pharmacy deals.",
  },
  {
    name: "Home & Garden",
    slug: "home",
    icon: "HomeIcon",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1678836292816-fdf0ac484cf1?fm=jpg&q=60&w=3000&auto=format&fit=crop",
    description:
      "Furniture, decor, gardening supplies, and home improvement services.",
  },
  {
    name: "Kids & Fashion",
    slug: "kids",
    icon: "FaceSmileIcon",
    imageUrl:
      "https://trendyfashionguide.com/wp-content/uploads/2025/07/23-July-Feature-Image-3-Kids-Fashion.jpg",
    description:
      "Fun activities, toys, educational resources, and entertainment for children.",
  },
  {
    name: "Retail",
    slug: "retail",
    icon: "TagIcon",
    imageUrl:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
    description:
      "General retail shopping for gifts, hobbies, pets, and everyday items.",
  },
];

async function main() {
  try {
    console.log("🌱 Seeding categories...");

    // Delete existing categories (optional - comment out if you want to keep them)
    // await prisma.category.deleteMany({});

    for (const category of CATEGORIES) {
      const existing = await prisma.category.findUnique({
        where: { slug: category.slug },
      });

      if (existing) {
        // Update if exists
        await prisma.category.update({
          where: { slug: category.slug },
          data: category,
        });
        console.log(`✓ Updated: ${category.name}`);
      } else {
        // Create if doesn't exist
        await prisma.category.create({
          data: category,
        });
        console.log(`✓ Created: ${category.name}`);
      }
    }

    console.log("✅ Categories seeded successfully!");

    // Show summary
    const count = await prisma.category.count();
    console.log(`📊 Total categories in database: ${count}`);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
