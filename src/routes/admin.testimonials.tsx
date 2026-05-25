import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Plus, Trash2, Star, CheckCircle2, X, Edit3 } from "lucide-react";

export const Route = createFileRoute("/admin/testimonials")({ component: AdminTestimonials });

type T = { _id: string; name: string; title: string; clinic: string; text: string; rating: number; photo: string; approved: boolean; order: number };
const EMPTY: Omit<T,"_id"> = { name:"", title:"", clinic:"", text:"", rating:5, photo:"", approved:false, order:0 };

function Stars({ n, onChange }: { n: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={14} className={`${i <= n ? "fill-amber-400 text-amber-400" : "text-slate-200"} ${onChange ? "cursor-pointer" : ""}`}
          onClick={() => onChange?.(i)}/>
      ))}
    </div>
  );
}

function AdminTestimonials() {
  const [items,   setItems]   = useState<T[]>([]);
  const [editing, setEditing] = useState<Partial<T> | null>(null);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    apiFetch<{ items: T[] }>("/api/admin/cms/testimonials").then(r => setItems(r.items)).catch(() => {});
  }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing._id) {
        const r = await apiFetch<{ item: T }>(`/api/admin/cms/testimonials/${editing._id}`, { method: "PATCH", body: JSON.stringify(editing) });
        setItems(p => p.map(i => i._id === editing._id ? r.item : i));
      } else {
        const r = await apiFetch<{ item: T }>("/api/admin/cms/testimonials", { method: "POST", body: JSON.stringify(editing) });
        setItems(p => [...p, r.item]);
      }
      setEditing(null);
    } finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete?")) return;
    await apiFetch(`/api/admin/cms/testimonials/${id}`, { method: "DELETE" }).catch(() => {});
    setItems(p => p.filter(i => i._id !== id));
  }

  async function toggleApproved(item: T) {
    const r = await apiFetch<{ item: T }>(`/api/admin/cms/testimonials/${item._id}`, { method: "PATCH", body: JSON.stringify({ approved: !item.approved }) }).catch(() => null);
    if (r) setItems(p => p.map(i => i._id === item._id ? r.item : i));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-800">Testimonials</h1><p className="text-sm text-slate-400">{items.length} testimonial{items.length !== 1 ? "s" : ""}</p></div>
        <button onClick={() => setEditing({ ...EMPTY })} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
          <Plus size={15}/> Add Testimonial
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item._id} className={`bg-white rounded-2xl border shadow-sm p-4 space-y-3 ${item.approved ? "border-emerald-100" : "border-slate-100"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {item.photo ? <img src={item.photo} alt={item.name} className="w-9 h-9 rounded-full object-cover"/> : <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-sm">{item.name[0]}</div>}
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.title}{item.clinic ? ` · ${item.clinic}` : ""}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setEditing(item)} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400"><Edit3 size={13}/></button>
                <button onClick={() => del(item._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={13}/></button>
              </div>
            </div>
            <Stars n={item.rating}/>
            <p className="text-sm text-slate-600 italic line-clamp-3">"{item.text}"</p>
            <button onClick={() => toggleApproved(item)} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.approved ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              {item.approved ? <><CheckCircle2 size={11} className="inline mr-1"/>Approved</> : "Pending approval"}
            </button>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-3 text-center py-16 text-slate-300 text-sm">No testimonials yet</div>}
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setEditing(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800">{editing._id ? "Edit" : "Add"} Testimonial</h2>
              <button onClick={() => setEditing(null)}><X size={18} className="text-slate-400"/></button>
            </div>
            {[["name","Name"],["title","Title / Role"],["clinic","Clinic"],["photo","Photo URL"]] .map(([k,l]) => (
              <div key={k}>
                <label className="text-xs font-medium text-slate-600 block mb-1">{l}</label>
                <input value={(editing as any)[k] || ""} onChange={e => setEditing(p => ({ ...p!, [k]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"/>
              </div>
            ))}
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Quote</label>
              <textarea value={editing.text || ""} onChange={e => setEditing(p => ({ ...p!, text: e.target.value }))} rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 resize-none"/>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Rating</label>
              <Stars n={editing.rating || 5} onChange={v => setEditing(p => ({ ...p!, rating: v }))}/>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(p => ({ ...p!, approved: !p!.approved }))}
                className={`w-10 h-6 rounded-full transition-colors ${editing.approved ? "bg-indigo-500" : "bg-slate-200"}`}>
                <span className={`block w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${editing.approved ? "translate-x-4" : ""}`}/>
              </button>
              <span className="text-xs text-slate-600">Approved / visible</span>
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
