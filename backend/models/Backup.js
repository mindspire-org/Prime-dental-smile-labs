import mongoose from "mongoose";

const backupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["snapshot", "export"], default: "snapshot" },
  data: { type: mongoose.Schema.Types.Mixed },
  size: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const Backup = mongoose.models.Backup || mongoose.model("Backup", backupSchema);
