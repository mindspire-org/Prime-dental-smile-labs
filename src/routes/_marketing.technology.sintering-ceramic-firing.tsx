import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import { PageBlocks } from "@/components/site/PageBlocks";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_marketing/technology/sintering-ceramic-firing")({
  head: () => ({
    meta: [
      { title: "Sintering & Ceramic Firing — Prime Smile Dental Laboratory" },
      { name: "description", content: "Zirconia sintering, e.max firing and ceramic glazing with validated temperature protocols." },
    ],
    links: [{ rel: "canonical", href: "https://primesmiles.eu/technology/sintering-ceramic-firing" }],
  }),
  component: Page,
});

const MACHINES = [
  {
    name: "Teknik Dental TDSS P200 Sintering Furnace",
    type: "Zirconia Sintering",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80&auto=format&fit=crop",
    desc: "High-temperature sintering furnace with programmable ramp rates for consistent zirconia crystallization.",
    materials: ["Zirconia", "Alumina"],
    services: ["Zirconia crowns", "Zirconia bridges", "Zirconia abutments", "Full-arch zirconia"],
  },
  {
    name: "Ivoclar Programat P300 Ceramic Furnace",
    type: "Ceramic Firing",
    image: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=800&q=80&auto=format&fit=crop",
    desc: "Precision ceramic furnace for lithium disilicate pressing and porcelain layering with vacuum-assisted firing cycles.",
    materials: ["Lithium disilicate (e.max)", "Feldspathic porcelain", "Glaze"],
    services: ["e.max crowns", "e.max veneers", "Layered porcelain", "Glaze & stain"],
  },
  {
    name: "Dentsply Sirona CEREC SpeedFire",
    type: "Speed Sintering",
    image: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=800&q=80&auto=format&fit=crop",
    desc: "Fast-sintering furnace for same-day zirconia and glazed restorations with rapid heating technology.",
    materials: ["Zirconia", "Glaze"],
    services: ["Express zirconia crowns", "Same-day restorations", "Glaze finishing"],
  },
];

const SPECS = [
  { q: "What is zirconia sintering?", a: "Sintering heats zirconia to ~1,450°C to trigger crystallization, transforming the material from a soft, millable state into a dense, high-strength ceramic with flexural strength up to 1,200 MPa." },
  { q: "What ceramics do you fire?", a: "We fire lithium disilicate (e.max), feldspathic porcelain and glaze. Our furnaces support vacuum-assisted firing for optimal ceramic density and aesthetics." },
  { q: "Can you do glaze and staining?", a: "Yes. Every ceramic restoration is individually stained, glazed and characterised to match the prescribed shade and patient photos." },
  { q: "Do you offer express sintering?", a: "Yes. The CEREC SpeedFire enables rapid zirconia sintering for urgent cases requiring same-day or next-day dispatch." },
];

function Page() {
  const [cmsBlocks, setCmsBlocks] = useState<any[]>([]);
  const [cmsLoaded, setCmsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/pages/technology-sintering-ceramic-firing")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setCmsBlocks(d.page?.blocks || []); })
      .catch(() => {})
      .finally(() => setCmsLoaded(true));
  }, []);

  const hasSavedBlocks = cmsLoaded && cmsBlocks.length > 0;

  return (
    <div>
      {hasSavedBlocks ? (
        <PageBlocks blocks={cmsBlocks} />
      ) : (
        <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/6529103/pexels-photo-6529103.jpeg?w=1600&q=80&auto=format&fit=crop" alt="Sintering and firing" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-b from-navy/60 via-navy/50 to-navy/80" />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 lg:px-8 py-24">
          <Reveal>
            <span className="eyebrow text-teal!">Technology</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-white">Sintering & Ceramic Firing</h1>
            <p className="mt-6 text-lg text-white/80 max-w-3xl">Validated high-temperature protocols for zirconia crystallization, e.max pressing and porcelain glazing.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <Reveal className="mb-10">
            <h2 className="text-2xl font-semibold">Sintering & Firing Equipment</h2>
            <p className="text-muted-grey mt-2">Precision temperature control with validated firing curves for every ceramic system.</p>
          </Reveal>

          <div className="space-y-8">
            {MACHINES.map((m) => (
              <Reveal key={m.name}>
                <div className="grid md:grid-cols-3 gap-6 rounded-2xl border border-border-silver overflow-hidden">
                  <div className="md:col-span-1 h-56 md:h-auto">
                    <img src={m.image} alt={m.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="md:col-span-2 p-6">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-teal font-medium">{m.type}</div>
                    <h3 className="font-semibold text-lg text-text-slate mt-1">{m.name}</h3>
                    <p className="text-sm text-muted-grey mt-2 leading-relaxed">{m.desc}</p>
                    <div className="mt-4">
                      <span className="text-xs font-semibold text-slate-700">Supported materials:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {m.materials.map((mat) => <span key={mat} className="text-[11px] px-2 py-1 rounded bg-teal/10 text-teal font-medium">{mat}</span>)}
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-xs font-semibold text-slate-700">Used for:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {m.services.map((s) => <span key={s} className="text-[11px] px-2 py-1 rounded bg-gold/10 text-gold-dark font-medium">{s}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16">
            <h2 className="text-2xl font-semibold mb-6">Technical Specifications & FAQ</h2>
            <div className="space-y-2">
              {SPECS.map((item) => (
                <details key={item.q} className="group rounded-xl border border-border-silver bg-white overflow-hidden">
                  <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer font-medium text-text-slate hover:bg-slate-50 transition">
                    <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-teal shrink-0" />{item.q}</span>
                    <span className="text-teal group-open:rotate-180 transition-transform text-xs">▼</span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-muted-grey leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </Reveal>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/services/$slug" params={{ slug: "fixed-restorations" }} className="btn-teal">Fixed Restorations <ArrowRight size={16} /></Link>
            <Link to="/portal/cases/new" className="btn-outline-teal">Submit a Case <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
        </>
      )}
    </div>
  );
}
