import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  ChevronLeft, Plus, Trash2, GripVertical, Settings2, Eye,
  Save, CheckCircle2, Type, Image, LayoutGrid, MessageSquare,
  Star, Zap, Minus, PlayCircle, ChevronDown, Users, Search,
  Monitor, Tablet, Smartphone, Palette, Layers, Copy, RefreshCw,
  Info, Lock, Unlock, Globe, Code, Sparkles, ArrowUpRight
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
      heading: "Your Heading", 
      subheading: "Subheading text here", 
      cta: "Get Started", 
      ctaLink: "#", 
      bgColor: "#0d1e2c", 
      image: "",
      height: "large",
      overlayOpacity: 0.3
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
];

const BLOCK_CATEGORIES = [
  { id: "header", label: "Header & Hero", icon: Zap },
  { id: "content", label: "Content", icon: Type },
  { id: "media", label: "Media", icon: Image },
  { id: "layout", label: "Layout", icon: LayoutGrid },
  { id: "interactive", label: "Interactive", icon: MessageSquare },
  { id: "actions", label: "Actions", icon: ArrowUpRight },
  { id: "utility", label: "Utility", icon: Minus },
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
    case "hero": return (
      <div className="min-h-[400px] text-white overflow-hidden relative" style={{ background: props.bgColor || "#0d1e2c" }}>
        {props.image && (
          <div className="absolute inset-0">
            <img src={props.image} alt="" className="w-full h-full object-cover opacity-40"/>
            <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/20 to-black/40" style={{ opacity: props.overlayOpacity || 0.4 }}/>
          </div>
        )}
        <div className={`relative ${props.height === "large" ? "py-20" : "py-16"} px-8 md:px-12 text-center max-w-6xl mx-auto`}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight drop-shadow-lg">{props.heading}</h1>
          <p className="text-white/90 mb-8 md:mb-10 text-lg md:text-xl lg:text-2xl leading-relaxed drop-shadow max-w-3xl mx-auto">{props.subheading}</p>
          {props.cta && (
            <span className="inline-block px-8 py-4 bg-white text-slate-800 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 cursor-pointer text-lg shadow-lg hover:shadow-xl">
              {props.cta} <ArrowUpRight size={18} className="inline ml-2"/>
            </span>
          )}
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
    
    case "cards": return (
      <div className={`${getPaddingClass(props.padding)} rounded-2xl`} 
           style={{ backgroundColor: props.backgroundColor || "#f9fafb" }}>
        {props.heading && <h3 className="text-xl font-bold text-slate-800 text-center mb-6">{props.heading}</h3>}
        <div className={`grid gap-4 ${props.columns === 2 ? "grid-cols-2" : props.columns === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
          {(props.cards || []).map((c: any, i: number) => (
            <div key={i} className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl mb-2">{c.icon || "✦"}</div>
              <div className="font-semibold text-slate-800 mb-1">{c.title}</div>
              <div className="text-sm text-slate-600">{c.text}</div>
            </div>
          ))}
        </div>
      </div>
    );
    
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
        <TextField label="Heading"    value={props.heading}    onChange={v => set("heading", v)}/>
        <TextField label="Subheading" value={props.subheading} onChange={v => set("subheading", v)}/>
        <TextField label="CTA Text"   value={props.cta}        onChange={v => set("cta", v)}/>
        <TextField label="CTA Link"   value={props.ctaLink}    onChange={v => set("ctaLink", v)}/>
        <TextField label="Image URL"  value={props.image}      onChange={v => set("image", v)}/>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">Background Color</label>
          <div className="flex gap-2">
            <input type="color" value={props.bgColor || "#0d1e2c"} onChange={e => set("bgColor", e.target.value)} className="w-10 h-10 rounded-lg border border-slate-200 p-0.5"/>
            <input type="text" value={props.bgColor || ""} onChange={e => set("bgColor", e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-indigo-400"/>
          </div>
        </div>
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
        <div className="text-xs font-medium text-slate-600">Cards</div>
        {(props.cards || []).map((card: any, i: number) => (
          <div key={i} className="border border-slate-100 rounded-xl p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Card {i + 1}</span>
              <button onClick={() => set("cards", props.cards.filter((_: any, j: number) => j !== i))} className="text-red-400"><Trash2 size={12}/></button>
            </div>
            <input value={card.icon} onChange={e => { const c = [...props.cards]; c[i] = { ...c[i], icon: e.target.value }; set("cards", c); }} placeholder="Icon (emoji)" className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"/>
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
    default: return <div className="text-xs text-slate-400 text-center py-4">No props for this block type</div>;
  }
}

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

  useEffect(() => {
    apiFetch<{ page: any }>(`/api/admin/pages/${slug}`).then(r => {
      setTitle(r.page.title);
      setBlocks([...(r.page.blocks || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setPageData({
        seo: r.page.seo || { title: "", description: "" },
        published: r.page.published !== false
      });
    }).catch(() => {});
  }, [slug]);

  function addBlock(type: string) {
    const bt = BLOCK_TYPES.find(b => b.id === type)!;
    const newBlock: Block = {
      id: `blk-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      order: blocks.length,
      props: { ...bt.defaultProps },
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelected(newBlock.id);
    setShowLib(false);
  }

  function updateProps(id: string, props: any) {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, props } : b));
  }

  function deleteBlock(id: string) {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selected === id) setSelected(null);
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setBlocks(prev => {
      const arr = [...prev];
      const idx = arr.findIndex(b => b.id === id);
      if (idx + dir < 0 || idx + dir >= arr.length) return arr;
      [arr[idx], arr[idx + dir]] = [arr[idx + dir], arr[idx]];
      return arr.map((b, i) => ({ ...b, order: i }));
    });
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
