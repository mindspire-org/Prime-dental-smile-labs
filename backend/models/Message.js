import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

export const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
