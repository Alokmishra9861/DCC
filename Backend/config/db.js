const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

const seedBannerPrices = async () => {
  try {
    const count = await prisma.bannerPrice.count();
    if (count === 0) {
      console.log("🌱 Database is empty of banner prices. Seeding defaults...");
      await prisma.bannerPrice.createMany({
        data: [
          { position: "top", daily: 50, weekly: 250, monthly: 800 },
          { position: "middle", daily: 40, weekly: 200, monthly: 600 },
          { position: "bottom", daily: 30, weekly: 150, monthly: 450 },
        ],
      });
      console.log("✅ Seeded default banner prices");
    }
  } catch (error) {
    console.error("⚠️ Failed to seed banner prices:", error.message);
  }
};

const seedCoverBanners = async () => {
  try {
    const coverBanners = [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop", // Modern glass office building
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop", // Modern conference room
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=600&auto=format&fit=crop", // Clean office workplace
      "https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=600&auto=format&fit=crop", // Abstract geometric business texture
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop"  // Business analytics / desk
    ];

    const mockLogos = [
      "https://images.unsplash.com/photo-1516876437184-593fda40c7ce?q=80&w=200&auto=format&fit=crop", // Abstract stamp
      "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=200&auto=format&fit=crop", // Modern icon
      "https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=200&auto=format&fit=crop", // Blue geometric logo
      "https://images.unsplash.com/photo-1561070791-26c113006238?q=80&w=200&auto=format&fit=crop", // Yellow design icon
      "https://images.unsplash.com/photo-1572021335469-31706a17aaef?q=80&w=200&auto=format&fit=crop"  // Modern creative badge
    ];

    const partners = await prisma.b2BPartner.findMany();
    let updatedCount = 0;
    for (let i = 0; i < partners.length; i++) {
      const partner = partners[i];
      
      const isFakeLogo = !partner.logoUrl || partner.logoUrl.includes("clearbit.com");
      const logoUrl = isFakeLogo ? mockLogos[i % mockLogos.length] : partner.logoUrl;
      const coverBannerUrl = partner.coverBannerUrl || coverBanners[i % coverBanners.length];
      
      if (!partner.coverBannerUrl || isFakeLogo) {
        await prisma.b2BPartner.update({
          where: { id: partner.id },
          data: {
            logoUrl,
            coverBannerUrl
          }
        });
        updatedCount++;
      }
    }
    if (updatedCount > 0) {
      console.log(`🌱 Seeded missing logo/cover images for ${updatedCount} B2B Partners`);
    }
  } catch (error) {
    console.error("⚠️ Failed to seed B2B Partner cover banners:", error.message);
  }
};

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ MongoDB connected via Prisma");
    await seedBannerPrices();
    await seedCoverBanners();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

module.exports = { prisma, connectDB };
