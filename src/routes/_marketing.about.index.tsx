import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PageBlocks } from "@/components/site/PageBlocks";

export const Route = createFileRoute("/_marketing/about/")({
  head: () => ({
    meta: [
      { title: "About Us — Prime Smile Dental Laboratory" },
      { name: "description", content: "Our facility, our story, and our commitment to digital dentistry in the UK and Cyprus." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "About Us — Prime Smile Dental Laboratory" },
      { property: "og:description", content: "Learn about our state-of-the-art digital dental laboratory serving UK & Cyprus dentists." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://primesmilelab.com/about" },
    ],
    links: [
      { rel: "canonical", href: "https://primesmilelab.com/about" },
    ],
  }),
  component: AboutPage,
});

const GALLERY = [
  { src: "https://images.pexels.com/photos/7800553/pexels-photo-7800553.jpeg?w=800&q=80&auto=format&fit=crop", alt: "Dental laboratory facility", span: "col-span-2 row-span-2" },
  { src: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=600&q=80&auto=format&fit=crop", alt: "CAD/CAM design workstation" },
  { src: "https://images.unsplash.com/photo-1590424693420-634a0b0b782c?w=600&q=80&auto=format&fit=crop", alt: "Dental equipment" },
  { src: "https://images.pexels.com/photos/5355922/pexels-photo-5355922.jpeg?w=600&q=80&auto=format&fit=crop", alt: "Lab technician at work" },
  { src: "https://images.pexels.com/photos/6501859/pexels-photo-6501859.jpeg?w=600&q=80&auto=format&fit=crop", alt: "Dental prosthetics finishing" },
];

function AboutPage() {
  const [cmsBlocks, setCmsBlocks] = useState<any[]>([]);
  const [cmsLoaded, setCmsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/pages/about")
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
      {/* Hero */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <Reveal>
            <span className="eyebrow">Facility</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">
              About <span className="text-teal">Prime Smile</span> Dental Laboratory
            </h1>
            <p className="mt-6 text-lg text-muted-grey leading-relaxed">
              Prime Smile is a fully digital dental laboratory operating across the UK and Cyprus.
              We partner with dental clinics who demand precision, accountability and consistent results — delivered every time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact" className="btn-teal">Contact Us <ArrowRight size={16}/></Link>
              <Link to="/workflow" className="btn-outline-teal">Our Workflow <ArrowRight size={16}/></Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-3 grid-rows-2 gap-3 h-80">
              {GALLERY.map((img, i) => (
                <div key={i} className={`rounded-2xl overflow-hidden ${img.span ?? ""}`}>
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" loading="lazy"/>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Story / Mission / Standards */}
      <section className="bg-bg-soft py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Stagger className="grid md:grid-cols-3 gap-8">
            {[
              { t: "Our Story", d: "Founded by a team of master technicians who saw the future was digital. We invested early in CAD/CAM, SLM printing and validated workflows — long before it became industry standard.", accent: "border-teal" },
              { t: "Our Mission", d: "To make precision dental restoration accessible to every dentist through fully traceable, digitally-managed lab work. No paper. No guessing. Every case accounted for.", accent: "border-gold" },
              { t: "Our Standards", d: "Using CE-certified consumables only. Six quality control checkpoints per case. Zero compromises on fit, aesthetics or traceability.", accent: "border-teal" },
            ].map((b) => (
              <StaggerItem key={b.t}>
                <div className={`bg-white rounded-2xl p-7 shadow-[0_2px_16px_rgba(0,0,0,0.05)] border-l-4 ${b.accent} h-full`}>
                  <h3 className="font-bold text-xl text-text-slate">{b.t}</h3>
                  <p className="text-sm text-muted-grey mt-3 leading-relaxed">{b.d}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-white py-16 border-t border-border-silver">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { t: "CE-Certified Consumables", d: "Verified supplier materials" },
            { t: "Quality Practices", d: "Documented QC checkpoints" },
            { t: "CE-Certified Materials", d: "World-Renowned Suppliers" },
            { t: "Digital Case Tracking", d: "Submission to Dispatch" },
          ].map((b) => (
            <div key={b.t}>
              <div className="w-14 h-14 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={26}/>
              </div>
              <div className="font-bold">{b.t}</div>
              <div className="text-sm text-muted-grey mt-1">{b.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, var(--teal), var(--teal-dark))" }}>
        <div className="max-w-4xl mx-auto px-5 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to partner with us?</h2>
          <p className="mt-4 text-white/85 max-w-xl mx-auto">Create your dentist account and submit your first case today.</p>
          <div className="mt-8">
            <Link to="/portal" className="inline-flex items-center gap-2 bg-white text-teal font-semibold px-7 py-3 rounded-lg hover:scale-[1.02] transition">
              Get Started <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </section>
    </>
  )}
    </div>
  );
}
