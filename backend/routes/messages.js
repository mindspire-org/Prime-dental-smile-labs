import express from "express";
import { Case, Message } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";
import { logActivity } from "../services/activity.js";
import { sendNewMessageEmail } from "../services/email.js";
import { notifyUser, broadcastToAdmins } from "../services/realtime.js";

export const messagesRouter = express.Router();

messagesRouter.use(requireAuth);

// ── General (admin direct) thread ──────────────────────────
messagesRouter.get("/general", async (req, res) => {
  try {
    const filter = req.user.role === "dentist"
      ? { case: null, $or: [{ sender: req.user._id }, { recipientDentist: req.user._id }] }
      : { case: null };
    const messages = await Message.find(filter).populate("sender", "name role").sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

messagesRouter.post("/general", async (req, res) => {
  try {
    if (!req.body.body?.trim() && !req.body.attachment) return res.status(400).json({ error: "Message or attachment is required" });
    const isAdmin = req.user.role !== "dentist";
    const recipientDentist = isAdmin ? (req.body.recipientDentist || null) : req.user._id;
    const msg = await Message.create({
      case: null,
      sender: req.user._id,
      body: req.body.body?.trim() || "",
      attachment: req.body.attachment || null,
      attachmentName: req.body.attachmentName || null,
      recipientDentist,
      readBy: [req.user._id],
    });
    const populated = await msg.populate("sender", "name role");
    if (!isAdmin) {
      broadcastToAdmins({ type: "general:new_message", message: populated, dentistId: req.user._id, dentistName: req.user.name });
    } else if (recipientDentist) {
      notifyUser(recipientDentist, { type: "general:new_message", message: populated });
    }
    res.status(201).json({ message: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function findAccessibleCase(id, user) {
  const filter = user.role === "dentist" ? { _id: id, dentist: user._id } : { _id: id };
  return Case.findOne(filter).populate("dentist", "name email");
}

messagesRouter.get("/case/:caseId", async (req, res) => {
  const dentalCase = await findAccessibleCase(req.params.caseId, req.user);
  if (!dentalCase) return res.status(404).json({ error: "Case not found" });

  const messages = await Message.find({ case: dentalCase._id }).populate("sender", "name role").sort({ createdAt: 1 });
  res.json({ messages });
});

messagesRouter.post("/case/:caseId", async (req, res) => {
  const dentalCase = await findAccessibleCase(req.params.caseId, req.user);
  if (!dentalCase) return res.status(404).json({ error: "Case not found" });
  if (!req.body.body?.trim() && !req.body.attachment) return res.status(400).json({ error: "Message or attachment is required" });

  const message = await Message.create({
    case: dentalCase._id,
    sender: req.user._id,
    body: req.body.body?.trim() || "",
    attachment: req.body.attachment || null,
    attachmentName: req.body.attachmentName || null,
    readBy: [req.user._id],
  });
  const populated = await message.populate("sender", "name role");
  await logActivity({ actor: req.user._id, action: "message.created", entityType: "Message", entityId: message._id, metadata: { case: dentalCase._id } });

  if (req.user.role === "dentist") {
    // Notify all online admins/lab_staff of a new dentist message
    broadcastToAdmins({ type: "case:new_message", caseId: dentalCase._id, message: populated, dentistId: dentalCase.dentist?._id });
  } else {
    // Notify the dentist that admin/lab replied
    if (dentalCase.dentist?._id) {
      notifyUser(dentalCase.dentist._id, { type: "case:new_message", caseId: dentalCase._id, message: populated });
      try {
        await sendNewMessageEmail({ to: dentalCase.dentist.email, name: dentalCase.dentist.name, caseNumber: dentalCase.caseNumber, senderName: req.user.name });
      } catch (emailErr) {
        console.error("[email] Failed to send new message email:", emailErr.message);
      }
    }
  }
  res.status(201).json({ message: populated });
});
