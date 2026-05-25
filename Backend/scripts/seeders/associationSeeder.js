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
    },
    {
      email: "lawsociety@lawsoc.ky",
      name: "Cayman Islands Law Society",
      associationType: "MEMBER",
      orgType: "Professional Organization",
      joinCode: "LAW-SOCIETY-2026",
      description: "The official representative body of Cayman offshore legal professionals and practitioners."
    },
    {
      email: "bankers@cba.ky",
      name: "Cayman Bankers Association",
      associationType: "MEMBER",
      orgType: "Banking Board",
      joinCode: "BANKERS-SAVE-2026",
      description: "Promoting banking standards and local savings benefits for banking industry professionals."
    },
    {
      email: "cireba@cireba.ky",
      name: "Cayman Islands Real Estate Brokers Association",
      associationType: "BUSINESS",
      orgType: "Real Estate Guild",
      joinCode: "CIREBA-BIZ-2026",
      description: "Uniting local real estate brokers and property management firms across the Cayman Islands."
    },
    {
      email: "nurses@health.ky",
      name: "Cayman Islands Nurses Association",
      associationType: "MEMBER",
      orgType: "Healthcare Guild",
      joinCode: "NURSES-CARE-2026",
      description: "Caring for our caregivers. Offering premium health sector DCC discounts to nursing practitioners."
    },
    {
      email: "teachers@teachers.ky",
      name: "Cayman Islands Teachers Association",
      associationType: "MEMBER",
      orgType: "Teachers Union",
      joinCode: "TEACHERS-EDUC-2026",
      description: "Empowering educators in Cayman with preferred DCC lifestyle and retail discounts."
    },
    {
      email: "case@engineers.ky",
      name: "Cayman Society of Architects, Surveyors & Engineers",
      associationType: "BUSINESS",
      orgType: "Trade Union",
      joinCode: "CASE-BUILD-2026",
      description: "A professional body for construction, design, and engineering firms in the Cayman Islands."
    },
    {
      email: "ciipa@ciipa.ky",
      name: "Cayman Islands Institute of Professional Accountants",
      associationType: "MEMBER",
      orgType: "Professional Organization",
      joinCode: "CIIPA-TAX-2026",
      description: "Official accounting standard regulatory body, offering membership rewards on dining and travel."
    },
    {
      email: "retailers@retail.ky",
      name: "Cayman Islands Retailers Association",
      associationType: "BUSINESS",
      orgType: "Retail Alliance",
      joinCode: "RETAILERS-DCC-2026",
      description: "Uniting shopping centers, gift boutiques, and retail merchants across Grand Cayman."
    },
    {
      email: "watersports@diving.ky",
      name: "Cayman Watersports Association",
      associationType: "BUSINESS",
      orgType: "Hospitality Guild",
      joinCode: "WATER-SPORTS-2026",
      description: "Representing snorkeling, diving, jet ski, and private yacht charter operators."
    },
    {
      email: "yachtclub@yachtclub.ky",
      name: "Cayman Islands Yacht Club",
      associationType: "BUSINESS",
      orgType: "Marina Club",
      joinCode: "YACHT-CLUB-2026",
      description: "Premier boating and sailing harbor management, linking marine businesses and luxury services."
    },
    {
      email: "brewers@brewery.ky",
      name: "Cayman Brewery & Distributors Association",
      associationType: "BUSINESS",
      orgType: "Trade Union",
      joinCode: "BREWERS-DRINK-2026",
      description: "Representing craft beer brewers, spirit makers, and beverage distributors on the island."
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
