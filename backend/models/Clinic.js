import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: String,
    city: String,
    country: String,
    phone: String,
    email: String,
    billingEmail: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Clinic = mongoose.models.Clinic || mongoose.model("Clinic", clinicSchema);
