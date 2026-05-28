import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, Users, Building2, Briefcase, CalendarDays, Printer,
  Award, ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/admin/finance")({
  component: AdminFinance,
});

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const STATUS_COLORS: Record<string, string> = {
  "Submitted":"#0aabbd","In Production":"#6366f1","Design Stage":"#8b5cf6",
  "Quality Control":"#f59e0b","Dispatched":"#10b981","Completed":"#64748b",
  "Awaiting Information":"#ef4444","File Review":"#3b82f6","Finishing":"#06b6d4",
  "Dentist Approval":"#8b5cf6","Ready for Dispatch":"#22c55e",
};

const PIE_COLORS = ["#6366f1","#0aabbd","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#64748b"];

function fmtDate(d: string | Date) {
  const date = new Date(d);
  return date.toISOString().split("T")[0];
}

function AdminFinance() {
  const [data, setData] = useState<any>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");
  const [printing, setPrinting] = useState(false);

  const today = useMemo(() => fmtDate(new Date()), []);
  const defaultFrom = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return fmtDate(d);
  }, []);

  useEffect(() => {
    if (!from) setFrom(defaultFrom);
    if (!to) setTo(today);
  }, [defaultFrom, today]);

  useEffect(() => {
    if (!from || !to) return;
    apiFetch(`/api/admin/finance?from=${from}&to=${to}`).then(setData).catch(e => setError(e.message));
  }, [from, to]);

  function handlePrint() {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 300);
  }

  function handleQuickRange(months: number) {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    setFrom(fmtDate(d));
    setTo(today);
  }

  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm">⚠️ {error}</div>;
  if (!data) return (
    <div className="space-y-4 animate-pulse">
      {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl" />)}
    </div>
  );

  const totalStatus = data.statusBreakdown.reduce((a: number, b: any) => a + b.count, 0);
  const totalUrgency = data.urgencyBreakdown.reduce((a: number, b: any) => a + b.count, 0);

  const chartData = data.monthlyCases.map((m: any) => ({
    label: `${MONTH_NAMES[(m._id.m || 1) - 1]} ${m._id.y}`,
    count: m.count,
  }));

  const statusPie = data.statusBreakdown
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 7)
    .map((s: any, i: number) => ({
      name: s._id,
      value: s.count,
      color: STATUS_COLORS[s._id] || PIE_COLORS[i % PIE_COLORS.length],
    }));

  const urgencyPie = data.urgencyBreakdown.map((u: any) => ({
    name: u._id || "Unknown",
    value: u.count,
    color: u._id === "Urgent" ? "#ef4444" : u._id === "Express" ? "#f59e0b" : "#10b981",
  }));

  return (
    <div className={`space-y-6 ${printing ? "print-only" : ""}`}>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .print-card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-indigo-500 font-semibold mb-1">Analytics</div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Finance</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick ranges */}
          <div className="flex bg-white rounded-xl border border-slate-200 overflow-hidden">
            {[3, 6, 12].map(m => (
              <button key={m} onClick={() => handleQuickRange(m)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${from === defaultFrom && m === 6 ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"}`}>
                {m}M
              </button>
            ))}
          </div>
          {/* Date inputs */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <CalendarDays size={14} className="text-slate-400" />
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="text-xs text-slate-700 outline-none bg-transparent" />
            <span className="text-slate-300">→</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="text-xs text-slate-700 outline-none bg-transparent" />
          </div>
          <button onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors">
            <Printer size={13} /> Print / PDF
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Cases", value: data.totalCases || 0, icon: Briefcase, color: "bg-indigo-500", trend: data.monthlyCases.slice(-1)[0]?.count || 0 },
          { label: "Active Dentists", value: data.totalDentists || 0, icon: Users, color: "bg-teal-500", trend: data.topDentists.length },
          { label: "Clinics", value: data.totalClinics || 0, icon: Building2, color: "bg-amber-500", trend: data.topClinics.length },
          { label: "Monthly Avg", value: data.monthlyCases.length > 0 ? Math.round(data.totalCases / data.monthlyCases.length) : 0, icon: TrendingUp, color: "bg-emerald-500", trend: null },
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
            {card.trend !== null && (
              <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-600 font-medium">
                <ArrowUpRight size={11} /> {card.trend} this period
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Monthly bar chart */}
        <div className="lg:col-span-2 print-card bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-indigo-500 inline-block" />
              Monthly Case Volume
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">{from} → {to}</span>
          </div>
          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12 }}
                  cursor={{ fill: "#f8fafc" }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status donut */}
        <div className="print-card bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          <h2 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-violet-500 inline-block" />
            Status Distribution
          </h2>
          {statusPie.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusPie} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {statusPie.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {statusPie.map((s: any) => (
                  <div key={s.name} className="flex items-center gap-2 text-[11px]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-slate-600 flex-1 truncate">{s.name}</span>
                    <span className="font-bold text-slate-700">{s.value}</span>
                    <span className="text-slate-400">({totalStatus > 0 ? Math.round((s.value / totalStatus) * 100) : 0}%)</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Second charts row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Urgency bar */}
        <div className="print-card bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          <h2 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-amber-500 inline-block" />
            Cases by Urgency
          </h2>
          <div className="space-y-3">
            {data.urgencyBreakdown.map((u: any) => {
              const pct = totalUrgency > 0 ? Math.round((u.count / totalUrgency) * 100) : 0;
              const color = u._id === "Urgent" ? "#ef4444" : u._id === "Express" ? "#f59e0b" : "#10b981";
              return (
                <div key={u._id || "unknown"}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-600">{u._id || "Unknown"}</span>
                    <span className="font-bold" style={{ color }}>{u.count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
            {data.urgencyBreakdown.length === 0 && <div className="text-sm text-slate-400 py-4 text-center">No data</div>}
          </div>
        </div>

        {/* Top dentists */}
        <div className="print-card bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          <h2 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-emerald-500 inline-block" />
            Top Dentists
          </h2>
          <div className="space-y-2">
            {data.topDentists.slice(0, 8).map((d: any, i: number) => (
              <div key={d._id} className="flex items-center gap-3 py-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-orange-400" : "bg-indigo-200 text-indigo-700"}`}>
                  {i < 3 ? <Award size={11} /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-700 truncate">{d.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{d.email}</div>
                </div>
                <span className="text-sm font-bold text-indigo-600 shrink-0">{d.count}</span>
              </div>
            ))}
            {data.topDentists.length === 0 && <div className="text-sm text-slate-400 py-4 text-center">No data</div>}
          </div>
        </div>

        {/* Top clinics */}
        <div className="print-card bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          <h2 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-cyan-500 inline-block" />
            Top Clinics
          </h2>
          <div className="space-y-2">
            {data.topClinics.slice(0, 8).map((c: any, i: number) => (
              <div key={c._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 text-[10px] font-bold text-indigo-500">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-700 truncate">{c.name}</div>
                  <div className="text-[10px] text-slate-400">{c.city || "—"}</div>
                </div>
                <span className="text-sm font-bold text-indigo-600 shrink-0">{c.count}</span>
              </div>
            ))}
            {data.topClinics.length === 0 && <div className="text-sm text-slate-400 py-4 text-center">No clinic data</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
