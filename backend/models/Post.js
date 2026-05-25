import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  slug:          { type: String, required: true, unique: true, index: true },
  excerpt:       { type: String, default: "" },
  featuredImage: { type: String, default: "" },
  blocks:        { type: mongoose.Schema.Types.Mixed, default: [] },
  status:        { type: String, enum: ["draft","published","scheduled"], default: "draft", index: true },
  publishedAt:   { type: Date },
  author:        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tags:          [String],
  category:      { type: String, default: "" },
  seo: {
    title: String, description: String,
    ogTitle: String, ogDescription: String, ogImage: String,
  },
}, { timestamps: true });

export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
