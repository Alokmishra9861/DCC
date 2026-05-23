const bcrypt = require("bcryptjs");

async function seed(prisma, faker) {
  console.log("🏫 Seeding Associations...");

  const testPassword = "Password123!";
  const hashedPassword = await bcrypt.hash(testPassword, 12);

  const districts = ["George Town", "West Bay", "Bodden Town", "North Side", "East End"];

  const associationsData = [
    {
      email: "cicsa@gov.ky",
      name: "Cayman Islands Civil Service Association",
      associationType: "MEMBER",
      orgType: "Professional Organization",
      joinCode: "CICSA-SAVINGS-2026",
      description: "Representing public sector workers in the Cayman Islands. Access preferred DCC individual rates."
    },
    {
      email: "cimda@health.ky",
      name: "Cayman Islands Medical and Dental Association",
      associationType: "MEMBER",
      orgType: "Medical Board",
      joinCode: "CIMDA-HEALTH-2026",
      description: "Dedicated to the advancement of healthcare providers. Provides exclusive health sector DCC discount access."
    },
    {
      email: "chamber@chamber.ky",
      name: "Cayman Islands Chamber of Commerce",
      associationType: "BUSINESS",
      orgType: "Chamber of Commerce",
      joinCode: "CHAMBER-BIZ-2026",
      description: "Supporting local commerce. Businesses registered with the Chamber receive automated advertising perks."
    },
    {
      email: "cca@contractors.ky",
      name: "Cayman Contractors Association",
      associationType: "BUSINESS",
      orgType: "Trade Union",
      joinCode: "CCA-BUILD-2026",
      description: "Uniting Cayman's building and construction partners. Managed discounts for building supplies."
    },
    {
      email: "cta@tourism.ky",
      name: "Cayman Tourism & Hospitality Association",
      associationType: "BUSINESS",
      orgType: "Hospitality Guild",
      joinCode: "CTA-VISIT-2026",
      description: "Representing hotels, restaurants, dive operators, and transport services in the Cayman Islands."
    }
  ];

  const associations = [];

  for (const assocData of associationsData) {
    const existing = await prisma.user.findUnique({ where: { email: assocData.email } });
    if (!existing) {
      const district = faker.helpers.arrayElement(districts);
      const phone = faker.phone.number({ style: 'international' });
      const logoUrl = `https://logo.clearbit.com/${assocData.email.split("@")[1] || "chamber.ky"}`;

      const user = await prisma.user.create({
        data: {
          email: assocData.email,
          password: hashedPassword,
          role: "ASSOCIATION",
          isEmailVerified: true,
          isActive: true,
          isSeeded: true,
          association: {
            create: {
              name: assocData.name,
              associationType: assocData.associationType,
              orgType: assocData.orgType,
              district,
              phone,
              email: assocData.email,
              website: `https://www.${assocData.email.split("@")[1]}`,
              logoUrl,
              description: assocData.description,
              isApproved: true,
              status: "APPROVED",
              joinCode: assocData.joinCode,
              joinCodeEnabled: true,
              totalMembershipCost: faker.number.float({ min: 100, max: 1000, fractionDigits: 2 }),
              totalSavings: faker.number.float({ min: 50, max: 800, fractionDigits: 2 }),
              isSeeded: true
            }
          }
        },
        include: { association: true }
      });
      associations.push(user.association);
      console.log(`  ✓ Created Association: ${assocData.name} (${assocData.associationType} Type)`);
    } else {
      const association = await prisma.association.findUnique({ where: { userId: existing.id } });
      if (association) associations.push(association);
    }
  }

  // Seed AssociationMembers (Invitations / Links) for MEMBER Associations
  const memberAssocs = associations.filter(a => a.associationType === "MEMBER");
  for (const assoc of memberAssocs) {
    for (let i = 0; i < 5; i++) {
      const email = `member.${i + 1}@${assoc.email.split("@")[1]}`;
      const name = faker.person.fullName();
      const status = faker.helpers.arrayElement(["ACTIVE", "INVITED", "REMOVED"]);

      await prisma.associationMember.create({
        data: {
          associationId: assoc.id,
          email,
          name,
          status,
          inviteToken: "seeded-token-" + faker.string.uuid(),
          totalSavings: status === "ACTIVE" ? faker.number.float({ min: 10, max: 200, fractionDigits: 2 }) : 0,
          totalRedemptions: status === "ACTIVE" ? faker.number.int({ min: 1, max: 12 }) : 0,
          isSeeded: true
        }
      });
    }
    console.log(`  ✓ Seeded 5 AssociationMembers for: ${assoc.name}`);
  }

  return { associations };
}

module.exports = { seed };
