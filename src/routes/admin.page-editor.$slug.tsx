import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { SiteFooterView, FOOTER_DEFAULTS } from "@/components/site/SiteFooter";
import { PageBlockRenderer } from "@/components/site/PageBlockRenderer";
import {
  ChevronLeft, Plus, Trash2, GripVertical, Settings2, Eye,
  Save, CheckCircle2, Type, Image, LayoutGrid, MessageSquare, Upload,
  Star, Zap, Minus, PlayCircle, ChevronDown, Users, Search,
  Monitor, Tablet, Smartphone, Palette, Layers, Copy, RefreshCw,
  Info, Lock, Unlock, Globe, Code, Sparkles, ArrowUpRight, ArrowRight,
  Wrench, Cpu, Frame, BookOpen, Smile, FlaskConical, Target,
  Shield, PencilRuler, MessageCircle, Undo2, Redo2, X
} from "lucide-react";

export const Route = createFileRoute("/admin/page-editor/$slug")({ component: PageEditor });

/* â”€â”€â”€ Block type registry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
type BlockType = { 
  id: string; 
  label: string; 
  icon: any; 
  category: string; 
  description: string;
  defaultProps: Record<string, any> 
};

const BLOCK_TYPES: BlockType[] = [
  // Hero & Header
  { 
    id: "hero", 
    label: "Hero Banner", 
    icon: Zap, 
    category: "Header",
    description: "Large hero section with heading, text and CTA",
    defaultProps: { 
      eyebrow: "",
      heading: "Your Heading", 
      highlight: "",
      subheading: "Subheading text here", 
      cta: "Get Started", 
      ctaLink: "#", 
      bgColor: "#0d1e2c", 
      image: "",
      height: "large",
      overlayOpacity: 0.3,
      align: "center"
    } 
  },
  {
    id: "page-header",
    label: "Page Header",
    icon: Type,
    category: "Header",
    description: "Clean page title section with eyebrow, heading and subheading",
    defaultProps: {
      eyebrow: "Section Label",
      heading: "Page Heading",
      highlight: "",
      subheading: "Descriptive paragraph that explains the purpose of this page.",
      align: "left",
      backgroundColor: "#ffffff",
      showAccent: true,
      padding: "large",
    }
  },

  // Content Blocks
  {
    id: "text",
    label: "Text Block",
    icon: Type,
    category: "Content",
    description: "Rich text content with styling options",
    defaultProps: {
      content: "Your content here.",
      align: "left",
      size: "base",
      fontWeight: "normal",
      textColor: "#374151",
      backgroundColor: "transparent",
      padding: "medium"
    }
  },
  {
    id: "contact-info",
    label: "Contact Info",
    icon: MessageSquare,
    category: "Content",
    description: "Beautiful contact details with icons (email, phone, address)",
    defaultProps: {
      heading: "Contact Details",
      subheading: "Reach out to us.",
      items: [
        { icon: "Mail", label: "Email", value: "info@example.com", href: "mailto:info@example.com" },
        { icon: "Phone", label: "Phone", value: "+44 20 0000 0000", href: "tel:+442000000000" },
        { icon: "MapPin", label: "Address", value: "London, UK", href: "" },
      ],
      backgroundColor: "#f8fafc",
      layout: "cards"
    }
  },
  
  // Media
  { 
    id: "image", 
    label: "Image", 
    icon: Image, 
    category: "Media",
    description: "Single image with caption and styling",
    defaultProps: { 
      src: "", 
      alt: "", 
      caption: "", 
      fullWidth: false,
      rounded: true,
      shadow: false,
      aspectRatio: "auto"
    } 
  },
  
  { 
    id: "image-text", 
    label: "Image + Text", 
    icon: LayoutGrid, 
    category: "Media",
    description: "Image with text side by side",
    defaultProps: { 
      heading: "Section Title", 
      text: "Description text.", 
      image: "", 
      imageLeft: true, 
      cta: "", 
      ctaLink: "",
      backgroundColor: "#ffffff",
      padding: "large"
    } 
  },
  
  { 
    id: "video", 
    label: "Video", 
    icon: PlayCircle, 
    category: "Media",
    description: "Embedded video player",
    defaultProps: { 
      url: "", 
      caption: "",
      autoplay: false,
      controls: true,
      aspectRatio: "16:9"
    } 
  },
  
  // Layout Components
  { 
    id: "cards", 
    label: "Cards Grid", 
    icon: LayoutGrid, 
    category: "Layout",
    description: "Grid of cards with icons and text",
    defaultProps: { 
      heading: "Our Services", 
      cards: [
        { title: "Card 1", text: "Description", icon: "âœ¦", link: "" }, 
        { title: "Card 2", text: "Description", icon: "âœ¦", link: "" }, 
        { title: "Card 3", text: "Description", icon: "âœ¦", link: "" }
      ],
      columns: 3,
      cardStyle: "default",
      backgroundColor: "#f9fafb"
    } 
  },
  
  { 
    id: "stats", 
    label: "Stats Bar", 
    icon: Star, 
    category: "Layout",
    description: "Statistics display with numbers",
    defaultProps: { 
      items: [
        { value: "500+", label: "Cases", icon: "" }, 
        { value: "10+", label: "Years", icon: "" }, 
        { value: "98%", label: "Satisfaction", icon: "" }
      ],
      layout: "horizontal",
      backgroundColor: "#ffffff",
      showIcons: false
    } 
  },
  
  { 
    id: "team", 
    label: "Team Grid", 
    icon: Users, 
    category: "Layout",
    description: "Team member profiles",
    defaultProps: { 
      heading: "Meet the Team", 
      members: [
        { name: "Name", title: "Role", photo: "", bio: "", social: {} }
      ],
      columns: 4,
      showBio: false,
      backgroundColor: "#ffffff"
    } 
  },
  
  // Interactive
  { 
    id: "testimonials",
    label: "Testimonials", 
    icon: MessageSquare, 
    category: "Interactive",
    description: "Customer testimonials with ratings",
    defaultProps: { 
      heading: "What Clients Say", 
      items: [
        { name: "Dr. Smith", text: "Excellent work!", rating: 5, role: "Dentist" }
      ],
      layout: "grid",
      showPhotos: false,
      backgroundColor: "#f9fafb"
    } 
  },
  
  { 
    id: "accordion", 
    label: "FAQ / Accordion",
    icon: ChevronDown, 
    category: "Interactive",
    description: "Expandable FAQ items",
    defaultProps: { 
      heading: "FAQ", 
      items: [
        { q: "Question?", a: "Answer." }
      ],
      backgroundColor: "#ffffff",
      iconStyle: "chevron"
    } 
  },
  
  // Actions
  { 
    id: "cta", 
    label: "Call to Action", 
    icon: Zap, 
    category: "Actions",
    description: "Prominent call-to-action section",
    defaultProps: { 
      heading: "Ready to get started?", 
      text: "Contact us today.", 
      buttonText: "Contact Us", 
      buttonLink: "/contact", 
      bgColor: "#0aabbd",
      buttonStyle: "primary",
      textAlign: "center"
    } 
  },
  
  // Utility
  {
    id: "divider",
    label: "Divider",
    icon: Minus,
    category: "Utility",
    description: "Visual separator between sections",
    defaultProps: {
      style: "solid",
      margin: "md",
      color: "#e5e7eb",
      thickness: "1px"
    }
  },

  // â”€â”€ Page Section Blocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: "about-hero",
    label: "About â€” Hero with Gallery",
    icon: Image,
    category: "Page Sections",
    description: "Two-column About hero: text left, photo gallery right",
    defaultProps: {
      eyebrow: "Facility",
      heading: "About Prime Smile Dental Laboratory",
      highlight: "Prime Smile",
      subheading: "Prime Smile is a fully digital dental laboratory operating across the UK and Cyprus. We partner with dental clinics who demand precision, accountability and consistent results.",
      cta1: "Contact Us",
      cta1Link: "/contact",
      cta2: "Our Workflow",
      cta2Link: "/workflow",
      gallery: [
        { src: "https://images.pexels.com/photos/7800553/pexels-photo-7800553.jpeg?w=800&q=80&auto=format&fit=crop", alt: "Dental laboratory facility", span: "col-span-2 row-span-2" },
        { src: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=600&q=80&auto=format&fit=crop", alt: "CAD/CAM design workstation", span: "" },
        { src: "https://images.unsplash.com/photo-1590424693420-634a0b0b782c?w=600&q=80&auto=format&fit=crop", alt: "Dental equipment", span: "" },
        { src: "https://images.pexels.com/photos/5355922/pexels-photo-5355922.jpeg?w=600&q=80&auto=format&fit=crop", alt: "Lab technician at work", span: "" },
        { src: "https://images.pexels.com/photos/6501859/pexels-photo-6501859.jpeg?w=600&q=80&auto=format&fit=crop", alt: "Dental prosthetics finishing", span: "" },
      ]
    }
  },

  // â”€â”€ Home Page Sections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: "home-hero",
    label: "Home â€” Hero",
    icon: Zap,
    category: "Home Sections",
    description: "Full-width hero with background image, heading and CTAs",
    defaultProps: {
      eyebrow: "Digital Dental Laboratory",
      heading: "Digital Dental Laboratory for UK & Cyprus Dentists",
      highlight: "UK & Cyprus",
      subheading: "CAD/CAM milling Â· SLM metal printing Â· Zirconia Â· Lithium disilicate Â· Implant prosthetics Â· Digital prescription workflow.",
      gallery: [
        { src: "https://images.unsplash.com/photo-1684607631747-045ecfeeb4c7?w=1600&q=80&auto=format&fit=crop", alt: "Lab facility" },
        { src: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=1600&q=80&auto=format&fit=crop", alt: "CAD/CAM workflow" },
        { src: "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=1600&q=80&auto=format&fit=crop", alt: "Zirconia restoration" },
      ],
      cta1: "Submit a Case",
      cta1Link: "/submit",
      cta2: "Request Free Consultation",
      cta2Link: "/contact",
    }
  },
  {
    id: "home-trust-strip",
    label: "Home â€” Trust Strip",
    icon: Lock,
    category: "Home Sections",
    description: "4-column icon features strip",
    defaultProps: {
      items: [
        { icon: "Cpu", title: "Digital", desc: "CAD/CAM Workflow" },
        { icon: "Lock", title: "Confidential", desc: "Patient Data Protection" },
        { icon: "FlaskConical", title: "Advanced", desc: "CE-Certified Materials" },
        { icon: "Target", title: "Precision", desc: "Multi-Step Quality Control" },
      ]
    }
  },
  {
    id: "home-stats",
    label: "Home â€” Stats & About",
    icon: Star,
    category: "Home Sections",
    description: "About text with animated stat counters",
    defaultProps: {
      eyebrow: "About Us",
      heading: "A digital lab built around precision, traceability and trust.",
      body: "Prime Smile is a fully digital dental laboratory partnering with dentists across the UK and Cyprus. Every case is processed through a structured digital prescription workflow with strict quality control at every stage.",
      linkText: "About Us",
      linkHref: "/about",
      stats: [
        { value: "10", suffix: "+", label: "Years of Digital Lab Experience" },
        { value: "500", suffix: "+", label: "Cases Delivered Per Month" },
        { value: "6", suffix: "", label: "Multi-Step Quality Control Points" },
        { value: "100", suffix: "%", label: "CE-Certified Materials Used" },
      ]
    }
  },
  {
    id: "home-workflow",
    label: "Home â€” Workflow Steps",
    icon: Layers,
    category: "Home Sections",
    description: "5-step numbered workflow with heading",
    defaultProps: {
      eyebrow: "Modern Approach",
      heading: "Our Digital Workflow",
      subheading: "We use advanced digital instruments and workflow to ensure the highest standard of every restoration.",
      steps: [
        "Register / Login",
        "Fill Digital Prescription",
        "Upload Scans & Files",
        "Track Your Case Live",
        "Receive Finished Work"
      ],
      linkText: "Learn about our Digital Workflow",
      linkHref: "/workflow"
    }
  },
  {
    id: "home-services",
    label: "Home â€” Services Grid",
    icon: Wrench,
    category: "Home Sections",
    description: "6 service cards with icons and descriptions",
    defaultProps: {
      eyebrow: "Our Services",
      heading: "Comprehensive Lab Services",
      subheading: "We provide a full range of dental laboratory services. Every case is managed with a digital prescription workflow.",
      services: [
        { icon: "Smile", title: "Fixed Restorations", desc: "Crowns, bridges, veneers, inlays & onlays in zirconia and lithium disilicate." },
        { icon: "Wrench", title: "Implant Prosthetics", desc: "Custom abutments, screw-retained crowns, bars and full-arch restorations." },
        { icon: "Layers", title: "Removable Prosthetics", desc: "Full and partial dentures with digital design and high-precision fit." },
        { icon: "Frame", title: "Metal Frameworks", desc: "Cobalt-chrome frameworks via SLM metal printing for accuracy and strength." },
        { icon: "Shield", title: "Splints & Guards", desc: "Night guards, bruxism splints and surgical guides from validated workflows." },
        { icon: "PencilRuler", title: "Digital Design Support", desc: "STL design, smile design and treatment planning collaboration." },
      ],
      linkText: "View All Services",
      linkHref: "/services"
    }
  },
  {
    id: "home-specialisations",
    label: "Home â€” Specialisations Grid",
    icon: LayoutGrid,
    category: "Home Sections",
    description: "8-tile photo grid with overlay text",
    defaultProps: {
      eyebrow: "Specialisations",
      heading: "Our Core Restorations",
      subheading: "Every restoration is crafted using industry-leading materials and digital precision workflow.",
      tiles: [
        { label: "Zirconia", sub: "Achieve High Level Of Aesthetic\nWithout Sacrificing Durability", img: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=600&q=80&auto=format&fit=crop", text: true },
        { label: "", sub: "", img: "https://images.pexels.com/photos/7800553/pexels-photo-7800553.jpeg?w=600&q=80&auto=format&fit=crop", text: false },
        { label: "Porcelain", sub: "Aesthetic And Function Are\nTogether", img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=80&auto=format&fit=crop", text: true },
        { label: "", sub: "", img: "https://images.pexels.com/photos/5355922/pexels-photo-5355922.jpeg?w=600&q=80&auto=format&fit=crop", text: false },
        { label: "Implants", sub: "Long Lasting Prosthetics", img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80&auto=format&fit=crop", text: true },
        { label: "", sub: "", img: "https://images.pexels.com/photos/6501859/pexels-photo-6501859.jpeg?w=600&q=80&auto=format&fit=crop", text: false },
        { label: "Inlays / Onlays", sub: "Perfect Match At The Most\nPrecision Points", img: "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&q=80&auto=format&fit=crop", text: true },
        { label: "", sub: "", img: "https://images.pexels.com/photos/33800642/pexels-photo-33800642.jpeg?w=600&q=80&auto=format&fit=crop", text: false },
      ]
    }
  },
  {
    id: "home-technology",
    label: "Home â€” Technology",
    icon: Cpu,
    category: "Home Sections",
    description: "Dark tech cards grid with equipment list",
    defaultProps: {
      eyebrow: "Technology",
      heading: "A Complete Digital Production Environment",
      items: [
        { name: "ALFAMILL 5-Axis / Yena D30", brand: "CAD/CAM Milling", tags: "Zirconia, PMMA" },
        { name: "VENEA VDexk1 eco", brand: "SLM Metal Printing", tags: "Co-Cr, Frameworks" },
        { name: "Asiga MAX UV", brand: "DLP 3D Printing", tags: "Models, Splints" },
        { name: "Dental Wings 7 Series", brand: "Scanning & Design", tags: "Scan, CAD" },
        { name: "Ivoclar Programat / SpeedFire", brand: "Sintering & Firing", tags: "Ceramic" },
        { name: "Renfert / KaVo", brand: "Finishing & Polishing", tags: "Surface" },
        { name: "Bio-Art / Deflex", brand: "Model Workflow", tags: "Articulator" },
        { name: "EKOSAN / Stanley AIR COM", brand: "Air Infrastructure", tags: "Clean Air" },
      ],
      linkText: "View All Technology",
      linkHref: "/technology"
    }
  },
  {
    id: "home-production",
    label: "Home â€” Production",
    icon: Frame,
    category: "Home Sections",
    description: "Marquee brand strip with 3 image cards",
    defaultProps: {
      eyebrow: "Production",
      heading: "Built on Industry-Leading Standards",
      brands: "ALFAMILL,VENEA,Asiga,Dental Wings,Ivoclar,CEREC,Renfert,KaVo,DHL,CE Certified",
      cards: [
        { title: "Materials & Equipment", img: "materials & equipment" },
        { title: "Production Timeline", img: "production timeline" },
        { title: "Production Management", img: "production management" },
      ]
    }
  },
  {
    id: "home-badges",
    label: "Home â€” Badges",
    icon: CheckCircle2,
    category: "Home Sections",
    description: "4-column icon certification badges",
    defaultProps: {
      items: [
        { title: "CE-Certified Consumables", desc: "Verified supplier materials" },
        { title: "Quality Practices", desc: "Documented QC checkpoints" },
        { title: "CE-Certified Materials", desc: "World-Renowned Suppliers" },
        { title: "Digital Case Tracking", desc: "Submission to Dispatch" },
      ]
    }
  },
  {
    id: "home-cta",
    label: "Home â€” CTA Banner",
    icon: ArrowUpRight,
    category: "Home Sections",
    description: "Full-width gradient call-to-action",
    defaultProps: {
      heading: "Ready to Submit Your First Case?",
      subheading: "Diagnosis is free. Every case is managed with a digital prescription. Treatment plans are customised to your needs.",
      btn1: "Create Dentist Account",
      btn1Link: "/portal",
      btn2: "WhatsApp Us",
      btn2Link: "#"
    }
  },
  {
    id: "home-news",
    label: "Home â€” News",
    icon: BookOpen,
    category: "Home Sections",
    description: "3 news article cards",
    defaultProps: {
      heading: "News & Updates",
      linkText: "All News",
      linkHref: "#",
      articles: [
        { category: "Industry News", title: "New SLM metal printing capabilities now live in our Cyprus facility", date: "12 Apr 2026", img: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=800&q=80&auto=format&fit=crop" },
        { category: "Case Study", title: "Full-arch implant rehabilitation: workflow walkthrough", date: "28 Mar 2026", img: "https://images.unsplash.com/photo-1684607631747-045ecfeeb4c7?w=800&q=80&auto=format&fit=crop" },
        { category: "Materials", title: "Updated zirconia portfolio: improved translucency and strength", date: "14 Mar 2026", img: "https://images.unsplash.com/photo-1590424693420-634a0b0b782c?w=800&q=80&auto=format&fit=crop" },
      ]
    }
  },
  {
    id: "site-footer",
    label: "Site Footer",
    icon: LayoutGrid,
    category: "Layout",
    description: "Global footer: brand, link columns, socials and legal links",
    defaultProps: {
      brandName: "Prime Smile",
      brandRest: " Dental Laboratory",
      description: "Advanced digital dental laboratory serving UK and Cyprus dentists. Focused on precision, quality, and long-term results. All cases handled with strict confidentiality.",
      socials: [
        { icon: "Linkedin", href: "#" },
        { icon: "Facebook", href: "#" },
        { icon: "Instagram", href: "#" },
        { icon: "Mail", href: "#" },
      ],
      columns: [
        { title: "Lab Services", links: [
          { label: "Fixed Restorations", href: "/services/fixed-restorations" },
          { label: "Implant Prosthetics", href: "/services/implant-prosthetics" },
          { label: "Removable Prosthetics", href: "/services/removable-prosthetics" },
          { label: "Metal Frameworks", href: "/services/metal-frameworks" },
          { label: "Splints & Guards", href: "/services/splints-guards" },
        ] },
        { title: "Resources", links: [
          { label: "Prescription Guide", href: "/resources" },
          { label: "Material Guide", href: "/resources" },
          { label: "FAQs", href: "/resources" },
        ] },
        { title: "Support", links: [
          { label: "Quality & Compliance", href: "/quality" },
          { label: "Technology", href: "/technology" },
          { label: "Contact", href: "/contact" },
          { label: "Dentist Portal", href: "/portal" },
        ] },
      ],
      copyright: "Â© {year} Prime Smile Dental Laboratory. All rights reserved.",
      legal: [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms of Service", href: "/terms-of-service" },
        { label: "Data Notice", href: "/data-notice" },
      ],
    }
  },
];

const BLOCK_CATEGORIES = [
  { id: "header", label: "Header & Hero", icon: Zap },
  { id: "content", label: "Content", icon: Type },
  { id: "media", label: "Media", icon: Image },
  { id: "layout", label: "Layout", icon: LayoutGrid },
  { id: "interactive", label: "Interactive", icon: MessageSquare },
  { id: "actions", label: "Actions", icon: ArrowUpRight },
  { id: "utility", label: "Utility", icon: Minus },
  { id: "home sections", label: "Home Sections", icon: LayoutGrid },
];

/* â”€â”€â”€ Block preview (shared) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function BlockPreview({ type, props }: { type: string; props: any }) {
  return <PageBlockRenderer type={type} props={props} />;
}

/* â”€â”€â”€ Props editor per block type â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      <input value={value || ""} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"/>
    </div>
  );
}
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      <textarea value={value || ""} onChange={e => onChange(e.target.value)} rows={3}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 resize-none"/>
    </div>
  );
}

type MediaItem = { _id: string; filename: string; originalName: string; url: string; mimeType: string; size: number; alt: string; createdAt: string };

function MediaPicker({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (url: string) => void }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    apiFetch<{ items: MediaItem[]; total: number }>(`/api/admin/media?limit=50&search=${encodeURIComponent(query)}`)
      .then(r => setItems(r.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">Choose from Media Library</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition"><X size={16}/></button>
        </div>
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search media..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-sm">Loading...</div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Image size={32} className="mb-2 opacity-30"/>
              <p className="text-sm">No media found</p>
              <p className="text-xs mt-1">Upload files in the Media Library first</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {items.map(m => (
                <button
                  key={m._id}
                  onClick={() => setSelected(m._id)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition hover:shadow-md ${selected === m._id ? "border-indigo-500 ring-2 ring-indigo-100" : "border-transparent"}`}
                >
                  <img src={m.url} alt={m.originalName} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1">
                    <p className="text-[10px] text-white truncate">{m.originalName}</p>
                  </div>
                  {selected === m._id && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                      <CheckCircle2 size={12} className="text-white"/>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition">Cancel</button>
          <button
            onClick={() => {
              const item = items.find(i => i._id === selected);
              if (item) onSelect(item.url);
              onClose();
            }}
            disabled={!selected}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Select Image
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("files", file);
      const r = await apiFetch<{ items: { url: string }[] }>("/api/admin/media", { method: "POST", body: form });
      if (r.items?.[0]?.url) onChange(r.items[0].url);
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      <div className="flex gap-2">
        <input value={value || ""} onChange={e => onChange(e.target.value)} placeholder="https://..."
          className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"/>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50 inline-flex items-center gap-1 shrink-0">
          {uploading ? <><Save size={12} className="animate-spin"/> Uploading</> : <><Upload size={12}/> Upload</>}
        </button>
        <button onClick={() => setPickerOpen(true)}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors inline-flex items-center gap-1 shrink-0">
          <Image size={12}/> Media
        </button>
      </div>
      {value && (
        <div className="mt-2 rounded-lg overflow-hidden border border-slate-100 h-20 w-full bg-slate-50">
          <img src={value} alt="Preview" className="h-full w-full object-contain" />
        </div>
      )}
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={onChange} />
    </div>
  );
}

function InlineImageField({ value, onChange, placeholder = "Image URL" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("files", file);
      const r = await apiFetch<{ items: { url: string }[] }>("/api/admin/media", { method: "POST", body: form });
      if (r.items?.[0]?.url) onChange(r.items[0].url);
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  return (
    <div className="flex gap-2 items-center">
      <input value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button onClick={() => fileRef.current?.click()} disabled={uploading}
        className="px-2 py-1.5 rounded-lg text-[10px] font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50 inline-flex items-center gap-1 shrink-0"
        title="Upload">
        {uploading ? <Save size={10} className="animate-spin"/> : <Upload size={10}/>}
      </button>
      <button onClick={() => setPickerOpen(true)}
        className="px-2 py-1.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors inline-flex items-center gap-1 shrink-0"
        title="Choose from media">
        <Image size={10}/>
      </button>
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={onChange} />
    </div>
  );
}

function BlockPropsEditor({ type, props, onChange }: { type: string; props: any; onChange: (p: any) => void }) {
  function set(key: string, val: any) { onChange({ ...props, [key]: val }); }

  switch (type) {
    case "hero": return (
      <div className="space-y-3">
        <TextField label="Eyebrow"    value={props.eyebrow}    onChange={v => set("eyebrow", v)}/>
        <TextField label="Heading"    value={props.heading}    onChange={v => set("heading", v)}/>
        <TextField label="Highlight Word" value={props.highlight} onChange={v => set("highlight", v)}/>
        <TextField label="Subheading" value={props.subheading} onChange={v => set("subheading", v)}/>
        <TextField label="CTA 1 Text"  value={props.cta1}       onChange={v => set("cta1", v)}/>
        <TextField label="CTA 1 Link"  value={props.cta1Link}   onChange={v => set("cta1Link", v)}/>
        <TextField label="CTA 2 Text"  value={props.cta2}       onChange={v => set("cta2", v)}/>
        <TextField label="CTA 2 Link"  value={props.cta2Link}   onChange={v => set("cta2Link", v)}/>
        <ImageField label="Image"       value={props.image}      onChange={v => set("image", v)}/>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Alignment</label>
          <div className="flex gap-2">
            {["left","center"].map(a => (
              <button key={a} onClick={() => set("align", a)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${props.align === a ? "bg-indigo-500 text-white border-indigo-500" : "border-slate-200 text-slate-600"}`}>{a}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Background Color</label>
          <div className="flex gap-2">
            <input type="color" value={props.bgColor || "#0d1e2c"} onChange={e => set("bgColor", e.target.value)} className="w-10 h-10 rounded-lg border border-slate-200 p-0.5"/>
            <input type="text" value={props.bgColor || ""} onChange={e => set("bgColor", e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-indigo-400"/>
          </div>
        </div>
      </div>
    );
    case "about-hero": return (
      <div className="space-y-3">
        <TextField label="Eyebrow"    value={props.eyebrow}    onChange={v => set("eyebrow", v)}/>
        <TextField label="Heading"    value={props.heading}    onChange={v => set("heading", v)}/>
        <TextField label="Highlight Word" value={props.highlight} onChange={v => set("highlight", v)}/>
        <TextArea label="Subheading" value={props.subheading} onChange={v => set("subheading", v)}/>
        <TextField label="CTA 1 Text"  value={props.cta1}       onChange={v => set("cta1", v)}/>
        <TextField label="CTA 1 Link"  value={props.cta1Link}   onChange={v => set("cta1Link", v)}/>
        <TextField label="CTA 2 Text"  value={props.cta2}       onChange={v => set("cta2", v)}/>
        <TextField label="CTA 2 Link"  value={props.cta2Link}   onChange={v => set("cta2Link", v)}/>
        <div className="text-xs font-medium text-slate-600 mb-1">Gallery Images</div>
        {(props.gallery || []).map((img: any, i: number) => (
          <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between"><span className="text-xs text-slate-400">Image {i + 1}</span><button onClick={() => set("gallery", props.gallery.filter((_: any, j: number) => j !== i))} className="text-red-400"><Trash2 size={12}/></button></div>
            <InlineImageField value={img.src} onChange={v => { const g = [...props.gallery]; g[i] = { ...g[i], src: v }; set("gallery", g); }}/>
            <input value={img.alt} onChange={e => { const g = [...props.gallery]; g[i] = { ...g[i], alt: e.target.value }; set("gallery", g); }} placeholder="Alt text" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={img.span} onChange={e => { const g = [...props.gallery]; g[i] = { ...g[i], span: e.target.value }; set("gallery", g); }} placeholder="Span class (e.g. col-span-2 row-span-2)" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
          </div>
        ))}
        <button onClick={() => set("gallery", [...(props.gallery || []), { src: "", alt: "", span: "" }])} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add image</button>
      </div>
    );
    case "text": return (
      <div className="space-y-3">
        <TextArea label="Content" value={props.content} onChange={v => set("content", v)}/>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Alignment</label>
          <div className="flex gap-2">
            {["left","center","right"].map(a => (
              <button key={a} onClick={() => set("align", a)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${props.align === a ? "bg-indigo-500 text-white border-indigo-500" : "border-slate-200 text-slate-600"}`}>{a}</button>
            ))}
          </div>
        </div>
      </div>
    );
    case "contact-info": return (
      <div className="space-y-3">
        <TextField label="Heading" value={props.heading} onChange={v => set("heading", v)}/>
        <TextField label="Subheading" value={props.subheading} onChange={v => set("subheading", v)}/>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Layout</label>
          <div className="flex gap-2">
            {["cards","list"].map(a => (
              <button key={a} onClick={() => set("layout", a)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize ${props.layout === a ? "bg-indigo-500 text-white border-indigo-500" : "border-slate-200 text-slate-600"}`}>{a}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Background Color</label>
          <div className="flex gap-2">
            <input type="color" value={props.backgroundColor || "#f8fafc"} onChange={e => set("backgroundColor", e.target.value)} className="w-10 h-10 rounded-lg border border-slate-200 p-0.5"/>
            <input type="text" value={props.backgroundColor || ""} onChange={e => set("backgroundColor", e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-indigo-400"/>
          </div>
        </div>
        <div className="text-xs font-medium text-slate-600 mb-1">Contact Items</div>
        {(props.items || []).map((item: any, i: number) => (
          <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Item {i + 1}</span>
              <button onClick={() => set("items", props.items.filter((_: any, j: number) => j !== i))} className="text-red-400"><Trash2 size={12}/></button>
            </div>
            <TextField label="Label" value={item.label} onChange={v => { const it = [...props.items]; it[i] = { ...it[i], label: v }; set("items", it); }}/>
            <TextField label="Value" value={item.value} onChange={v => { const it = [...props.items]; it[i] = { ...it[i], value: v }; set("items", it); }}/>
            <TextField label="Link (href)" value={item.href} onChange={v => { const it = [...props.items]; it[i] = { ...it[i], href: v }; set("items", it); }}/>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Icon</label>
              <select value={item.icon} onChange={e => { const it = [...props.items]; it[i] = { ...it[i], icon: e.target.value }; set("items", it); }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400">
                {["Mail","Phone","MapPin"].map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        <button onClick={() => set("items", [...(props.items || []), { icon: "Mail", label: "", value: "", href: "" }])}
          className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add item</button>
      </div>
    );
    case "image": return (
      <div className="space-y-3">
        <ImageField label="Image"     value={props.src}     onChange={v => set("src", v)}/>
        <TextField label="Alt Text"  value={props.alt}     onChange={v => set("alt", v)}/>
        <TextField label="Caption"   value={props.caption} onChange={v => set("caption", v)}/>
      </div>
    );
    case "image-text": return (
      <div className="space-y-3">
        <TextField label="Heading"   value={props.heading}  onChange={v => set("heading", v)}/>
        <TextArea  label="Text"      value={props.text}     onChange={v => set("text", v)}/>
        <ImageField label="Image"    value={props.image}    onChange={v => set("image", v)}/>
        <TextField label="CTA Text"  value={props.cta}      onChange={v => set("cta", v)}/>
        <TextField label="CTA Link"  value={props.ctaLink}  onChange={v => set("ctaLink", v)}/>
        <div className="flex items-center gap-2">
          <button onClick={() => set("imageLeft", !props.imageLeft)}
            className={`w-10 h-6 rounded-full transition-colors ${props.imageLeft ? "bg-indigo-500" : "bg-slate-200"}`}>
            <span className={`block w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${props.imageLeft ? "translate-x-4" : ""}`}/>
          </button>
          <span className="text-xs text-slate-600">Image on left</span>
        </div>
      </div>
    );
    case "cta": return (
      <div className="space-y-3">
        <TextField label="Heading"     value={props.heading}    onChange={v => set("heading", v)}/>
        <TextField label="Text"        value={props.text}       onChange={v => set("text", v)}/>
        <TextField label="Button Text" value={props.buttonText} onChange={v => set("buttonText", v)}/>
        <TextField label="Button Link" value={props.buttonLink} onChange={v => set("buttonLink", v)}/>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Background Color</label>
          <div className="flex gap-2">
            <input type="color" value={props.bgColor || "#0aabbd"} onChange={e => set("bgColor", e.target.value)} className="w-10 h-10 rounded-lg border border-slate-200 p-0.5"/>
            <input type="text" value={props.bgColor || ""} onChange={e => set("bgColor", e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-indigo-400"/>
          </div>
        </div>
      </div>
    );
    case "stats": return (
      <div className="space-y-3">
        <div className="text-xs font-medium text-slate-600 mb-1">Stats</div>
        {(props.items || []).map((item: any, i: number) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={item.value} onChange={e => { const it = [...props.items]; it[i] = { ...it[i], value: e.target.value }; set("items", it); }} placeholder="Value" className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={item.label} onChange={e => { const it = [...props.items]; it[i] = { ...it[i], label: e.target.value }; set("items", it); }} placeholder="Label" className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <button onClick={() => set("items", props.items.filter((_: any, j: number) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 size={13}/></button>
          </div>
        ))}
        <button onClick={() => set("items", [...(props.items || []), { value: "", label: "" }])}
          className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add stat</button>
      </div>
    );
    case "cards": return (
      <div className="space-y-3">
        <TextField label="Section Heading" value={props.heading} onChange={v => set("heading", v)}/>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Card Style</label>
          <div className="flex gap-2">
            {["default","borderLeft"].map(s => (
              <button key={s} onClick={() => set("cardStyle", s)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${props.cardStyle === s ? "bg-indigo-500 text-white border-indigo-500" : "border-slate-200 text-slate-600"}`}>{s === "borderLeft" ? "Left Border" : "Default"}</button>
            ))}
          </div>
        </div>
        {props.cardStyle === "borderLeft" && (
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Accent Color</label>
            <div className="flex gap-2">
              {["teal","gold","indigo","slate"].map(a => (
                <button key={a} onClick={() => set("accent", a)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize ${props.accent === a ? "bg-indigo-500 text-white border-indigo-500" : "border-slate-200 text-slate-600"}`}>{a}</button>
              ))}
            </div>
          </div>
        )}
        <div className="text-xs font-medium text-slate-600">Cards</div>
        {(props.cards || []).map((card: any, i: number) => (
          <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Card {i + 1}</span>
              <button onClick={() => set("cards", props.cards.filter((_: any, j: number) => j !== i))} className="text-red-400"><Trash2 size={12}/></button>
            </div>
            <input value={card.icon} onChange={e => { const c = [...props.cards]; c[i] = { ...c[i], icon: e.target.value }; set("cards", c); }} placeholder="Icon name (Lucide) or emoji" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={card.title} onChange={e => { const c = [...props.cards]; c[i] = { ...c[i], title: e.target.value }; set("cards", c); }} placeholder="Title" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={card.text} onChange={e => { const c = [...props.cards]; c[i] = { ...c[i], text: e.target.value }; set("cards", c); }} placeholder="Text" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
          </div>
        ))}
        <button onClick={() => set("cards", [...(props.cards || []), { title: "", text: "", icon: "âœ¦" }])}
          className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add card</button>
      </div>
    );
    case "accordion": return (
      <div className="space-y-3">
        <TextField label="Section Heading" value={props.heading} onChange={v => set("heading", v)}/>
        {(props.items || []).map((item: any, i: number) => (
          <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Item {i + 1}</span>
              <button onClick={() => set("items", props.items.filter((_: any, j: number) => j !== i))} className="text-red-400"><Trash2 size={12}/></button>
            </div>
            <input value={item.q} onChange={e => { const it = [...props.items]; it[i] = { ...it[i], q: e.target.value }; set("items", it); }} placeholder="Question" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <textarea value={item.a} onChange={e => { const it = [...props.items]; it[i] = { ...it[i], a: e.target.value }; set("items", it); }} placeholder="Answer" rows={2} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none resize-none"/>
          </div>
        ))}
        <button onClick={() => set("items", [...(props.items || []), { q: "", a: "" }])}
          className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add item</button>
      </div>
    );
    case "video": return <TextField label="Video URL (YouTube/Vimeo)" value={props.url} onChange={v => set("url", v)}/>;
    case "testimonials": return (
      <div className="space-y-3">
        <TextField label="Section Heading" value={props.heading} onChange={v => set("heading", v)}/>
        {(props.items || []).map((item: any, i: number) => (
          <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between"><span className="text-xs text-slate-400">Testimonial {i + 1}</span><button onClick={() => set("items", props.items.filter((_: any, j: number) => j !== i))} className="text-red-400"><Trash2 size={12}/></button></div>
            <input value={item.name} onChange={e => { const it = [...props.items]; it[i] = { ...it[i], name: e.target.value }; set("items", it); }} placeholder="Name" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <textarea value={item.text} onChange={e => { const it = [...props.items]; it[i] = { ...it[i], text: e.target.value }; set("items", it); }} placeholder="Quote" rows={2} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none resize-none"/>
          </div>
        ))}
        <button onClick={() => set("items", [...(props.items || []), { name: "", text: "", rating: 5 }])} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add testimonial</button>
      </div>
    );

    /* â”€â”€ Home Section Props Editors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    case "home-hero": return (
      <div className="space-y-3">
        <TextField label="Eyebrow" value={props.eyebrow} onChange={v => set("eyebrow", v)}/>
        <TextField label="Heading" value={props.heading} onChange={v => set("heading", v)}/>
        <TextField label="Highlight Word" value={props.highlight} onChange={v => set("highlight", v)}/>
        <TextArea label="Subheading" value={props.subheading} onChange={v => set("subheading", v)}/>
        <div className="text-xs font-medium text-slate-600 mb-1">Background Slideshow</div>
        {(props.gallery || []).map((img: any, i: number) => (
          <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between"><span className="text-xs text-slate-400">Slide {i + 1}</span><button onClick={() => set("gallery", props.gallery.filter((_: any, j: number) => j !== i))} className="text-red-400"><Trash2 size={12}/></button></div>
            <InlineImageField value={img.src} onChange={v => { const g = [...props.gallery]; g[i] = { ...g[i], src: v }; set("gallery", g); }}/>
            <input value={img.alt} onChange={e => { const g = [...props.gallery]; g[i] = { ...g[i], alt: e.target.value }; set("gallery", g); }} placeholder="Alt text" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
          </div>
        ))}
        <button onClick={() => set("gallery", [...(props.gallery || []), { src: "", alt: "" }])} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add slide</button>
        <TextField label="CTA 1 Text" value={props.cta1} onChange={v => set("cta1", v)}/>
        <TextField label="CTA 1 Link" value={props.cta1Link} onChange={v => set("cta1Link", v)}/>
        <TextField label="CTA 2 Text" value={props.cta2} onChange={v => set("cta2", v)}/>
        <TextField label="CTA 2 Link" value={props.cta2Link} onChange={v => set("cta2Link", v)}/>
      </div>
    );
    case "home-trust-strip": return (
      <div className="space-y-3">
        <div className="text-xs font-medium text-slate-600 mb-1">Features</div>
        {(props.items || []).map((item: any, i: number) => (
          <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between"><span className="text-xs text-slate-400">Feature {i + 1}</span><button onClick={() => set("items", props.items.filter((_: any, j: number) => j !== i))} className="text-red-400"><Trash2 size={12}/></button></div>
            <input value={item.icon} onChange={e => { const it = [...props.items]; it[i] = { ...it[i], icon: e.target.value }; set("items", it); }} placeholder="Icon name (e.g. Cpu)" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={item.title} onChange={e => { const it = [...props.items]; it[i] = { ...it[i], title: e.target.value }; set("items", it); }} placeholder="Title" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={item.desc} onChange={e => { const it = [...props.items]; it[i] = { ...it[i], desc: e.target.value }; set("items", it); }} placeholder="Description" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
          </div>
        ))}
        <button onClick={() => set("items", [...(props.items || []), { icon: "", title: "", desc: "" }])} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add feature</button>
      </div>
    );
    case "home-stats": return (
      <div className="space-y-3">
        <TextField label="Eyebrow" value={props.eyebrow} onChange={v => set("eyebrow", v)}/>
        <TextField label="Heading" value={props.heading} onChange={v => set("heading", v)}/>
        <TextArea label="Body Text" value={props.body} onChange={v => set("body", v)}/>
        <TextField label="Link Text" value={props.linkText} onChange={v => set("linkText", v)}/>
        <TextField label="Link Href" value={props.linkHref} onChange={v => set("linkHref", v)}/>
        <div className="text-xs font-medium text-slate-600 mb-1">Stats</div>
        {(props.stats || []).map((s: any, i: number) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={s.value} onChange={e => { const st = [...props.stats]; st[i] = { ...st[i], value: e.target.value }; set("stats", st); }} placeholder="Value" className="w-20 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={s.suffix} onChange={e => { const st = [...props.stats]; st[i] = { ...st[i], suffix: e.target.value }; set("stats", st); }} placeholder="Suffix" className="w-14 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={s.label} onChange={e => { const st = [...props.stats]; st[i] = { ...st[i], label: e.target.value }; set("stats", st); }} placeholder="Label" className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <button onClick={() => set("stats", props.stats.filter((_: any, j: number) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 size={13}/></button>
          </div>
        ))}
        <button onClick={() => set("stats", [...(props.stats || []), { value: "", suffix: "", label: "" }])} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add stat</button>
      </div>
    );
    case "home-workflow": return (
      <div className="space-y-3">
        <TextField label="Eyebrow" value={props.eyebrow} onChange={v => set("eyebrow", v)}/>
        <TextField label="Heading" value={props.heading} onChange={v => set("heading", v)}/>
        <TextArea label="Subheading" value={props.subheading} onChange={v => set("subheading", v)}/>
        <TextField label="Link Text" value={props.linkText} onChange={v => set("linkText", v)}/>
        <TextField label="Link Href" value={props.linkHref} onChange={v => set("linkHref", v)}/>
        <div className="text-xs font-medium text-slate-600 mb-1">Steps</div>
        {(props.steps || []).map((step: string, i: number) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="text-xs text-slate-400 w-4">{i + 1}</span>
            <input value={step} onChange={e => { const st = [...props.steps]; st[i] = e.target.value; set("steps", st); }} className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <button onClick={() => set("steps", props.steps.filter((_: any, j: number) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 size={13}/></button>
          </div>
        ))}
        <button onClick={() => set("steps", [...(props.steps || []), ""])} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add step</button>
      </div>
    );
    case "home-services": return (
      <div className="space-y-3">
        <TextField label="Eyebrow" value={props.eyebrow} onChange={v => set("eyebrow", v)}/>
        <TextField label="Heading" value={props.heading} onChange={v => set("heading", v)}/>
        <TextArea label="Subheading" value={props.subheading} onChange={v => set("subheading", v)}/>
        <TextField label="Link Text" value={props.linkText} onChange={v => set("linkText", v)}/>
        <TextField label="Link Href" value={props.linkHref} onChange={v => set("linkHref", v)}/>
        <div className="text-xs font-medium text-slate-600 mb-1">Services</div>
        {(props.services || []).map((s: any, i: number) => (
          <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between"><span className="text-xs text-slate-400">Service {i + 1}</span><button onClick={() => set("services", props.services.filter((_: any, j: number) => j !== i))} className="text-red-400"><Trash2 size={12}/></button></div>
            <input value={s.icon} onChange={e => { const sv = [...props.services]; sv[i] = { ...sv[i], icon: e.target.value }; set("services", sv); }} placeholder="Icon name (e.g. Smile)" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={s.title} onChange={e => { const sv = [...props.services]; sv[i] = { ...sv[i], title: e.target.value }; set("services", sv); }} placeholder="Title" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <textarea value={s.desc} onChange={e => { const sv = [...props.services]; sv[i] = { ...sv[i], desc: e.target.value }; set("services", sv); }} placeholder="Description" rows={2} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none resize-none"/>
          </div>
        ))}
        <button onClick={() => set("services", [...(props.services || []), { icon: "", title: "", desc: "" }])} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add service</button>
      </div>
    );
    case "home-specialisations": return (
      <div className="space-y-3">
        <TextField label="Eyebrow" value={props.eyebrow} onChange={v => set("eyebrow", v)}/>
        <TextField label="Heading" value={props.heading} onChange={v => set("heading", v)}/>
        <TextArea label="Subheading" value={props.subheading} onChange={v => set("subheading", v)}/>
        <div className="text-xs font-medium text-slate-600 mb-1">Tiles</div>
        {(props.tiles || []).map((tile: any, i: number) => (
          <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between"><span className="text-xs text-slate-400">Tile {i + 1}</span><button onClick={() => set("tiles", props.tiles.filter((_: any, j: number) => j !== i))} className="text-red-400"><Trash2 size={12}/></button></div>
            <input value={tile.label} onChange={e => { const t = [...props.tiles]; t[i] = { ...t[i], label: e.target.value }; set("tiles", t); }} placeholder="Label (leave empty for image-only)" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <textarea value={tile.sub} onChange={e => { const t = [...props.tiles]; t[i] = { ...t[i], sub: e.target.value }; set("tiles", t); }} placeholder="Subtitle" rows={2} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none resize-none"/>
            <InlineImageField value={tile.img} onChange={v => { const t = [...props.tiles]; t[i] = { ...t[i], img: v }; set("tiles", t); }}/>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={!!tile.text} onChange={e => { const t = [...props.tiles]; t[i] = { ...t[i], text: e.target.checked }; set("tiles", t); }} className="rounded"/>
              <span className="text-xs text-slate-500">Show text overlay</span>
            </div>
          </div>
        ))}
        <button onClick={() => set("tiles", [...(props.tiles || []), { label: "", sub: "", img: "", text: false }])} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add tile</button>
      </div>
    );
    case "home-technology": return (
      <div className="space-y-3">
        <TextField label="Eyebrow" value={props.eyebrow} onChange={v => set("eyebrow", v)}/>
        <TextField label="Heading" value={props.heading} onChange={v => set("heading", v)}/>
        <TextField label="Link Text" value={props.linkText} onChange={v => set("linkText", v)}/>
        <TextField label="Link Href" value={props.linkHref} onChange={v => set("linkHref", v)}/>
        <div className="text-xs font-medium text-slate-600 mb-1">Equipment</div>
        {(props.items || []).map((t: any, i: number) => (
          <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between"><span className="text-xs text-slate-400">Item {i + 1}</span><button onClick={() => set("items", props.items.filter((_: any, j: number) => j !== i))} className="text-red-400"><Trash2 size={12}/></button></div>
            <input value={t.name} onChange={e => { const it = [...props.items]; it[i] = { ...it[i], name: e.target.value }; set("items", it); }} placeholder="Equipment name" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={t.brand} onChange={e => { const it = [...props.items]; it[i] = { ...it[i], brand: e.target.value }; set("items", it); }} placeholder="Brand / Type" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={t.tags} onChange={e => { const it = [...props.items]; it[i] = { ...it[i], tags: e.target.value }; set("items", it); }} placeholder="Tags (comma separated)" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
          </div>
        ))}
        <button onClick={() => set("items", [...(props.items || []), { name: "", brand: "", tags: "" }])} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add equipment</button>
      </div>
    );
    case "home-production": return (
      <div className="space-y-3">
        <TextField label="Eyebrow" value={props.eyebrow} onChange={v => set("eyebrow", v)}/>
        <TextField label="Heading" value={props.heading} onChange={v => set("heading", v)}/>
        <TextField label="Brands (comma separated)" value={props.brands} onChange={v => set("brands", v)}/>
        <div className="text-xs font-medium text-slate-600 mb-1">Cards</div>
        {(props.cards || []).map((c: any, i: number) => (
          <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between"><span className="text-xs text-slate-400">Card {i + 1}</span><button onClick={() => set("cards", props.cards.filter((_: any, j: number) => j !== i))} className="text-red-400"><Trash2 size={12}/></button></div>
            <input value={c.title} onChange={e => { const ca = [...props.cards]; ca[i] = { ...ca[i], title: e.target.value }; set("cards", ca); }} placeholder="Title" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={c.img} onChange={e => { const ca = [...props.cards]; ca[i] = { ...ca[i], img: e.target.value }; set("cards", ca); }} placeholder="Image label (Placeholder map key)" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
          </div>
        ))}
        <button onClick={() => set("cards", [...(props.cards || []), { title: "", img: "" }])} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add card</button>
      </div>
    );
    case "home-badges": return (
      <div className="space-y-3">
        <div className="text-xs font-medium text-slate-600 mb-1">Badges</div>
        {(props.items || []).map((b: any, i: number) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={b.title} onChange={e => { const it = [...props.items]; it[i] = { ...it[i], title: e.target.value }; set("items", it); }} placeholder="Title" className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={b.desc} onChange={e => { const it = [...props.items]; it[i] = { ...it[i], desc: e.target.value }; set("items", it); }} placeholder="Description" className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <button onClick={() => set("items", props.items.filter((_: any, j: number) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 size={13}/></button>
          </div>
        ))}
        <button onClick={() => set("items", [...(props.items || []), { title: "", desc: "" }])} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add badge</button>
      </div>
    );
    case "home-cta": return (
      <div className="space-y-3">
        <TextField label="Heading" value={props.heading} onChange={v => set("heading", v)}/>
        <TextArea label="Subheading" value={props.subheading} onChange={v => set("subheading", v)}/>
        <TextField label="Button 1 Text" value={props.btn1} onChange={v => set("btn1", v)}/>
        <TextField label="Button 1 Link" value={props.btn1Link} onChange={v => set("btn1Link", v)}/>
        <TextField label="Button 2 Text" value={props.btn2} onChange={v => set("btn2", v)}/>
        <TextField label="Button 2 Link" value={props.btn2Link} onChange={v => set("btn2Link", v)}/>
      </div>
    );
    case "home-news": return (
      <div className="space-y-3">
        <TextField label="Heading" value={props.heading} onChange={v => set("heading", v)}/>
        <TextField label="Link Text" value={props.linkText} onChange={v => set("linkText", v)}/>
        <TextField label="Link Href" value={props.linkHref} onChange={v => set("linkHref", v)}/>
        <div className="text-xs font-medium text-slate-600 mb-1">Articles</div>
        {(props.articles || []).map((a: any, i: number) => (
          <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between"><span className="text-xs text-slate-400">Article {i + 1}</span><button onClick={() => set("articles", props.articles.filter((_: any, j: number) => j !== i))} className="text-red-400"><Trash2 size={12}/></button></div>
            <input value={a.category} onChange={e => { const ar = [...props.articles]; ar[i] = { ...ar[i], category: e.target.value }; set("articles", ar); }} placeholder="Category" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={a.title} onChange={e => { const ar = [...props.articles]; ar[i] = { ...ar[i], title: e.target.value }; set("articles", ar); }} placeholder="Title" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={a.date} onChange={e => { const ar = [...props.articles]; ar[i] = { ...ar[i], date: e.target.value }; set("articles", ar); }} placeholder="Date" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <InlineImageField value={a.img} onChange={v => { const ar = [...props.articles]; ar[i] = { ...ar[i], img: v }; set("articles", ar); }}/>
          </div>
        ))}
        <button onClick={() => set("articles", [...(props.articles || []), { category: "", title: "", date: "", img: "" }])} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add article</button>
      </div>
    );
    case "team": return (
      <div className="space-y-3">
        <TextField label="Section Heading" value={props.heading} onChange={v => set("heading", v)}/>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Columns</label>
          <div className="flex gap-2">
            {[2,3,4].map(c => (
              <button key={c} onClick={() => set("columns", c)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${props.columns === c ? "bg-indigo-500 text-white border-indigo-500" : "border-slate-200 text-slate-600"}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => set("showBio", !props.showBio)}
            className={`w-10 h-6 rounded-full transition-colors ${props.showBio ? "bg-indigo-500" : "bg-slate-200"}`}>
            <span className={`block w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${props.showBio ? "translate-x-4" : ""}`}/>
          </button>
          <span className="text-xs text-slate-600">Show bio</span>
        </div>
        <div className="text-xs font-medium text-slate-600 mb-1">Members</div>
        {(props.members || []).map((m: any, i: number) => (
          <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between"><span className="text-xs text-slate-400">Member {i + 1}</span><button onClick={() => set("members", props.members.filter((_: any, j: number) => j !== i))} className="text-red-400"><Trash2 size={12}/></button></div>
            <input value={m.name} onChange={e => { const mem = [...props.members]; mem[i] = { ...mem[i], name: e.target.value }; set("members", mem); }} placeholder="Name" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={m.title} onChange={e => { const mem = [...props.members]; mem[i] = { ...mem[i], title: e.target.value }; set("members", mem); }} placeholder="Role / Title" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <InlineImageField value={m.photo} onChange={v => { const mem = [...props.members]; mem[i] = { ...mem[i], photo: v }; set("members", mem); }}/>
            <textarea value={m.bio} onChange={e => { const mem = [...props.members]; mem[i] = { ...mem[i], bio: e.target.value }; set("members", mem); }} placeholder="Bio" rows={2} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none resize-none"/>
          </div>
        ))}
        <button onClick={() => set("members", [...(props.members || []), { name: "", title: "", photo: "", bio: "" }])} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add member</button>
      </div>
    );
    case "divider": return (
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Style</label>
          <div className="flex gap-2">
            {["solid","dashed","dotted"].map(s => (
              <button key={s} onClick={() => set("style", s)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize ${props.style === s ? "bg-indigo-500 text-white border-indigo-500" : "border-slate-200 text-slate-600"}`}>{s}</button>
            ))}
          </div>
        </div>
        <TextField label="Color" value={props.color} onChange={v => set("color", v)}/>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Thickness</label>
          <div className="flex gap-2">
            {["1px","2px","4px"].map(t => (
              <button key={t} onClick={() => set("thickness", t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border ${props.thickness === t ? "bg-indigo-500 text-white border-indigo-500" : "border-slate-200 text-slate-600"}`}>{t}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Margin</label>
          <div className="flex gap-2">
            {["sm","md","lg"].map(m => (
              <button key={m} onClick={() => set("margin", m)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize ${props.margin === m ? "bg-indigo-500 text-white border-indigo-500" : "border-slate-200 text-slate-600"}`}>{m}</button>
            ))}
          </div>
        </div>
      </div>
    );
    case "site-footer": return (
      <div className="space-y-3">
        <TextField label="Brand Name (teal)" value={props.brandName} onChange={v => set("brandName", v)}/>
        <TextField label="Brand Suffix" value={props.brandRest} onChange={v => set("brandRest", v)}/>
        <TextArea label="Description" value={props.description} onChange={v => set("description", v)}/>

        <div className="text-xs font-medium text-slate-600 mb-1 pt-1">Social Links</div>
        {(props.socials || []).map((s: any, i: number) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={s.icon} onChange={e => { const a = [...props.socials]; a[i] = { ...a[i], icon: e.target.value }; set("socials", a); }} placeholder="Icon" title="Linkedin, Facebook, Instagram, Mail, Twitter, Youtube, Globe, Phone, MapPin" className="w-28 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={s.href} onChange={e => { const a = [...props.socials]; a[i] = { ...a[i], href: e.target.value }; set("socials", a); }} placeholder="URL" className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <button onClick={() => set("socials", props.socials.filter((_: any, j: number) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 size={13}/></button>
          </div>
        ))}
        <button onClick={() => set("socials", [...(props.socials || []), { icon: "Mail", href: "#" }])} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add social</button>

        <div className="text-xs font-medium text-slate-600 mb-1 pt-2">Link Columns</div>
        {(props.columns || []).map((col: any, ci: number) => (
          <div key={ci} className="border border-slate-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between items-center gap-2">
              <input value={col.title} onChange={e => { const c = [...props.columns]; c[ci] = { ...c[ci], title: e.target.value }; set("columns", c); }} placeholder="Column title" className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm font-semibold focus:outline-none"/>
              <button onClick={() => set("columns", props.columns.filter((_: any, j: number) => j !== ci))} className="text-red-400"><Trash2 size={12}/></button>
            </div>
            {(col.links || []).map((lnk: any, li: number) => (
              <div key={li} className="flex gap-2 items-center">
                <input value={lnk.label} onChange={e => { const c = [...props.columns]; const lks = [...(c[ci].links || [])]; lks[li] = { ...lks[li], label: e.target.value }; c[ci] = { ...c[ci], links: lks }; set("columns", c); }} placeholder="Label" className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none"/>
                <input value={lnk.href} onChange={e => { const c = [...props.columns]; const lks = [...(c[ci].links || [])]; lks[li] = { ...lks[li], href: e.target.value }; c[ci] = { ...c[ci], links: lks }; set("columns", c); }} placeholder="/path" className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none"/>
                <button onClick={() => { const c = [...props.columns]; c[ci] = { ...c[ci], links: c[ci].links.filter((_: any, j: number) => j !== li) }; set("columns", c); }} className="text-red-400"><Trash2 size={12}/></button>
              </div>
            ))}
            <button onClick={() => { const c = [...props.columns]; c[ci] = { ...c[ci], links: [...(c[ci].links || []), { label: "", href: "" }] }; set("columns", c); }} className="text-[11px] text-indigo-600 font-semibold hover:text-indigo-800">+ Add link</button>
          </div>
        ))}
        <button onClick={() => set("columns", [...(props.columns || []), { title: "New Column", links: [] }])} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add column</button>

        <TextField label="Copyright (use {year})" value={props.copyright} onChange={v => set("copyright", v)}/>
        <div className="text-xs font-medium text-slate-600 mb-1">Legal Links</div>
        {(props.legal || []).map((l: any, i: number) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={l.label} onChange={e => { const a = [...props.legal]; a[i] = { ...a[i], label: e.target.value }; set("legal", a); }} placeholder="Label" className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <input value={l.href} onChange={e => { const a = [...props.legal]; a[i] = { ...a[i], href: e.target.value }; set("legal", a); }} placeholder="/path" className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
            <button onClick={() => set("legal", props.legal.filter((_: any, j: number) => j !== i))} className="text-red-400"><Trash2 size={13}/></button>
          </div>
        ))}
        <button onClick={() => set("legal", [...(props.legal || []), { label: "", href: "" }])} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add legal link</button>
      </div>
    );
    default: return <div className="text-xs text-slate-400 text-center py-4">No props for this block type</div>;
  }
}

/* â”€â”€â”€ Default homepage blocks (seed) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const DEFAULT_HOME_BLOCKS: Block[] = [
  { id: "home-hero-1", type: "home-hero", order: 0, props: {
    eyebrow: "Digital Dental Laboratory",
    heading: "Digital Dental Laboratory for UK & Cyprus Dentists",
    highlight: "UK & Cyprus",
    subheading: "CAD/CAM milling Â· SLM metal printing Â· Zirconia Â· Lithium disilicate Â· Implant prosthetics Â· Digital prescription workflow.",
    gallery: [
      { src: "https://images.unsplash.com/photo-1684607631747-045ecfeeb4c7?w=1600&q=80&auto=format&fit=crop", alt: "Lab facility" },
      { src: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=1600&q=80&auto=format&fit=crop", alt: "CAD/CAM workflow" },
      { src: "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=1600&q=80&auto=format&fit=crop", alt: "Zirconia restoration" },
    ],
    cta1: "Submit a Case", cta1Link: "/submit",
    cta2: "Request Free Consultation", cta2Link: "/contact",
  }},
  { id: "home-trust-1", type: "home-trust-strip", order: 1, props: {
    items: [
      { icon: "Cpu", title: "Digital", desc: "CAD/CAM Workflow" },
      { icon: "Lock", title: "Confidential", desc: "Patient Data Protection" },
      { icon: "FlaskConical", title: "Advanced", desc: "CE-Certified Materials" },
      { icon: "Target", title: "Precision", desc: "Multi-Step Quality Control" },
    ]
  }},
  { id: "home-stats-1", type: "home-stats", order: 2, props: {
    eyebrow: "About Us",
    heading: "A digital lab built around precision, traceability and trust.",
    body: "Prime Smile is a fully digital dental laboratory partnering with dentists across the UK and Cyprus. Every case is processed through a structured digital prescription workflow with strict quality control at every stage.",
    linkText: "About Us", linkHref: "/about",
    stats: [
      { value: "10", suffix: "+", label: "Years of Digital Lab Experience" },
      { value: "500", suffix: "+", label: "Cases Delivered Per Month" },
      { value: "6", suffix: "", label: "Multi-Step Quality Control Points" },
      { value: "100", suffix: "%", label: "CE-Certified Materials Used" },
    ]
  }},
  { id: "home-workflow-1", type: "home-workflow", order: 3, props: {
    eyebrow: "Modern Approach",
    heading: "Our Digital Workflow",
    subheading: "We use advanced digital instruments and workflow to ensure the highest standard of every restoration.",
    steps: ["Register / Login","Fill Digital Prescription","Upload Scans & Files","Track Your Case Live","Receive Finished Work"],
    linkText: "Learn about our Digital Workflow", linkHref: "/workflow"
  }},
  { id: "home-services-1", type: "home-services", order: 4, props: {
    eyebrow: "Our Services",
    heading: "Comprehensive Lab Services",
    subheading: "We provide a full range of dental laboratory services. Every case is managed with a digital prescription workflow.",
    services: [
      { icon: "Smile", title: "Fixed Restorations", desc: "Crowns, bridges, veneers, inlays & onlays in zirconia and lithium disilicate." },
      { icon: "Wrench", title: "Implant Prosthetics", desc: "Custom abutments, screw-retained crowns, bars and full-arch restorations." },
      { icon: "Layers", title: "Removable Prosthetics", desc: "Full and partial dentures with digital design and high-precision fit." },
      { icon: "Frame", title: "Metal Frameworks", desc: "Cobalt-chrome frameworks via SLM metal printing for accuracy and strength." },
      { icon: "Shield", title: "Splints & Guards", desc: "Night guards, bruxism splints and surgical guides from validated workflows." },
      { icon: "PencilRuler", title: "Digital Design Support", desc: "STL design, smile design and treatment planning collaboration." },
    ],
    linkText: "View All Services", linkHref: "/services"
  }},
  { id: "home-specs-1", type: "home-specialisations", order: 5, props: {
    eyebrow: "Specialisations",
    heading: "Our Core Restorations",
    subheading: "Every restoration is crafted using industry-leading materials and digital precision workflow.",
    tiles: [
      { label: "Zirconia", sub: "Achieve High Level Of Aesthetic\nWithout Sacrificing Durability", img: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=600&q=80&auto=format&fit=crop", text: true },
      { label: "", sub: "", img: "https://images.pexels.com/photos/7800553/pexels-photo-7800553.jpeg?w=600&q=80&auto=format&fit=crop", text: false },
      { label: "Porcelain", sub: "Aesthetic And Function Are\nTogether", img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=80&auto=format&fit=crop", text: true },
      { label: "", sub: "", img: "https://images.pexels.com/photos/5355922/pexels-photo-5355922.jpeg?w=600&q=80&auto=format&fit=crop", text: false },
      { label: "Implants", sub: "Long Lasting Prosthetics", img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80&auto=format&fit=crop", text: true },
      { label: "", sub: "", img: "https://images.pexels.com/photos/6501859/pexels-photo-6501859.jpeg?w=600&q=80&auto=format&fit=crop", text: false },
      { label: "Inlays / Onlays", sub: "Perfect Match At The Most\nPrecision Points", img: "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&q=80&auto=format&fit=crop", text: true },
      { label: "", sub: "", img: "https://images.pexels.com/photos/33800642/pexels-photo-33800642.jpeg?w=600&q=80&auto=format&fit=crop", text: false },
    ]
  }},
  { id: "home-tech-1", type: "home-technology", order: 6, props: {
    eyebrow: "Technology",
    heading: "A Complete Digital Production Environment",
    items: [
      { name: "ALFAMILL 5-Axis / Yena D30", brand: "CAD/CAM Milling", tags: "Zirconia, PMMA" },
      { name: "VENEA VDexk1 eco", brand: "SLM Metal Printing", tags: "Co-Cr, Frameworks" },
      { name: "Asiga MAX UV", brand: "DLP 3D Printing", tags: "Models, Splints" },
      { name: "Dental Wings 7 Series", brand: "Scanning & Design", tags: "Scan, CAD" },
      { name: "Ivoclar Programat / SpeedFire", brand: "Sintering & Firing", tags: "Ceramic" },
      { name: "Renfert / KaVo", brand: "Finishing & Polishing", tags: "Surface" },
      { name: "Bio-Art / Deflex", brand: "Model Workflow", tags: "Articulator" },
      { name: "EKOSAN / Stanley AIR COM", brand: "Air Infrastructure", tags: "Clean Air" },
    ],
    linkText: "View All Technology", linkHref: "/technology"
  }},
  { id: "home-prod-1", type: "home-production", order: 7, props: {
    eyebrow: "Production",
    heading: "Built on Industry-Leading Standards",
    brands: "ALFAMILL,VENEA,Asiga,Dental Wings,Ivoclar,CEREC,Renfert,KaVo,DHL,CE Certified",
    cards: [
      { title: "Materials & Equipment", img: "Materials & Equipment" },
      { title: "Production Timeline", img: "Production Timeline" },
      { title: "Production Management", img: "Production Management" },
    ]
  }},
  { id: "home-badges-1", type: "home-badges", order: 8, props: {
    items: [
      { title: "CE-Certified Consumables", desc: "Verified supplier materials" },
      { title: "Quality Practices", desc: "Documented QC checkpoints" },
      { title: "CE-Certified Materials", desc: "World-Renowned Suppliers" },
      { title: "Digital Case Tracking", desc: "Submission to Dispatch" },
    ]
  }},
  { id: "home-cta-1", type: "home-cta", order: 9, props: {
    heading: "Ready to Submit Your First Case?",
    subheading: "Diagnosis is free. Every case is managed with a digital prescription. Treatment plans are customised to your needs.",
    btn1: "Create Dentist Account", btn1Link: "/portal",
    btn2: "WhatsApp Us", btn2Link: "#"
  }},
  { id: "home-news-1", type: "home-news", order: 10, props: {
    heading: "News & Updates",
    linkText: "All News",
    linkHref: "#",
    articles: [
      { category: "Industry News", title: "New SLM metal printing capabilities now live in our Cyprus facility", date: "12 Apr 2026", img: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=800&q=80&auto=format&fit=crop" },
      { category: "Case Study", title: "Full-arch implant rehabilitation: workflow walkthrough", date: "28 Mar 2026", img: "https://images.unsplash.com/photo-1684607631747-045ecfeeb4c7?w=800&q=80&auto=format&fit=crop" },
      { category: "Materials", title: "Updated zirconia portfolio: improved translucency and strength", date: "14 Mar 2026", img: "https://images.unsplash.com/photo-1590424693420-634a0b0b782c?w=800&q=80&auto=format&fit=crop" },
    ]
  }},
];

const DEFAULT_ABOUT_BLOCKS: Block[] = [
  { id:"about-hero", type:"hero", order:0, props:{
    eyebrow:"FACILITY", heading:"About Dental Laboratory", highlight:"Prime Smile",
    subheading:"Prime Smile is a fully digital dental laboratory operating across the UK and Cyprus. We partner with dental clinics who demand precision, accountability and consistent results.",
    image:"https://images.pexels.com/photos/7800553/pexels-photo-7800553.jpeg?w=1600&q=80&auto=format&fit=crop",
    bgColor:"#0d1e2c", cta1:"Contact Us", cta1Link:"/contact", cta2:"Our Workflow", cta2Link:"/workflow",
    align:"center", overlayOpacity: 0.5
  }},
  { id:"about-story", type:"cards", order:1, props:{
    heading:"", columns:3, backgroundColor:"#f8fafc", cardStyle:"borderLeft",
    cards:[
      { title:"Our Story", text:"Founded by a team of master technicians who saw the future was digital. We invested early in CAD/CAM, SLM printing and validated workflows.", icon:"BookOpen", link:"", accent:"teal" },
      { title:"Our Mission", text:"To make precision dental restoration accessible to every dentist through fully traceable, digitally-managed lab work. No paper. No guessing.", icon:"Target", link:"", accent:"gold" },
      { title:"Our Standards", text:"Using CE-certified consumables only. Six quality control checkpoints per case. Zero compromises on fit, aesthetics or traceability.", icon:"CheckCircle2", link:"", accent:"teal" },
    ]
  }},
  { id:"about-certs", type:"home-badges", order:2, props:{
    items:[
      { title:"CE-Certified Consumables", desc:"Verified supplier materials" },
      { title:"Quality Practices", desc:"Documented QC checkpoints" },
      { title:"CE-Certified Materials", desc:"World-Renowned Suppliers" },
      { title:"Digital Case Tracking", desc:"Submission to Dispatch" },
    ]
  }},
  { id:"about-cta", type:"home-cta", order:3, props:{
    heading:"Ready to partner with us?",
    subheading:"Create your dentist account and submit your first case today.",
    btn1:"Get Started", btn1Link:"/portal",
    btn2:"", btn2Link:""
  }},
];

const DEFAULT_SERVICES_BLOCKS: Block[] = [
  { id:"sv-hero", type:"hero", order:0, props:{
    eyebrow:"Our Services", heading:"Comprehensive Lab Services", highlight:"",
    subheading:"Every service is delivered through a digital prescription workflow with full traceability, multi-step QC and CE-certified materials.",
    image:"https://images.unsplash.com/photo-1684607631747-045ecfeeb4c7?w=1600&q=80&auto=format&fit=crop",
    bgColor:"#0d1e2c", cta1:"", cta1Link:"", cta2:"", cta2Link:""
  }},
  { id:"sv-grid", type:"home-services", order:1, props:{
    eyebrow:"Our Services", heading:"Comprehensive Lab Services",
    subheading:"We provide a full range of dental laboratory services. Every case is managed with a digital prescription workflow.",
    services:[
      { icon:"Smile", title:"Fixed Restorations", desc:"Crowns, bridges, veneers, inlays & onlays in zirconia and lithium disilicate." },
      { icon:"Wrench", title:"Implant Prosthetics", desc:"Custom abutments, screw-retained crowns, bars and full-arch restorations." },
      { icon:"Layers", title:"Removable Prosthetics", desc:"Full and partial dentures with digital design and high-precision fit." },
      { icon:"Frame", title:"Metal Frameworks", desc:"Cobalt-chrome frameworks via SLM metal printing for accuracy and strength." },
      { icon:"Shield", title:"Splints & Guards", desc:"Night guards, bruxism splints and surgical guides from validated workflows." },
      { icon:"PencilRuler", title:"Digital Design Support", desc:"STL design, smile design and treatment planning collaboration." },
    ],
    linkText:"View All Services", linkHref:"/services"
  }},
  { id:"sv-materials", type:"home-specialisations", order:2, props:{
    eyebrow:"Materials", heading:"Our Core Restorations",
    subheading:"Every restoration is crafted using industry-leading materials and digital precision workflow.",
    tiles:[
      { label:"Zirconia", sub:"Achieve High Level Of Aesthetic\nWithout Sacrificing Durability", img:"https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=600&q=80&auto=format&fit=crop", text:true },
      { label:"", sub:"", img:"https://images.pexels.com/photos/7800553/pexels-photo-7800553.jpeg?w=600&q=80&auto=format&fit=crop", text:false },
      { label:"Porcelain", sub:"Aesthetic And Function Are\nTogether", img:"https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=80&auto=format&fit=crop", text:true },
      { label:"", sub:"", img:"https://images.pexels.com/photos/5355922/pexels-photo-5355922.jpeg?w=600&q=80&auto=format&fit=crop", text:false },
      { label:"Implants", sub:"Long Lasting Prosthetics", img:"https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80&auto=format&fit=crop", text:true },
      { label:"", sub:"", img:"https://images.pexels.com/photos/6501859/pexels-photo-6501859.jpeg?w=600&q=80&auto=format&fit=crop", text:false },
      { label:"Inlays / Onlays", sub:"Perfect Match At The Most\nPrecision Points", img:"https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&q=80&auto=format&fit=crop", text:true },
      { label:"", sub:"", img:"https://images.pexels.com/photos/33800642/pexels-photo-33800642.jpeg?w=600&q=80&auto=format&fit=crop", text:false },
    ]
  }},
];

const DEFAULT_QUALITY_BLOCKS: Block[] = [
  { id:"q-hero", type:"hero", order:0, props:{
    eyebrow:"Quality", heading:"Quality & Compliance", highlight:"",
    subheading:"Every Prime Smile case is processed through a documented quality system with robust QC checkpoints to ensure patient safety and fit.",
    image:"", bgColor:"#ffffff", cta1:"", cta1Link:"", cta2:"", cta2Link:""
  }},
  { id:"q-qc", type:"cards", order:1, props:{
    heading:"Quality Control Checkpoints", columns:2, backgroundColor:"#f8fafc",
    cards:[
      { title:"Incoming Case Review", text:"Every digital prescription is validated against scan files and case requirements.", icon:"CheckCircle2", link:"" },
      { title:"Design Verification", text:"CAD designs reviewed by senior technicians before production begins.", icon:"CheckCircle2", link:"" },
      { title:"Material Verification", text:"Material lot numbers logged for every restoration. Full traceability.", icon:"CheckCircle2", link:"" },
      { title:"Production QC", text:"Dimensional and aesthetic checks at every production stage.", icon:"CheckCircle2", link:"" },
      { title:"Final Quality Control", text:"Pre-dispatch inspection: fit, occlusion, finish, shade and packaging.", icon:"CheckCircle2", link:"" },
      { title:"Dispatch Documentation", text:"Each case dispatched with material declaration and traceability sheet.", icon:"CheckCircle2", link:"" },
    ]
  }},
  { id:"q-badges", type:"home-badges", order:2, props:{
    items:[
      { title:"CE-Certified Consumables", desc:"Verified supplier materials" },
      { title:"Quality Practices", desc:"Documented QC checkpoints" },
      { title:"CE-Certified Materials", desc:"World-Renowned Suppliers" },
      { title:"Digital Case Tracking", desc:"Submission to Dispatch" },
    ]
  }},
  { id:"q-trace", type:"image-text", order:3, props:{
    heading:"Material Traceability", text:"Every material lot is logged against your case ID. Full traceability sheets are dispatched with every restoration. Prime Smile complies with UK MHRA Custom-Made Device requirements and is registered with the appropriate UKRP for distribution into the UK market.",
    image:"", imageLeft:true, cta:"", ctaLink:"", backgroundColor:"#ffffff"
  }},
  { id:"q-faq", type:"accordion", order:4, props:{
    heading:"Complaint & Remake Policy",
    items:[
      { q:"What is your remake policy?", a:"Remakes due to lab error are free of charge within the warranty period (12 months for fixed restorations). A clear remake reason is required to maintain quality records." },
      { q:"How do you handle complaints?", a:"Submit through the dentist portal or via email. Our QC manager investigates within 48 hours and provides a written report with corrective actions." },
      { q:"Can I receive material declarations for patients?", a:"Yes. Every case is dispatched with a material declaration sheet listing all materials, lot numbers and standards used." },
    ],
    backgroundColor:"#f8fafc", iconStyle:"chevron"
  }},
];

const DEFAULT_TECHNOLOGY_BLOCKS: Block[] = [
  { id:"tech-hero", type:"hero", order:0, props:{
    eyebrow:"Technology", heading:"A Complete Digital Production Environment", highlight:"",
    subheading:"From scanning to sintering, every machine in our facility is calibrated, validated and integrated into our digital workflow.",
    image:"https://cdn.pixabay.com/photo/2020/08/27/18/31/teeth-5522653_1280.jpg?w=1600&q=80&auto=format&fit=crop",
    bgColor:"#0d1e2c", cta1:"Request a Facility Tour", cta1Link:"/contact", cta2:"", cta2Link:""
  }},
  { id:"tech-equip", type:"home-technology", order:1, props:{
    eyebrow:"Technology", heading:"A Complete Digital Production Environment",
    items:[
      { name:"ALFAMILL 5-Axis / Yena D30", brand:"CAD/CAM Milling", tags:"Zirconia, PMMA" },
      { name:"VENEA VDexk1 eco", brand:"SLM Metal Printing", tags:"Co-Cr, Frameworks" },
      { name:"Asiga MAX UV", brand:"DLP 3D Printing", tags:"Models, Splints" },
      { name:"Dental Wings 7 Series", brand:"Scanning & Design", tags:"Scan, CAD" },
      { name:"Ivoclar Programat / SpeedFire", brand:"Sintering & Firing", tags:"Ceramic" },
      { name:"Renfert / KaVo", brand:"Finishing & Polishing", tags:"Surface" },
    ],
    linkText:"View All Technology", linkHref:"/technology"
  }},
  { id:"tech-brands", type:"text", order:2, props:{
    content:"ALFAMILL Â· VENEA Â· Asiga Â· Dental Wings Â· Ivoclar Â· CEREC Â· Renfert Â· KaVo Â· CE Certified",
    align:"center", size:"base", fontWeight:"bold", textColor:"#0aabbd", backgroundColor:"#ffffff", padding:"medium"
  }},
];

const DEFAULT_WORKFLOW_BLOCKS: Block[] = [
  { id:"wf-hero", type:"hero", order:0, props:{
    eyebrow:"Modern Approach", heading:"Our Digital Workflow", highlight:"",
    subheading:"From the moment you log in to the moment your case is delivered, every step is digital, traceable and tracked in real time.",
    image:"", bgColor:"#ffffff", cta1:"", cta1Link:"", cta2:"", cta2Link:""
  }},
  { id:"wf-steps", type:"home-workflow", order:1, props:{
    eyebrow:"Modern Approach", heading:"Our Digital Workflow",
    subheading:"We use advanced digital instruments and workflow to ensure the highest standard of every restoration.",
    steps:["Register / Login","Fill Digital Prescription","Upload Scans & Files","Track Your Case Live","Receive Finished Work"],
    linkText:"", linkHref:""
  }},
  { id:"wf-presc", type:"image-text", order:2, props:{
    heading:"A complete prescription, every time.", text:"Our 10-step digital prescription captures everything we need: clinic info, patient ref, service, tooth chart, materials, shade, implant details, scan files and shipping. No more paper, no more missing info.",
    image:"https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&q=80&auto=format&fit=crop",
    imageLeft:false, cta:"Login to Portal", ctaLink:"/portal", backgroundColor:"#f8fafc"
  }},
  { id:"wf-timeline", type:"text", order:3, props:{
    content:"Live status, every step of the way. Our 11-step case status timeline keeps you informed: Submitted â†’ File Review â†’ Awaiting Information â†’ Design Stage â†’ Dentist Approval â†’ In Production â†’ Finishing â†’ Quality Control â†’ Ready for Dispatch â†’ Dispatched â†’ Completed.",
    align:"left", size:"base", fontWeight:"normal", textColor:"#374151", backgroundColor:"#ffffff", padding:"large"
  }},
  { id:"wf-logistics", type:"text", order:4, props:{
    content:"Logistics & Tracking. Cases are dispatched via DHL or UPS with full digital tracking. You will receive notifications at dispatch and delivery, with tracking numbers visible directly in your dentist portal.",
    align:"left", size:"base", fontWeight:"normal", textColor:"#374151", backgroundColor:"#f8fafc", padding:"large"
  }},
];

const DEFAULT_CONTACT_BLOCKS: Block[] = [
  { id: "c-hero", type: "hero", order: 0, props: { eyebrow: "Get in Touch", heading: "Contact Prime Smile Dental Lab", highlight: "", subheading: "Reach out for case submissions, partnerships or general enquiries. We respond within one business day.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", image: "", align: "center" } },
  { id: "c-info", type: "contact-info", order: 1, props: {
    heading: "Contact Details",
    subheading: "We are here to help. Reach out by email, phone or visit us.",
    items: [
      { icon: "Mail", label: "Email", value: "info@primesmile.co.uk", href: "mailto:info@primesmile.co.uk" },
      { icon: "Phone", label: "Phone", value: "+44 20 0000 0000", href: "tel:+442000000000" },
      { icon: "MapPin", label: "Address", value: "London, UK", href: "" },
    ],
    backgroundColor: "#f8fafc",
    layout: "cards"
  } },
  { id: "c-cta", type: "cta", order: 2, props: { heading: "Ready to partner with us?", text: "Create a dentist account and start submitting cases through our digital workflow.", buttonText: "Create Account", buttonLink: "/portal", bgColor: "#0aabbd", textAlign: "center" } },
];

const DEFAULT_FIXED_RESTORATIONS_BLOCKS: Block[] = [
  { id: "fr-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Fixed Restorations", highlight: "", subheading: "Crowns, bridges, veneers, inlays and onlays in zirconia and lithium disilicate â€” crafted with digital precision.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
  { id: "fr-text", type: "image-text", order: 1, props: { heading: "Precision Fit & Aesthetics", text: "Every fixed restoration is designed in CAD software, milled on 5-axis equipment and finished under magnification. We validate marginal fit before dispatch.", image: "", imageLeft: true, cta: "Learn More", ctaLink: "/workflow", backgroundColor: "#ffffff", padding: "large" } },
  { id: "fr-cta", type: "cta", order: 2, props: { heading: "Request a consultation", text: "Not sure which material suits your case? Our technicians can advise.", buttonText: "Contact Us", buttonLink: "/contact", bgColor: "#0aabbd", textAlign: "center" } },
];

const DEFAULT_IMPLANT_BLOCKS: Block[] = [
  { id: "ip-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Implant Prosthetics", highlight: "", subheading: "Custom abutments, screw-retained crowns, bars and full-arch restorations with validated implant workflows.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
  { id: "ip-text", type: "image-text", order: 1, props: { heading: "Integrated Digital Workflow", text: "We accept implant scans, design abutments in CAD and validate connections on model before production. Every case is tracked from scan to dispatch.", image: "", imageLeft: true, cta: "Our Workflow", ctaLink: "/workflow", backgroundColor: "#ffffff", padding: "large" } },
  { id: "ip-cta", type: "cta", order: 2, props: { heading: "Have an implant case?", text: "Send us your scan and prescription for a free feasibility review.", buttonText: "Get Started", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
];

const DEFAULT_REMOVABLE_BLOCKS: Block[] = [
  { id: "rp-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Removable Prosthetics", highlight: "", subheading: "Full and partial dentures with digital design and high-precision fit for optimal comfort and function.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
  { id: "rp-text", type: "image-text", order: 1, props: { heading: "Digital Denture Design", text: "Our removable prosthetics are designed digitally from validated scans, ensuring consistent base fit and tooth arrangement. Every denture goes through a trial stage when required.", image: "", imageLeft: true, cta: "Learn More", ctaLink: "/workflow", backgroundColor: "#ffffff", padding: "large" } },
  { id: "rp-cta", type: "cta", order: 2, props: { heading: "Need a denture quote?", text: "Upload your scan and we will assess the case at no charge.", buttonText: "Submit Case", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
];

const DEFAULT_METAL_BLOCKS: Block[] = [
  { id: "mf-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Metal Frameworks", highlight: "", subheading: "Cobalt-chrome frameworks via SLM metal printing for unmatched accuracy, strength and passive fit.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
  { id: "mf-text", type: "image-text", order: 1, props: { heading: "SLM Metal Printing", text: "Our VENEA SLM printer produces cobalt-chrome frameworks with layer accuracy down to 30 microns. Every framework is inspected for distortion and fit before ceramic application.", image: "", imageLeft: true, cta: "Learn More", ctaLink: "/technology", backgroundColor: "#ffffff", padding: "large" } },
  { id: "mf-cta", type: "cta", order: 2, props: { heading: "Need a metal framework?", text: "Upload your scan and prescription for a free assessment.", buttonText: "Submit Case", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
];

const DEFAULT_SPLINTS_BLOCKS: Block[] = [
  { id: "sg-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Splints & Guards", highlight: "", subheading: "Night guards, bruxism splints and surgical guides from validated digital workflows.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
  { id: "sg-text", type: "image-text", order: 1, props: { heading: "Validated Guard Production", text: "Splints are designed from intraoral scans with calibrated bite data, then 3D printed or milled depending on material selection. Thickness and occlusion are checked on articulator.", image: "", imageLeft: true, cta: "Learn More", ctaLink: "/workflow", backgroundColor: "#ffffff", padding: "large" } },
  { id: "sg-cta", type: "cta", order: 2, props: { heading: "Order a splint or guard?", text: "Send us your scan and we will confirm material options and turnaround.", buttonText: "Submit Case", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
];

const DEFAULT_DIGITAL_DESIGN_BLOCKS: Block[] = [
  { id: "dd-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Digital Design Support", highlight: "", subheading: "STL design, smile design and treatment planning collaboration for complex cases.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
  { id: "dd-text", type: "image-text", order: 1, props: { heading: "Collaborative Design", text: "Our technicians work directly with your scan data to produce validated designs before production. We support smile design, full-arch planning and implant restorative design.", image: "", imageLeft: true, cta: "Learn More", ctaLink: "/workflow", backgroundColor: "#ffffff", padding: "large" } },
  { id: "dd-cta", type: "cta", order: 2, props: { heading: "Need design support?", text: "Upload your case and our team will review and advise on the best approach.", buttonText: "Get Started", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
];

/* â”€â”€â”€ Shared footer block (appended to every page layout) â”€â”€ */
const DEFAULT_FOOTER_BLOCK: Block = {
  id: "site-footer-1",
  type: "site-footer",
  order: 999,
  props: {
    brandName: FOOTER_DEFAULTS.brandName,
    brandRest: FOOTER_DEFAULTS.brandRest,
    description: FOOTER_DEFAULTS.description,
    socials: FOOTER_DEFAULTS.socials,
    columns: FOOTER_DEFAULTS.columns,
    copyright: FOOTER_DEFAULTS.copyright,
    legal: FOOTER_DEFAULTS.legal,
  },
};

const PAGE_DEFAULTS: Record<string, Block[]> = {
  home: DEFAULT_HOME_BLOCKS,
  about: DEFAULT_ABOUT_BLOCKS,
  services: DEFAULT_SERVICES_BLOCKS,
  quality: DEFAULT_QUALITY_BLOCKS,
  technology: DEFAULT_TECHNOLOGY_BLOCKS,
  workflow: DEFAULT_WORKFLOW_BLOCKS,
  contact: DEFAULT_CONTACT_BLOCKS,
  "fixed-restorations": DEFAULT_FIXED_RESTORATIONS_BLOCKS,
  "implant-prosthetics": DEFAULT_IMPLANT_BLOCKS,
  "removable-prosthetics": DEFAULT_REMOVABLE_BLOCKS,
  "metal-frameworks": DEFAULT_METAL_BLOCKS,
  "splints-guards": DEFAULT_SPLINTS_BLOCKS,
  "digital-design": DEFAULT_DIGITAL_DESIGN_BLOCKS,
  // Footer is its own editable page (rendered globally by <SiteFooter/>),
  // not appended to other pages â€” otherwise it would render twice.
  footer: [DEFAULT_FOOTER_BLOCK],
};

/* â”€â”€â”€ Main editor component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
type Block = { id: string; type: string; order: number; props: Record<string, any> };
type PreviewMode = "desktop" | "tablet" | "mobile";

function PageEditor() {
  const { slug } = Route.useParams();
  const [blocks,    setBlocks]    = useState<Block[]>([]);
  const [title,     setTitle]     = useState("");
  const [selected,  setSelected]  = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [showLib,   setShowLib]   = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [pageData, setPageData] = useState({ seo: { title: "", description: "" }, published: true });
  const dragBlock = useRef<string | null>(null);
  const dragOver  = useRef<string | null>(null);

  /* â”€â”€ Undo / Redo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const historyRef = useRef<Block[][]>([]);
  const historyIdxRef = useRef(-1);
  const isUndoRedoRef = useRef(false);

  function pushHistory(next: Block[]) {
    if (isUndoRedoRef.current) return;
    const snap = JSON.parse(JSON.stringify(next));
    historyIdxRef.current += 1;
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current);
    historyRef.current.push(snap);
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyIdxRef.current -= 1;
    }
  }

  function undo() {
    if (historyIdxRef.current <= 0) return;
    isUndoRedoRef.current = true;
    historyIdxRef.current -= 1;
    const snap = JSON.parse(JSON.stringify(historyRef.current[historyIdxRef.current]));
    setBlocks(snap);
    isUndoRedoRef.current = false;
  }

  function redo() {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    isUndoRedoRef.current = true;
    historyIdxRef.current += 1;
    const snap = JSON.parse(JSON.stringify(historyRef.current[historyIdxRef.current]));
    setBlocks(snap);
    isUndoRedoRef.current = false;
  }

  function canUndo() { return historyIdxRef.current > 0; }
  function canRedo() { return historyIdxRef.current < historyRef.current.length - 1; }

  function resetToDefaults() {
    const defs = PAGE_DEFAULTS[slug];
    if (!defs) return;
    const next = defs.map((b, i) => ({ ...b, order: i }));
    pushHistory(next);
    setBlocks(next);
    setSelected(null);
  }

  useEffect(() => {
    apiFetch<{ page: any }>(`/api/admin/pages/${slug}`).then(r => {
      setTitle(r.page.title);
      const loaded = [...(r.page.blocks || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const defaults = PAGE_DEFAULTS[slug];
      const onlyGeneric = loaded.length > 0 && loaded.every((b: any) => ["text","image","video","divider"].includes(b.type));
      const initial = defaults && (loaded.length === 0 || onlyGeneric)
        ? defaults.map((b, i) => ({ ...b, order: i }))
        : loaded;
      setBlocks(initial);
      historyRef.current = [JSON.parse(JSON.stringify(initial))];
      historyIdxRef.current = 0;
      setPageData({
        seo: r.page.seo || { title: "", description: "" },
        published: r.page.published !== false
      });
    }).catch(() => {});
  }, [slug]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function addBlock(type: string) {
    const bt = BLOCK_TYPES.find(b => b.id === type)!;
    const newBlock: Block = {
      id: `blk-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      order: blocks.length,
      props: { ...bt.defaultProps },
    };
    const next = [...blocks, newBlock];
    pushHistory(next);
    setBlocks(next);
    setSelected(newBlock.id);
    setShowLib(false);
  }

  function updateProps(id: string, props: any) {
    const next = blocks.map(b => b.id === id ? { ...b, props } : b);
    pushHistory(next);
    setBlocks(next);
  }

  function deleteBlock(id: string) {
    const next = blocks.filter(b => b.id !== id);
    pushHistory(next);
    setBlocks(next);
    if (selected === id) setSelected(null);
  }

  function moveBlock(id: string, dir: -1 | 1) {
    const arr = [...blocks];
    const idx = arr.findIndex(b => b.id === id);
    if (idx + dir < 0 || idx + dir >= arr.length) return;
    [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
    const next = arr.map((b, i) => ({ ...b, order: i }));
    pushHistory(next);
    setBlocks(next);
  }

  async function save() {
    setSaving(true);
    try {
      const ordered = blocks.map((b, i) => ({ ...b, order: i }));
      await apiFetch(`/api/admin/pages/${slug}`, { 
        method: "PUT", 
        body: JSON.stringify({ 
          title, 
          blocks: ordered, 
          published: pageData.published,
          seo: pageData.seo 
        }) 
      });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  }

  const selectedBlock = blocks.find(b => b.id === selected);

  return (
    <div className="h-screen flex flex-col -mx-7 -mt-7">
      {/* Enhanced Toolbar */}
      <div className="flex items-center gap-4 px-6 py-3 bg-white border-b border-slate-200 shrink-0">
        <Link to="/admin/pages" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
          <ChevronLeft size={16}/> Pages
        </Link>
        <div className="w-px h-5 bg-slate-200"/>
        <input value={title} onChange={e => setTitle(e.target.value)}
          className="text-lg font-semibold text-slate-800 border-none outline-none bg-transparent flex-1 min-w-0 placeholder-slate-400"/>
        <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded">/{slug}</span>
        
        <div className="flex items-center gap-2 ml-auto">
          {/* Page Settings */}
          <button onClick={() => setShowPageSettings(!showPageSettings)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
            <Settings2 size={13}/> Settings
          </button>

          {PAGE_DEFAULTS[slug] && (
            <button onClick={resetToDefaults} title="Reset layout to default"
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
              <RefreshCw size={13}/> Reset
            </button>
          )}

          {/* Preview Mode Selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button onClick={() => setPreviewMode("desktop")} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                previewMode === "desktop" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-800"
              }`}>
              <Monitor size={13}/> Desktop
            </button>
            <button onClick={() => setPreviewMode("tablet")} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                previewMode === "tablet" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-800"
              }`}>
              <Tablet size={13}/> Tablet
            </button>
            <button onClick={() => setPreviewMode("mobile")} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                previewMode === "mobile" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-800"
              }`}>
              <Smartphone size={13}/> Mobile
            </button>
          </div>
          
          {/* Undo / Redo */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button onClick={undo} disabled={!canUndo()} title="Undo (Ctrl+Z)"
              className={`p-1.5 rounded-md transition ${canUndo() ? "text-slate-700 hover:bg-white hover:shadow-sm" : "text-slate-300 cursor-not-allowed"}`}>
              <Undo2 size={16}/>
            </button>
            <button onClick={redo} disabled={!canRedo()} title="Redo (Ctrl+Shift+Z)"
              className={`p-1.5 rounded-md transition ${canRedo() ? "text-slate-700 hover:bg-white hover:shadow-sm" : "text-slate-300 cursor-not-allowed"}`}>
              <Redo2 size={16}/>
            </button>
          </div>

          <a href={`/${slug === "home" ? "" : slug}`} target="_blank" rel="noopener"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
            <Eye size={14}/> Preview
          </a>
          <button onClick={save} disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-all duration-200 shadow-sm hover:shadow-md ${
              saved ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"
            }`}>
            {saved ? <><CheckCircle2 size={14}/> Saved!</> : saving ? "Savingâ€¦" : <><Save size={14}/> Save</>}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Block Library Sidebar */}
        <div className="w-72 shrink-0 bg-slate-900 flex flex-col overflow-y-auto">
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"/>
              <input 
                type="text" 
                placeholder="Search blocks..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 text-slate-300 text-sm rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-slate-750 transition-all duration-200"
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="px-4 py-3 border-b border-slate-800">
            <select 
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 text-slate-300 text-sm rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 transition-all duration-200"
            >
              <option value="all">All Categories</option>
              {BLOCK_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id.toLowerCase()}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          {/* Block List */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Blocks</div>
            <div className="px-2 space-y-1.5 pb-4">
              {BLOCK_TYPES
                .filter(bt => {
                  const matchesSearch = bt.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                       bt.description.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesCategory = selectedCategory === "all" || bt.category.toLowerCase() === selectedCategory;
                  return matchesSearch && matchesCategory;
                })
                .map(bt => (
                  <button key={bt.id} onClick={() => addBlock(bt.id)}
                    className="w-full group relative text-left">
                    <div className="flex items-start gap-3 p-3.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200 border border-transparent hover:border-slate-700">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
                        <bt.icon size={15} className="text-indigo-400"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-200 group-hover:text-white transition-colors">{bt.label}</div>
                        <div className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{bt.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Enhanced Canvas with Responsive Preview */}
        <div className="flex-1 overflow-y-auto bg-white p-6">
          {blocks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-indigo-100 to-indigo-50 flex items-center justify-center mb-6">
                <Plus size={40} className="text-indigo-400"/>
              </div>
              <p className="text-xl font-semibold text-slate-600 mb-2">Start building your page</p>
              <p className="text-base text-slate-400">Click a block on the left to add it to the page</p>
            </div>
          )}
          
          <div className={`mx-auto transition-all duration-300 ${
            previewMode === "mobile" ? "max-w-sm" : 
            previewMode === "tablet" ? "max-w-2xl" : 
            "max-w-6xl"
          }`}>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="space-y-0">
            {blocks.map((block, idx) => (
              <div key={block.id}
                draggable
                onDragStart={() => { dragBlock.current = block.id; }}
                onDragOver={e => { e.preventDefault(); dragOver.current = block.id; }}
                onDrop={() => {
                  if (!dragBlock.current || dragBlock.current === block.id) return;
                  const from = blocks.findIndex(b => b.id === dragBlock.current);
                  const to   = blocks.findIndex(b => b.id === block.id);
                  const arr  = [...blocks];
                  const [moved] = arr.splice(from, 1);
                  arr.splice(to, 0, moved);
                  setBlocks(arr.map((b, i) => ({ ...b, order: i })));
                  dragBlock.current = null;
                }}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ${
                  selected === block.id 
                    ? "ring-2 ring-indigo-400 shadow-xl ring-offset-2" 
                    : "hover:ring-1 hover:ring-slate-300 hover:shadow-lg"
                }`}
                onClick={() => setSelected(block.id)}>

                {/* Enhanced Block toolbar */}
                <div className={`absolute top-3 right-3 z-10 flex gap-1.5 transition-opacity ${
                  selected === block.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}>
                  <div className="flex gap-1 bg-white/90 backdrop-blur rounded-lg shadow-lg p-1">
                    <button onClick={e => { e.stopPropagation(); moveBlock(block.id, -1); }} disabled={idx === 0}
                      className="w-7 h-7 bg-white rounded text-slate-600 flex items-center justify-center text-xs hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      â†‘
                    </button>
                    <button onClick={e => { e.stopPropagation(); moveBlock(block.id, 1); }} disabled={idx === blocks.length - 1}
                      className="w-7 h-7 bg-white rounded text-slate-600 flex items-center justify-center text-xs hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      â†“
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteBlock(block.id); }}
                      className="w-7 h-7 bg-red-500 rounded text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                      <Trash2 size={12}/>
                    </button>
                  </div>
                </div>

                {/* Enhanced Block type label */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 backdrop-blur text-white text-xs rounded-full font-medium">
                    <Sparkles size={10} className="text-yellow-400"/>
                    {BLOCK_TYPES.find(b => b.id === block.type)?.label ?? block.type}
                  </span>
                </div>

                {/* Enhanced Drag handle */}
                <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity">
                  <div className="w-6 h-10 bg-white/80 backdrop-blur rounded-lg shadow flex items-center justify-center">
                    <GripVertical size={14} className="text-slate-500"/>
                  </div>
                </div>

                {/* Block preview - actual design without wrapper */}
                <BlockPreview type={block.type} props={block.props}/>
              </div>
            ))}
              </div>
            </div>

            {/* Enhanced Add block button */}
            <div className={`mx-auto mt-8 transition-all duration-300 ${
              previewMode === "mobile" ? "max-w-sm" : 
              previewMode === "tablet" ? "max-w-2xl" : 
              "max-w-6xl"
            }`}>
              <button 
                onClick={() => setShowLib(!showLib)}
                className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300 group shadow-sm hover:shadow-md"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-linear-to-br from-indigo-100 to-indigo-50 flex items-center justify-center group-hover:from-indigo-200 group-hover:to-indigo-100 transition-all duration-300 border border-indigo-200 group-hover:border-indigo-300">
                  <Plus size={22} className="text-indigo-500 group-hover:text-indigo-600 transition-colors"/>
                </div>
                <p className="text-base font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">Add Block to Page</p>
                <p className="text-sm text-slate-500 mt-2">Choose from {BLOCK_TYPES.length} block types</p>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Properties Panel */}
        <div className="w-80 shrink-0 bg-white border-l border-slate-200 overflow-y-auto">
          {showPageSettings ? (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings2 size={16} className="text-indigo-500"/>
                  <span className="text-lg font-bold text-slate-800">Page Settings</span>
                </div>
                <button onClick={() => setShowPageSettings(false)} className="text-slate-400 hover:text-slate-600">
                  Ã—
                </button>
              </div>
              
              {/* Page Title */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Page Title</label>
                <input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              {/* SEO Settings */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Globe size={14} className="text-slate-500"/>
                  SEO Settings
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">SEO Title</label>
                    <input 
                      value={pageData.seo.title} 
                      onChange={e => setPageData(prev => ({ ...prev, seo: { ...prev.seo, title: e.target.value } }))}
                      placeholder="Default: Page title"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Meta Description</label>
                    <textarea 
                      value={pageData.seo.description} 
                      onChange={e => setPageData(prev => ({ ...prev, seo: { ...prev.seo, description: e.target.value } }))}
                      placeholder="Brief description for search engines"
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </div>
              </div>
              
              {/* Publishing Status */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  {pageData.published ? <Unlock size={14} className="text-green-500"/> : <Lock size={14} className="text-amber-500"/>}
                  Publishing Status
                </h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={pageData.published}
                    onChange={e => setPageData(prev => ({ ...prev, published: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">
                    {pageData.published ? "Page is published and visible" : "Page is draft (not visible)"}
                  </span>
                </label>
              </div>
              
              {/* Page Info */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Info size={14} className="text-slate-500"/>
                  Page Information
                </h3>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>URL:</span>
                    <span className="font-mono">/{slug}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Blocks:</span>
                    <span>{blocks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Modified:</span>
                    <span>Just now</span>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedBlock ? (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    {(() => {
                      const Icon = BLOCK_TYPES.find(b => b.id === selectedBlock.type)?.icon;
                      return Icon ? <Icon size={14} className="text-indigo-600"/> : null;
                    })()}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800">
                      {BLOCK_TYPES.find(b => b.id === selectedBlock.type)?.label ?? selectedBlock.type}
                    </span>
                    <p className="text-xs text-slate-500">
                      {BLOCK_TYPES.find(b => b.id === selectedBlock.type)?.description}
                    </p>
                  </div>
                </div>
                <button onClick={() => deleteBlock(selectedBlock.id)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 size={14}/>
                </button>
              </div>
              
              <div className="border-t border-slate-100 pt-4">
                <BlockPropsEditor type={selectedBlock.type} props={selectedBlock.props}
                  onChange={p => updateProps(selectedBlock.id, p)}/>
              </div>
              
              {/* Block Actions */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-xs font-semibold text-slate-700 mb-3">Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                    <Copy size={12}/> Duplicate Block
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                    <RefreshCw size={12}/> Reset to Default
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 text-center p-6">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-4">
                <Settings2 size={24} className="text-slate-400"/>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">No Block Selected</p>
              <p className="text-xs text-slate-400">Click a block to edit its properties or adjust page settings</p>
              <button 
                onClick={() => setShowPageSettings(true)}
                className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-200 transition-colors"
              >
                Open Page Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
