import express from "express";
import { Setting } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { invalidateSmtpCache, sendEmail } from "../services/email.js";

export const settingsRouter = express.Router();
settingsRouter.use(requireAuth, requireRole("admin", "lab_staff"));

const DEFAULTS = [
  { key:"site.name",         value:"Prime Smile Dental Lab",  type:"text",     group:"general", label:"Site Name" },
  { key:"site.tagline",      value:"Precision Dental Solutions", type:"text",  group:"general", label:"Tagline" },
  { key:"site.logo",         value:"",                         type:"url",      group:"general", label:"Logo URL" },
  { key:"site.favicon",      value:"",                         type:"url",      group:"general", label:"Favicon URL" },
  { key:"site.primaryColor", value:"#0aabbd",                  type:"color",    group:"appearance", label:"Primary Color" },
  { key:"site.accentColor",  value:"#c9a227",                  type:"color",    group:"appearance", label:"Accent Color" },
  { key:"contact.email",     value:"info@primesmile.co.uk",    type:"email",    group:"contact", label:"Contact Email" },
  { key:"contact.phone",     value:"+44 20 0000 0000",         type:"text",     group:"contact", label:"Phone" },
  { key:"contact.address",   value:"London, UK",               type:"textarea", group:"contact", label:"Address" },
  { key:"smtp.host",         value:"smtp.hostinger.com",       type:"text",     group:"smtp", label:"SMTP Host" },
  { key:"smtp.port",         value:"587",                      type:"number",   group:"smtp", label:"SMTP Port" },
  { key:"smtp.secure",       value:false,                      type:"boolean",  group:"smtp", label:"Use TLS/SSL (secure)" },
  { key:"smtp.user",         value:"",                         type:"text",     group:"smtp", label:"SMTP User" },
  { key:"smtp.pass",         value:"",                         type:"text",     group:"smtp", label:"SMTP Password" },
  { key:"smtp.from",         value:"Prime Smile Labs <no-reply@primesmile.co.uk>", type:"email", group:"smtp", label:"From Address" },
  { key:"features.blog",     value:true,                       type:"boolean",  group:"features", label:"Enable Blog" },
  { key:"features.maintenance", value:false,                   type:"boolean",  group:"features", label:"Maintenance Mode" },
  { key:"features.registration", value:true,                   type:"boolean",  group:"features", label:"Allow Self-Registration" },
  { key:"seo.defaultTitle",  value:"Prime Smile Dental Lab",   type:"text",     group:"seo", label:"Default Meta Title" },
  { key:"seo.defaultDesc",   value:"",                         type:"textarea", group:"seo", label:"Default Meta Description" },
  { key:"seo.googleVerify",  value:"",                         type:"text",     group:"seo", label:"Google Verification Code" },
];

settingsRouter.get("/", async (req, res) => {
  const saved = await Setting.find();
  const savedMap = Object.fromEntries(saved.map(s => [s.key, s]));
  const result = DEFAULTS.map(d => savedMap[d.key] ? savedMap[d.key].toObject() : d);
  res.json({ settings: result });
});

settingsRouter.put("/", async (req, res) => {
  const { settings } = req.body;
  if (!Array.isArray(settings)) return res.status(400).json({ error: "settings must be array" });
  const hasSmtp = settings.some(s => s.key?.startsWith("smtp."));
  await Promise.all(settings.map(({ key, value, type, group, label }) =>
    Setting.findOneAndUpdate({ key }, { value, type, group, label }, { upsert: true })
  ));
  if (hasSmtp) invalidateSmtpCache();
  res.json({ ok: true });
});

settingsRouter.post("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: req.user.email,
      subject: "SMTP Test — Prime Smile Labs",
      text: "This is a test email from your Prime Smile Labs admin settings.",
      html: `<p>Hi ${req.user.name || ""},</p><p>This is a test email to confirm your SMTP settings are working correctly.</p><p>— Prime Smile Labs</p>`,
    });
    res.json({ ok: true, message: "Test email sent to " + req.user.email });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to send test email" });
  }
});

settingsRouter.put("/:key", async (req, res) => {
  const setting = await Setting.findOneAndUpdate(
    { key: req.params.key },
    { value: req.body.value },
    { upsert: true, returnDocument: "after" },
  );
  res.json({ setting });
});
