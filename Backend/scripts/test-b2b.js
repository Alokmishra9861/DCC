// Backend/scripts/test-b2b.js
const { prisma } = require("../config/database");

async function runTest() {
  console.log("=== Testing B2B Directory Queries ===");
  try {
    // 1. Check B2B Partners
    const partnerCount = await prisma.b2BPartner.count({ where: { isApproved: true } });
    console.log(`- Approved B2B Partners count: ${partnerCount}`);

    // 2. Check Employers
    const employerCount = await prisma.employer.count({ where: { status: "APPROVED" } });
    console.log(`- Approved Employers count: ${employerCount}`);

    // 3. Check Associations
    const assocCount = await prisma.association.count({ where: { status: "APPROVED" } });
    console.log(`- Approved Associations count: ${assocCount}`);

    // 4. Test mapping structure
    console.log("\n--- Testing B2B Partner mapping ---");
    const rawPartners = await prisma.b2BPartner.findMany({
      where: { isApproved: true },
      take: 2,
    });
    console.log("Raw Partners sample:", rawPartners.map(p => ({ id: p.id, companyName: p.companyName })));

    console.log("\n--- Testing Employer mapping ---");
    const rawEmployers = await prisma.employer.findMany({
      where: { status: "APPROVED" },
      take: 2,
    });
    console.log("Raw Employers sample:", rawEmployers.map(e => ({ id: e.id, companyName: e.companyName })));

    console.log("\n--- Testing Association mapping ---");
    const rawAssoc = await prisma.association.findMany({
      where: { status: "APPROVED" },
      take: 2,
    });
    console.log("Raw Associations sample:", rawAssoc.map(a => ({ id: a.id, name: a.name })));

    console.log("\n=== Test Successful ===");
  } catch (error) {
    console.error("Test failed with error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
