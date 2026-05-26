import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { PortalMobileNav } from "@/components/site/MobileNav";
import { LayoutDashboard, FilePlus, Folder, MessageSquare, FileText, User, LogOut, Bell, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { clearSession, getCurrentUser, type AuthUser } from "@/lib/api";

export const Route = createFileRoute("/portal")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getCurrentUser()) {
      throw redirect({ to: "/login" as any });
    }
  },
  component: PortalLayout,
});

const NAV = [
  { to: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/portal/cases/new", label: "New Case", icon: FilePlus, exact: false },
  { to: "/portal/cases", label: "My Cases", icon: Folder, exact: false },
  { to: "/portal/messages", label: "Messages", icon: MessageSquare, exact: false },
  { to: "/portal/documents", label: "Documents", icon: FileText, exact: false },
  { to: "/portal/profile", label: "Profile", icon: User, exact: false },
];

function ToothIllustration() {
  return (
    <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="toothGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#0aabbd" stopOpacity="0.10"/>
        </linearGradient>
        <linearGradient id="toothShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35"/>
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.08"/>
          <stop offset="100%" stopColor="#0aabbd" stopOpacity="0.05"/>
        </linearGradient>
        <filter id="toothGlow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d="M20 38 C20 18 38 8 60 8 C82 8 100 18 100 38 C100 52 94 62 90 74 C86 86 84 100 80 114 C78 122 74 128 68 128 C62 128 60 120 60 114 C60 120 58 128 52 128 C46 128 42 122 40 114 C36 100 34 86 30 74 C26 62 20 52 20 38Z" fill="url(#toothShine)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
      <path d="M22 38 C22 20 39 10 60 10 C81 10 98 20 98 38 C98 51 92 61 88 73" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <ellipse cx="42" cy="30" rx="7" ry="10" fill="rgba(255,255,255,0.12)" transform="rotate(-15 42 30)"/>
      <path d="M38 58 C38 58 45 54 60 56 C75 58 82 54 82 54" stroke="rgba(10,171,189,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="60" cy="8" r="3" fill="rgba(10,171,189,0.6)" filter="url(#toothGlow)"/>
      <circle cx="20" cy="38" r="2" fill="rgba(255,255,255,0.3)"/>
      <circle cx="100" cy="38" r="2" fill="rgba(255,255,255,0.3)"/>
    </svg>
  );
}

function PortalLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => { setUser(getCurrentUser()); }, []);
  const initials = user?.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() ?? "";

  return (
    <div className="min-h-screen flex bg-[#f0f4f8]">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[260px] shrink-0 sticky top-0 h-screen flex-col overflow-hidden"
        style={{ background: "linear-gradient(175deg, #0d1e2c 0%, #0d2535 55%, #0a1e2e 100%)" }}>

        {/* Glow orbs */}
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #0aabbd 0%, transparent 70%)", transform: "translate(-40%, -40%)" }}/>
        <div className="absolute bottom-20 right-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #c9a227 0%, transparent 70%)", transform: "translate(40%, 0)" }}/>

        {/* Logo */}
        <div className="relative px-6 pt-5 pb-4 border-b border-white/8">
          <Link to="/">
            <img src="/Primesmile logo.png" alt="Prime Smiles" className="h-10 w-auto object-contain brightness-0 invert" />
          </Link>
        </div>

        {/* User card */}
        <div className="mx-4 mt-5 mb-3 rounded-xl p-3.5 flex items-center gap-3"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #0aabbd, #078a99)" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-semibold truncate">{user?.name || "Doctor"}</div>
            <div className="text-white/40 text-[10px] capitalize">{user?.role || "dentist"}</div>
          </div>
          <Bell size={14} className="text-white/30 shrink-0"/>
        </div>

        {/* Nav label */}
        <div className="px-5 mb-1.5">
          <span className="text-white/25 text-[9px] uppercase tracking-[0.2em] font-medium">Navigation</span>
        </div>

        {/* Nav items */}
        <nav className="px-3 flex-1 space-y-0.5">
          {NAV.map((n) => {
            const active = n.exact ? path === n.to : path === n.to || (path.startsWith(n.to + "/") && !path.startsWith(n.to + "/new"));
            return (
              <a key={n.to} href={n.to}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden
                  ${active
                    ? "text-white shadow-lg"
                    : "text-white/50 hover:text-white/90"
                  }`}
                style={active ? { background: "linear-gradient(90deg, rgba(10,171,189,0.25), rgba(10,171,189,0.08))", borderLeft: "2px solid #0aabbd" } : {}}>
                {!active && (
                  <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: "rgba(255,255,255,0.04)" }}/>
                )}
                <n.icon size={16} className={active ? "text-teal" : ""}/>
                <span className="flex-1">{n.label}</span>
                {active && <ChevronRight size={12} className="text-teal/60"/>}
              </a>
            );
          })}
        </nav>

        {/* Tooth illustration */}
        <div className="mx-auto w-24 h-28 opacity-15 pointer-events-none select-none">
          <ToothIllustration />
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-white/8">
          <button
            onClick={async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {}); clearSession(); navigate({ to: "/" }); }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium">
            <LogOut size={15}/>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="p-4 lg:p-9 pb-24 lg:pb-9 max-w-6xl">
          <Outlet />
        </div>
      </main>
      <PortalMobileNav />
    </div>
  );
}
