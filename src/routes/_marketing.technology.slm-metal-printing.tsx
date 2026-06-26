import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import { PageBlocks } from "@/components/site/PageBlocks";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_marketing/technology/slm-metal-printing")({
  head: () => ({
    meta: [
      { title: "SLM Metal Printing — Prime Smile Dental Laboratory" },
      { name: "description", content: "Selective laser melting for cobalt-chrome frameworks, implant bars and RPD frameworks with unrivaled accuracy." },
    ],
    links: [{ rel: "canonical", href: "https://primesmiles.eu/technology/slm-metal-printing" }],
  }),
  component: Page,
});

const MACHINES = [
  {
    name: "VENEA VDexk1 eco SLM 3D Metal Laser Printer",
    type: "SLM Metal Printing",
    image: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=800&q=80&auto=format&fit=crop",
    desc: "Selective laser melting system for additive manufacturing of cobalt-chrome and titanium frameworks with layer-by-layer precision.",
    materials: ["Cobalt-chrome (CE-certified)", "Titanium Grade 5"],
    services: ["Partial denture frameworks", "Implant bar frameworks", "Telescopic crowns", "Combination cases"],
  },
];

const SPECS = [
  { q: "What is SLM metal printing?", a: "Selective Laser Melting (SLM) uses a high-power laser to fuse metal powder layer by layer, producing dense, fully functional metal parts with accuracy down to ±50 microns." },
  { q: "What metals do you print?", a: "We print with CE-certified cobalt-chrome (CoCr) and Titanium Grade 5. Both are biocompatible and approved for dental prosthetics." },
  { q: "What is the advantage over traditional casting?", a: "SLM eliminates shrinkage and porosity issues common in casting. The result is a denser, more accurate framework with better fit and longer durability." },
  { q: "Do you offer post-processing?", a: "Yes. Every printed framework goes through heat treatment, support removal, surface finishing and polishing before QC and dispatch." },
];

function Page() {
  const [cmsBlocks, setCmsBlocks] = useState<any[]>([]);
  const [cmsLoaded, setCmsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/pages/technology-slm-metal-printing")
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
          <img src="https://images.pexels.com/photos/6627596/pexels-photo-6627596.jpeg?w=1600&q=80&auto=format&fit=crop" alt="SLM metal printing" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-b from-navy/60 via-navy/50 to-navy/80" />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 lg:px-8 py-24">
          <Reveal>
            <span className="eyebrow text-teal!">Technology</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-white">SLM Metal Printing</h1>
            <p className="mt-6 text-lg text-white/80 max-w-3xl">Additive manufacturing of metal frameworks, implant bars and RPD frameworks with layer-by-layer precision.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <Reveal className="mb-10">
            <h2 className="text-2xl font-semibold">Metal Printing Equipment</h2>
            <p className="text-muted-grey mt-2">Additive manufacturing with validated post-processing for dental-grade metal frameworks.</p>
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
            <Link to="/services/$slug" params={{ slug: "metal-frameworks" }} className="btn-teal">Metal Frameworks <ArrowRight size={16} /></Link>
            <Link to="/portal/cases/new" className="btn-outline-teal">Submit a Case <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
        </>
      )}
    </div>
  );
}
