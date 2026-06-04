const { prisma } = require("../config/database");
require("dotenv").config();

const testQuery = async () => {
  const now = new Date();
  console.log("Current time (now):", now.toISOString());

  const allAds = await prisma.advertisement.findMany({
    include: { business: { select: { name: true } } }
  });
  console.log("Total ads in DB:", allAds.length);

  const matchedAds = await prisma.advertisement.findMany({
    where: {
      status: "ACTIVE",
      OR: [{ startDate: null }, { startDate: { lte: now } }],
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
    },
    include: { business: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  console.log("Matched ads count:", matchedAds.length);
  matchedAds.forEach((ad) => {
    console.log(`- ${ad.title} (${ad.position}): status=${ad.status}, startDate=${ad.startDate}, endDate=${ad.endDate}`);
  });
};

testQuery()
  .catch((err) => console.error(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
