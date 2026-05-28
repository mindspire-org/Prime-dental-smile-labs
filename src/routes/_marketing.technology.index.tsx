import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import {
  Cpu, Printer, Box, ScanLine, Flame, Sparkles, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/_marketing/technology/")({
  head: () => ({
    meta: [
      { title: "Technology — Prime Smile Dental Laboratory" },
      { name: "description", content: "A complete digital production environment: CAD/CAM milling, SLM metal printing, 3D printing and intraoral scan integration for UK & Cyprus dentists." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Technology — Prime Smile Dental Laboratory" },
      { property: "og:description", content: "CAD/CAM milling, SLM metal printing, 3D printing — full digital production for UK dentists." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://primesmilelab.com/technology" },
    ],
    links: [{ rel: "canonical", href: "https://primesmilelab.com/technology" }],
  }),
  component: TechPage,
});

const TECH = [
  { icon: Cpu, name: "ALFAMILL 5-Axis / Yena D30", brand: "CAD/CAM Milling", tags: ["Zirconia", "PMMA", "Wax"], desc: "5-axis simultaneous milling for crowns, bridges and frameworks.", to: "/technology/cad-cam-milling" },
  { icon: Printer, name: "VENEA VDexk1 eco", brand: "SLM Metal Printing", tags: ["Co-Cr", "Frameworks"], desc: "Selective laser melting for cobalt-chrome partial denture frameworks.", to: "/technology/slm-metal-printing" },
  { icon: Box, name: "Asiga MAX UV", brand: "DLP 3D Printing", tags: ["Models", "Splints", "Guides"], desc: "High-resolution DLP printing for splints, models and surgical guides.", to: "/technology/3d-printing" },
  { icon: ScanLine, name: "Dental Wings 7 Series", brand: "Scanning & Design", tags: ["Scan", "CAD"], desc: "Lab-grade desktop scanner with full CAD design suite.", to: "/technology/scanning-design" },
  { icon: Flame, name: "Ivoclar Programat / SpeedFire", brand: "Sintering & Firing", tags: ["Ceramic", "Sintering"], desc: "Validated sintering & firing protocols for zirconia and lithium disilicate.", to: "/technology/sintering-ceramic-firing" },
  { icon: Sparkles, name: "Renfert / KaVo", brand: "Finishing & Polishing", tags: ["Surface"], desc: "Industry-standard finishing instruments for surface excellence.", to: "/technology/finishing-equipment" },
];

function TechPage() {
  return (
    <div>
      <section className="bg-navy text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://cdn.pixabay.com/photo/2020/08/27/18/31/teeth-5522653_1280.jpg?w=1600&q=80&auto=format&fit=crop" alt="Digital dental technology" className="w-full h-full object-cover opacity-20" loading="lazy" />
          <div className="absolute inset-0 bg-linear-to-b from-navy/60 to-navy/95" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <span className="eyebrow text-teal!">Technology</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold max-w-3xl">A Complete Digital Production Environment</h1>
            <p className="mt-6 text-white/70 max-w-3xl text-lg">
              From scanning to sintering, every machine in our facility is calibrated, validated and integrated into our digital workflow.
            </p>
          </Reveal>
          <Stagger className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {TECH.map((t) => (
              <StaggerItem key={t.name}>
                <Link to={t.to} className="card-tech h-full block">
                  <div className="w-11 h-11 rounded-lg bg-teal/15 text-teal flex items-center justify-center mb-4"><t.icon size={20} /></div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-teal font-medium">{t.brand}</div>
                  <div className="font-semibold text-gold mt-2">{t.name}</div>
                  <p className="text-sm text-white/65 mt-2 leading-relaxed">{t.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {t.tags.map((tag) => (
                      <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-teal/15 text-teal font-medium">{tag}</span>
                    ))}
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-10">
            <Link to="/contact" className="btn-outline-white">Request a Facility Tour <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 text-center mb-8">
          <span className="eyebrow">Equipment & Standards</span>
        </div>
        <div className="flex marquee-track gap-3 w-max">
          {[...["ALFAMILL", "VENEA", "Asiga", "Dental Wings", "Ivoclar", "CEREC", "Renfert", "KaVo", "CE Certified"], ...["ALFAMILL", "VENEA", "Asiga", "Dental Wings", "Ivoclar", "CEREC", "Renfert", "KaVo", "CE Certified"]].map((b, i) => (
            <span key={i} className="px-5 py-2.5 rounded-full bg-teal/10 text-teal font-semibold text-sm whitespace-nowrap">{b}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
