const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.zoho.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Transporter verification on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Zoho SMTP Connection Error:", error.message);
  } else {
    console.log("✅ Zoho SMTP is ready to send emails");
  }
});

module.exports = transporter;
