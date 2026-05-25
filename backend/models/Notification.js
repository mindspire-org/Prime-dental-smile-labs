import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  body:       { type: String, required: true },
  type:       { type: String, enum: ["info","warning","success","error"], default: "info" },
  targetRole: { type: String, enum: ["all","dentist","lab_staff","admin"], default: "all" },
  startAt:    { type: Date, default: Date.now },
  endAt:      { type: Date },
  active:     { type: Boolean, default: true },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
