import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Menu, X, ChevronDown, Building2, Sparkles, Award, Globe,
  FlaskConical, Puzzle, Crown, Wrench, Monitor, Palette,
  Cpu, Printer, Box, ScanLine, Flame, ArrowRight,
} from "lucide-react";
import { logoUrl } from "@/lib/logo";

const NAV: { label: string; to?: string; items?: { label: string; to: string; icon: React.ElementType }[] }[] = [
  {
    label: "Facility",
    items: [
      { label: "About Us", to: "/about", icon: Building2 },
      { label: "Our Laboratory", to: "/about/our-laboratory", icon: Sparkles },
      { label: "Why Prime Smile", to: "/about/why-prime", icon: Award },
      { label: "Export Capability", to: "/about/export-capability", icon: Globe },
    ],
  },
  {
    label: "Lab Services",
    items: [
      { label: "Fixed Restorations", to: "/services/fixed-restorations", icon: Crown },
      { label: "Implant Prosthetics", to: "/services/implant-prosthetics", icon: Puzzle },
      { label: "Removable Prosthetics", to: "/services/removable-prosthetics", icon: Wrench },
      { label: "Metal Frameworks", to: "/services/metal-frameworks", icon: FlaskConical },
      { label: "Splints & Guards", to: "/services/splints-guards", icon: Monitor },
      { label: "Digital Design Support", to: "/services/digital-design", icon: Palette },
    ],
  },
  { label: "Digital Workflow", to: "/workflow" },
  {
    label: "Technology",
    items: [
      { label: "CAD/CAM Milling", to: "/technology/cad-cam-milling", icon: Cpu },
      { label: "SLM Metal Printing", to: "/technology/slm-metal-printing", icon: Printer },
      { label: "3D Printing", to: "/technology/3d-printing", icon: Box },
      { label: "Sintering & Firing", to: "/technology/sintering-ceramic-firing", icon: Flame },
      { label: "Scanning & Design", to: "/technology/scanning-design", icon: ScanLine },
      { label: "Finishing Equipment", to: "/technology/finishing-equipment", icon: Sparkles },
    ],
  },
  { label: "Quality & Compliance", to: "/quality" },
  { label: "Resources", to: "/resources" },
  { label: "Contact", to: "/contact" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-[0_10px_30px_rgba(2,8,23,.10)] border-b border-border-silver"
          : "bg-white/55 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div
        className={`h-[3px] w-full ${
          scrolled ? "bg-linear-to-r from-teal/70 via-gold/50 to-teal/70" : "bg-linear-to-r from-transparent via-white/25 to-transparent"
        }`}
      />
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoUrl} alt="Prime Smiles logo" className="h-10 w-auto object-contain" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <div
              key={n.label}
              className="relative"
              onMouseEnter={() => n.items && setOpen(n.label)}
              onMouseLeave={() => setOpen(null)}
            >
              {n.to ? (
                <Link
                  to={n.to}
                  className={`relative px-3 py-2 text-[13.5px] font-semibold rounded-full transition-all ${
                    scrolled
                      ? "text-text-slate hover:text-teal hover:bg-bg-soft"
                      : "text-text-slate hover:text-teal hover:bg-bg-soft"
                  }`}
                  activeProps={{
                    className: scrolled
                      ? "text-teal bg-bg-soft"
                      : "text-teal bg-bg-soft",
                  }}
                >
                  {n.label}
                  <span
                    className="pointer-events-none absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-teal/0 transition-all group-data-[status=active]:bg-teal"
                    aria-hidden="true"
                  />
                </Link>
              ) : (
                <button
                  className={`px-3 py-2 text-[13.5px] font-semibold inline-flex items-center gap-1.5 rounded-full transition-all ${
                    scrolled
                      ? "text-text-slate hover:text-teal hover:bg-bg-soft"
                      : "text-text-slate hover:text-teal hover:bg-bg-soft"
                  }`}
                  onFocus={() => setOpen(n.label)}
                >
                  {n.label} <ChevronDown size={14} />
                </button>
              )}
              {n.items && open === n.label && (
                <div className="absolute top-full left-0 pt-3 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="min-w-[280px] bg-white/95 backdrop-blur rounded-2xl shadow-[0_18px_55px_rgba(2,8,23,.18)] border border-border-silver overflow-hidden">
                    <div className="px-4 py-3 border-b border-border-silver">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-muted-grey">Explore</div>
                      <div className="text-sm font-semibold text-text-slate mt-0.5">{n.label}</div>
                    </div>
                    {n.items.map((it) => (
                      <Link
                        key={it.label}
                        to={it.to}
                        className="flex items-center gap-3 px-4 py-3 text-[13.5px] text-text-slate hover:bg-bg-soft hover:text-teal border-l-2 border-transparent hover:border-teal transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-teal/10 group-hover:text-teal transition-colors">
                          <it.icon size={16} />
                        </div>
                        <span className="font-medium">{it.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/portal/cases/new" className="btn-gold py-2! px-4! text-sm">Submit Case</Link>
          <Link to="/portal" className="btn-outline-teal py-2! px-4! text-sm">Dentist Portal</Link>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <Link to="/portal/cases/new" className="btn-gold py-1.5! px-3! text-xs">Submit</Link>
          <button
            className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 active:scale-95 transition"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>
        </div>
      </div>

      <MobileOverlay open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

/* ── Mobile overlay (portal to body, completely outside header) ── */
function MobileOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return createPortal(
    <div className="lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ zIndex: 2147483646 }}
      />
      {/* Panel */}
      <div
        className="fixed inset-0 bg-white flex flex-col"
        style={{ zIndex: 2147483647 }}
      >
        <div className="h-[3px] w-full bg-teal flex-none" />
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white flex-none">
          <Link to="/" onClick={onClose}>
            <img src={logoUrl} alt="Prime Smiles logo" className="h-9 w-auto object-contain" />
          </Link>
          <button
            className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 active:scale-95 transition"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          <MobileMenuContent onClose={onClose} />
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Mobile menu content ── */
function MobileMenuContent({ onClose }: { onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-1.5">
      {NAV.map((n) => {
        if (n.to) {
          return (
            <Link
              key={n.label}
              to={n.to}
              onClick={onClose}
              className="group flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold text-text-slate hover:bg-bg-soft hover:text-teal transition-colors"
            >
              <span>{n.label}</span>
              <ArrowRight size={14} className="text-slate-300 group-hover:text-teal group-hover:translate-x-1 transition-all" />
            </Link>
          );
        }

        const isOpen = expanded === n.label;
        return (
          <div key={n.label}>
            <button
              onClick={() => setExpanded(isOpen ? null : n.label)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold transition-colors ${
                isOpen ? "bg-bg-soft text-teal" : "text-text-slate hover:bg-bg-soft"
              }`}
            >
              <span>{n.label}</span>
              <div className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                <ChevronDown size={16} />
              </div>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="pl-2 pr-2 pb-2 pt-1 space-y-1">
                {n.items?.map((it) => (
                  <Link
                    key={it.label}
                    to={it.to}
                    onClick={onClose}
                    className="group flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-text-slate hover:bg-bg-soft hover:text-teal transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-teal/10 text-teal flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                      <it.icon size={17} />
                    </div>
                    <span className="font-medium">{it.label}</span>
                    <ArrowRight size={12} className="ml-auto text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-teal group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* CTA buttons */}
      <div className="pt-4 space-y-3">
        <Link
          to="/portal"
          onClick={onClose}
          className="btn-outline-teal w-full flex items-center justify-center gap-2"
        >
          Dentist Portal
        </Link>
        <Link
          to="/portal/cases/new"
          onClick={onClose}
          className="btn-gold w-full flex items-center justify-center gap-2"
        >
          Submit Case <ArrowRight size={16} />
        </Link>
      </div>

      {/* Tagline */}
      <div className="pt-6 text-center">
        <p className="text-[11px] text-muted-grey tracking-wider uppercase">
          Precision Craftsmanship · Delivered Digitally
        </p>
      </div>
    </div>
  );
}
