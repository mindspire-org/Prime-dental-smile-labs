import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Download, FileText, File } from "lucide-react";

export const Route = createFileRoute("/portal/documents")({
  component: PortalDocuments,
});

function PortalDocuments() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any>("/api/cases?limit=100").then(r => {
      setCases((r.items || []).filter((c: any) => c.files?.length > 0));
    }).finally(() => setLoading(false));
  }, []);

  async function download(fileId: string) {
    const res = await apiFetch<{ downloadUrl: string }>(`/api/files/${fileId}/download-url`);
    window.open(res.downloadUrl, "_blank");
  }

  const allFiles = cases.flatMap(c => (c.files || []).map((f: any) => ({ ...f, case: c })));

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "#0aabbd" }}>Portal</div>
        <h1 className="text-2xl font-bold text-slate-800">Documents</h1>
        <p className="text-sm text-slate-400 mt-1">All files attached to your cases.</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : allFiles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
          <File size={40} className="mx-auto text-slate-200 mb-3" />
          <div className="text-slate-400 text-sm">No documents attached to any cases yet.</div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden divide-y divide-slate-50">
          {allFiles.map((f: any) => (
            <div key={f._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-teal" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-700 truncate">{f.originalName || f.filename || "File"}</div>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">{f.case?.caseNumber}</div>
              </div>
              {f.size && (
                <span className="text-xs text-slate-400 shrink-0 hidden sm:block">
                  {(f.size / 1024).toFixed(0)} KB
                </span>
              )}
              <button onClick={() => download(f._id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal bg-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-teal hover:text-white">
                <Download size={12} /> Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
