import express from "express";
import { EmailTemplate } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { logActivity } from "../services/activity.js";

export const emailTemplatesRouter = express.Router();
emailTemplatesRouter.use(requireAuth, requireRole("admin"));

// Get all email templates
emailTemplatesRouter.get("/", async (req, res) => {
  try {
    const templates = await EmailTemplate.find().sort({ key: 1 });
    
    // Get default templates for comparison
    const templateKeys = ["welcome", "case_submitted", "status_changed", "new_message"];
    const result = templateKeys.map(key => {
      const custom = templates.find(t => t.key === key);
      const defaultTemplate = EmailTemplate.getDefaultTemplate(key);
      
      return {
        key,
        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        subject: custom?.subject || defaultTemplate.subject,
        htmlBody: custom?.htmlBody || defaultTemplate.htmlBody,
        variables: defaultTemplate.variables,
        defaultSubject: defaultTemplate.subject,
        defaultHtmlBody: defaultTemplate.htmlBody,
        isCustomized: !!custom,
        active: custom?.active !== false,
        updatedAt: custom?.updatedAt
      };
    });
    
    res.json({ templates: result });
  } catch (error) {
    console.error("Error fetching email templates:", error);
    res.status(500).json({ error: "Failed to fetch email templates" });
  }
});

// Get specific email template
emailTemplatesRouter.get("/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const validKeys = ["welcome", "case_submitted", "status_changed", "new_message"];
    
    if (!validKeys.includes(key)) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    const template = await EmailTemplate.findOne({ key });
    const defaultTemplate = EmailTemplate.getDefaultTemplate(key);
    
    const result = {
      key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      subject: template?.subject || defaultTemplate.subject,
      htmlBody: template?.htmlBody || defaultTemplate.htmlBody,
      variables: defaultTemplate.variables,
      defaultSubject: defaultTemplate.subject,
      defaultHtmlBody: defaultTemplate.htmlBody,
      isCustomized: !!template,
      active: template?.active !== false,
      updatedAt: template?.updatedAt
    };
    
    res.json(result);
  } catch (error) {
    console.error("Error fetching email template:", error);
    res.status(500).json({ error: "Failed to fetch email template" });
  }
});

// Update email template
emailTemplatesRouter.put("/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { subject, htmlBody, active } = req.body;
    
    const validKeys = ["welcome", "case_submitted", "status_changed", "new_message"];
    if (!validKeys.includes(key)) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    if (!subject || !htmlBody) {
      return res.status(400).json({ error: "Subject and HTML body are required" });
    }
    
    // Basic HTML validation to prevent XSS
    const sanitizedHtml = htmlBody
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
    
    const defaultTemplate = EmailTemplate.getDefaultTemplate(key);
    
    const template = await EmailTemplate.findOneAndUpdate(
      { key },
      { 
        subject, 
        htmlBody: sanitizedHtml, 
        active: active !== false,
        updatedBy: req.user._id,
        variables: defaultTemplate.variables,
        defaultSubject: defaultTemplate.subject,
        defaultHtmlBody: defaultTemplate.htmlBody
      },
      { upsert: true, new: true, returnDocument: "after" }
    );
    
    await logActivity({ 
      actor: req.user._id, 
      action: "email_template.updated", 
      entityType: "EmailTemplate", 
      entityId: template._id, 
      metadata: { key, subject } 
    });
    
    res.json({ 
      message: "Email template updated successfully",
      template: {
        key: template.key,
        subject: template.subject,
        htmlBody: template.htmlBody,
        active: template.active,
        updatedAt: template.updatedAt
      }
    });
  } catch (error) {
    console.error("Error updating email template:", error);
    res.status(500).json({ error: "Failed to update email template" });
  }
});

// Reset template to default
emailTemplatesRouter.post("/:key/reset", async (req, res) => {
  try {
    const { key } = req.params;
    const validKeys = ["welcome", "case_submitted", "status_changed", "new_message"];
    
    if (!validKeys.includes(key)) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    const defaultTemplate = EmailTemplate.getDefaultTemplate(key);
    if (!defaultTemplate) {
      return res.status(404).json({ error: "Default template not found" });
    }
    
    const template = await EmailTemplate.findOneAndUpdate(
      { key },
      { 
        subject: defaultTemplate.subject,
        htmlBody: defaultTemplate.htmlBody,
        active: true,
        updatedBy: req.user._id
      },
      { upsert: true, new: true, returnDocument: "after" }
    );
    
    await logActivity({ 
      actor: req.user._id, 
      action: "email_template.reset", 
      entityType: "EmailTemplate", 
      entityId: template._id, 
      metadata: { key } 
    });
    
    res.json({ 
      message: "Email template reset to default successfully",
      template: {
        key: template.key,
        subject: template.subject,
        htmlBody: template.htmlBody,
        active: template.active,
        updatedAt: template.updatedAt
      }
    });
  } catch (error) {
    console.error("Error resetting email template:", error);
    res.status(500).json({ error: "Failed to reset email template" });
  }
});

// Generate preview with sample data
emailTemplatesRouter.post("/:key/preview", async (req, res) => {
  try {
    const { key } = req.params;
    const { variables } = req.body;
    
    const validKeys = ["welcome", "case_submitted", "status_changed", "new_message"];
    if (!validKeys.includes(key)) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    const template = await EmailTemplate.getTemplate(key);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    // Sample data for preview
    const sampleData = {
      welcome: {
        name: "Dr. John Smith",
        email: "john.smith@example.com",
        temporaryPassword: "TempPass123!",
        loginUrl: "https://primesmilelabs.com/login",
        year: new Date().getFullYear()
      },
      case_submitted: {
        name: "Dr. John Smith",
        caseNumber: "CS-2024-001",
        portalUrl: "https://primesmilelabs.com/portal/cases",
        year: new Date().getFullYear()
      },
      status_changed: {
        name: "Dr. John Smith",
        caseNumber: "CS-2024-001",
        status: "In Production",
        note: "Case is being prepared by our production team",
        portalUrl: "https://primesmilelabs.com/portal/cases",
        year: new Date().getFullYear()
      },
      new_message: {
        name: "Dr. John Smith",
        caseNumber: "CS-2024-001",
        senderName: "Lab Team",
        portalUrl: "https://primesmilelabs.com/portal/cases",
        year: new Date().getFullYear()
      }
    };
    
    const previewData = { ...sampleData[key], ...variables };
    
    // Replace variables in template
    let previewHtml = template.htmlBody;
    Object.entries(previewData).forEach(([varKey, value]) => {
      const regex = new RegExp(`{{${varKey}}}`, 'g');
      previewHtml = previewHtml.replace(regex, value);
    });
    
    // Handle conditionals
    previewHtml = previewHtml.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, varName, content) => {
      return previewData[varName] ? content : '';
    });
    
    res.json({
      subject: template.subject.replace(/\{\{(\w+)\}\}/g, (match, varKey) => previewData[varKey] || match),
      htmlBody: previewHtml
    });
  } catch (error) {
    console.error("Error generating email preview:", error);
    res.status(500).json({ error: "Failed to generate email preview" });
  }
});
