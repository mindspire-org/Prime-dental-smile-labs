import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    case: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: false, default: null, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true },
    recipientDentist: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    attachment: { type: String, default: null },
    attachmentName: { type: String, default: null },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

export const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
