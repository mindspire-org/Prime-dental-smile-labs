import mongoose from "mongoose";

const labFileSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: "Case", index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    originalName: { type: String, required: true },
    key: { type: String, required: true },
    mimeType: String,
    size: Number,
    storageProvider: { type: String, enum: ["s3", "r2", "local"], default: "s3" },
  },
  { timestamps: true },
);

export const LabFile = mongoose.models.LabFile || mongoose.model("LabFile", labFileSchema);
