import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Plus, X, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/clinics")({
  component: AdminClinics,
});

const BLANK = { name:"", city:"", country:"United Kingdom", email:"", phone:"", address:"" };

function AdminClinics() {
  const [clinics,setClinics]=useState<any[]>([]);
  const [modal,setModal]=useState<"create"|"edit"|"delete"|null>(null);
  const [target,setTarget]=useState<any>(null);
  const [form,setForm]=useState(BLANK);
  const [saving,setSaving]=useState(false);

  async function load(){ const r=await apiFetch<any>("/api/admin/clinics"); setClinics(r.clinics); }
  useEffect(()=>{load();},[]);

  function openCreate(){ setForm(BLANK); setTarget(null); setModal("create"); }
  function openEdit(c:any){ setForm({name:c.name,city:c.city||"",country:c.country||"United Kingdom",email:c.email||"",phone:c.phone||"",address:c.address||""}); setTarget(c); setModal("edit"); }

  async function save(){
    setSaving(true);
    try{
      if(modal==="create") await apiFetch("/api/admin/clinics",{method:"POST",body:JSON.stringify(form)});
      else await apiFetch(`/api/admin/clinics/${target._id}`,{method:"PATCH",body:JSON.stringify(form)});
      setModal(null); load();
    }finally{setSaving(false);}
  }

  async function del(){
    await apiFetch(`/api/admin/clinics/${target._id}`,{method:"DELETE"});
    setModal(null); load();
  }

  const F=(k:keyof typeof BLANK,label:string,type="text")=>(
    <div key={k}>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <input type={type} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400"/>
    </div>
  );

  return(
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-indigo-500 font-semibold mb-1">Operations</div>
          <h1 className="text-2xl font-bold text-slate-800">Clinics</h1>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{background:"linear-gradient(90deg,#6366f1,#4f46e5)"}}>
          <Plus size={15}/> Add Clinic
        </button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {clinics.map(c=>(
          <div key={c._id} className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] transition-shadow">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                {c.name?.charAt(0)||"?"}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={()=>openEdit(c)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><Pencil size={13}/></button>
                <button onClick={()=>{setTarget(c);setModal("delete");}} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={13}/></button>
              </div>
            </div>
            <h3 className="font-bold text-slate-800 leading-tight">{c.name}</h3>
            <div className="text-sm text-slate-500 mt-1">{[c.city,c.country].filter(Boolean).join(", ")}</div>
            {c.email&&<div className="text-xs text-slate-400 mt-0.5">{c.email}</div>}
            {c.phone&&<div className="text-xs text-slate-400">{c.phone}</div>}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Cases</span>
              <span className="text-sm font-bold text-indigo-600">{c.caseCount??0}</span>
            </div>
          </div>
        ))}
        {clinics.length===0&&<div className="col-span-3 text-center py-12 text-slate-400">No clinics yet.</div>}
      </div>

      {(modal==="create"||modal==="edit")&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={()=>setModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-lg">{modal==="create"?"Add Clinic":"Edit Clinic"}</h3>
              <button onClick={()=>setModal(null)}><X size={18} className="text-slate-400"/></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {F("name","Clinic Name")} {F("city","City")}
              {F("country","Country")} {F("email","Email","email")}
              {F("phone","Phone","tel")} {F("address","Address")}
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <button onClick={()=>setModal(null)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-50">Cancel</button>
              <button onClick={save} disabled={saving||!form.name}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{background:"linear-gradient(90deg,#6366f1,#4f46e5)"}}>
                {saving?"Saving…":modal==="create"?"Add Clinic":"Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal==="delete"&&target&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={()=>setModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold text-slate-800 mb-2">Delete Clinic?</h3>
            <p className="text-sm text-slate-500 mb-5">Delete <strong>{target.name}</strong>? Cases linked to this clinic will remain.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setModal(null)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-50">Cancel</button>
              <button onClick={del} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
