import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  filename:     { type: String, required: true },
  originalName: { type: String, required: true },
  url:          { type: String, required: true },
  mimeType:     { type: String, required: true },
  size:         { type: Number, required: true },
  width:        Number,
  height:       Number,
  alt:          { type: String, default: "" },
  uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const Media = mongoose.models.Media || mongoose.model("Media", mediaSchema);
