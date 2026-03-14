const mongoose = require("mongoose");

// --- Membership Plan (the product/tier) ---
const membershipPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // 'Individual', 'Employer', etc.
    type: {
      type: String,
      enum: ["individual", "employer", "association", "b2b", "business"],
      required: true,
      unique: true,
    },
    price: { type: Number, required: true },
    billingCycle: {
      type: String,
      enum: ["monthly", "annual"],
      default: "annual",
    },
    description: { type: String },
    features: [{ type: String }],
    maxEmployees: { type: Number }, // for employer plans
    maxMembers: { type: Number }, // for association plans
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// --- Membership (user subscription record) ---
const membershipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan",
      default: null, // optional — set when MembershipPlan docs exist
    },
    planType: {
      type: String,
      enum: [
        "individual",
        "family",
        "employer",
        "association",
        "b2b",
        "business",
      ],
    },
    billingCycle: { type: String, enum: ["monthly", "annual"] },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "pending",
    },
    startDate: { type: Date },
    endDate: { type: Date },
    paypalOrderId: { type: String },
    paypalSubscriptionId: { type: String },
    stripePaymentIntentId: { type: String },
    stripeSubscriptionId: { type: String },
    amount: { type: Number },
    autoRenew: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const MembershipPlan = mongoose.model("MembershipPlan", membershipPlanSchema);
const Membership = mongoose.model("Membership", membershipSchema);

module.exports = { MembershipPlan, Membership };
