import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { apiFetch, getAccessToken, getCurrentUser } from "@/lib/api";
import { formatBytes } from "@/lib/utils";
import {
  Database, Download, Upload, Save, Trash2, RotateCcw,
  Clock, Calendar, CheckCircle2, AlertTriangle, FileArchive,
  ChevronRight, Loader2, Shield,
} from "lucide-react";

export const Route = createFileRoute("/admin/backups")({
  // Admin-only: backup + deletion module is restricted to admins, never lab staff.
  // (Backend also enforces requireRole("admin"); this blocks the page itself.)
  beforeLoad: () => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") throw redirect({ to: "/admin/cases" as never });
  },
  component: BackupsPage,
});

const RETENTION_OPTIONS = [
  { value: 3, label: "3 Days" },
  { value: 7, label: "1 Week" },
  { value: 30, label: "1 Month" },
  { value: 60, label: "2 Months" },
  { value: 90, label: "3 Months" },
  { value: 180, label: "6 Months" },
  { value: 365, label: "12 Months" },
];

const DELETE_SCOPE_OPTIONS = [
  { value: "all", label: "All Data" },
  { value: "cases", label: "Cases Only" },
  { value: "messages", label: "Messages Only" },
  { value: "files", label: "Files Only" },
  { value: "activity", label: "Activity Logs Only" },
  { value: "contacts", label: "Contact Enquiries Only" },
];

const COLLECTIONS = [
  { key: "users", label: "Users" },
  { key: "clinics", label: "Clinics" },
  { key: "cases", label: "Cases" },
  { key: "labFiles", label: "Lab Files" },
  { key: "messages", label: "Messages" },
  { key: "activityLogs", label: "Activity Logs" },
  { key: "contents", label: "Content" },
  { key: "settings", label: "Settings" },
  { key: "media", label: "Media" },
  { key: "pages", label: "Pages" },
  { key: "posts", label: "Posts" },
  { key: "notifications", label: "Notifications" },
  { key: "testimonials", label: "Testimonials" },
  { key: "services", label: "Services" },
  { key: "emailTemplates", label: "Email Templates" },
  { key: "roleConfigurations", label: "Role Configurations" },
  { key: "contactEnquiries", label: "Contact Enquiries" },
];

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-indigo-600" />
      </div>
      <div>
        <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] border border-slate-100 p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

export default function BackupsPage() {
  const [tab, setTab] = useState<"snapshots" | "export" | "import" | "settings">("snapshots");
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCollections, setSelectedCollections] = useState<string[]>(COLLECTIONS.map(c => c.key));
  const [importJson, setImportJson] = useState("");
  const [importOverwrite, setImportOverwrite] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [snapshotName, setSnapshotName] = useState("");
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [cleanupResult, setCleanupResult] = useState<any>(null);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupChecks, setCleanupChecks] = useState({ backup: false, irreversible: false, scope: false });
  const [cleanupConfirmText, setCleanupConfirmText] = useState("");
  const [cleanupPreview, setCleanupPreview] = useState<any>(null);
  const [showHardResetModal, setShowHardResetModal] = useState(false);
  const [hardResetChecks, setHardResetChecks] = useState({ backup: false, irreversible: false, scope: false });
  const [hardResetConfirmText, setHardResetConfirmText] = useState("");
  const [hardResetResult, setHardResetResult] = useState<any>(null);

  async function loadSnapshots() {
    const r = await apiFetch<any>("/api/admin/backups/snapshots");
    setSnapshots(r.snapshots ?? []);
  }

  async function loadSettings() {
    const r = await apiFetch<any>("/api/admin/backups/settings");
    setSettings(r);
  }

  useEffect(() => {
    loadSnapshots();
    loadSettings();
  }, []);

  async function createSnapshot() {
    setLoading(true); setMessage("");
    try {
      await apiFetch("/api/admin/backups/snapshots", { method: "POST", body: JSON.stringify({ name: snapshotName || undefined }) });
      setSnapshotName("");
      setMessage("Snapshot created successfully.");
      loadSnapshots();
    } catch (err: any) {
      setMessage(err.message || "Failed to create snapshot");
    } finally { setLoading(false); }
  }

  async function deleteSnapshot(id: string) {
    if (!confirm("Delete this snapshot?")) return;
    await apiFetch(`/api/admin/backups/snapshots/${id}`, { method: "DELETE" });
    loadSnapshots();
  }

  async function downloadSnapshot(id: string, name: string) {
    try {
      const token = getAccessToken();
      const res = await fetch(`/api/admin/backups/snapshots/${id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("content-disposition");
      const filename = disposition?.match(/filename="(.+)"/)?.[1] || `${name.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setMessage(err.message || "Download failed");
    }
  }

  async function restoreSnapshot(id: string) {
    if (!confirm("This will overwrite current data with the snapshot. Continue?")) return;
    setRestoreId(id); setMessage("");
    try {
      await apiFetch(`/api/admin/backups/snapshots/${id}/restore`, { method: "POST", body: JSON.stringify({ collections: selectedCollections }) });
      setMessage("Snapshot restored successfully.");
    } catch (err: any) {
      setMessage(err.message || "Restore failed");
    } finally { setRestoreId(null); }
  }

  async function exportData() {
    setLoading(true); setMessage("");
    try {
      const token = getAccessToken();
      const res = await fetch("/api/admin/backups/export", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          // Auth is Bearer-based — a raw fetch must attach the token itself.
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ collections: selectedCollections }),
      });
      if (res.status === 401) throw new Error("Session expired — please reload and log in again.");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prime-smile-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Export downloaded successfully.");
    } catch (err: any) {
      setMessage(err.message || "Export failed");
    } finally { setLoading(false); }
  }

  function readImportFile(file: File) {
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setMessage("Only .json files are supported.");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      if (text) {
        setImportJson(text);
        setMessage(`Loaded "${file.name}" (${formatBytes(file.size)}). Ready to import.`);
      }
    };
    reader.onerror = () => setMessage("Failed to read file.");
    reader.readAsText(file);
  }

  async function importData() {
    if (!importJson.trim()) { setMessage("Paste JSON data first."); return; }
    setLoading(true); setMessage("");
    try {
      const data = JSON.parse(importJson);
      const r = await apiFetch<any>("/api/admin/backups/import", {
        method: "POST",
        body: JSON.stringify({ data, collections: selectedCollections, overwrite: importOverwrite }),
      });
      setMessage(`Imported ${r.imported} records successfully.`);
    } catch (err: any) {
      setMessage(err.message || "Import failed");
    } finally { setLoading(false); }
  }

  async function saveSettings() {
    setLoading(true); setMessage("");
    try {
      await apiFetch("/api/admin/backups/settings", { method: "PUT", body: JSON.stringify(settings) });
      setMessage("Settings saved successfully.");
    } catch (err: any) {
      setMessage(err.message || "Failed to save settings");
    } finally { setLoading(false); }
  }

  async function openCleanupModal() {
    setCleanupChecks({ backup: false, irreversible: false, scope: false });
    setCleanupConfirmText("");
    setCleanupPreview(null);
    setShowCleanupModal(true);
    try {
      const r = await apiFetch<any>("/api/admin/backups/cleanup-preview", {
        method: "POST",
        body: JSON.stringify({ days: settings.retentionDays, scope: settings.autoDeleteScope }),
      });
      setCleanupPreview(r);
    } catch {
      setCleanupPreview({ error: true });
    }
  }

  function closeCleanupModal() {
    setShowCleanupModal(false);
    setCleanupChecks({ backup: false, irreversible: false, scope: false });
    setCleanupConfirmText("");
  }

  async function runCleanup() {
    setLoading(true); setMessage(""); setCleanupResult(null);
    try {
      const r = await apiFetch<any>("/api/admin/backups/cleanup", {
        method: "POST",
        body: JSON.stringify({ days: settings.retentionDays, scope: settings.autoDeleteScope }),
      });
      setCleanupResult(r.deleted);
      setMessage("Cleanup completed.");
      closeCleanupModal();
    } catch (err: any) {
      setMessage(err.message || "Cleanup failed");
    } finally { setLoading(false); }
  }

  const canConfirmCleanup = cleanupChecks.backup && cleanupChecks.irreversible && cleanupChecks.scope && cleanupConfirmText.trim().toUpperCase() === "DELETE";

  function openHardResetModal() {
    setHardResetChecks({ backup: false, irreversible: false, scope: false });
    setHardResetConfirmText("");
    setHardResetResult(null);
    setShowHardResetModal(true);
  }

  function closeHardResetModal() {
    setShowHardResetModal(false);
    setHardResetChecks({ backup: false, irreversible: false, scope: false });
    setHardResetConfirmText("");
  }

  async function runHardReset() {
    setLoading(true); setMessage(""); setHardResetResult(null);
    try {
      const r = await apiFetch<any>("/api/admin/backups/hard-reset", { method: "POST" });
      setHardResetResult(r.deleted);
      setMessage("Hard reset completed. Admin and lab users preserved.");
      closeHardResetModal();
    } catch (err: any) {
      setMessage(err.message || "Hard reset failed");
    } finally { setLoading(false); }
  }

  const canConfirmHardReset = hardResetChecks.backup && hardResetChecks.irreversible && hardResetChecks.scope && hardResetConfirmText.trim().toUpperCase() === "RESET EVERYTHING";

  const tabs = [
    { id: "snapshots", label: "Snapshots", icon: Database },
    { id: "export", label: "Export", icon: Download },
    { id: "import", label: "Import", icon: Upload },
    { id: "settings", label: "Settings", icon: Shield },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Backups & Data Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">Export, import, snapshot and manage data retention</p>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${message.includes("failed") || message.includes("Failed") ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
          {message.includes("failed") || message.includes("Failed") ? <AlertTriangle size={14}/> : <CheckCircle2 size={14}/>}
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0
              ${tab === t.id ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"}`}>
            <t.icon size={14}/> {t.label}
          </button>
        ))}
      </div>

      {/* Snapshots */}
      {tab === "snapshots" && (
        <div className="space-y-4">
          <Card>
            <SectionHeader icon={Database} title="Create Snapshot" subtitle="Save a point-in-time backup of all data" />
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="text" value={snapshotName} onChange={e => setSnapshotName(e.target.value)}
                placeholder="Snapshot name (optional)"
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400" />
              <button onClick={createSnapshot} disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 inline-flex items-center justify-center gap-2 shrink-0"
                style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                {loading ? <><Loader2 size={14} className="animate-spin"/> Creating…</> : <><Save size={14}/> Create Snapshot</>}
              </button>
            </div>
          </Card>

          <Card>
            <SectionHeader icon={FileArchive} title="Saved Snapshots" />
            {snapshots.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">No snapshots yet</div>
            ) : (
              <div className="space-y-2">
                {snapshots.map((s: any) => (
                  <div key={s._id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-700 truncate">{s.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar size={10}/>
                        {new Date(s.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        <span className="text-slate-300">|</span>
                        {s.createdBy?.name || "System"}
                        <span className="text-slate-300">|</span>
                        {formatBytes(s.size || 0)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => downloadSnapshot(s._id, s.name)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1">
                        <Download size={11}/> Download
                      </button>
                      <button onClick={() => restoreSnapshot(s._id)} disabled={restoreId === s._id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1 disabled:opacity-50">
                        {restoreId === s._id ? <><Loader2 size={11} className="animate-spin"/> Restoring…</> : <><RotateCcw size={11}/> Restore</>}
                      </button>
                      <button onClick={() => deleteSnapshot(s._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors inline-flex items-center gap-1">
                        <Trash2 size={11}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Export */}
      {tab === "export" && (
        <div className="space-y-4">
          <Card>
            <SectionHeader icon={Download} title="Export Data" subtitle="Download a JSON backup of selected collections" />
            <CollectionPicker selected={selectedCollections} onChange={setSelectedCollections} />
            <button onClick={exportData} disabled={loading || selectedCollections.length === 0}
              className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 inline-flex items-center gap-2 w-full sm:w-auto justify-center"
              style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
              {loading ? <><Loader2 size={14} className="animate-spin"/> Exporting…</> : <><Download size={14}/> Export & Download</>}
            </button>
          </Card>
        </div>
      )}

      {/* Import */}
      {tab === "import" && (
        <div className="space-y-4">
          <Card>
            <SectionHeader icon={Upload} title="Import Data" subtitle="Upload a JSON backup file or paste data to restore records" />
            <CollectionPicker selected={selectedCollections} onChange={setSelectedCollections} />
            <div className="flex items-center justify-between mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <div className="text-sm font-medium text-slate-700">Replace existing data</div>
                <div className="text-[11px] text-slate-400">
                  {importOverwrite
                    ? "Selected collections are wiped, then imported (clean restore)."
                    : "Imported records are added alongside existing data (merge)."}
                </div>
              </div>
              <Toggle value={importOverwrite} onChange={setImportOverwrite} />
            </div>

            {/* Drag & Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) readImportFile(file);
              }}
              onClick={() => importFileRef.current?.click()}
              className={`mt-4 w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${dragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
            >
              <Upload size={28} className={`mx-auto mb-2 ${dragOver ? "text-indigo-500" : "text-slate-400"}`} />
              <p className="text-sm font-medium text-slate-700">Drag & drop a JSON backup file here</p>
              <p className="text-xs text-slate-400 mt-1">or click to browse</p>
              <p className="text-[10px] text-slate-300 mt-2">.json files only</p>
            </div>
            <input
              ref={importFileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) readImportFile(file);
                if (importFileRef.current) importFileRef.current.value = "";
              }}
            />

            <p className="text-xs text-slate-400 text-center my-2">— or paste JSON directly —</p>

            <textarea value={importJson} onChange={e => setImportJson(e.target.value)} rows={8}
              placeholder={`Paste JSON data here...\nFormat: { "users": [...], "cases": [...] }`}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 font-mono resize-none" />
            <button onClick={importData} disabled={loading || !importJson.trim()}
              className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 inline-flex items-center gap-2 w-full sm:w-auto justify-center"
              style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
              {loading ? <><Loader2 size={14} className="animate-spin"/> Importing…</> : <><Upload size={14}/> Import Data</>}
            </button>
          </Card>
        </div>
      )}

      {/* Settings */}
      {tab === "settings" && (
        <div className="space-y-4">
          <Card>
            <SectionHeader icon={Clock} title="Auto Backup" subtitle="Configure automatic snapshot creation" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-700">Enable Auto Backup</div>
                  <div className="text-[11px] text-slate-400">Automatically create snapshots on schedule</div>
                </div>
                <Toggle value={settings.autoBackup ?? false} onChange={v => setSettings((s: any) => ({ ...s, autoBackup: v }))} />
              </div>
              {settings.autoBackup && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Backup Interval (days)</label>
                  <input type="number" min={1} max={30} value={settings.autoBackupIntervalDays ?? 7}
                    onChange={e => setSettings((s: any) => ({ ...s, autoBackupIntervalDays: Number(e.target.value) }))}
                    className="w-full sm:w-48 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
              )}
            </div>
          </Card>

          <Card>
            <SectionHeader icon={Shield} title="Data Retention & Auto-Delete" subtitle="Control how long data is kept and what gets cleaned up" />
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Retention Period</label>
                <select value={settings.retentionDays ?? 90}
                  onChange={e => setSettings((s: any) => ({ ...s, retentionDays: Number(e.target.value) }))}
                  className="w-full sm:w-64 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                  {RETENTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Data older than this will be eligible for cleanup</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-700">Enable Auto-Delete</div>
                  <div className="text-[11px] text-slate-400">Automatically delete old data based on retention settings</div>
                </div>
                <Toggle value={settings.autoDeleteEnabled ?? false} onChange={v => setSettings((s: any) => ({ ...s, autoDeleteEnabled: v }))} />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Auto-Delete Scope</label>
                <select value={settings.autoDeleteScope ?? "all"}
                  onChange={e => setSettings((s: any) => ({ ...s, autoDeleteScope: e.target.value }))}
                  className="w-full sm:w-64 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                  {DELETE_SCOPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Choose which data types are affected by automatic deletion</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-5 pt-4 border-t border-slate-100">
              <button onClick={saveSettings} disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 inline-flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                {loading ? <><Loader2 size={14} className="animate-spin"/> Saving…</> : <><Save size={14}/> Save Settings</>}
              </button>
              <button onClick={openCleanupModal} disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2">
                <Trash2 size={14}/> Run Cleanup Now
              </button>
              <button onClick={openHardResetModal} disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-white hover:bg-slate-900 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2">
                <AlertTriangle size={14}/> Hard Reset
              </button>
            </div>

            {cleanupResult && (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 text-xs text-slate-600 font-mono space-y-0.5">
                {Object.entries(cleanupResult).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2"><ChevronRight size={10} className="text-slate-400"/> {k}: {String(v)} deleted</div>
                ))}
              </div>
            )}

            {hardResetResult && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 text-xs text-red-700 font-mono space-y-0.5">
                <div className="font-semibold mb-1">Hard Reset Results:</div>
                {Object.entries(hardResetResult).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2"><ChevronRight size={10} className="text-red-400"/> {k}: {String(v)} deleted</div>
                ))}
              </div>
            )}
          </Card>

          {/* Cleanup Triple-Verification Modal */}
          {showCleanupModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} className="text-red-500"/>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Confirm Data Cleanup</h3>
                    <p className="text-xs text-slate-400">This action is irreversible. Triple verification required.</p>
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl p-3 text-xs text-red-700 space-y-1">
                  <div className="font-semibold">Scope: {DELETE_SCOPE_OPTIONS.find(o => o.value === (settings.autoDeleteScope ?? "all"))?.label}</div>
                  <div>Retention: {RETENTION_OPTIONS.find(o => o.value === (settings.retentionDays ?? 90))?.label ?? (settings.retentionDays ?? 90) + " days"}</div>
                  <div>Data older than this will be permanently removed.</div>
                </div>

                {/* Preview counts */}
                <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1">
                  <div className="font-semibold text-slate-700 mb-1">Records to be deleted:</div>
                  {!cleanupPreview ? (
                    <div className="text-slate-400">Loading preview…</div>
                  ) : cleanupPreview.error ? (
                    <div className="text-red-500">Failed to load preview.</div>
                  ) : (
                    <>
                      <div className="text-slate-500">
                        Cutoff: <span className="font-mono font-medium text-slate-700">{new Date(cleanupPreview.cutoff).toLocaleDateString("en-GB")}</span>
                        <span className="text-slate-400 ml-1">(data created before this date)</span>
                      </div>
                      {Object.entries(cleanupPreview.counts || {}).map(([k, v]: [string, any]) => (
                        <div key={k} className="flex justify-between">
                          <span className="capitalize text-slate-600">{k}:</span>
                          <span className={`font-mono font-bold ${v > 0 ? "text-red-600" : "text-slate-400"}`}>{v}</span>
                        </div>
                      ))}
                      {Object.values(cleanupPreview.counts || {}).every((v: any) => v === 0) && (
                        <div className="text-emerald-600 font-medium mt-1">No records match the retention criteria — nothing will be deleted.</div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={cleanupChecks.backup} onChange={e => setCleanupChecks(c => ({ ...c, backup: e.target.checked }))} className="mt-0.5 rounded border-slate-300"/>
                    <span className="text-sm text-slate-700">I have created a backup or snapshot of my data.</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={cleanupChecks.irreversible} onChange={e => setCleanupChecks(c => ({ ...c, irreversible: e.target.checked }))} className="mt-0.5 rounded border-slate-300"/>
                    <span className="text-sm text-slate-700">I understand this action is irreversible and cannot be undone.</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={cleanupChecks.scope} onChange={e => setCleanupChecks(c => ({ ...c, scope: e.target.checked }))} className="mt-0.5 rounded border-slate-300"/>
                    <span className="text-sm text-slate-700">I understand the selected scope and retention period above.</span>
                  </label>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Type <span className="font-mono text-red-600 font-bold">DELETE</span> to confirm</label>
                  <input type="text" value={cleanupConfirmText} onChange={e => setCleanupConfirmText(e.target.value)} placeholder="Type DELETE"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-400 font-mono"/>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={closeCleanupModal} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={runCleanup} disabled={!canConfirmCleanup || loading}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 inline-flex items-center justify-center gap-2 transition-colors"
                    style={{ background: canConfirmCleanup ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#9ca3af,#6b7280)" }}>
                    {loading ? <><Loader2 size={14} className="animate-spin"/> Cleaning…</> : <><Trash2 size={14}/> Confirm Cleanup</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hard Reset Triple-Verification Modal */}
          {showHardResetModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} className="text-white"/>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Confirm Hard Reset</h3>
                    <p className="text-xs text-slate-400">This will WIPE ALL DATA. Triple verification required.</p>
                  </div>
                </div>

                <div className="bg-red-50 rounded-xl p-3 text-xs text-red-700 space-y-1">
                  <div className="font-semibold">This is a HARD RESET</div>
                  <div>All cases, messages, files, clinics, dentists, activity logs, contacts, and content will be permanently deleted.</div>
                  <div className="font-semibold text-emerald-700 mt-1">Preserved: Admin users, Lab staff users, System settings, Role configurations.</div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={hardResetChecks.backup} onChange={e => setHardResetChecks(c => ({ ...c, backup: e.target.checked }))} className="mt-0.5 rounded border-slate-300"/>
                    <span className="text-sm text-slate-700">I have created a full backup or snapshot of my data.</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={hardResetChecks.irreversible} onChange={e => setHardResetChecks(c => ({ ...c, irreversible: e.target.checked }))} className="mt-0.5 rounded border-slate-300"/>
                    <span className="text-sm text-slate-700">I understand this will delete ALL data and cannot be undone.</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={hardResetChecks.scope} onChange={e => setHardResetChecks(c => ({ ...c, scope: e.target.checked }))} className="mt-0.5 rounded border-slate-300"/>
                    <span className="text-sm text-slate-700">I understand that only admin and lab users will remain.</span>
                  </label>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Type <span className="font-mono text-red-600 font-bold">RESET EVERYTHING</span> to confirm</label>
                  <input type="text" value={hardResetConfirmText} onChange={e => setHardResetConfirmText(e.target.value)} placeholder="Type RESET EVERYTHING"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-red-400 font-mono"/>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={closeHardResetModal} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={runHardReset} disabled={!canConfirmHardReset || loading}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 inline-flex items-center justify-center gap-2 transition-colors"
                    style={{ background: canConfirmHardReset ? "linear-gradient(135deg,#1f2937,#111827)" : "linear-gradient(135deg,#9ca3af,#6b7280)" }}>
                    {loading ? <><Loader2 size={14} className="animate-spin"/> Resetting…</> : <><AlertTriangle size={14}/> Confirm Hard Reset</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-indigo-500" : "bg-slate-200"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : ""}`} />
    </button>
  );
}

function CollectionPicker({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const all = selected.length === COLLECTIONS.length;
  const toggle = (key: string) => {
    if (selected.includes(key)) onChange(selected.filter(k => k !== key));
    else onChange([...selected, key]);
  };
  const toggleAll = () => {
    if (all) onChange([]);
    else onChange(COLLECTIONS.map(c => c.key));
  };
  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={toggleAll} className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          {all ? "Deselect All" : "Select All"}
        </button>
        <span className="text-[11px] text-slate-400">{selected.length} selected</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {COLLECTIONS.map(c => (
          <button key={c.key} onClick={() => toggle(c.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border text-left
              ${selected.includes(c.key)
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
              }`}>
            <span className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center shrink-0 ${selected.includes(c.key) ? "border-indigo-500 bg-indigo-500" : "border-slate-300"}`}>
              {selected.includes(c.key) && <CheckCircle2 size={8} className="text-white" />}
            </span>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
