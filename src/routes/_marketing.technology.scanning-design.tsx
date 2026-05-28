import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_marketing/technology/scanning-design")({
  head: () => ({
    meta: [
      { title: "Scanning & Design — Prime Smile Dental Laboratory" },
      { name: "description", content: "Lab-grade scanning and CAD design workflow for model digitization and complex implant bridge cases." },
    ],
    links: [{ rel: "canonical", href: "https://primesmilelab.com/technology/scanning-design" }],
  }),
  component: Page,
});

const MACHINES = [
  {
    name: "Dental Wings 7 Series Desktop Scanner",
    type: "Scanning",
    image: "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=800&q=80&auto=format&fit=crop",
    desc: "Lab-grade blue-light structured-light scanner with 7-micron accuracy for models, impressions and articulator setups.",
    materials: ["Plaster models", "Impressions", "Articulator setups", "Wax-ups"],
    services: ["Model digitization", "Wax-up scanning", "Articulator transfer", "Implant case scanning"],
  },
  {
    name: "CAD Workflow Suite",
    type: "Digital Design",
    image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80&auto=format&fit=crop",
    desc: "Complete CAD design environment for crown & bridge, implant restoration, RPD framework and surgical guide design.",
    materials: ["STL files", "PLY files", "OBJ files"],
    services: ["Crown & bridge design", "Implant planning", "Bar design", "Surgical guide design", "Smile design"],
  },
];

const SPECS = [
  { q: "What scanner do you use?", a: "We use the Dental Wings 7 Series desktop scanner with blue-light structured-light technology, achieving 7-micron accuracy on single dies and full-arch models." },
  { q: "Can you scan physical impressions?", a: "Yes. We scan plaster models, silicone impressions, wax-ups and articulator setups. The scanner supports both open and closed articulator transfers." },
  { q: "What CAD software do you use?", a: "Our technicians work with industry-standard CAD suites for dental design, supporting crown & bridge, implant restorations, RPD frameworks and surgical guide planning." },
  { q: "Can I send digital scans directly?", a: "Yes. We accept STL, PLY and OBJ files from intraoral scanners (iTero, TRIOS, Primescan, etc.) and process them directly into our design workflow." },
];

function Page() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/6812500/pexels-photo-6812500.jpeg?w=1600&q=80&auto=format&fit=crop" alt="Scanning and design" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-b from-navy/60 via-navy/50 to-navy/80" />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 lg:px-8 py-24">
          <Reveal>
            <span className="eyebrow text-teal!">Technology</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-white">Scanning & Design</h1>
            <p className="mt-6 text-lg text-white/80 max-w-3xl">Lab-grade scanning and CAD design workflow for model digitization and complex implant bridge cases.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <Reveal className="mb-10">
            <h2 className="text-2xl font-semibold">Scanning & Design Equipment</h2>
            <p className="text-muted-grey mt-2">Precision digitisation with full CAD workflow support from scan to production file.</p>
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
                      <span className="text-xs font-semibold text-slate-700">Supported inputs:</span>
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
            <Link to="/services/digital-design" className="btn-teal">Digital Design Support <ArrowRight size={16} /></Link>
            <Link to="/submit" className="btn-outline-teal">Submit a Case <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
