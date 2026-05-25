async function seed(prisma, faker, seededUsers) {
  console.log("📊 Seeding Analytics Data (Transactions, Invoices, Notifications, Messages)...");

  const { members } = seededUsers;

  // Fetch all businesses with their offers
  const businesses = await prisma.business.findMany({
    include: { category: true, offers: true }
  });

  if (businesses.length === 0 || members.length === 0) {
    console.log("  ⚠️ No businesses or members found, skipping transactions.");
    return;
  }

  // 1. Seed 220 Transactions distributed across 12 months
  console.log("  💸 Seeding 220 Transactions...");
  const now = new Date();

  // Guarantee at least 2 transactions in the current month for EVERY business
  // to prevent "0" stats on initial load.
  for (const business of businesses) {
    for (let tIdx = 0; tIdx < 2; tIdx++) {
      const member = faker.helpers.arrayElement(members);
      const offer = business.offers.length > 0 ? faker.helpers.arrayElement(business.offers) : null;
      const saleAmount = faker.number.float({ min: 30, max: 200, fractionDigits: 2 });
      const discountPercent = offer ? (offer.discountValue || 15) : 15;
      const discountAmount = parseFloat((saleAmount * (discountPercent / 100)).toFixed(2));
      const savingsAmount = discountAmount;

      const transactionDate = new Date();
      if (tIdx === 0) {
        // current week: subtract 1-2 days
        transactionDate.setDate(now.getDate() - faker.number.int({ min: 1, max: 2 }));
      } else {
        // last week: subtract 6-8 days
        transactionDate.setDate(now.getDate() - faker.number.int({ min: 6, max: 8 }));
      }
      transactionDate.setHours(faker.number.int({ min: 9, max: 20 }));

      await prisma.transaction.create({
        data: {
          memberId: member.id,
          businessId: business.id,
          offerId: offer ? offer.id : null,
          saleAmount,
          discountAmount,
          savingsAmount,
          memberAge: member.age || faker.number.int({ min: 20, max: 60 }),
          memberSex: member.sex || "female",
          memberDistrict: member.district || "George Town",
          memberSalaryLevel: member.salaryLevel || "30k_50k",
          businessCategory: business.category ? business.category.name : "Retail",
          businessDistrict: business.district || "George Town",
          status: "COMPLETED",
          transactionDate,
          isSeeded: true
        }
      });
    }
  }

  // Seed the remaining 188 transactions randomly distributed across the last 12 months
  const remainingTransactions = 220 - (businesses.length * 2);
  for (let i = 0; i < remainingTransactions; i++) {
    const member = faker.helpers.arrayElement(members);
    const business = faker.helpers.arrayElement(businesses);
    const offer = business.offers.length > 0 ? faker.helpers.arrayElement(business.offers) : null;

    const saleAmount = faker.number.float({ min: 15, max: 250, fractionDigits: 2 });
    const discountPercent = offer ? (offer.discountValue || 15) : 15;
    const discountAmount = parseFloat((saleAmount * (discountPercent / 100)).toFixed(2));
    const savingsAmount = discountAmount;

    const transactionDate = new Date();
    transactionDate.setMonth(now.getMonth() - faker.number.int({ min: 0, max: 11 }));
    transactionDate.setDate(faker.number.int({ min: 1, max: 28 }));
    transactionDate.setHours(faker.number.int({ min: 9, max: 20 }));

    await prisma.transaction.create({
      data: {
        memberId: member.id,
        businessId: business.id,
        offerId: offer ? offer.id : null,
        saleAmount,
        discountAmount,
        savingsAmount,
        memberAge: member.age || faker.number.int({ min: 20, max: 60 }),
        memberSex: member.sex || "female",
        memberDistrict: member.district || "George Town",
        memberSalaryLevel: member.salaryLevel || "30k_50k",
        businessCategory: business.category ? business.category.name : "Retail",
        businessDistrict: business.district || "George Town",
        status: "COMPLETED",
        transactionDate,
        isSeeded: true
      }
    });
  }
  console.log(`  ✓ Seeded 220 Transactions (including 2 guaranteed MTD per business) successfully.`);

  // 2. Seed Invoices for Members & Employers
  console.log("  🧾 Seeding Invoices...");
  const allUsers = await prisma.user.findMany();

  const invoiceUsers = allUsers.filter(u => u.role === "MEMBER" || u.role === "EMPLOYER");
  for (const user of invoiceUsers) {
    // 2 invoices per user
    for (let i = 0; i < 2; i++) {
      const amount = user.role === "MEMBER" ? 150.0 : 1200.0;
      const status = faker.helpers.arrayElement(["PAID", "PAID", "SENT"]);
      const invoiceNo = `DCC-INV-${transactionYear(now)}-${faker.string.numeric(5)}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      await prisma.invoice.create({
        data: {
          userId: user.id,
          invoiceNo,
          amount,
          currency: "USD",
          status,
          description: user.role === "MEMBER" ? "Discount Club Cayman Individual Annual Membership Plan" : "DCC Corporate Benefits Standard Employer Seat Package",
          dueDate,
          paidAt: status === "PAID" ? new Date() : null,
          isSeeded: true
        }
      });
    }
  }
  console.log(`  ✓ Seeded 2 Invoices per Member & Employer user.`);

  // 3. Seed Notifications for ALL users in the database
  console.log("  🔔 Seeding Notifications for all users...");
  const notificationTitles = [
    "Membership Activated! 🎉",
    "New local discount available nearby!",
    "QR Transaction Approved 💳",
    "Monthly savings report available",
    "Certificate Redeemed Successfully",
    "Welcome to Discount Club Cayman!"
  ];

  for (const user of allUsers) {
    for (let i = 0; i < 4; i++) {
      const title = faker.helpers.arrayElement(notificationTitles);
      const type = title.includes("Transaction") || title.includes("Redeemed") ? "BOOKING" : "INFO";
      const message = `This is a test notification representing: ${title.toLowerCase()} inside your DCC account panel.`;

      await prisma.notification.create({
        data: {
          userId: user.id,
          title,
          message,
          type,
          isRead: faker.helpers.arrayElement([true, false]),
          isSeeded: true
        }
      });
    }
  }
  console.log(`  ✓ Seeded 4 Dashboard Notifications for each of the ${allUsers.length} total users.`);

  // 4. Seed Support Messages / B2B Enquiries
  console.log("  📥 Seeding Support Messages...");
  const messageSubjects = [
    "Enquiry about corporate bulk purchases",
    "Question regarding individual card QR scans",
    "Request for advertising banner spaces",
    "Technical help with travel booking portal",
    "How to list B2B services directory?",
    "Partnership billing and commissions details"
  ];

  for (let i = 0; i < 20; i++) {
    const subject = faker.helpers.arrayElement(messageSubjects);
    const body = `Hi DCC Support Team,\n\nI would like some information regarding: ${subject.toLowerCase()}. Please contact me back as soon as possible.\n\nBest Regards,\n${faker.person.fullName()}`;
    const name = faker.person.fullName();
    const email = `guest.${i}@gmail.com`;

    await prisma.message.create({
      data: {
        senderName: name,
        senderEmail: email,
        subject,
        body,
        isRead: faker.helpers.arrayElement([true, false]),
        isSeeded: true
      }
    });
  }
  console.log("  ✓ Seeded 20 guest support inbox Messages.");
}

function transactionYear(date) {
  return date.getFullYear();
}

module.exports = { seed };
