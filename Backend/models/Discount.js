const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    discountType: {
      type: String,
      enum: ["percentage", "fixed", "buy-x-get-y", "free-item"],
      required: true,
    },
    value: { type: Number, required: true }, // percentage or dollar amount
    minimumPurchase: { type: Number, default: 0 },
    validFrom: { type: Date, default: Date.now },
    validTo: { type: Date },
    usageLimit: { type: Number }, // null = unlimited
    usageCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    terms: { type: String },
    image: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Discount", discountSchema);
