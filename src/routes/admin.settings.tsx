import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Save, Settings, Palette, Mail, Globe, ToggleLeft, Search, CheckCircle2 } from "lucide-react";

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

  const groups = [...new Set(settings.map(s => s.group))].filter(g => GROUP_META[g]);
  const groupSettings = settings.filter(s => s.group === activeGroup);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-sm text-slate-400 mt-0.5">Configure your site, email, appearance and features</p>
        </div>
        <button onClick={save} disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
          {saved ? <><CheckCircle2 size={15}/> Saved!</> : saving ? <><Save size={15} className="animate-spin"/> Saving…</> : <><Save size={15}/> Save All</>}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <nav className="w-48 shrink-0 space-y-1">
          {groups.map(g => {
            const m = GROUP_META[g];
            return (
              <button key={g} onClick={() => setActiveGroup(g)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${activeGroup === g ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}>
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${activeGroup === g ? m.color : "bg-slate-100"}`}>
                  <m.icon size={12} className={activeGroup === g ? "text-white" : "text-slate-400"}/>
                </span>
                {m.label}
              </button>
            );
          })}
        </nav>

        {/* Fields */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            {GROUP_META[activeGroup] && (
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${GROUP_META[activeGroup].color}`}>
                {(() => { const Icon = GROUP_META[activeGroup].icon; return <Icon size={15} className="text-white"/>; })()}
              </span>
            )}
            <h2 className="font-bold text-slate-800">{GROUP_META[activeGroup]?.label ?? activeGroup}</h2>
          </div>

          <div className="space-y-5">
            {groupSettings.map(s => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-700">{s.label}</label>
                  {s.type === "boolean" && (
                    <SettingField s={s} value={values[s.key]} onChange={v => setValues(p => ({ ...p, [s.key]: v }))}/>
                  )}
                </div>
                {s.type !== "boolean" && (
                  <SettingField s={s} value={values[s.key]} onChange={v => setValues(p => ({ ...p, [s.key]: v }))}/>
                )}
                <p className="text-[11px] text-slate-400 mt-1 font-mono">{s.key}</p>
              </div>
            ))}
            {groupSettings.length === 0 && (
              <div className="text-slate-400 text-sm text-center py-12">No settings in this group</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
