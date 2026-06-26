import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { AdminMobileNav } from "@/components/site/MobileNav";
import {
  LayoutDashboard, Users, Building2, Briefcase, FileText,
  Search, BarChart3, Activity, LogOut, ChevronRight, Settings, Shield,
  Image, Globe, Bell, Star, Wrench, BarChart2, Layout, BookOpen, Mail,
  ShieldCheck, MessageSquare, Database, Inbox,
} from "lucide-react";
import { useEffect, useState } from "react";
import { clearSession, getCurrentUser, type AuthUser } from "@/lib/api";
import { logoUrl } from "@/lib/logo";
import { Preloader } from "@/components/site/Preloader";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    let user = getCurrentUser();
    if (!user) {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST", credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.accessToken && data?.user) {
            const { setSession } = await import("@/lib/api");
            setSession({ accessToken: data.accessToken, user: data.user });
            user = data.user;
          }
        }
      } catch {}
    }
    if (!user) throw redirect({ to: "/login" as any });
    if (user.role !== "admin" && user.role !== "lab_staff") throw redirect({ to: "/portal" as any });
  },
  component: AdminLayout,
});

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/admin",           label: "Dashboard",     icon: LayoutDashboard, exact: true, adminOnly: true },
      { to: "/admin/analytics", label: "Analytics",     icon: BarChart2,       exact: false, adminOnly: true },
      { to: "/admin/activity",  label: "Activity Log",  icon: Activity,        exact: false, adminOnly: true },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/admin/cases",    label: "Cases",            icon: Briefcase,      exact: false },
      { to: "/admin/messages", label: "Messages",         icon: MessageSquare,  exact: false },
      { to: "/admin/contact",  label: "Contact Enquiries", icon: Inbox,         exact: false, adminOnly: true },
      { to: "/admin/users",   label: "Users & Dentists", icon: Users,          exact: false, adminOnly: true },
      { to: "/admin/clinics", label: "Clinics",          icon: Building2,      exact: false, adminOnly: true },
      { to: "/admin/finance", label: "Finance Reports",  icon: BarChart3,      exact: false, adminOnly: true },
    ],
  },
  {
    label: "Website",
    items: [
      { to: "/admin/pages",   label: "Page Editor",    icon: Layout,    exact: false, adminOnly: true },
      { to: "/admin/posts",   label: "Blog Posts",     icon: BookOpen,  exact: false, adminOnly: true },
      { to: "/admin/media",   label: "Media Library",  icon: Image,     exact: false, adminOnly: true },
      { to: "/admin/content", label: "Content Keys",    icon: FileText,  exact: false, adminOnly: true },
      { to: "/admin/seo",     label: "SEO Manager",    icon: Search,    exact: false, adminOnly: true },
    ],
  },
  {
    label: "CMS",
    items: [
      { to: "/admin/services",      label: "Services",       icon: Wrench, exact: false, adminOnly: true },
      { to: "/admin/testimonials",  label: "Testimonials",   icon: Star,   exact: false, adminOnly: true },
      { to: "/admin/notifications", label: "Announcements",  icon: Bell,   exact: false, adminOnly: true },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/backups", label: "Backups", icon: Database, exact: false, adminOnly: true },
      { to: "/admin/settings", label: "Settings", icon: Settings, exact: false, adminOnly: true },
      { to: "/admin/roles", label: "Roles & Permissions", icon: ShieldCheck, exact: false, adminOnly: true },
      { to: "/admin/email-templates", label: "Email Templates", icon: Mail, exact: false, adminOnly: true },
    ],
  },
];

const ADMIN_ONLY_PATHS = ["/admin/analytics", "/admin/activity", "/admin/users", "/admin/clinics", "/admin/finance", "/admin/contact", "/admin/pages", "/admin/posts", "/admin/media", "/admin/content", "/admin/seo", "/admin/services", "/admin/testimonials", "/admin/notifications", "/admin/settings", "/admin/roles", "/admin/email-templates", "/admin/backups"];

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      navigate({ to: "/login" as any });
      return;
    }
    if (current.role !== "admin" && current.role !== "lab_staff") {
      navigate({ to: "/portal" as any });
      return;
    }
    // Redirect lab staff away from admin-only pages
    if (current.role === "lab_staff" && ADMIN_ONLY_PATHS.some(p => path === p || path.startsWith(p + "/"))) {
      navigate({ to: "/admin/cases" as any });
      return;
    }
    setUser(current);
    setChecking(false);
  }, [navigate, path]);

  // Inactivity auto-logout (10 minutes)
  useEffect(() => {
    const IDLE_MS = 10 * 60 * 1000;
    let timer: ReturnType<typeof setTimeout>;
    const logout = async () => {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
      clearSession();
      navigate({ to: "/login" as any });
    };
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(logout, IDLE_MS);
    };
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    timer = setTimeout(logout, IDLE_MS);
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [navigate]);

  if (checking) {
    return <Preloader />;
  }

  const initials = user?.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() ?? "";

  return (
    <div className="min-h-screen flex" style={{ background: "#f1f5f9" }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[240px] shrink-0 sticky top-0 h-screen flex-col overflow-hidden"
        style={{ background: "linear-gradient(175deg, #0f172a 0%, #1e293b 100%)" }}>

        {/* Glow */}
        <div className="absolute top-0 left-0 w-40 h-40 rounded-full pointer-events-none opacity-15"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)", transform: "translate(-50%, -50%)" }}/>

        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b border-white/8 relative">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logoUrl} alt="Prime Smiles" className="h-9 w-auto object-contain" />
            <div className="text-white/30 text-[9px] uppercase tracking-[0.15em] mt-0.5 self-end pb-0.5">{user?.role === "lab_staff" ? "Lab" : "Admin"}</div>
          </Link>
        </div>

        {/* User */}
        <div className="mx-3 mt-4 mb-2 rounded-xl p-3 flex items-center gap-2.5"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
            style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">{user?.name || "Admin"}</div>
            <div className="text-white/35 text-[9px] capitalize">{user?.role}</div>
          </div>
          <Settings size={12} className="text-white/25 shrink-0"/>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.15) transparent",
          }}>
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter(n => !n.adminOnly || user?.role === "admin");
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label}>
                <div className="px-2 mb-1">
                  <span className="text-white/20 text-[8px] uppercase tracking-[0.22em] font-semibold">{group.label}</span>
                </div>
                <div className="space-y-0.5">
                  {visibleItems.map((n) => {
                    const active = n.exact ? path === n.to : path.startsWith(n.to);
                    return (
                      <a key={n.to} href={n.to}
                        className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 relative
                          ${active ? "text-white" : "text-white/45 hover:text-white/80 hover:bg-white/5"}`}
                        style={active ? { background: "rgba(99,102,241,0.2)", borderLeft: "2px solid #6366f1" } : {}}>
                        <n.icon size={14} className={active ? "text-indigo-400" : ""}/>
                        <span className="flex-1">{n.label}</span>
                        {active && <ChevronRight size={11} className="text-indigo-400/60"/>}
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Dentist portal link */}
        <div className="px-3 py-2 border-t border-white/8">
          <Link to="/portal" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] text-white/30 hover:text-white/60 hover:bg-white/5 transition-all font-medium">
            <LayoutDashboard size={13}/> Dentist Portal
          </Link>
          <button
            onClick={async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {}); clearSession(); navigate({ to: "/" }); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] text-white/30 hover:text-white/60 hover:bg-white/5 transition-all font-medium">
            <LogOut size={13}/> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-x-hidden p-4 lg:p-7 pb-24 lg:pb-7">
        <Outlet />
      </main>
      <AdminMobileNav />
    </div>
  );
}
