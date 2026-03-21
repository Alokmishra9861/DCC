// Backend/services/association.email.service.js
// Transactional emails for both association types:
//   1. Association approval / rejection (sent by admin)
//   2. Member invite (sent when association adds a member — CSV or manual)
//   3. Member welcome (sent after member activates account)
//   4. Business invite (sent when association invites a new business)

const nodemailer = require("nodemailer");

// ── Singleton transporter ─────────────────────────────────────────────────────
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
    throw new Error(`SMTP config incomplete — missing: ${missing.join(", ")}`);
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
      _transporter = null;
    } else {
      console.log("\u2705 SMTP ready (association emails):", user);
    }
  });

  return _transporter;
};

const FROM = `"Discount Club Cayman" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://discountclubcayman.com";

// ── Shared HTML layout ────────────────────────────────────────────────────────
const layout = (headerSub, body) => `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#f8f9fa;margin:0;padding:0;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#1C4D8D;padding:32px 40px;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;color:#93c5fd;text-transform:uppercase;letter-spacing:2px;">Discount Club Cayman</p>
      <h1 style="margin:0;font-size:22px;color:#fff;font-weight:700;">${headerSub}</h1>
    </div>
    <div style="padding:36px 40px;">${body}</div>
    <div style="background:#f1f5f9;padding:20px 40px;text-align:center;font-size:12px;color:#94a3b8;">
      &copy; ${new Date().getFullYear()} Discount Club Cayman &nbsp;&middot;&nbsp;
      <a href="${FRONTEND_URL}" style="color:#64748b;">Visit Website</a>
    </div>
  </div>
</body>
</html>`;

const p = (txt) =>
  `<p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">${txt}</p>`;
const btn = (url, label) => `
  <div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;padding:14px 32px;background:#1C4D8D;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">${label}</a>
  </div>`;
const infoBox = (html) =>
  `<div style="background:#f1f5f9;border-radius:8px;padding:16px 20px;margin:20px 0;font-size:14px;color:#334155;">${html}</div>`;
const badge = (color, bg, txt) =>
  `<span style="display:inline-block;padding:3px 12px;background:${bg};color:${color};border-radius:999px;font-size:13px;font-weight:600;">${txt}</span>`;

// ─────────────────────────────────────────────────────────────────────────────
// 1. ASSOCIATION APPROVAL EMAIL (sent by admin)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {{ associationEmail: string, associationName: string, associationType: "MEMBER"|"BUSINESS" }} opts
 */
exports.sendAssociationApprovalEmail = async ({
  associationEmail,
  associationName,
  associationType,
}) => {
  const t = getTransporter();
  const isMem = associationType === "MEMBER";
  const steps = isMem
    ? [
        "Upload members via CSV or generate a join code",
        "Members sign up using your join code or accept invites",
        "Track member savings from your dashboard",
      ]
    : [
        "Add existing businesses by ID or invite new ones",
        "Linked businesses can create B2B offers",
        "Manage your entire business network from one dashboard",
      ];

  const html = layout(
    `${associationName} — Approved!`,
    `
    <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">Congratulations! ${badge("#166534", "#dcfce7", "Approved")}</h2>
    ${p(`Your <strong>${isMem ? "Member" : "Business"} Association</strong> account for <strong>${associationName}</strong> has been approved by our team.`)}
    ${p("You can now:")}
    <ul style="margin:0 0 20px;padding-left:20px;color:#475569;font-size:15px;line-height:2;">
      ${steps.map((s) => `<li>${s}</li>`).join("")}
    </ul>
    ${btn(`${FRONTEND_URL}/association-dashboard`, "Go to Dashboard")}
    ${p(`Questions? <a href="mailto:support@discountclubcayman.com" style="color:#1C4D8D;">Contact support</a>.`)}
  `,
  );

  await t.sendMail({
    from: FROM,
    to: associationEmail,
    subject: `${associationName} — Your Association Account is Approved`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. ASSOCIATION REJECTION EMAIL (sent by admin)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {{ associationEmail: string, associationName: string, reason?: string }} opts
 */
exports.sendAssociationRejectionEmail = async ({
  associationEmail,
  associationName,
  reason,
}) => {
  const t = getTransporter();

  const html = layout(
    "Application Update",
    `
    <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">Application not approved ${badge("#991b1b", "#fee2e2", "Not Approved")}</h2>
    ${p(`Thank you for applying to register <strong>${associationName}</strong>. After review, we were unable to approve your application at this time.`)}
    ${reason ? infoBox(`<strong>Reason:</strong> ${reason}`) : ""}
    ${p("If you believe this is a mistake or would like to reapply with updated information, please contact us:")}
    ${btn("mailto:support@discountclubcayman.com", "Contact Support")}
  `,
  );

  await t.sendMail({
    from: FROM,
    to: associationEmail,
    subject: `Update on Your Association Application — Discount Club Cayman`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. ASSOCIATION MEMBER INVITE EMAIL
//    Sent when association adds a member (manual or bulk CSV).
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {{ memberName: string, memberEmail: string, associationName: string, inviteToken: string }} opts
 */
exports.sendAssociationMemberInviteEmail = async ({
  memberName,
  memberEmail,
  associationName,
  inviteToken,
}) => {
  const t = getTransporter();
  const inviteUrl = `${FRONTEND_URL}/association/accept-invite/${inviteToken}`;
  const firstName = memberName.split(" ")[0];

  const html = layout(
    `You've been invited by ${associationName}`,
    `
    <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">Hi ${firstName}, you're invited!</h2>
    ${p(`<strong>${associationName}</strong> has invited you to join as a member and access exclusive Discount Club Cayman benefits.`)}
    ${infoBox(`
      <strong>Your membership includes:</strong>
      <ul style="margin:8px 0 0;padding-left:18px;line-height:2;color:#334155;">
        <li>Discounts at 200+ local businesses</li>
        <li>Digital membership card</li>
        <li>Travel deals, certificates & more</li>
      </ul>
    `)}
    ${p(`This invite expires in <strong>7 days</strong>. Click below to set your password and activate your account:`)}
    ${btn(inviteUrl, "Activate My Account")}
    <p style="font-size:13px;color:#94a3b8;margin-top:16px;">
      Or copy this link:<br/>
      <span style="word-break:break-all;color:#64748b;">${inviteUrl}</span>
    </p>
    <p style="font-size:13px;color:#94a3b8;">If you weren't expecting this, you can safely ignore it.</p>
  `,
  );

  await t.sendMail({
    from: FROM,
    to: memberEmail,
    subject: `${associationName} has invited you to Discount Club Cayman`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. ASSOCIATION MEMBER WELCOME EMAIL
//    Sent after member successfully activates their account.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {{ memberName: string, memberEmail: string, associationName: string }} opts
 */
exports.sendAssociationMemberWelcomeEmail = async ({
  memberName,
  memberEmail,
  associationName,
}) => {
  const t = getTransporter();
  const firstName = memberName.split(" ")[0];

  const html = layout(
    "Welcome to Discount Club Cayman",
    `
    <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">Welcome, ${firstName}! ${badge("#166534", "#dcfce7", "Active")}</h2>
    ${p(`Your Discount Club Cayman membership is now <strong>active</strong>, courtesy of <strong>${associationName}</strong>.`)}
    ${infoBox(`
      <strong>Getting started:</strong>
      <ol style="margin:8px 0 0;padding-left:18px;line-height:2;color:#334155;">
        <li>Log in at discountclubcayman.com</li>
        <li>Browse deals by category or location</li>
        <li>Show your digital card at any partner business</li>
        <li>Enjoy your savings!</li>
      </ol>
    `)}
    ${btn(`${FRONTEND_URL}/login`, "Log In & Start Saving")}
    ${p(`Need help? <a href="mailto:support@discountclubcayman.com" style="color:#1C4D8D;">support@discountclubcayman.com</a>`)}
  `,
  );

  await t.sendMail({
    from: FROM,
    to: memberEmail,
    subject: "Your Discount Club Cayman membership is active!",
    html,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. ASSOCIATION BUSINESS INVITE EMAIL
//    Sent when a BUSINESS-type association invites a business to register.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {{ businessName: string, businessEmail: string, associationName: string, inviteToken: string }} opts
 */
exports.sendAssociationBusinessInviteEmail = async ({
  businessName,
  businessEmail,
  associationName,
  inviteToken,
}) => {
  const t = getTransporter();
  const inviteUrl = `${FRONTEND_URL}/association/business-invite/${inviteToken}`;

  const html = layout(
    `Join ${associationName} on DCC`,
    `
    <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">Hi ${businessName},</h2>
    ${p(`<strong>${associationName}</strong> has invited <strong>${businessName}</strong> to join the Discount Club Cayman network as a partner business.`)}
    ${infoBox(`
      <strong>What this means for you:</strong>
      <ul style="margin:8px 0 0;padding-left:18px;line-height:2;color:#334155;">
        <li>List your business in the DCC directory</li>
        <li>Create exclusive discounts for DCC members</li>
        <li>Access B2B offers within the association network</li>
        <li>Track redemptions & revenue from your dashboard</li>
      </ul>
    `)}
    ${p(`This invite expires in <strong>14 days</strong>. Click below to register your business:`)}
    ${btn(inviteUrl, "Register Your Business")}
    <p style="font-size:13px;color:#94a3b8;margin-top:16px;">
      Or copy this link:<br/>
      <span style="word-break:break-all;color:#64748b;">${inviteUrl}</span>
    </p>
    <p style="font-size:13px;color:#94a3b8;">If you weren't expecting this, you can safely ignore it.</p>
  `,
  );

  await t.sendMail({
    from: FROM,
    to: businessEmail,
    subject: `${associationName} has invited your business to Discount Club Cayman`,
    html,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. BUSINESS LINK APPROVAL EMAIL (association requests to link existing business)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {{ businessEmail: string, businessName: string, associationName: string, approvalToken: string }} opts
 */
exports.sendBusinessLinkApprovalEmail = async ({
  businessEmail,
  businessName,
  associationName,
  approvalToken,
}) => {
  const t = getTransporter();
  const approvalUrl = `${FRONTEND_URL}/business/approve-link/${approvalToken}`;

  const html = layout(
    `Link with ${associationName}`,
    `
    <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">Hi ${businessName},</h2>
    ${p(`<strong>${associationName}</strong> would like to link your business to their association on the Discount Club Cayman network.`)}
    ${infoBox(`
      <strong>What this means for you:</strong>
      <ul style="margin:8px 0 0;padding-left:18px;line-height:2;color:#334155;">
        <li>Your business will be featured in the association's directory</li>
        <li>Collaborate with association members</li>
        <li>Access B2B partnership opportunities</li>
        <li>Maintain your own business profile and settings</li>
      </ul>
    `)}
    ${p(`This approval request expires in <strong>14 days</strong>. Click below to approve the link:`)}
    ${btn(approvalUrl, "Approve Link")}
    <p style="font-size:13px;color:#94a3b8;margin-top:16px;">
      Or copy this link:<br/>
      <span style="word-break:break-all;color:#64748b;">${approvalUrl}</span>
    </p>
    <p style="font-size:13px;color:#94a3b8;">If you weren't expecting this, you can safely decline the request on the link above.</p>
  `,
  );

  await t.sendMail({
    from: FROM,
    to: businessEmail,
    subject: `${associationName} wants to link with your business`,
    html,
  });
};
