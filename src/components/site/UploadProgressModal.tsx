import { useEffect, useState } from "react";
import { FileText, CheckCircle2, UploadCloud, X } from "lucide-react";
import { formatBytes } from "@/lib/utils";

export type UploadFile = {
  name: string;
  size: number;
  progress: number; // 0-100
  status: "pending" | "uploading" | "done" | "error";
};

type Props = {
  open: boolean;
  files: UploadFile[];
  title?: string;
  onCancel?: () => void;
};


export function UploadProgressModal({ open, files, title = "Uploading Files", onCancel }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) setMounted(true);
    else {
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  const totalBytes = files.reduce((s, f) => s + f.size, 0);
  const uploadedBytes = files.reduce((s, f) => s + f.size * (f.progress / 100), 0);
  const overallPercent = totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0;
  const allDone = files.length > 0 && files.every((f) => f.status === "done");
  const anyError = files.some((f) => f.status === "error");

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      {/* Card */}
      <div
        className={`relative w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl overflow-hidden transition-all duration-300 ${
          open ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Top 3D orbiting header */}
        <div className="relative h-28 overflow-hidden bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
          {/* Animated rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="absolute rounded-full border border-white/20"
              style={{ width: 120, height: 120, animation: "upmRing 2.4s ease-out infinite" }}
            />
            <span
              className="absolute rounded-full border border-white/15"
              style={{ width: 120, height: 120, animation: "upmRing 2.4s ease-out 0.8s infinite" }}
            />
            <span
              className="absolute rounded-full border border-white/10"
              style={{ width: 120, height: 120, animation: "upmRing 2.4s ease-out 1.6s infinite" }}
            />
          </div>

          {/* Center icon with glow */}
          <div
            className="relative z-10 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
            style={{ animation: "upmFloat 2.5s ease-in-out infinite" }}
          >
            <UploadCloud size={28} className="text-white" />
          </div>

          {/* Close button */}
          {onCancel && (
            <button
              onClick={onCancel}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Title + overall progress */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{allDone ? "Upload Complete" : title}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {allDone
                  ? `${files.length} file${files.length > 1 ? "s" : ""} uploaded successfully`
                  : `${files.filter((f) => f.status === "done").length} of ${files.length} done`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-teal">{overallPercent}%</div>
              <div className="text-[10px] text-slate-400">
                {formatBytes(Math.round(uploadedBytes))} / {formatBytes(totalBytes)}
              </div>
            </div>
          </div>

          {/* Overall bar */}
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
            <div
              className="h-full rounded-full bg-linear-to-r from-teal-400 to-cyan-500 transition-all duration-500 ease-out"
              style={{ width: `${overallPercent}%` }}
            />
          </div>

          {/* File list */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                {/* File icon */}
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  {f.status === "done" ? (
                    <CheckCircle2 size={16} className="text-teal" />
                  ) : f.status === "error" ? (
                    <X size={16} className="text-red-400" />
                  ) : (
                    <FileText size={16} className="text-slate-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-slate-700 truncate">{f.name}</p>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                      {f.status === "done" ? "Done" : f.status === "error" ? "Failed" : `${Math.round(f.progress)}%`}
                    </span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        f.status === "done"
                          ? "bg-teal"
                          : f.status === "error"
                          ? "bg-red-400"
                          : "bg-linear-to-r from-teal-300 to-cyan-400"
                      }`}
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatBytes(f.size)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Error notice */}
          {anyError && (
            <p className="mt-4 text-[11px] text-red-500 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
              Some files failed to upload. They will be skipped.
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes upmRing {
          0%   { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes upmFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
