const { prisma } = require("../config/database");
const { sendMembershipConfirmationEmail } = require("./email.service");
const { generateMemberQR } = require("./qr.service");

const MEMBERSHIP_DURATION_DAYS = 365;

/**
 * Activate a membership after successful payment
 */
const activateMembership = async (membershipId, paymentId, paymentProvider) => {
  const startDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + MEMBERSHIP_DURATION_DAYS);

  const membership = await prisma.membership.update({
    where: { id: membershipId },
    data: {
      status: "ACTIVE",
      paymentStatus: "COMPLETED",
      paymentId,
      paymentProvider,
      startDate,
      expiryDate,
    },
    include: {
      member: { include: { user: true } },
      employer: true,
    },
  });

  // Generate QR code for the member
  const qrCode = await generateMemberQR(membership.member);
  await prisma.member.update({
    where: { id: membership.member.id },
    data: { qrCode },
  });

  // Update employer total cost if employer membership
  if (membership.employerId) {
    await prisma.employer.update({
      where: { id: membership.employerId },
      data: { totalMembershipCost: { increment: membership.priceUSD } },
    });
  }

  if (membership.associationId) {
    await prisma.association.update({
      where: { id: membership.associationId },
      data: { totalMembershipCost: { increment: membership.priceUSD } },
    });
  }

  // Send confirmation email
  await sendMembershipConfirmationEmail(membership.member.user.email, {
    name: `${membership.member.firstName} ${membership.member.lastName}`,
    expiryDate: membership.expiryDate,
    membershipCost: membership.priceUSD,
  });

  return membership;
};

/**
 * Bulk create memberships for employer/association employee upload
 */
const bulkCreateMemberships = async (
  members,
  employerId,
  associationId,
  pricePerMember,
) => {
  const results = { created: 0, failed: 0, errors: [] };

  for (const m of members) {
    try {
      // Find or create user
      let user = await prisma.user.findUnique({ where: { email: m.email } });
      if (!user) {
        const bcrypt = require("bcryptjs");
        const tempPassword = Math.random().toString(36).slice(-8);
        const hash = await bcrypt.hash(tempPassword, 12);
        user = await prisma.user.create({
          data: {
            email: m.email,
            password: hash,
            role: "MEMBER",
            member: {
              create: {
                firstName: m.firstName,
                lastName: m.lastName,
                phone: m.phone,
                age: m.age ? parseInt(m.age) : null,
                sex: m.sex,
                district: m.district,
                employerId: employerId || null,
                associationId: associationId || null,
              },
            },
          },
          include: { member: true },
        });
      }

      const member = await prisma.member.findUnique({
        where: { userId: user.id },
      });
      if (!member) {
        results.failed++;
        continue;
      }

      // Create membership record
      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + MEMBERSHIP_DURATION_DAYS);

      await prisma.membership.upsert({
        where: { memberId: member.id },
        update: {
          status: "ACTIVE",
          startDate,
          expiryDate,
          paymentStatus: "COMPLETED",
        },
        create: {
          memberId: member.id,
          type: employerId ? "EMPLOYER" : "ASSOCIATION",
          status: "ACTIVE",
          priceUSD: pricePerMember,
          startDate,
          expiryDate,
          employerId: employerId || null,
          associationId: associationId || null,
          paymentStatus: "COMPLETED",
        },
      });

      results.created++;
    } catch (err) {
      results.failed++;
      results.errors.push({ email: m.email, error: err.message });
    }
  }

  return results;
};

/**
 * Check if a member's membership is currently active
 */
const isMembershipActive = async (memberId) => {
  const membership = await prisma.membership.findUnique({
    where: { memberId },
  });
  if (!membership) return false;
  if (membership.status !== "ACTIVE") return false;
  if (membership.expiryDate && membership.expiryDate < new Date()) return false;
  return true;
};

module.exports = {
  activateMembership,
  bulkCreateMemberships,
  isMembershipActive,
};
