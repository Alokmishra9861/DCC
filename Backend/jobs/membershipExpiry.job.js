const cron = require("node-cron");
const { prisma } = require("../config/database");
const { sendMembershipExpiryWarning } = require("../services/email.service");

/**
 * Run daily at 9am: warn members whose membership expires in 7 days
 */
const membershipExpiryJob = cron.schedule(
  "0 9 * * *",
  async () => {
    console.log("⏰ Running membership expiry check...");

    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + 7);

    const expiringSoon = await prisma.membership.findMany({
      where: {
        status: "ACTIVE",
        expiryDate: {
          gte: new Date(),
          lte: warningDate,
        },
      },
      include: {
        member: { include: { user: true } },
      },
    });

    for (const m of expiringSoon) {
      try {
        await sendMembershipExpiryWarning(m.member.user.email, {
          name: `${m.member.firstName} ${m.member.lastName}`,
          expiryDate: m.expiryDate,
          renewUrl: `${process.env.CLIENT_URL}/membership/renew`,
        });
      } catch (err) {
        console.error(
          `Failed to send expiry warning to ${m.member.user.email}:`,
          err.message,
        );
      }
    }

    console.log(`✅ Sent ${expiringSoon.length} expiry warnings`);
  },
  { scheduled: false },
);

/**
 * Run daily at midnight: mark expired memberships
 */
const membershipExpireJob = cron.schedule(
  "0 0 * * *",
  async () => {
    console.log("⏰ Expiring overdue memberships...");

    const result = await prisma.membership.updateMany({
      where: {
        status: "ACTIVE",
        expiryDate: { lt: new Date() },
      },
      data: { status: "EXPIRED" },
    });

    console.log(`✅ Expired ${result.count} memberships`);
  },
  { scheduled: false },
);

const startJobs = () => {
  membershipExpiryJob.start();
  membershipExpireJob.start();
  console.log("✅ Cron jobs started");
};

module.exports = { startJobs };
