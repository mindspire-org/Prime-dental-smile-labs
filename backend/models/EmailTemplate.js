import mongoose from "mongoose";

const emailTemplateSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true, 
    enum: ["welcome", "case_submitted", "status_changed", "new_message"],
    index: true 
  },
  subject: { type: String, required: true },
  htmlBody: { type: String, required: true },
  variables: [{ type: String }], // Available template variables
  defaultSubject: { type: String, required: true }, // Original default for reset
  defaultHtmlBody: { type: String, required: true }, // Original default for reset
  active: { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

// Static method to get template with fallback to default
emailTemplateSchema.statics.getTemplate = async function(key) {
  const template = await this.findOne({ key, active: true });
  if (template) {
    return {
      subject: template.subject,
      htmlBody: template.htmlBody,
      variables: template.variables
    };
  }
  
  // Return hardcoded defaults if no custom template exists
  const defaults = this.getDefaultTemplate(key);
  return defaults;
};

// Static method to get default templates
emailTemplateSchema.statics.getDefaultTemplate = function(key) {
  const defaults = {
    welcome: {
      subject: "Welcome to Prime Smile Labs",
      htmlBody: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.card{max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
.header{background:linear-gradient(135deg,#0aabbd,#007acc);padding:28px 32px}
.header h1{margin:0;font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.3px}
.header p{margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75)}
.body{padding:28px 32px;color:#334155;font-size:14px;line-height:1.65}
.body p{margin:0 0 16px}
.btn{display:inline-block;padding:12px 24px;background:linear-gradient(90deg,#0aabbd,#007acc);color:#fff!important;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px}
.pill{display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;background:#e0f7fa;color:#007acc}
.footer{padding:16px 32px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center}
</style></head><body>
<div class="card">
  <div class="header"><h1>Prime<span style="color:rgba(255,255,255,0.7)">Smile</span> Labs</h1><p>Your account is ready</p></div>
  <div class="body">
    <p>Hi <strong>{{name}}</strong>,</p>
    <p>Your Prime Smile Labs account has been created. You can now log in using the credentials below.</p>
    <p><strong>Email:</strong> {{email}}<br><strong>Temporary Password:</strong> <code style="background:#f1f5f9;padding:2px 8px;border-radius:4px">{{temporaryPassword}}</code></p>
    <p>Please change your password after first login.</p>
    <p><a href="{{loginUrl}}" class="btn">Log In Now</a></p>
  </div>
  <div class="footer">© {{year}} Prime Smile Dental Laboratory · Developed by <a href="https://mindspire.org" style="color:#0aabbd">Mindspire</a></div>
</div></body></html>`,
      variables: ["name", "email", "temporaryPassword", "loginUrl", "year"]
    },
    case_submitted: {
      subject: "Case submitted: {{caseNumber}}",
      htmlBody: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.card{max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
.header{background:linear-gradient(135deg,#0aabbd,#007acc);padding:28px 32px}
.header h1{margin:0;font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.3px}
.header p{margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75)}
.body{padding:28px 32px;color:#334155;font-size:14px;line-height:1.65}
.body p{margin:0 0 16px}
.btn{display:inline-block;padding:12px 24px;background:linear-gradient(90deg,#0aabbd,#007acc);color:#fff!important;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px}
.pill{display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;background:#e0f7fa;color:#007acc}
.footer{padding:16px 32px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center}
</style></head><body>
<div class="card">
  <div class="header"><h1>Prime<span style="color:rgba(255,255,255,0.7)">Smile</span> Labs</h1><p>Case Submitted Successfully</p></div>
  <div class="body">
    <p>Hi <strong>{{name}}</strong>,</p>
    <p>Your case has been submitted and received by our lab team.</p>
    <p><span class="pill">{{caseNumber}}</span></p>
    <p>We'll notify you as soon as its status changes. You can track it at any time in your portal.</p>
    <p><a href="{{portalUrl}}" class="btn">View My Cases</a></p>
  </div>
  <div class="footer">© {{year}} Prime Smile Dental Laboratory · Developed by <a href="https://mindspire.org" style="color:#0aabbd">Mindspire</a></div>
</div></body></html>`,
      variables: ["name", "caseNumber", "portalUrl", "year"]
    },
    status_changed: {
      subject: "Case {{caseNumber}} — status updated to {{status}}",
      htmlBody: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.card{max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
.header{background:linear-gradient(135deg,#0aabbd,#007acc);padding:28px 32px}
.header h1{margin:0;font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.3px}
.header p{margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75)}
.body{padding:28px 32px;color:#334155;font-size:14px;line-height:1.65}
.body p{margin:0 0 16px}
.btn{display:inline-block;padding:12px 24px;background:linear-gradient(90deg,#0aabbd,#007acc);color:#fff!important;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px}
.pill{display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;background:#e0f7fa;color:#007acc}
.footer{padding:16px 32px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center}
</style></head><body>
<div class="card">
  <div class="header"><h1>Prime<span style="color:rgba(255,255,255,0.7)">Smile</span> Labs</h1><p>Case Status Updated</p></div>
  <div class="body">
    <p>Hi <strong>{{name}}</strong>,</p>
    <p>Your case <span class="pill">{{caseNumber}}</span> has been updated.</p>
    <p><strong>New status:</strong> {{status}}</p>
    {{#if note}}<p><strong>Lab note:</strong> {{note}}</p>{{/if}}
    <p><a href="{{portalUrl}}" class="btn">View Case</a></p>
  </div>
  <div class="footer">© {{year}} Prime Smile Dental Laboratory · Developed by <a href="https://mindspire.org" style="color:#0aabbd">Mindspire</a></div>
</div></body></html>`,
      variables: ["name", "caseNumber", "status", "note", "portalUrl", "year"]
    },
    new_message: {
      subject: "New message on case {{caseNumber}}",
      htmlBody: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.card{max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
.header{background:linear-gradient(135deg,#0aabbd,#007acc);padding:28px 32px}
.header h1{margin:0;font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.3px}
.header p{margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75)}
.body{padding:28px 32px;color:#334155;font-size:14px;line-height:1.65}
.body p{margin:0 0 16px}
.btn{display:inline-block;padding:12px 24px;background:linear-gradient(90deg,#0aabbd,#007acc);color:#fff!important;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px}
.pill{display:inline-block;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:600;background:#e0f7fa;color:#007acc}
.footer{padding:16px 32px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center}
</style></head><body>
<div class="card">
  <div class="header"><h1>Prime<span style="color:rgba(255,255,255,0.7)">Smile</span> Labs</h1><p>New Message Received</p></div>
  <div class="body">
    <p>Hi <strong>{{name}}</strong>,</p>
    <p><strong>{{senderName}}</strong> has sent a message regarding case <span class="pill">{{caseNumber}}</span>.</p>
    <p><a href="{{portalUrl}}" class="btn">View & Reply</a></p>
  </div>
  <div class="footer">© {{year}} Prime Smile Dental Laboratory · Developed by <a href="https://mindspire.org" style="color:#0aabbd">Mindspire</a></div>
</div></body></html>`,
      variables: ["name", "caseNumber", "senderName", "portalUrl", "year"]
    }
  };
  
  return defaults[key] || null;
};

// Method to replace template variables
emailTemplateSchema.methods.replaceVariables = function(htmlBody, variables) {
  let result = htmlBody;
  
  // Replace {{variable}} patterns
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  });
  
  // Handle conditional blocks {{#if variable}}...{{/if}}
  result = result.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, varName, content) => {
    return variables[varName] ? content : '';
  });
  
  return result;
};

export const EmailTemplate = mongoose.models.EmailTemplate || mongoose.model("EmailTemplate", emailTemplateSchema);
