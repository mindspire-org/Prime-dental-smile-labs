import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Smile, Wrench, Layers, Frame, Shield, PencilRuler } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { PageBlocks } from "@/components/site/PageBlocks";
import { ServiceHeroView } from "@/components/site/ServiceHero";

export const Route = createFileRoute("/_marketing/services/")({
  head: () => ({
    meta: [
      { title: "Lab Services — Prime Smile Dental Laboratory" },
      { name: "description", content: "Full digital dental lab services: fixed restorations, implant prosthetics, removable, frameworks, splints and design support." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Lab Services — Prime Smile Dental Laboratory" },
      { property: "og:description", content: "Full digital dental lab services for UK & Cyprus dentists." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://primesmiles.eu/services" },
    ],
    links: [
      { rel: "canonical", href: "https://primesmiles.eu/services" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", "name": "Dental Lab Services — Prime Smile", "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "Fixed Restorations", "url": "https://primesmiles.eu/services/fixed-restorations" }, { "@type": "ListItem", "position": 2, "name": "Implant Prosthetics", "url": "https://primesmiles.eu/services/implant-prosthetics" }, { "@type": "ListItem", "position": 3, "name": "Removable Prosthetics", "url": "https://primesmiles.eu/services/removable-prosthetics" }, { "@type": "ListItem", "position": 4, "name": "Metal Frameworks", "url": "https://primesmiles.eu/services/metal-frameworks" }, { "@type": "ListItem", "position": 5, "name": "Splints & Appliances", "url": "https://primesmiles.eu/services/splints-appliances" }, { "@type": "ListItem", "position": 6, "name": "Design Support", "url": "https://primesmiles.eu/services/design-support" } ] }) },
    ],
  }),
  component: ServicesPage,
});

const SERVICES = [
  { slug: "fixed-restorations", icon: Smile, title: "Fixed Restorations", desc: "Crowns, bridges, veneers, inlays and onlays in zirconia, lithium disilicate and PFM." },
  { slug: "implant-prosthetics", icon: Wrench, title: "Implant Prosthetics", desc: "Custom abutments, screw-retained crowns, bars, hybrid and full-arch restorations." },
  { slug: "removable-prosthetics", icon: Layers, title: "Removable Prosthetics", desc: "Full and partial dentures, flexible nylon, valplast and digitally designed bases." },
  { slug: "metal-frameworks", icon: Frame, title: "Metal Frameworks", desc: "Cobalt-chrome frameworks via SLM metal printing for accuracy, fit and strength." },
  { slug: "splints-guards", icon: Shield, title: "Splints & Guards", desc: "Night guards, bruxism splints, surgical guides and orthodontic retainers." },
  { slug: "digital-design", icon: PencilRuler, title: "Digital Design Support", desc: "STL design, smile design and treatment planning collaboration with your clinic." },
];

const MATERIAL_TILES = [
  { label: "Zirconia",        sub: "Achieve High Level Of Aesthetic\nWithout Sacrificing Durability",  img: "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&q=80&auto=format&fit=crop", text: true  },
  { label: "",                sub: "", img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80&auto=format&fit=crop", text: false },
  { label: "Porcelain",       sub: "Aesthetic And Function Are Together",                               img: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=600&q=80&auto=format&fit=crop", text: true  },
  { label: "",                sub: "", img: "https://images.unsplash.com/photo-1684607631747-045ecfeeb4c7?w=600&q=80&auto=format&fit=crop", text: false },
  { label: "Implants",        sub: "Long Lasting Dentures",                                             img: "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&q=80&auto=format&fit=crop", text: true  },
  { label: "",                sub: "", img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=80&auto=format&fit=crop", text: false },
  { label: "Inlays / Onlays", sub: "Perfect Match At The Most Precision Points",                        img: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=600&q=80&auto=format&fit=crop", text: true  },
  { label: "",                sub: "", img: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=600&q=80&auto=format&fit=crop", text: false },
];

function ServicesPage() {
  const [cmsBlocks, setCmsBlocks] = useState<any[]>([]);
  const [cmsLoaded, setCmsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/pages/services")
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setCmsBlocks(d.page?.blocks || []); })
      .catch(() => {})
      .finally(() => setCmsLoaded(true));
  }, []);

  const hasSavedBlocks = cmsLoaded && cmsBlocks.length > 0;
  const pageBlocks = cmsBlocks.map((b: any) =>
    b.type === "home-services" ? { ...b, linkText: undefined, linkHref: undefined } : b
  );

  return (
    <div>
      {hasSavedBlocks ? (
        <PageBlocks blocks={pageBlocks} />
      ) : (
    <>
      {/* Hero (shared with the editable "Services Hero" page-editor block) */}
      <ServiceHeroView />

      {/* Services grid */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <StaggerItem key={s.slug}>
                <div className="card-service h-full flex flex-col">
                  <div className="w-12 h-12 rounded-lg bg-teal/10 text-teal flex items-center justify-center mb-4"><s.icon size={22}/></div>
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <p className="text-sm text-muted-grey mt-2 leading-relaxed flex-1">{s.desc}</p>
                  <Link to="/services/$slug" params={{slug:s.slug}} className="text-gold font-semibold mt-5 inline-flex items-center gap-1 hover:gap-2 transition-all text-sm">View Service <ArrowRight size={14}/></Link>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Materials photo grid */}
      <section className="bg-bg-soft py-16">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal className="text-center mb-10">
            <span className="eyebrow">Materials</span>
            <h2 className="mt-3 text-3xl font-semibold">Our Core Restorations</h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 rounded-2xl overflow-hidden shadow-[0_4px_40px_rgba(0,0,0,0.12)]">
            {MATERIAL_TILES.map((tile, i) => (
              <div key={i} className="relative h-52 overflow-hidden group">
                <img src={tile.img} alt={tile.label || "dental"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy"/>
                <div className="absolute inset-0 bg-navy/50 group-hover:bg-navy/60 transition-colors duration-300"/>
                {tile.text && tile.label && (
                  <div className="absolute inset-0 flex flex-col justify-center p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-[2px] bg-teal"/>
                      <span className="text-white font-bold text-sm md:text-base tracking-wide uppercase">{tile.label}</span>
                    </div>
                    <p className="text-white/80 text-xs leading-relaxed whitespace-pre-line">{tile.sub}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )}
    </div>
  );
}
