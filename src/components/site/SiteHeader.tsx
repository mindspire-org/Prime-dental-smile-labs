import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { logoUrl } from "@/lib/logo";

const NAV: { label: string; to?: string; items?: { label: string; to: string }[] }[] = [
  {
    label: "Facility",
    items: [
      { label: "About Us", to: "/about" },
      { label: "Our Laboratory", to: "/about" },
      { label: "Why Prime Smile", to: "/about" },
    ],
  },
  {
    label: "Lab Services",
    items: [
      { label: "Fixed Restorations", to: "/services/fixed-restorations" },
      { label: "Implant Prosthetics", to: "/services/implant-prosthetics" },
      { label: "Removable Prosthetics", to: "/services/removable-prosthetics" },
      { label: "Metal Frameworks", to: "/services/metal-frameworks" },
      { label: "Splints & Guards", to: "/services/splints-guards" },
      { label: "Digital Design Support", to: "/services/digital-design" },
    ],
  },
  { label: "Digital Workflow", to: "/workflow" },
  { label: "Technology", to: "/technology" },
  { label: "Quality & Compliance", to: "/quality" },
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
                        className="block px-4 py-3 text-[13.5px] text-text-slate hover:bg-bg-soft hover:text-teal border-l-2 border-transparent hover:border-teal transition-all"
                      >
                        {it.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/submit" className="btn-gold py-2! px-4! text-sm">Submit Case</Link>
          <Link to="/portal" className="btn-outline-teal py-2! px-4! text-sm">Dentist Portal</Link>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <Link to="/submit" className="btn-gold py-1.5! px-3! text-xs">Submit</Link>
          <button
            className={`h-10 w-10 inline-flex items-center justify-center rounded-xl transition ${
              scrolled ? "bg-bg-soft text-text-slate" : "bg-bg-soft text-text-slate"
            }`}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-navy/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-[380px] bg-white shadow-[0_18px_60px_rgba(2,8,23,.25)] overflow-y-auto">
            <div className="p-5 border-b border-border-silver flex items-center justify-between">
              <Link to="/" onClick={() => setMobileOpen(false)}>
                <img src={logoUrl} alt="Prime Smiles logo" className="h-9 w-auto object-contain" />
              </Link>
              <button
                className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-bg-soft text-text-slate"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X />
              </button>
            </div>

            <div className="p-5">
              <div className="grid gap-2">
                {NAV.map((n) =>
                  n.to ? (
                    <Link
                      key={n.label}
                      to={n.to}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 rounded-xl font-semibold text-text-slate hover:bg-bg-soft transition"
                    >
                      {n.label}
                    </Link>
                  ) : (
                    <div key={n.label} className="rounded-2xl border border-border-silver overflow-hidden">
                      <div className="px-4 py-3 bg-bg-soft">
                        <div className="text-[11px] uppercase tracking-[0.16em] text-muted-grey">{n.label}</div>
                      </div>
                      <div className="p-2">
                        {n.items?.map((it) => (
                          <Link
                            key={it.label}
                            to={it.to}
                            onClick={() => setMobileOpen(false)}
                            className="block px-3 py-2.5 rounded-xl text-sm text-text-slate hover:bg-bg-soft hover:text-teal transition"
                          >
                            {it.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="mt-5 grid gap-3">
                <Link to="/portal" onClick={() => setMobileOpen(false)} className="btn-outline-teal w-full">
                  Dentist Portal
                </Link>
                <Link to="/submit" onClick={() => setMobileOpen(false)} className="btn-gold w-full">
                  Submit Case
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
