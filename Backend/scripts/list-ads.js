const { prisma } = require("../config/database");
require("dotenv").config();

const listAds = async () => {
  const ads = await prisma.advertisement.findMany({
    include: {
      business: {
        select: { name: true }
      }
    }
  });

  console.log("Total ads:", ads.length);
  ads.forEach((ad, index) => {
    console.log(`\n--- Ad #${index + 1} ---`);
    console.log("ID:", ad.id);
    console.log("Title:", ad.title);
    console.log("Position:", ad.position);
    console.log("Placement:", ad.placement);
    console.log("Status:", ad.status);
    console.log("Payment Status:", ad.paymentStatus);
    console.log("Price Paid:", ad.pricePaid);
    console.log("Start Date:", ad.startDate);
    console.log("End Date:", ad.endDate);
    console.log("Business Name:", ad.business?.name);
    console.log("Image/Video URL:", ad.image);
    console.log("Link URL:", ad.link);
  });
};

listAds()
  .catch((err) => console.error(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
