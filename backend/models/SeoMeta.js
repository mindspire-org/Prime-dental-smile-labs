import mongoose from "mongoose";

const seoMetaSchema = new mongoose.Schema(
  {
    page: { type: String, required: true, unique: true, index: true },
    title: String,
    description: String,
    keywords: [String],
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    canonicalUrl: String,
    noIndex: { type: Boolean, default: false },
    structuredData: mongoose.Schema.Types.Mixed,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const SeoMeta = mongoose.models.SeoMeta || mongoose.model("SeoMeta", seoMetaSchema);
