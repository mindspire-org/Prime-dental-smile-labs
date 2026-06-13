import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, CheckCircle, FileText, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { PageBlocks } from "@/components/site/PageBlocks";

const DATA: Record<string, {
  title: string; intro: string; image: string; makes: string[]; submit: string[]; materials: string[]; workflow: string[];
}> = {
  "fixed-restorations": {
    title: "Fixed Restorations",
    intro: "Precision-milled and pressed restorations engineered for long-term function and aesthetics.",
    image: "https://cdn.pixabay.com/photo/2020/08/27/18/31/teeth-5522653_1280.jpg?w=1200&q=80&auto=format&fit=crop",
    makes: ["Single crowns (anterior & posterior)", "3-unit and long-span bridges", "Veneers (minimal-prep & traditional)", "Inlays / Onlays", "Temporary PMMA restorations", "Maryland bridges"],
    submit: ["Intra-oral or impression scan (STL/PLY/OBJ)", "Bite registration", "Shade selection (with photos)", "Tooth chart with role tags", "Special instructions (margin design, contact preferences)"],
    materials: ["Zirconia (3M Lava, Katana)", "Lithium Disilicate (e.max)", "PFM", "PMMA", "Composite hybrids"],
    workflow: ["Case received & digitally checked", "Design & approval (optional)", "Milling / pressing", "Sintering / firing", "Finishing & polishing", "QC + dispatch"],
  },
  "implant-prosthetics": {
    title: "Implant Prosthetics",
    intro: "Full implant prosthetic solutions using validated scanbody libraries and original components.",
    image: "https://images.pexels.com/photos/30874064/pexels-photo-30874064.jpeg?w=1200&q=80&auto=format&fit=crop",
    makes: ["Custom titanium abutments", "Screw-retained crowns", "Cement-retained crowns", "Implant bars (milled)", "Hybrid full-arch prostheses", "All-on-4 / All-on-6"],
    submit: ["Implant brand, system & platform", "Scanbody type & lot", "Connection type (internal/external/conical)", "Retention preference", "Soft tissue scan or impression", "CBCT / DICOM (if available)"],
    materials: ["Titanium Grade 5", "Zirconia abutments", "PEEK", "Cobalt-chrome bars"],
    workflow: ["Implant verification", "Library matching", "Abutment design & approval", "Milling & finishing", "Crown fabrication", "QC + dispatch"],
  },
  "removable-prosthetics": {
    title: "Removable Prosthetics",
    intro: "Full and partial dentures designed and produced for comfort, retention and natural aesthetics.",
    image: "https://images.pexels.com/photos/6502031/pexels-photo-6502031.jpeg?w=1200&q=80&auto=format&fit=crop",
    makes: ["Complete upper & lower dentures", "Partial dentures (acrylic, Co-Cr, flexible)", "Immediate dentures", "Implant overdentures", "Repairs & relines", "Try-ins (digital)"],
    submit: ["Primary or secondary impressions", "Bite blocks / centric registration", "Tooth selection (mould & shade)", "Patient photos (smile line)", "Special design notes"],
    materials: ["Heat-cured acrylic", "Cobalt-chrome", "Valplast / Deflex", "Nylon flexibles"],
    workflow: ["Digital design", "Try-in fabrication", "Approval", "Final processing", "Polishing", "QC + dispatch"],
  },
  "metal-frameworks": {
    title: "Metal Frameworks",
    intro: "Cobalt-chrome frameworks 3D-printed via SLM technology for unrivaled accuracy.",
    image: "https://images.pexels.com/photos/6627596/pexels-photo-6627596.jpeg?w=1200&q=80&auto=format&fit=crop",
    makes: ["Partial denture frameworks", "Implant bar frameworks", "Telescopic crowns", "Combination cases"],
    submit: ["Working scan or model", "Framework design preferences", "Major/minor connector locations", "Clasp design notes"],
    materials: ["Cobalt-chrome (CE-certified)"],
    workflow: ["CAD design", "SLM metal printing", "Heat treatment", "Fitting & finishing", "Polishing", "QC + dispatch"],
  },
  "splints-guards": {
    title: "Splints & Guards",
    intro: "Validated splints and guards from 3D-printed and milled materials.",
    image: "https://images.pexels.com/photos/6812500/pexels-photo-6812500.jpeg?w=1200&q=80&auto=format&fit=crop",
    makes: ["Bruxism / night guards (hard & soft)", "Michigan splints", "Anterior repositioning splints", "Surgical guides", "Sports guards", "Orthodontic retainers"],
    submit: ["Intra-oral scan (upper & lower)", "Bite registration", "Splint type & thickness", "Coverage requirements"],
    materials: ["Asiga DentaGUIDE", "Asiga DentaCLEAR", "Polypropylene", "PETG"],
    workflow: ["Digital design", "3D printing", "Post-curing", "Polishing", "QC + dispatch"],
  },
  "digital-design": {
    title: "Digital Design Support",
    intro: "STL design, smile design and treatment planning collaboration for your in-house workflow.",
    image: "https://images.pexels.com/photos/6529103/pexels-photo-6529103.jpeg?w=1200&q=80&auto=format&fit=crop",
    makes: ["STL crown / bridge design", "Smile design mockups", "Wax-up files", "Surgical guide planning", "Implant planning"],
    submit: ["Patient scan (STL)", "Photographs", "Treatment objectives", "Existing CBCT (if applicable)"],
    materials: ["Design output: STL / PLY / OBJ"],
    workflow: ["Case briefing", "Initial design", "Review & feedback", "Final STL delivery"],
  },
};

export const Route = createFileRoute("/_marketing/services/$slug")({
  loader: async ({ params }) => {
    const data = DATA[params.slug];
    if (!data) throw notFound();
    let pageBlocks: any[] = [];
    if (typeof window !== "undefined") {
      try {
        const r = await fetch(`/api/admin/pages/${params.slug}`);
        if (r.ok) {
          const json = await r.json();
          pageBlocks = json.page?.blocks || [];
        }
      } catch {}
    }
    return { ...data, pageBlocks };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Service"} — Prime Smile Dental Laboratory` },
      { name: "description", content: loaderData?.intro ?? "" },
    ],
  }),
  component: ServiceDetail,
});

type LoaderData = typeof DATA[string] & { pageBlocks: any[] };

function ServiceDetail() {
  const d = Route.useLoaderData() as LoaderData;
  // The page already renders its own hero below; drop any hero/header blocks
  // from the editable CMS blocks so the service page never shows two headers.
  const editableBlocks = (d.pageBlocks || []).filter(
    (b: any) => !["hero", "page-header", "about-hero"].includes(b.type),
  );
  const hasBlocks = editableBlocks.length > 0;

  return (
    <div>
      {/* Hero image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={d.image} alt={d.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-b from-navy/60 via-navy/50 to-navy/80" />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 lg:px-8 py-24">
          <Reveal>
            <Link to="/services" className="text-teal text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">← All Services</Link>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold text-white">{d.title}</h1>
            <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-3xl">{d.intro}</p>
          </Reveal>
        </div>
      </section>

      <div className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          {/* Editable page blocks from page editor */}
          {hasBlocks && (
            <div className="mb-16">
              <PageBlocks blocks={editableBlocks} />
            </div>
          )}

          {/* Fallback hardcoded content */}
          <div className="grid md:grid-cols-2 gap-10">
            <Reveal>
              <h2 className="text-xl font-semibold mb-4">What We Make</h2>
              <ul className="space-y-2.5">
                {d.makes.map((m: string) => (
                  <li key={m} className="flex items-start gap-3 text-text-slate"><CheckCircle className="text-teal mt-0.5 shrink-0" size={18}/> <span className="text-sm">{m}</span></li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="text-xl font-semibold mb-4">What You Need to Submit</h2>
              <ul className="space-y-2.5">
                {d.submit.map((s: string) => (
                  <li key={s} className="flex items-start gap-3"><FileText className="text-teal mt-0.5 shrink-0" size={18}/> <span className="text-sm">{s}</span></li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal className="mt-14">
            <h2 className="text-xl font-semibold mb-4">Available Materials</h2>
            <div className="flex flex-wrap gap-2">
              {d.materials.map((m: string) => (
                <span key={m} className="px-3 py-1.5 rounded-full bg-teal/10 text-teal text-sm font-medium">{m}</span>
              ))}
            </div>
          </Reveal>

          <Reveal className="mt-14">
            <h2 className="text-xl font-semibold mb-4">Typical Workflow</h2>
            <ol className="space-y-3">
              {d.workflow.map((w: string, i: number) => (
                <li key={w} className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-teal text-white font-bold text-sm flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="pt-1">{w}</span>
                </li>
              ))}
            </ol>
          </Reveal>

          <div className="mt-12 border-l-4 border-teal pl-5 italic text-muted-grey bg-bg-soft py-4 rounded-r">
            Quality Guarantee: Every restoration passes 6 quality control checkpoints. Remakes within warranty are free of charge.
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/submit" className="btn-gold">Submit This Case <ArrowRight size={16}/></Link>
            <Link to="/contact" className="btn-outline-teal"><MessageCircle size={16}/> Ask a Technical Question</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
