import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { apiFetch, getCurrentUser, openRealtimeConnection, type AuthUser } from "@/lib/api";
import { Send, CheckCheck, MessageSquare, Search, Circle, Users, Paperclip, X, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessages,
});

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function Avatar({ name, color = "indigo", size = 36 }: { name: string; color?: string; size?: number }) {
  const initials = name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const bg = color === "teal"
    ? "linear-gradient(135deg,#0aabbd,#078a99)"
    : "linear-gradient(135deg,#6366f1,#4f46e5)";
  return (
    <div className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{ background: bg, width: `${size}px`, height: `${size}px`, fontSize: size < 32 ? "10px" : "13px" }}>
      {initials}
    </div>
  );
}

function AdminMessages() {
  const [cases, setCases] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const selectedRef = useRef<any>(null);
  selectedRef.current = selected;

  useEffect(() => { setCurrentUser(getCurrentUser()); }, []);

  useEffect(() => {
    apiFetch<any>("/api/cases?limit=200").then(r => setCases(r.items || []));
  }, []);

  useEffect(() => {
    const ws = openRealtimeConnection((event) => {
      if (event.type === "case:new_message") {
        const msg = event.message;
        if (selectedRef.current?._id === event.caseId) {
          setMessages(prev => [...prev, msg]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
        } else {
          setUnread(prev => ({ ...prev, [event.caseId]: (prev[event.caseId] || 0) + 1 }));
          setCases(prev => prev.map((c: any) => c._id === event.caseId ? { ...c, _lastMsg: msg } : c));
        }
      }
      if (event.type === "general:new_message") {
        const msg = event.message;
        const dentistId = event.dentistId;
        if (selectedRef.current?._isGeneral && selectedRef.current?.dentistId === String(dentistId)) {
          setMessages(prev => prev.find((m: any) => m._id === msg._id) ? prev : [...prev, msg]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
        } else {
          setUnread(prev => ({ ...prev, [`general_${dentistId}`]: (prev[`general_${dentistId}`] || 0) + 1 }));
        }
      }
    });
    return () => ws?.close?.();
  }, []);

  const [generalDentists, setGeneralDentists] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any>("/api/messages/general").then(r => {
      const msgs: any[] = r.messages || [];
      const map = new Map<string, any>();
      msgs.forEach(m => {
        const dId = m.sender?.role === "dentist" ? m.sender._id : m.recipientDentist;
        const dName = m.sender?.role === "dentist" ? m.sender.name : null;
        if (dId && !map.has(String(dId))) map.set(String(dId), { id: String(dId), name: dName, lastMsg: m });
        else if (dId) { const e = map.get(String(dId)); if (e) { e.lastMsg = m; if (!e.name && dName) e.name = dName; } }
      });
      setGeneralDentists(Array.from(map.values()));
    }).catch(() => {});
  }, []);

  async function selectCase(c: any) {
    setSelected(c);
    setAttachment(null);
    setUnread(prev => { const n = { ...prev }; delete n[c._id]; return n; });
    setLoadingMsgs(true);
    try {
      const r = await apiFetch<any>(`/api/messages/case/${c._id}`);
      setMessages(r.messages || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }), 80);
    } finally { setLoadingMsgs(false); }
  }

  async function selectGeneral(dentist: any) {
    const thread = { _isGeneral: true, dentistId: dentist.id, dentist: { name: dentist.name || "Dentist" }, _id: `general_${dentist.id}` };
    setSelected(thread);
    setAttachment(null);
    setUnread(prev => { const n = { ...prev }; delete n[`general_${dentist.id}`]; return n; });
    setLoadingMsgs(true);
    try {
      const r = await apiFetch<any>("/api/messages/general");
      const msgs: any[] = (r.messages || []).filter((m: any) => {
        const dId = m.sender?.role === "dentist" ? String(m.sender._id) : String(m.recipientDentist);
        return dId === dentist.id;
      });
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }), 80);
    } finally { setLoadingMsgs(false); }
  }

  async function downloadAttachment(fileId: string) {
    try {
      const res = await apiFetch<{ downloadUrl: string }>(`/api/files/${fileId}/download-url`);
      window.open(res.downloadUrl, "_blank");
    } catch {
      alert("Failed to download file.");
    }
  }

  async function sendMessage() {
    if ((!text.trim() && !attachment) || !selected || sending) return;
    setSending(true);
    let attachmentId: string | null = null;
    let attachmentFileName: string | null = null;

    // Upload file first if present
    if (attachment) {
      try {
        if (selected._isGeneral) {
          // General message attachment — no case
          const { file, uploadUrl } = await apiFetch<{ file: any; uploadUrl: string }>("/api/files/message-upload-url", {
            method: "POST",
            body: JSON.stringify({ fileName: attachment.name, contentType: attachment.type || "application/octet-stream", size: attachment.size }),
          });
          await fetch(uploadUrl, { method: "PUT", body: attachment, headers: { "content-type": attachment.type || "application/octet-stream" } });
          attachmentId = file._id;
          attachmentFileName = file.originalName;
        } else {
          // Case message attachment
          const { file, uploadUrl } = await apiFetch<{ file: any; uploadUrl: string }>("/api/files/upload-url", {
            method: "POST",
            body: JSON.stringify({ caseId: selected._id, fileName: attachment.name, contentType: attachment.type || "application/octet-stream", size: attachment.size }),
          });
          await fetch(uploadUrl, { method: "PUT", body: attachment, headers: { "content-type": attachment.type || "application/octet-stream" } });
          attachmentId = file._id;
          attachmentFileName = file.originalName;
        }
      } catch (uploadErr: any) {
        alert(uploadErr.message || "Failed to upload attachment.");
        setSending(false);
        return;
      }
    }

    const body = text.trim() || "";
    const optimistic = {
      _id: `temp-${Date.now()}`,
      body,
      sender: { _id: currentUser?.id, name: currentUser?.name, role: currentUser?.role },
      createdAt: new Date().toISOString(),
      _optimistic: true,
      attachment: attachmentId,
      attachmentName: attachmentFileName || attachment?.name || null,
    };
    setMessages(prev => [...prev, optimistic]);
    setText("");
    const fileToClear = attachment;
    setAttachment(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    try {
      const endpoint = selected._isGeneral
        ? "/api/messages/general"
        : `/api/messages/case/${selected._id}`;
      const payload: any = { body };
      if (selected._isGeneral) payload.recipientDentist = selected.dentistId;
      if (attachmentId) {
        payload.attachment = attachmentId;
        payload.attachmentName = attachmentFileName || fileToClear?.name;
      }
      const r = await apiFetch<any>(endpoint, { method: "POST", body: JSON.stringify(payload) });
      setMessages(prev => prev.map((m: any) => m._id === optimistic._id ? r.message : m));
      if (!selected._isGeneral) setCases(prev => prev.map((c: any) => c._id === selected._id ? { ...c, _lastMsg: r.message } : c));
    } catch {
      setMessages(prev => prev.filter((m: any) => m._id !== optimistic._id));
      setText(body);
      if (fileToClear) setAttachment(fileToClear);
    } finally { setSending(false); }
  }

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);

  const filtered = cases.filter((c: any) =>
    !search ||
    c.caseNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c.patientRef?.toLowerCase().includes(search.toLowerCase()) ||
    c.dentist?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 56px)" }}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users size={20} className="text-indigo-400" />
            Messages
            {totalUnread > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">{totalUnread} new</span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">All dentist conversations — reply on behalf of the lab team</p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 rounded-2xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.08)] bg-white border border-slate-100">

        {/* ── Sidebar ── */}
        <aside className="w-80 shrink-0 flex flex-col border-r border-slate-100">
          <div className="p-3 border-b border-slate-100">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-indigo-400 transition-colors">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by case, patient, dentist…"
                className="flex-1 bg-transparent outline-none text-xs text-slate-700 placeholder:text-slate-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* ── Direct / General messages ── */}
            {generalDentists.length > 0 && (
              <>
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Direct Messages</span>
                </div>
                {generalDentists.map(d => {
                  const key = `general_${d.id}`;
                  const isActive = selected?._id === key;
                  const hasUnread = (unread[key] || 0) > 0;
                  return (
                    <button key={key} onClick={() => selectGeneral(d)}
                      className="w-full text-left px-4 py-3.5 transition-colors border-b border-slate-50"
                      style={isActive ? { background: "rgba(99,102,241,0.06)", borderLeft: "3px solid #6366f1" } : { borderLeft: "3px solid transparent" }}>
                      <div className="flex items-center gap-3">
                        <Avatar name={d.name || "Dentist"} color="indigo" size={36} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold truncate ${isActive ? "text-indigo-600" : "text-slate-800"}`}>{d.name || "Dentist"}</span>
                            {hasUnread && <span className="ml-auto shrink-0 w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">{unread[key]}</span>}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate">{d.lastMsg?.body || "Direct message"}</div>
                        </div>
                        <div className="text-[9px] text-slate-400 shrink-0">{d.lastMsg ? formatTime(d.lastMsg.createdAt) : ""}</div>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Case Threads</span>
            </div>
            {filtered.length === 0 && (
              <div className="p-8 text-center">
                <MessageSquare size={28} className="mx-auto text-slate-200 mb-2" />
                <p className="text-xs text-slate-400">No cases found</p>
              </div>
            )}
            {filtered.map((c: any) => {
              const isActive = selected?._id === c._id;
              const hasUnread = (unread[c._id] || 0) > 0;
              const lastMsg = c._lastMsg;
              const dentistName = c.dentist?.name || "Unknown Dentist";
              return (
                <button key={c._id} onClick={() => selectCase(c)}
                  className={`w-full text-left px-4 py-3.5 transition-colors border-b border-slate-50`}
                  style={isActive
                    ? { background: "rgba(99,102,241,0.06)", borderLeft: "3px solid #6366f1" }
                    : { borderLeft: "3px solid transparent" }}>
                  <div className="flex items-start gap-3">
                    <Avatar name={dentistName} color="teal" size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold truncate ${isActive ? "text-indigo-600" : "text-slate-800"}`}>{dentistName}</span>
                        {hasUnread && (
                          <span className="ml-auto shrink-0 w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">
                            {unread[c._id]}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{c.caseNumber} · {c.patientRef}</div>
                      {lastMsg ? (
                        <div className={`text-[10px] truncate mt-0.5 ${hasUnread ? "text-slate-700 font-semibold" : "text-slate-400"}`}>
                          {lastMsg.sender?.role !== "dentist" ? "You: " : ""}
                          {lastMsg.attachmentName ? `📎 ${lastMsg.attachmentName}` : lastMsg.body}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-300 mt-0.5 italic">No messages yet</div>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-400 shrink-0 mt-0.5">
                      {formatTime(lastMsg?.createdAt || c.createdAt)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Chat area ── */}
        <div className="flex-1 flex flex-col min-w-0" style={{ background: "#f8fafc" }}>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.06)" }}>
                <MessageSquare size={36} strokeWidth={1.2} className="text-indigo-300" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-400 text-sm">Select a conversation</p>
                <p className="text-xs text-slate-300 mt-1">Choose a case thread from the left to respond</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center gap-3">
                <Avatar name={selected.dentist?.name || "Dentist"} color="teal" size={36} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 text-sm">{selected.dentist?.name || "Unknown Dentist"}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Circle size={7} className="text-emerald-400 fill-emerald-400" />
                    <span className="text-[10px] text-slate-400 font-mono">{selected.caseNumber}</span>
                    <span className="text-[10px] text-slate-400">· {selected.patientRef} · {selected.status}</span>
                  </div>
                </div>
                <a href={`/admin/cases`}
                  className="text-xs text-indigo-500 font-semibold hover:underline px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors">
                  View Cases
                </a>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
                {loadingMsgs ? (
                  <div className="space-y-3 pt-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                        <div className={`h-9 rounded-2xl bg-slate-200 animate-pulse ${i % 2 === 0 ? "w-48" : "w-36"}`} />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 pt-8">
                    <MessageSquare size={32} strokeWidth={1} className="text-slate-200" />
                    <p className="text-sm text-slate-400">No messages yet</p>
                    <p className="text-xs text-slate-300">The dentist hasn't sent any messages on this case</p>
                  </div>
                ) : (
                  <>
                    {messages.map((m: any, i: number) => {
                      const isDentist = m.sender?.role === "dentist";
                      const isMine = !isDentist;
                      const showAvatar = isDentist && (i === 0 || messages[i - 1]?.sender?._id !== m.sender?._id);
                      const showName = isDentist && showAvatar;
                      const isLastInGroup = isMine && (i === messages.length - 1 || messages[i + 1]?.sender?._id !== m.sender?._id);

                      return (
                        <div key={m._id}
                          className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"} ${i > 0 && messages[i - 1]?.sender?._id === m.sender?._id ? "mt-0.5" : "mt-3"}`}>
                          {isDentist && (
                            <div style={{ width: "28px", height: "28px", flexShrink: 0 }}>
                              {showAvatar && <Avatar name={m.sender?.name || "Dentist"} color="teal" size={28} />}
                            </div>
                          )}
                          <div className={`flex flex-col max-w-[68%] ${isMine ? "items-end" : "items-start"}`}>
                            {showName && (
                              <span className="text-[10px] text-slate-400 font-medium mb-1 px-1">{m.sender?.name}</span>
                            )}
                            <div className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word ${
                              isMine
                                ? `text-white rounded-2xl rounded-br-sm ${m._optimistic ? "opacity-60" : ""}`
                                : "bg-white text-slate-700 rounded-2xl rounded-bl-sm shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
                            }`}
                              style={isMine ? { background: "linear-gradient(135deg,#6366f1,#4f46e5)" } : {}}>
                              {m.body}
                              {(m.attachmentName || m.attachment) && (
                                <div className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-medium ${isMine ? "text-white/80" : "text-indigo-500"}`}>
                                  <Paperclip size={10} />
                                  {m.attachment ? (
                                    <button onClick={() => downloadAttachment(m.attachment)} className="underline text-left">
                                      {m.attachmentName || "Attachment"}
                                    </button>
                                  ) : (
                                    <span>{m.attachmentName}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? "flex-row-reverse" : ""}`}>
                              <span className="text-[10px] text-slate-400">
                                {new Date(m.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {isMine && isLastInGroup && (
                                <CheckCheck size={11} className={m._optimistic ? "text-slate-300" : "text-indigo-400"} />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="px-4 pb-4 pt-2 bg-white border-t border-slate-100">
                {attachment && (
                  <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <FileText size={13} className="text-indigo-500 shrink-0" />
                    <span className="text-xs text-slate-600 flex-1 truncate">{attachment.name}</span>
                    <span className="text-[10px] text-slate-400">{(attachment.size / 1024).toFixed(1)} KB</span>
                    <button onClick={() => setAttachment(null)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={13} /></button>
                  </div>
                )}
                <div className="flex gap-2 items-end rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-indigo-400 focus-within:bg-white transition-all">
                  <input ref={fileInputRef} type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) setAttachment(e.target.files[0]); e.target.value = ""; }} />
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-white transition-colors"
                    title="Attach file">
                    <Paperclip size={15} />
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={e => {
                      setText(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    rows={1}
                    placeholder={`Reply to ${selected.dentist?.name || selected._isGeneral ? "dentist" : "dentist"}… (Enter to send)`}
                    className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 resize-none py-1.5 px-2 leading-relaxed"
                    style={{ maxHeight: "120px" }}
                  />
                  <button onClick={sendMessage} disabled={(!text.trim() && !attachment) || sending}
                    className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-35 hover:scale-105 active:scale-95"
                    style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
                    <Send size={15} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 px-1">Replying as <strong>{currentUser?.name}</strong> · Dentist will be notified instantly</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
