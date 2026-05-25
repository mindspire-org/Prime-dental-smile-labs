import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch, clearSession } from "@/lib/api";
import { 
  Mail, Settings, Eye, RefreshCw, Save, CheckCircle2, Code, 
  Globe, Send, AlertCircle, Info, X, ExternalLink
} from "lucide-react";

export const Route = createFileRoute("/admin/email-templates")({ component: AdminEmailTemplates });

type EmailTemplate = {
  key: string;
  label: string;
  subject: string;
  htmlBody: string;
  variables: string[];
  defaultSubject: string;
  defaultHtmlBody: string;
  isCustomized: boolean;
  active: boolean;
  updatedAt?: string;
};

type TemplatePreview = {
  subject: string;
  htmlBody: string;
};

function AdminEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [preview, setPreview] = useState<TemplatePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showVariables, setShowVariables] = useState(false);

  async function loadTemplates() {
    setLoading(true);
    try {
      const r = await apiFetch<{ templates: EmailTemplate[] }>("/api/admin/email-templates");
      setTemplates(r.templates);
    } catch (error: any) {
      console.error("Failed to load email templates:", error);
      if (error.message.includes("Authentication") || error.message.includes("Unauthorized")) {
        clearSession();
        redirect({ to: "/login" });
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  async function saveTemplate() {
    if (!editingTemplate) return;
    
    setSaving(true);
    try {
      await apiFetch(`/api/admin/email-templates/${editingTemplate.key}`, {
        method: "PUT",
        body: JSON.stringify({
          subject: editingTemplate.subject,
          htmlBody: editingTemplate.htmlBody,
          active: editingTemplate.active
        })
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await loadTemplates();
      setEditingTemplate(null);
    } catch (error: any) {
      console.error("Failed to save email template:", error);
      if (error.message.includes("Authentication") || error.message.includes("Unauthorized")) {
        clearSession();
        redirect({ to: "/login" });
      }
    } finally {
      setSaving(false);
    }
  }

  async function resetTemplate(key: string) {
    if (!confirm("Reset this template to default? All customizations will be lost.")) return;
    
    try {
      await apiFetch(`/api/admin/email-templates/${key}/reset`, { method: "POST" });
      await loadTemplates();
      setEditingTemplate(null);
    } catch (error: any) {
      console.error("Failed to reset email template:", error);
      if (error.message.includes("Authentication") || error.message.includes("Unauthorized")) {
        clearSession();
        redirect({ to: "/login" });
      }
    }
  }

  async function generatePreview(key: string) {
    try {
      const r = await apiFetch<TemplatePreview>(`/api/admin/email-templates/${key}/preview`, {
        method: "POST",
        body: JSON.stringify({})
      });
      setPreview(r);
      setShowPreview(true);
    } catch (error: any) {
      console.error("Failed to generate preview:", error);
      if (error.message.includes("Authentication") || error.message.includes("Unauthorized")) {
        clearSession();
        redirect({ to: "/login" });
      }
    }
  }

  const templateIcons: Record<string, any> = {
    welcome: Globe,
    case_submitted: Send,
    status_changed: AlertCircle,
    new_message: Mail
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Email Templates</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Customize transactional emails sent to users
          </p>
        </div>
        <button 
          onClick={() => setShowVariables(!showVariables)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          <Info size={16} />
          {showVariables ? "Hide" : "Show"} Variables Guide
        </button>
      </div>

      {showVariables && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Info size={16} />
            Available Template Variables
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Welcome Email</h4>
              <code className="text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs block mb-1">{"{{name}}"}</code>
              <code className="text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs block mb-1">{"{{email}}"}</code>
              <code className="text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs block mb-1">{"{{temporaryPassword}}"}</code>
              <code className="text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs block">{"{{loginUrl}}"}</code>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Case Emails</h4>
              <code className="text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs block mb-1">{"{{name}}"}</code>
              <code className="text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs block mb-1">{"{{caseNumber}}"}</code>
              <code className="text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs block mb-1">{"{{status}}"}</code>
              <code className="text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs block mb-1">{"{{note}}"}</code>
              <code className="text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs block mb-1">{"{{portalUrl}}"}</code>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Templates</h2>
          {templates.map((template) => {
            const Icon = templateIcons[template.key];
            return (
              <div
                key={template.key}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                  selectedTemplate?.key === template.key
                    ? "border-indigo-400 ring-2 ring-indigo-100"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800">{template.label}</h3>
                      <p className="text-sm text-slate-600 mt-0.5 truncate">{template.subject}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          template.isCustomized 
                            ? "bg-amber-100 text-amber-700" 
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {template.isCustomized ? "Customized" : "Default"}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          template.active 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {template.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generatePreview(template.key);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTemplate(template);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Settings size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Editor or Preview */}
        <div className="space-y-4">
          {editingTemplate ? (
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">Edit: {editingTemplate.label}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => resetTemplate(editingTemplate.key)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <RefreshCw size={14} />
                      Reset
                    </button>
                    <button
                      onClick={() => setEditingTemplate(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      subject: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    HTML Content
                  </label>
                  <textarea
                    value={editingTemplate.htmlBody}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      htmlBody: e.target.value
                    })}
                    rows={12}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTemplate.active}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        active: e.target.checked
                      })}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">Template active</span>
                  </label>
                  
                  <button
                    onClick={saveTemplate}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {saved ? (
                      <>
                        <CheckCircle2 size={16} />
                        Saved!
                      </>
                    ) : saving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save size={16} />
                        Save Template
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : selectedTemplate ? (
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">{selectedTemplate.label}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => generatePreview(selectedTemplate.key)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Eye size={14} />
                      Preview
                    </button>
                    <button
                      onClick={() => setEditingTemplate(selectedTemplate)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Settings size={14} />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                    <p className="text-sm text-slate-600">{selectedTemplate.subject}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedTemplate.isCustomized 
                          ? "bg-amber-100 text-amber-700" 
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {selectedTemplate.isCustomized ? "Customized" : "Default"}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedTemplate.active 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {selectedTemplate.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  {selectedTemplate.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last Updated</label>
                      <p className="text-sm text-slate-600">
                        {new Date(selectedTemplate.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <Mail size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">Select a template to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && preview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="border-b border-slate-200 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Email Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newWindow = window.open();
                    if (newWindow) {
                      newWindow.document.write(preview.htmlBody);
                      newWindow.document.close();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <ExternalLink size={14} />
                  Open in New Tab
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <p className="text-sm text-slate-600">{preview.subject}</p>
              </div>
              
              <div className="border border-slate-200 rounded-lg">
                <iframe
                  srcDoc={preview.htmlBody}
                  className="w-full h-96"
                  title="Email Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
