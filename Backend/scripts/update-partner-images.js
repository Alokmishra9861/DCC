// Backend/scripts/update-partner-images.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const coverBanners = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop", // Modern glass office building
  "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop", // Modern conference room
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=600&auto=format&fit=crop", // Clean office workplace
  "https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=600&auto=format&fit=crop", // Abstract geometric business texture
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop"  // Business analytics / desk
];

async function updatePartners() {
  console.log("🔍 Fetching existing B2B Partners from database...");
  const partners = await prisma.b2BPartner.findMany();
  console.log(`Found ${partners.length} B2B Partners in database.`);

  const mockLogos = [
    "https://images.unsplash.com/photo-1516876437184-593fda40c7ce?q=80&w=200&auto=format&fit=crop", // Abstract stamp
    "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=200&auto=format&fit=crop", // Modern icon
    "https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=200&auto=format&fit=crop", // Blue geometric logo
    "https://images.unsplash.com/photo-1561070791-26c113006238?q=80&w=200&auto=format&fit=crop", // Yellow design icon
    "https://images.unsplash.com/photo-1572021335469-31706a17aaef?q=80&w=200&auto=format&fit=crop"  // Modern creative badge
  ];

  let updatedCount = 0;
  for (let i = 0; i < partners.length; i++) {
    const partner = partners[i];
    
    const isFakeLogo = !partner.logoUrl || partner.logoUrl.includes("clearbit.com");
    const logoUrl = isFakeLogo ? mockLogos[i % mockLogos.length] : partner.logoUrl;
    
    // Assign a beautiful unsplash cover image
    const coverBannerUrl = partner.coverBannerUrl || coverBanners[i % coverBanners.length];
    
    await prisma.b2BPartner.update({
      where: { id: partner.id },
      data: {
        logoUrl,
        coverBannerUrl
      }
    });
    console.log(`  ✓ Updated ${partner.companyName} with Logo & Cover`);
    updatedCount++;
  }
  console.log(`\n🎉 Successfully updated ${updatedCount} B2B Partners with cover images and logos!`);
}

updatePartners()
  .catch((err) => {
    console.error("❌ Failed to update B2B Partners:", err.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
