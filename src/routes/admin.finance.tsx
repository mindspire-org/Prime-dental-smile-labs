import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { TrendingUp, Award, Building2 } from "lucide-react";

export const Route = createFileRoute("/admin/finance")({
  component: AdminFinance,
});

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const STATUS_COLORS: Record<string,string> = {
  "Submitted":"#0aabbd","In Production":"#6366f1","Design Stage":"#8b5cf6",
  "Quality Control":"#f59e0b","Dispatched":"#10b981","Completed":"#64748b",
  "Awaiting Information":"#ef4444","File Review":"#3b82f6","Finishing":"#06b6d4",
  "Dentist Approval":"#8b5cf6","Ready for Dispatch":"#22c55e",
};

function AdminFinance() {
  const [data,setData]=useState<any>(null);
  const [months,setMonths]=useState(6);
  const [error,setError]=useState("");

  useEffect(()=>{
    apiFetch(`/api/admin/finance?months=${months}`).then(setData).catch(e=>setError(e.message));
  },[months]);

  if(error) return <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm">⚠️ {error}</div>;
  if(!data) return <div className="space-y-4 animate-pulse">{[...Array(3)].map((_,i)=><div key={i} className="h-40 bg-white rounded-2xl"/>)}</div>;

  const maxCount=Math.max(...(data.monthlyCases.map((m:any)=>m.count)||[1]),1);
  const totalStatus=data.statusBreakdown.reduce((a:number,b:any)=>a+b.count,0);
  const totalUrgency=data.urgencyBreakdown.reduce((a:number,b:any)=>a+b.count,0);

  return(
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-indigo-500 font-semibold mb-1">Analytics</div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Finance</h1>
        </div>
        <select value={months} onChange={e=>setMonths(Number(e.target.value))}
          className="text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none focus:border-indigo-400">
          <option value={3}>Last 3 months</option>
          <option value={6}>Last 6 months</option>
          <option value={12}>Last 12 months</option>
        </select>
      </div>

      {/* Monthly volume chart */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
        <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-indigo-400 inline-block"/>
          Monthly Case Volume
        </h2>
        {data.monthlyCases.length===0?(
          <div className="h-32 flex items-center justify-center text-slate-400 text-sm">No data for this period</div>
        ):(
          <div className="flex items-end gap-2 h-40">
            {data.monthlyCases.map((m:any)=>{
              const pct=Math.round((m.count/maxCount)*100);
              const label=`${MONTH_NAMES[(m._id.m||1)-1]} '${String(m._id.y||0).slice(2)}`;
              return(
                <div key={`${m._id.y}-${m._id.m}`} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">{m.count}</div>
                  <div className="w-full rounded-t-lg transition-all duration-500 min-h-[4px]"
                    style={{height:`${Math.max(pct,4)}%`,background:"linear-gradient(to top,#6366f1,#818cf8)"}}/>
                  <div className="text-[9px] text-slate-400 font-medium whitespace-nowrap">{label}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Status breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          <h2 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-indigo-400 inline-block"/>
            Cases by Status
          </h2>
          <div className="space-y-2.5">
            {data.statusBreakdown.sort((a:any,b:any)=>b.count-a.count).map((s:any)=>{
              const pct=totalStatus>0?Math.round((s.count/totalStatus)*100):0;
              const color=STATUS_COLORS[s._id]??"#94a3b8";
              return(
                <div key={s._id} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{background:color}}/>
                  <span className="text-slate-600 flex-1 truncate text-[11px]">{s._id}</span>
                  <span className="font-bold text-slate-700 w-6 text-right">{s.count}</span>
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${pct}%`,background:color}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Urgency breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          <h2 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-amber-400 inline-block"/>
            Cases by Urgency
          </h2>
          <div className="space-y-3">
            {data.urgencyBreakdown.map((u:any)=>{
              const pct=totalUrgency>0?Math.round((u.count/totalUrgency)*100):0;
              const color=u._id==="Urgent"?"#ef4444":u._id==="Express"?"#f59e0b":"#10b981";
              return(
                <div key={u._id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-600">{u._id||"Unknown"}</span>
                    <span className="font-bold" style={{color}}>{u.count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{width:`${pct}%`,background:color}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top dentists */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          <h2 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-emerald-400 inline-block"/>
            Top Dentists
          </h2>
          <div className="space-y-2">
            {data.topDentists.slice(0,8).map((d:any,i:number)=>(
              <div key={d._id} className="flex items-center gap-3 py-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${i===0?"bg-amber-400":i===1?"bg-slate-400":i===2?"bg-orange-400":"bg-indigo-200"}`}>
                  {i<3?<Award size={11}/>:i+1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-700 truncate">{d.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{d.email}</div>
                </div>
                <span className="text-sm font-bold text-indigo-600 shrink-0">{d.count}</span>
              </div>
            ))}
            {data.topDentists.length===0&&<div className="text-sm text-slate-400 py-4 text-center">No data</div>}
          </div>
        </div>

        {/* Top clinics */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)] md:col-span-2 xl:col-span-3">
          <h2 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-cyan-400 inline-block"/>
            Top Clinics by Case Volume
          </h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
            {data.topClinics.slice(0,10).map((c:any,i:number)=>(
              <div key={c._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <Building2 size={14} className="text-indigo-500"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-700 truncate">{c.name}</div>
                  <div className="text-[10px] text-slate-400">{c.city||"—"}</div>
                </div>
                <span className="text-sm font-bold text-indigo-600 shrink-0">#{i+1}</span>
              </div>
            ))}
            {data.topClinics.length===0&&<div className="col-span-5 text-sm text-slate-400 py-4 text-center">No clinic data</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
