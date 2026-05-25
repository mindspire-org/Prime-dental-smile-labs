import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { CheckCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_marketing/quality")({
  head: () => ({
    meta: [
      { title: "Quality & Compliance — Prime Smile Dental Laboratory" },
      { name: "description", content: "ISO 9001:2015 and ISO 13485:2016 certified dental laboratory. CE-certified materials with full traceability — meeting UK MDR 2002 standards." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Quality & Compliance — Prime Smile Dental Laboratory" },
      { property: "og:description", content: "ISO 9001 & ISO 13485 certified. CE-certified materials, full traceability, UK MDR compliant." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://primesmilelab.com/quality" },
    ],
    links: [
      { rel: "canonical", href: "https://primesmilelab.com/quality" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [ { "@type": "Question", "name": "Is Prime Smile Dental Laboratory ISO certified?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. We hold ISO 9001:2015 and ISO 13485:2016 certifications, and all restorations use CE-certified materials only." } }, { "@type": "Question", "name": "Does Prime Smile comply with UK MDR 2002?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. All custom-made dental devices are manufactured in compliance with the UK Medical Devices Regulations 2002 (SI 2002/618) and carry full material traceability." } }, { "@type": "Question", "name": "What materials does the lab use?", "acceptedAnswer": { "@type": "Answer", "text": "We use exclusively CE-certified materials including zirconia, lithium disilicate, cobalt-chrome (SLM), PMMA, and resin composites, all with full lot-number traceability." } } ] }) },
    ],
  }),
  component: QualityPage,
});

const QC = [
  { t: "Incoming Case Review", d: "Every digital prescription is validated against scan files and case requirements." },
  { t: "Design Verification", d: "CAD designs reviewed by senior technicians before production begins." },
  { t: "Material Verification", d: "Material lot numbers logged for every restoration. Full traceability." },
  { t: "Production QC", d: "Dimensional and aesthetic checks at every production stage." },
  { t: "Final Quality Control", d: "Pre-dispatch inspection: fit, occlusion, finish, shade and packaging." },
  { t: "Dispatch Documentation", d: "Each case dispatched with material declaration and traceability sheet." },
];

const FAQ = [
  { q: "What is your remake policy?", a: "Remakes due to lab error are free of charge within the warranty period (12 months for fixed restorations). A clear remake reason is required to maintain quality records." },
  { q: "How do you handle complaints?", a: "Submit through the dentist portal or via email. Our QC manager investigates within 48 hours and provides a written report with corrective actions." },
  { q: "Can I receive material declarations for patients?", a: "Yes. Every case is dispatched with a material declaration sheet listing all materials, lot numbers and standards used." },
];

function QualityPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <Reveal>
            <span className="eyebrow">Quality</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold inline-block border-b-4 border-teal pb-2">Quality & Compliance</h1>
            <p className="mt-6 text-muted-grey max-w-3xl text-lg leading-relaxed">
              Every Prime Smile case is processed through a documented, audited quality system aligned with ISO 9001:2015 and ISO 13485:2016.
            </p>
          </Reveal>
          <div className="mt-14 space-y-4">
            {QC.map((q, i) => (
              <Reveal key={q.t} delay={i * 0.05}>
                <div className="flex items-start gap-4 p-5 bg-bg-soft rounded-xl">
                  <CheckCircle className="text-teal shrink-0 mt-1" size={22}/>
                  <div>
                    <div className="font-semibold">{q.t}</div>
                    <p className="text-sm text-muted-grey mt-1">{q.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg-soft py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { t: "ISO 9001:2015", d: "Quality Management System" },
            { t: "ISO 13485:2016", d: "Medical Devices Standard" },
            { t: "CE-Certified Materials", d: "World-Renowned Suppliers" },
            { t: "Digital Case Tracking", d: "Submission to Dispatch" },
          ].map((b) => (
            <div key={b.t} className="bg-white rounded-xl p-7 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
              <div className="w-14 h-14 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto mb-3"><CheckCircle size={26}/></div>
              <div className="font-bold">{b.t}</div>
              <div className="text-sm text-muted-grey mt-1">{b.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 grid md:grid-cols-2 gap-10">
          <div className="border-l-4 border-teal pl-5">
            <h3 className="font-semibold text-lg">Material Traceability</h3>
            <p className="text-muted-grey text-sm mt-2 leading-relaxed">
              Every material lot is logged against your case ID. Full traceability sheets are dispatched with every restoration.
            </p>
          </div>
          <div>
            <p className="italic text-sm text-muted-grey">
              Prime Smile complies with UK MHRA Custom-Made Device requirements and is registered with the appropriate UKRP for distribution into the UK market.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-bg-soft py-20">
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <h2 className="text-3xl font-semibold mb-2">Complaint & Remake Policy</h2>
          <p className="text-muted-grey mb-8">Open, fair, and clearly documented.</p>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <div key={f.q} className="bg-white rounded-xl border border-border-silver overflow-hidden">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left font-semibold">
                  {f.q}
                  <ChevronDown className={`text-teal transition-transform ${open === i ? "rotate-180" : ""}`} size={18}/>
                </button>
                {open === i && <div className="px-5 pb-5 text-sm text-muted-grey leading-relaxed">{f.a}</div>}
              </div>
            ))}
          </div>
          <div className="mt-8 border-l-4 border-teal pl-5 italic text-text-slate bg-white p-5 rounded-r">
            "Quality is not negotiable. Every case carries the same standard, regardless of size or complexity."
          </div>
        </div>
      </section>
    </div>
  );
}
