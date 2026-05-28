import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Users, PlayCircle, Image } from "lucide-react";

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

function BlockRenderer({ type, props }: { type: string; props: any }) {
  switch (type) {
    case "hero":
      return (
        <div className="min-h-[400px] text-white overflow-hidden relative" style={{ background: props.bgColor || "#0d1e2c" }}>
          {props.image && (
            <div className="absolute inset-0">
              <img src={props.image} alt="" className="w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/20 to-black/40" style={{ opacity: props.overlayOpacity || 0.4 }} />
            </div>
          )}
          <div className={`relative ${props.height === "large" ? "py-20" : "py-16"} px-8 md:px-12 text-center max-w-6xl mx-auto`}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight drop-shadow-lg">{props.heading}</h1>
            <p className="text-white/90 mb-8 md:mb-10 text-lg md:text-xl lg:text-2xl leading-relaxed drop-shadow max-w-3xl mx-auto">{props.subheading}</p>
            {props.cta && (
              <span className="inline-block px-8 py-4 bg-white text-slate-800 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 cursor-pointer text-lg shadow-lg hover:shadow-xl">
                {props.cta} <ArrowUpRight size={18} className="inline ml-2" />
              </span>
            )}
          </div>
        </div>
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

    case "cards":
      return (
        <div className="py-6 px-6 rounded-2xl" style={{ backgroundColor: props.backgroundColor || "#f9fafb" }}>
          {props.heading && <h3 className="text-xl font-bold text-slate-800 text-center mb-6">{props.heading}</h3>}
          <div className={`grid gap-4 ${props.columns === 2 ? "grid-cols-1 md:grid-cols-2" : props.columns === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3"}`}>
            {(props.cards || []).map((c: any, i: number) => (
              <div key={i} className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">{c.icon || "✦"}</div>
                <div className="font-semibold text-slate-800 mb-1">{c.title}</div>
                <div className="text-sm text-slate-600">{c.text}</div>
              </div>
            ))}
          </div>
        </div>
      );

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

    default:
      return <div className="p-4 rounded-xl bg-gray-50 text-sm text-gray-400">[{type}] block</div>;
  }
}
