import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { Save, Settings, Palette, Mail, Globe, ToggleLeft, Search, CheckCircle2, Image, Upload, Send, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

type Setting = { key: string; value: any; type: string; group: string; label: string };

const GROUP_META: Record<string, { label: string; icon: any; color: string }> = {
  general:    { label: "General",    icon: Globe,       color: "bg-indigo-500" },
  appearance: { label: "Appearance", icon: Palette,     color: "bg-violet-500" },
  contact:    { label: "Contact",    icon: Mail,        color: "bg-teal-500" },
  smtp:       { label: "SMTP Email", icon: Mail,        color: "bg-orange-500" },
  seo:        { label: "SEO",        icon: Search,      color: "bg-pink-500" },
  features:   { label: "Features",   icon: ToggleLeft,  color: "bg-emerald-500" },
};

function ImageUploadField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("files", file);
      const r = await apiFetch<{ items: { url: string }[] }>("/api/admin/media", { method: "POST", body: form });
      if (r.items?.[0]?.url) onChange(r.items[0].url);
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {value ? (
        <div className="relative group shrink-0">
          <img src={value} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
          <button onClick={() => onChange("")} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 size={9} />
          </button>
        </div>
      ) : (
        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 shrink-0">
          <Image size={18} />
        </div>
      )}
      <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
        <input type="text" value={value || ""} onChange={e => onChange(e.target.value)} placeholder="https://... or upload"
          className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400" />
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1 shrink-0">
          {uploading ? <><Save size={12} className="animate-spin"/> Uploading</> : <><Upload size={12}/> Upload</>}
        </button>
      </div>
    </div>
  );
}

function SettingField({ s, value, onChange }: { s: Setting; value: any; onChange: (v: any) => void }) {
  if (s.type === "boolean") return (
    <button type="button" onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-indigo-500" : "bg-slate-200"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : ""}`}/>
    </button>
  );
  if (s.type === "color") return (
    <div className="flex items-center gap-3">
      <input type="color" value={value || "#000000"} onChange={e => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"/>
      <input type="text" value={value || ""} onChange={e => onChange(e.target.value)}
        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-indigo-400"/>
    </div>
  );
  if (s.type === "textarea") return (
    <textarea value={value || ""} onChange={e => onChange(e.target.value)} rows={3}
      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 resize-none"/>
  );
  if (s.type === "url" && (s.key === "site.logo" || s.key === "site.favicon")) return (
    <ImageUploadField value={value || ""} onChange={onChange} />
  );
  return (
    <input type={s.type === "number" ? "number" : s.type === "email" ? "email" : s.type === "url" ? "url" : "text"}
      value={value ?? ""} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"/>
  );
}

function AdminSettings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [values,   setValues]   = useState<Record<string, any>>({});
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [activeGroup, setActiveGroup] = useState("general");
  const [testEmailStatus, setTestEmailStatus] = useState<string>("");

  useEffect(() => {
    apiFetch<{ settings: Setting[] }>("/api/admin/settings").then(r => {
      setSettings(r.settings);
      setValues(Object.fromEntries(r.settings.map(s => [s.key, s.value])));
    }).catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    try {
      const payload = settings.map(s => ({ ...s, value: values[s.key] }));
      await apiFetch("/api/admin/settings", { method: "PUT", body: JSON.stringify({ settings: payload }) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  }

  async function sendTestEmail() {
    setTestEmailStatus("Sending…");
    try {
      const r = await apiFetch<{ ok: boolean; message: string }>("/api/admin/settings/test-email", { method: "POST" });
      setTestEmailStatus(r.message || "Test email sent!");
    } catch (err: any) {
      setTestEmailStatus(err.message || "Failed to send test email");
    }
    setTimeout(() => setTestEmailStatus(""), 5000);
  }

  const groups = [...new Set(settings.map(s => s.group))].filter(g => GROUP_META[g]);
  const groupSettings = settings.filter(s => s.group === activeGroup);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-sm text-slate-400 mt-0.5">Configure your site, email, appearance and features</p>
        </div>
        <button onClick={save} disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 w-full sm:w-auto"
          style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
          {saved ? <><CheckCircle2 size={15}/> Saved!</> : saving ? <><Save size={15} className="animate-spin"/> Saving…</> : <><Save size={15}/> Save All</>}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Group tabs — horizontal scroll on mobile, vertical sidebar on desktop */}
        <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0 lg:w-48 shrink-0 -mx-1 px-1 lg:mx-0 lg:px-0 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {groups.map(g => {
            const m = GROUP_META[g];
            return (
              <button key={g} onClick={() => setActiveGroup(g)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap shrink-0
                  ${activeGroup === g ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}>
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${activeGroup === g ? m.color : "bg-slate-100"}`}>
                  <m.icon size={12} className={activeGroup === g ? "text-white" : "text-slate-400"}/>
                </span>
                {m.label}
              </button>
            );
          })}
        </nav>

        {/* Fields */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 min-w-0">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            {GROUP_META[activeGroup] && (
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${GROUP_META[activeGroup].color}`}>
                {(() => { const Icon = GROUP_META[activeGroup].icon; return <Icon size={15} className="text-white"/>; })()}
              </span>
            )}
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">{GROUP_META[activeGroup]?.label ?? activeGroup}</h2>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {groupSettings.map(s => (
              <div key={s.key} className="min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 mb-1.5">
                  <label className="text-sm font-medium text-slate-700 shrink-0">{s.label}</label>
                  {s.type === "boolean" && (
                    <SettingField s={s} value={values[s.key]} onChange={v => setValues(p => ({ ...p, [s.key]: v }))}/>
                  )}
                </div>
                {s.type !== "boolean" && (
                  <SettingField s={s} value={values[s.key]} onChange={v => setValues(p => ({ ...p, [s.key]: v }))}/>
                )}
                <p className="text-[11px] text-slate-400 mt-1 font-mono truncate">{s.key}</p>
              </div>
            ))}
            {activeGroup === "smtp" && (
              <div className="pt-2">
                <button onClick={sendTestEmail} disabled={testEmailStatus === "Sending…"}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors disabled:opacity-50 w-full sm:w-auto justify-center sm:justify-start">
                  <Send size={13}/> Send Test Email
                </button>
                {testEmailStatus && (
                  <p className={`text-xs mt-2 ${testEmailStatus.includes("Failed") || testEmailStatus.includes("error") ? "text-red-500" : "text-emerald-600"}`}>
                    {testEmailStatus}
                  </p>
                )}
              </div>
            )}
            {groupSettings.length === 0 && (
              <div className="text-slate-400 text-sm text-center py-12">No settings in this group</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
