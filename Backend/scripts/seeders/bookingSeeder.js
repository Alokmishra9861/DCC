async function seed(prisma, faker, seededUsers) {
  console.log("✈️ Seeding Bookings (Travel Bookings & Certificate Purchases)...");

  const { members } = seededUsers;

  // 1. Seed Travel Bookings for each Member
  const travelCategories = ["hotel", "flight", "car-rental", "activity"];
  const flightDetails = [
    { from: "GCM", to: "MIA", carrier: "Cayman Airways" },
    { from: "GCM", to: "LHR", carrier: "British Airways" },
    { from: "GCM", to: "CLT", carrier: "American Airlines" }
  ];

  for (const member of members) {
    // 2 travel bookings per member
    for (let i = 0; i < 2; i++) {
      const category = faker.helpers.arrayElement(travelCategories);
      const providerRef = `TRV-${faker.string.alphanumeric(8).toUpperCase()}`;

      let bookingData = {};
      const price = faker.number.float({ min: 150, max: 1200, fractionDigits: 2 });
      const savings = price * faker.helpers.arrayElement([0.05, 0.1, 0.15]);
      const commission = price * 0.05; // 5% platform commission

      if (category === "hotel") {
        bookingData = {
          hotelName: `${faker.company.name()} Resort`,
          nights: faker.number.int({ min: 2, max: 7 }),
          roomType: "Ocean Front Suite",
          guests: faker.number.int({ min: 1, max: 4 })
        };
      } else if (category === "flight") {
        const route = faker.helpers.arrayElement(flightDetails);
        bookingData = {
          airline: route.carrier,
          origin: route.from,
          destination: route.to,
          stops: 0,
          class: "Economy"
        };
      } else {
        bookingData = {
          details: `Rental deals on compact SUV or Island Sightseeing Activities`,
          provider: `${faker.company.name()} Rentals`
        };
      }

      await prisma.travelBooking.create({
        data: {
          memberId: member.id,
          category,
          providerRef,
          bookingData,
          totalPrice: price,
          commissionAmount: commission,
          savingsAmount: savings,
          bookedAt: new Date(Date.now() - faker.number.int({ min: 1, max: 30 }) * 24 * 60 * 60 * 1000),
          isSeeded: true
        }
      });
    }
    console.log(`  ✓ Seeded 2 TravelBookings for Member ID: ${member.id}`);
  }

  // 2. Seed Certificate Purchases representing service bookings
  // Get all created certificates
  const certificates = await prisma.certificate.findMany({
    include: { offer: { include: { business: true } } }
  });

  if (certificates.length === 0) {
    console.log("  ⚠️ No certificates found, skipping purchases.");
    return;
  }

  // Each member purchases 2 certificates
  let certIndex = 0;
  for (const member of members) {
    for (let i = 0; i < 2; i++) {
      if (certIndex >= certificates.length) break;

      const cert = certificates[certIndex];
      const offer = cert.offer;
      const business = offer.business;

      const amountPaid = cert.memberPrice;
      const faceValue = cert.faceValue;
      const savings = faceValue - amountPaid;

      const status = faker.helpers.arrayElement(["PURCHASED", "REDEEMED", "PURCHASED"]);
      const purchasedAt = new Date(Date.now() - faker.number.int({ min: 1, max: 15 }) * 24 * 60 * 60 * 1000);
      const redeemedAt = status === "REDEEMED" ? new Date(purchasedAt.getTime() + 2 * 24 * 60 * 60 * 1000) : null;

      // Update certificate status
      await prisma.certificate.update({
        where: { id: cert.id },
        data: { status: status === "REDEEMED" ? "REDEEMED" : "PURCHASED" }
      });

      // Create Certificate Purchase
      await prisma.certificatePurchase.create({
        data: {
          certificateId: cert.id,
          memberId: member.id,
          stripeSessionId: `cs_cert_${faker.string.alphanumeric(15)}`,
          paymentProvider: "STRIPE",
          paymentId: `ch_cert_${faker.string.alphanumeric(15)}`,
          paymentStatus: "COMPLETED",
          type: offer.type,
          faceValue,
          amountPaid,
          savingsAmount: savings,
          discountValue: offer.discountValue,
          minSpend: offer.minSpend,
          businessName: business.name,
          title: offer.title,
          uniqueCode: cert.claimCode,
          status,
          expiryDate: cert.expiryDate,
          purchasedAt,
          redeemedAt,
          isSeeded: true
        }
      });

      certIndex++;
    }
    console.log(`  ✓ Seeded 2 Certificate Purchases for Member ID: ${member.id}`);
  }
}

module.exports = { seed };
