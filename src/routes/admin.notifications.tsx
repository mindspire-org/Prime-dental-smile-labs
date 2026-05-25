import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Plus, Trash2, Edit3, X, Bell } from "lucide-react";

export const Route = createFileRoute("/admin/notifications")({ component: AdminNotifications });

type N = { _id: string; title: string; body: string; type: "info"|"warning"|"success"|"error"; targetRole: string; active: boolean; startAt: string; endAt?: string };
const EMPTY: Omit<N,"_id"> = { title:"", body:"", type:"info", targetRole:"all", active:true, startAt: new Date().toISOString().slice(0,16), endAt:"" };

const TYPE_CHIP: Record<string, string> = {
  info:    "bg-blue-50 text-blue-700",
  warning: "bg-amber-50 text-amber-700",
  success: "bg-emerald-50 text-emerald-700",
  error:   "bg-red-50 text-red-700",
};

function AdminNotifications() {
  const [items,   setItems]   = useState<N[]>([]);
  const [editing, setEditing] = useState<Partial<N> | null>(null);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    apiFetch<{ items: N[] }>("/api/admin/cms/notifications").then(r => setItems(r.items)).catch(() => {});
  }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing._id) {
        const r = await apiFetch<{ item: N }>(`/api/admin/cms/notifications/${editing._id}`, { method: "PATCH", body: JSON.stringify(editing) });
        setItems(p => p.map(i => i._id === editing._id ? r.item : i));
      } else {
        const r = await apiFetch<{ item: N }>("/api/admin/cms/notifications", { method: "POST", body: JSON.stringify(editing) });
        setItems(p => [r.item, ...p]);
      }
      setEditing(null);
    } finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete?")) return;
    await apiFetch(`/api/admin/cms/notifications/${id}`, { method: "DELETE" }).catch(() => {});
    setItems(p => p.filter(i => i._id !== id));
  }

  async function toggle(item: N) {
    const r = await apiFetch<{ item: N }>(`/api/admin/cms/notifications/${item._id}`, { method: "PATCH", body: JSON.stringify({ active: !item.active }) }).catch(() => null);
    if (r) setItems(p => p.map(i => i._id === item._id ? r.item : i));
  }

  const now = new Date();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Announcements</h1>
          <p className="text-sm text-slate-400">Banners shown to users in the portal</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
          <Plus size={15}/> New Announcement
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && <div className="text-center py-16 text-slate-300 bg-white rounded-2xl border border-slate-100 text-sm">No announcements yet</div>}
        {items.map(item => {
          const expired = item.endAt && new Date(item.endAt) < now;
          return (
            <div key={item._id} className={`bg-white rounded-2xl border shadow-sm p-4 flex items-start gap-4 ${item.active && !expired ? "border-slate-100" : "border-slate-50 opacity-60"}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.type === "warning" ? "bg-amber-100" : item.type === "success" ? "bg-emerald-100" : item.type === "error" ? "bg-red-100" : "bg-blue-100"}`}>
                <Bell size={16} className={item.type === "warning" ? "text-amber-500" : item.type === "success" ? "text-emerald-500" : item.type === "error" ? "text-red-500" : "text-blue-500"}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-semibold text-slate-800 text-sm">{item.title}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${TYPE_CHIP[item.type]}`}>{item.type}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{item.targetRole}</span>
                  {expired && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-400">Expired</span>}
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{item.body}</p>
                <p className="text-xs text-slate-400 mt-1">
                  From {new Date(item.startAt).toLocaleDateString("en-GB")}
                  {item.endAt ? ` · Ends ${new Date(item.endAt).toLocaleDateString("en-GB")}` : " · No end date"}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggle(item)}
                  className={`w-10 h-6 rounded-full transition-colors ${item.active ? "bg-indigo-500" : "bg-slate-200"}`}>
                  <span className={`block w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${item.active ? "translate-x-4" : ""}`}/>
                </button>
                <button onClick={() => setEditing(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600"><Edit3 size={13}/></button>
                <button onClick={() => del(item._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600"><Trash2 size={13}/></button>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800">{editing._id ? "Edit" : "New"} Announcement</h2>
              <button onClick={() => setEditing(null)}><X size={18} className="text-slate-400"/></button>
            </div>
            {[["title","Title"],["body","Message body"]].map(([k,l]) => (
              <div key={k}>
                <label className="text-xs font-medium text-slate-600 block mb-1">{l}</label>
                {k === "body"
                  ? <textarea value={(editing as any)[k] || ""} onChange={e => setEditing(p => ({ ...p!, [k]: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 resize-none"/>
                  : <input value={(editing as any)[k] || ""} onChange={e => setEditing(p => ({ ...p!, [k]: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"/>
                }
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Type</label>
                <select value={editing.type} onChange={e => setEditing(p => ({ ...p!, type: e.target.value as any }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
                  <option value="info">Info</option><option value="warning">Warning</option><option value="success">Success</option><option value="error">Error</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Target Role</label>
                <select value={editing.targetRole} onChange={e => setEditing(p => ({ ...p!, targetRole: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
                  <option value="all">Everyone</option><option value="dentist">Dentists only</option><option value="lab_staff">Lab Staff only</option><option value="admin">Admins only</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Start</label>
                <input type="datetime-local" value={editing.startAt?.slice(0,16) || ""} onChange={e => setEditing(p => ({ ...p!, startAt: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"/>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">End (optional)</label>
                <input type="datetime-local" value={editing.endAt?.slice(0,16) || ""} onChange={e => setEditing(p => ({ ...p!, endAt: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"/>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(p => ({ ...p!, active: !p!.active }))} className={`w-10 h-6 rounded-full transition-colors ${editing.active ? "bg-indigo-500" : "bg-slate-200"}`}>
                <span className={`block w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${editing.active ? "translate-x-4" : ""}`}/>
              </button>
              <span className="text-xs text-slate-600">Active</span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600">Cancel</button>
              <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
