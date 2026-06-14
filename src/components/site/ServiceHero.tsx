// Editable services page header — single source of truth so the live page and
// the page-editor block render pixel-identically.

export type ServiceHeroProps = {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  image?: string;
};

export const SERVICE_HERO_DEFAULTS: Required<ServiceHeroProps> = {
  eyebrow: "Our Services",
  heading: "Comprehensive Lab Services",
  subheading:
    "Every service is delivered through a digital prescription workflow with full traceability, multi-step QC and CE-certified materials.",
  image: "https://images.unsplash.com/photo-1684607631747-045ecfeeb4c7?w=1600&q=80&auto=format&fit=crop",
};

// ── Service DETAIL page header (/services/<slug>) ────────────────────
export type ServiceDetailHeroProps = {
  heading?: string;
  subheading?: string;
  image?: string;
  backHref?: string;
  backLabel?: string;
};

export const SERVICE_DETAIL_HERO_DEFAULTS: Required<ServiceDetailHeroProps> = {
  heading: "Service",
  subheading: "",
  image: "",
  backHref: "/services",
  backLabel: "All Services",
};

export function ServiceDetailHeroView(props: ServiceDetailHeroProps) {
  const heading = props.heading ?? "";
  const subheading = props.subheading ?? "";
  const image = props.image ?? "";
  const backHref = props.backHref || "/services";
  const backLabel = props.backLabel || "All Services";

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        {image && <img src={image} alt={heading} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-linear-to-b from-navy/60 via-navy/50 to-navy/80" />
      </div>
      <div className="relative max-w-5xl mx-auto px-5 lg:px-8 py-24">
        <a href={backHref} className="text-teal text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">← {backLabel}</a>
        <h1 className="mt-4 text-4xl md:text-5xl font-bold text-white">{heading}</h1>
        {subheading && <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-3xl">{subheading}</p>}
      </div>
    </section>
  );
}

export function ServiceHeroView(props: ServiceHeroProps) {
  const d = SERVICE_HERO_DEFAULTS;
  const eyebrow = props.eyebrow ?? d.eyebrow;
  const heading = props.heading ?? d.heading;
  const subheading = props.subheading ?? d.subheading;
  const image = props.image ?? d.image;

  return (
    <section className="relative bg-navy text-white overflow-hidden">
      <div className="absolute inset-0">
        {image && (
          <img src={image} alt="Dental laboratory" className="w-full h-full object-cover opacity-30" loading="lazy" />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-navy/70 to-navy/90" />
      </div>
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 py-24">
        <span className="eyebrow text-teal!">{eyebrow}</span>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold max-w-3xl">{heading}</h1>
        <p className="mt-6 text-white/70 max-w-2xl text-lg">{subheading}</p>
      </div>
    </section>
  );
}
