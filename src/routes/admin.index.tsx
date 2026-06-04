import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch, clearSession } from "@/lib/api";
import { Briefcase, Users, Building2, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { getCurrentUser } = await import("@/lib/api");
    const user = getCurrentUser();
    if (user?.role === "lab_staff") {
      throw redirect({ to: "/admin/cases" as any });
    }
  },
  component: AdminDashboard,
});

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const STATUS_COLORS: Record<string, string> = {
  "Submitted": "#0aabbd", "In Production": "#6366f1", "Design Stage": "#8b5cf6",
  "Quality Control": "#f59e0b", "Dispatched": "#10b981", "Completed": "#64748b",
  "Awaiting Information": "#ef4444", "File Review": "#3b82f6",
};

function StatCard({ icon: Icon, value, label, sub, color, href }: any) {
  const card = (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.09)] transition-shadow flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={18} style={{ color }}/>
        </div>
        {href && <ArrowRight size={14} className="text-slate-300"/>}
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-800 leading-none">{value ?? "—"}</div>
        <div className="text-xs text-slate-500 font-medium mt-1">{label}</div>
      </div>
      {sub && <div className="text-[11px] text-slate-400">{sub}</div>}
    </div>
  );
  return href ? <Link to={href}>{card}</Link> : card;
}

function MiniBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }}/>
      <span className="text-slate-600 flex-1 truncate">{label}</span>
      <span className="font-semibold text-slate-700 w-6 text-right">{count}</span>
      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }}/>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/admin/stats").then(setStats).catch((e) => {
      if (e.message.includes("Authentication") || e.message.includes("Unauthorized")) {
        clearSession();
        redirect({ to: "/login" });
      } else {
        setError(e.message);
      }
    });
  }, []);

  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm">⚠️ {error}</div>;
  if (!stats) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-64 bg-white rounded-xl"/>
      <div className="grid grid-cols-4 gap-4">{[...Array(8)].map((_,i)=><div key={i} className="h-32 bg-white rounded-2xl"/>)}</div>
    </div>
  );

  const { cases, users, clinics, byStatus, recentActivity } = stats;
  const totalByStatus = Object.values(byStatus as Record<string,number>).reduce((a:number,b:number)=>a+b,0);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-indigo-500 font-semibold mb-1">Admin CMS</div>
        <h1 className="text-2xl font-bold text-slate-800">Overview Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} value={cases.total} label="Total Cases" sub={`+${cases.thisMonth} this month`} color="#6366f1" href="/admin/cases"/>
        <StatCard icon={TrendingUp} value={cases.active} label="Active Cases" sub="In progress" color="#0aabbd"/>
        <StatCard icon={AlertCircle} value={cases.awaitingInfo} label="Awaiting Info" sub="Need attention" color="#ef4444"/>
        <StatCard icon={CheckCircle2} value={cases.completed} label="Completed" sub="All time" color="#10b981"/>
        <StatCard icon={Users} value={users.total} label="Total Users" sub={`${users.dentists} dentists`} color="#8b5cf6" href="/admin/users"/>
        <StatCard icon={Users} value={users.dentists} label="Dentists" sub="Active accounts" color="#f59e0b"/>
        <StatCard icon={Building2} value={clinics.total} label="Clinics" sub="Registered" color="#3b82f6" href="/admin/clinics"/>
        <StatCard icon={Clock} value={cases.inProduction} label="In Production" sub="At the lab" color="#06b6d4"/>
      </div>

      {/* Middle row */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* Cases by status */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 text-sm">Cases by Status</h2>
            <Link to="/admin/cases" className="text-xs text-indigo-500 hover:underline">View all</Link>
          </div>
          <div className="space-y-2.5">
            {Object.entries(byStatus as Record<string,number>).sort(([,a],[,b])=>b-a).map(([status, count]) => (
              <MiniBar key={status} label={status} count={count} total={totalByStatus} color={STATUS_COLORS[status] ?? "#94a3b8"}/>
            ))}
          </div>
        </div>

        {/* Month growth */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          <h2 className="font-bold text-slate-800 text-sm mb-4">This Month</h2>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-4xl font-bold text-slate-800">{cases.thisMonth}</div>
              <div className="text-xs text-slate-500 mt-1">New cases submitted</div>
            </div>
            <div className={`flex flex-col items-end gap-1`}>
              <div className={`text-lg font-bold ${cases.monthGrowth >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {cases.monthGrowth >= 0 ? "+" : ""}{cases.monthGrowth}%
              </div>
              <div className="text-[10px] text-slate-400">vs last month</div>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {[
              ["Dispatched this month", cases.dispatched, "#10b981"],
              ["In Production", cases.inProduction, "#6366f1"],
              ["Awaiting Information", cases.awaitingInfo, "#ef4444"],
            ].map(([label, val, color]) => (
              <div key={label as string} className="flex justify-between text-xs">
                <span className="text-slate-500">{label as string}</span>
                <span className="font-semibold text-slate-700" style={{ color: color as string }}>{val as number}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          <h2 className="font-bold text-slate-800 text-sm mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { to: "/admin/users", label: "Create New User", color: "#6366f1" },
              { to: "/admin/clinics", label: "Add Clinic", color: "#0aabbd" },
              { to: "/admin/cases", label: "Manage Cases", color: "#f59e0b" },
              { to: "/admin/content", label: "Edit Page Content", color: "#10b981" },
              { to: "/admin/seo", label: "Update SEO", color: "#8b5cf6" },
              { to: "/admin/finance", label: "View Reports", color: "#3b82f6" },
            ].map((a) => (
              <Link key={a.to} to={a.to}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-sm text-slate-700 font-medium group">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: a.color }}/>
                  {a.label}
                </span>
                <ArrowRight size={13} className="text-slate-300 group-hover:text-slate-500 transition-colors"/>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Recent Activity</h2>
          <Link to="/admin/activity" className="text-xs text-indigo-500 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-slate-50">
          {recentActivity.slice(0, 10).map((log: any) => (
            <div key={log._id} className="px-6 py-3 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 text-[10px] font-bold text-indigo-600">
                {log.actor?.name?.charAt(0) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-700 truncate">
                  <span className="text-indigo-600">{log.actor?.name || "System"}</span>
                  {" · "}
                  <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{log.action}</span>
                </div>
                <div className="text-[11px] text-slate-400">{new Date(log.createdAt).toLocaleString("en-GB")}</div>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full capitalize shrink-0">{log.actor?.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
