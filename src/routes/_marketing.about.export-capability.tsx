import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/site/Reveal";
import { Globe, Upload, Truck, Package, FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { PageBlocks } from "@/components/site/PageBlocks";

export const Route = createFileRoute("/_marketing/about/export-capability")({
  head: () => ({
    meta: [
      { title: "Export Capability — Prime Smile Dental Laboratory" },
      { name: "description", content: "Prime Smile serves dentists in the UK and Cyprus with digital-first case intake, multiple courier options and protective packaging." },
    ],
    links: [{ rel: "canonical", href: "https://primesmilelab.com/about/export-capability" }],
  }),
  component: ExportCapabilityPage,
});

function ExportCapabilityPage() {
  const [cms, setCms] = useState<any[]>([]);
  const [cmsLoaded, setCmsLoaded] = useState(false);
  useEffect(() => {
    fetch("/api/admin/pages/about-export-capability")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(j => setCms(j.page?.blocks || []))
      .catch(() => {})
      .finally(() => setCmsLoaded(true));
  }, []);
  if (cmsLoaded && cms.length > 0) return <div><PageBlocks blocks={cms} /></div>;

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/33800642/pexels-photo-33800642.jpeg?w=1600&q=80&auto=format&fit=crop" alt="Export logistics" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-b from-navy/60 via-navy/50 to-navy/80" />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 lg:px-8 py-24">
          <Reveal>
            <span className="eyebrow text-teal!">Facility</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-white">Export Capability</h1>
            <p className="mt-6 text-lg text-white/80 max-w-3xl">
              Built specifically for digital collaboration with dentists in the UK and Cyprus. From online prescription to tracked delivery.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          {/* UK + Cyprus Service */}
          <Reveal className="mb-14">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal/10 text-teal flex items-center justify-center shrink-0">
                <Globe size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-text-slate">UK & Cyprus Service</h2>
                <p className="text-muted-grey mt-2 leading-relaxed">
                  Our platform is built for dentists practising in the United Kingdom and Cyprus. Every feature — from digital prescription to delivery tracking — is designed around the needs of clinics in these regions, with local support hours and regional courier partnerships.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Digital-first intake */}
          <Reveal className="mb-14" delay={0.05}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal/10 text-teal flex items-center justify-center shrink-0">
                <Upload size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-text-slate">Digital-First Case Intake</h2>
                <p className="text-muted-grey mt-2 leading-relaxed">
                  Dentists submit prescriptions and scan files entirely online through the Dentist Portal. There is no need for paper forms or phone calls. TRIOS, iTero and Primescan STL files are accepted and referenced automatically against the digital prescription.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["STL", "PLY", "OBJ", "DICOM", "ZIP", "JPG", "PDF"].map((f) => (
                    <span key={f} className="text-xs px-2.5 py-1 rounded bg-teal/10 text-teal font-semibold">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Courier options */}
          <Reveal className="mb-14" delay={0.1}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal/10 text-teal flex items-center justify-center shrink-0">
                <Truck size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-text-slate">Courier Options</h2>
                <p className="text-muted-grey mt-2 leading-relaxed">
                  We support multiple dispatch and tracking options based on destination, urgency and case type. All deliveries include tracking numbers visible directly in your portal.
                </p>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: "DHL Express", sub: "Overnight UK", img: "https://upload.wikimedia.org/wikipedia/commons/a/ac/DHL_Logo.svg" },
                    { name: "FedEx International", sub: "Cyprus 2-3 days", img: "https://upload.wikimedia.org/wikipedia/commons/b/b9/FedEx_Express.svg" },
                    { name: "UPS Standard", sub: "Multi-region", img: "https://upload.wikimedia.org/wikipedia/commons/6/6b/United_Parcel_Service_logo_2014.svg" },
                    { name: "Local Courier", sub: "Same-day tracked", img: null },
                  ].map((c) => (
                    <div key={c.name} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border-silver">
                      {c.img ? (
                        <img src={c.img} alt={c.name} className="h-7 w-auto object-contain" />
                      ) : (
                        <Truck size={22} className="text-slate-400" />
                      )}
                      <span className="text-xs font-semibold text-text-slate text-center">{c.name}</span>
                      <span className="text-[10px] text-muted-grey text-center">{c.sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Packaging */}
          <Reveal className="mb-14" delay={0.15}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal/10 text-teal flex items-center justify-center shrink-0">
                <Package size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-text-slate">Protective Packaging</h2>
                <p className="text-muted-grey mt-2 leading-relaxed">
                  Every case is packed with protective materials designed for dental prosthetics. Custom-labelled case packages, padded internal cases and full documentation are included with every dispatch.
                </p>
                <ul className="mt-4 space-y-2">
                  {["Custom-labelled case packages", "Padded internal cases for prosthetics", "Case documentation & tracking sheet", "Material declarations included"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-grey">
                      <CheckCircle2 size={14} className="text-teal shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          {/* Case documentation */}
          <Reveal className="mb-14" delay={0.2}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal/10 text-teal flex items-center justify-center shrink-0">
                <FileText size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-text-slate">Case Documentation</h2>
                <p className="text-muted-grey mt-2 leading-relaxed">
                  A digital prescription PDF is auto-generated for every case, providing a complete internal record with patient reference, tooth chart, materials, shade and workflow timeline. Accessible at any time through the Dentist Portal.
                </p>
              </div>
            </div>
          </Reveal>

          {/* CTA */}
          <Reveal className="mt-16 bg-bg-soft rounded-2xl p-8 text-center" delay={0.25}>
            <h3 className="text-xl font-semibold text-text-slate">Start collaborating with Prime Smile</h3>
            <p className="text-muted-grey mt-2 max-w-lg mx-auto">Create your dentist account today and experience digital-first lab collaboration with tracked delivery.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/portal" className="btn-teal">Create Dentist Account <ArrowRight size={16} /></Link>
              <Link to="/submit" className="btn-outline-teal">Submit a Case <ArrowRight size={16} /></Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
