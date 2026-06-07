import express from "express";
import { Page } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { logActivity } from "../services/activity.js";
import crypto from "node:crypto";

export const pagesRouter = express.Router();

const EDITABLE_PAGES = [
  { slug: "home",                     title: "Home Page" },
  { slug: "about",                    title: "About Us" },
  { slug: "services",                 title: "Services" },
  { slug: "quality",                  title: "Quality" },
  { slug: "technology",               title: "Technology" },
  { slug: "technology-cad-cam-milling",       title: "Technology — CAD/CAM Milling" },
  { slug: "technology-slm-metal-printing",    title: "Technology — SLM Metal Printing" },
  { slug: "technology-3d-printing",           title: "Technology — 3D Printing" },
  { slug: "technology-scanning-design",       title: "Technology — Scanning & Design" },
  { slug: "technology-sintering-ceramic-firing", title: "Technology — Sintering & Ceramic Firing" },
  { slug: "technology-finishing-equipment",   title: "Technology — Finishing Equipment" },
  { slug: "workflow",                 title: "Workflow" },
  { slug: "contact",                  title: "Contact" },
  { slug: "fixed-restorations",       title: "Service — Fixed Restorations" },
  { slug: "implant-prosthetics",      title: "Service — Implant Prosthetics" },
  { slug: "removable-prosthetics",    title: "Service — Removable Prosthetics" },
  { slug: "metal-frameworks",         title: "Service — Metal Frameworks" },
  { slug: "splints-guards",           title: "Service — Splints & Guards" },
  { slug: "digital-design",           title: "Service — Digital Design Support" },
  { slug: "footer",                   title: "Footer" },
];

const FOOTER_BLOCK = { id: "footer-main", type: "site-footer", order: 99, props: {
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
      { label: "Shade Taking", href: "/resources" },
      { label: "Implant Requirements", href: "/resources" },
      { label: "File Upload Help", href: "/resources" },
      { label: "FAQs", href: "/resources" },
    ] },
    { title: "Support", links: [
      { label: "Quality & Compliance", href: "/quality" },
      { label: "Technology", href: "/technology" },
      { label: "Contact", href: "/contact" },
      { label: "Dentist Portal", href: "/portal" },
    ] },
  ],
  copyright: "© {year} Prime Smile Dental Laboratory. All rights reserved.",
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Data Notice", href: "/data-notice" },
  ],
} };

const DEFAULT_PAGE_BLOCKS = {
  home: [
    { id: "home-hero-1", type: "home-hero", order: 0, props: { eyebrow: "Digital Dental Laboratory", heading: "Digital Dental Laboratory for UK & Cyprus Dentists", highlight: "UK & Cyprus", subheading: "CAD/CAM milling · SLM metal printing · Zirconia · Lithium disilicate · Implant prosthetics · Digital prescription workflow.", image: "https://images.unsplash.com/photo-1684607631747-045ecfeeb4c7?w=1600&q=80&auto=format&fit=crop", cta1: "Submit a Case", cta1Link: "/submit", cta2: "Request Free Consultation", cta2Link: "/contact" } },
    { id: "home-trust-1", type: "home-trust-strip", order: 1, props: { items: [ { icon: "Cpu", title: "Digital", desc: "CAD/CAM Workflow" }, { icon: "Lock", title: "Confidential", desc: "Patient Data Protection" }, { icon: "FlaskConical", title: "Advanced", desc: "CE-Certified Materials" }, { icon: "Target", title: "Precision", desc: "Multi-Step Quality Control" } ] } },
    { id: "home-stats-1", type: "home-stats", order: 2, props: { eyebrow: "About Us", heading: "A digital lab built around precision, traceability and trust.", body: "Prime Smile is a fully digital dental laboratory partnering with dentists across the UK and Cyprus. Every case is processed through a structured digital prescription workflow with strict quality control at every stage.", linkText: "About Us", linkHref: "/about", stats: [ { value: "10", suffix: "+", label: "Years of Digital Lab Experience" }, { value: "500", suffix: "+", label: "Cases Delivered Per Month" }, { value: "6", suffix: "", label: "Multi-Step Quality Control Points" }, { value: "100", suffix: "%", label: "CE-Certified Materials Used" } ] } },
    { id: "home-workflow-1", type: "home-workflow", order: 3, props: { eyebrow: "Modern Approach", heading: "Our Digital Workflow", subheading: "We use advanced digital instruments and workflow to ensure the highest standard of every restoration.", steps: ["Register / Login","Fill Digital Prescription","Upload Scans & Files","Track Your Case Live","Receive Finished Work"], linkText: "Learn about our Digital Workflow", linkHref: "/workflow" } },
    { id: "home-services-1", type: "home-services", order: 4, props: { eyebrow: "Our Services", heading: "Comprehensive Lab Services", subheading: "We provide a full range of dental laboratory services. Every case is managed with a digital prescription workflow.", services: [ { icon: "Smile", title: "Fixed Restorations", desc: "Crowns, bridges, veneers, inlays & onlays in zirconia and lithium disilicate." }, { icon: "Wrench", title: "Implant Prosthetics", desc: "Custom abutments, screw-retained crowns, bars and full-arch restorations." }, { icon: "Layers", title: "Removable Prosthetics", desc: "Full and partial dentures with digital design and high-precision fit." }, { icon: "Frame", title: "Metal Frameworks", desc: "Cobalt-chrome frameworks via SLM metal printing for accuracy and strength." }, { icon: "Shield", title: "Splints & Guards", desc: "Night guards, bruxism splints and surgical guides from validated workflows." }, { icon: "PencilRuler", title: "Digital Design Support", desc: "STL design, smile design and treatment planning collaboration." } ], linkText: "View All Services", linkHref: "/services" } },
    { id: "home-specs-1", type: "home-specialisations", order: 5, props: { eyebrow: "Specialisations", heading: "Our Core Restorations", subheading: "Every restoration is crafted using industry-leading materials and digital precision workflow.", tiles: [ { label: "Zirconia", sub: "Achieve High Level Of Aesthetic\nWithout Sacrificing Durability", img: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=600&q=80&auto=format&fit=crop", text: true }, { label: "", sub: "", img: "https://images.pexels.com/photos/7800553/pexels-photo-7800553.jpeg?w=600&q=80&auto=format&fit=crop", text: false }, { label: "Porcelain", sub: "Aesthetic And Function Are\nTogether", img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=80&auto=format&fit=crop", text: true }, { label: "", sub: "", img: "https://images.pexels.com/photos/5355922/pexels-photo-5355922.jpeg?w=600&q=80&auto=format&fit=crop", text: false }, { label: "Implants", sub: "Long Lasting Prosthetics", img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80&auto=format&fit=crop", text: true }, { label: "", sub: "", img: "https://images.pexels.com/photos/6501859/pexels-photo-6501859.jpeg?w=600&q=80&auto=format&fit=crop", text: false }, { label: "Inlays / Onlays", sub: "Perfect Match At The Most\nPrecision Points", img: "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&q=80&auto=format&fit=crop", text: true }, { label: "", sub: "", img: "https://images.pexels.com/photos/33800642/pexels-photo-33800642.jpeg?w=600&q=80&auto=format&fit=crop", text: false } ] } },
    { id: "home-tech-1", type: "home-technology", order: 6, props: { eyebrow: "Technology", heading: "A Complete Digital Production Environment", items: [ { name: "ALFAMILL 5-Axis / Yena D30", brand: "CAD/CAM Milling", tags: "Zirconia, PMMA" }, { name: "VENEA VDexk1 eco", brand: "SLM Metal Printing", tags: "Co-Cr, Frameworks" }, { name: "Asiga MAX UV", brand: "DLP 3D Printing", tags: "Models, Splints" }, { name: "Dental Wings 7 Series", brand: "Scanning & Design", tags: "Scan, CAD" }, { name: "Ivoclar Programat / SpeedFire", brand: "Sintering & Firing", tags: "Ceramic" }, { name: "Renfert / KaVo", brand: "Finishing & Polishing", tags: "Surface" }, { name: "Bio-Art / Deflex", brand: "Model Workflow", tags: "Articulator" }, { name: "EKOSAN / Stanley AIR COM", brand: "Air Infrastructure", tags: "Clean Air" } ], linkText: "View All Technology", linkHref: "/technology" } },
    { id: "home-prod-1", type: "home-production", order: 7, props: { eyebrow: "Production", heading: "Built on Industry-Leading Standards", brands: "ALFAMILL,VENEA,Asiga,Dental Wings,Ivoclar,CEREC,Renfert,KaVo,DHL,CE Certified", cards: [ { title: "Materials & Equipment", img: "Materials & Equipment" }, { title: "Production Timeline", img: "Production Timeline" }, { title: "Production Management", img: "Production Management" } ] } },
    { id: "home-badges-1", type: "home-badges", order: 8, props: { items: [ { title: "CE-Certified Consumables", desc: "Verified supplier materials" }, { title: "Quality Practices", desc: "Documented QC checkpoints" }, { title: "CE-Certified Materials", desc: "World-Renowned Suppliers" }, { title: "Digital Case Tracking", desc: "Submission to Dispatch" } ] } },
    { id: "home-cta-1", type: "home-cta", order: 9, props: { heading: "Ready to Submit Your First Case?", subheading: "Diagnosis is free. Every case is managed with a digital prescription. Treatment plans are customised to your needs.", btn1: "Create Dentist Account", btn1Link: "/portal", btn2: "WhatsApp Us", btn2Link: "#" } },
    { id: "home-news-1", type: "home-news", order: 10, props: { heading: "News & Updates", linkText: "All News", linkHref: "#", articles: [ { category: "Industry News", title: "New SLM metal printing capabilities now live in our Cyprus facility", date: "12 Apr 2026", img: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=800&q=80&auto=format&fit=crop" }, { category: "Case Study", title: "Full-arch implant rehabilitation: workflow walkthrough", date: "28 Mar 2026", img: "https://images.unsplash.com/photo-1684607631747-045ecfeeb4c7?w=800&q=80&auto=format&fit=crop" }, { category: "Materials", title: "Updated zirconia portfolio: improved translucency and strength", date: "14 Mar 2026", img: "https://images.unsplash.com/photo-1590424693420-634a0b0b782c?w=800&q=80&auto=format&fit=crop" } ] } },
    FOOTER_BLOCK,
  ],
  about: [
    { id: "about-hero", type: "hero", order: 0, props: { eyebrow: "FACILITY", heading: "About Dental Laboratory", highlight: "Prime Smile", subheading: "Prime Smile is a fully digital dental laboratory operating across the UK and Cyprus. We partner with dental clinics who demand precision, accountability and consistent results.", image: "https://images.pexels.com/photos/7800553/pexels-photo-7800553.jpeg?w=1600&q=80&auto=format&fit=crop", bgColor: "#0d1e2c", cta1: "Contact Us", cta1Link: "/contact", cta2: "Our Workflow", cta2Link: "/workflow", align: "center", overlayOpacity: 0.5 } },
    { id: "about-story", type: "cards", order: 1, props: { heading: "", columns: 3, backgroundColor: "#f8fafc", cardStyle: "borderLeft", cards: [ { title: "Our Story", text: "Founded by a team of master technicians who saw the future was digital. We invested early in CAD/CAM, SLM printing and validated workflows.", icon: "BookOpen", link: "", accent: "teal" }, { title: "Our Mission", text: "To make precision dental restoration accessible to every dentist through fully traceable, digitally-managed lab work. No paper. No guessing.", icon: "Target", link: "", accent: "gold" }, { title: "Our Standards", text: "Using CE-certified consumables only. Six quality control checkpoints per case. Zero compromises on fit, aesthetics or traceability.", icon: "CheckCircle2", link: "", accent: "teal" } ] } },
    { id: "about-certs", type: "home-badges", order: 2, props: { items: [ { title: "CE-Certified Consumables", desc: "Verified supplier materials" }, { title: "Quality Practices", desc: "Documented QC checkpoints" }, { title: "CE-Certified Materials", desc: "World-Renowned Suppliers" }, { title: "Digital Case Tracking", desc: "Submission to Dispatch" } ] } },
    { id: "about-cta", type: "home-cta", order: 3, props: { heading: "Ready to partner with us?", subheading: "Create your dentist account and submit your first case today.", btn1: "Get Started", btn1Link: "/portal", btn2: "", btn2Link: "" } },
    FOOTER_BLOCK,
  ],
  services: [
    { id: "sv-hero", type: "hero", order: 0, props: { eyebrow: "Our Services", heading: "Comprehensive Lab Services", highlight: "", subheading: "Every service is delivered through a digital prescription workflow with full traceability, multi-step QC and CE-certified materials.", image: "https://images.unsplash.com/photo-1684607631747-045ecfeeb4c7?w=1600&q=80&auto=format&fit=crop", bgColor: "#0d1e2c", cta1: "", cta1Link: "", cta2: "", cta2Link: "" } },
    { id: "sv-grid", type: "home-services", order: 1, props: { eyebrow: "Our Services", heading: "Comprehensive Lab Services", subheading: "We provide a full range of dental laboratory services. Every case is managed with a digital prescription workflow.", services: [ { icon: "Smile", title: "Fixed Restorations", desc: "Crowns, bridges, veneers, inlays & onlays in zirconia and lithium disilicate." }, { icon: "Wrench", title: "Implant Prosthetics", desc: "Custom abutments, screw-retained crowns, bars and full-arch restorations." }, { icon: "Layers", title: "Removable Prosthetics", desc: "Full and partial dentures with digital design and high-precision fit." }, { icon: "Frame", title: "Metal Frameworks", desc: "Cobalt-chrome frameworks via SLM metal printing for accuracy and strength." }, { icon: "Shield", title: "Splints & Guards", desc: "Night guards, bruxism splints and surgical guides from validated workflows." }, { icon: "PencilRuler", title: "Digital Design Support", desc: "STL design, smile design and treatment planning collaboration." } ], linkText: "View All Services", linkHref: "/services" } },
    { id: "sv-materials", type: "home-specialisations", order: 2, props: { eyebrow: "Materials", heading: "Our Core Restorations", subheading: "Every restoration is crafted using industry-leading materials and digital precision workflow.", tiles: [ { label: "Zirconia", sub: "Achieve High Level Of Aesthetic\nWithout Sacrificing Durability", img: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=600&q=80&auto=format&fit=crop", text: true }, { label: "", sub: "", img: "https://images.pexels.com/photos/7800553/pexels-photo-7800553.jpeg?w=600&q=80&auto=format&fit=crop", text: false }, { label: "Porcelain", sub: "Aesthetic And Function Are\nTogether", img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=80&auto=format&fit=crop", text: true }, { label: "", sub: "", img: "https://images.pexels.com/photos/5355922/pexels-photo-5355922.jpeg?w=600&q=80&auto=format&fit=crop", text: false }, { label: "Implants", sub: "Long Lasting Prosthetics", img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80&auto=format&fit=crop", text: true }, { label: "", sub: "", img: "https://images.pexels.com/photos/6501859/pexels-photo-6501859.jpeg?w=600&q=80&auto=format&fit=crop", text: false }, { label: "Inlays / Onlays", sub: "Perfect Match At The Most\nPrecision Points", img: "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&q=80&auto=format&fit=crop", text: true }, { label: "", sub: "", img: "https://images.pexels.com/photos/33800642/pexels-photo-33800642.jpeg?w=600&q=80&auto=format&fit=crop", text: false } ] } },
    FOOTER_BLOCK,
  ],
  quality: [
    { id: "q-hero", type: "hero", order: 0, props: { eyebrow: "Quality", heading: "Quality & Compliance", highlight: "", subheading: "Every Prime Smile case is processed through a documented quality system with robust QC checkpoints to ensure patient safety and fit.", image: "", bgColor: "#ffffff", cta1: "", cta1Link: "", cta2: "", cta2Link: "" } },
    { id: "q-qc", type: "cards", order: 1, props: { heading: "Quality Control Checkpoints", columns: 2, backgroundColor: "#f8fafc", cards: [ { title: "Incoming Case Review", text: "Every digital prescription is validated against scan files and case requirements.", icon: "CheckCircle2", link: "" }, { title: "Design Verification", text: "CAD designs reviewed by senior technicians before production begins.", icon: "CheckCircle2", link: "" }, { title: "Material Verification", text: "Material lot numbers logged for every restoration. Full traceability.", icon: "CheckCircle2", link: "" }, { title: "Production QC", text: "Dimensional and aesthetic checks at every production stage.", icon: "CheckCircle2", link: "" }, { title: "Final Quality Control", text: "Pre-dispatch inspection: fit, occlusion, finish, shade and packaging.", icon: "CheckCircle2", link: "" }, { title: "Dispatch Documentation", text: "Each case dispatched with material declaration and traceability sheet.", icon: "CheckCircle2", link: "" } ] } },
    { id: "q-badges", type: "home-badges", order: 2, props: { items: [ { title: "CE-Certified Consumables", desc: "Verified supplier materials" }, { title: "Quality Practices", desc: "Documented QC checkpoints" }, { title: "CE-Certified Materials", desc: "World-Renowned Suppliers" }, { title: "Digital Case Tracking", desc: "Submission to Dispatch" } ] } },
    { id: "q-trace", type: "image-text", order: 3, props: { heading: "Material Traceability", text: "Every material lot is logged against your case ID. Full traceability sheets are dispatched with every restoration. Prime Smile complies with UK MHRA Custom-Made Device requirements and is registered with the appropriate UKRP for distribution into the UK market.", image: "", imageLeft: true, cta: "", ctaLink: "", backgroundColor: "#ffffff" } },
    { id: "q-faq", type: "accordion", order: 4, props: { heading: "Complaint & Remake Policy", items: [ { q: "What is your remake policy?", a: "Remakes due to lab error are free of charge within the warranty period (12 months for fixed restorations). A clear remake reason is required to maintain quality records." }, { q: "How do you handle complaints?", a: "Submit through the dentist portal or via email. Our QC manager investigates within 48 hours and provides a written report with corrective actions." }, { q: "Can I receive material declarations for patients?", a: "Yes. Every case is dispatched with a material declaration sheet listing all materials, lot numbers and standards used." } ], backgroundColor: "#f8fafc", iconStyle: "chevron" } },
    FOOTER_BLOCK,
  ],
  technology: [
    { id: "tech-hero", type: "hero", order: 0, props: { eyebrow: "Technology", heading: "A Complete Digital Production Environment", highlight: "", subheading: "From scanning to sintering, every machine in our facility is calibrated, validated and integrated into our digital workflow.", image: "https://cdn.pixabay.com/photo/2020/08/27/18/31/teeth-5522653_1280.jpg?w=1600&q=80&auto=format&fit=crop", bgColor: "#0d1e2c", cta1: "Request a Facility Tour", cta1Link: "/contact", cta2: "", cta2Link: "" } },
    { id: "tech-equip", type: "home-technology", order: 1, props: { eyebrow: "Technology", heading: "A Complete Digital Production Environment", items: [ { name: "ALFAMILL 5-Axis / Yena D30", brand: "CAD/CAM Milling", tags: "Zirconia, PMMA" }, { name: "VENEA VDexk1 eco", brand: "SLM Metal Printing", tags: "Co-Cr, Frameworks" }, { name: "Asiga MAX UV", brand: "DLP 3D Printing", tags: "Models, Splints" }, { name: "Dental Wings 7 Series", brand: "Scanning & Design", tags: "Scan, CAD" }, { name: "Ivoclar Programat / SpeedFire", brand: "Sintering & Firing", tags: "Ceramic" }, { name: "Renfert / KaVo", brand: "Finishing & Polishing", tags: "Surface" } ], linkText: "View All Technology", linkHref: "/technology" } },
    { id: "tech-brands", type: "text", order: 2, props: { content: "ALFAMILL · VENEA · Asiga · Dental Wings · Ivoclar · CEREC · Renfert · KaVo · CE Certified", align: "center", size: "base", fontWeight: "bold", textColor: "#0aabbd", backgroundColor: "#ffffff", padding: "medium" } },
    FOOTER_BLOCK,
  ],
  "technology-cad-cam-milling": [
    { id: "tccm-hero", type: "hero", order: 0, props: { eyebrow: "Technology", heading: "CAD/CAM Milling", highlight: "", subheading: "5-axis simultaneous milling for precision restorations in zirconia, PMMA, titanium, cobalt-chrome and lithium disilicate.", image: "https://images.pexels.com/photos/30874064/pexels-photo-30874064.jpeg?w=1600&q=80&auto=format&fit=crop", bgColor: "#0d1e2c", cta1: "Submit a Case", cta1Link: "/submit", cta2: "", cta2Link: "" } },
    { id: "tccm-text", type: "image-text", order: 1, props: { heading: "ALFAMILL Universal 5-Axis Hybrid CNC", text: "High-performance 5-axis simultaneous milling with hybrid wet/dry capability for crowns, bridges, veneers, inlays, onlays, custom abutments and implant bars. Materials include zirconia, PMMA, wax, titanium, CoCr, lithium disilicate and hybrid ceramics.", image: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=800&q=80&auto=format&fit=crop", imageLeft: true, cta: "View Fixed Restorations", ctaLink: "/services/fixed-restorations", backgroundColor: "#ffffff", padding: "large" } },
    { id: "tccm-cta", type: "cta", order: 2, props: { heading: "Ready to mill your next case?", text: "Upload your scan and prescription for a free assessment and turnaround estimate.", buttonText: "Submit Case", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
    FOOTER_BLOCK,
  ],
  "technology-slm-metal-printing": [
    { id: "tsmp-hero", type: "hero", order: 0, props: { eyebrow: "Technology", heading: "SLM Metal Printing", highlight: "", subheading: "Selective laser melting for cobalt-chrome frameworks, implant bars and RPD frameworks with layer-by-layer precision.", image: "https://images.pexels.com/photos/6627596/pexels-photo-6627596.jpeg?w=1600&q=80&auto=format&fit=crop", bgColor: "#0d1e2c", cta1: "Submit a Case", cta1Link: "/submit", cta2: "", cta2Link: "" } },
    { id: "tsmp-text", type: "image-text", order: 1, props: { heading: "VENEA VDexk1 eco SLM Printer", text: "Selective laser melting for additive manufacturing of cobalt-chrome and titanium frameworks with layer-by-layer precision. Used for partial denture frameworks, implant bar frameworks, telescopic crowns and combination cases.", image: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=800&q=80&auto=format&fit=crop", imageLeft: true, cta: "View Metal Frameworks", ctaLink: "/services/metal-frameworks", backgroundColor: "#ffffff", padding: "large" } },
    { id: "tsmp-cta", type: "cta", order: 2, props: { heading: "Need an SLM framework?", text: "Upload your scan and prescription for a free feasibility review.", buttonText: "Submit Case", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
    FOOTER_BLOCK,
  ],
  "technology-3d-printing": [
    { id: "t3dp-hero", type: "hero", order: 0, props: { eyebrow: "Technology", heading: "3D Printing", highlight: "", subheading: "DLP resin printing for splints, surgical guides, models and biocompatible dental workflows.", image: "https://images.pexels.com/photos/6502031/pexels-photo-6502031.jpeg?w=1600&q=80&auto=format&fit=crop", bgColor: "#0d1e2c", cta1: "Submit a Case", cta1Link: "/submit", cta2: "", cta2Link: "" } },
    { id: "t3dp-text", type: "image-text", order: 1, props: { heading: "Asiga MAX UV DLP Printer", text: "High-resolution DLP printing with UV LED light engine for surgical guides, splints, study models, try-ins and orthodontic retainers. We use CE-certified biocompatible resins including Asiga DentaGUIDE and DentaCLEAR.", image: "https://images.unsplash.com/photo-1590424693420-634a0b0b782c?w=800&q=80&auto=format&fit=crop", imageLeft: true, cta: "View Splints & Guards", ctaLink: "/services/splints-guards", backgroundColor: "#ffffff", padding: "large" } },
    { id: "t3dp-cta", type: "cta", order: 2, props: { heading: "Need a printed appliance?", text: "Upload your scan and we will confirm material options and turnaround.", buttonText: "Submit Case", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
    FOOTER_BLOCK,
  ],
  "technology-scanning-design": [
    { id: "tsd-hero", type: "hero", order: 0, props: { eyebrow: "Technology", heading: "Scanning & Design", highlight: "", subheading: "Lab-grade scanning and CAD design workflow for model digitization and complex implant bridge cases.", image: "https://images.pexels.com/photos/6812500/pexels-photo-6812500.jpeg?w=1600&q=80&auto=format&fit=crop", bgColor: "#0d1e2c", cta1: "Submit a Case", cta1Link: "/submit", cta2: "", cta2Link: "" } },
    { id: "tsd-text", type: "image-text", order: 1, props: { heading: "Dental Wings 7 Series Scanner", text: "Lab-grade blue-light structured-light scanner with 7-micron accuracy for models, impressions, wax-ups and articulator setups. We accept STL, PLY and OBJ files from intraoral scanners and process them directly into our CAD workflow.", image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80&auto=format&fit=crop", imageLeft: true, cta: "View Digital Design Support", ctaLink: "/services/digital-design", backgroundColor: "#ffffff", padding: "large" } },
    { id: "tsd-cta", type: "cta", order: 2, props: { heading: "Need scanning or design support?", text: "Upload your case and our team will review and advise on the best approach.", buttonText: "Get Started", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
    FOOTER_BLOCK,
  ],
  "technology-sintering-ceramic-firing": [
    { id: "tscf-hero", type: "hero", order: 0, props: { eyebrow: "Technology", heading: "Sintering & Ceramic Firing", highlight: "", subheading: "Validated high-temperature protocols for zirconia crystallization, e.max pressing and porcelain glazing.", image: "https://images.pexels.com/photos/6529103/pexels-photo-6529103.jpeg?w=1600&q=80&auto=format&fit=crop", bgColor: "#0d1e2c", cta1: "Submit a Case", cta1Link: "/submit", cta2: "", cta2Link: "" } },
    { id: "tscf-text", type: "image-text", order: 1, props: { heading: "Ivoclar Programat / SpeedFire", text: "Precision ceramic furnace for lithium disilicate pressing and porcelain layering with vacuum-assisted firing cycles. Fast-sintering option available for urgent cases requiring same-day or next-day dispatch.", image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80&auto=format&fit=crop", imageLeft: true, cta: "View Fixed Restorations", ctaLink: "/services/fixed-restorations", backgroundColor: "#ffffff", padding: "large" } },
    { id: "tscf-cta", type: "cta", order: 2, props: { heading: "Need ceramic restorations?", text: "Upload your scan and prescription for a free assessment and shade matching consultation.", buttonText: "Submit Case", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
    FOOTER_BLOCK,
  ],
  "technology-finishing-equipment": [
    { id: "tfe-hero", type: "hero", order: 0, props: { eyebrow: "Technology", heading: "Finishing Equipment", highlight: "", subheading: "Surface finishing, polishing, sandblasting, cleaning and laser welding for every restoration type.", image: "https://images.unsplash.com/photo-1776406987595-ba14f3510c07?w=1600&q=80&auto=format&fit=crop", bgColor: "#0d1e2c", cta1: "Submit a Case", cta1Link: "/submit", cta2: "", cta2Link: "" } },
    { id: "tfe-text", type: "image-text", order: 1, props: { heading: "Renfert / KaVo / Zhermack", text: "Precision sandblasting, steam and ultrasonic cleaning, composite curing, high-speed micro-motors, turbines and laser welding. Every restoration passes through dedicated finishing stations before final QC and dispatch.", image: "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=800&q=80&auto=format&fit=crop", imageLeft: true, cta: "View All Services", ctaLink: "/services", backgroundColor: "#ffffff", padding: "large" } },
    { id: "tfe-cta", type: "cta", order: 2, props: { heading: "Ready to submit a case?", text: "Create your dentist account and start submitting cases through our digital workflow.", buttonText: "Get Started", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
    FOOTER_BLOCK,
  ],
  workflow: [
    { id: "wf-hero", type: "hero", order: 0, props: { eyebrow: "Modern Approach", heading: "Our Digital Workflow", highlight: "", subheading: "From the moment you log in to the moment your case is delivered, every step is digital, traceable and tracked in real time.", image: "", bgColor: "#ffffff", cta1: "", cta1Link: "", cta2: "", cta2Link: "" } },
    { id: "wf-steps", type: "home-workflow", order: 1, props: { eyebrow: "Modern Approach", heading: "Our Digital Workflow", subheading: "We use advanced digital instruments and workflow to ensure the highest standard of every restoration.", steps: ["Register / Login","Fill Digital Prescription","Upload Scans & Files","Track Your Case Live","Receive Finished Work"], linkText: "", linkHref: "" } },
    { id: "wf-presc", type: "image-text", order: 2, props: { heading: "A complete prescription, every time.", text: "Our 10-step digital prescription captures everything we need: clinic info, patient ref, service, tooth chart, materials, shade, implant details, scan files and shipping. No more paper, no more missing info.", image: "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&q=80&auto=format&fit=crop", imageLeft: false, cta: "Login to Portal", ctaLink: "/portal", backgroundColor: "#f8fafc" } },
    { id: "wf-timeline", type: "text", order: 3, props: { content: "Live status, every step of the way. Our 11-step case status timeline keeps you informed: Submitted → File Review → Awaiting Information → Design Stage → Dentist Approval → In Production → Finishing → Quality Control → Ready for Dispatch → Dispatched → Completed.", align: "left", size: "base", fontWeight: "normal", textColor: "#374151", backgroundColor: "#ffffff", padding: "large" } },
    { id: "wf-logistics", type: "text", order: 4, props: { content: "Logistics & Tracking. Cases are dispatched via DHL or UPS with full digital tracking. You will receive notifications at dispatch and delivery, with tracking numbers visible directly in your dentist portal.", align: "left", size: "base", fontWeight: "normal", textColor: "#374151", backgroundColor: "#f8fafc", padding: "large" } },
    FOOTER_BLOCK,
  ],
  contact: [
    { id: "c-hero", type: "hero", order: 0, props: { eyebrow: "Get in Touch", heading: "Contact Prime Smile Dental Lab", highlight: "", subheading: "Reach out for case submissions, partnerships or general enquiries. We respond within one business day.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", image: "", align: "center" } },
    { id: "c-info", type: "text", order: 1, props: { content: "Email: info@primesmile.co.uk\nPhone: +44 20 0000 0000\nAddress: London, UK", align: "left", size: "base", textColor: "#374151", backgroundColor: "#ffffff", padding: "medium" } },
    { id: "c-cta", type: "cta", order: 2, props: { heading: "Ready to partner with us?", text: "Create a dentist account and start submitting cases through our digital workflow.", buttonText: "Create Account", buttonLink: "/portal", bgColor: "#0aabbd", textAlign: "center" } },
    FOOTER_BLOCK,
  ],
  "fixed-restorations": [
    { id: "fr-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Fixed Restorations", highlight: "", subheading: "Crowns, bridges, veneers, inlays and onlays in zirconia and lithium disilicate — crafted with digital precision.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
    { id: "fr-text", type: "image-text", order: 1, props: { heading: "Precision Fit & Aesthetics", text: "Every fixed restoration is designed in CAD software, milled on 5-axis equipment and finished under magnification. We validate marginal fit before dispatch.", image: "", imageLeft: true, cta: "Learn More", ctaLink: "/workflow", backgroundColor: "#ffffff", padding: "large" } },
    { id: "fr-cta", type: "cta", order: 2, props: { heading: "Request a consultation", text: "Not sure which material suits your case? Our technicians can advise.", buttonText: "Contact Us", buttonLink: "/contact", bgColor: "#0aabbd", textAlign: "center" } },
    FOOTER_BLOCK,
  ],
  "implant-prosthetics": [
    { id: "ip-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Implant Prosthetics", highlight: "", subheading: "Custom abutments, screw-retained crowns, bars and full-arch restorations with validated implant workflows.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
    { id: "ip-text", type: "image-text", order: 1, props: { heading: "Integrated Digital Workflow", text: "We accept implant scans, design abutments in CAD and validate connections on model before production. Every case is tracked from scan to dispatch.", image: "", imageLeft: true, cta: "Our Workflow", ctaLink: "/workflow", backgroundColor: "#ffffff", padding: "large" } },
    { id: "ip-cta", type: "cta", order: 2, props: { heading: "Have an implant case?", text: "Send us your scan and prescription for a free feasibility review.", buttonText: "Get Started", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
    FOOTER_BLOCK,
  ],
  "removable-prosthetics": [
    { id: "rp-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Removable Prosthetics", highlight: "", subheading: "Full and partial dentures with digital design and high-precision fit for optimal comfort and function.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
    { id: "rp-text", type: "image-text", order: 1, props: { heading: "Digital Denture Design", text: "Our removable prosthetics are designed digitally from validated scans, ensuring consistent base fit and tooth arrangement. Every denture goes through a trial stage when required.", image: "", imageLeft: true, cta: "Learn More", ctaLink: "/workflow", backgroundColor: "#ffffff", padding: "large" } },
    { id: "rp-cta", type: "cta", order: 2, props: { heading: "Need a denture quote?", text: "Upload your scan and we will assess the case at no charge.", buttonText: "Submit Case", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
    FOOTER_BLOCK,
  ],
  "metal-frameworks": [
    { id: "mf-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Metal Frameworks", highlight: "", subheading: "Cobalt-chrome frameworks via SLM metal printing for unmatched accuracy, strength and passive fit.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
    { id: "mf-text", type: "image-text", order: 1, props: { heading: "SLM Metal Printing", text: "Our VENEA SLM printer produces cobalt-chrome frameworks with layer accuracy down to 30 microns. Every framework is inspected for distortion and fit before ceramic application.", image: "", imageLeft: true, cta: "Learn More", ctaLink: "/technology", backgroundColor: "#ffffff", padding: "large" } },
    { id: "mf-cta", type: "cta", order: 2, props: { heading: "Need a metal framework?", text: "Upload your scan and prescription for a free assessment.", buttonText: "Submit Case", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
    FOOTER_BLOCK,
  ],
  "splints-guards": [
    { id: "sg-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Splints & Guards", highlight: "", subheading: "Night guards, bruxism splints and surgical guides from validated digital workflows.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
    { id: "sg-text", type: "image-text", order: 1, props: { heading: "Validated Guard Production", text: "Splints are designed from intraoral scans with calibrated bite data, then 3D printed or milled depending on material selection. Thickness and occlusion are checked on articulator.", image: "", imageLeft: true, cta: "Learn More", ctaLink: "/workflow", backgroundColor: "#ffffff", padding: "large" } },
    { id: "sg-cta", type: "cta", order: 2, props: { heading: "Order a splint or guard?", text: "Send us your scan and we will confirm material options and turnaround.", buttonText: "Submit Case", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
    FOOTER_BLOCK,
  ],
  "digital-design": [
    { id: "dd-hero", type: "hero", order: 0, props: { eyebrow: "Service", heading: "Digital Design Support", highlight: "", subheading: "STL design, smile design and treatment planning collaboration for complex cases.", cta: "Submit a Case", ctaLink: "/submit", bgColor: "#0d1e2c", align: "center" } },
    { id: "dd-text", type: "image-text", order: 1, props: { heading: "Collaborative Design", text: "Our technicians work directly with your scan data to produce validated designs before production. We support smile design, full-arch planning and implant restorative design.", image: "", imageLeft: true, cta: "Learn More", ctaLink: "/workflow", backgroundColor: "#ffffff", padding: "large" } },
    { id: "dd-cta", type: "cta", order: 2, props: { heading: "Need design support?", text: "Upload your case and our team will review and advise on the best approach.", buttonText: "Get Started", buttonLink: "/submit", bgColor: "#0aabbd", textAlign: "center" } },
    FOOTER_BLOCK,
  ],
  footer: [
    { id: "footer-main", type: "site-footer", order: 0, props: {
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
          { label: "Shade Taking", href: "/resources" },
          { label: "Implant Requirements", href: "/resources" },
          { label: "File Upload Help", href: "/resources" },
          { label: "FAQs", href: "/resources" },
        ] },
        { title: "Support", links: [
          { label: "Quality & Compliance", href: "/quality" },
          { label: "Technology", href: "/technology" },
          { label: "Contact", href: "/contact" },
          { label: "Dentist Portal", href: "/portal" },
        ] },
      ],
      copyright: "© {year} Prime Smile Dental Laboratory. All rights reserved.",
      legal: [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms of Service", href: "/terms-of-service" },
        { label: "Data Notice", href: "/data-notice" },
      ],
    } },
  ],
};

// Public read routes
pagesRouter.get("/", async (req, res) => {
  const saved = await Page.find().select("slug title published updatedAt blocks").sort({ slug: 1 });
  const savedMap = Object.fromEntries(saved.map(p => [p.slug, p]));
  const pages = EDITABLE_PAGES.map(p => {
    if (savedMap[p.slug]) return savedMap[p.slug].toObject();
    return { ...p, blocks: DEFAULT_PAGE_BLOCKS[p.slug] || [], published: true };
  });
  res.json({ pages });
});

pagesRouter.get("/:slug", async (req, res) => {
  let page = await Page.findOne({ slug: req.params.slug });
  if (!page) {
    const meta = EDITABLE_PAGES.find(p => p.slug === req.params.slug);
    if (!meta) return res.status(404).json({ error: "Page not found" });
    page = { slug: meta.slug, title: meta.title, blocks: DEFAULT_PAGE_BLOCKS[req.params.slug] || [], published: true };
  }
  res.json({ page });
});

pagesRouter.use(requireAuth, requireRole("admin"));

pagesRouter.put("/:slug", requireRole("admin"), async (req, res) => {
  const { blocks, title, published } = req.body;
  const page = await Page.findOneAndUpdate(
    { slug: req.params.slug },
    { blocks, title, published, updatedBy: req.user._id },
    { upsert: true, returnDocument: "after" },
  );
  await logActivity({ actor: req.user._id, action: "page.updated", entityType: "Page", entityId: page._id, metadata: { slug: req.params.slug } });
  res.json({ page });
});

pagesRouter.post("/:slug/blocks", requireRole("admin"), async (req, res) => {
  const { type, props, order } = req.body;
  const newBlock = { id: crypto.randomUUID(), type, props: props || {}, order: order ?? 9999 };
  const page = await Page.findOneAndUpdate(
    { slug: req.params.slug },
    { $push: { blocks: newBlock } },
    { upsert: true, returnDocument: "after" },
  );
  res.json({ block: newBlock, page });
});

pagesRouter.patch("/:slug/blocks/:blockId", requireRole("admin"), async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug });
  if (!page) return res.status(404).json({ error: "Page not found" });
  const block = page.blocks.find(b => b.id === req.params.blockId);
  if (!block) return res.status(404).json({ error: "Block not found" });
  Object.assign(block.props, req.body.props || {});
  if (req.body.order !== undefined) block.order = req.body.order;
  await page.save();
  res.json({ block });
});

pagesRouter.delete("/:slug/blocks/:blockId", requireRole("admin"), async (req, res) => {
  const page = await Page.findOneAndUpdate(
    { slug: req.params.slug },
    { $pull: { blocks: { id: req.params.blockId } } },
    { returnDocument: "after" },
  );
  res.json({ page });
});
