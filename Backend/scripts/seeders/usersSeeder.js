const bcrypt = require("bcryptjs");

async function seed(prisma, faker) {
  console.log("👥 Seeding Users and Members...");

  const testPassword = "Password123!";
  const hashedPassword = await bcrypt.hash(testPassword, 12);

  const districts = ["George Town", "West Bay", "Bodden Town", "North Side", "East End", "Cayman Brac", "Little Cayman"];
  const salaryLevels = ["under_30k", "30k_50k", "50k_75k", "75k_100k", "over_100k"];
  const sexes = ["male", "female"];

  // 1. Seed 15 Admin Users
  const admins = [];
  const adminEmails = [
    "admin@discountclubcayman.com",
    "superadmin@dcc.ky",
    "operations@dcc.ky",
    "support@dcc.ky",
    "finance@dcc.ky",
    "marketing@dcc.ky",
    "moderator@dcc.ky",
    "audit@dcc.ky",
    "hr.internal@dcc.ky",
    "it@dcc.ky",
    "compliance@dcc.ky",
    "executive@dcc.ky",
    "sales.internal@dcc.ky",
    "billing@dcc.ky",
    "analytics@dcc.ky"
  ];

  for (let i = 0; i < adminEmails.length; i++) {
    const email = adminEmails[i];
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      const admin = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "ADMIN",
          isEmailVerified: true,
          isActive: true,
          isSeeded: true
        }
      });
      admins.push(admin);
      console.log(`  ✓ Created Admin: ${email}`);
    } else {
      admins.push(existing);
    }
  }

  // 2. Seed 20 Individual Member Users
  const members = [];
  const memberEmails = [
    "john.doe@gmail.com",
    "sarah.connor@hotmail.com",
    "michael.smith@yahoo.com",
    "david.miller@dcc.ky",
    "emily.davis@gmail.com",
    "robert.wilson@outlook.com",
    "linda.taylor@gmail.com",
    "james.brown@yahoo.com",
    "elizabeth.jones@gmail.com",
    "william.garcia@gmail.com",
    "charles.martinez@gmail.com",
    "patricia.robinson@yahoo.com",
    "christopher.clark@outlook.com",
    "barbara.rodriguez@gmail.com",
    "matthew.lewis@gmail.com",
    "susan.lee@hotmail.com",
    "joseph.walker@yahoo.com",
    "jessica.hall@gmail.com",
    "thomas.allen@outlook.com",
    "karen.young@gmail.com"
  ];

  for (let i = 0; i < memberEmails.length; i++) {
    const email = memberEmails[i];
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      const sex = faker.helpers.arrayElement(sexes);
      const firstName = faker.person.firstName(sex);
      const lastName = faker.person.lastName();
      const age = faker.number.int({ min: 19, max: 65 });
      const phone = faker.phone.number({ style: 'international' });
      const district = faker.helpers.arrayElement(districts);
      const salaryLevel = faker.helpers.arrayElement(salaryLevels);
      const avatarUrl = `https://randomuser.me/api/portraits/${sex === "male" ? "men" : "women"}/${faker.number.int({ min: 1, max: 99 })}.jpg`;

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "MEMBER",
          isEmailVerified: true,
          isActive: true,
          isSeeded: true,
          member: {
            create: {
              firstName,
              lastName,
              phone,
              age,
              sex,
              district,
              salaryLevel,
              avatarUrl,
              totalSavings: faker.number.float({ min: 50, max: 1500, fractionDigits: 2 }),
              totalSpent: faker.number.float({ min: 200, max: 6000, fractionDigits: 2 }),
              isSeeded: true
            }
          }
        },
        include: { member: true }
      });
      members.push(user.member);
      console.log(`  ✓ Created Member User: ${email} (${firstName} ${lastName})`);
    } else {
      const member = await prisma.member.findUnique({ where: { userId: existing.id } });
      if (member) members.push(member);
    }
  }

  return { admins, members };
}

module.exports = { seed };
