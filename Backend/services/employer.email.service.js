// Backend/services/employer.email.service.js
// All transactional emails for the employer flow:
//   1. Employer approval / rejection (sent by admin)
//   2. Employee invite (sent when employer adds an employee)
//   3. Employee welcome (sent after employee accepts invite & activates account)
//
// Uses nodemailer. Reads SMTP config from env vars.
// Every function is fire-and-forget safe — callers should .catch() independently.

const nodemailer = require("nodemailer");

// ── Transporter ───────────────────────────────────────────────────────────────
let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    const missing = [
      !host && "SMTP_HOST",
      !user && "SMTP_USER",
      !pass && "SMTP_PASS",
    ].filter(Boolean);
    throw new Error("SMTP config incomplete — missing: " + missing.join(", "));
  }

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: process.env.NODE_ENV === "production" },
  });

  _transporter.verify((err) => {
    if (err) {
      console.error("\u274c SMTP verify failed:", err.message);
      console.error(
        "   Gmail: use an App Password, not your regular Gmail password",
      );
      console.error("   Get one at: myaccount.google.com/apppasswords");
      _transporter = null;
    } else {
      console.log("\u2705 SMTP ready:", user);
    }
  });

  return _transporter;
};

const FROM = `"Discount Club Cayman" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://discountclubcayman.com";

// ── Shared styles (inline — email clients strip <style> blocks) ───────────────
const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  background: #f8f9fa;
  margin: 0; padding: 0;
`;
const CARD_STYLE = `
  max-width: 560px; margin: 32px auto; background: #ffffff;
  border-radius: 12px; overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;
const HEADER_STYLE = `
  background: #1C4D8D; padding: 32px 40px; text-align: center;
`;
const BODY_STYLE = `padding: 36px 40px;`;
const FOOTER_STYLE = `
  background: #f1f5f9; padding: 20px 40px;
  text-align: center; font-size: 12px; color: #94a3b8;
`;
const BTN_STYLE = `
  display: inline-block; padding: 14px 32px;
  background: #1C4D8D; color: #ffffff !important;
  text-decoration: none; border-radius: 8px;
  font-weight: 600; font-size: 15px; margin: 24px 0;
`;
const H1_STYLE = `margin: 0; font-size: 22px; color: #ffffff; font-weight: 700;`;
const H2_STYLE = `margin: 0 0 8px; font-size: 20px; color: #1e293b;`;
const P_STYLE = `margin: 0 0 16px; font-size: 15px; color: #475569; line-height: 1.6;`;
const BADGE_OK = `
  display: inline-block; padding: 4px 12px;
  background: #dcfce7; color: #166534;
  border-radius: 999px; font-size: 13px; font-weight: 600;
`;
const BADGE_ERR = `
  display: inline-block; padding: 4px 12px;
  background: #fee2e2; color: #991b1b;
  border-radius: 999px; font-size: 13px; font-weight: 600;
`;
const INFO_BOX = `
  background: #f1f5f9; border-radius: 8px;
  padding: 16px 20px; margin: 20px 0;
  font-size: 14px; color: #334155;
`;

// ── Shared layout wrapper ─────────────────────────────────────────────────────
const layout = (headerText, bodyHtml) => `
<!DOCTYPE html>
<html>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    <div style="${HEADER_STYLE}">
      <h1 style="${H1_STYLE}">Discount Club Cayman</h1>
      <p style="margin: 6px 0 0; font-size: 13px; color: #93c5fd;">${headerText}</p>
    </div>
    <div style="${BODY_STYLE}">${bodyHtml}</div>
    <div style="${FOOTER_STYLE}">
      &copy; ${new Date().getFullYear()} Discount Club Cayman &nbsp;·&nbsp;
      <a href="${FRONTEND_URL}" style="color: #64748b;">Visit Website</a>
    </div>
  </div>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
// 1. EMPLOYER APPROVAL EMAIL
//    Sent by admin when they approve an employer account.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {{ employerEmail: string, companyName: string }} opts
 */
exports.sendEmployerApprovalEmail = async ({ employerEmail, companyName }) => {
  const transporter = getTransporter();

  const html = layout(
    "Account Approved",
    `
    <h2 style="${H2_STYLE}">Congratulations, you're approved!</h2>
    <p style="${P_STYLE}">
      Your employer account for <strong>${companyName}</strong> has been reviewed
      and approved by our team. <span style="${BADGE_OK}">Approved</span>
    </p>
    <p style="${P_STYLE}">You can now:</p>
    <ul style="margin: 0 0 20px; padding-left: 20px; color: #475569; font-size: 15px; line-height: 2;">
      <li>Purchase bulk memberships for your employees</li>
      <li>Upload your employee list via CSV or manual entry</li>
      <li>Track your team's savings and ROI from your dashboard</li>
    </ul>
    <div style="text-align: center;">
      <a href="${FRONTEND_URL}/employer-dashboard" style="${BTN_STYLE}">Go to Dashboard</a>
    </div>
    <p style="${P_STYLE}">
      If you have any questions, contact us at
      <a href="mailto:support@discountclubcayman.com" style="color:#1C4D8D;">
        support@discountclubcayman.com
      </a>.
    </p>
  `,
  );

  await transporter.sendMail({
    from: FROM,
    to: employerEmail,
    subject: "Your Employer Account Has Been Approved — Discount Club Cayman",
    html,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. EMPLOYER REJECTION EMAIL
//    Sent by admin when they reject an employer account.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {{ employerEmail: string, companyName: string, reason?: string }} opts
 */
exports.sendEmployerRejectionEmail = async ({
  employerEmail,
  companyName,
  reason,
}) => {
  const transporter = getTransporter();

  const reasonBlock = reason
    ? `<div style="${INFO_BOX}"><strong>Reason:</strong> ${reason}</div>`
    : "";

  const html = layout(
    "Application Update",
    `
    <h2 style="${H2_STYLE}">Application not approved</h2>
    <p style="${P_STYLE}">
      Thank you for applying to list <strong>${companyName}</strong> as an employer
      partner. After review, we were unable to approve your application at this time.
      <span style="${BADGE_ERR}">Not approved</span>
    </p>
    ${reasonBlock}
    <p style="${P_STYLE}">
      If you believe this is a mistake or would like to reapply with updated
      information, please contact us:
    </p>
    <div style="text-align: center;">
      <a href="mailto:support@discountclubcayman.com" style="${BTN_STYLE}">Contact Support</a>
    </div>
  `,
  );

  await transporter.sendMail({
    from: FROM,
    to: employerEmail,
    subject: "Update on Your Employer Application — Discount Club Cayman",
    html,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. EMPLOYEE INVITE EMAIL
//    Sent when employer adds an employee (manual or bulk CSV).
//    Contains the invite link with a one-time token.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {{
 *   employeeName:  string,
 *   employeeEmail: string,
 *   companyName:   string,
 *   inviteToken:   string,
 * }} opts
 */
exports.sendEmployeeInviteEmail = async ({
  employeeName,
  employeeEmail,
  companyName,
  inviteToken,
}) => {
  const transporter = getTransporter();

  const inviteUrl = `${FRONTEND_URL}/accept-invite/${inviteToken}`;
  const firstName = employeeName.split(" ")[0];

  const html = layout(
    `${companyName} has invited you`,
    `
    <h2 style="${H2_STYLE}">Hi ${firstName}, you've been invited!</h2>
    <p style="${P_STYLE}">
      <strong>${companyName}</strong> has purchased a Discount Club Cayman membership
      for you. Create your account to unlock exclusive discounts across hundreds of
      businesses in the Cayman Islands.
    </p>

    <div style="${INFO_BOX}">
      <strong>What you get with your membership:</strong>
      <ul style="margin: 8px 0 0; padding-left: 18px; line-height: 2; color: #334155;">
        <li>Exclusive discounts at 100+ local businesses</li>
        <li>Digital membership card on your phone</li>
        <li>Food, health, retail, travel deals & more</li>
      </ul>
    </div>

    <p style="${P_STYLE}">
      This invite expires in <strong>7 days</strong>. Click the button below
      to set your password and activate your account:
    </p>
    <div style="text-align: center;">
      <a href="${inviteUrl}" style="${BTN_STYLE}">Activate My Account</a>
    </div>
    <p style="font-size: 13px; color: #94a3b8; margin-top: 16px;">
      Or copy this link into your browser:<br/>
      <span style="word-break: break-all; color: #64748b;">${inviteUrl}</span>
    </p>
    <p style="font-size: 13px; color: #94a3b8;">
      If you weren't expecting this email, you can safely ignore it.
    </p>
  `,
  );

  await transporter.sendMail({
    from: FROM,
    to: employeeEmail,
    subject: `${companyName} has activated a Discount Club Cayman membership for you`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. EMPLOYEE WELCOME EMAIL
//    Sent after employee successfully accepts invite and activates account.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {{
 *   employeeName:     string,
 *   employeeEmail:    string,
 *   companyName:      string,
 *   membershipExpiry: Date,
 * }} opts
 */
exports.sendEmployeeWelcomeEmail = async ({
  employeeName,
  employeeEmail,
  companyName,
  membershipExpiry,
}) => {
  const transporter = getTransporter();
  const firstName = employeeName.split(" ")[0];

  const expiryStr = membershipExpiry
    ? new Date(membershipExpiry).toLocaleDateString("en-KY", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "1 year from now";

  const html = layout(
    "Welcome to Discount Club Cayman",
    `
    <h2 style="${H2_STYLE}">Welcome, ${firstName}! 🎉</h2>
    <p style="${P_STYLE}">
      Your Discount Club Cayman membership is now <strong>active</strong>,
      courtesy of <strong>${companyName}</strong>.
      <span style="${BADGE_OK}">Active</span>
    </p>

    <div style="${INFO_BOX}">
      <strong>Your membership details:</strong><br/>
      <span style="font-size: 13px; line-height: 2;">
        Provided by: <strong>${companyName}</strong><br/>
        Valid until: <strong>${expiryStr}</strong><br/>
        Access: All categories &amp; discounts
      </span>
    </div>

    <p style="${P_STYLE}">Here's how to get started:</p>
    <ol style="margin: 0 0 20px; padding-left: 20px; color: #475569; font-size: 15px; line-height: 2.2;">
      <li>Log in to your account at discountclubcayman.com</li>
      <li>Browse deals by category or location</li>
      <li>Show your digital membership card at any partner business</li>
      <li>Enjoy your savings!</li>
    </ol>

    <div style="text-align: center;">
      <a href="${FRONTEND_URL}/login" style="${BTN_STYLE}">Log In & Start Saving</a>
    </div>
    <p style="font-size: 13px; color: #94a3b8; margin-top: 20px;">
      Need help? Email us at
      <a href="mailto:support@discountclubcayman.com" style="color: #64748b;">
        support@discountclubcayman.com
      </a>
    </p>
  `,
  );

  await transporter.sendMail({
    from: FROM,
    to: employeeEmail,
    subject: "Your Discount Club Cayman membership is active!",
    html,
  });
};
