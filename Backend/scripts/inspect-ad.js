const { prisma } = require("../config/database");
require("dotenv").config();

const inspectAd = async () => {
  const ad = await prisma.advertisement.findUnique({
    where: { id: "6a21208b2c334c0e341e2ec7" }
  });

  if (!ad) {
    console.log("Ad not found!");
    return;
  }

  console.log("Ad found:");
  console.log("id:", ad.id, typeof ad.id);
  console.log("title:", ad.title, typeof ad.title);
  console.log("status:", ad.status, typeof ad.status, ad.status === "ACTIVE" ? "is-active-string" : "not-active-string");
  console.log("startDate:", ad.startDate, ad.startDate ? ad.startDate.toISOString() : "null");
  console.log("endDate:", ad.endDate, ad.endDate ? ad.endDate.toISOString() : "null");
  console.log("paymentStatus:", ad.paymentStatus, typeof ad.paymentStatus);
};

inspectAd()
  .catch((err) => console.error(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
