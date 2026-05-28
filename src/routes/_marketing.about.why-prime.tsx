import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { ArrowRight, Globe, Zap, Package, TrendingUp, Eye, Truck } from "lucide-react";

export const Route = createFileRoute("/_marketing/about/why-prime")({
  head: () => ({
    meta: [
      { title: "Why Prime Smile — Prime Smile Dental Laboratory" },
      { name: "description", content: "Why dentists choose Prime Smile: digital collaboration, broad capabilities, modern technology, material traceability and export-ready service." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Why Prime Smile — Prime Smile Dental Laboratory" },
      { property: "og:description", content: "Discover what sets Prime Smile apart: digital workflows, broad lab services, UK & Cyprus coverage, and CE-certified consumables." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://primesmilelab.com/about/why-prime" },
    ],
    links: [{ rel: "canonical", href: "https://primesmilelab.com/about/why-prime" }],
  }),
  component: WhyPrimePage,
});

const REASONS = [
  {
    icon: Zap,
    title: "Digital-First Collaboration",
    desc: "Dentists submit digital prescriptions online, upload intraoral scans, and track case progress in real-time. No paper. Complete traceability from submission to dispatch.",
  },
  {
    icon: Package,
    title: "Broad Production Capability",
    desc: "We deliver fixed restorations, implant prosthetics, metal frameworks, removable prosthetics, surgical guides, splints, and design-only services—all in one lab.",
  },
  {
    icon: TrendingUp,
    title: "Modern Technology Base",
    desc: "5-axis CAD/CAM milling, SLM metal printing, DLP 3D printing, digital scanning, ceramic sintering, and advanced finishing systems—all validated and integrated.",
  },
  {
    icon: Eye,
    title: "Material & Case Traceability",
    desc: "Every case links to material selections, supplier lot numbers, production notes, and QC records. Full material declarations dispatched with every restoration.",
  },
  {
    icon: Globe,
    title: "UK & Cyprus Service",
    desc: "Built specifically for UK and Cyprus dentists. Digital case intake, DHL/FedEx/courier dispatch options with full tracking and protective packaging.",
  },
  {
    icon: Truck,
    title: "Export-Ready Workflow",
    desc: "Courier-optimised packaging, case documentation, tracking numbers, and delivery confirmation. Choose from multiple courier options based on urgency and destination.",
  },
];

function WhyPrimePage() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <span className="eyebrow">Why Choose</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">Why Prime Smile</h1>
            <p className="mt-6 text-lg text-muted-grey leading-relaxed max-w-3xl">
              Dentists across the UK and Cyprus choose Prime Smile for our digital-first workflow, comprehensive lab services, modern technology, and commitment to traceability and quality.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/submit" className="btn-teal">Submit Your First Case <ArrowRight size={16}/></Link>
              <Link to="/contact" className="btn-outline-teal">Get in Touch <ArrowRight size={16}/></Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* REASONS */}
      <section className="bg-bg-soft py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REASONS.map((reason) => (
              <StaggerItem key={reason.title}>
                <div className="bg-white rounded-2xl p-7 shadow-[0_2px_16px_rgba(0,0,0,0.05)] h-full flex flex-col">
                  <div className="w-14 h-14 rounded-lg bg-teal/10 text-teal flex items-center justify-center mb-5"><reason.icon size={24}/></div>
                  <h3 className="font-semibold text-lg text-text-slate">{reason.title}</h3>
                  <p className="text-sm text-muted-grey mt-3 leading-relaxed flex-1">{reason.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* DIGITAL WORKFLOW */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <Reveal className="mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold">Seamless Digital Experience</h2>
            <p className="mt-4 text-muted-grey max-w-2xl">From prescription to dispatch, every step is tracked and documented.</p>
          </Reveal>
          <Stagger className="grid md:grid-cols-2 gap-8">
            {[
              { t: "Online Case Submission", d: "Dentists create an account, fill out digital prescriptions, and upload scans with a few clicks." },
              { t: "Real-Time Case Tracking", d: "Monitor your case through design, production, QC, and dispatch stages with status updates." },
              { t: "Digital File Management", d: "Store all case files, prescriptions, and production notes in a secure online portal." },
              { t: "Material Documentation", d: "Auto-generated material declarations with lot numbers and traceability sheets attached to every delivery." },
            ].map((feature) => (
              <StaggerItem key={feature.t}>
                <div className="border-l-4 border-teal pl-6">
                  <h3 className="font-semibold text-lg">{feature.t}</h3>
                  <p className="text-muted-grey text-sm mt-2 leading-relaxed">{feature.d}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* LOGISTICS */}
      <section className="bg-bg-soft py-20">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <Reveal className="mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold">Courier & Packaging Options</h2>
            <p className="mt-4 text-muted-grey max-w-2xl">We support dentists in the UK and Cyprus with multiple dispatch and tracking options.</p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
              <h3 className="font-semibold text-lg mb-4">Courier Options</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border-silver hover:border-teal/40 transition">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/DHL_Logo.svg" alt="DHL" className="h-8 w-auto object-contain" />
                  <span className="text-xs text-muted-grey text-center">Express (overnight UK)</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border-silver hover:border-teal/40 transition">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/FedEx_Express.svg" alt="FedEx" className="h-8 w-auto object-contain" />
                  <span className="text-xs text-muted-grey text-center">International (Cyprus)</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border-silver hover:border-teal/40 transition">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/United_Parcel_Service_logo_2014.svg" alt="UPS" className="h-10 w-auto object-contain" />
                  <span className="text-xs text-muted-grey text-center">Standard (multi-region)</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border-silver hover:border-teal/40 transition">
                  <span className="text-sm font-semibold text-text-slate">Local Couriers</span>
                  <span className="text-xs text-muted-grey text-center">Same-day tracked partners</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
              <h3 className="font-semibold text-lg mb-4">Protective Packaging</h3>
              <ul className="space-y-3 text-sm text-muted-grey">
                <li className="flex items-start gap-3"><span className="text-teal font-bold">•</span> Custom-labelled case packages</li>
                <li className="flex items-start gap-3"><span className="text-teal font-bold">•</span> Padded internal cases for prosthetics</li>
                <li className="flex items-start gap-3"><span className="text-teal font-bold">•</span> Case documentation & tracking sheet</li>
                <li className="flex items-start gap-3"><span className="text-teal font-bold">•</span> Material declarations included</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-dark))" }}>
        <div className="max-w-4xl mx-auto px-5 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold">Join dentists across the UK & Cyprus</h2>
          <p className="mt-4 text-white/85 max-w-2xl mx-auto">Create your account today and experience digital-first lab collaboration.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/portal" className="inline-flex items-center gap-2 bg-white text-teal font-semibold px-6 py-3 rounded-lg hover:scale-[1.02] transition">Create Dentist Account <ArrowRight size={16}/></Link>
            <Link to="/submit" className="inline-flex items-center gap-2 bg-white/15 backdrop-blur text-white font-semibold px-6 py-3 rounded-lg border border-white/30 hover:bg-white/25 transition">Submit a Case <ArrowRight size={16}/></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
