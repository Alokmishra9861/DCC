const mongoose = require("mongoose");
const crypto = require("crypto");

const certificateSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(6).toString("hex").toUpperCase(),
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    discount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
      required: true,
    },
    qrData: { type: String }, // string encoded in QR code
    status: {
      type: String,
      enum: ["active", "redeemed", "expired"],
      default: "active",
    },
    expiresAt: { type: Date },
    redeemedAt: { type: Date },
    redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // business user who scanned
  },
  { timestamps: true },
);

// Auto-generate QR data before first save
certificateSchema.pre("save", function (next) {
  if (!this.qrData) {
    this.qrData = `DCC-${this.code}-${this._id}`;
  }
  next();
});

module.exports = mongoose.model("Certificate", certificateSchema);
