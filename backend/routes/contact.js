import express from "express";
import { z } from "zod";
import { ContactEnquiry } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateRecaptcha } from "../middleware/security.js";
import { sendEmail } from "../services/email.js";

export const contactRouter = express.Router();

// Contact form validation schema
const contactSchema = z.object({
  clinicName: z.string().min(2, "Clinic name must be at least 2 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// POST /api/contact - Submit contact form (public)
contactRouter.post("/", validateRecaptcha, async (req, res) => {
  try {
    const validatedData = contactSchema.parse(req.body);

    const enquiry = await ContactEnquiry.create({
      ...validatedData,
      source: "website",
      metadata: {
        userAgent: req.get("User-Agent"),
        ip: req.ip,
      },
    });

    await sendEmail({
      to: process.env.CONTACT_EMAIL || "support@primesmilelab.com",
      subject: `New Contact Enquiry from ${validatedData.clinicName}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0aabbd;color:#fff;padding:20px;text-align:center">
          <h1 style="margin:0;font-size:22px">New Contact Enquiry</h1>
        </div>
        <div style="padding:20px;background:#f9f9f9">
          <p><strong>Clinic:</strong> ${validatedData.clinicName}</p>
          <p><strong>Name:</strong> ${validatedData.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${validatedData.email}">${validatedData.email}</a></p>
          <p><strong>Phone:</strong> ${validatedData.phone}</p>
          <hr/>
          <p style="white-space:pre-wrap">${validatedData.message}</p>
        </div>
        <div style="background:#333;color:#fff;padding:12px;text-align:center;font-size:11px">
          Submitted via Prime Smile Lab website. Please respond within 24 hours.
        </div>
      </div>`,
    });

    res.json({
      success: true,
      message: "Your enquiry has been received. We\u2019ll get back to you within 24 hours.",
      id: enquiry._id,
    });
  } catch (error) {
    console.error("Contact form submission error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors.reduce((acc, err) => {
          acc[err.path.join(".")] = err.message;
          return acc;
        }, {}),
      });
    }
    res.status(500).json({ success: false, message: "Failed to submit contact form. Please try again." });
  }
});

// GET /api/contact - List all enquiries (admin/lab_staff only)
contactRouter.get("/", requireAuth, requireRole("admin", "lab_staff"), async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Number(req.query.limit || 50), 100);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [items, total] = await Promise.all([
      ContactEnquiry.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      ContactEnquiry.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Error fetching contact enquiries:", error);
    res.status(500).json({ error: "Failed to fetch enquiries" });
  }
});

// PUT /api/contact/:id/status - Update enquiry status (admin/lab_staff only)
contactRouter.put("/:id/status", requireAuth, requireRole("admin", "lab_staff"), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["new", "read", "replied", "archived"];
    if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });

    const enquiry = await ContactEnquiry.findByIdAndUpdate(
      req.params.id,
      { status, repliedBy: req.user._id, repliedAt: new Date() },
      { new: true },
    );
    if (!enquiry) return res.status(404).json({ error: "Enquiry not found" });
    res.json(enquiry);
  } catch (error) {
    console.error("Error updating enquiry status:", error);
    res.status(500).json({ error: "Failed to update enquiry status" });
  }
});
