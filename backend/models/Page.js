import mongoose from "mongoose";

const blockSchema = new mongoose.Schema({
  id:    { type: String, required: true },
  type:  { type: String, required: true },
  order: { type: Number, default: 0 },
  props: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { _id: false });

const pageSchema = new mongoose.Schema({
  slug:      { type: String, required: true, unique: true, index: true },
  title:     { type: String, required: true },
  blocks:    { type: [blockSchema], default: [] },
  published: { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const Page = mongoose.models.Page || mongoose.model("Page", pageSchema);
