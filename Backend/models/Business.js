const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    logo: { type: String },
    images: [{ type: String }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      address: String,
      city: String,
      district: String,
      country: { type: String, default: "Cayman Islands" },
      coordinates: { lat: Number, lng: Number },
    },
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
    },
    discountHighlight: { type: String }, // e.g. "Up to 20% off"
    tags: [String],
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

businessSchema.index({ name: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Business", businessSchema);
