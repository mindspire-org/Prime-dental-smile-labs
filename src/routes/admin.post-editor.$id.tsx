import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ChevronLeft, Save, CheckCircle2, Eye, Globe, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/post-editor/$id")({ component: PostEditor });

function PostEditor() {
  const { id } = Route.useParams();
  const isNew   = id === "new";
  const navigate = useNavigate();

  const [title,    setTitle]    = useState("");
  const [excerpt,  setExcerpt]  = useState("");
  const [content,  setContent]  = useState("");
  const [status,   setStatus]   = useState("draft");
  const [category, setCategory] = useState("");
  const [tags,     setTags]     = useState("");
  const [featImg,  setFeatImg]  = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc,  setSeoDesc]  = useState("");
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    if (isNew) return;
    apiFetch<{ post: any }>(`/api/admin/posts/${id}`).then(r => {
      const p = r.post;
      setTitle(p.title || ""); setExcerpt(p.excerpt || "");
      setContent(typeof p.blocks === "string" ? p.blocks : JSON.stringify(p.blocks || "", null, 2));
      setStatus(p.status || "draft"); setCategory(p.category || "");
      setTags((p.tags || []).join(", ")); setFeatImg(p.featuredImage || "");
      setSeoTitle(p.seo?.title || ""); setSeoDesc(p.seo?.description || "");
    }).catch(() => {});
  }, [id]);

  async function save(newStatus?: string) {
    if (!title.trim()) { alert("Title is required"); return; }
    setSaving(true);
    try {
      let blocks: any = content;
      try { blocks = JSON.parse(content); } catch {}
      const payload = {
        title, excerpt, blocks, status: newStatus || status,
        category, tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        featuredImage: featImg, seo: { title: seoTitle, description: seoDesc },
      };
      if (isNew) {
        const r = await apiFetch<{ post: any }>("/api/admin/posts", { method: "POST", body: JSON.stringify(payload) });
        navigate({ to: "/admin/post-editor/$id", params: { id: r.post._id } } as any);
      } else {
        await apiFetch(`/api/admin/posts/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
      }
      if (newStatus) setStatus(newStatus);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-0 -mt-1">
      {/* Toolbar */}
      <div className="flex items-center gap-4 pb-4 mb-6 border-b border-slate-100">
        <Link to="/admin/posts" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <ChevronLeft size={15}/> Posts
        </Link>
        <span className="text-slate-200">|</span>
        <span className="text-sm text-slate-500">{isNew ? "New Post" : title || "Edit Post"}</span>
        <div className="ml-auto flex items-center gap-2">
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
          <button onClick={() => save()} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
            {saved ? <><CheckCircle2 size={14}/> Saved!</> : saving ? "Saving…" : <><Save size={14}/> Save</>}
          </button>
          {status !== "published" && (
            <button onClick={() => save("published")} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
              <Globe size={14}/> Publish
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            <div>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title…"
                className="w-full text-2xl font-bold text-slate-800 border-none outline-none placeholder-slate-200"/>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Excerpt</label>
              <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} placeholder="Short description…"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 resize-none"/>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-1.5">
                <FileText size={12}/> Content
              </label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={20} placeholder="Write your post content here…"
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-indigo-400 resize-y"/>
              <p className="text-[11px] text-slate-400 mt-1">Plain text or JSON block array</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Featured image */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Eye size={13}/> Featured Image</h3>
            <input value={featImg} onChange={e => setFeatImg(e.target.value)} placeholder="Image URL…"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"/>
            {featImg && <img src={featImg} alt="" className="w-full rounded-xl border border-slate-100 object-cover aspect-video"/>}
          </div>

          {/* Category & Tags */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-700">Organisation</h3>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Category</label>
              <input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. News"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"/>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Tags (comma-separated)</label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="dental, lab, crowns"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"/>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-700">SEO</h3>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Meta Title</label>
              <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={title}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"/>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Meta Description</label>
              <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} rows={3} placeholder={excerpt}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400 resize-none"/>
            </div>
            {/* Preview snippet */}
            {(seoTitle || title) && (
              <div className="border border-slate-100 rounded-xl p-3 bg-slate-50">
                <p className="text-[11px] text-slate-400 mb-1">Google preview</p>
                <p className="text-sm text-indigo-600 font-medium truncate">{seoTitle || title}</p>
                <p className="text-xs text-green-600 truncate">primesmile.co.uk/{(title || "").toLowerCase().replace(/\s+/g, "-")}</p>
                <p className="text-xs text-slate-500 line-clamp-2">{seoDesc || excerpt}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
