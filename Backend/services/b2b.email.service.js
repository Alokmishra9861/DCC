// Backend/services/b2b.email.service.js
// Transactional emails for B2B partner approval/rejection flow
// Sent by admin when approving or rejecting B2B applications

const nodemailer = require("nodemailer");

let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP config incomplete — missing: " +
        [!host && "SMTP_HOST", !user && "SMTP_USER", !pass && "SMTP_PASS"]
          .filter(Boolean)
          .join(", "),
    );
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
      console.error("❌ SMTP verify failed:", err.message);
      _transporter = null;
    } else {
      console.log("✅ SMTP ready for B2B emails:", user);
    }
  });

  return _transporter;
};

const FROM = `"Discount Club Cayman" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://discountclubcayman.com";

// ── Shared email styles ────────────────────────────────────────────────────────
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
</html>
`;

// ── B2B APPROVAL email ─────────────────────────────────────────────────────────
exports.sendB2BApprovalEmail = async ({ b2bEmail, companyName }) => {
  const html = layout(
    "🎉 B2B Partnership Approved!",
    `
    <h2 style="${H2_STYLE}">Congratulations, ${companyName}!</h2>
    <p style="${P_STYLE}">
      Your B2B Partner application has been reviewed and <span style="${BADGE_OK}">APPROVED</span> by our team.
    </p>
    <p style="${P_STYLE}">
      Your business is now live in the <strong>B2B Partner Directory</strong> visible to all DCC members, employers, and associations.
    </p>
    <p style="${P_STYLE}" style="font-weight: 600; color: #1e293b;">You can now:</p>
    <ul style="margin: 0 0 20px; padding-left: 20px; color: #475569; font-size: 15px; line-height: 2;">
      <li>View your profile in the B2B Directory</li>
      <li>Receive and manage member enquiries</li>
      <li>Track profile views and engagement analytics</li>
      <li>Update your services and business information</li>
    </ul>
    <div style="text-align: center;">
      <a href="${FRONTEND_URL}/b2b-dashboard" style="${BTN_STYLE}">Go to B2B Dashboard</a>
    </div>
    <div style="${INFO_BOX}">
      <strong>💡 Tip:</strong> Complete your profile fully to maximize visibility. Include high-quality logo, detailed services description, and contact information.
    </div>
    <p style="${P_STYLE}">
      If you have any questions or need support, contact us at
      <a href="mailto:support@discountclubcayman.com" style="color: #1C4D8D; font-weight: 600;">
        support@discountclubcayman.com
      </a>
    </p>
    `,
  );

  return getTransporter().sendMail({
    from: FROM,
    to: b2bEmail,
    subject: "✅ Your B2B Partnership is Approved — Go Live Now!",
    html,
  });
};

// ── B2B REJECTION email ────────────────────────────────────────────────────────
exports.sendB2BRejectionEmail = async ({ b2bEmail, companyName, reason }) => {
  const html = layout(
    "B2B Application Status",
    `
    <h2 style="${H2_STYLE}">Thank you for your interest, ${companyName}</h2>
    <p style="${P_STYLE}">
      We have reviewed your B2B Partner application and <span style="${BADGE_ERR}">UNFORTUNATELY, IT WAS NOT APPROVED</span> at this time.
    </p>
    ${
      reason
        ? `<p style="${P_STYLE}"><strong>Reason for rejection:</strong></p>
           <div style="${INFO_BOX}">${reason}</div>`
        : ""
    }
    <p style="${P_STYLE}">
      We appreciate your interest in partnering with Discount Club Cayman. We encourage you to review any feedback provided above and reapply in the future with updated information.
    </p>
    <p style="${P_STYLE}">
      If you have questions about the rejection or would like to discuss options, please contact our B2B team:
      <a href="mailto:b2b@discountclubcayman.com" style="color: #1C4D8D; font-weight: 600;">
        b2b@discountclubcayman.com
      </a>
    </p>
    <p style="${P_STYLE}">
      We'd love to work with you in the future!
    </p>
    `,
  );

  return getTransporter().sendMail({
    from: FROM,
    to: b2bEmail,
    subject: "B2B Application Review Decision",
    html,
  });
};
