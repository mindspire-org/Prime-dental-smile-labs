import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Cpu, Printer, Box, ScanLine, Flame, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_marketing/technology")({
  component: TechLayout,
});

const TECH_NAV = [
  { label: "Overview", to: "/technology", icon: Cpu },
  { label: "CAD/CAM Milling", to: "/technology/cad-cam-milling", icon: Cpu },
  { label: "SLM Metal Printing", to: "/technology/slm-metal-printing", icon: Printer },
  { label: "3D Printing", to: "/technology/3d-printing", icon: Box },
  { label: "Sintering & Firing", to: "/technology/sintering-ceramic-firing", icon: Flame },
  { label: "Scanning & Design", to: "/technology/scanning-design", icon: ScanLine },
  { label: "Finishing Equipment", to: "/technology/finishing-equipment", icon: Sparkles },
];

function TechLayout() {
  const { pathname } = useRouterState({ select: (s) => s.location });
  return (
    <div>
      <div className="bg-white border-b border-border-silver">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0 py-3">
            {TECH_NAV.map((item) => {
              const isActive = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive ? "bg-teal text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <item.icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
