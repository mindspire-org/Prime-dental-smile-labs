import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Plus, Trash2, Edit3, X, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin/services")({ component: AdminServices });

type Svc = { _id: string; slug: string; name: string; description: string; price: string; turnaround: string; icon: string; order: number; active: boolean };
const EMPTY: Omit<Svc,"_id"> = { slug:"", name:"", description:"", price:"", turnaround:"", icon:"", order:0, active:true };

function AdminServices() {
  const [items,   setItems]   = useState<Svc[]>([]);
  const [editing, setEditing] = useState<Partial<Svc> | null>(null);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    apiFetch<{ items: Svc[] }>("/api/admin/cms/services").then(r => setItems(r.items)).catch(() => {});
  }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing._id) {
        const r = await apiFetch<{ item: Svc }>(`/api/admin/cms/services/${editing._id}`, { method: "PATCH", body: JSON.stringify(editing) });
        setItems(p => p.map(i => i._id === editing._id ? r.item : i));
      } else {
        const slug = editing.name!.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const r = await apiFetch<{ item: Svc }>("/api/admin/cms/services", { method: "POST", body: JSON.stringify({ ...editing, slug }) });
        setItems(p => [...p, r.item]);
      }
      setEditing(null);
    } finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this service?")) return;
    await apiFetch(`/api/admin/cms/services/${id}`, { method: "DELETE" }).catch(() => {});
    setItems(p => p.filter(i => i._id !== id));
  }

  async function toggleActive(item: Svc) {
    const r = await apiFetch<{ item: Svc }>(`/api/admin/cms/services/${item._id}`, { method: "PATCH", body: JSON.stringify({ active: !item.active }) }).catch(() => null);
    if (r) setItems(p => p.map(i => i._id === item._id ? r.item : i));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">Services</h1><p className="text-sm text-slate-400">Manage dental lab services shown on the marketing site</p></div>
        <button onClick={() => setEditing({ ...EMPTY })} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
          <Plus size={15}/> Add Service
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-slate-100 bg-slate-50">
            <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-400 font-semibold">Service</th>
            <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-400 font-semibold hidden md:table-cell">Price</th>
            <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-400 font-semibold hidden md:table-cell">Turnaround</th>
            <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-400 font-semibold">Status</th>
            <th className="px-5 py-3"/>
          </tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} className="py-16 text-center text-slate-300 text-sm">No services yet</td></tr>}
            {items.map(s => (
              <tr key={s._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    {s.icon && <span className="text-lg">{s.icon}</span>}
                    <div>
                      <p className="font-medium text-slate-800">{s.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{s.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell text-sm text-slate-600">{s.price}</td>
                <td className="px-5 py-3.5 hidden md:table-cell text-sm text-slate-600">{s.turnaround}</td>
                <td className="px-5 py-3.5">
                  <button onClick={() => toggleActive(s)} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                    {s.active ? <><CheckCircle2 size={11} className="inline mr-1"/>Active</> : "Hidden"}
                  </button>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setEditing(s)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"><Edit3 size={14}/></button>
                    <button onClick={() => del(s._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800">{editing._id ? "Edit" : "New"} Service</h2>
              <button onClick={() => setEditing(null)}><X size={18} className="text-slate-400"/></button>
            </div>
            {[["name","Service Name"],["icon","Icon (emoji)"],["description","Short Description"],["price","Price"],["turnaround","Turnaround Time"]].map(([k,l]) => (
              <div key={k}>
                <label className="text-xs font-medium text-slate-600 block mb-1">{l}</label>
                <input value={(editing as any)[k] || ""} onChange={e => setEditing(p => ({ ...p!, [k]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"/>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(p => ({ ...p!, active: !p!.active }))}
                className={`w-10 h-6 rounded-full transition-colors ${editing.active ? "bg-indigo-500" : "bg-slate-200"}`}>
                <span className={`block w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${editing.active ? "translate-x-4" : ""}`}/>
              </button>
              <span className="text-xs text-slate-600">Active / visible on site</span>
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
