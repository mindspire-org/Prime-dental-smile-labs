import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
  key:   { type: String, required: true, unique: true, index: true },
  value: { type: mongoose.Schema.Types.Mixed },
  type:  { type: String, enum: ["text","email","url","color","boolean","number","textarea","json"], default: "text" },
  group: { type: String, default: "general" },
  label: String,
}, { timestamps: true });

export const Setting = mongoose.models.Setting || mongoose.model("Setting", settingSchema);
