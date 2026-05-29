import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  ChevronLeft, Plus, Trash2, GripVertical, Settings2, Eye,
  Save, CheckCircle2, Type, Image, LayoutGrid, MessageSquare,
  Star, Zap, Minus, PlayCircle, ChevronDown, Users, Search,
  Monitor, Tablet, Smartphone, Palette, Layers, Copy, RefreshCw,
  Info, Lock, Unlock, Globe, Code, Sparkles, ArrowUpRight, ArrowRight,
  Wrench, Cpu, Frame, BookOpen, Smile, FlaskConical, Target,
  Shield, PencilRuler, MessageCircle, Undo2, Redo2
} from "lucide-react";

export const Route = createFileRoute("/admin/page-editor/$slug")({ component: PageEditor });

/* ─── Block type registry ─────────────────────────────── */
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
        { title: "Card 1", text: "Description", icon: "✦", link: "" }, 
        { title: "Card 2", text: "Description", icon: "✦", link: "" }, 
        { title: "Card 3", text: "Description", icon: "✦", link: "" }
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

  // ── Page Section Blocks ───────────────────────────
  {
    id: "about-hero",
    label: "About — Hero with Gallery",
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

  // ── Home Page Sections ───────────────────────────
  {
    id: "home-hero",
    label: "Home — Hero",
    icon: Zap,
    category: "Home Sections",
    description: "Full-width hero with background image, heading and CTAs",
    defaultProps: {
      eyebrow: "Digital Dental Laboratory",
      heading: "Digital Dental Laboratory for UK & Cyprus Dentists",
      highlight: "UK & Cyprus",
      subheading: "CAD/CAM milling · SLM metal printing · Zirconia · Lithium disilicate · Implant prosthetics · Digital prescription workflow.",
      image: "https://images.unsplash.com/photo-1684607631747-045ecfeeb4c7?w=1600&q=80&auto=format&fit=crop",
      cta1: "Submit a Case",
      cta1Link: "/submit",
      cta2: "Request Free Consultation",
      cta2Link: "/contact",
    }
  },
  {
    id: "home-trust-strip",
    label: "Home — Trust Strip",
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
    label: "Home — Stats & About",
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
    label: "Home — Workflow Steps",
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
    label: "Home — Services Grid",
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
    label: "Home — Specialisations Grid",
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
    label: "Home — Technology",
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
    label: "Home — Production",
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
    label: "Home — Badges",
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
    label: "Home — CTA Banner",
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
    label: "Home — News",
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

/* ─── Enhanced block preview renderers ─────────────────────────── */
function BlockPreview({ type, props }: { type: string; props: any }) {
  const getPaddingClass = (padding: string) => {
    switch (padding) {
      case "small": return "p-3";
      case "medium": return "p-4";
      case "large": return "p-6";
      default: return "p-4";
    }
  };

  const getFontSizeClass = (size: string) => {
    switch (size) {
      case "sm": return "text-sm";
      case "base": return "text-base";
      case "lg": return "text-lg";
      case "xl": return "text-xl";
      default: return "text-base";
    }
  };

  switch (type) {
    case "hero": {
      const align = props.align || "center";
      const textAlign = align === "left" ? "text-left" : "text-center";
      const mx = align === "left" ? "" : "mx-auto";
      return (
        <div className="min-h-[520px] text-white overflow-hidden relative flex items-center" style={{ background: props.bgColor || "#0d1e2c" }}>
          {props.image && (
            <div className="absolute inset-0">
              <img src={props.image} alt="" className="w-full h-full object-cover" style={{ opacity: 0.45 }}/>
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, rgba(13,30,44,${props.overlayOpacity || 0.75}) 0%, rgba(10,171,189,${(props.overlayOpacity || 0.75) * 0.35}) 100%)` }}/>
            </div>
          )}
          <div className={`relative w-full ${props.height === "large" ? "py-24" : "py-20"} px-8 md:px-12 ${textAlign} max-w-6xl mx-auto`}>
            {props.eyebrow && (
              <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-teal-300 font-bold mb-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                {props.eyebrow}
              </span>
            )}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 md:mb-7 leading-[1.1] drop-shadow-xl ${mx} max-w-4xl tracking-tight`}>
              {props.highlight ? (
                <>
                  {props.heading?.replace(props.highlight, "")}
                  <span className="text-teal-400">{props.highlight}</span>
                </>
              ) : props.heading}
            </h1>
            <p className={`text-white/85 mb-10 md:mb-12 text-lg md:text-xl lg:text-[1.35rem] leading-relaxed drop-shadow-md max-w-3xl ${mx} font-light`}>{props.subheading}</p>
            <div className={`flex flex-wrap gap-4 ${align === "left" ? "" : "justify-center"}`}>
              {props.cta1 && (
                <span className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white text-teal-700 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all">
                  {props.cta1} <ArrowRight size={16} className="text-teal-500"/>
                </span>
              )}
              {props.cta2 && (
                <span className="inline-flex items-center gap-2.5 px-7 py-3.5 border border-white/40 text-white rounded-full font-bold text-sm backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all">
                  {props.cta2}
                </span>
              )}
              {!props.cta1 && !props.cta2 && props.cta && (
                <span className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white text-teal-700 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all">
                  {props.cta} <ArrowUpRight size={16} className="text-teal-500"/>
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    case "about-hero": return (
      <div className="bg-white py-16 px-5 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            {props.eyebrow && <span className="text-[10px] uppercase tracking-[0.15em] text-teal-600 font-semibold">{props.eyebrow}</span>}
            <h1 className="mt-3 text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
              {props.highlight ? (
                <>
                  {props.heading?.replace(props.highlight, "")}
                  <span className="text-teal-500">{props.highlight}</span>
                  {props.heading?.split(props.highlight).slice(1).join(props.highlight)}
                </>
              ) : props.heading}
            </h1>
            <p className="mt-5 text-base text-slate-500 leading-relaxed">{props.subheading}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              {props.cta1 && <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold">{props.cta1} <ArrowRight size={14}/></span>}
              {props.cta2 && <span className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-teal-600 text-teal-600 rounded-lg text-sm font-semibold">{props.cta2} <ArrowRight size={14}/></span>}
            </div>
          </div>
          <div className="grid grid-cols-3 grid-rows-2 gap-3 h-72">
            {(props.gallery || []).slice(0, 5).map((img: any, i: number) => (
              <div key={i} className={`rounded-2xl overflow-hidden bg-slate-200 ${img.span || ""}`}>
                {img.src && <img src={img.src} alt={img.alt || ""} className="w-full h-full object-cover" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    case "text": return (
      <div className={`${getPaddingClass(props.padding)} rounded-2xl border shadow-sm`} 
           style={{ 
             backgroundColor: props.backgroundColor || "#ffffff", 
             borderColor: props.backgroundColor === "transparent" ? "#e5e7eb" : "transparent",
             color: props.textColor || "#374151"
           }}>
        <div className={`${getFontSizeClass(props.size)} text-${props.align || "left"} ${props.fontWeight === "bold" ? "font-bold" : ""} leading-relaxed max-w-none`}>
          {props.content}
        </div>
      </div>
    );
    
    case "image": return (
      <div className={`rounded-2xl overflow-hidden border ${props.shadow ? "shadow-lg" : ""} ${props.rounded ? "rounded-2xl" : ""}`}
           style={{ borderColor: "#e5e7eb" }}>
        {props.src ? (
          <img src={props.src} alt={props.alt} className="w-full object-cover" 
               style={{ maxHeight: "400px", aspectRatio: props.aspectRatio === "16:9" ? "16/9" : props.aspectRatio === "4:3" ? "4/3" : "auto" }}/>
        ) : (
          <div className="h-48 bg-linear-to-br from-gray-100 to-gray-50 flex items-center justify-center">
            <Image size={40} className="text-gray-400"/>
          </div>
        )}
        {props.caption && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center italic">{props.caption}</p>
          </div>
        )}
      </div>
    );
    
    case "image-text": return (
      <div className={`${getPaddingClass(props.padding)} rounded-2xl border shadow-sm`} 
           style={{ backgroundColor: props.backgroundColor || "#ffffff", borderColor: "#e5e7eb" }}>
        <div className={`flex gap-8 items-center ${!props.imageLeft ? "flex-row-reverse" : ""}`}>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">{props.heading}</h3>
            <p className="text-slate-600 mb-6 leading-relaxed text-lg">{props.text}</p>
            {props.cta && (
              <span className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700 cursor-pointer text-lg transition-colors">
                {props.cta} <ArrowUpRight size={18} className="ml-2"/>
              </span>
            )}
          </div>
          <div className="w-2/5 min-w-[200px]">
            {props.image ? (
              <img src={props.image} alt="" className="w-full h-full object-cover rounded-xl shadow-md"/>
            ) : (
              <div className="aspect-square bg-linear-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center shadow-md">
                <Image size={40} className="text-gray-400"/>
              </div>
            )}
          </div>
        </div>
      </div>
    );
    
    case "video": return (
      <div className="rounded-2xl overflow-hidden bg-gray-900 relative" style={{ aspectRatio: props.aspectRatio === "4:3" ? "4/3" : "16/9" }}>
        {props.url ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
              <PlayCircle size={32} className="text-white"/>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <PlayCircle size={48} className="text-gray-600"/>
          </div>
        )}
        {props.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/60 to-transparent">
            <p className="text-white text-sm">{props.caption}</p>
          </div>
        )}
      </div>
    );
    
    case "cards": {
      const accentMap: Record<string, string> = { teal: "border-l-teal-400", gold: "border-l-amber-400", indigo: "border-l-indigo-400", slate: "border-l-slate-400" };
      const iconMap: Record<string, any> = { BookOpen, Target, CheckCircle2, Cpu, Lock, FlaskConical, Smile, Wrench, Layers, Frame, Shield, PencilRuler };
      return (
        <div className="py-10 px-5 lg:px-8 rounded-2xl" style={{ backgroundColor: props.backgroundColor || "#f9fafb" }}>
          {props.heading && <h3 className="text-xl font-bold text-slate-800 text-center mb-6">{props.heading}</h3>}
          <div className={`grid gap-4 ${props.columns === 2 ? "grid-cols-1 md:grid-cols-2" : props.columns === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3"}`}>
            {(props.cards || []).map((c: any, i: number) => {
              const I = iconMap[c.icon];
              const cardAccent = accentMap[c.accent || props.accent || "teal"] || accentMap.teal;
              return (
                <div key={i} className={`bg-white rounded-xl p-5 border border-gray-100 h-full flex flex-col ${props.cardStyle === "borderLeft" ? `border-l-4 ${cardAccent}` : ""}`}>
                  {I && <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-3"><I size={18}/></div>}
                  {!I && c.icon && <div className="text-2xl mb-2">{c.icon}</div>}
                  <h4 className="font-bold text-slate-800 mb-1">{c.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">{c.text}</p>
                  {c.link && <span className="text-teal-600 text-xs font-semibold mt-3 inline-flex items-center gap-1">View <ArrowRight size={10}/></span>}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    case "testimonials": return (
      <div className={`${getPaddingClass(props.padding)} rounded-2xl`} 
           style={{ backgroundColor: props.backgroundColor || "#f9fafb" }}>
        {props.heading && <h3 className="text-xl font-bold text-slate-800 text-center mb-6">{props.heading}</h3>}
        <div className={props.layout === "grid" ? "grid gap-4" : "space-y-4"}>
          {(props.items || []).slice(0, props.layout === "grid" ? 2 : 1).map((t: any, i: number) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="text-yellow-400">{"★".repeat(t.rating || 5)}</div>
                {props.showPhotos && (
                  <div className="w-10 h-10 rounded-full bg-gray-200 ml-auto"/>
                )}
              </div>
              <p className="text-slate-700 italic mb-3">"{t.text}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{t.name}</p>
                  {t.role && <p className="text-sm text-slate-500">{t.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
    
    case "cta": return (
      <div className="rounded-2xl p-8 text-center relative overflow-hidden" style={{ background: props.bgColor || "#0aabbd" }}>
        <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent"/>
        <div className="relative">
          <h3 className="text-2xl font-bold text-white mb-3">{props.heading}</h3>
          <p className="text-white/90 mb-6 text-lg">{props.text}</p>
          <span className="inline-block px-6 py-3 bg-white text-slate-800 rounded-xl font-semibold hover:bg-gray-100 transition-colors cursor-pointer">
            {props.buttonText} <ArrowUpRight size={16} className="inline ml-1"/>
          </span>
        </div>
      </div>
    );
    
    case "stats": return (
      <div className={`${getPaddingClass(props.padding)} rounded-2xl border`} 
           style={{ backgroundColor: props.backgroundColor || "#ffffff", borderColor: "#e5e7eb" }}>
        <div className={`flex ${props.layout === "vertical" ? "flex-col space-y-4" : "justify-around"}`}>
          {(props.items || []).map((s: any, i: number) => (
            <div key={i} className="text-center">
              {props.showIcons && s.icon && <div className="text-2xl mb-2">{s.icon}</div>}
              <div className="text-2xl font-bold text-teal-600">{s.value}</div>
              <div className="text-sm text-slate-600">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
    
    case "team": return (
      <div className={`${getPaddingClass(props.padding)} rounded-2xl border`} 
           style={{ backgroundColor: props.backgroundColor || "#ffffff", borderColor: "#e5e7eb" }}>
        {props.heading && <h3 className="text-xl font-bold text-slate-800 text-center mb-6">{props.heading}</h3>}
        <div className={`grid gap-6 ${props.columns === 2 ? "grid-cols-2" : props.columns === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
          {(props.members || []).slice(0, 4).map((m: any, i: number) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-gray-100 to-gray-50 mx-auto mb-3 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm">
                {m.photo ? <img src={m.photo} className="w-full h-full object-cover" alt={m.name}/> : <Users size={24} className="text-gray-400"/>}
              </div>
              <div className="font-semibold text-slate-800">{m.name}</div>
              <div className="text-sm text-slate-600">{m.title}</div>
              {props.showBio && m.bio && <div className="text-xs text-slate-500 mt-2">{m.bio}</div>}
            </div>
          ))}
        </div>
      </div>
    );
    
    case "accordion": return (
      <div className={`${getPaddingClass(props.padding)} rounded-2xl border`} 
           style={{ backgroundColor: props.backgroundColor || "#ffffff", borderColor: "#e5e7eb" }}>
        {props.heading && <h3 className="text-xl font-bold text-slate-800 mb-4">{props.heading}</h3>}
        <div className="space-y-2">
          {(props.items || []).slice(0, 3).map((item: any, i: number) => (
            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="text-sm font-medium text-slate-700">{item.q}</span>
                <ChevronDown size={16} className="text-slate-400"/>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
    
    case "divider": return (
      <div className="py-4">
        <hr className={`border-${props.color === "#e5e7eb" ? "gray" : "custom"} my-${props.margin || "md"}`}
            style={{ borderColor: props.color || "#e5e7eb", borderWidth: props.thickness || "1px" }}/>
      </div>
    );

    /* ── Home Section Previews ─────────────────────────── */
    case "home-hero": return (
      <div className="relative text-white overflow-hidden" style={{ background: "#0d1e2c" }}>
        {props.image && (
          <div className="absolute inset-0">
            <img src={props.image} alt="" className="w-full h-full object-cover opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage:"linear-gradient(#0aabbd 1px, transparent 1px), linear-gradient(90deg, #0aabbd 1px, transparent 1px)",
          backgroundSize:"48px 48px",
        }}/>
        <div className="relative px-6 lg:px-8 pt-16 pb-14">
          <span className="text-[10px] uppercase tracking-[0.15em] text-teal-400 font-semibold">{props.eyebrow}</span>
          <h1 className="mt-3 font-bold text-2xl md:text-3xl lg:text-4xl leading-[1.1] max-w-3xl">
            {props.heading?.replace(props.highlight || "", "")}
            {props.highlight && <span className="text-teal-400">{props.highlight}</span>}
          </h1>
          <p className="mt-4 text-sm md:text-base text-white/80 max-w-2xl leading-relaxed">{props.subheading}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {props.cta1 && <span className="inline-flex items-center gap-2 bg-white text-slate-800 font-semibold px-5 py-2.5 rounded-lg text-sm">{props.cta1} <ArrowRight size={14}/></span>}
            {props.cta2 && <span className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-5 py-2.5 rounded-lg text-sm">{props.cta2}</span>}
          </div>
        </div>
      </div>
    );

    case "home-trust-strip": return (
      <div className="bg-white border-y border-slate-200">
        <div className="px-5 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-5">
          {(props.items || []).map((item: any, i: number) => {
            const iconMap: Record<string, any> = { Cpu, Lock, FlaskConical, Target };
            const I = iconMap[item.icon] || Cpu;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0"><I size={18}/></div>
                <div>
                  <div className="font-semibold text-sm text-slate-800">{item.title}</div>
                  <div className="text-[10px] tracking-widest uppercase text-slate-500 font-medium">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

    case "home-stats": return (
      <div className="bg-slate-50 py-10 px-5 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-[10px] uppercase tracking-[0.15em] text-teal-600 font-semibold">{props.eyebrow}</span>
            <h2 className="mt-2 text-xl md:text-2xl font-semibold text-slate-800 leading-tight">{props.heading}</h2>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">{props.body}</p>
            {props.linkText && <span className="inline-flex items-center gap-1 text-teal-600 font-semibold mt-4 text-sm">{props.linkText} <ArrowRight size={14}/></span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(props.stats || []).map((s: any, i: number) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="text-2xl md:text-3xl font-bold text-teal-600">{s.value}{s.suffix}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    case "home-workflow": return (
      <div className="bg-white py-10 px-5 lg:px-8 text-center">
        <span className="text-[10px] uppercase tracking-[0.15em] text-teal-600 font-semibold">{props.eyebrow}</span>
        <h2 className="mt-2 text-xl md:text-2xl font-semibold text-slate-800">{props.heading}</h2>
        <p className="mt-3 text-sm text-slate-500 max-w-xl mx-auto">{props.subheading}</p>
        <div className="mt-8 relative">
          <div className="hidden md:block absolute top-5 left-[12%] right-[12%] h-[2px] bg-slate-200"/>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 relative">
            {(props.steps || []).map((step: string, i: number) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-[0_4px_14px_rgba(10,171,189,.35)] relative z-10">{i + 1}</div>
                <div className="mt-3 font-semibold text-xs text-slate-700">{step}</div>
              </div>
            ))}
          </div>
        </div>
        {props.linkText && <span className="inline-flex items-center gap-1 text-teal-600 font-semibold mt-8 text-sm">{props.linkText} <ArrowRight size={14}/></span>}
      </div>
    );

    case "home-services": return (
      <div className="bg-slate-50 py-10 px-5 lg:px-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.15em] text-teal-600 font-semibold">{props.eyebrow}</span>
          <h2 className="mt-2 text-xl md:text-2xl font-semibold text-slate-800">{props.heading}</h2>
          <p className="mt-3 text-sm text-slate-500">{props.subheading}</p>
        </div>
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(props.services || []).map((s: any, i: number) => {
            const iconMap: Record<string, any> = { Smile, Wrench, Layers, Frame, Shield, PencilRuler };
            const I = iconMap[s.icon] || Smile;
            return (
              <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 h-full flex flex-col">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-3"><I size={18}/></div>
                <h3 className="font-semibold text-sm text-slate-800">{s.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed flex-1">{s.desc}</p>
                <span className="text-teal-600 text-xs font-semibold mt-3 inline-flex items-center gap-1">View Service <ArrowRight size={10}/></span>
              </div>
            );
          })}
        </div>
        {props.linkText && (
          <div className="text-center mt-6">
            <span className="inline-flex items-center gap-2 border border-teal-600 text-teal-600 font-semibold px-5 py-2.5 rounded-lg text-sm">{props.linkText} <ArrowRight size={14}/></span>
          </div>
        )}
      </div>
    );

    case "home-specialisations": return (
      <div className="bg-white py-10 px-5 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase tracking-[0.15em] text-teal-600 font-semibold">{props.eyebrow}</span>
          <h2 className="mt-2 text-xl md:text-2xl font-semibold text-slate-800">{props.heading}</h2>
          <p className="mt-3 text-sm text-slate-500 max-w-xl mx-auto">{props.subheading}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 rounded-2xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          {(props.tiles || []).map((tile: any, i: number) => (
            <div key={i} className="relative h-36 md:h-44 overflow-hidden group">
              {tile.img && <img src={tile.img} alt={tile.label || "dental"} className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-[#0d1e2c]/50 group-hover:bg-[#0d1e2c]/60 transition-colors" />
              {tile.text && tile.label && (
                <div className="absolute inset-0 flex flex-col justify-center p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-[2px] bg-teal-400"/>
                    <span className="text-white font-bold text-sm tracking-wide uppercase">{tile.label}</span>
                  </div>
                  <p className="text-white/80 text-[10px] md:text-xs leading-relaxed whitespace-pre-line">{tile.sub}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );

    case "home-technology": return (
      <div className="bg-[#0d1e2c] text-white py-10 px-5 lg:px-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-teal-400 font-semibold">{props.eyebrow}</div>
          <h2 className="mt-2 text-xl md:text-2xl font-semibold max-w-xl">{props.heading}</h2>
        </div>
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(props.items || []).map((t: any, i: number) => (
            <div key={i} className="rounded-xl p-4 border border-white/10 bg-white/3 h-full">
              <div className="text-[10px] uppercase tracking-[0.12em] text-teal-400 font-medium">{t.brand}</div>
              <div className="font-semibold text-amber-300 mt-1.5 text-sm">{t.name}</div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {t.tags.split(",").map((tag: string) => (
                  <span key={tag} className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 font-medium">{tag.trim()}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        {props.linkText && (
          <div className="mt-6">
            <span className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-5 py-2.5 rounded-lg text-sm">{props.linkText} <ArrowRight size={14}/></span>
          </div>
        )}
      </div>
    );

    case "home-production": return (
      <div className="bg-white py-10 overflow-hidden">
        <div className="px-5 lg:px-8 text-center">
          <span className="text-[10px] uppercase tracking-[0.15em] text-teal-600 font-semibold">{props.eyebrow}</span>
          <h2 className="mt-2 text-xl md:text-2xl font-semibold text-slate-800">{props.heading}</h2>
        </div>
        <div className="mt-6 relative px-5 lg:px-8">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {(props.brands || "").split(",").map((b: string, i: number) => (
              <span key={i} className="px-4 py-2 rounded-full bg-teal-50 text-teal-600 font-semibold text-xs whitespace-nowrap">{b.trim()}</span>
            ))}
          </div>
        </div>
        <div className="px-5 lg:px-8 mt-8 grid md:grid-cols-3 gap-4">
          {(props.cards || []).map((c: any, i: number) => (
            <div key={i} className="relative h-36 rounded-xl overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-linear-to-t from-[#0d1e2c]/90 via-[#0d1e2c]/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <div className="text-white font-semibold text-base">{c.title}</div>
                <div className="text-teal-400 text-[10px] mt-1 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">Explore <ArrowRight size={10}/></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    case "home-badges": return (
      <div className="bg-white py-8 border-t border-slate-200">
        <div className="px-5 lg:px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {(props.items || []).map((b: any, i: number) => (
            <div key={i}>
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2"><CheckCircle2 size={20}/></div>
              <div className="font-bold text-sm text-slate-800">{b.title}</div>
              <div className="text-xs text-slate-500 mt-1">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );

    case "home-cta": return (
      <div className="py-10 px-5 lg:px-8 text-center text-white" style={{background:"linear-gradient(135deg, #0aabbd, #0891a8)"}}>
        <h2 className="text-xl md:text-2xl font-bold">{props.heading}</h2>
        <p className="mt-3 text-white/85 max-w-xl mx-auto text-sm">{props.subheading}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {props.btn1 && <span className="inline-flex items-center gap-2 bg-white text-teal-700 font-semibold px-5 py-2.5 rounded-lg text-sm">{props.btn1} <ArrowRight size={14}/></span>}
          {props.btn2 && <span className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold px-5 py-2.5 rounded-lg text-sm"><MessageCircle size={14}/> {props.btn2}</span>}
        </div>
      </div>
    );

    case "home-news": return (
      <div className="bg-white py-10 px-5 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-800">{props.heading}</h2>
          {props.linkText && <span className="text-teal-600 font-semibold text-sm inline-flex items-center gap-1">{props.linkText} <ArrowRight size={14}/></span>}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {(props.articles || []).map((a: any, i: number) => (
            <article key={i} className="rounded-xl overflow-hidden bg-white border border-slate-100 hover:shadow-[0_8px_24px_rgba(0,0,0,.06)] transition-all hover:-translate-y-0.5">
              <div className="relative h-32">
                {a.img && <img src={a.img} alt={a.category} className="absolute inset-0 w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-linear-to-t from-[#0d1e2c]/70 to-transparent"/>
                <span className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.12em] font-medium text-white bg-teal-500 px-2 py-1 rounded">{a.category}</span>
              </div>
              <div className="p-4">
                <div className="text-[10px] text-slate-400">{a.date}</div>
                <h3 className="font-semibold mt-1.5 text-sm text-slate-800 leading-snug">{a.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    );

    default: return (
      <div className="p-6 bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 text-center">
        <div className="text-gray-400 mb-2">
          <Layers size={24} className="mx-auto"/>
        </div>
        <div className="text-sm text-gray-600 font-medium">[{type}]</div>
        <div className="text-xs text-gray-400 mt-1">Block type preview</div>
      </div>
    );
  }
}

/* ─── Props editor per block type ──────────────────────── */
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
        <TextField label="Image URL"  value={props.image}      onChange={v => set("image", v)}/>
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
            <input value={img.src} onChange={e => { const g = [...props.gallery]; g[i] = { ...g[i], src: e.target.value }; set("gallery", g); }} placeholder="Image URL" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
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
    case "image": return (
      <div className="space-y-3">
        <TextField label="Image URL" value={props.src}     onChange={v => set("src", v)}/>
        <TextField label="Alt Text"  value={props.alt}     onChange={v => set("alt", v)}/>
        <TextField label="Caption"   value={props.caption} onChange={v => set("caption", v)}/>
      </div>
    );
    case "image-text": return (
      <div className="space-y-3">
        <TextField label="Heading"   value={props.heading}  onChange={v => set("heading", v)}/>
        <TextArea  label="Text"      value={props.text}     onChange={v => set("text", v)}/>
        <TextField label="Image URL" value={props.image}    onChange={v => set("image", v)}/>
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
        <button onClick={() => set("cards", [...(props.cards || []), { title: "", text: "", icon: "✦" }])}
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

    /* ── Home Section Props Editors ─────────────────────── */
    case "home-hero": return (
      <div className="space-y-3">
        <TextField label="Eyebrow" value={props.eyebrow} onChange={v => set("eyebrow", v)}/>
        <TextField label="Heading" value={props.heading} onChange={v => set("heading", v)}/>
        <TextField label="Highlight Word" value={props.highlight} onChange={v => set("highlight", v)}/>
        <TextArea label="Subheading" value={props.subheading} onChange={v => set("subheading", v)}/>
        <TextField label="Background Image URL" value={props.image} onChange={v => set("image", v)}/>
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
            <input value={tile.img} onChange={e => { const t = [...props.tiles]; t[i] = { ...t[i], img: e.target.value }; set("tiles", t); }} placeholder="Image URL" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
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
            <input value={a.img} onChange={e => { const ar = [...props.articles]; ar[i] = { ...ar[i], img: e.target.value }; set("articles", ar); }} placeholder="Image URL" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
          </div>
        ))}
        <button onClick={() => set("articles", [...(props.articles || []), { category: "", title: "", date: "", img: "" }])} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800">+ Add article</button>
      </div>
    );
    default: return <div className="text-xs text-slate-400 text-center py-4">No props for this block type</div>;
  }
}

/* ─── Default homepage blocks (seed) ──────────────────── */
const DEFAULT_HOME_BLOCKS: Block[] = [
  { id: "home-hero-1", type: "home-hero", order: 0, props: {
    eyebrow: "Digital Dental Laboratory",
    heading: "Digital Dental Laboratory for UK & Cyprus Dentists",
    highlight: "UK & Cyprus",
    subheading: "CAD/CAM milling · SLM metal printing · Zirconia · Lithium disilicate · Implant prosthetics · Digital prescription workflow.",
    image: "https://images.unsplash.com/photo-1684607631747-045ecfeeb4c7?w=1600&q=80&auto=format&fit=crop",
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
    content:"ALFAMILL · VENEA · Asiga · Dental Wings · Ivoclar · CEREC · Renfert · KaVo · CE Certified",
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
    content:"Live status, every step of the way. Our 11-step case status timeline keeps you informed: Submitted → File Review → Awaiting Information → Design Stage → Dentist Approval → In Production → Finishing → Quality Control → Ready for Dispatch → Dispatched → Completed.",
    align:"left", size:"base", fontWeight:"normal", textColor:"#374151", backgroundColor:"#ffffff", padding:"large"
  }},
  { id:"wf-logistics", type:"text", order:4, props:{
    content:"Logistics & Tracking. Cases are dispatched via DHL or UPS with full digital tracking. You will receive notifications at dispatch and delivery, with tracking numbers visible directly in your dentist portal.",
    align:"left", size:"base", fontWeight:"normal", textColor:"#374151", backgroundColor:"#f8fafc", padding:"large"
  }},
];

const PAGE_DEFAULTS: Record<string, Block[]> = {
  home: DEFAULT_HOME_BLOCKS,
  about: DEFAULT_ABOUT_BLOCKS,
  services: DEFAULT_SERVICES_BLOCKS,
  quality: DEFAULT_QUALITY_BLOCKS,
  technology: DEFAULT_TECHNOLOGY_BLOCKS,
  workflow: DEFAULT_WORKFLOW_BLOCKS,
};

/* ─── Main editor component ───────────────────────────── */
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

  /* ── Undo / Redo ─────────────────────────────────────── */
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
            {saved ? <><CheckCircle2 size={14}/> Saved!</> : saving ? "Saving…" : <><Save size={14}/> Save</>}
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
                      ↑
                    </button>
                    <button onClick={e => { e.stopPropagation(); moveBlock(block.id, 1); }} disabled={idx === blocks.length - 1}
                      className="w-7 h-7 bg-white rounded text-slate-600 flex items-center justify-center text-xs hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      ↓
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
                  ×
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
