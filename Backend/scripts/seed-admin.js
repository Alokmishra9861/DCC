const bcrypt = require("bcryptjs");
const { prisma } = require("../config/database");
require("dotenv").config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@dcc.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";

const seedAdmin = async () => {
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: hashed,
      role: "ADMIN",
      isEmailVerified: true,
      isActive: true,
    },
  });

  console.log("Admin seeded:", ADMIN_EMAIL);
};

seedAdmin()
  .catch((err) => {
    console.error("Failed to seed admin:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
