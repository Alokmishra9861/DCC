const mongoose = require("mongoose");

const travelSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    destination: { type: String, required: true },
    type: {
      type: String,
      enum: ["hotel", "flight", "car-rental", "activity", "package"],
      required: true,
    },
    originalPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    discountPercentage: { type: Number },
    image: { type: String },
    images: [String],
    partner: { type: String },
    partnerLogo: { type: String },
    bookingUrl: { type: String },
    validFrom: { type: Date, default: Date.now },
    validTo: { type: Date },
    tags: [String],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Auto-calculate discount percentage on save
travelSchema.pre("save", function (next) {
  if (this.originalPrice && this.discountedPrice) {
    this.discountPercentage = Math.round(
      ((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100,
    );
  }
  next();
});

module.exports = mongoose.model("Travel", travelSchema);
