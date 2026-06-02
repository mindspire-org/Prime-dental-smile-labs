import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Upload, FileText, ChevronLeft, Send, Paperclip, CheckCheck, Trash2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { apiFetch, getCurrentUser, openRealtimeConnection, type AuthUser } from "@/lib/api";
import { generateCasePdf } from "@/lib/case-pdf";
import { CaseFileList } from "@/components/site/CaseFiles";

export const Route = createFileRoute("/admin/cases/$id")({
  component: AdminCaseDetail,
});

const STEPS = [
  "Submitted","File Review","Awaiting Information","Design Stage",
  "Dentist Approval","In Production","Finishing","Quality Control",
  "Ready for Dispatch","Dispatched","Completed"
];

const STATUS_CHIP: Record<string, { bg: string; text: string; dot: string }> = {
  "Submitted":            { bg: "bg-cyan-50",    text: "text-cyan-700",   dot: "bg-cyan-400" },
  "Awaiting Information": { bg: "bg-amber-50",   text: "text-amber-700",  dot: "bg-amber-400" },
  "In Production":        { bg: "bg-blue-50",    text: "text-blue-700",   dot: "bg-blue-400" },
  "Dispatched":           { bg: "bg-green-50",   text: "text-green-700",  dot: "bg-green-400" },
  "Completed":            { bg: "bg-slate-100",  text: "text-slate-600",  dot: "bg-slate-400" },
  "Design Stage":         { bg: "bg-violet-50",  text: "text-violet-700", dot: "bg-violet-400" },
  "Quality Control":      { bg: "bg-orange-50",  text: "text-orange-700", dot: "bg-orange-400" },
};
const defaultChip = { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };

type CaseDetailData = { case: any; messages: any[] };

function AdminCaseDetail() {
  const { id } = Route.useParams();
  const [data, setData] = useState<CaseDetailData | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    try {
      const d = await apiFetch<CaseDetailData>(`/api/cases/${id}`);
      setData(d);
      setMessages(d.messages ?? []);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load case"); }
  }

  async function sendMessage() {
    if (!message.trim() || !data?.case?._id || sending) return;
    setSending(true);
    const body = message.trim();
    const optimistic = {
      _id: `tmp-${Date.now()}`,
      body,
      sender: { _id: currentUser?.id, name: currentUser?.name, role: currentUser?.role },
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);
    setMessage("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    try {
      const r = await apiFetch<any>(`/api/messages/case/${data.case._id}`, { method: "POST", body: JSON.stringify({ body }) });
      setMessages(prev => prev.map(m => m._id === optimistic._id ? r.message : m));
    } catch {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      setMessage(body);
    } finally { setSending(false); }
  }

  async function download(fileId: string) {
    const res = await apiFetch<{ downloadUrl: string }>(`/api/files/${fileId}/download-url`);
    window.open(res.downloadUrl, "_blank");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !data?.case?._id) return;
    const MAX_MB = 50;
    if (file.size > MAX_MB * 1024 * 1024) { alert(`File must be under ${MAX_MB} MB`); return; }
    setUploading(true);
    setUploadProgress("Requesting upload URL…");
    try {
      const { uploadUrl, file: fileMeta } = await apiFetch<{ uploadUrl: string; file: any }>("/api/files/upload-url", {
        method: "POST",
        body: JSON.stringify({ caseId: data.case._id, fileName: file.name, contentType: file.type || "application/octet-stream", size: file.size }),
      });
      setUploadProgress("Uploading to storage…");
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "content-type": file.type || "application/octet-stream" } });
      setUploadProgress("Finalising…");
      setData(prev => prev ? { ...prev, case: { ...prev.case, files: [...(prev.case.files || []), fileMeta] } } : prev);
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function deleteFile(fileId: string) {
    if (!confirm("Remove this file?")) return;
    setDeletingId(fileId);
    try {
      await apiFetch(`/api/files/${fileId}`, { method: "DELETE" });
      setData(prev => prev ? { ...prev, case: { ...prev.case, files: prev.case.files.filter((f: any) => f._id !== fileId) } } : prev);
    } catch (err: any) {
      alert(err.message || "Delete failed");
    } finally { setDeletingId(null); }
  }

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    load();
    wsRef.current = openRealtimeConnection((event) => {
      if (event.type === "case:new_message") {
        setMessages(prev => {
          if (prev.find(m => m._id === event.message._id)) return prev;
          const updated = [...prev, event.message];
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
          return updated;
        });
      }
      if (event.type === "case:status_changed" || event.type === "case:updated") {
        load();
      }
    });
    return () => wsRef.current?.close?.();
  }, [id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, []);

  if (error) return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl text-sm">
      <span>⚠️</span> {error}
    </div>
  );
  if (!data) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-20 bg-white rounded-2xl"/>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4"><div className="h-48 bg-white rounded-2xl"/><div className="h-64 bg-white rounded-2xl"/></div>
        <div className="h-96 bg-white rounded-2xl"/>
      </div>
    </div>
  );

  const dentalCase = data.case;
  const active = Math.max(STEPS.indexOf(dentalCase.status), 0);
  const chip = STATUS_CHIP[dentalCase.status] ?? defaultChip;
  const pct = Math.round(((active + 1) / STEPS.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/admin/cases" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-500 font-medium transition-colors mb-4">
          <ChevronLeft size={15}/> Back to Cases
        </Link>
        <div className="bg-white rounded-2xl px-6 py-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]"
          style={{ borderLeft: "4px solid #6366f1" }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-indigo-500 font-semibold mb-1">Case Reference</div>
              <h1 className="text-2xl font-bold font-mono text-slate-800">{dentalCase.caseNumber}</h1>
              <div className="text-sm text-slate-400 mt-0.5">{dentalCase.patientRef}</div>
              <div className="text-xs text-slate-400 mt-1">Dentist: <span className="font-medium text-slate-600">{dentalCase.dentist?.name}</span> · {dentalCase.dentist?.email}</div>
              <div className="text-xs text-slate-400 mt-0.5">Clinic: <span className="font-medium text-slate-600">{dentalCase.clinic?.name || "—"}</span></div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${chip.bg} ${chip.text}`}>
                <span className={`w-2 h-2 rounded-full ${chip.dot} animate-pulse`}/>
                {dentalCase.status}
              </span>
              <div className="text-xs text-slate-400">
                Submitted {new Date(dentalCase.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </div>
              <button
                onClick={() => generateCasePdf(dentalCase)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors mt-1"
                title="Download case PDF"
              >
                <Download size={13}/> Download PDF
              </button>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
              <span>Progress</span>
              <span className="font-semibold text-indigo-500">{pct}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg, #6366f1, #4f46e5)" }}/>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Prescription */}
          <section className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-indigo-500 inline-block"/>
              Prescription Summary
            </h2>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                ["Patient Ref",  dentalCase.patientRef],
                ["Service",      dentalCase.services?.join(", ") || "Not specified"],
                ["Material",     dentalCase.material || "—"],
                ["Shade",        [dentalCase.shade?.body, dentalCase.shade?.system].filter(Boolean).join(" · ") || "—"],
                ["Teeth",        Object.keys(dentalCase.teeth || {}).join(", ") || "—"],
                ["Urgency",      dentalCase.urgency || "Standard"],
                ["Submitted",    new Date(dentalCase.createdAt).toLocaleDateString("en-GB")],
                ["Requested By", dentalCase.requestedCompletion ? new Date(dentalCase.requestedCompletion).toLocaleDateString("en-GB") : "—"],
                ["Clinic Ref",   dentalCase.clinicReference || "—"],
                ["Notes",        dentalCase.notes || "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase tracking-wider text-indigo-500 font-semibold">{k}</span>
                  <span className="text-sm font-medium text-slate-700">{v}</span>
                </div>
              ))}
            </div>
            {dentalCase.implant && dentalCase.implant.brand && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-600 mb-2">Implant Details</h3>
                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  {[
                    ["Brand", dentalCase.implant.brand],
                    ["System", dentalCase.implant.system || "—"],
                    ["Platform", dentalCase.implant.platform || "—"],
                    ["Connection", dentalCase.implant.connection || "—"],
                    ["Retention", dentalCase.implant.retention || "—"],
                  ].map(([label, val]) => (
                    <div key={label}><span className="text-[10px] text-slate-400 uppercase">{label}</span><div className="text-slate-700 font-medium">{val}</div></div>
                  ))}
                </div>
              </div>
            )}
            {dentalCase.shipping && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-600 mb-2">Shipping</h3>
                <div className="text-sm text-slate-700">Method: {dentalCase.shipping.method || "—"}</div>
                <div className="text-sm text-slate-700">Address: {dentalCase.shipping.address || "—"}</div>
                {dentalCase.shipping.instructions && <div className="text-sm text-slate-500 mt-1">{dentalCase.shipping.instructions}</div>}
              </div>
            )}
          </section>

          {/* Files */}
          <section className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-indigo-500 inline-block"/>
              Uploaded Files
            </h2>
            <CaseFileList
              files={dentalCase.files || []}
              theme="indigo"
              onDelete={deleteFile}
              deletingId={deletingId}
              allowDelete={true}
            />

            {/* Admin upload */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                <Upload size={14}/>
                {uploading ? uploadProgress || "Uploading…" : "Upload file to case"}
              </button>
            </div>
          </section>

          {/* Messages */}
          <section className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-indigo-500 inline-block"/>
              <h2 className="font-bold text-slate-800">Messages</h2>
              {messages.length > 0 && (
                <span className="ml-auto text-[10px] font-semibold bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full">{messages.length}</span>
              )}
            </div>

            <div className="p-4 space-y-3 min-h-[180px] max-h-[340px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-slate-300 text-sm gap-2">
                  <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10 opacity-40">
                    <rect x="2" y="6" width="36" height="24" rx="6" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 32 L16 26 H24 L28 32" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <line x1="10" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="10" y1="22" x2="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  No messages yet.
                </div>
              ) : messages.map((m) => {
                const isMine = m.sender?._id === currentUser?.id || m.sender?._role === currentUser?.role;
                return (
                  <div key={m._id} className={`flex flex-col max-w-[78%] gap-1 ${isMine ? "ml-auto items-end" : "items-start"}`}>
                    {!isMine && (
                      <span className="text-[10px] text-slate-400 px-1">{m.sender?.name || "Lab"}</span>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMine
                        ? "text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-700 rounded-bl-sm"
                    } ${m._optimistic ? "opacity-70" : ""}`}
                      style={isMine ? { background: "linear-gradient(135deg, #6366f1, #4f46e5)" } : {}}>
                      {m.body}
                      {(m.attachmentName || m.attachment) && (
                        <div className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-medium ${isMine ? "text-white/80" : "text-indigo-500"}`}>
                          <Paperclip size={10} />
                          {m.attachment ? (
                            <button onClick={() => download(m.attachment)} className="underline text-left">{m.attachmentName || "Attachment"}</button>
                          ) : (
                            <span>{m.attachmentName}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] text-slate-400 px-1 ${isMine ? "flex-row-reverse" : ""}`}>
                      <span>{new Date(m.createdAt).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</span>
                      {isMine && <CheckCheck size={10} className={m._optimistic ? "text-slate-300" : "text-indigo-500"}/>}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef}/>
            </div>

            <div className="px-4 pb-4">
              <div className="flex gap-2 items-end bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-indigo-400 transition-colors">
                <button className="p-2 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-white transition-colors shrink-0">
                  <Paperclip size={15}/>
                </button>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  rows={1}
                  placeholder="Type a message… (Enter to send)"
                  className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 resize-none py-1.5 px-1 leading-relaxed"
                />
                <button onClick={sendMessage} disabled={!message.trim() || sending}
                  className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                  <Send size={14}/>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right column */}
        <aside className="space-y-5">
          {/* Timeline */}
          <section className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-indigo-500 inline-block"/>
              Status Timeline
            </h2>
            <ol className="relative space-y-0">
              <div className="absolute left-[13px] top-4 bottom-4 w-px bg-slate-100"/>
              {STEPS.map((s, i) => {
                const done = i < active;
                const current = i === active;
                return (
                  <li key={s} className="relative pl-8 pb-5 last:pb-0">
                    <span className={`absolute left-0 top-0.5 w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                      current
                        ? "bg-white border-indigo-500 text-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.15)]"
                        : done
                          ? "bg-indigo-500 border-indigo-500 text-white"
                          : "bg-white border-slate-200 text-slate-300"
                    }`}>
                      {done ? "✓" : i + 1}
                    </span>
                    <div className={`text-xs font-semibold ${current ? "text-indigo-500" : done ? "text-slate-700" : "text-slate-400"}`}>{s}</div>
                    {current && dentalCase.statusHistory?.[dentalCase.statusHistory.length - 1]?.note && (
                      <div className="text-[10px] text-slate-400 mt-0.5 italic">
                        {dentalCase.statusHistory[dentalCase.statusHistory.length - 1].note}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Status History */}
          {dentalCase.statusHistory && dentalCase.statusHistory.length > 0 && (
            <section className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
              <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-indigo-500 inline-block"/>
                History
              </h2>
              <div className="space-y-3">
                {dentalCase.statusHistory.map((h: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0"/>
                    <div>
                      <div className="font-medium text-slate-700">{h.status}</div>
                      <div className="text-[10px] text-slate-400">{h.note || "—"} · {new Date(h.createdAt).toLocaleDateString("en-GB")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
