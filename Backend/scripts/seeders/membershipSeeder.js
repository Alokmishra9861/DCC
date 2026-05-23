async function seed(prisma, faker, seededUsers) {
  console.log("💳 Seeding Membership Plans and Member Subscriptions...");

  const { members } = seededUsers;

  // 1. Seed or Update Membership Plans
  const plansData = [
    {
      name: "Individual Monthly",
      price: 15.0,
      currency: "KYD",
      billingCycle: "month",
      description: "Standard personal discount plan billed monthly",
      badge: "Standard",
      isActive: true,
      features: JSON.stringify([
        "Access to all local business discounts",
        "Digital membership card",
        "Up to 20% off on retail & food",
        "Individual account profile"
      ]),
      isSeeded: true
    },
    {
      name: "Individual Annual",
      price: 150.0,
      currency: "KYD",
      billingCycle: "year",
      description: "Standard personal discount plan billed annually (Save $30!)",
      badge: "Popular",
      isActive: true,
      features: JSON.stringify([
        "Access to all local business discounts",
        "Digital membership card",
        "Up to 20% off on retail & food",
        "Individual account profile",
        "2 months free compared to monthly billing"
      ]),
      isSeeded: true
    },
    {
      name: "Family Monthly",
      price: 25.0,
      currency: "KYD",
      billingCycle: "month",
      description: "Discount benefits for your entire household (up to 4 members)",
      badge: "Value",
      isActive: true,
      features: JSON.stringify([
        "Access to all local business discounts",
        "Digital membership cards for all members",
        "Up to 25% off on family packages",
        "1 primary account + 3 secondary member accounts"
      ]),
      isSeeded: true
    },
    {
      name: "Family Annual",
      price: 250.0,
      currency: "KYD",
      billingCycle: "year",
      description: "Annual household plan for best savings (Save $50!)",
      badge: "Best Value",
      isActive: true,
      features: JSON.stringify([
        "Access to all local business discounts",
        "Digital membership cards for all members",
        "Up to 25% off on family packages",
        "1 primary account + 3 secondary member accounts",
        "2 months free compared to monthly billing"
      ]),
      isSeeded: true
    }
  ];

  const plans = [];
  for (const planData of plansData) {
    const existing = await prisma.membershipPlan.findFirst({
      where: { name: planData.name }
    });

    if (existing) {
      const updated = await prisma.membershipPlan.update({
        where: { id: existing.id },
        data: {
          ...planData,
          features: JSON.parse(planData.features)
        }
      });
      plans.push(updated);
    } else {
      const created = await prisma.membershipPlan.create({
        data: {
          ...planData,
          features: JSON.parse(planData.features)
        }
      });
      plans.push(created);
      console.log(`  ✓ Created Membership Plan: ${planData.name}`);
    }
  }

  // 2. Associate Members with Memberships
  const statuses = ["ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "PENDING", "EXPIRED", "ACTIVE"];
  const paymentProviders = ["STRIPE", "PAYPAL", "MANUAL"];

  for (let i = 0; i < members.length; i++) {
    const member = members[i];

    // Check if membership already exists
    const existingMembership = await prisma.membership.findUnique({
      where: { memberId: member.id }
    });

    if (!existingMembership) {
      const status = i < statuses.length ? statuses[i] : "ACTIVE";
      const plan = faker.helpers.arrayElement(plans);
      const paymentProvider = faker.helpers.arrayElement(paymentProviders);

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - faker.number.int({ min: 1, max: 10 }));

      const expiryDate = new Date(startDate);
      if (plan.billingCycle === "month") {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      await prisma.membership.create({
        data: {
          memberId: member.id,
          type: "INDIVIDUAL",
          status: status,
          priceUSD: plan.price,
          startDate: status === "PENDING" ? null : startDate,
          expiryDate: status === "PENDING" ? null : expiryDate,
          paymentProvider: status === "PENDING" ? null : paymentProvider,
          paymentId: status === "PENDING" ? null : `ch_${faker.string.alphanumeric(14)}`,
          paymentStatus: status === "PENDING" ? "PENDING" : "COMPLETED",
          planId: plan.id,
          isSeeded: true
        }
      });
      console.log(`  ✓ Created Membership for Member ID: ${member.id} (Status: ${status}, Plan: ${plan.name})`);
    }
  }

  return { plans };
}

module.exports = { seed };
