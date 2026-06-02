import { useState } from "react";
import {
  FileText, Image as ImageIcon, FileSpreadsheet, FileAudio, FileVideo,
  Download, Eye, Trash2, Loader2, X, FileCode, File,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export type CaseFile = {
  _id: string;
  originalName: string;
  mimeType?: string;
  size?: number;
  [key: string]: any;
};

type Theme = "indigo" | "teal";

const THEME_STYLES: Record<Theme, { text: string; hoverBg: string; btnHover: string; iconColor: string; previewRing: string }> = {
  indigo: {
    text: "text-indigo-600",
    hoverBg: "hover:bg-indigo-50",
    btnHover: "hover:bg-indigo-500 hover:text-white",
    iconColor: "text-indigo-500",
    previewRing: "ring-indigo-200",
  },
  teal: {
    text: "text-teal",
    hoverBg: "hover:bg-cyan-50",
    btnHover: "hover:bg-teal hover:text-white",
    iconColor: "text-teal",
    previewRing: "ring-cyan-200",
  },
};

function getFileType(file: CaseFile) {
  const mime = (file.mimeType || "").toLowerCase();
  const name = (file.originalName || "").toLowerCase();
  if (mime.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(name)) return "image";
  if (mime === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (mime.startsWith("video/") || /\.(mp4|mov|avi|mkv|webm)$/i.test(name)) return "video";
  if (mime.startsWith("audio/") || /\.(mp3|wav|ogg|aac|m4a)$/i.test(name)) return "audio";
  if (mime.includes("spreadsheet") || mime.includes("excel") || /\.(xls|xlsx|csv)$/i.test(name)) return "spreadsheet";
  if (mime.includes("code") || mime.includes("json") || mime.includes("javascript") || mime.includes("text") || /\.(js|ts|jsx|tsx|json|xml|html|css|txt)$/i.test(name)) return "code";
  return "document";
}

function FileTypeIcon({ file, theme }: { file: CaseFile; theme: Theme }) {
  const type = getFileType(file);
  const size = 18;
  const cls = THEME_STYLES[theme].iconColor;
  switch (type) {
    case "image": return <ImageIcon size={size} className={cls} />;
    case "pdf": return <FileText size={size} className={cls} />;
    case "video": return <FileVideo size={size} className={cls} />;
    case "audio": return <FileAudio size={size} className={cls} />;
    case "spreadsheet": return <FileSpreadsheet size={size} className={cls} />;
    case "code": return <FileCode size={size} className={cls} />;
    default: return <File size={size} className={cls} />;
  }
}

function isPreviewable(file: CaseFile) {
  const type = getFileType(file);
  return type === "image" || type === "pdf" || type === "video";
}

export function CaseFileList({
  files,
  theme = "indigo",
  onDelete,
  deletingId,
  allowDelete = true,
}: {
  files: CaseFile[];
  theme?: Theme;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
  allowDelete?: boolean;
}) {
  const [previewFile, setPreviewFile] = useState<CaseFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const t = THEME_STYLES[theme];

  async function getDownloadUrl(fileId: string): Promise<string> {
    const res = await apiFetch<{ downloadUrl: string }>(`/api/files/${fileId}/download-url`);
    return res.downloadUrl;
  }

  async function handleDownload(file: CaseFile) {
    setDownloadingId(file._id);
    try {
      const url = await getDownloadUrl(file._id);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || "Download failed");
    } finally {
      setDownloadingId(null);
    }
  }

  async function handlePreview(file: CaseFile) {
    if (!isPreviewable(file)) return;
    setLoadingPreview(true);
    setPreviewFile(file);
    try {
      const url = await getDownloadUrl(file._id);
      setPreviewUrl(url);
    } catch (err: any) {
      alert(err.message || "Preview failed");
      setPreviewFile(null);
    } finally {
      setLoadingPreview(false);
    }
  }

  function closePreview() {
    setPreviewFile(null);
    setPreviewUrl(null);
    setLoadingPreview(false);
  }

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-6 text-slate-300 text-sm flex flex-col items-center gap-2">
        <FileText size={30} strokeWidth={1} />
        No files attached yet.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {files.map((f) => {
          const type = getFileType(f);
          const isImg = type === "image";
          const canPreview = isPreviewable(f);
          const isDownloading = downloadingId === f._id;
          const isDeleting = deletingId === f._id;

          return (
            <div
              key={f._id}
              className={`flex items-center gap-3 p-3 rounded-xl bg-slate-50 ${t.hoverBg} transition-colors border border-slate-100`}
            >
              {/* Thumbnail or icon */}
              <div className={`w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100 ${isImg ? "overflow-hidden" : ""}`}>
                {isImg ? (
                  <button
                    onClick={() => handlePreview(f)}
                    className="w-full h-full flex items-center justify-center"
                    title="Preview image"
                  >
                    <ImageIcon size={18} className={t.iconColor} />
                  </button>
                ) : (
                  <FileTypeIcon file={f} theme={theme} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-700 truncate">{f.originalName}</div>
                {f.size && (
                  <div className="text-[10px] text-slate-400">
                    {(f.size / 1024).toFixed(0)} KB · {type.charAt(0).toUpperCase() + type.slice(1)}
                  </div>
                )}
              </div>

              {/* Actions — always visible */}
              <div className="flex items-center gap-1 shrink-0">
                {canPreview && (
                  <button
                    onClick={() => handlePreview(f)}
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${t.text} px-2 py-1.5 rounded-lg bg-white border border-slate-100 shadow-sm ${t.btnHover} transition-colors`}
                    title="Preview"
                  >
                    <Eye size={12} />
                    <span className="hidden sm:inline">Preview</span>
                  </button>
                )}
                <button
                  onClick={() => handleDownload(f)}
                  disabled={isDownloading}
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${t.text} px-2 py-1.5 rounded-lg bg-white border border-slate-100 shadow-sm ${t.btnHover} transition-colors disabled:opacity-40`}
                  title="Download"
                >
                  {isDownloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  <span className="hidden sm:inline">Download</span>
                </button>
                {allowDelete && onDelete && (
                  <button
                    onClick={() => onDelete(f._id)}
                    disabled={isDeleting}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                    title="Delete"
                  >
                    {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={closePreview}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl max-h-[90vh] w-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <FileTypeIcon file={previewFile} theme={theme} />
                <span className="text-sm font-semibold text-slate-700 truncate">{previewFile.originalName}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDownload(previewFile)}
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${t.text} px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm ${t.btnHover} transition-colors`}
                >
                  <Download size={12} /> Download
                </button>
                <button
                  onClick={closePreview}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-100 p-4">
              {loadingPreview ? (
                <div className="flex flex-col items-center gap-2 py-12">
                  <Loader2 size={28} className="animate-spin text-slate-400" />
                  <span className="text-xs text-slate-400">Loading preview…</span>
                </div>
              ) : previewUrl ? (
                getFileType(previewFile) === "image" ? (
                  <img
                    src={previewUrl}
                    alt={previewFile.originalName}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg ring-1 ring-white"
                  />
                ) : getFileType(previewFile) === "pdf" ? (
                  <iframe
                    src={previewUrl}
                    title={previewFile.originalName}
                    className="w-full h-[70vh] rounded-lg border border-slate-200 bg-white"
                  />
                ) : getFileType(previewFile) === "video" ? (
                  <video
                    src={previewUrl}
                    controls
                    className="max-w-full max-h-[70vh] rounded-lg shadow-lg ring-1 ring-white"
                  />
                ) : (
                  <div className="text-slate-500 text-sm">Preview not available for this file type.</div>
                )
              ) : (
                <div className="text-slate-500 text-sm">Failed to load preview.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
