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
  console.log("\n🧹 Phase 1: Cleaning up previously seeded records...");
  const deleteModel = async (modelName) => {
    try {
      const res = await prisma[modelName].deleteMany({ where: { isSeeded: true } });
      return res.count || 0;
    } catch (err) {
      console.warn(`  ⚠️ Warning clearing ${modelName}:`, err.message);
      return 0;
    }
  };

  let wipedCounts = {};
  wipedCounts.reviews = await deleteModel("review");
  wipedCounts.referrals = await deleteModel("referral");
  wipedCounts.commissions = await deleteModel("commission");
  wipedCounts.payouts = await deleteModel("payout");
  wipedCounts.invoices = await deleteModel("invoice");
  wipedCounts.notifications = await deleteModel("notification");
  wipedCounts.messages = await deleteModel("message");
  wipedCounts.travelBookings = await deleteModel("travelBooking");
  wipedCounts.transactions = await deleteModel("transaction");
  wipedCounts.purchases = await deleteModel("certificatePurchase");
  wipedCounts.certificates = await deleteModel("certificate");
  wipedCounts.offers = await deleteModel("offer");
  wipedCounts.ads = await deleteModel("advertisement");
  wipedCounts.assocBusinesses = await deleteModel("associationBusiness");
  wipedCounts.assocMembers = await deleteModel("associationMember");
  wipedCounts.employees = await deleteModel("employee");

  // Clear relations in member before deleting employers/associations
  try {
    await prisma.member.updateMany({
      where: { isSeeded: true },
      data: { employerId: null, associationId: null }
    });
  } catch (err) {
    console.warn("  ⚠️ Warning clearing member relations:", err.message);
  }

  wipedCounts.memberships = await deleteModel("membership");
  wipedCounts.plans = await deleteModel("membershipPlan");
  wipedCounts.members = await deleteModel("member");
  wipedCounts.businesses = await deleteModel("business");
  wipedCounts.partners = await deleteModel("b2BPartner");
  wipedCounts.employers = await deleteModel("employer");
  wipedCounts.associations = await deleteModel("association");
  wipedCounts.users = await deleteModel("user");
  wipedCounts.categories = await deleteModel("category");

  console.log("  ✓ Cleanup complete.");
  console.log(`    Wiped: ${wipedCounts.users} Users, ${wipedCounts.members} Members, ${wipedCounts.businesses} Businesses, ${wipedCounts.employers} Employers, ${wipedCounts.associations} Associations, ${wipedCounts.transactions} Transactions, ${wipedCounts.reviews} Reviews.`);

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
