import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight, Users, PlayCircle, Image,
  ArrowRight, CheckCircle2, Star,
  Cpu, Lock, FlaskConical, Target,
  Smile, Wrench, Layers, Frame, Shield, PencilRuler,
  MessageCircle, BookOpen
} from "lucide-react";
import { Placeholder } from "./Placeholder";
import { SiteFooterView } from "./SiteFooter";

type Block = { id: string; type: string; order: number; props: Record<string, any> };

export function PageBlocks({ blocks }: { blocks: Block[] }) {
  if (!blocks?.length) return null;

  const sorted = [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6">
      {sorted.map((block) => (
        <BlockRenderer key={block.id} type={block.type} props={block.props} />
      ))}
    </div>
  );
}

function resolveIcon(name: string) {
  const map: Record<string, any> = {
    ArrowUpRight, Users, PlayCircle, Image, ArrowRight, CheckCircle2, Star,
    Cpu, Lock, FlaskConical, Target, Smile, Wrench, Layers, Frame, Shield,
    PencilRuler, MessageCircle, BookOpen,
  };
  return map[name] || null;
}

function BlockRenderer({ type, props }: { type: string; props: any }) {
  switch (type) {
    case "hero": {
      const align = props.align || "center";
      const textAlign = align === "left" ? "text-left" : "text-center";
      const mx = align === "left" ? "" : "mx-auto";
      return (
        <section className="relative min-h-[520px] text-white overflow-hidden flex items-center" style={{ background: props.bgColor || "#0d1e2c" }}>
          {props.image && (
            <div className="absolute inset-0">
              <img src={props.image} alt="" className="w-full h-full object-cover" style={{ opacity: 0.45 }} loading="lazy" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, rgba(13,30,44,${props.overlayOpacity || 0.75}) 0%, rgba(10,171,189,${(props.overlayOpacity || 0.75) * 0.35}) 100%)` }} />
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
                <Link to={props.cta1Link || "#"} className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white text-teal-700 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                  {props.cta1} <ArrowRight size={16} className="text-teal-500" />
                </Link>
              )}
              {props.cta2 && (
                <Link to={props.cta2Link || "#"} className="inline-flex items-center gap-2.5 px-7 py-3.5 border border-white/40 text-white rounded-full font-bold text-sm backdrop-blur-sm bg-white/5 hover:bg-white/10 hover:scale-[1.02] transition-all">
                  {props.cta2}
                </Link>
              )}
              {!props.cta1 && !props.cta2 && props.cta && (
                <Link to={props.ctaLink || "#"} className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white text-teal-700 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                  {props.cta} <ArrowUpRight size={16} className="text-teal-500" />
                </Link>
              )}
            </div>
          </div>
        </section>
      );
    }

    case "page-header": {
      const align = props.align || "left";
      const textAlign = align === "center" ? "text-center" : "text-left";
      const mx = align === "center" ? "mx-auto" : "";
      const py = props.padding === "large" ? "py-20" : props.padding === "medium" ? "py-14" : "py-10";
      return (
        <section className={`${py}`} style={{ backgroundColor: props.backgroundColor || "#ffffff" }}>
          <div className={`max-w-7xl mx-auto px-5 lg:px-8 ${textAlign}`}>
            {props.showAccent && <div className={`h-1 w-16 bg-teal rounded-full mb-6 ${align === "center" ? "mx-auto" : ""}`} />}
            {props.eyebrow && <span className="eyebrow">{props.eyebrow}</span>}
            <h1 className={`mt-3 text-4xl md:text-5xl font-bold leading-tight ${mx} max-w-4xl`}>
              {props.highlight ? (
                <>
                  {props.heading?.replace(props.highlight, "")}
                  <span className="text-teal">{props.highlight}</span>
                </>
              ) : props.heading}
            </h1>
            <p className={`mt-6 text-muted-grey text-lg max-w-3xl leading-relaxed ${mx}`}>{props.subheading}</p>
          </div>
        </section>
      );
    }

    case "about-hero":
      return (
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 grid md:grid-cols-2 gap-14 items-center">
            <div>
              {props.eyebrow && <span className="eyebrow">{props.eyebrow}</span>}
              <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">
                {props.highlight ? (
                  <>
                    {props.heading?.replace(props.highlight, "")}
                    <span className="text-teal">{props.highlight}</span>
                    {props.heading?.split(props.highlight).slice(1).join(props.highlight)}
                  </>
                ) : props.heading}
              </h1>
              <p className="mt-6 text-lg text-muted-grey leading-relaxed">{props.subheading}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {props.cta1 && <Link to={props.cta1Link || "#"} className="btn-teal">{props.cta1} <ArrowRight size={16}/></Link>}
                {props.cta2 && <Link to={props.cta2Link || "#"} className="btn-outline-teal">{props.cta2} <ArrowRight size={16}/></Link>}
              </div>
            </div>
            <div className="grid grid-cols-3 grid-rows-2 gap-3 h-80">
              {(props.gallery || []).slice(0, 5).map((img: any, i: number) => (
                <div key={i} className={`rounded-2xl overflow-hidden ${img.span ?? ""}`}>
                  {img.src && <img src={img.src} alt={img.alt || ""} className="w-full h-full object-cover" loading="lazy" />}
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "text":
      return (
        <div className="py-6 px-6 rounded-2xl border" style={{ backgroundColor: props.backgroundColor || "#ffffff", borderColor: props.backgroundColor === "transparent" ? "#e5e7eb" : "transparent", color: props.textColor || "#374151" }}>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: props.content?.replace(/\n/g, "<br/>") || "" }} />
        </div>
      );

    case "image":
      return (
        <div className="rounded-2xl overflow-hidden border shadow-sm" style={{ borderColor: "#e5e7eb" }}>
          {props.src ? (
            <img src={props.src} alt={props.alt || ""} className="w-full object-cover" style={{ maxHeight: "500px", aspectRatio: props.aspectRatio === "16:9" ? "16/9" : props.aspectRatio === "4:3" ? "4/3" : "auto" }} />
          ) : (
            <div className="h-48 bg-linear-to-br from-gray-100 to-gray-50 flex items-center justify-center">
              <Image size={40} className="text-gray-400" />
            </div>
          )}
          {props.caption && <div className="px-4 py-3 bg-gray-50 border-t border-gray-200"><p className="text-sm text-gray-600 text-center italic">{props.caption}</p></div>}
        </div>
      );

    case "image-text":
      return (
        <div className="py-6 px-6 rounded-2xl border shadow-sm" style={{ backgroundColor: props.backgroundColor || "#ffffff", borderColor: "#e5e7eb" }}>
          <div className={`flex flex-col md:flex-row gap-8 items-center ${!props.imageLeft ? "md:flex-row-reverse" : ""}`}>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{props.heading}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed text-lg">{props.text}</p>
              {props.cta && (
                <Link to={props.ctaLink || "#"} className="inline-flex items-center text-teal font-semibold hover:text-teal-dark transition-colors text-lg">
                  {props.cta} <ArrowUpRight size={18} className="ml-2" />
                </Link>
              )}
            </div>
            <div className="w-full md:w-2/5">
              {props.image ? (
                <img src={props.image} alt="" className="w-full h-64 object-cover rounded-xl shadow-md" />
              ) : (
                <div className="aspect-square bg-linear-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center shadow-md">
                  <Image size={40} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case "video":
      return (
        <div className="rounded-2xl overflow-hidden bg-gray-900 relative" style={{ aspectRatio: props.aspectRatio === "4:3" ? "4/3" : "16/9" }}>
          {props.url ? (
            <iframe src={props.url} title={props.caption || "Video"} className="absolute inset-0 w-full h-full" allowFullScreen />
          ) : (
            <div className="h-full flex items-center justify-center">
              <PlayCircle size={48} className="text-gray-600" />
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
      const iconSize = props.iconSize || "md";
      const iconClass = iconSize === "lg" ? "w-14 h-14" : iconSize === "sm" ? "w-8 h-8" : "w-12 h-12";
      const accentMap: Record<string, string> = { teal: "border-l-teal-400", gold: "border-l-amber-400", indigo: "border-l-indigo-400", slate: "border-l-slate-400" };
      return (
        <div className="py-6 px-6 rounded-2xl" style={{ backgroundColor: props.backgroundColor || "#f9fafb" }}>
          {props.heading && <h3 className="text-xl font-bold text-slate-800 text-center mb-6">{props.heading}</h3>}
          <div className={`grid gap-4 ${props.columns === 2 ? "grid-cols-1 md:grid-cols-2" : props.columns === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3"}`}>
            {(props.cards || []).map((c: any, i: number) => {
              const IconComp = resolveIcon(c.icon);
              const borderAccent = accentMap[c.accent || props.accent || "teal"] || accentMap.teal;
              return (
                <div key={i} className={`bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col ${props.cardStyle === "borderLeft" ? `border-l-4 ${borderAccent}` : ""}`}>
                  {IconComp && (
                    <div className={`${iconClass} rounded-lg bg-teal/10 text-teal flex items-center justify-center mb-4`}>
                      <IconComp size={iconSize === "lg" ? 26 : iconSize === "sm" ? 18 : 22} />
                    </div>
                  )}
                  {!IconComp && c.icon && <div className="text-2xl mb-2">{c.icon}</div>}
                  <h4 className="font-bold text-slate-800 mb-1">{c.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">{c.text}</p>
                  {c.link && <span className="text-teal text-sm font-semibold mt-3 inline-flex items-center gap-1">View <ArrowRight size={12}/></span>}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case "testimonials":
      return (
        <div className="py-6 px-6 rounded-2xl" style={{ backgroundColor: props.backgroundColor || "#f9fafb" }}>
          {props.heading && <h3 className="text-xl font-bold text-slate-800 text-center mb-6">{props.heading}</h3>}
          <div className={`grid gap-4 ${props.layout === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
            {(props.items || []).map((t: any, i: number) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="text-yellow-400 mb-3">{"★".repeat(t.rating || 5)}</div>
                <p className="text-slate-700 italic mb-3">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  {props.showPhotos && (t.photo ? <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><Users size={16} className="text-gray-400" /></div>)}
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

    case "cta":
      return (
        <div className="rounded-2xl p-8 text-center relative overflow-hidden" style={{ background: props.bgColor || "#0aabbd" }}>
          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent" />
          <div className="relative">
            <h3 className="text-2xl font-bold text-white mb-3">{props.heading}</h3>
            <p className="text-white/90 mb-6 text-lg">{props.text}</p>
            {props.buttonText && (
              <Link to={props.buttonLink || "#"} className="inline-block px-6 py-3 bg-white text-slate-800 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                {props.buttonText} <ArrowUpRight size={16} className="inline ml-1" />
              </Link>
            )}
          </div>
        </div>
      );

    case "stats":
      return (
        <div className="py-6 px-6 rounded-2xl border" style={{ backgroundColor: props.backgroundColor || "#ffffff", borderColor: "#e5e7eb" }}>
          <div className={`flex ${props.layout === "vertical" ? "flex-col space-y-4" : "flex-wrap justify-around gap-4"}`}>
            {(props.items || []).map((s: any, i: number) => (
              <div key={i} className="text-center min-w-[120px]">
                {props.showIcons && s.icon && <div className="text-2xl mb-2">{s.icon}</div>}
                <div className="text-2xl font-bold text-teal-600">{s.value}</div>
                <div className="text-sm text-slate-600">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case "team":
      return (
        <div className="py-6 px-6 rounded-2xl border" style={{ backgroundColor: props.backgroundColor || "#ffffff", borderColor: "#e5e7eb" }}>
          {props.heading && <h3 className="text-xl font-bold text-slate-800 text-center mb-6">{props.heading}</h3>}
          <div className={`grid gap-6 ${props.columns === 2 ? "grid-cols-2" : props.columns === 3 ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
            {(props.members || []).map((m: any, i: number) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm bg-gray-100">
                  {m.photo ? <img src={m.photo} className="w-full h-full object-cover" alt={m.name} /> : <Users size={28} className="text-gray-400" />}
                </div>
                <p className="font-semibold text-slate-800">{m.name}</p>
                <p className="text-sm text-slate-500">{m.title}</p>
                {props.showBio && m.bio && <p className="text-xs text-slate-400 mt-1">{m.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      );

    case "accordion":
      return (
        <div className="py-6 px-6 rounded-2xl border" style={{ backgroundColor: props.backgroundColor || "#ffffff", borderColor: "#e5e7eb" }}>
          {props.heading && <h3 className="text-xl font-bold text-slate-800 mb-4">{props.heading}</h3>}
          <div className="space-y-2">
            {(props.items || []).map((item: any, i: number) => (
              <details key={i} className="group rounded-xl border border-gray-100 bg-white overflow-hidden">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer font-medium text-slate-800 hover:bg-gray-50 transition">
                  <span>{item.q}</span>
                  <span className="text-teal group-open:rotate-180 transition-transform">{props.iconStyle === "plus" ? "+" : "▼"}</span>
                </summary>
                <div className="px-4 pb-3 text-sm text-slate-600 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      );

    /* ── Home Sections ─────────────────────────── */
    case "home-hero": return (
      <section className="relative bg-[#0d1e2c] text-white overflow-hidden">
        {props.image && (
          <div className="absolute inset-0">
            <img src={props.image} alt="" className="w-full h-full object-cover opacity-40" loading="lazy" />
          </div>
        )}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage:"linear-gradient(#0aabbd 1px, transparent 1px), linear-gradient(90deg, #0aabbd 1px, transparent 1px)",
          backgroundSize:"48px 48px",
        }}/>
        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-32 pb-28">
          <span className="eyebrow">{props.eyebrow}</span>
          <h1 className="mt-4 font-bold text-4xl md:text-5xl lg:text-[56px] leading-[1.1] max-w-4xl">
            {props.heading.replace(props.highlight || "", "")}
            {props.highlight && <span className="text-teal">{props.highlight}</span>}
          </h1>
          <p className="mt-6 text-base md:text-lg text-white/80 max-w-3xl leading-relaxed">{props.subheading}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            {props.cta1 && <Link to={props.cta1Link || "#"} className="btn-teal">{props.cta1} <ArrowRight size={16}/></Link>}
            {props.cta2 && <Link to={props.cta2Link || "#"} className="btn-outline-white">{props.cta2}</Link>}
          </div>
        </div>
      </section>
    );

    case "home-trust-strip": return (
      <section className="bg-white border-y border-border-silver">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {(props.items || []).map((item: any, i: number) => {
            const iconMap: Record<string, any> = { Cpu, Lock, FlaskConical, Target };
            const I = iconMap[item.icon] || Cpu;
            return (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center text-teal shrink-0"><I size={22}/></div>
                <div>
                  <div className="font-semibold text-text-slate">{item.title}</div>
                  <div className="text-[11px] tracking-[0.12em] uppercase text-muted-grey font-medium">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );

    case "home-stats": return (
      <section className="bg-bg-soft py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="eyebrow">{props.eyebrow}</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold leading-tight">{props.heading}</h2>
            <p className="mt-5 text-muted-grey leading-relaxed">{props.body}</p>
            {props.linkText && <Link to={props.linkHref || "#"} className="inline-flex items-center gap-2 text-teal font-semibold mt-6 hover:gap-3 transition-all">{props.linkText} <ArrowRight size={16}/></Link>}
          </div>
          <div className="grid grid-cols-2 gap-6">
            {(props.stats || []).map((s: any, i: number) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
                <div className="text-4xl md:text-5xl font-bold text-teal">{s.value}{s.suffix}</div>
                <div className="text-sm text-muted-grey mt-2 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );

    case "home-workflow": return (
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 text-center">
          <span className="eyebrow">{props.eyebrow}</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold">{props.heading}</h2>
          <p className="mt-4 text-muted-grey max-w-2xl mx-auto">{props.subheading}</p>
          <div className="mt-14 relative">
            <div className="hidden md:block absolute top-7 left-[10%] right-[10%] h-[2px] bg-border-silver"/>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 relative">
              {(props.steps || []).map((step: string, i: number) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-teal text-white flex items-center justify-center font-bold text-lg shadow-[0_4px_18px_rgba(10,171,189,.4)] relative z-10">{i + 1}</div>
                  <div className="mt-4 font-semibold text-sm">{step}</div>
                </div>
              ))}
            </div>
          </div>
          {props.linkText && <Link to={props.linkHref || "#"} className="inline-flex items-center gap-2 text-teal font-semibold mt-12 hover:gap-3 transition-all">{props.linkText} <ArrowRight size={16}/></Link>}
        </div>
      </section>
    );

    case "home-services": return (
      <section className="bg-bg-soft py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">{props.eyebrow}</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold">{props.heading}</h2>
            <p className="mt-4 text-muted-grey">{props.subheading}</p>
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(props.services || []).map((s: any, i: number) => {
              const iconMap: Record<string, any> = { Smile, Wrench, Layers, Frame, Shield, PencilRuler };
              const I = iconMap[s.icon] || Smile;
              return (
                <div key={i} className="card-service h-full flex flex-col">
                  <div className="w-12 h-12 rounded-lg bg-teal/10 text-teal flex items-center justify-center mb-4"><I size={22}/></div>
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <p className="text-sm text-muted-grey mt-2 leading-relaxed flex-1">{s.desc}</p>
                </div>
              );
            })}
          </div>
          {props.linkText && (
            <div className="text-center mt-10">
              <Link to={props.linkHref || "#"} className="btn-outline-teal">{props.linkText} <ArrowRight size={16}/></Link>
            </div>
          )}
        </div>
      </section>
    );

    case "home-specialisations": return (
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-12">
            <span className="eyebrow">{props.eyebrow}</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold">{props.heading}</h2>
            <p className="mt-4 text-muted-grey max-w-2xl mx-auto">{props.subheading}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 rounded-2xl overflow-hidden shadow-[0_4px_40px_rgba(0,0,0,0.12)]">
            {(props.tiles || []).map((tile: any, i: number) => (
              <div key={i} className="relative h-52 md:h-64 overflow-hidden group">
                {tile.img && <img src={tile.img} alt={tile.label || "dental"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />}
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
    );

    case "home-technology": return (
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div>
            <div className="eyebrow text-teal!">{props.eyebrow}</div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold max-w-2xl">{props.heading}</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {(props.items || []).map((t: any, i: number) => (
              <div key={i} className="card-tech h-full">
                <div className="text-[11px] uppercase tracking-[0.12em] text-teal font-medium">{t.brand}</div>
                <div className="font-semibold text-gold mt-2">{t.name}</div>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {t.tags.split(",").map((tag: string) => (
                    <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-teal/15 text-teal font-medium">{tag.trim()}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {props.linkText && (
            <div className="mt-10">
              <Link to={props.linkHref || "#"} className="btn-outline-white">{props.linkText} <ArrowRight size={16}/></Link>
            </div>
          )}
        </div>
      </section>
    );

    case "home-production": return (
      <section className="bg-white py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 text-center">
          <span className="eyebrow">{props.eyebrow}</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold">{props.heading}</h2>
        </div>
        <div className="mt-10 relative">
          <div className="flex marquee-track gap-3 w-max">
            {(props.brands || "").split(",").map((b: string, i: number) => (
              <span key={i} className="px-5 py-2.5 rounded-full bg-teal/10 text-teal font-semibold text-sm whitespace-nowrap">{b.trim()}</span>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-5 lg:px-8 mt-14 grid md:grid-cols-3 gap-5">
          {(props.cards || []).map((c: any, i: number) => (
            <div key={i} className="relative h-44 rounded-xl overflow-hidden group cursor-pointer">
              <Placeholder label={c.img} className="absolute inset-0" />
              <div className="absolute inset-0 bg-linear-to-t from-navy/90 via-navy/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <div className="text-white font-semibold text-lg">{c.title}</div>
                <div className="text-teal text-xs mt-1 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">Explore <ArrowRight size={12}/></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );

    case "home-badges": return (
      <section className="bg-white py-16 border-t border-border-silver">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {(props.items || []).map((b: any, i: number) => (
            <div key={i}>
              <div className="w-14 h-14 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto mb-3"><CheckCircle2 size={26}/></div>
              <div className="font-bold">{b.title}</div>
              <div className="text-sm text-muted-grey mt-1">{b.desc}</div>
            </div>
          ))}
        </div>
      </section>
    );

    case "home-cta": return (
      <section className="py-20" style={{background:"linear-gradient(135deg, var(--teal), var(--teal-dark))"}}>
        <div className="max-w-5xl mx-auto px-5 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold">{props.heading}</h2>
          <p className="mt-4 text-white/85 max-w-2xl mx-auto">{props.subheading}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {props.btn1 && <Link to={props.btn1Link || "#"} className="inline-flex items-center gap-2 bg-white text-teal font-semibold px-6 py-3 rounded-lg hover:scale-[1.02] transition">{props.btn1} <ArrowRight size={16}/></Link>}
            {props.btn2 && <a href={props.btn2Link || "#"} className="btn-outline-white"><MessageCircle size={16}/> {props.btn2}</a>}
          </div>
        </div>
      </section>
    );

    case "home-news": return (
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold">{props.heading}</h2>
            {props.linkText && <Link to={props.linkHref || "#"} className="text-teal font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">{props.linkText} <ArrowRight size={16}/></Link>}
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {(props.articles || []).map((a: any, i: number) => (
              <article key={i} className="rounded-xl overflow-hidden bg-white border border-border-silver hover:shadow-[0_8px_28px_rgba(0,0,0,.08)] transition-all hover:-translate-y-1">
                <div className="relative h-44">
                  {a.img && <img src={a.img} alt={a.category} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />}
                  <div className="absolute inset-0 bg-linear-to-t from-navy/70 to-transparent"/>
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.12em] font-medium text-white bg-teal px-2 py-1 rounded">{a.category}</span>
                </div>
                <div className="p-5">
                  <div className="text-xs text-muted-grey">{a.date}</div>
                  <h3 className="font-semibold mt-2 leading-snug">{a.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );

    case "site-footer":
      return <SiteFooterView {...(props || {})} />;

    default:
      return <div className="p-4 rounded-xl bg-gray-50 text-sm text-gray-400">[{type}] block</div>;
  }
}
