import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { apiFetch, openRealtimeConnection, requestNotificationPermission, showNotification, createRealtimeEventHandler } from "@/lib/api";
import { Users, Eye, BarChart3, TrendingUp, AlertTriangle, Activity, Globe, ArrowUpRight, RefreshCw, Bell, BellOff } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/analytics")({ component: AdminAnalytics });

type RealtimeData = { activeConnections: number; recentPages: { path: string; views: number; visitors: number }[]; today: { views: number; cases: number; users: number } };
type PageviewData  = { daily: { date: string; views: number; visitors: number }[]; topPages: { path: string; views: number }[]; topReferrers: { referrer: string; count: number }[]; totals: { views: number; visitors: number; days: number } };
type SlaData       = { staleCases: any[]; threshold: number };
type FunnelData    = { submitPageViews: number; casesCreated: number; conversionRate: number };

function Stat({ label, value, icon: Icon, sub, color }: { label: string; value: string | number; icon: any; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white"/>
        </div>
        {sub && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{sub}</span>}
      </div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

function LiveDot() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
      <span className="text-xs text-emerald-600 font-semibold">Live</span>
    </span>
  );
}

function AdminAnalytics() {
  const [rt,     setRt]     = useState<RealtimeData | null>(null);
  const [pv,     setPv]     = useState<PageviewData  | null>(null);
  const [sla,    setSla]    = useState<SlaData        | null>(null);
  const [funnel, setFunnel] = useState<FunnelData     | null>(null);
  const [days,   setDays]   = useState(30);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const wsRef = useRef<any>(null);
  const eventHandlerRef = useRef<any>(null);

  async function loadAll(d = days) {
    const [rtData, pvData, slaData, funnelData] = await Promise.all([
      apiFetch<RealtimeData>("/api/admin/analytics/realtime"),
      apiFetch<PageviewData>(`/api/admin/analytics/pageviews?days=${d}`),
      apiFetch<SlaData>("/api/admin/analytics/sla"),
      apiFetch<FunnelData>(`/api/admin/analytics/funnel?days=${d}`),
    ]).catch(() => [null, null, null, null]) as any;
    if (rtData)     setRt(rtData);
    if (pvData)     setPv(pvData);
    if (slaData)    setSla(slaData);
    if (funnelData) setFunnel(funnelData);
  }

  const handleRealtimeEvent = (event: any) => {
    // Update data based on event type
    if (event.type === "case_update") {
      loadAll(); // Refresh all data when cases are updated
      if (notificationsEnabled) {
        showNotification("Case Updated", {
          body: `Case ${event.data.caseNumber || ''} has been ${event.action}`,
          tag: "case-update"
        });
      }
    } else if (event.type === "new_user") {
      loadAll();
      if (notificationsEnabled) {
        showNotification("New User Registered", {
          body: `${event.data.name} has joined the platform`,
          tag: "new-user"
        });
      }
    } else if (event.type === "system_notification") {
      if (notificationsEnabled) {
        showNotification("System Notification", {
          body: event.data.message,
          tag: "system"
        });
      }
    } else if (event.type === "activity_log") {
      // Refresh data for important activities
      if (event.data.action === "case.created" || event.data.action === "user.created") {
        loadAll();
      }
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        showNotification("Notifications Enabled", {
          body: "You will receive real-time notifications",
          tag: "settings"
        });
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  useEffect(() => {
    loadAll();
    
    // Set up event handler
    eventHandlerRef.current = createRealtimeEventHandler();
    eventHandlerRef.current.on("case_update", handleRealtimeEvent);
    eventHandlerRef.current.on("new_user", handleRealtimeEvent);
    eventHandlerRef.current.on("system_notification", handleRealtimeEvent);
    eventHandlerRef.current.on("activity_log", handleRealtimeEvent);
    
    // Set up WebSocket connection
    wsRef.current = openRealtimeConnection((event) => {
      if (eventHandlerRef.current) {
        eventHandlerRef.current.handle(event);
      }
    });
    
    // Subscribe to relevant events
    if (wsRef.current) {
      wsRef.current.subscribe(["case_update", "new_user", "system_notification", "activity_log"]);
    }
    
    // Fallback polling for real-time data
    const interval = setInterval(() => {
      apiFetch<RealtimeData>("/api/admin/analytics/realtime").then(setRt).catch(()=>{});
    }, 15000);
    
    return () => { 
      clearInterval(interval); 
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [notificationsEnabled]);

  useEffect(() => { loadAll(days); }, [days]);

  const dailyChart = pv?.daily.map(d => ({ ...d, date: new Date(d.date).toLocaleDateString("en-GB", { day:"numeric", month:"short" }) })) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
          <p className="text-sm text-slate-400 mt-0.5">Real-time tracking and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveDot />
          <button
            onClick={toggleNotifications}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
              notificationsEnabled 
                ? "bg-indigo-50 border-indigo-200 text-indigo-600" 
                : "bg-white border-slate-200 text-slate-500 hover:text-indigo-600"
            }`}
            title={notificationsEnabled ? "Notifications enabled" : "Enable notifications"}
          >
            {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            <span className="text-sm font-medium">
              {notificationsEnabled ? "On" : "Off"}
            </span>
          </button>
          <select value={days} onChange={e => setDays(Number(e.target.value))}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={() => loadAll()} className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 transition-colors">
            <RefreshCw size={16}/>
          </button>
        </div>
      </div>

      {/* SLA alerts */}
      {(sla?.staleCases.length ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0"/>
          <span className="text-sm font-semibold text-amber-800">
            {sla!.staleCases.length} case{sla!.staleCases.length > 1 ? "s" : ""} breaching {sla!.threshold}-day SLA — check the Cases page
          </span>
        </div>
      )}

      {/* Live stats */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Right Now</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Active connections" value={rt?.activeConnections ?? "—"} icon={Activity} color="bg-indigo-500"/>
          <Stat label="Page views today"   value={rt?.today.views ?? "—"}    icon={Eye}       color="bg-teal-500"/>
          <Stat label="Cases today"        value={rt?.today.cases ?? "—"}    icon={BarChart3} color="bg-violet-500"/>
          <Stat label="New users today"    value={rt?.today.users ?? "—"}    icon={Users}     color="bg-emerald-500"/>
        </div>
      </div>

      {/* Period stats */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Last {days} Days</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Total page views"  value={pv?.totals.views.toLocaleString() ?? "—"}    icon={Eye}        color="bg-blue-500"/>
          <Stat label="Unique visitors"   value={pv?.totals.visitors.toLocaleString() ?? "—"} icon={Users}      color="bg-cyan-500"/>
          <Stat label="Form submissions"  value={funnel?.casesCreated ?? "—"}                 icon={TrendingUp} color="bg-orange-500"/>
          <Stat label="Conversion rate"   value={funnel ? `${funnel.conversionRate}%` : "—"}  icon={ArrowUpRight} color="bg-pink-500" sub={funnel ? `${funnel.submitPageViews} visits` : undefined}/>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Page views over time */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-bold text-slate-800 mb-4">Page Views &amp; Visitors</h2>
          {dailyChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyChart}>
                <defs>
                  <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0aabbd" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#0aabbd" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false}/>
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false}/>
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}/>
                <Area type="monotone" dataKey="views"    stroke="#6366f1" strokeWidth={2} fill="url(#gViews)"    name="Views"/>
                <Area type="monotone" dataKey="visitors" stroke="#0aabbd" strokeWidth={2} fill="url(#gVisitors)" name="Visitors"/>
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="h-[220px] flex items-center justify-center text-slate-300 text-sm">No data yet</div>}
        </div>

        {/* Top pages */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-bold text-slate-800 mb-4">Top Pages</h2>
          {(pv?.topPages.length ?? 0) > 0 ? (
            <div className="space-y-2">
              {pv!.topPages.map((p, i) => {
                const pct = Math.round((p.views / pv!.topPages[0].views) * 100);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">{p.path}</div>
                      <div className="mt-0.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }}/>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-500 tabular-nums shrink-0">{p.views.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          ) : <div className="h-32 flex items-center justify-center text-slate-300 text-sm">No data yet</div>}
        </div>
      </div>

      {/* Live pages + referrers */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Current page activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">Active Pages (last 5 min)</h2>
            <LiveDot/>
          </div>
          {(rt?.recentPages.length ?? 0) > 0 ? (
            <div className="space-y-2">
              {rt!.recentPages.map((p, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <Globe size={13} className="text-slate-300 shrink-0"/>
                  <span className="flex-1 text-sm text-slate-600 truncate font-mono">{p.path}</span>
                  <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">{p.visitors} visitor{p.visitors !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          ) : <div className="text-slate-300 text-sm text-center py-8">No active pages</div>}
        </div>

        {/* Referrers */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h2 className="font-bold text-slate-800 mb-4">Top Referrers</h2>
          {(pv?.topReferrers.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pv!.topReferrers.slice(0, 6)} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false}/>
                <YAxis type="category" dataKey="referrer" tick={{ fontSize: 10 }} tickLine={false} width={120}/>
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}/>
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Visits"/>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-32 flex items-center justify-center text-slate-300 text-sm">No referrers yet</div>}
        </div>
      </div>

      {/* SLA table */}
      {(sla?.staleCases.length ?? 0) > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500"/>
            SLA Breaches ({sla!.staleCases.length})
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="pb-2 text-left">Case</th>
                <th className="pb-2 text-left">Patient</th>
                <th className="pb-2 text-left">Status</th>
                <th className="pb-2 text-left">Dentist</th>
                <th className="pb-2 text-left">Last Update</th>
              </tr>
            </thead>
            <tbody>
              {sla!.staleCases.map((c) => (
                <tr key={c._id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 font-mono text-indigo-700">{c.caseNumber}</td>
                  <td className="py-2 text-slate-600">{c.patientRef}</td>
                  <td className="py-2"><span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">{c.status}</span></td>
                  <td className="py-2 text-slate-500">{c.dentist?.name}</td>
                  <td className="py-2 text-slate-400">{new Date(c.updatedAt).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
