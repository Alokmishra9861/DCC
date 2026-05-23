const bcrypt = require("bcryptjs");

async function seed(prisma, faker, seededUsers) {
  console.log("🏢 Seeding Employers and Employees...");

  const { members } = seededUsers;

  const testPassword = "Password123!";
  const hashedPassword = await bcrypt.hash(testPassword, 12);

  const districts = ["George Town", "West Bay", "Bodden Town", "North Side", "East End"];

  const employersData = [
    {
      email: "hr@caymannational.com",
      companyName: "Cayman National Bank",
      industry: "Financial Services",
      planType: "ENTERPRISE",
      seatsPurchased: 100,
      seatsUsed: 5,
      bulkPriceUSD: 2500.0,
      description: "Cayman's premier financial institution providing DCC perks to all banking personnel."
    },
    {
      email: "hr@dart.ky",
      companyName: "Dart Enterprises",
      industry: "Real Estate & Hospitality",
      planType: "ENTERPRISE",
      seatsPurchased: 150,
      seatsUsed: 2,
      bulkPriceUSD: 3500.0,
      description: "Cayman's largest developer ensuring property management and investment teams save local."
    },
    {
      email: "hr@fosters.ky",
      companyName: "Foster's Supermarket",
      industry: "Retail & Grocery",
      planType: "STANDARD",
      seatsPurchased: 50,
      seatsUsed: 1,
      bulkPriceUSD: 1200.0,
      description: "Supporting foster's supermarket staff with discount opportunities across the island."
    },
    {
      email: "hr@kirkmarket.ky",
      companyName: "Kirk Market",
      industry: "Retail & Grocery",
      planType: "STANDARD",
      seatsPurchased: 50,
      seatsUsed: 1,
      bulkPriceUSD: 1200.0,
      description: "Kirk market corporate wellness program discount benefits package."
    },
    {
      email: "hr@healthcity.ky",
      companyName: "Health City Cayman Islands",
      industry: "Healthcare",
      planType: "ENTERPRISE",
      seatsPurchased: 80,
      seatsUsed: 1,
      bulkPriceUSD: 2000.0,
      description: "Caring for our healthcare professionals with local savings memberships."
    }
  ];

  const employers = [];

  for (const empData of employersData) {
    const existing = await prisma.user.findUnique({ where: { email: empData.email } });
    if (!existing) {
      const district = faker.helpers.arrayElement(districts);
      const phone = faker.phone.number({ style: 'international' });
      const logoUrl = `https://logo.clearbit.com/${empData.email.split("@")[1]}`;

      const user = await prisma.user.create({
        data: {
          email: empData.email,
          password: hashedPassword,
          role: "EMPLOYER",
          isEmailVerified: true,
          isActive: true,
          isSeeded: true,
          employer: {
            create: {
              companyName: empData.companyName,
              industry: empData.industry,
              district,
              phone,
              logoUrl,
              isApproved: true,
              status: "APPROVED",
              planType: empData.planType,
              seatsPurchased: empData.seatsPurchased,
              seatsUsed: empData.seatsUsed,
              planStartDate: new Date(),
              planExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
              bulkPaymentProvider: "STRIPE",
              bulkPaymentId: `cs_test_${faker.string.alphanumeric(20)}`,
              bulkPaymentStatus: "COMPLETED",
              bulkPriceUSD: empData.bulkPriceUSD,
              totalMembershipCost: empData.bulkPriceUSD,
              totalSavings: faker.number.float({ min: 100, max: 2000, fractionDigits: 2 }),
              totalRedemptions: faker.number.int({ min: 5, max: 60 }),
              isSeeded: true
            }
          }
        },
        include: { employer: true }
      });
      employers.push(user.employer);
      console.log(`  ✓ Created Employer: ${empData.companyName}`);
    } else {
      const employer = await prisma.employer.findUnique({ where: { userId: existing.id } });
      if (employer) employers.push(employer);
    }
  }

  // Seed Employees and map some to our individual Member users
  let memberIndex = 0;
  for (const employer of employers) {
    // Each employer gets 5 employee invite records
    for (let i = 0; i < 5; i++) {
      const name = faker.person.fullName();
      const email = `employee.${i + 1}@${employer.companyName.toLowerCase().replace(/[^a-z]/g, "")}.ky`;
      
      // Let's activate some employees by linking them to actual Member users
      let status = "INVITED";
      let userId = null;
      let memberId = null;

      if (i < 2 && memberIndex < members.length) {
        status = "ACTIVE";
        const member = members[memberIndex];
        userId = member.userId;
        memberId = member.id;
        
        // Link member to employer
        await prisma.member.update({
          where: { id: member.id },
          data: { employerId: employer.id }
        });
        
        memberIndex++;
      }

      await prisma.employee.create({
        data: {
          employerId: employer.id,
          email,
          name,
          status,
          inviteToken: "seeded-token-" + faker.string.uuid(),
          inviteExpiresAt: status === "INVITED" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
          inviteAcceptedAt: status === "ACTIVE" ? new Date() : null,
          userId,
          memberId,
          totalSavings: status === "ACTIVE" ? faker.number.float({ min: 10, max: 300, fractionDigits: 2 }) : 0,
          totalRedemptions: status === "ACTIVE" ? faker.number.int({ min: 1, max: 15 }) : 0,
          isSeeded: true
        }
      });
    }
    console.log(`  ✓ Seeded 5 Employee invites for: ${employer.companyName}`);
  }

  return { employers };
}

module.exports = { seed };
