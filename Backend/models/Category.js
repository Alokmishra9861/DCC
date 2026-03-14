const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    icon: { type: String }, // icon name or emoji
    image: { type: String }, // banner image URL
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // display order
  },
  { timestamps: true },
);

module.exports = mongoose.model("Category", categorySchema);
