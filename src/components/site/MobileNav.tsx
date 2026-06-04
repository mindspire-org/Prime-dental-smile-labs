import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Layers, Cpu, PhoneCall, User, FilePlus, Folder, MessageSquare, LayoutDashboard, FileText, Settings, Briefcase, Users, Database } from "lucide-react";
import { getCurrentUser } from "@/lib/api";

/* ── Marketing bottom nav ─────────────────────────────── */
const MARKETING_TABS = [
  { to: "/",           label: "Home",      icon: Home       },
  { to: "/services",   label: "Services",  icon: Layers     },
  { to: "/technology", label: "Tech",      icon: Cpu        },
  { to: "/portal",     label: "Portal",    icon: User       },
  { to: "/contact",    label: "Contact",   icon: PhoneCall  },
];

/* ── Portal bottom nav ────────────────────────────────── */
const PORTAL_TABS = [
  { to: "/portal",           label: "Home",     icon: LayoutDashboard, exact: true  },
  { to: "/portal/cases/new", label: "New Case", icon: FilePlus,        exact: true  },
  { to: "/portal/cases",     label: "Cases",    icon: Folder,          exact: false, exclude: "/portal/cases/new" },
  { to: "/portal/messages",  label: "Messages", icon: MessageSquare,   exact: false },
  { to: "/portal/profile",   label: "Profile",  icon: User,            exact: false },
];

/* ── Admin bottom nav ─────────────────────────────────── */
const ADMIN_TABS = [
  { to: "/admin",          label: "Dashboard", icon: LayoutDashboard, exact: true,  adminOnly: true },
  { to: "/admin/cases",    label: "Cases",     icon: Briefcase,       exact: false },
  { to: "/admin/messages", label: "Messages",  icon: MessageSquare,   exact: false },
  { to: "/admin/users",    label: "Users",     icon: Users,           exact: false, adminOnly: true },
  { to: "/admin/backups",  label: "Backups",   icon: Database,        exact: false, adminOnly: true },
  { to: "/admin/settings", label: "Settings",  icon: Settings,        exact: false, adminOnly: true },
];

type Tab = { to: string; label: string; icon: React.ElementType; exact?: boolean; exclude?: string; adminOnly?: boolean };

function BottomNav({ tabs, accent = "#0aabbd" }: { tabs: Tab[]; accent?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-60 flex items-stretch"
      style={{
        background: "rgba(8, 16, 28, 0.82)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.35)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px]"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${accent}88 30%, ${accent} 50%, ${accent}88 70%, transparent 100%)` }}
      />

      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.exact
          ? path === tab.to
          : path === tab.to || (path.startsWith(tab.to + "/") && (!tab.exclude || !path.startsWith(tab.exclude)));

        return (
          <Link
            key={tab.to}
            to={tab.to as any}
            className="relative flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 group transition-all duration-200 active:scale-95"
          >
            {/* Active pill bg */}
            {active && (
              <span
                className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl"
                style={{ background: `${accent}18` }}
              />
            )}

            {/* Active top dot */}
            {active && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full"
                style={{ background: accent }}
              />
            )}

            <Icon
              size={active ? 20 : 18}
              className="relative z-10 transition-all duration-200"
              style={{ color: active ? accent : "rgba(255,255,255,0.38)", strokeWidth: active ? 2.2 : 1.8 }}
            />
            <span
              className="relative z-10 text-[9.5px] font-semibold tracking-wide transition-all duration-200 leading-none"
              style={{ color: active ? accent : "rgba(255,255,255,0.35)" }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MarketingMobileNav() {
  return <BottomNav tabs={MARKETING_TABS} accent="#0aabbd" />;
}

export function PortalMobileNav() {
  return <BottomNav tabs={PORTAL_TABS} accent="#0aabbd" />;
}

export function AdminMobileNav() {
  const user = getCurrentUser();
  const tabs = ADMIN_TABS.filter(t => !t.adminOnly || user?.role === "admin");
  return <BottomNav tabs={tabs} accent="#6366f1" />;
}
