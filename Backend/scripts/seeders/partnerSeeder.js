const bcrypt = require("bcryptjs");

async function seed(prisma, faker) {
  console.log("🏢 Seeding B2B Partners, Referrals, and Commissions...");

  const testPassword = "Password123!";
  const hashedPassword = await bcrypt.hash(testPassword, 12);

  const partnersData = [
    {
      email: "partner@caymanmarketing.com",
      companyName: "Cayman Marketing Solutions",
      servicesOffered: "Digital Marketing & Corporate Referrals",
      website: "https://www.caymanmarketing.com"
    },
    {
      email: "info@islandcorporate.ky",
      companyName: "Island Corporate Services",
      servicesOffered: "Business Advisory & Corporate Relocations",
      website: "https://www.islandcorporate.ky"
    },
    {
      email: "refer@apexconsult.ky",
      companyName: "Apex Consultancies",
      servicesOffered: "HR Consulting & Staff Procurement",
      website: "https://www.apexconsult.ky"
    },
    {
      email: "promote@compassmedia.ky",
      companyName: "Compass Media Cayman",
      servicesOffered: "Advertising, Media & Strategic Referrals",
      website: "https://www.compassmedia.ky"
    },
    {
      email: "advisory@bdo.ky",
      companyName: "BDO Cayman",
      servicesOffered: "Financial Advisory & Corporate Strategy",
      website: "https://www.bdo.ky"
    }
  ];

  const partners = [];

  for (const partnerData of partnersData) {
    const existing = await prisma.user.findUnique({ where: { email: partnerData.email } });
    if (!existing) {
      const phone = faker.phone.number({ style: 'international' });
      const logoUrl = `https://logo.clearbit.com/${partnerData.email.split("@")[1]}`;

      const user = await prisma.user.create({
        data: {
          email: partnerData.email,
          password: hashedPassword,
          role: "B2B",
          isEmailVerified: true,
          isActive: true,
          isSeeded: true,
          b2bPartner: {
            create: {
              companyName: partnerData.companyName,
              servicesOffered: partnerData.servicesOffered,
              phone,
              email: partnerData.email,
              website: partnerData.website,
              logoUrl,
              isApproved: true,
              isSeeded: true
            }
          }
        },
        include: { b2bPartner: true }
      });
      partners.push(user.b2bPartner);
      console.log(`  ✓ Created B2B Partner: ${partnerData.companyName}`);
    } else {
      const partner = await prisma.b2BPartner.findUnique({ where: { userId: existing.id } });
      if (partner) partners.push(partner);
    }
  }

  // Seed Referrals and Commissions for each B2B Partner
  const referralStatuses = ["PENDING", "REGISTERED", "CONVERTED"];
  const commissionStatuses = ["UNPAID", "PAID"];
  const referredTypes = ["EMPLOYER", "BUSINESS"];

  for (const partner of partners) {
    // 1. Seed 4 referrals per partner
    for (let i = 0; i < 4; i++) {
      const referredName = faker.company.name();
      const referredEmail = `contact@${referredName.toLowerCase().replace(/[^a-z]/g, "")}.ky`;
      const entityType = faker.helpers.arrayElement(referredTypes);
      const status = faker.helpers.arrayElement(referralStatuses);

      await prisma.referral.create({
        data: {
          partnerId: partner.id,
          referredEmail,
          referredName,
          entityType,
          status,
          isSeeded: true
        }
      });
    }
    console.log(`  ✓ Seeded 4 Referrals for: ${partner.companyName}`);

    // 2. Seed 3 commission logs per partner
    for (let i = 0; i < 3; i++) {
      const amount = faker.number.float({ min: 50, max: 500, fractionDigits: 2 });
      const status = faker.helpers.arrayElement(commissionStatuses);
      const sourceCompany = faker.company.name();
      const source = `${faker.helpers.arrayElement(["Employer", "Business"])} Sign-up - ${sourceCompany}`;

      await prisma.commission.create({
        data: {
          partnerId: partner.id,
          amount,
          currency: "USD",
          status,
          source,
          isSeeded: true
        }
      });
    }
    console.log(`  ✓ Seeded 3 Commissions for: ${partner.companyName}`);
  }

  return { partners };
}

module.exports = { seed };
