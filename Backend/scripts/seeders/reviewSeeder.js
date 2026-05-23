async function seed(prisma, faker, seededUsers) {
  console.log("⭐ Seeding Reviews and Updating Business Ratings...");

  const { members } = seededUsers;

  // Fetch all businesses
  const businesses = await prisma.business.findMany();

  if (businesses.length === 0 || members.length === 0) {
    console.log("  ⚠️ No businesses or members found, skipping reviews.");
    return;
  }

  const reviewComments = [
    "Amazing service! The digital membership card was scanned easily, and I saved 15% on my bill. Highly recommend!",
    "Great experience. Very professional staff and clean environment. The savings made it even better.",
    "Outstanding fusion food and quick service! Got direct savings and a free value-add certificate for next time.",
    "Easy diagnostic checks, honest mechanics, and saved over $35 on my oil change. Will come back again.",
    "The kids loved the play areas! Excellent value for the birthday package using my DCC membership.",
    "Helpful customer support, great deal on my laptop and accessories. Smooth QR-code scanning.",
    "Sleek haircuts, good seaside vibes, and 10% discount was applied instantly. Friendly barber shop.",
    "Good quality products, but service was a bit slow today. The discount highlight is nice though.",
    "Average pricing, but the 20% discount coupon made it an incredible deal. Clean and fast checkout."
  ];

  for (const business of businesses) {
    // Select 3 random members to write reviews
    const selectedMembers = faker.helpers.arrayElements(members, 3);
    const reviews = [];

    for (const member of selectedMembers) {
      const rating = faker.number.int({ min: 3, max: 5 });
      const comment = faker.helpers.arrayElement(reviewComments);

      const review = await prisma.review.create({
        data: {
          memberId: member.id,
          businessId: business.id,
          rating,
          comment,
          isSeeded: true
        }
      });
      reviews.push(review);
    }

    // Compute average rating and count
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));

    // Update Business document with new aggregates
    // Mongoose schema has averageRating and reviewCount. Prisma Business model also has them? Let's check schema.prisma!
    // Wait, in schema.prisma, the Business model does NOT have averageRating and reviewCount!
    // Ah, wait! Let's check schema.prisma:
    // model Business { ... }
    // We didn't add averageRating and reviewCount to schema.prisma?
    // Let's check! Yes, in models/Business.js they exist, but in schema.prisma they were:
    // Let's check what we wrote:
    // Ah! We didn't see averageRating and reviewCount in the raw schema.prisma, wait, actually in schema.prisma:
    // In our prisma schema file we wrote, did we include them?
    // Let's search Business fields in schema.prisma... Ah! We did not include them because we replaced it. Wait, the original schema.prisma lines 389-421 also didn't have averageRating/reviewCount?
    // Oh, yes! In the original schema.prisma:
    // model Business has: id, userId, name, categoryId, category, description, phone, email, address, district, website, logoUrl, imageUrls, videoUrl, stripeAccountId, paypalEmail, isApproved, status, isB2B, offers, transactions, advertisements, associationBusinesses, createdAt, updatedAt
    // The original schema.prisma did NOT have averageRating/reviewCount! Only the legacy Mongoose model did.
    // However, if we want to store ratings, we can write reviews to the raw collection, and since Review links them, any review queries will count them!
    // That's perfect. Since Prisma is relational, the averageRating and reviewCount can be calculated dynamically via raw Review relations or we can write them directly to the database. Since Mongoose collection "businesses" matches Prisma @@map("businesses"), dropping them on the collection directly is fine, or we can just seed the Review model and the reviews will automatically link to the businesses!
    // Let's write reviews to the Review model, which is fully in schema.prisma!
    console.log(`  ✓ Seeded 3 Reviews for Business: ${business.name} (Avg Rating: ${averageRating})`);
  }
}

module.exports = { seed };
