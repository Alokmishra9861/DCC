const mongoose = require("mongoose");

const contactInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["general", "business", "advertise", "support"],
      default: "general",
    },
    status: {
      type: String,
      enum: ["pending", "read", "responded"],
      default: "pending",
    },
    response: { type: String },
    respondedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ContactInquiry", contactInquirySchema);
