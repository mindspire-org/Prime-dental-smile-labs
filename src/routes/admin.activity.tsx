import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Search } from "lucide-react";

export const Route = createFileRoute("/admin/activity")({
  component: AdminActivity,
});

const ACTION_COLORS: Record<string,string> = {
  "auth.login":"bg-blue-50 text-blue-600",
  "case.created":"bg-emerald-50 text-emerald-600",
  "case.status_changed":"bg-indigo-50 text-indigo-600",
  "user.created":"bg-violet-50 text-violet-600",
  "content.updated":"bg-amber-50 text-amber-600",
  "seo.updated":"bg-orange-50 text-orange-600",
};

function AdminActivity() {
  const [data,setData]=useState<any>(null);
  const [page,setPage]=useState(1);
  const [search,setSearch]=useState("");

  useEffect(()=>{
    const p=new URLSearchParams({page:String(page),limit:"50"});
    if(search) p.set("action",search);
    apiFetch(`/api/admin/activity?${p}`).then(setData);
  },[page,search]);

  return(
    <div className="space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-indigo-500 font-semibold mb-1">Overview</div>
        <h1 className="text-2xl font-bold text-slate-800">Activity Log</h1>
        <p className="text-sm text-slate-400 mt-1">Full audit trail of all system actions.</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-400">
          <Search size={14} className="text-slate-400 shrink-0"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Filter by action (e.g. case.created)…"
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-slate-400"/>
        </div>
        <span className="text-xs text-slate-400 self-center">{data?.total??0} entries</span>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="divide-y divide-slate-50">
          {!data?(<div className="p-8 text-center text-slate-400 text-sm animate-pulse">Loading…</div>)
          :data.logs.length===0?(<div className="p-8 text-center text-slate-400 text-sm">No activity found</div>)
          :data.logs.map((log:any)=>{
            const chip=ACTION_COLORS[log.action]??"bg-slate-100 text-slate-500";
            return(
              <div key={log._id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 text-[11px] font-bold text-indigo-600">
                  {log.actor?.name?.charAt(0)||"?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">{log.actor?.name||"System"}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono ${chip}`}>{log.action}</span>
                    {log.entityType&&<span className="text-[10px] text-slate-400">{log.entityType}</span>}
                  </div>
                  {log.metadata&&Object.keys(log.metadata).length>0&&(
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono truncate">
                      {JSON.stringify(log.metadata)}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] text-slate-400">{new Date(log.createdAt).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                  <div className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 ${log.actor?.role==="admin"?"bg-red-50 text-red-500":log.actor?.role==="lab_staff"?"bg-violet-50 text-violet-500":"bg-cyan-50 text-cyan-600"}`}>
                    {log.actor?.role||"system"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {data&&data.pages>1&&(
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="text-xs font-medium text-slate-500 disabled:opacity-40 hover:text-indigo-600">← Prev</button>
            <span className="text-xs text-slate-400">Page {page} of {data.pages} · {data.total} total</span>
            <button onClick={()=>setPage(p=>Math.min(data.pages,p+1))} disabled={page===data.pages} className="text-xs font-medium text-slate-500 disabled:opacity-40 hover:text-indigo-600">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
