const { prisma } = require("../config/database");
require("dotenv").config();

const testActiveOnly = async () => {
  const ads = await prisma.advertisement.findMany({
    where: { status: "ACTIVE" }
  });
  console.log("Total ACTIVE ads in DB:", ads.length);
  
  const now = new Date();
  console.log("now:", now.toISOString());

  ads.forEach(ad => {
    const startOk = ad.startDate === null || ad.startDate <= now;
    const endOk = ad.endDate === null || ad.endDate >= now;
    console.log(`- Title: "${ad.title}"`);
    console.log(`  startDate: ${ad.startDate ? ad.startDate.toISOString() : "null"} (ok? ${startOk})`);
    console.log(`  endDate: ${ad.endDate ? ad.endDate.toISOString() : "null"} (ok? ${endOk})`);
    console.log(`  Combined ok? ${startOk && endOk}`);
  });
};

testActiveOnly()
  .catch((err) => console.error(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
