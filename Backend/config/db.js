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

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ MongoDB connected via Prisma");
    await seedBannerPrices();
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
