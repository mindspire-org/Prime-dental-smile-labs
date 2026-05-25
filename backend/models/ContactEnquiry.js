import mongoose from "mongoose";

const contactEnquirySchema = new mongoose.Schema(
  {
    clinicName: { type: String, required: true, trim: true },
    name:       { type: String, required: true, trim: true },
    email:      { type: String, required: true, lowercase: true, trim: true },
    phone:      { type: String, required: true, trim: true },
    message:    { type: String, required: true, trim: true },
    status:     { type: String, enum: ["new", "read", "replied", "archived"], default: "new", index: true },
    source:     { type: String, default: "website" },
    metadata: {
      userAgent: String,
      ip:        String,
    },
    repliedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    repliedAt:  Date,
  },
  { timestamps: true },
);

export const ContactEnquiry =
  mongoose.models.ContactEnquiry ||
  mongoose.model("ContactEnquiry", contactEnquirySchema);
