import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Plus, Edit3, Trash2, Eye, Search, Calendar, Tag } from "lucide-react";

export const Route = createFileRoute("/admin/posts")({ component: AdminPosts });

type Post = { _id: string; title: string; slug: string; status: string; category: string; tags: string[]; createdAt: string; author?: { name: string } };

const STATUS_CHIP: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700",
  draft:     "bg-slate-100 text-slate-500",
  scheduled: "bg-amber-50 text-amber-700",
};

function AdminPosts() {
  const [posts,   setPosts]   = useState<Post[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState("");
  const [status,  setStatus]  = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load(p = page, s = search, st = status) {
    const params = new URLSearchParams({ page: String(p), limit: "20" });
    if (s) params.set("search", s); if (st) params.set("status", st);
    const r = await apiFetch<{ items: Post[]; total: number }>(`/api/admin/posts?${params}`).catch(() => null);
    if (r) { setPosts(r.items); setTotal(r.total); }
  }

  useEffect(() => { load(1, search, status); setPage(1); }, [search, status]);
  useEffect(() => { load(page, search, status); }, [page]);

  async function del(id: string) {
    if (!confirm("Delete this post?")) return;
    setDeleting(id);
    await apiFetch(`/api/admin/posts/${id}`, { method: "DELETE" }).catch(() => {});
    setPosts(p => p.filter(i => i._id !== id));
    setDeleting(null);
  }

  const pages = Math.ceil(total / 20);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Blog Posts</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} post{total !== 1 ? "s" : ""}</p>
        </div>
        <Link to="/admin/post-editor/$id" params={{ id: "new" }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
          <Plus size={15}/> New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"/>
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-700">
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-400 font-semibold">Title</th>
              <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-400 font-semibold hidden md:table-cell">Status</th>
              <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-400 font-semibold hidden lg:table-cell">Category</th>
              <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-400 font-semibold hidden lg:table-cell">Author</th>
              <th className="px-5 py-3 text-left text-xs uppercase tracking-wider text-slate-400 font-semibold hidden md:table-cell">Date</th>
              <th className="px-5 py-3"/>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr><td colSpan={6} className="py-16 text-center text-slate-300 text-sm">No posts yet</td></tr>
            )}
            {posts.map(post => (
              <tr key={post._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5">
                  <Link to="/admin/post-editor/$id" params={{ id: post._id }} className="font-medium text-slate-800 hover:text-indigo-600 transition-colors">{post.title}</Link>
                  <p className="text-xs text-slate-400 font-mono">{post.slug}</p>
                </td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_CHIP[post.status] || STATUS_CHIP.draft}`}>{post.status}</span>
                </td>
                <td className="px-5 py-3.5 hidden lg:table-cell">
                  {post.category && <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Tag size={11}/>{post.category}</span>}
                </td>
                <td className="px-5 py-3.5 hidden lg:table-cell text-sm text-slate-500">{post.author?.name}</td>
                <td className="px-5 py-3.5 hidden md:table-cell">
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Calendar size={11}/>{new Date(post.createdAt).toLocaleDateString("en-GB")}</span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link to="/admin/post-editor/$id" params={{ id: post._id }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                      <Edit3 size={14}/>
                    </Link>
                    <button onClick={() => del(post._id)} disabled={deleting === post._id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40">←</button>
          <span className="text-sm text-slate-500">{page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40">→</button>
        </div>
      )}
    </div>
  );
}
