import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  Search, ChevronDown, Printer, CalendarDays, Briefcase, Clock, CheckCircle2, AlertCircle,
  TrendingUp, FlaskConical, ArrowRight, Trash2,
} from "lucide-react";

export const Route = createFileRoute("/admin/cases/")({
  component: AdminCasesIndex,
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
  "Finishing":{bg:"bg-sky-50",text:"text-sky-700"},
  "Ready for Dispatch":{bg:"bg-lime-50",text:"text-lime-700"},
  "File Review":{bg:"bg-blue-50",text:"text-blue-700"},
  "Dentist Approval":{bg:"bg-pink-50",text:"text-pink-700"},
};
const SC = (s:string)=>STATUS_COLORS[s]??{bg:"bg-slate-100",text:"text-slate-600"};

const STATUS_BAR_COLORS: Record<string, string> = {
  "Submitted": "#0aabbd",
  "In Production": "#6366f1",
  "Design Stage": "#8b5cf6",
  "Quality Control": "#f59e0b",
  "Dispatched": "#10b981",
  "Completed": "#64748b",
  "Awaiting Information": "#ef4444",
  "File Review": "#3b82f6",
  "Finishing": "#06b6d4",
  "Ready for Dispatch": "#84cc16",
  "Dentist Approval": "#ec4899",
};

function AdminCasesIndex() {
  const [data,setData]=useState<any>(null);
  const [stats,setStats]=useState<any>(null);
  const [search,setSearch]=useState("");
  const [statusFilter,setStatusFilter]=useState("");
  const [from,setFrom]=useState("");
  const [to,setTo]=useState("");
  const [page,setPage]=useState(1);
  const [updating,setUpdating]=useState<string|null>(null);
  const [statusModal,setStatusModal]=useState<any>(null);
  const [newStatus,setNewStatus]=useState("");
  const [note,setNote]=useState("");
  const [deleteModal,setDeleteModal]=useState<any>(null);

  async function load(){
    const params=new URLSearchParams({page:String(page),limit:"25"});
    if(search) params.set("search",search);
    if(statusFilter) params.set("status",statusFilter);
    if(from) params.set("from",from);
    if(to) params.set("to",to);
    const r=await apiFetch(`/api/admin/cases?${params}`);
    setData(r);
  }

  async function loadStats(){
    try {
      const s = await apiFetch("/api/admin/stats");
      setStats(s);
    } catch {}
  }

  useEffect(()=>{load();},[page,statusFilter,from,to]);
  useEffect(()=>{loadStats();},[]);
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

  async function deleteCase(id: string) {
    try {
      await apiFetch(`/api/admin/cases/${id}`, { method: "DELETE" });
      setDeleteModal(null);
      load();
      loadStats();
    } catch (err: any) {
      alert(err.message || "Failed to delete case");
    }
  }

  function handlePrint(){
    window.print();
  }

  const activeCases = stats?.cases?.active ?? 0;
  const completedCases = stats?.cases?.completed ?? 0;
  const awaitingInfo = stats?.cases?.awaitingInfo ?? 0;
  const atLab = stats?.cases?.atLab ?? 0;
  const thisMonth = stats?.cases?.thisMonth ?? 0;
  const totalCases = stats?.cases?.total ?? 0;
  const byStatus = (stats?.byStatus ?? {}) as Record<string,number>;

  return(
    <div className="space-y-5">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
          table { font-size: 11px; }
          th, td { padding: 6px 8px !important; }
        }
      `}</style>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-indigo-500 font-semibold mb-1">Operations</div>
          <h1 className="text-2xl font-bold text-slate-800">Cases Management</h1>
        </div>
        <button onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors">
          <Printer size={13} /> Print / Save
        </button>
      </div>

      {/* Mini Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Cases", value: totalCases, icon: Briefcase, color: "bg-indigo-500" },
          { label: "Active", value: activeCases, icon: Clock, color: "bg-amber-500" },
          { label: "This Month", value: thisMonth, icon: TrendingUp, color: "bg-blue-500" },
          { label: "Completed", value: completedCases, icon: CheckCircle2, color: "bg-emerald-500" },
          { label: "At Lab", value: atLab, icon: FlaskConical, color: "bg-sky-500" },
          { label: "Awaiting Info", value: awaitingInfo, icon: AlertCircle, color: "bg-orange-500" },
        ].map(card => (
          <div key={card.label} className="print-card bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{card.label}</div>
                <div className="text-2xl font-bold text-slate-800 mt-1">{card.value}</div>
              </div>
              <div className={`w-9 h-9 rounded-xl ${card.color} flex items-center justify-center text-white`}>
                <card.icon size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cases by Status breakdown */}
      {Object.keys(byStatus).length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)] print-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-sm">Cases by Status</h2>
            <Link to="/admin/cases" className="text-xs text-indigo-500 hover:underline inline-flex items-center gap-1">View all <ArrowRight size={11}/></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
            {Object.entries(byStatus).sort(([,a],[,b])=>b-a).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3 text-xs">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_BAR_COLORS[status] ?? "#94a3b8" }}/>
                <span className="text-slate-600 flex-1 truncate">{status}</span>
                <span className="font-semibold text-slate-700 w-6 text-right">{count}</span>
                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${totalCases > 0 ? Math.round((count / totalCases) * 100) : 0}%`, background: STATUS_BAR_COLORS[status] ?? "#94a3b8" }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex flex-wrap gap-3 items-center no-print">
        <div className="flex-1 min-w-52 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-400">
          <Search size={14} className="text-slate-400 shrink-0"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search case number or patient ref…" className="bg-transparent outline-none text-sm text-slate-700 flex-1 placeholder:text-slate-400"/>
        </div>
        <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}
          className="text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none focus:border-indigo-400">
          {STATUSES.map(s=><option key={s} value={s}>{s||"All Statuses"}</option>)}
        </select>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
          <CalendarDays size={14} className="text-slate-400" />
          <input type="date" value={from} onChange={e=>{setFrom(e.target.value);setPage(1);}}
            className="text-xs text-slate-700 outline-none bg-transparent" />
          <span className="text-slate-300">→</span>
          <input type="date" value={to} onChange={e=>{setTo(e.target.value);setPage(1);}}
            className="text-xs text-slate-700 outline-none bg-transparent" />
        </div>
        <div className="text-xs text-slate-400 ml-auto">{data?.total??0} cases</div>
      </div>

      {/* Table */}
      <div className="print-card bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
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
                      <div className="flex items-center gap-2">
                        <Link to="/admin/cases/$id" params={{ id: c._id }}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline">
                          View
                        </Link>
                        <button onClick={()=>{setStatusModal(c);setNewStatus(c.status);}}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline">
                          Update <ChevronDown size={11}/>
                        </button>
                        <button onClick={()=>setDeleteModal(c)}
                          className="inline-flex items-center gap-1 text-xs text-red-500 font-semibold hover:underline">
                          <Trash2 size={11}/> Delete
                        </button>
                      </div>
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

      {/* Delete confirm modal */}
      {deleteModal&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={()=>setDeleteModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold text-slate-800 mb-2">Delete Case?</h3>
            <p className="text-sm text-slate-500 mb-5">
              This will permanently delete case <strong>{deleteModal.caseNumber}</strong> for patient <strong>{deleteModal.patientRef}</strong>. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setDeleteModal(null)} className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-50">Cancel</button>
              <button onClick={()=>deleteCase(deleteModal._id)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
