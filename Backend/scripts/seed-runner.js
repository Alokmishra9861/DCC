const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
require("dotenv").config();

// Import all 10 seeders
const usersSeeder = require("./seeders/usersSeeder");
const membershipSeeder = require("./seeders/membershipSeeder");
const associationSeeder = require("./seeders/associationSeeder");
const employerSeeder = require("./seeders/employerSeeder");
const partnerSeeder = require("./seeders/partnerSeeder");
const businessSeeder = require("./seeders/businessSeeder");
const bookingSeeder = require("./seeders/bookingSeeder");
const reviewSeeder = require("./seeders/reviewSeeder");
const analyticsSeeder = require("./seeders/analyticsSeeder");
const payoutSeeder = require("./seeders/payoutSeeder");

const prisma = new PrismaClient();

async function runSeed() {
  console.log("🚀 Starting Discount Club Cayman Database Demo Seeder...");

  // 1. CLEANUP / ROLLBACK PHASE
  console.log("\n🧹 Phase 1: Wiping database collections raw via Mongoose to bypass relation constraints...");
  const mongoose = require("mongoose");
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      if (col.name !== "system.views") {
        const res = await db.collection(col.name).deleteMany({});
        console.log(`    ✓ Cleared collection: ${col.name} (${res.deletedCount} documents)`);
      }
    }
    await mongoose.disconnect();
    console.log("  ✓ Cleanup complete.");
  } catch (err) {
    console.error("  ❌ Database wipe failed:", err.message);
    throw err;
  }

  // 2. SEEDING PHASE
  console.log("\n🌱 Phase 2: Running relational seeding...");
  
  // Seeders execution in order of foreign key dependency
  const seededUsers = await usersSeeder.seed(prisma, faker);
  const seededPlans = await membershipSeeder.seed(prisma, faker, seededUsers);
  await associationSeeder.seed(prisma, faker);
  await employerSeeder.seed(prisma, faker, seededUsers);
  await partnerSeeder.seed(prisma, faker);
  await businessSeeder.seed(prisma, faker);
  await bookingSeeder.seed(prisma, faker, seededUsers);
  await reviewSeeder.seed(prisma, faker, seededUsers);
  await analyticsSeeder.seed(prisma, faker, seededUsers);
  await payoutSeeder.seed(prisma, faker);

  console.log("\n🎉 Platform database seeded successfully! The DCC platform looks fully live and relational.");
}

// Allow running directly from node CLI
if (require.main === module) {
  runSeed()
    .catch((err) => {
      console.error("\n❌ Seeding failed with fatal error:", err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { runSeed, prisma };
