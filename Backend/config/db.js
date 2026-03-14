const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ MongoDB connected via Prisma");
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
