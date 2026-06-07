import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Linkedin, Facebook, Instagram, Mail, Twitter, Youtube, Globe, Phone, MapPin } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────
export type FooterLinkItem = { label: string; href: string };
export type FooterColumn = { title: string; links: FooterLinkItem[] };
export type FooterSocial = { icon: string; href: string };

export type SiteFooterProps = {
  brandName?: string;
  brandRest?: string;
  description?: string;
  socials?: FooterSocial[];
  columns?: FooterColumn[];
  copyright?: string;
  legal?: FooterLinkItem[];
};

const SOCIAL_ICONS: Record<string, typeof Mail> = {
  Linkedin, Facebook, Instagram, Mail, Twitter, Youtube, Globe, Phone, MapPin,
};

// ── Defaults (used when the CMS footer page has no saved data) ────────
export const FOOTER_DEFAULTS: Required<SiteFooterProps> = {
  brandName: "Prime Smile",
  brandRest: " Dental Laboratory",
  description:
    "Advanced digital dental laboratory serving UK and Cyprus dentists. Focused on precision, quality, and long-term results. All cases handled with strict confidentiality.",
  socials: [
    { icon: "Linkedin", href: "#" },
    { icon: "Facebook", href: "#" },
    { icon: "Instagram", href: "#" },
    { icon: "Mail", href: "#" },
  ],
  columns: [
    {
      title: "Lab Services",
      links: [
        { label: "Fixed Restorations", href: "/services/fixed-restorations" },
        { label: "Implant Prosthetics", href: "/services/implant-prosthetics" },
        { label: "Removable Prosthetics", href: "/services/removable-prosthetics" },
        { label: "Metal Frameworks", href: "/services/metal-frameworks" },
        { label: "Splints & Guards", href: "/services/splints-guards" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Prescription Guide", href: "/resources" },
        { label: "Material Guide", href: "/resources" },
        { label: "Shade Taking", href: "/resources" },
        { label: "Implant Requirements", href: "/resources" },
        { label: "File Upload Help", href: "/resources" },
        { label: "FAQs", href: "/resources" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Quality & Compliance", href: "/quality" },
        { label: "Technology", href: "/technology" },
        { label: "Contact", href: "/contact" },
        { label: "Dentist Portal", href: "/portal" },
      ],
    },
  ],
  copyright: "© {year} Prime Smile Dental Laboratory. All rights reserved.",
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Data Notice", href: "/data-notice" },
  ],
};

// Internal paths use the SPA router; external/anchor/mailto use a plain anchor.
function FooterLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  const h = href || "#";
  if (/^https?:\/\//i.test(h) || h.startsWith("#") || h.startsWith("mailto:") || h.startsWith("tel:")) {
    return (
      <a href={h} className={className} target={h.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link to={h as never} className={className}>
      {children}
    </Link>
  );
}

// ── Presentational footer (single source of truth) ───────────────────
export function SiteFooterView(props: SiteFooterProps) {
  const d = FOOTER_DEFAULTS;
  const brandName = props.brandName ?? d.brandName;
  const brandRest = props.brandRest ?? d.brandRest;
  const description = props.description ?? d.description;
  const socials = props.socials?.length ? props.socials : d.socials;
  const columns = props.columns?.length ? props.columns : d.columns;
  const copyright = (props.copyright ?? d.copyright).replace("{year}", String(new Date().getFullYear()));
  const legal = props.legal?.length ? props.legal : d.legal;

  return (
    <footer className="bg-navy text-white/85 mt-20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="font-bold text-xl mb-4">
            <span className="text-teal">{brandName}</span>{brandRest}
            <span className="inline-block w-2 h-2 rounded-full bg-teal ml-1 align-middle" />
          </div>
          <p className="text-sm text-white/60 leading-relaxed max-w-sm">{description}</p>
          <div className="flex gap-3 mt-5">
            {socials.map((s, i) => {
              const Icon = SOCIAL_ICONS[s.icon] ?? Mail;
              return (
                <a
                  key={i}
                  href={s.href || "#"}
                  target={(s.href || "").startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-teal hover:text-teal transition"
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-white font-semibold mb-4 text-sm">{col.title}</h4>
            <ul className="space-y-2.5 text-sm">
              {(col.links || []).map((l, i) => (
                <li key={i}>
                  <FooterLink href={l.href} className="text-white/60 hover:text-teal transition-colors">
                    {l.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-5 flex flex-col md:flex-row justify-between gap-3 text-xs text-white/45">
          <div className="flex flex-col gap-1">
            <div>{copyright}</div>
            <div className="text-white/25">
              Developed &amp; Designed by{" "}
              <a href="https://mindspire.org" target="_blank" rel="noopener noreferrer" className="text-teal/60 hover:text-teal transition-colors">Mindspire</a>{" "}
              &mdash;{" "}
              <a href="https://mindspire.org" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/60 transition-colors">mindspire.org</a>
            </div>
          </div>
          <div className="flex gap-5">
            {legal.map((l, i) => (
              <FooterLink key={i} href={l.href} className="hover:text-teal">
                {l.label}
              </FooterLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Live footer: pulls the editable "footer" page from the CMS ───────
export function SiteFooter() {
  const [data, setData] = useState<SiteFooterProps | null>(null);

  useEffect(() => {
    fetch("/api/admin/pages/footer")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        const block = (d.page?.blocks || []).find((b: { type: string }) => b.type === "site-footer");
        if (block?.props) setData(block.props as SiteFooterProps);
      })
      .catch(() => {});
  }, []);

  return <SiteFooterView {...(data ?? {})} />;
}
