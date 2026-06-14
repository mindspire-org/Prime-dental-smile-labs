import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Layout, Edit3, Eye, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/pages")({ component: AdminPages });

type PageMeta = { slug: string; title: string; published: boolean; updatedAt?: string; blocks?: any[] };

const SERVICE_DETAIL_SLUGS = ["fixed-restorations","implant-prosthetics","removable-prosthetics","metal-frameworks","splints-guards","digital-design"];

// Maps a CMS page slug to its actual public URL (service & technology detail
// pages live under nested routes, so /<slug> would 404).
function pagePublicPath(slug: string): string {
  if (slug === "home") return "/";
  if (slug === "footer") return "/";
  if (SERVICE_DETAIL_SLUGS.includes(slug)) return `/services/${slug}`;
  if (slug.startsWith("technology-")) return `/technology/${slug.slice("technology-".length)}`;
  return `/${slug}`;
}

function AdminPages() {
  const [pages, setPages] = useState<PageMeta[]>([]);

  useEffect(() => {
    apiFetch<{ pages: PageMeta[] }>("/api/admin/pages").then(r => setPages(r.pages)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pages</h1>
        <p className="text-sm text-slate-400 mt-0.5">Edit marketing pages with the visual block editor</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map(p => (
          <div key={p.slug} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-28 bg-linear-to-br from-slate-100 to-slate-50 flex items-center justify-center relative">
              <Layout size={36} className="text-slate-200"/>
              <span className="absolute bottom-2 right-2 text-[10px] font-semibold bg-white border border-slate-100 px-2 py-0.5 rounded-full text-slate-400">
                {p.blocks?.length ?? 0} blocks
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-slate-800">{p.title}</h3>
                {p.published !== false
                  ? <CheckCircle2 size={13} className="text-emerald-500"/>
                  : <Clock size={13} className="text-amber-400"/>}
              </div>
              <p className="text-xs text-slate-400 mb-3 font-mono">/{p.slug}</p>
              <div className="flex gap-2">
                <Link to="/admin/page-editor/$slug" params={{ slug: p.slug }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-all"
                  style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                  <Edit3 size={12}/> Edit Page
                </Link>
                <a href={pagePublicPath(p.slug)} target="_blank" rel="noopener"
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1">
                  <Eye size={12}/> View
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
