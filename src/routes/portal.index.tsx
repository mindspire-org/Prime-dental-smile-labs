import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plus, TrendingUp, Clock, CheckCircle2, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch, getCurrentUser, openRealtimeConnection, type AuthUser } from "@/lib/api";

export const Route = createFileRoute("/portal/")({
  component: PortalDashboard,
});

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Submitted":           { bg: "bg-cyan-50",   text: "text-cyan-700",   dot: "bg-cyan-400" },
  "Awaiting Information":{ bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400" },
  "In Production":       { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400" },
  "Dispatched":          { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-400" },
  "Completed":           { bg: "bg-slate-100", text: "text-slate-600",  dot: "bg-slate-400" },
  "Design Stage":        { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400" },
  "Quality Control":     { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
};
const defaultStatus = { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };

type DashboardCase = {
  _id: string; caseNumber: string; patientRef: string;
  services: string[]; createdAt: string; requestedCompletion?: string; status: string;
};

/* ── Dental SVG illustrations ──────────────────────────── */
function CrownIllustration() {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="crownG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c9a227"/>
          <stop offset="100%" stopColor="#a37e1a"/>
        </linearGradient>
        <linearGradient id="crownShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe47a" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#c9a227" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="crownBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0c850"/>
          <stop offset="100%" stopColor="#b8870f"/>
        </linearGradient>
      </defs>
      <path d="M14 52 L14 30 L22 40 L30 18 L40 42 L50 18 L58 40 L66 30 L66 52 Z" fill="url(#crownBody)" stroke="#a37e1a" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M14 52 Q40 58 66 52 L62 62 Q40 68 18 62 Z" fill="url(#crownG)" stroke="#8a6810" strokeWidth="1"/>
      <path d="M16 32 L22 40 L30 19" stroke="rgba(255,228,122,0.6)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M14 52 Q40 55 66 52" stroke="#ffe47a" strokeWidth="1" fill="none" strokeOpacity="0.5"/>
      <ellipse cx="40" cy="30" rx="10" ry="4" fill="url(#crownShine)" opacity="0.6"/>
    </svg>
  );
}

function ImplantIllustration() {
  return (
    <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="implantG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d4d8e0"/>
          <stop offset="40%" stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#9aa0ad"/>
        </linearGradient>
        <linearGradient id="implantTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8eaf0"/>
          <stop offset="100%" stopColor="#b0b6c4"/>
        </linearGradient>
      </defs>
      <rect x="28" y="8" width="24" height="16" rx="4" fill="url(#implantTop)" stroke="#9aa0ad" strokeWidth="1.2"/>
      <rect x="32" y="24" width="16" height="8" rx="2" fill="#c8cdd8" stroke="#9aa0ad" strokeWidth="1"/>
      <path d="M30 32 L50 32 L48 88 Q40 95 32 88 Z" fill="url(#implantG)" stroke="#9aa0ad" strokeWidth="1.2"/>
      <line x1="33" y1="40" x2="47" y2="40" stroke="#b0b6c4" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="33" y1="48" x2="47" y2="48" stroke="#b0b6c4" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="33" y1="56" x2="47" y2="56" stroke="#b0b6c4" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="33" y1="64" x2="47" y2="64" stroke="#b0b6c4" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="34" y1="72" x2="46" y2="72" stroke="#b0b6c4" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="35" y1="79" x2="45" y2="79" stroke="#b0b6c4" strokeWidth="1" strokeLinecap="round"/>
      <rect x="34" y="10" width="4" height="10" rx="1.5" fill="rgba(255,255,255,0.55)"/>
    </svg>
  );
}

function ToothSetIllustration() {
  return (
    <svg viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="tsgA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafb"/>
          <stop offset="100%" stopColor="#d8e4ee"/>
        </linearGradient>
        <linearGradient id="tsgB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#c8d8e8"/>
        </linearGradient>
        <filter id="tsShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0aabbd" floodOpacity="0.15"/>
        </filter>
      </defs>
      {/* Molar left */}
      <path d="M12 28 C12 14 20 8 32 8 C44 8 52 14 52 28 C52 36 49 42 47 50 C45 58 44 66 42 74 C41 78 39 82 36 82 C33 82 32 78 32 74 C32 78 31 82 28 82 C25 82 23 78 22 74 C20 66 19 58 17 50 C15 42 12 36 12 28Z" fill="url(#tsgA)" stroke="#b0c4d4" strokeWidth="1.5" filter="url(#tsShadow)"/>
      <path d="M32 8 C32 8 40 12 44 20" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M18 36 Q32 32 46 36" stroke="#0aabbd" strokeWidth="1" fill="none" strokeOpacity="0.4"/>
      {/* Incisor center */}
      <path d="M56 22 C56 12 62 6 72 6 C82 6 88 12 88 22 C88 30 85 38 83 48 C81 58 80 68 78 78 C77 82 75 86 72 86 C69 86 67 82 66 78 C64 68 63 58 61 48 C59 38 56 30 56 22Z" fill="url(#tsgB)" stroke="#b0c4d4" strokeWidth="1.5" filter="url(#tsShadow)"/>
      <path d="M72 6 C72 6 80 10 83 18" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Incisor right */}
      <path d="M92 22 C92 12 98 6 108 6 C118 6 124 12 124 22 C124 30 121 38 119 48 C117 58 116 68 114 78 C113 82 111 86 108 86 C105 86 103 82 102 78 C100 68 99 58 97 48 C95 38 92 30 92 22Z" fill="url(#tsgB)" stroke="#b0c4d4" strokeWidth="1.5" filter="url(#tsShadow)"/>
      <path d="M108 6 C108 6 116 10 119 18" stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Molar right */}
      <path d="M128 28 C128 14 136 8 148 8 C160 8 168 14 168 28 C168 36 165 42 163 50 C161 58 160 66 158 74 C157 78 155 82 152 82 C149 82 148 78 148 74 C148 78 147 82 144 82 C141 82 139 78 138 74 C136 66 135 58 133 50 C131 42 128 36 128 28Z" fill="url(#tsgA)" stroke="#b0c4d4" strokeWidth="1.5" filter="url(#tsShadow)"/>
      <path d="M148 8 C148 8 156 12 160 20" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M134 36 Q148 32 162 36" stroke="#0aabbd" strokeWidth="1" fill="none" strokeOpacity="0.4"/>
      {/* Teal accent dots */}
      <circle cx="32" cy="8" r="2.5" fill="#0aabbd" opacity="0.7"/>
      <circle cx="72" cy="6" r="2.5" fill="#0aabbd" opacity="0.7"/>
      <circle cx="108" cy="6" r="2.5" fill="#0aabbd" opacity="0.7"/>
      <circle cx="148" cy="8" r="2.5" fill="#0aabbd" opacity="0.7"/>
    </svg>
  );
}

function PortalDashboard() {
  const [data, setData] = useState<{ stats: any; recentCases: DashboardCase[] } | null>(null);
  const [error, setError] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [greeting, setGreeting] = useState("");
  const [dateStr, setDateStr] = useState("");

  async function load() {
    try { setData(await apiFetch("/api/dashboard")); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to load dashboard"); }
  }

  useEffect(() => {
    setUser(getCurrentUser());
    const now = new Date();
    const hour = now.getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");
    setDateStr(now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    load();
    const ws = openRealtimeConnection((event) => { if (event.type?.startsWith("case:")) load(); });
    return () => ws?.close();
  }, []);

  if (error) return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl text-sm">
      <span className="text-lg">⚠️</span> {error}
    </div>
  );

  if (!data) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-36 bg-white rounded-2xl"/>
      <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_,i) => <div key={i} className="h-28 bg-white rounded-2xl"/>)}</div>
    </div>
  );

  const STAT_CARDS = [
    { n: data.stats.totalCases,          l: "Total Cases",       sub: "All time",          icon: Activity,    bar: "#0aabbd, #078a99", light: "bg-cyan-50",   text: "text-cyan-600" },
    { n: data.stats.activeCases,         l: "Active Cases",      sub: "In progress",       icon: TrendingUp,  bar: "#6366f1, #4f46e5", light: "bg-violet-50", text: "text-violet-600" },
    { n: data.stats.awaitingAction,      l: "Awaiting Action",   sub: "Need your input",   icon: Clock,       bar: "#f59e0b, #d97706", light: "bg-amber-50",  text: "text-amber-600" },
    { n: data.stats.dispatchedThisMonth, l: "Dispatched",        sub: "This month",        icon: CheckCircle2,bar: "#10b981, #059669", light: "bg-emerald-50",text: "text-emerald-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero greeting card */}
      <div className="relative overflow-hidden rounded-2xl text-white"
        style={{ background: "linear-gradient(125deg, #0d1e2c 0%, #0d2d3f 60%, #0a2535 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 opacity-10 translate-x-20 -translate-y-20"
            style={{ background: "radial-gradient(circle, #0aabbd 0%, transparent 65%)" }}/>
          <div className="absolute bottom-0 left-40 w-60 h-60 opacity-8"
            style={{ background: "radial-gradient(circle, #c9a227 0%, transparent 65%)" }}/>
        </div>
        <div className="relative flex items-center gap-8 px-8 py-7">
          <div className="flex-1 min-w-0">
            <p className="text-white/50 text-sm mb-1">{dateStr}</p>
            <h1 className="text-2xl font-bold text-white leading-tight">{greeting}, <span className="text-teal">{user?.name?.split(" ")[0] || "Doctor"}</span> 👋</h1>
            <p className="text-white/45 text-sm mt-1.5">
              {data.stats.awaitingAction > 0
                ? `You have ${data.stats.awaitingAction} case${data.stats.awaitingAction > 1 ? "s" : ""} awaiting your attention.`
                : "All cases are up to date. Great work!"}
            </p>
            <Link to="/submit" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.03]"
              style={{ background: "linear-gradient(90deg, #0aabbd, #078a99)" }}>
              <Plus size={15}/> Submit New Case
            </Link>
          </div>
          <div className="w-44 h-20 shrink-0 hidden md:block opacity-90">
            <ToothSetIllustration />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.l} className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.09)] transition-shadow duration-300 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.light}`}>
                  <Icon size={18} className={s.text}/>
                </div>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{s.sub}</span>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-800 leading-none">{s.n ?? "—"}</div>
                <div className="text-xs text-slate-500 font-medium mt-1">{s.l}</div>
              </div>
              <div className="h-1 rounded-full overflow-hidden bg-slate-100">
                <div className="h-full rounded-full"
                  style={{ width: `${Math.min(100, ((s.n ?? 0) / Math.max(data.stats.totalCases, 1)) * 100)}%`, background: `linear-gradient(to right, ${s.bar})`, transition: "width 0.8s ease" }}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions + illustrations */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)] flex flex-col items-center text-center gap-3">
          <div className="w-20 h-20"><CrownIllustration /></div>
          <div>
            <div className="font-semibold text-slate-800 text-sm">Crown & Bridge</div>
            <div className="text-xs text-slate-400 mt-0.5">Premium ceramic restorations</div>
          </div>
          <Link to="/submit" className="text-xs text-teal font-semibold hover:underline inline-flex items-center gap-1">Order now <ArrowRight size={11}/></Link>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)] flex flex-col items-center text-center gap-3">
          <div className="w-16 h-20"><ImplantIllustration /></div>
          <div>
            <div className="font-semibold text-slate-800 text-sm">Implant Solutions</div>
            <div className="text-xs text-slate-400 mt-0.5">Titanium & zirconia abutments</div>
          </div>
          <Link to="/submit" className="text-xs text-teal font-semibold hover:underline inline-flex items-center gap-1">Order now <ArrowRight size={11}/></Link>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-teal font-semibold mb-1">Lab Status</div>
            <div className="font-semibold text-slate-800 mb-3">Current Turnaround</div>
          </div>
          <div className="space-y-2.5">
            {[["Crown & Bridge","5–7 days","bg-teal"],["Dentures","10–14 days","bg-amber-400"],["Implant Bar","7–10 days","bg-violet-400"]].map(([label, time, color]) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full shrink-0 ${color}`}/>
                <span className="text-slate-600 flex-1">{label}</span>
                <span className="font-semibold text-slate-700">{time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent cases */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Recent Cases</h2>
          <div className="flex gap-2">
            <select className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-medium focus:border-teal outline-none">
              <option>All Status</option><option>Active</option><option>Completed</option>
            </select>
            <select className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-medium focus:border-teal outline-none">
              <option>Last 30 days</option><option>Last 90 days</option>
            </select>
          </div>
        </div>

        {data.recentCases.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <div className="w-28 mx-auto mb-4 opacity-40"><ToothSetIllustration /></div>
            <div className="text-slate-500 font-medium">No cases yet</div>
            <div className="text-slate-400 text-sm mt-1">Submit your first case to get started.</div>
            <Link to="/submit" className="btn-teal mt-4 inline-flex">Submit a Case</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data.recentCases.map((c) => {
              const sc = STATUS_COLORS[c.status] ?? defaultStatus;
              return (
                <div key={c._id}
                  className="group bg-white rounded-2xl px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] transition-all duration-200 grid md:grid-cols-12 gap-3 items-center"
                  style={{ borderLeft: "3px solid #0aabbd" }}>
                  <div className="md:col-span-3">
                    <div className="font-mono font-bold text-sm text-slate-800">{c.caseNumber}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{c.patientRef}</div>
                  </div>
                  <div className="md:col-span-3 text-sm">
                    <div className="text-[9px] uppercase tracking-wider text-teal font-semibold mb-0.5">Service</div>
                    <div className="font-medium text-slate-700 text-sm">{c.services?.join(", ") || "Not specified"}</div>
                  </div>
                  <div className="md:col-span-2 text-xs text-slate-400 space-y-0.5">
                    <div>Sub: <span className="text-slate-600 font-medium">{new Date(c.createdAt).toLocaleDateString("en-GB")}</span></div>
                    <div>Due: <span className="text-slate-600 font-medium">{c.requestedCompletion ? new Date(c.requestedCompletion).toLocaleDateString("en-GB") : "—"}</span></div>
                  </div>
                  <div className="md:col-span-2">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}/>
                      {c.status}
                    </span>
                  </div>
                  <div className="md:col-span-2 md:text-right">
                    <Link to="/portal/cases/$id" params={{ id: c._id }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:text-teal-dark transition-colors group-hover:gap-2">
                      View Case <ArrowRight size={12}/>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
