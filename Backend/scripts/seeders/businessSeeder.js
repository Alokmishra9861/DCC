const bcrypt = require("bcryptjs");

async function seed(prisma, faker) {
  console.log("🏪 Seeding Categories, Businesses, Offers, Certificates, and Ads...");

  const testPassword = "Password123!";
  const hashedPassword = await bcrypt.hash(testPassword, 12);

  const districts = ["George Town", "West Bay", "Bodden Town", "North Side", "East End"];

  // 1. Seed Categories first
  const CATEGORIES = [
    { name: "Automotive & Marine", slug: "automotive-marine", icon: "TruckIcon", imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070&auto=format&fit=crop", description: "Deals on vehicle maintenance, parts, detailing, and marine services." },
    { name: "B2B Members", slug: "b2b", icon: "BriefcaseIcon", imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop", description: "Business-to-business services, wholesale opportunities, and corporate solutions." },
    { name: "Beauty Salon & Barber Shop", slug: "beauty", icon: "SparklesIcon", imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop", description: "Haircuts, styling, spa treatments, and grooming." },
    { name: "Construction", slug: "construction", icon: "WrenchScrewdriverIcon", imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2031&auto=format&fit=crop", description: "Building materials, contractors, renovation services, and equipment." },
    { name: "Electronics & Office Supplies", slug: "electronics", icon: "ComputerDesktopIcon", imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop", description: "Upgrade tech and stock up on essential office supplies." },
    { name: "Recreational", slug: "fashion", icon: "ShoppingBagIcon", imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop", description: "Apparel, accessories, footwear, and jewelry." },
    { name: "Food & Beverage", slug: "food", icon: "CakeIcon", imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop", description: "Dining experiences, cafes, and beverage deals." },
    { name: "Health & Fitness", slug: "health", icon: "HeartIcon", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop", description: "Gym memberships, wellness centers, and pharmacy deals." },
    { name: "Home & Garden", slug: "home", icon: "HomeIcon", imageUrl: "https://plus.unsplash.com/premium_photo-1678836292816-fdf0ac484cf1?fm=jpg&q=60&w=3000&auto=format&fit=crop", description: "Furniture, decor, gardening supplies, and home services." },
    { name: "Kids & Fashion", slug: "kids", icon: "FaceSmileIcon", imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77ebe?q=80&w=2070&auto=format&fit=crop", description: "Activities, toys, and entertainment for children." },
    { name: "Retail", slug: "retail", icon: "TagIcon", imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop", description: "General retail shopping for gifts, hobbies, and everyday items." }
  ];

  const categories = [];
  for (const cat of CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      categories.push(existing);
    } else {
      const created = await prisma.category.create({ data: { ...cat, isSeeded: true } });
      categories.push(created);
      console.log(`  ✓ Created Category: ${cat.name}`);
    }
  }

  // 2. Seed 16 Businesses under different categories
  const businessesData = [
    { email: "info@grandcaymanauto.com", name: "Grand Cayman Auto Repair", catSlug: "automotive-marine", desc: "Full service auto repair, detailing and diagnostic checks.", district: "George Town" },
    { email: "salon@caymanbarber.ky", name: "Cayman Barber & Salon", catSlug: "beauty", desc: "Modern and traditional hair styling, spa shaving and facials.", district: "West Bay" },
    { email: "eat@islandgourmet.ky", name: "Island Gourmet Bistro", catSlug: "food", desc: "Fine dining seaside restaurant with authentic Caribbean fusion flavor.", district: "George Town" },
    { email: "build@caymanhomes.ky", name: "Cayman Home & Garden", catSlug: "home", desc: "Premium interior decor, outdoor landscapes, and gardening tools.", district: "Bodden Town" },
    { email: "play@kidsfunzone.ky", name: "Kids Fun Zone & Toys", catSlug: "kids", desc: "Safe play areas, birthday event plans, and premium children's toys.", district: "George Town" },
    { email: "sales@electrohouse.ky", name: "Cayman Electro House", catSlug: "electronics", desc: "Authorized tech dealer offering laptops, home screens, and office tools.", district: "George Town" },
    { email: "contact@caymanwellness.ky", name: "Cayman Wellness Hub", catSlug: "health", desc: "Holistic physiotherapy, yoga, nutrition counseling and pharmacy discounts.", district: "West Bay" },
    { email: "dive@bluewater.ky", name: "Blue Water Watersports", catSlug: "automotive-marine", desc: "Yacht charters, private boat cruises, jet ski rentals and scuba tours.", district: "North Side" },
    { email: "info@rumpointseaside.ky", name: "Rum Point Seaside Club", catSlug: "food", desc: "Casual beachfront dining with mudslides, seafood, and tropical drinks.", district: "North Side" },
    { email: "spa@sevenmilebeach.ky", name: "Seven Mile Beach Spa", catSlug: "beauty", desc: "Relaxing massage treatments, beauty facials, and marine mud wraps.", district: "West Bay" },
    { email: "spirits@jacquesscott.com", name: "Jacques Scott Wine & Spirits", catSlug: "retail", desc: "Cayman's leading distributor of fine wines, beers, and premium spirits.", district: "George Town" },
    { email: "travel@caymanairways.com", name: "Cayman Airways Travel", catSlug: "fashion", desc: "Exclusive booking discounts on regional flights and travel perks.", district: "George Town" },
    { email: "cinema@camanabay.ky", name: "Camana Bay VIP Cinema", catSlug: "kids", desc: "Luxury movie theatre experiences with reclining seats and gourmet food.", district: "George Town" },
    { email: "sports@redsail.ky", name: "Red Sail Sports Cayman", catSlug: "automotive-marine", desc: "Catamaran sails, stingray city tours, paddleboards and dive courses.", district: "West Bay" },
    { email: "brewery@caymanbeer.ky", name: "Cayman Islands Brewery", catSlug: "retail", desc: "Home of Caybrew! Local brewery tours, tasting room and merchandise store.", district: "George Town" },
    { email: "sales@caymanconstruction.ky", name: "Cayman Construction Supplies", catSlug: "construction", desc: "Wholesale cement, professional power tools, and high-quality paint materials.", district: "Bodden Town" }
  ];

  const businesses = [];
  for (const biz of businessesData) {
    const existing = await prisma.user.findUnique({ where: { email: biz.email } });
    if (!existing) {
      const category = categories.find(c => c.slug === biz.catSlug) || categories[0];
      const phone = faker.phone.number({ style: 'international' });
      const address = faker.location.streetAddress();
      const website = `https://www.${biz.email.split("@")[1]}`;
      const logoUrl = `https://logo.clearbit.com/${biz.email.split("@")[1]}`;
      const imageUrls = [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800",
        "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800"
      ];

      const user = await prisma.user.create({
        data: {
          email: biz.email,
          password: hashedPassword,
          role: "BUSINESS",
          isEmailVerified: true,
          isActive: true,
          isSeeded: true,
          business: {
            create: {
              name: biz.name,
              categoryId: category.id,
              description: biz.desc,
              phone,
              email: biz.email,
              address,
              district: biz.district,
              website,
              logoUrl,
              imageUrls,
              isApproved: true,
              status: "APPROVED",
              isB2B: biz.catSlug === "b2b",
              workingHours: "Mon-Fri: 8:30 AM - 5:30 PM, Sat: 9:00 AM - 4:00 PM",
              bankName: "Cayman National Bank",
              bankAccountNumber: faker.finance.accountNumber(10),
              upiQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=UPI-DCC-MERCHANT",
              isSeeded: true
            }
          }
        },
        include: { business: true }
      });
      businesses.push(user.business);
      console.log(`  ✓ Created Business: ${biz.name}`);
    } else {
      const business = await prisma.business.findUnique({ where: { userId: existing.id } });
      if (business) businesses.push(business);
    }
  }

  // 3. Seed Offers & Certificates for each Business
  const offerTypes = ["DISCOUNT", "VALUE_ADDED_CERTIFICATE", "PREPAID_CERTIFICATE"];

  for (const business of businesses) {
    // Each business gets 3 offers (one of each type)
    for (let i = 0; i < 3; i++) {
      const type = offerTypes[i];
      const title = type === "DISCOUNT"
        ? `${faker.number.int({ min: 10, max: 25 })}% Off Entire Purchase`
        : type === "VALUE_ADDED_CERTIFICATE"
        ? `Buy $50, Get $15 Free Value Add`
        : `Prepaid $100 Gift Card for $75`;

      const description = type === "DISCOUNT"
        ? `Receive direct savings on all items. Valid for members only.`
        : `Purchase a coupon card. Pays $50 to store, receives $65 value.`;

      const discountValue = type === "DISCOUNT" ? faker.number.int({ min: 10, max: 25 }) : 15.0;
      const minSpend = type === "DISCOUNT" ? faker.number.int({ min: 10, max: 50 }) : 0;

      const offer = await prisma.offer.create({
        data: {
          businessId: business.id,
          type,
          title,
          description,
          imageUrl: business.logoUrl,
          discountValue,
          minSpend,
          isActive: true,
          expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
          views: faker.number.int({ min: 100, max: 1200 }),
          clicks: faker.number.int({ min: 20, max: 350 }),
          isSeeded: true
        }
      });

      // Seed 5 Certificates for this Offer (AVAILABLE)
      for (let c = 0; c < 5; c++) {
        await prisma.certificate.create({
          data: {
            offerId: offer.id,
            faceValue: type === "VALUE_ADDED_CERTIFICATE" ? 65.0 : 100.0,
            memberPrice: type === "VALUE_ADDED_CERTIFICATE" ? 50.0 : 75.0,
            status: "AVAILABLE",
            claimCode: `DCC-${faker.string.alphanumeric(6).toUpperCase()}`,
            expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            isSeeded: true
          }
        });
      }
    }
    console.log(`  ✓ Seeded 3 Offers & 15 Certificates for: ${business.name}`);

    // 4. Seed Advertisements for each Business
    const positions = ["top", "middle", "bottom"];
    const adTitle = `${business.name} Premium Ads`;
    const position = faker.helpers.arrayElement(positions);

    await prisma.advertisement.create({
      data: {
        businessId: business.id,
        title: adTitle,
        image: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=728&h=200&fit=crop",
        link: business.website,
        position,
        placement: "default",
        status: "ACTIVE",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        impressions: faker.number.int({ min: 500, max: 10000 }),
        clicks: faker.number.int({ min: 50, max: 800 }),
        paymentStatus: "COMPLETED",
        stripeSessionId: `cs_ad_${faker.string.alphanumeric(15)}`,
        pricePaid: 150.0,
        isSeeded: true
      }
    });
    console.log(`  ✓ Seeded Banner Ad for: ${business.name}`);

    // 5. Link Business to BUSINESS Associations
    const businessAssocs = await prisma.association.findMany({
      where: { associationType: "BUSINESS" }
    });

    if (businessAssocs.length > 0) {
      const assoc = faker.helpers.arrayElement(businessAssocs);
      await prisma.associationBusiness.create({
        data: {
          associationId: assoc.id,
          businessId: business.id,
          status: "LINKED",
          inviteToken: "seeded-token-" + faker.string.uuid(),
          isSeeded: true
        }
      });
      console.log(`  ✓ Linked Business: ${business.name} to Association: ${assoc.name}`);
    }
  }

  return { categories, businesses };
}

module.exports = { seed };
