const { prisma } = require("../config/database");
require("dotenv").config();

async function run() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      member: true,
      business: true,
      employer: true,
      association: true,
      b2bPartner: true,
    }
  });

  console.log(`Total users: ${users.length}`);

  const roles = ["MEMBER", "BUSINESS", "EMPLOYER", "ASSOCIATION", "B2B"];
  roles.forEach(role => {
    const relationField = role === "B2B" ? "b2bPartner" : role.toLowerCase();
    const missing = users.filter(u => u.role === role && !u[relationField]);
    console.log(`${role} users without profile: ${missing.length}`);
    missing.forEach(u => {
      console.log(`  - ID: ${u.id}, Email: ${u.email}`);
    });
  });

  console.log("\nLast 5 created users:");
  users.slice(0, 5).forEach(u => {
    console.log(`- ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, CreatedAt: ${u.createdAt}`);
  });
}

run()
  .catch(err => console.error(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
