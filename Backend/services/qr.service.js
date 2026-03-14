const QRCode = require("qrcode");

/**
 * Generate a QR code data URL for a member
 * The QR payload contains member identity data for business scanning
 */
const generateMemberQR = async (member) => {
  const payload = JSON.stringify({
    memberId: member.id,
    name: `${member.firstName} ${member.lastName}`,
    age: member.age,
    district: member.district,
    sex: member.sex,
    ts: Date.now(), // helps detect stale QRs
  });

  const qrDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "H",
    width: 300,
    margin: 2,
    color: { dark: "#1d4ed8", light: "#ffffff" },
  });

  return qrDataUrl;
};

/**
 * Decode and validate a scanned QR payload
 */
const decodeQR = (rawString) => {
  try {
    const data = JSON.parse(rawString);
    if (!data.memberId) throw new Error("Invalid QR payload");
    return data;
  } catch (err) {
    throw new Error("Invalid or corrupted QR code");
  }
};

module.exports = { generateMemberQR, decodeQR };
