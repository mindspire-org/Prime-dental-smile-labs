import nodemailer from "nodemailer";
import { EmailTemplate } from "../models/index.js";

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

function wrap(title, body) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
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
  <div class="header"><h1>Prime<span style="color:rgba(255,255,255,0.7)">Smile</span> Labs</h1><p>${title}</p></div>
  <div class="body">${body}</div>
  <div class="footer">© ${new Date().getFullYear()} Prime Smile Dental Laboratory · Developed by <a href="https://mindspire.org" style="color:#0aabbd">Mindspire</a></div>
</div></body></html>`;
}

// Helper function to replace template variables
function replaceVariables(template, variables) {
  let result = template;
  
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
}

export async function sendEmail({ to, subject, text, html }) {
  const mailer = getTransporter();
  if (!mailer) { console.log("[email skipped]", { to, subject }); return; }
  await mailer.sendMail({ from: process.env.EMAIL_FROM || "Prime Smile Labs <no-reply@primesmile.co.uk>", to, subject, text, html });
}

export async function sendWelcomeEmail({ to, name, temporaryPassword }) {
  try {
    const template = await EmailTemplate.getTemplate("welcome");
    const variables = {
      name,
      email: to,
      temporaryPassword,
      loginUrl: `${process.env.APP_URL || "https://primesmilelabs.com"}/login`,
      year: new Date().getFullYear()
    };
    
    const subject = replaceVariables(template.subject, variables);
    const htmlBody = replaceVariables(template.htmlBody, variables);
    
    await sendEmail({
      to,
      subject,
      text: `Hi ${name}, your account has been created. Temporary password: ${temporaryPassword}`,
      html: htmlBody,
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Fallback to hardcoded template
    await sendEmail({
      to,
      subject: "Welcome to Prime Smile Labs",
      text: `Hi ${name}, your account has been created. Temporary password: ${temporaryPassword}`,
      html: wrap("Your account is ready", `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your Prime Smile Labs account has been created. You can now log in using the credentials below.</p>
        <p><strong>Email:</strong> ${to}<br><strong>Temporary Password:</strong> <code style="background:#f1f5f9;padding:2px 8px;border-radius:4px">${temporaryPassword}</code></p>
        <p>Please change your password after first login.</p>
        <p><a href="${process.env.APP_URL || "https://primesmilelabs.com"}/login" class="btn">Log In Now</a></p>
      `),
    });
  }
}

export async function sendCaseSubmittedEmail({ to, name, caseNumber }) {
  try {
    const template = await EmailTemplate.getTemplate("case_submitted");
    const variables = {
      name,
      caseNumber,
      portalUrl: `${process.env.APP_URL || "https://primesmilelabs.com"}/portal/cases`,
      year: new Date().getFullYear()
    };
    
    const subject = replaceVariables(template.subject, variables);
    const htmlBody = replaceVariables(template.htmlBody, variables);
    
    await sendEmail({
      to,
      subject,
      text: `Hi ${name}, your case ${caseNumber} has been submitted and is now being reviewed by our team.`,
      html: htmlBody,
    });
  } catch (error) {
    console.error("Error sending case submitted email:", error);
    // Fallback to hardcoded template
    await sendEmail({
      to,
      subject: `Case submitted: ${caseNumber}`,
      text: `Hi ${name}, your case ${caseNumber} has been submitted and is now being reviewed by our team.`,
      html: wrap("Case Submitted Successfully", `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your case has been submitted and received by our lab team.</p>
        <p><span class="pill">${caseNumber}</span></p>
        <p>We'll notify you as soon as its status changes. You can track it at any time in your portal.</p>
        <p><a href="${process.env.APP_URL || "https://primesmilelabs.com"}/portal/cases" class="btn">View My Cases</a></p>
      `),
    });
  }
}

export async function sendStatusChangedEmail({ to, name, caseNumber, status, note }) {
  try {
    const template = await EmailTemplate.getTemplate("status_changed");
    const variables = {
      name,
      caseNumber,
      status,
      note: note || "",
      portalUrl: `${process.env.APP_URL || "https://primesmilelabs.com"}/portal/cases`,
      year: new Date().getFullYear()
    };
    
    const subject = replaceVariables(template.subject, variables);
    const htmlBody = replaceVariables(template.htmlBody, variables);
    
    await sendEmail({
      to,
      subject,
      text: `Hi ${name}, case ${caseNumber} is now: ${status}.${note ? ` Note: ${note}` : ""}`,
      html: htmlBody,
    });
  } catch (error) {
    console.error("Error sending status changed email:", error);
    // Fallback to hardcoded template
    await sendEmail({
      to,
      subject: `Case ${caseNumber} — status updated to ${status}`,
      text: `Hi ${name}, case ${caseNumber} is now: ${status}.${note ? ` Note: ${note}` : ""}`,
      html: wrap(`Case Status Updated`, `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your case <span class="pill">${caseNumber}</span> has been updated.</p>
        <p><strong>New status:</strong> ${status}</p>
        ${note ? `<p><strong>Lab note:</strong> ${note}</p>` : ""}
        <p><a href="${process.env.APP_URL || "https://primesmilelabs.com"}/portal/cases" class="btn">View Case</a></p>
      `),
    });
  }
}

export async function sendNewMessageEmail({ to, name, caseNumber, senderName }) {
  try {
    const template = await EmailTemplate.getTemplate("new_message");
    const variables = {
      name,
      caseNumber,
      senderName,
      portalUrl: `${process.env.APP_URL || "https://primesmilelabs.com"}/portal/cases`,
      year: new Date().getFullYear()
    };
    
    const subject = replaceVariables(template.subject, variables);
    const htmlBody = replaceVariables(template.htmlBody, variables);
    
    await sendEmail({
      to,
      subject,
      text: `${senderName} sent a message on case ${caseNumber}. Log in to reply.`,
      html: htmlBody,
    });
  } catch (error) {
    console.error("Error sending new message email:", error);
    // Fallback to hardcoded template
    await sendEmail({
      to,
      subject: `New message on case ${caseNumber}`,
      text: `${senderName} sent a message on case ${caseNumber}. Log in to reply.`,
      html: wrap("New Message Received", `
        <p>Hi <strong>${name}</strong>,</p>
        <p><strong>${senderName}</strong> has sent a message regarding case <span class="pill">${caseNumber}</span>.</p>
        <p><a href="${process.env.APP_URL || "https://primesmilelabs.com"}/portal/cases" class="btn">View & Reply</a></p>
      `),
    });
  }
}
