import { useState, useEffect } from "react";
import { SiteFooterView } from "@/components/site/SiteFooter";
import { ServiceHeroView, ServiceDetailHeroView } from "@/components/site/ServiceHero";
import {
  ChevronDown, CheckCircle2, Type, Image, LayoutGrid, MessageSquare,
  Star, Zap, Minus, PlayCircle, Users, Search,
  Layers, ArrowUpRight, ArrowRight,
  Wrench, Cpu, Frame, BookOpen, Smile, FlaskConical, Target,
  Shield, PencilRuler, MessageCircle,
  Mail, Phone, MapPin, Lock, FileText,
  ScanLine, Printer, Box, Flame, Sparkles, CheckCircle, Wind,
  Package, TrendingUp, Eye, Truck, Globe, Upload,
} from "lucide-react";

export type BlockItem = {
  id: string;
  type: string;
  order: number;
  props: Record<string, any>;
};

function HeroSlideshow({ gallery, eyebrow, heading, highlight, subheading, cta1, cta1Link, cta2, cta2Link }: any) {
  const slides = (gallery || []).filter((s: any) => s.src);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);
  return (
    <div className="relative text-white overflow-hidden" style={{ background: "#0d1e2c" }}>
      <div className="absolute inset-0">
        {slides.map((s: any, i: number) => (
          <img
            key={i}
            src={s.src}
            alt={s.alt || ""}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: i === idx ? 0.4 : 0 }}
            loading="lazy"
          />
        ))}
      </div>
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage:"linear-gradient(#0aabbd 1px, transparent 1px), linear-gradient(90deg, #0aabbd 1px, transparent 1px)",
        backgroundSize:"48px 48px",
      }}/>
      <div className="relative px-6 lg:px-8 pt-16 pb-14">
        <span className="text-[10px] uppercase tracking-[0.15em] text-teal-400 font-semibold">{eyebrow}</span>
        <h1 className="mt-3 font-bold text-2xl md:text-3xl lg:text-4xl leading-[1.1] max-w-3xl">
          {heading?.replace(highlight || "", "")}
          {highlight && <span className="text-teal-400">{highlight}</span>}
        </h1>
        <p className="mt-4 text-sm md:text-base text-white/80 max-w-2xl leading-relaxed">{subheading}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {cta1 && <span className="inline-flex items-center gap-2 bg-white text-slate-800 font-semibold px-5 py-2.5 rounded-lg text-sm">{cta1} <ArrowRight size={14}/></span>}
          {cta2 && <span className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-5 py-2.5 rounded-lg text-sm">{cta2}</span>}
        </div>
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_: any, i: number) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`w-2 h-2 rounded-full transition-colors ${i === idx ? "bg-white" : "bg-white/40"}`}/>
          ))}
        </div>
      )}
    </div>
  );
}

function getPaddingClass(padding: string) {
  switch (padding) {
    case "small": return "p-3";
    case "medium": return "p-4";
    case "large": return "p-6";
    default: return "p-4";
  }
}

function getFontSizeClass(size: string) {
  switch (size) {
    case "sm": return "text-sm";
    case "base": return "text-base";
    case "lg": return "text-lg";
    case "xl": return "text-xl";
    default: return "text-base";
  }
}

export function PageBlockRenderer({ type, props }: { type: string; props: any }) {
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

    case "page-header": {
      const align = props.align || "left";
      const textAlign = align === "center" ? "text-center" : "text-left";
      const mx = align === "center" ? "mx-auto" : "";
      const py = props.padding === "large" ? "py-20" : props.padding === "medium" ? "py-14" : "py-10";
      return (
        <div className={`${py} px-8`} style={{ backgroundColor: props.backgroundColor || "#ffffff" }}>
          <div className={`max-w-5xl ${mx} ${textAlign}`}>
            {props.showAccent && <div className={`h-1 w-16 bg-teal-500 rounded-full mb-6 ${align === "center" ? "mx-auto" : ""}`} />}
            {props.eyebrow && (
              <span className="inline-block text-[11px] uppercase tracking-[0.2em] text-teal-600 font-bold mb-3">
                {props.eyebrow}
              </span>
            )}
            <h1 className={`text-3xl md:text-4xl font-bold text-slate-800 leading-tight ${mx} max-w-3xl`}>
              {props.highlight ? (
                <>
                  {props.heading?.replace(props.highlight, "")}
                  <span className="text-teal-500">{props.highlight}</span>
                </>
              ) : props.heading}
            </h1>
            <p className={`mt-5 text-slate-500 leading-relaxed text-lg max-w-2xl ${mx}`}>{props.subheading}</p>
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
        <div className={`${getFontSizeClass(props.size)} text-${props.align || "left"} ${props.fontWeight === "bold" ? "font-bold" : ""} leading-relaxed max-w-none whitespace-pre-line`}>
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
      const iconMap: Record<string, any> = { BookOpen, Target, CheckCircle2, Cpu, Lock, FlaskConical, Smile, Wrench, Layers, Frame, Shield, PencilRuler, ScanLine, Printer, Box, Flame, Sparkles, CheckCircle, Wind, Zap, Package, TrendingUp, Eye, Truck, Globe, Upload, FileText };
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

    case "contact-info": {
      const iconMap: Record<string, any> = { Mail, Phone, MapPin };
      const layout = props.layout || "cards";
      return (
        <div className="py-16 px-5 lg:px-8" style={{ backgroundColor: props.backgroundColor || "#f8fafc" }}>
          <div className="max-w-5xl mx-auto">
            {props.heading && (
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800">{props.heading}</h2>
                {props.subheading && <p className="mt-3 text-slate-500 max-w-xl mx-auto">{props.subheading}</p>}
              </div>
            )}
            <div className={`grid gap-5 ${layout === "cards" ? "md:grid-cols-3" : "max-w-xl mx-auto"}`}>
              {(props.items || []).map((item: any, i: number) => {
                const I = iconMap[item.icon] || Mail;
                const inner = (
                  <div className={`bg-white rounded-2xl border border-slate-100 shadow-[0_2px_16px_rgba(0,0,0,0.04)] p-6 flex items-center gap-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-shadow ${layout === "list" ? "" : ""}`}>
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <I size={22} />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{item.label}</div>
                      {item.href ? (
                        <a href={item.href} className="text-slate-800 font-semibold mt-0.5 block hover:text-teal-600 transition-colors">{item.value}</a>
                      ) : (
                        <div className="text-slate-800 font-semibold mt-0.5">{item.value}</div>
                      )}
                    </div>
                  </div>
                );
                return inner;
              })}
            </div>
          </div>
        </div>
      );
    }

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
        <hr className={`border-gray-200 my-${props.margin || "md"}`}
            style={{ borderColor: props.color || "#e5e7eb", borderWidth: props.thickness || "1px" }}/>
      </div>
    );

    case "home-hero":
      return <HeroSlideshow {...props} />;

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

    case "site-footer": return (
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <SiteFooterView {...props}/>
      </div>
    );

    case "service-details": return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-2 gap-3 p-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-[10px] font-semibold text-teal-600 uppercase mb-2">{props.makesHeading || "What We Make"}</div>
            <div className="space-y-1.5">
              {(props.makes || []).slice(0, 3).map((m: string, i: number) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-white rounded px-2 py-1 border border-slate-100"><CheckCircle2 size={10} className="text-teal-500 shrink-0"/> {m}</div>
              ))}
              {(props.makes || []).length > 3 && <div className="text-[10px] text-slate-400 pl-1">+{(props.makes || []).length - 3} more</div>}
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-[10px] font-semibold text-amber-600 uppercase mb-2">{props.submitHeading || "Submit"}</div>
            <div className="space-y-1.5">
              {(props.submit || []).slice(0, 3).map((s: string, i: number) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-white rounded px-2 py-1 border border-slate-100"><FileText size={10} className="text-amber-500 shrink-0"/> {s}</div>
              ))}
              {(props.submit || []).length > 3 && <div className="text-[10px] text-slate-400 pl-1">+{(props.submit || []).length - 3} more</div>}
            </div>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">{props.materialsHeading || "Materials"}</div>
          <div className="flex flex-wrap gap-1">
            {(props.materials || []).slice(0, 5).map((m: string, i: number) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 text-[10px] font-medium border border-teal-100">{m}</span>
            ))}
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">{props.workflowHeading || "Workflow"}</div>
          <div className="space-y-1">
            {(props.workflow || []).slice(0, 4).map((w: string, i: number) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 rounded px-2 py-1">
                <span className="w-4 h-4 rounded-full bg-teal text-white text-[8px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                {w}
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    case "services-hero": return <ServiceHeroView {...(props || {})} />;

    case "service-page-hero": return <ServiceDetailHeroView {...(props || {})} />;

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

export default PageBlockRenderer;
