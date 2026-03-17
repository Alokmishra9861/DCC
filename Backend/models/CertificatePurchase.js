const mongoose = require("mongoose");

const CertificatePurchaseSchema = new mongoose.Schema({
  certificateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Certificate",
    required: true,
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },

  // Stripe payment details
  stripeSessionId: { type: String, unique: true, sparse: true },
  paymentProvider: { type: String, enum: ["STRIPE", "PAYPAL"], required: true },
  paymentId: { type: String, required: true },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED"],
    default: "PENDING",
  },

  // Certificate details (snapshot at time of purchase)
  type: {
    type: String,
    enum: ["PREPAID_CERTIFICATE", "VALUE_ADDED_CERTIFICATE"],
    required: true,
  },
  faceValue: { type: Number, required: true },
  amountPaid: { type: Number, required: true },
  savingsAmount: { type: Number, default: 0 }, // faceValue - amountPaid
  discountValue: { type: Number },
  minSpend: { type: Number },
  businessName: { type: String, required: true },
  title: { type: String },

  // Unique redemption code (for prepaid certificates only)
  uniqueCode: { type: String, sparse: true, index: true },

  // Certificate lifecycle
  status: {
    type: String,
    enum: ["PURCHASED", "REDEEMED"],
    default: "PURCHASED",
  },
  expiryDate: { type: Date },
  purchasedAt: { type: Date, default: Date.now },
  redeemedAt: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  "CertificatePurchase",
  CertificatePurchaseSchema,
);
