const transporter = require("../config/email");

const FROM = `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`;

// ── Generic send ──────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({ from: FROM, to, subject, html });
};

// ── Templates ─────────────────────────────────────────

const emailTemplates = {
  // 1. Email verification
  verifyEmail: ({ name, verifyUrl }) => ({
    subject: "Verify your Discount Club Cayman email",
    html: `
      <h2>Welcome to Discount Club Cayman, ${name}!</h2>
      <p>Please verify your email address to activate your account.</p>
      <a href="${verifyUrl}" style="background:#1d4ed8;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
        Verify Email
      </a>
      <p>This link expires in 24 hours.</p>
    `,
  }),

  // 1b. Welcome email (no verification)
  welcome: ({ name }) => ({
    subject: "Welcome to Discount Club Cayman",
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Your DCC account is ready. You can proceed to payment and activate your membership.</p>
      <p>We are excited to have you with us.</p>
    `,
  }),

  // 2. Membership confirmation (individual)
  membershipConfirmed: ({ name, expiryDate, membershipCost }) => ({
    subject: "🎉 Your DCC Membership is Active!",
    html: `
      <h2>You're in, ${name}!</h2>
      <p>Your Discount Club Cayman membership is now <strong>active</strong>.</p>
      <ul>
        <li><strong>Membership Cost:</strong> $${membershipCost}</li>
        <li><strong>Valid Until:</strong> ${new Date(expiryDate).toLocaleDateString()}</li>
      </ul>
      <p>Start saving today — log in to explore discounts, certificates, and travel deals.</p>
    `,
  }),

  // 3. Employer welcome
  employerWelcome: ({ companyName, contactName }) => ({
    subject: "Welcome to DCC — Employer Account Under Review",
    html: `
      <h2>Thank you, ${contactName}!</h2>
      <p>Your employer account for <strong>${companyName}</strong> has been received and is under review.</p>
      <p>Our team will approve your account within 1-2 business days. Once approved, you can upload your employee list and activate memberships.</p>
    `,
  }),

  // 4. Employer approved
  employerApproved: ({ companyName, loginUrl }) => ({
    subject: "✅ Your DCC Employer Account is Approved",
    html: `
      <h2>${companyName} — You're Approved!</h2>
      <p>Your employer account has been approved. You can now log in and upload your employee membership list.</p>
      <a href="${loginUrl}" style="background:#1d4ed8;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
        Log In Now
      </a>
    `,
  }),

  // 5. Association welcome
  associationWelcome: ({ associationName, contactName }) => ({
    subject: "Welcome to DCC — Association Account Under Review",
    html: `
      <h2>Thank you, ${contactName}!</h2>
      <p>Your association account for <strong>${associationName}</strong> is under review.</p>
      <p>We'll notify you once your account is approved.</p>
    `,
  }),

  // 6. Certificate purchase confirmation
  certificatePurchased: ({
    name,
    businessName,
    faceValue,
    memberPrice,
    claimCode,
    expiryDate,
  }) => ({
    subject: `Certificate Purchase Confirmed — ${businessName}`,
    html: `
      <h2>Certificate Purchased, ${name}!</h2>
      <p>You purchased a <strong>$${faceValue} certificate</strong> from <strong>${businessName}</strong> for <strong>$${memberPrice}</strong>.</p>
      <p><strong>You saved: $${(faceValue - memberPrice).toFixed(2)}</strong></p>
      <p><strong>Claim Code:</strong> <code style="font-size:18px;background:#f3f4f6;padding:4px 10px;border-radius:4px;">${claimCode}</code></p>
      ${expiryDate ? `<p>Valid until: ${new Date(expiryDate).toLocaleDateString()}</p>` : ""}
    `,
  }),

  // 7. Password reset
  passwordReset: ({ name, resetUrl }) => ({
    subject: "Reset your DCC password",
    html: `
      <h2>Password Reset Request</h2>
      <p>Hi ${name}, we received a request to reset your password.</p>
      <a href="${resetUrl}" style="background:#dc2626;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
        Reset Password
      </a>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `,
  }),

  // 8. Membership expiry warning
  membershipExpiring: ({ name, expiryDate, renewUrl }) => ({
    subject: "⚠️ Your DCC Membership Expires Soon",
    html: `
      <h2>Hi ${name}, your membership expires on ${new Date(expiryDate).toLocaleDateString()}</h2>
      <p>Renew now to keep enjoying exclusive savings, discounts, and travel deals.</p>
      <a href="${renewUrl}" style="background:#1d4ed8;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
        Renew Membership
      </a>
    `,
  }),
};

// ── Exported helpers ──────────────────────────────────

const sendVerificationEmail = async (to, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  const { subject, html } = emailTemplates.verifyEmail({ name, verifyUrl });
  await sendEmail({ to, subject, html });
};

const sendWelcomeEmail = async (to, data) => {
  const { subject, html } = emailTemplates.welcome(data);
  await sendEmail({ to, subject, html });
};

const sendPasswordResetEmail = async (to, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  const { subject, html } = emailTemplates.passwordReset({ name, resetUrl });
  await sendEmail({ to, subject, html });
};

const sendMembershipConfirmationEmail = async (to, data) => {
  const { subject, html } = emailTemplates.membershipConfirmed(data);
  await sendEmail({ to, subject, html });
};

const sendEmployerWelcomeEmail = async (to, data) => {
  const { subject, html } = emailTemplates.employerWelcome(data);
  await sendEmail({ to, subject, html });
};

const sendEmployerApprovedEmail = async (to, data) => {
  const { subject, html } = emailTemplates.employerApproved(data);
  await sendEmail({ to, subject, html });
};

const sendAssociationWelcomeEmail = async (to, data) => {
  const { subject, html } = emailTemplates.associationWelcome(data);
  await sendEmail({ to, subject, html });
};

const sendCertificatePurchaseEmail = async (to, data) => {
  const { subject, html } = emailTemplates.certificatePurchased(data);
  await sendEmail({ to, subject, html });
};

const sendMembershipExpiryWarning = async (to, data) => {
  const { subject, html } = emailTemplates.membershipExpiring(data);
  await sendEmail({ to, subject, html });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendMembershipConfirmationEmail,
  sendEmployerWelcomeEmail,
  sendEmployerApprovedEmail,
  sendAssociationWelcomeEmail,
  sendCertificatePurchaseEmail,
  sendMembershipExpiryWarning,
};
