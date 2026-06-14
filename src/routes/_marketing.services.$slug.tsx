import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle, FileText, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { PageBlocks } from "@/components/site/PageBlocks";
import { ServiceDetailHeroView } from "@/components/site/ServiceHero";

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
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Service"} — Prime Smile Dental Laboratory` },
      { name: "description", content: loaderData?.intro ?? "" },
    ],
  }),
  component: ServiceDetail,
});

type LoaderData = typeof DATA[string];

function ServiceDetail() {
  const d = Route.useLoaderData() as LoaderData;
  const [cmsBlocks, setCmsBlocks] = useState<any[]>([]);
  const [cmsLoaded, setCmsLoaded] = useState(false);

  useEffect(() => {
    const slug = Object.entries(DATA).find(([, v]) => v.title === d.title)?.[0];
    if (!slug) return;
    fetch(`/api/admin/pages/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(json => { setCmsBlocks(json.page?.blocks || []); })
      .catch(() => {})
      .finally(() => setCmsLoaded(true));
  }, [d.title]);

  // The header is rendered once below (from the editable "Service Page Hero"
  // block if present, else from the page data); drop all header-type blocks
  // from the body so the service page never shows two headers.
  const editableBlocks = (cmsBlocks || []).filter(
    (b: any) => !["hero", "page-header", "about-hero", "service-page-hero"].includes(b.type),
  );
  const hasBlocks = editableBlocks.length > 0;

  // Header content: a saved "service-page-hero" block overrides the page data.
  const headerProps = (cmsBlocks || []).find((b: any) => b.type === "service-page-hero")?.props || {};

  return (
    <div>
      {/* Hero — identical layout to before, now editable via the page editor */}
      <ServiceDetailHeroView
        heading={headerProps.heading || d.title}
        subheading={headerProps.subheading || d.intro}
        image={headerProps.image || d.image}
        backHref="/services"
        backLabel="All Services"
      />

      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          {/* Editable page blocks from page editor */}
          {hasBlocks ? (
            <PageBlocks blocks={editableBlocks} />
          ) : cmsLoaded ? (
            <div className="text-center text-slate-400 text-sm py-10">
              No content blocks added yet. Edit this page in the admin panel to add content.
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
