import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    page: { type: String, required: true, index: true },
    section: { type: String, required: true },
    key: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    type: { type: String, enum: ["text", "richtext", "image", "list", "boolean", "number"], default: "text" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

contentSchema.index({ page: 1, section: 1, key: 1 }, { unique: true });

export const Content = mongoose.models.Content || mongoose.model("Content", contentSchema);
