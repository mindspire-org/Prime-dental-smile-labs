import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Search, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/admin/cases")({
  component: AdminCases,
});

const STATUSES = ["","Submitted","File Review","Awaiting Information","Design Stage","Dentist Approval","In Production","Finishing","Quality Control","Ready for Dispatch","Dispatched","Completed"];
const STATUS_COLORS: Record<string,{bg:string;text:string}> = {
  "Submitted":{bg:"bg-cyan-50",text:"text-cyan-700"},
  "Awaiting Information":{bg:"bg-amber-50",text:"text-amber-700"},
  "In Production":{bg:"bg-blue-50",text:"text-blue-700"},
  "Dispatched":{bg:"bg-green-50",text:"text-green-700"},
  "Completed":{bg:"bg-slate-100",text:"text-slate-600"},
  "Design Stage":{bg:"bg-violet-50",text:"text-violet-700"},
  "Quality Control":{bg:"bg-orange-50",text:"text-orange-700"},
};
const SC = (s:string)=>STATUS_COLORS[s]??{bg:"bg-slate-100",text:"text-slate-600"};

function AdminCases() {
  const [data,setData]=useState<any>(null);
  const [search,setSearch]=useState("");
  const [statusFilter,setStatusFilter]=useState("");
  const [page,setPage]=useState(1);
  const [updating,setUpdating]=useState<string|null>(null);
  const [statusModal,setStatusModal]=useState<any>(null);
  const [newStatus,setNewStatus]=useState("");
  const [note,setNote]=useState("");

  async function load(){
    const params=new URLSearchParams({page:String(page),limit:"25"});
    if(search) params.set("search",search);
    if(statusFilter) params.set("status",statusFilter);
    const r=await apiFetch(`/api/admin/cases?${params}`);
    setData(r);
  }

  useEffect(()=>{load();},[page,statusFilter]);
  useEffect(()=>{const t=setTimeout(()=>{setPage(1);load();},400);return()=>clearTimeout(t);},[search]);

  async function updateStatus(){
    if(!statusModal||!newStatus) return;
    setUpdating(statusModal._id);
    try{
      await apiFetch(`/api/admin/cases/${statusModal._id}/status`,{method:"PATCH",body:JSON.stringify({status:newStatus,note})});
      setStatusModal(null);setNote("");setNewStatus("");
      load();
    }finally{setUpdating(null);}
  }

  return(
    <div className="space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-indigo-500 font-semibold mb-1">Operations</div>
        <h1 className="text-2xl font-bold text-slate-800">Cases Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-52 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-400">
          <Search size={14} className="text-slate-400 shrink-0"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search case number or patient ref…" className="bg-transparent outline-none text-sm text-slate-700 flex-1 placeholder:text-slate-400"/>
        </div>
        <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}
          className="text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none focus:border-indigo-400">
          {STATUSES.map(s=><option key={s} value={s}>{s||"All Statuses"}</option>)}
        </select>
        <div className="text-xs text-slate-400 ml-auto">{data?.total??0} cases</div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Case #","Patient","Dentist","Clinic","Service","Urgency","Status","Submitted","Actions"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {!data?(<tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400 text-sm">Loading…</td></tr>)
              :data.items.length===0?(<tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400 text-sm">No cases found</td></tr>)
              :data.items.map((c:any)=>{
                const sc=SC(c.status);
                return(
                  <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800 text-xs">{c.caseNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{c.patientRef}</td>
                    <td className="px-4 py-3 text-slate-600">{c.dentist?.name||"—"}<div className="text-[10px] text-slate-400">{c.dentist?.email}</div></td>
                    <td className="px-4 py-3 text-slate-600">{c.clinic?.name||"—"}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[120px] truncate">{c.services?.join(", ")||"—"}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.urgency==="Urgent"?"bg-red-50 text-red-600":c.urgency==="Express"?"bg-amber-50 text-amber-600":"bg-slate-100 text-slate-500"}`}>{c.urgency}</span></td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center text-[10px] font-semibold px-2 py-1 rounded-full ${sc.bg} ${sc.text}`}>{c.status}</span></td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3">
                      <button onClick={()=>{setStatusModal(c);setNewStatus(c.status);}}
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline">
                        Update <ChevronDown size={11}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {data&&data.pages>1&&(
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="text-xs font-medium text-slate-500 disabled:opacity-40 hover:text-indigo-600">← Prev</button>
            <span className="text-xs text-slate-400">Page {page} of {data.pages}</span>
            <button onClick={()=>setPage(p=>Math.min(data.pages,p+1))} disabled={page===data.pages} className="text-xs font-medium text-slate-500 disabled:opacity-40 hover:text-indigo-600">Next →</button>
          </div>
        )}
      </div>

      {/* Status update modal */}
      {statusModal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={()=>setStatusModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold text-slate-800 mb-1">Update Case Status</h3>
            <p className="text-xs text-slate-400 mb-4">Case: <span className="font-mono font-bold text-slate-700">{statusModal.caseNumber}</span></p>
            <label className="block text-xs font-semibold text-slate-600 mb-1">New Status</label>
            <select value={newStatus} onChange={e=>setNewStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 mb-4">
              {STATUSES.filter(Boolean).map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Note (optional)</label>
            <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} placeholder="Add a note for the dentist…"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 resize-none mb-4"/>
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setStatusModal(null)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-50">Cancel</button>
              <button onClick={updateStatus} disabled={!!updating}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{background:"linear-gradient(90deg,#6366f1,#4f46e5)"}}>
                {updating?"Saving…":"Save Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
