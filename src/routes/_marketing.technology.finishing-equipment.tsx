import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import { PageBlocks } from "@/components/site/PageBlocks";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_marketing/technology/finishing-equipment")({
  head: () => ({
    meta: [
      { title: "Finishing Equipment — Prime Smile Dental Laboratory" },
      { name: "description", content: "Surface finishing, polishing, sandblasting and laser welding for dental restorations and frameworks." },
    ],
    links: [{ rel: "canonical", href: "https://primesmilelab.com/technology/finishing-equipment" }],
  }),
  component: Page,
});

const MACHINES = [
  {
    name: "Renfert Sandblasting & Surface Processing",
    type: "Surface Finishing",
    image: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=800&q=80&auto=format&fit=crop",
    desc: "Precision sandblasting for framework cleaning, oxide removal and surface preparation before ceramic application or polishing.",
    materials: ["Cobalt-chrome", "Titanium", "Zirconia", "Metal frameworks"],
    services: ["Framework cleaning", "Oxide removal", "Surface prep", "Ceramic bonding prep"],
  },
  {
    name: "Zhermack Steam & Ultrasonic Cleaning",
    type: "Cleaning Systems",
    image: "https://images.unsplash.com/photo-1684607631747-045ecfeeb4c7?w=800&q=80&auto=format&fit=crop",
    desc: "Steam and ultrasonic cleaning stations for removing investment residue, polishing paste and contaminants before final QC.",
    materials: ["All restoration types", "Ceramic", "Metal", "Acrylic"],
    services: ["Pre-dispatch cleaning", "Investment removal", "Contaminant removal"],
  },
  {
    name: "GC Curing, Micro-Motors & Laser Welding",
    type: "Final Processing",
    image: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=800&q=80&auto=format&fit=crop",
    desc: "Composite curing lights, high-speed micro-motors, turbines and laser welding for final adaptation, repair and occlusal adjustment.",
    materials: ["Composite", "Metal frameworks", "Ceramic", "Acrylic"],
    services: ["Composite curing", "Occlusal adjustment", "Framework repair", "Laser welding", "Final polish"],
  },
];

const SPECS = [
  { q: "What finishing equipment do you have?", a: "We operate Renfert sandblasting systems, Zhermack steam/ultrasonic cleaning, GC curing lights, high-speed micro-motors, turbines and laser welding equipment." },
  { q: "Do you polish metal frameworks?", a: "Yes. Every CoCr and titanium framework goes through sandblasting, surface finishing and polishing before dispatch for optimal fit and biocompatibility." },
  { q: "Can you do occlusal adjustment?", a: "Yes. Our technicians use articulating paper, micro-motors and high-speed turbines for precise occlusal adjustment and contact refinement." },
  { q: "Do you offer laser welding for repairs?", a: "Yes. We can perform spot laser welding on metal frameworks for minor repairs, clasp additions and connector modifications without affecting the overall fit." },
];

function Page() {
  const [cmsBlocks, setCmsBlocks] = useState<any[]>([]);
  const [cmsLoaded, setCmsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/pages/technology-finishing-equipment")
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
          <img src="https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=1600&q=80&auto=format&fit=crop" alt="Finishing equipment" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-b from-navy/60 via-navy/50 to-navy/80" />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 lg:px-8 py-24">
          <Reveal>
            <span className="eyebrow text-teal!">Technology</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-white">Finishing Equipment</h1>
            <p className="mt-6 text-lg text-white/80 max-w-3xl">Surface finishing, polishing, sandblasting, cleaning and laser welding for every restoration type.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <Reveal className="mb-10">
            <h2 className="text-2xl font-semibold">Finishing & Surface Processing Equipment</h2>
            <p className="text-muted-grey mt-2">Every restoration passes through dedicated finishing stations before final QC and dispatch.</p>
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
                      <span className="text-xs font-semibold text-slate-700">Compatible with:</span>
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
            <Link to="/services" className="btn-teal">All Services <ArrowRight size={16} /></Link>
            <Link to="/portal/cases/new" className="btn-outline-teal">Submit a Case <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
        </>
      )}
    </div>
  );
}
