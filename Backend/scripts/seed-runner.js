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
  try {
    const deletedReviews = await prisma.review.deleteMany({ where: { isSeeded: true } });
    const deletedReferrals = await prisma.referral.deleteMany({ where: { isSeeded: true } });
    const deletedCommissions = await prisma.commission.deleteMany({ where: { isSeeded: true } });
    const deletedPayouts = await prisma.payout.deleteMany({ where: { isSeeded: true } });
    const deletedInvoices = await prisma.invoice.deleteMany({ where: { isSeeded: true } });
    const deletedNotifications = await prisma.notification.deleteMany({ where: { isSeeded: true } });
    const deletedMessages = await prisma.message.deleteMany({ where: { isSeeded: true } });
    const deletedTravelBookings = await prisma.travelBooking.deleteMany({ where: { isSeeded: true } });
    const deletedTransactions = await prisma.transaction.deleteMany({ where: { isSeeded: true } });
    const deletedPurchases = await prisma.certificatePurchase.deleteMany({ where: { isSeeded: true } });
    const deletedCertificates = await prisma.certificate.deleteMany({ where: { isSeeded: true } });
    const deletedOffers = await prisma.offer.deleteMany({ where: { isSeeded: true } });
    const deletedAds = await prisma.advertisement.deleteMany({ where: { isSeeded: true } });
    const deletedAssocBusinesses = await prisma.associationBusiness.deleteMany({ where: { isSeeded: true } });
    const deletedAssocMembers = await prisma.associationMember.deleteMany({ where: { isSeeded: true } });
    const deletedEmployees = await prisma.employee.deleteMany({ where: { isSeeded: true } });
    
    // Clear relations in member before deleting employers/associations
    await prisma.member.updateMany({
      where: { isSeeded: true },
      data: { employerId: null, associationId: null }
    });

    const deletedMemberships = await prisma.membership.deleteMany({ where: { isSeeded: true } });
    const deletedPlans = await prisma.membershipPlan.deleteMany({ where: { isSeeded: true } });
    const deletedMembers = await prisma.member.deleteMany({ where: { isSeeded: true } });
    const deletedBusinesses = await prisma.business.deleteMany({ where: { isSeeded: true } });
    const deletedPartners = await prisma.b2BPartner.deleteMany({ where: { isSeeded: true } });
    const deletedEmployers = await prisma.employer.deleteMany({ where: { isSeeded: true } });
    const deletedAssociations = await prisma.association.deleteMany({ where: { isSeeded: true } });
    const deletedUsers = await prisma.user.deleteMany({ where: { isSeeded: true } });
    const deletedCategories = await prisma.category.deleteMany({ where: { isSeeded: true } });
    
    console.log("  ✓ Cleanup complete.");
    console.log(`    Wiped: ${deletedUsers.count} Users, ${deletedMembers.count} Members, ${deletedBusinesses.count} Businesses, ${deletedEmployers.count} Employers, ${deletedAssociations.count} Associations, ${deletedTransactions.count} Transactions, ${deletedReviews.count} Reviews.`);
  } catch (err) {
    console.error("  ❌ Warning during cleanup phase:", err.message);
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
