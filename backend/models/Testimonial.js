import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  title:    { type: String, default: "" },
  clinic:   { type: String, default: "" },
  text:     { type: String, required: true },
  rating:   { type: Number, min: 1, max: 5, default: 5 },
  photo:    { type: String, default: "" },
  approved: { type: Boolean, default: false },
  order:    { type: Number, default: 0 },
}, { timestamps: true });

export const Testimonial = mongoose.models.Testimonial || mongoose.model("Testimonial", testimonialSchema);
