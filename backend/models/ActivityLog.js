import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true, index: true },
    entityType: String,
    entityId: mongoose.Schema.Types.ObjectId,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model("ActivityLog", activityLogSchema);
