import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { apiFetch, getAccessToken } from "@/lib/api";
import { Upload, Trash2, Search, Image, FileText, Copy, CheckCheck, X } from "lucide-react";

export const Route = createFileRoute("/admin/media")({ component: AdminMedia });

type MediaItem = { _id: string; filename: string; originalName: string; url: string; mimeType: string; size: number; alt: string; createdAt: string; uploadedBy?: { name: string } };

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AdminMedia() {
  const [items,    setItems]    = useState<MediaItem[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied,   setCopied]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load(p = page, s = search) {
    try {
      const params = new URLSearchParams({ page: String(p), limit: "40" });
      if (s) params.set("search", s);
      const r = await apiFetch<{ items: MediaItem[]; total: number }>(`/api/admin/media?${params}`);
      setItems(r.items); setTotal(r.total);
    } catch {}
  }

  useEffect(() => { load(1, search); setPage(1); }, [search]);
  useEffect(() => { load(page, search); }, [page]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach(f => fd.append("files", f));
      const token = getAccessToken();
      const res = await fetch("/api/admin/media", { method: "POST", credentials: "include", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
      if (!res.ok) throw new Error("Upload failed");
      await load(1, search); setPage(1);
    } catch (e) { alert((e as Error).message); }
    finally { setUploading(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this file?")) return;
    setDeleting(id);
    try { await apiFetch(`/api/admin/media/${id}`, { method: "DELETE" }); setItems(p => p.filter(i => i._id !== id)); if (selected?._id === id) setSelected(null); }
    catch { alert("Delete failed"); }
    finally { setDeleting(null); }
  }

  function copy(url: string) {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const pages = Math.ceil(total / 40);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Media Library</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} file{total !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => inputRef.current?.click()} disabled={uploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
          <Upload size={15}/> {uploading ? "Uploading…" : "Upload Files"}
        </button>
        <input ref={inputRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={e => upload(e.target.files)}/>
      </div>

      {/* Drop zone + search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-400"/>
        </div>
      </div>

      {/* Drag zone */}
      <div onDrop={e => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files); }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${dragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300"}`}
        onClick={() => inputRef.current?.click()}>
        <Upload size={24} className="mx-auto text-slate-300 mb-2"/>
        <p className="text-sm text-slate-400">{dragOver ? "Drop to upload" : "Drag & drop files or click to browse"}</p>
        <p className="text-xs text-slate-300 mt-1">Images and PDFs up to 10 MB</p>
      </div>

      <div className="flex gap-6">
        {/* Grid */}
        <div className="flex-1">
          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-300">
              <Image size={40} className="mx-auto mb-3 opacity-30"/>
              <p className="text-sm">No files uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {items.map(item => (
                <div key={item._id} onClick={() => setSelected(item)}
                  className={`group relative bg-white rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-md ${selected?._id === item._id ? "border-indigo-400 ring-2 ring-indigo-200" : "border-slate-100"}`}>
                  {item.mimeType.startsWith("image/") ? (
                    <img src={item.url} alt={item.alt || item.originalName} className="w-full aspect-square object-cover"/>
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-slate-50">
                      <FileText size={28} className="text-slate-300"/>
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-[10px] text-slate-500 truncate">{item.originalName}</p>
                    <p className="text-[10px] text-slate-300">{fmt(item.size)}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); del(item._id); }} disabled={deleting === item._id}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex">
                    <Trash2 size={11}/>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40">←</button>
              <span className="text-sm text-slate-500">{page} / {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 disabled:opacity-40">→</button>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-64 shrink-0 bg-white rounded-2xl border border-slate-100 p-4 self-start space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">File Details</span>
              <button onClick={() => setSelected(null)}><X size={14} className="text-slate-400"/></button>
            </div>
            {selected.mimeType.startsWith("image/") ? (
              <img src={selected.url} alt={selected.alt} className="w-full rounded-xl border border-slate-100"/>
            ) : (
              <div className="w-full aspect-video bg-slate-50 rounded-xl flex items-center justify-center">
                <FileText size={32} className="text-slate-300"/>
              </div>
            )}
            <div className="space-y-1 text-xs text-slate-500">
              <p className="font-medium text-slate-700 truncate">{selected.originalName}</p>
              <p>{fmt(selected.size)} · {selected.mimeType}</p>
              <p>{new Date(selected.createdAt).toLocaleDateString("en-GB")}</p>
              {selected.uploadedBy && <p>By {selected.uploadedBy.name}</p>}
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">URL</p>
              <div className="flex gap-1">
                <input readOnly value={selected.url} className="flex-1 text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-mono truncate"/>
                <button onClick={() => copy(selected.url)} className="p-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 text-slate-400">
                  {copied ? <CheckCheck size={12} className="text-emerald-500"/> : <Copy size={12}/>}
                </button>
              </div>
            </div>
            <button onClick={() => del(selected._id)} disabled={deleting === selected._id}
              className="w-full py-2 rounded-xl text-xs font-semibold text-red-600 border border-red-100 hover:bg-red-50 transition-colors">
              <Trash2 size={12} className="inline mr-1.5"/>Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
