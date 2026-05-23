async function seed(prisma, faker) {
  console.log("💰 Seeding Payouts (Settlements to Businesses and Partners)...");

  // Fetch all businesses & partners
  const businesses = await prisma.business.findMany();
  const partners = await prisma.b2BPartner.findMany();

  if (businesses.length === 0 && partners.length === 0) {
    console.log("  ⚠️ No businesses or partners found, skipping payouts.");
    return;
  }

  const methods = ["STRIPE", "PAYPAL", "BANK_TRANSFER"];
  const statuses = ["COMPLETED", "COMPLETED", "PENDING"];

  // 1. Seed Payouts for Businesses
  for (const business of businesses) {
    for (let i = 0; i < 3; i++) {
      const amount = faker.number.float({ min: 100, max: 2000, fractionDigits: 2 });
      const status = faker.helpers.arrayElement(statuses);
      const method = faker.helpers.arrayElement(methods);
      const referenceId = `PAY-BIZ-${faker.string.alphanumeric(8).toUpperCase()}`;

      await prisma.payout.create({
        data: {
          businessId: business.id,
          amount,
          currency: "USD",
          status,
          method,
          referenceId: status === "COMPLETED" ? referenceId : null,
          createdAt: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000), // weekly payouts
          isSeeded: true
        }
      });
    }
    console.log(`  ✓ Seeded 3 Payouts for Business: ${business.name}`);
  }

  // 2. Seed Payouts for B2B Partners
  for (const partner of partners) {
    for (let i = 0; i < 3; i++) {
      const amount = faker.number.float({ min: 50, max: 500, fractionDigits: 2 });
      const status = faker.helpers.arrayElement(statuses);
      const method = faker.helpers.arrayElement(methods);
      const referenceId = `PAY-PTN-${faker.string.alphanumeric(8).toUpperCase()}`;

      await prisma.payout.create({
        data: {
          partnerId: partner.id,
          amount,
          currency: "USD",
          status,
          method,
          referenceId: status === "COMPLETED" ? referenceId : null,
          createdAt: new Date(Date.now() - (i + 1) * 14 * 24 * 60 * 60 * 1000), // bi-weekly payouts
          isSeeded: true
        }
      });
    }
    console.log(`  ✓ Seeded 3 Payouts for B2B Partner: ${partner.companyName}`);
  }
}

module.exports = { seed };
