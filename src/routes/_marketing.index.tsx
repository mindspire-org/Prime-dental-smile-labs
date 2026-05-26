import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Cpu, Lock, FlaskConical, Target, ArrowRight, CheckCircle2, Star,
  Wrench, Smile, Layers, Frame, Shield, PencilRuler, MessageCircle,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { StatCounter } from "@/components/site/StatCounter";
import { Placeholder } from "@/components/site/Placeholder";

export const Route = createFileRoute("/_marketing/")({
  head: () => ({
    meta: [
      { title: "Prime Smile Dental Laboratory — Digital Lab for UK & Cyprus Dentists" },
      { name: "description", content: "Premium digital dental laboratory: CAD/CAM milling, SLM metal printing, zirconia, lithium disilicate, implant prosthetics. Serving UK & Cyprus dentists." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Prime Smile Dental Laboratory — Digital Lab for UK & Cyprus Dentists" },
      { property: "og:description", content: "Premium digital dental laboratory serving UK & Cyprus dentists with precision CAD/CAM restorations." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://primesmilelab.com/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://primesmilelab.com/" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", "name": "Prime Smile Dental Laboratory", "url": "https://primesmilelab.com", "description": "Advanced digital dental laboratory serving UK and Cyprus dentists with precision restorations and prosthetics.", "address": { "@type": "PostalAddress", "addressCountry": "GB" }, "contactPoint": { "@type": "ContactPoint", "contactType": "customer service", "availableLanguage": ["English"] } }) },
    ],
  }),
  component: HomePage,
});

const SERVICES = [
  { icon: Smile, title: "Fixed Restorations", desc: "Crowns, bridges, veneers, inlays & onlays in zirconia and lithium disilicate." },
  { icon: Wrench, title: "Implant Prosthetics", desc: "Custom abutments, screw-retained crowns, bars and full-arch restorations." },
  { icon: Layers, title: "Removable Prosthetics", desc: "Full and partial dentures with digital design and high-precision fit." },
  { icon: Frame, title: "Metal Frameworks", desc: "Cobalt-chrome frameworks via SLM metal printing for accuracy and strength." },
  { icon: Shield, title: "Splints & Guards", desc: "Night guards, bruxism splints and surgical guides from validated workflows." },
  { icon: PencilRuler, title: "Digital Design Support", desc: "STL design, smile design and treatment planning collaboration." },
];

const TECH = [
  { name: "ALFAMILL 5-Axis / Yena D30", brand: "CAD/CAM Milling", tags: ["Zirconia", "PMMA"] },
  { name: "VENEA VDexk1 eco", brand: "SLM Metal Printing", tags: ["Co-Cr", "Frameworks"] },
  { name: "Asiga MAX UV", brand: "DLP 3D Printing", tags: ["Models", "Splints"] },
  { name: "Dental Wings 7 Series", brand: "Scanning & Design", tags: ["Scan", "CAD"] },
  { name: "Ivoclar Programat / SpeedFire", brand: "Sintering & Firing", tags: ["Ceramic"] },
  { name: "Renfert / KaVo", brand: "Finishing & Polishing", tags: ["Surface"] },
  { name: "Bio-Art / Deflex", brand: "Model Workflow", tags: ["Articulator"] },
  { name: "EKOSAN / Stanley AIR COM", brand: "Air Infrastructure", tags: ["Clean Air"] },
];

const BRANDS = ["ALFAMILL","VENEA","Asiga","Dental Wings","Ivoclar","CEREC","Renfert","KaVo","DHL","ISO 9001","ISO 13485","CE Certified"];

function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage:"linear-gradient(var(--teal) 1px, transparent 1px), linear-gradient(90deg, var(--teal) 1px, transparent 1px)",
          backgroundSize:"48px 48px",
        }}/>
        <div className="absolute inset-0">
          <Placeholder label="Hero — Lab Facility Photo" className="absolute inset-0 opacity-40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-32 pb-28">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.7}}>
            <span className="eyebrow">Digital Dental Laboratory</span>
            <h1 className="mt-4 font-bold text-4xl md:text-5xl lg:text-[56px] leading-[1.1] max-w-4xl">
              Digital Dental Laboratory for <span className="text-teal">UK & Cyprus</span> Dentists
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/80 max-w-3xl leading-relaxed">
              CAD/CAM milling · SLM metal printing · Zirconia · Lithium disilicate · Implant prosthetics · Digital prescription workflow.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/submit" className="btn-teal">Submit a Case <ArrowRight size={16}/></Link>
              <Link to="/contact" className="btn-outline-white">Request Free Consultation</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-white border-y border-border-silver">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Cpu, t: "Digital", d: "CAD/CAM Workflow" },
            { icon: Lock, t: "Confidential", d: "Patient Data Protection" },
            { icon: FlaskConical, t: "Advanced", d: "CE-Certified Materials" },
            { icon: Target, t: "Precision", d: "Multi-Step Quality Control" },
          ].map(({icon:I,t,d}) => (
            <div key={t} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center text-teal shrink-0"><I size={22}/></div>
              <div>
                <div className="font-semibold text-text-slate">{t}</div>
                <div className="text-[11px] tracking-[0.12em] uppercase text-muted-grey font-medium">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONFIDENCE METRICS */}
      <section className="bg-bg-soft py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <span className="eyebrow">About Us</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold leading-tight">A digital lab built around precision, traceability and trust.</h2>
            <p className="mt-5 text-muted-grey leading-relaxed">
              Prime Smile is a fully digital dental laboratory partnering with dentists across the UK and Cyprus.
              Every case is processed through a structured digital prescription workflow with strict quality control at every stage.
            </p>
            <Link to="/about" className="inline-flex items-center gap-2 text-teal font-semibold mt-6 hover:gap-3 transition-all">
              About Us <ArrowRight size={16}/>
            </Link>
          </Reveal>
          <Stagger className="grid grid-cols-2 gap-6">
            {[
              { n: 10, s: "+", l: "Years of Digital Lab Experience" },
              { n: 500, s: "+", l: "Cases Delivered Per Month" },
              { n: 6, s: "", l: "Multi-Step Quality Control Points" },
              { n: 100, s: "%", l: "CE-Certified Materials Used" },
            ].map((m) => (
              <StaggerItem key={m.l} className="bg-white rounded-xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
                <div className="text-4xl md:text-5xl font-bold text-teal"><StatCounter to={m.n} suffix={m.s}/></div>
                <div className="text-sm text-muted-grey mt-2 font-medium">{m.l}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* DIGITAL WORKFLOW */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 text-center">
          <Reveal>
            <span className="eyebrow">Modern Approach</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold">Our Digital Workflow</h2>
            <p className="mt-4 text-muted-grey max-w-2xl mx-auto">
              We use advanced digital instruments and workflow to ensure the highest standard of every restoration.
            </p>
          </Reveal>
          <div className="mt-14 relative">
            <div className="hidden md:block absolute top-7 left-[10%] right-[10%] h-[2px] bg-border-silver"/>
            <Stagger className="grid grid-cols-2 md:grid-cols-5 gap-8 relative">
              {["Register / Login","Fill Digital Prescription","Upload Scans & Files","Track Your Case Live","Receive Finished Work"].map((step,i) => (
                <StaggerItem key={step} className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-teal text-white flex items-center justify-center font-bold text-lg shadow-[0_4px_18px_rgba(10,171,189,.4)] relative z-10">{i+1}</div>
                  <div className="mt-4 font-semibold text-sm">{step}</div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <Link to="/workflow" className="inline-flex items-center gap-2 text-teal font-semibold mt-12 hover:gap-3 transition-all">
            Learn about our Digital Workflow <ArrowRight size={16}/>
          </Link>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-bg-soft py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">Our Services</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold">Comprehensive Lab Services</h2>
            <p className="mt-4 text-muted-grey">
              We provide a full range of dental laboratory services. Every case is managed with a digital prescription workflow.
            </p>
          </Reveal>
          <Stagger className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <StaggerItem key={s.title}>
                <div className="card-service h-full flex flex-col">
                  <div className="w-12 h-12 rounded-lg bg-teal/10 text-teal flex items-center justify-center mb-4"><s.icon size={22}/></div>
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <p className="text-sm text-muted-grey mt-2 leading-relaxed flex-1">{s.desc}</p>
                  <Link to="/services" className="text-teal text-sm font-semibold mt-4 inline-flex items-center gap-1 hover:gap-2 transition-all">View Service <ArrowRight size={14}/></Link>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="text-center mt-10">
            <Link to="/services" className="btn-outline-teal">View All Services <ArrowRight size={16}/></Link>
          </div>
        </div>
      </section>

      {/* DENTAL SERVICES PHOTO GRID */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal className="text-center mb-12">
            <span className="eyebrow">Specialisations</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold">Our Core Restorations</h2>
            <p className="mt-4 text-muted-grey max-w-2xl mx-auto">
              Every restoration is crafted using industry-leading materials and digital precision workflow.
            </p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 rounded-2xl overflow-hidden shadow-[0_4px_40px_rgba(0,0,0,0.12)]">
            {[
              { label: "Zircon",         sub: "Achieve High Level Of Aesthetic\nWithout Sacrificing Durability",  img: "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&q=80&auto=format&fit=crop", text: true  },
              { label: "",               sub: "",  img: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600&q=80&auto=format&fit=crop", text: false },
              { label: "Porcelain",      sub: "Aesthetic And Function Are\nTogether",                              img: "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&q=80&auto=format&fit=crop", text: true  },
              { label: "",               sub: "",  img: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=600&q=80&auto=format&fit=crop", text: false },
              { label: "Implants",       sub: "Long Lasting Dentures",                                             img: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&q=80&auto=format&fit=crop", text: true  },
              { label: "",               sub: "",  img: "https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=600&q=80&auto=format&fit=crop", text: false },
              { label: "Inlays / Onlays",sub: "Perfect Match At The Most\nPrecision Points",                      img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80&auto=format&fit=crop", text: true  },
              { label: "",               sub: "",  img: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&q=80&auto=format&fit=crop", text: false },
            ].map((tile, i) => (
              <div key={i} className="relative h-52 md:h-64 overflow-hidden group">
                <img src={tile.img} alt={tile.label || "dental"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-navy/50 group-hover:bg-navy/60 transition-colors duration-300" />
                {tile.text && tile.label && (
                  <div className="absolute inset-0 flex flex-col justify-center p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-[2px] bg-teal"/>
                      <span className="text-white font-bold text-base md:text-lg tracking-wide uppercase">{tile.label}</span>
                    </div>
                    <p className="text-white/80 text-xs md:text-sm leading-relaxed whitespace-pre-line">{tile.sub}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <div className="eyebrow text-teal!">Technology</div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold max-w-2xl">A Complete Digital Production Environment</h2>
          </Reveal>
          <Stagger className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TECH.map((t) => (
              <StaggerItem key={t.name}>
                <div className="card-tech h-full">
                  <div className="text-[11px] uppercase tracking-[0.12em] text-teal font-medium">{t.brand}</div>
                  <div className="font-semibold text-gold mt-2">{t.name}</div>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {t.tags.map((tag) => (
                      <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-teal/15 text-teal font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-10">
            <Link to="/technology" className="btn-outline-white">View All Technology <ArrowRight size={16}/></Link>
          </div>
        </div>
      </section>

      {/* PRODUCTION MARQUEE */}
      <section className="bg-white py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 text-center">
          <span className="eyebrow">Production</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold">Built on Industry-Leading Standards</h2>
        </div>
        <div className="mt-10 relative">
          <div className="flex marquee-track gap-3 w-max">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <span key={i} className="px-5 py-2.5 rounded-full bg-teal/10 text-teal font-semibold text-sm whitespace-nowrap">{b}</span>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-14 grid md:grid-cols-3 gap-5">
          {["Materials & Equipment", "Production Timeline", "Production Management"].map((t) => (
            <div key={t} className="relative h-44 rounded-xl overflow-hidden group cursor-pointer">
              <Placeholder label={t} className="absolute inset-0" />
              <div className="absolute inset-0 bg-linear-to-t from-navy/90 via-navy/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <div className="text-white font-semibold text-lg">{t}</div>
                <div className="text-teal text-xs mt-1 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">Explore <ArrowRight size={12}/></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ISO BADGES */}
      <section className="bg-white py-16 border-t border-border-silver">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { t: "ISO 9001:2015", d: "Quality Management System" },
            { t: "ISO 13485:2016", d: "Medical Devices Standard" },
            { t: "CE-Certified Materials", d: "World-Renowned Suppliers" },
            { t: "Digital Case Tracking", d: "Submission to Dispatch" },
          ].map((b) => (
            <div key={b.t}>
              <div className="w-14 h-14 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto mb-3"><CheckCircle2 size={26}/></div>
              <div className="font-bold">{b.t}</div>
              <div className="text-sm text-muted-grey mt-1">{b.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20" style={{background:"linear-gradient(135deg, var(--teal), var(--teal-dark))"}}>
        <div className="max-w-5xl mx-auto px-5 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Submit Your First Case?</h2>
          <p className="mt-4 text-white/85 max-w-2xl mx-auto">
            Diagnosis is free. Every case is managed with a digital prescription. Treatment plans are customised to your needs.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/portal" className="inline-flex items-center gap-2 bg-white text-teal font-semibold px-6 py-3 rounded-lg hover:scale-[1.02] transition">
              Create Dentist Account <ArrowRight size={16}/>
            </Link>
            <a href="#" className="btn-outline-white"><MessageCircle size={16}/> WhatsApp Us</a>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-bg-soft py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal className="text-center">
            <span className="eyebrow">Testimonials</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold">What Dentists Say</h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex">{[...Array(5)].map((_,i)=>(<Star key={i} size={18} className="fill-teal text-teal"/>))}</div>
              <span className="text-sm text-muted-grey font-medium">4.9 based on reviews</span>
            </div>
          </Reveal>
          <Stagger className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { q: "Consistent precision across every zirconia case. Their digital workflow has cut my chairtime significantly.", n: "Dr. Andreas Petrou", c: "Nicosia Dental Clinic, Cyprus" },
              { q: "Implant prosthetics fit beautifully. Clear communication and on-time delivery, every time.", n: "Dr. Sarah Whitfield", c: "Whitfield Dental, London UK" },
              { q: "The case tracking portal is a game-changer. I always know exactly where my patient's case is.", n: "Dr. Marios Constantinou", c: "Limassol Smile Studio, Cyprus" },
            ].map((r) => (
              <StaggerItem key={r.n}>
                <div className="bg-white rounded-xl p-7 shadow-[0_2px_16px_rgba(0,0,0,.06)] h-full flex flex-col">
                  <div className="flex">{[...Array(5)].map((_,i)=>(<Star key={i} size={14} className="fill-teal text-teal"/>))}</div>
                  <p className="italic text-text-slate mt-4 leading-relaxed flex-1">"{r.q}"</p>
                  <div className="mt-5 pt-5 border-t border-border-silver">
                    <div className="font-semibold">{r.n}</div>
                    <div className="text-sm text-muted-grey">— {r.c}</div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="text-center mt-8">
            <button className="text-teal font-semibold hover:underline">Load more</button>
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold">News & Updates</h2>
            <a href="#" className="text-teal font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">All News <ArrowRight size={16}/></a>
          </div>
          <Stagger className="grid md:grid-cols-3 gap-6">
            {[
              { c: "Industry News", t: "New SLM metal printing capabilities now live in our Cyprus facility", d: "12 Apr 2026" },
              { c: "Case Study", t: "Full-arch implant rehabilitation: workflow walkthrough", d: "28 Mar 2026" },
              { c: "Materials", t: "Updated zirconia portfolio: improved translucency and strength", d: "14 Mar 2026" },
            ].map((n) => (
              <StaggerItem key={n.t}>
                <article className="rounded-xl overflow-hidden bg-white border border-border-silver hover:shadow-[0_8px_28px_rgba(0,0,0,.08)] transition-all hover:-translate-y-1">
                  <div className="relative h-44">
                    <Placeholder label="News Image" className="absolute inset-0" />
                    <div className="absolute inset-0 bg-linear-to-t from-navy/70 to-transparent"/>
                    <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.12em] font-medium text-white bg-teal px-2 py-1 rounded">{n.c}</span>
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-muted-grey">{n.d}</div>
                    <h3 className="font-semibold mt-2 leading-snug">{n.t}</h3>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </div>
  );
}
