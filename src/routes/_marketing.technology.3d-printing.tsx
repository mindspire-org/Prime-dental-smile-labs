import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_marketing/technology/3d-printing")({
  head: () => ({
    meta: [
      { title: "3D Printing — Prime Smile Dental Laboratory" },
      { name: "description", content: "DLP 3D printing for splints, surgical guides, models and biocompatible resin workflows." },
    ],
    links: [{ rel: "canonical", href: "https://primesmilelab.com/technology/3d-printing" }],
  }),
  component: Page,
});

const MACHINES = [
  {
    name: "Asiga MAX UV DLP Printer",
    type: "DLP 3D Printing",
    image: "https://images.unsplash.com/photo-1590424693420-634a0b0b782c?w=800&q=80&auto=format&fit=crop",
    desc: "High-resolution DLP printing with UV LED light engine for precise, biocompatible dental applications.",
    materials: ["Asiga DentaGUIDE", "Asiga DentaCLEAR", "Biocompatible resins", "Model resins"],
    services: ["Surgical guides", "Splints & guards", "Study models", "Try-ins", "Orthodontic retainers"],
  },
  {
    name: "Anycubic Wash & Cure Max Post-Processing",
    type: "Post-Processing",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80&auto=format&fit=crop",
    desc: "Automated wash and UV cure station for consistent post-processing of printed resin parts.",
    materials: ["All DLP/SLA resin types"],
    services: ["Post-curing", "Surface cleaning", "Support removal"],
  },
];

const SPECS = [
  { q: "What is DLP 3D printing?", a: "Digital Light Processing (DLP) uses a UV light projector to cure liquid resin layer by layer. It offers high resolution (down to 35 microns) and fast print times for dental applications." },
  { q: "What can you print?", a: "Surgical guides, bruxism splints, night guards, study models, orthodontic retainers, try-in appliances and temporary restorations." },
  { q: "Are the resins biocompatible?", a: "Yes. We use CE-certified biocompatible resins including Asiga DentaGUIDE (for surgical guides) and DentaCLEAR (for splints and appliances)." },
  { q: "What is the accuracy?", a: "DLP printing achieves ±50 micron accuracy with layer heights as low as 35 microns, suitable for precise dental fit requirements." },
];

function Page() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/6502031/pexels-photo-6502031.jpeg?w=1600&q=80&auto=format&fit=crop" alt="3D printing" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-b from-navy/60 via-navy/50 to-navy/80" />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 lg:px-8 py-24">
          <Reveal>
            <span className="eyebrow text-teal!">Technology</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-white">3D Printing</h1>
            <p className="mt-6 text-lg text-white/80 max-w-3xl">DLP resin printing for splints, surgical guides, models and biocompatible dental workflows.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <Reveal className="mb-10">
            <h2 className="text-2xl font-semibold">3D Printing Equipment</h2>
            <p className="text-muted-grey mt-2">High-resolution DLP printing with validated post-processing for dental-grade accuracy.</p>
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
            <Link to="/services/splints-guards" className="btn-teal">Splints & Guards <ArrowRight size={16} /></Link>
            <Link to="/submit" className="btn-outline-teal">Submit a Case <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
