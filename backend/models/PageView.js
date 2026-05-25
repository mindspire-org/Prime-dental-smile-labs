import mongoose from "mongoose";

const pageViewSchema = new mongoose.Schema({
  path:      { type: String, required: true, index: true },
  referrer:  { type: String, default: "" },
  sessionId: { type: String, index: true },
  userAgent: String,
  ip:        String,
  country:   String,
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

pageViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // 90 day TTL

export const PageView = mongoose.models.PageView || mongoose.model("PageView", pageViewSchema);
