import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  slug:        { type: String, required: true, unique: true, index: true },
  name:        { type: String, required: true },
  description: { type: String, default: "" },
  longDesc:    { type: String, default: "" },
  price:       { type: String, default: "" },
  turnaround:  { type: String, default: "" },
  icon:        { type: String, default: "" },
  image:       { type: String, default: "" },
  features:    [String],
  order:       { type: Number, default: 0 },
  active:      { type: Boolean, default: true },
}, { timestamps: true });

export const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);
