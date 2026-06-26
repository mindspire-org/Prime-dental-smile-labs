import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { ArrowRight, Cpu, Printer, Box, ScanLine, Flame, Sparkles, Hammer, Wind, CheckCircle } from "lucide-react";
import { Placeholder } from "@/components/site/Placeholder";
import { PageBlocks } from "@/components/site/PageBlocks";

export const Route = createFileRoute("/_marketing/about/our-laboratory")({
  head: () => ({
    meta: [
      { title: "Our Laboratory — Prime Smile Dental Laboratory" },
      { name: "description", content: "Inside our digital dental laboratory: modern departments, equipment, validated workflows and case traceability." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Our Laboratory — Prime Smile Dental Laboratory" },
      { property: "og:description", content: "A behind-the-scenes look at our digital laboratory, equipment, and validated production workflows." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://primesmiles.eu/about/our-laboratory" },
    ],
    links: [{ rel: "canonical", href: "https://primesmiles.eu/about/our-laboratory" }],
  }),
  component: OurLabPage,
});

const DEPARTMENTS = [
  { icon: ScanLine, title: "Digital Scanning & Design", desc: "Intraoral scan integration, STL processing, digital prescription workflow", link: "/technology" },
  { icon: Cpu, title: "CAD/CAM Milling", desc: "5-axis simultaneous milling for crowns, bridges, inlays and frameworks", link: "/technology" },
  { icon: Printer, title: "SLM Metal Printing", desc: "Selective laser melting for cobalt-chrome frameworks and abutments", link: "/technology" },
  { icon: Box, title: "Resin 3D Printing", desc: "DLP printing for surgical guides, models, splints and temporary restorations", link: "/technology" },
  { icon: Flame, title: "Ceramic Processing", desc: "Sintering and high-temperature firing for zirconia and lithium disilicate", link: "/technology" },
  { icon: Sparkles, title: "Finishing & Polishing", desc: "Final surface preparation, staining, glaze and quality surface finish", link: "/technology" },
  { icon: CheckCircle, title: "Quality Control", desc: "Six-point QC protocol: design, material, production, fit, aesthetics, documentation", link: "/quality" },
  { icon: Wind, title: "Packaging & Dispatch", desc: "Protective packaging, case documentation, courier-ready tracking preparation", link: "/" },
];

const WORKFLOW_STEPS = [
  { step: "1", title: "Case Intake", desc: "Digital prescription received, scans uploaded, case logged" },
  { step: "2", title: "Design Review", desc: "CAD design verified against prescription and scan files" },
  { step: "3", title: "Production", desc: "Automated milling, printing, or manual workflow begins" },
  { step: "4", title: "Finishing", desc: "Staining, glaze application, surface polish and aesthetics", },
  { step: "5", title: "QC Inspection", desc: "Pre-dispatch quality check: fit, occlusion, finish, packaging" },
  { step: "6", title: "Dispatch", desc: "Labelled, documented case sent via courier with full traceability" },
];

function OurLabPage() {
  const [cms, setCms] = useState<any[]>([]);
  const [cmsLoaded, setCmsLoaded] = useState(false);
  useEffect(() => {
    fetch("/api/admin/pages/about-our-laboratory")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => setCms(j.page?.blocks || []))
      .catch(() => {})
      .finally(() => setCmsLoaded(true));
  }, []);
  if (cmsLoaded && cms.length > 0) return <div><PageBlocks blocks={cms} /></div>;

  return (
    <div>
      {/* HERO */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <span className="eyebrow">Facility</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">Our Laboratory</h1>
            <p className="mt-6 text-lg text-muted-grey leading-relaxed">
              Prime Smile is a purpose-built, fully digital facility focused on precision, traceability and validated workflows.
              Every case is processed through documented production departments with six quality control checkpoints.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact" className="btn-teal">Request a Tour <ArrowRight size={16}/></Link>
              <Link to="/technology" className="btn-outline-teal">See Our Equipment <ArrowRight size={16}/></Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Placeholder label="Laboratory facility overview" className="h-80 rounded-2xl" />
          </Reveal>
        </div>
      </section>

      {/* DEPARTMENTS */}
      <section className="bg-bg-soft py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal className="mb-12">
            <span className="eyebrow">Production</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold">Lab Departments</h2>
            <p className="mt-4 text-muted-grey max-w-2xl">Each department operates validated workflows with integrated quality checkpoints.</p>
          </Reveal>
          <Stagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEPARTMENTS.map((dept) => (
              <StaggerItem key={dept.title}>
                <Link to={dept.link} className="group block h-full bg-white rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition">
                  <div className="w-12 h-12 rounded-lg bg-teal/10 text-teal flex items-center justify-center mb-4 group-hover:bg-teal group-hover:text-white transition"><dept.icon size={22}/></div>
                  <h3 className="font-semibold text-lg text-text-slate">{dept.title}</h3>
                  <p className="text-sm text-muted-grey mt-2 leading-relaxed">{dept.desc}</p>
                  <span className="text-teal text-sm font-semibold mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition">Learn more <ArrowRight size={14}/></span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* WORKFLOW PROCESS */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal className="text-center mb-14">
            <span className="eyebrow">Process</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold">Case Workflow Map</h2>
            <p className="mt-4 text-muted-grey max-w-2xl mx-auto">Every case follows a documented, traceable workflow from intake to dispatch.</p>
          </Reveal>
          <div className="relative">
            <div className="hidden md:block absolute top-12 left-[5%] right-[5%] h-[2px] bg-linear-to-r from-teal/30 via-teal/70 to-teal/30"/>
            <Stagger className="grid grid-cols-2 md:grid-cols-6 gap-6 relative">
              {WORKFLOW_STEPS.map((w, i) => (
                <StaggerItem key={w.step}>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-teal text-white flex items-center justify-center font-bold text-lg shadow-[0_4px_16px_rgba(10,171,189,0.3)] relative z-10 mb-4">{w.step}</div>
                    <h3 className="font-semibold text-sm">{w.title}</h3>
                    <p className="text-xs text-muted-grey mt-2 leading-relaxed">{w.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* QUALITY CHECKPOINTS */}
      <section className="bg-bg-soft py-20">
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl font-semibold">Six-Point Quality Control</h2>
            <p className="mt-3 text-muted-grey">Every restoration passes through documented inspection at critical stages.</p>
          </Reveal>
          <Stagger className="grid md:grid-cols-2 gap-6">
            {[
              { t: "Design Verification", d: "CAD designs checked against prescription and scan files before production" },
              { t: "Material Verification", d: "Lot numbers logged for every material; full traceability documentation" },
              { t: "Production Inspection", d: "Dimensional and aesthetic checks at each production stage" },
              { t: "Final QC Check", d: "Pre-dispatch inspection: fit, occlusion, finish, packaging and documentation" },
              { t: "Delivery Confirmation", d: "Case tracked through courier; delivery confirmation logged" },
              { t: "Complaint Protocol", d: "Post-delivery support and remake policy clearly documented" },
            ].map((qc) => (
              <StaggerItem key={qc.t}>
                <div className="bg-white rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                  <h3 className="font-semibold">{qc.t}</h3>
                  <p className="text-sm text-muted-grey mt-2 leading-relaxed">{qc.d}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-dark))" }}>
        <div className="max-w-4xl mx-auto px-5 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to experience our laboratory?</h2>
          <p className="mt-4 text-white/85 max-w-2xl mx-auto">Request a facility tour or submit your first case today.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-teal font-semibold px-6 py-3 rounded-lg hover:scale-[1.02] transition">Request a Tour <ArrowRight size={16}/></Link>
            <Link to="/portal/cases/new" className="inline-flex items-center gap-2 bg-white/15 backdrop-blur text-white font-semibold px-6 py-3 rounded-lg border border-white/30 hover:bg-white/25 transition">Submit a Case <ArrowRight size={16}/></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
