import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { apiFetch, getCurrentUser, openRealtimeConnection, type AuthUser } from "@/lib/api";
import { logoUrl } from "@/lib/logo";
import { Send, CheckCheck, MessageSquare, Search, Circle, Paperclip, X, FileText } from "lucide-react";

export const Route = createFileRoute("/portal/messages")({
  component: PortalMessages,
});

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const ADMIN_CONTACT = {
  _id: "__admin__",
  _isAdmin: true,
  caseNumber: "General",
  patientRef: "Direct line to lab team",
  dentist: { name: "Prime Smile Lab Admin" },
  status: "online",
  createdAt: new Date().toISOString(),
};

function Avatar({ name, size = 9, admin = false }: { name: string; size?: number; admin?: boolean }) {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  return (
    <div className="rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 relative"
      style={{
        background: admin
          ? "linear-gradient(135deg,#1e293b,#0f172a)"
          : "linear-gradient(135deg,#0aabbd,#078a99)",
        width: `${size * 4}px`,
        height: `${size * 4}px`,
        fontSize: size < 8 ? "10px" : "12px",
      }}>
      {admin ? <img src={logoUrl} alt="Lab" className="w-full h-full object-contain rounded-full brightness-0 invert p-0.5" /> : initials}
      {admin && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
      )}
    </div>
  );
}

function PortalMessages() {
  const [cases, setCases] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(ADMIN_CONTACT);
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
    apiFetch<any>("/api/cases?limit=100").then(r => setCases(r.items || []));
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
          setCases(prev => prev.map(c => c._id === event.caseId ? { ...c, _lastMsg: msg } : c));
        }
      }
      if (event.type === "general:new_message") {
        const msg = event.message;
        if (selectedRef.current?._isAdmin) {
          setMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, msg]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
        } else {
          setUnread(prev => ({ ...prev, __admin__: (prev.__admin__ || 0) + 1 }));
        }
      }
    });
    return () => ws?.close?.();
  }, []);

  async function selectCase(c: any) {
    setSelected(c);
    setAttachment(null);
    if (c._isAdmin) {
      setUnread(prev => { const n = { ...prev }; delete n.__admin__; return n; });
      setLoadingMsgs(true);
      try {
        const r = await apiFetch<any>("/api/messages/general");
        setMessages(r.messages || []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }), 80);
      } finally { setLoadingMsgs(false); }
      return;
    }
    setUnread(prev => { const n = { ...prev }; delete n[c._id]; return n; });
    setLoadingMsgs(true);
    try {
      const r = await apiFetch<any>(`/api/messages/case/${c._id}`);
      setMessages(r.messages || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }), 80);
    } finally { setLoadingMsgs(false); }
  }

  async function sendMessage() {
    if ((!text.trim() && !attachment) || !selected || sending) return;
    setSending(true);
    const body = text.trim() || (attachment ? attachment.name : "");
    const optimistic = {
      _id: `temp-${Date.now()}`,
      body,
      sender: { _id: currentUser?.id, name: currentUser?.name, role: currentUser?.role },
      createdAt: new Date().toISOString(),
      _optimistic: true,
      attachmentName: attachment?.name || null,
    };
    setMessages(prev => [...prev, optimistic]);
    setText("");
    setAttachment(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    try {
      const endpoint = selected._isAdmin ? "/api/messages/general" : `/api/messages/case/${selected._id}`;
      const r = await apiFetch<any>(endpoint, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setMessages(prev => prev.map(m => m._id === optimistic._id ? r.message : m));
      if (!selected._isAdmin) setCases(prev => prev.map(c => c._id === selected._id ? { ...c, _lastMsg: r.message } : c));
    } catch {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      setText(body);
    } finally { setSending(false); }
  }

  const filtered = cases.filter(c =>
    !search || c.caseNumber?.toLowerCase().includes(search.toLowerCase()) || c.patientRef?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 80px)" }}>
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "#0aabbd" }}>Portal</div>
        <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
        <p className="text-sm text-slate-400 mt-1">Chat with the Prime Smile lab team about your cases.</p>
      </div>

      <div className="flex flex-1 min-h-0 rounded-2xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.08)] bg-white border border-slate-100">

        {/* ── Sidebar ── */}
        <aside className="w-72 shrink-0 flex flex-col border-r border-slate-100">
          {/* Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-teal transition-colors">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search cases…"
                className="flex-1 bg-transparent outline-none text-xs text-slate-700 placeholder:text-slate-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* ── Pinned: Prime Smile Lab Admin ── */}
            {(() => {
              const isActive = selected?._id === ADMIN_CONTACT._id;
              const adminUnread = unread.__admin__ || 0;
              return (
                <button onClick={() => selectCase(ADMIN_CONTACT)}
                  className="w-full text-left px-4 py-3.5 border-b-2 border-slate-100 transition-colors"
                  style={isActive
                    ? { background: "linear-gradient(90deg,rgba(10,171,189,0.08),rgba(10,171,189,0.03))", borderLeft: "3px solid #0aabbd" }
                    : { borderLeft: "3px solid transparent", background: "rgba(248,250,252,0.6)" }}>
                  <div className="flex items-center gap-3">
                    <Avatar name="Prime Smile Lab Admin" size={9} admin />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate ${isActive ? "text-teal" : "text-slate-800"}`}>
                          Prime Smile Lab Admin
                        </span>
                        <span className="shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 uppercase tracking-wide">Online</span>
                        {adminUnread > 0 && (
                          <span className="ml-auto shrink-0 w-4 h-4 rounded-full bg-teal text-white text-[9px] font-bold flex items-center justify-center">{adminUnread}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">Direct line to your lab team</div>
                    </div>
                  </div>
                </button>
              );
            })()}

            {/* ── Cases section ── */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Case Threads</span>
            </div>

            {filtered.length === 0 && (
              <div className="p-6 text-center">
                <MessageSquare size={24} className="mx-auto text-slate-200 mb-2" />
                <p className="text-xs text-slate-400">No cases yet</p>
              </div>
            )}
            {filtered.map(c => {
              const isActive = selected?._id === c._id;
              const hasUnread = (unread[c._id] || 0) > 0;
              const lastMsg = c._lastMsg;
              return (
                <button key={c._id} onClick={() => selectCase(c)}
                  className="w-full text-left px-4 py-3.5 transition-colors border-b border-slate-50 hover:bg-slate-50"
                  style={isActive ? { background: "rgba(10,171,189,0.06)", borderLeft: "3px solid #0aabbd" } : { borderLeft: "3px solid transparent" }}>
                  <div className="flex items-start gap-3">
                    <Avatar name={c.dentist?.name || "Me"} size={9} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono text-xs font-bold truncate ${isActive ? "text-teal" : "text-slate-800"}`}>{c.caseNumber}</span>
                        {hasUnread && (
                          <span className="ml-auto shrink-0 w-4 h-4 rounded-full bg-teal text-white text-[9px] font-bold flex items-center justify-center">
                            {unread[c._id]}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{c.patientRef}</div>
                      {lastMsg ? (
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">{lastMsg.body}</div>
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
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-300">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,rgba(10,171,189,0.08),rgba(10,171,189,0.04))" }}>
                <MessageSquare size={36} strokeWidth={1.2} className="text-teal/30" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-400 text-sm">Select a conversation</p>
                <p className="text-xs text-slate-300 mt-1">Choose the admin thread or a case from the left</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center gap-3">
                <Avatar name={selected.dentist?.name || "Lab"} size={9} admin={!!selected._isAdmin} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 text-sm">
                    {selected._isAdmin ? "Prime Smile Lab Admin" : selected.caseNumber}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Circle size={7} className="text-emerald-400 fill-emerald-400" />
                    <span className="text-[10px] text-slate-400">
                      {selected._isAdmin ? "Direct line to your lab team · Always available" : `${selected.patientRef} · ${selected.status}`}
                    </span>
                  </div>
                </div>
                {!selected._isAdmin && (
                  <Link to="/portal/cases/$id" params={{ id: selected._id }}
                    className="text-xs text-teal font-semibold hover:underline px-3 py-1.5 rounded-lg bg-teal/5 hover:bg-teal/10 transition-colors">
                    View Case
                  </Link>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
                {loadingMsgs ? (
                  <div className="space-y-3 pt-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                        <div className={`h-9 rounded-2xl bg-slate-200 animate-pulse ${i % 2 === 0 ? "w-48" : "w-36"}`} />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    {selected._isAdmin ? (
                      <>
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md">
                          <img src={logoUrl} alt="Prime Smiles" className="w-full h-full object-contain p-2" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-slate-700 text-sm">Prime Smile Lab Admin</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-xs">Have a question about your case or account? Send us a message and our team will reply shortly.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <MessageSquare size={32} strokeWidth={1} className="text-slate-200" />
                        <p className="text-sm text-slate-400">No messages yet</p>
                        <p className="text-xs text-slate-300">Send a message to start the conversation with our lab team</p>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {messages.map((m, i) => {
                      const isMine = m.sender?._id === currentUser?.id || m.sender?._id === currentUser?._id;
                      const showAvatar = !isMine && (i === 0 || messages[i - 1]?.sender?._id !== m.sender?._id);
                      const showName = !isMine && showAvatar;
                      const isLastInGroup = isMine && (i === messages.length - 1 || messages[i + 1]?.sender?._id !== m.sender?._id);

                      return (
                        <div key={m._id} className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"} ${i > 0 && messages[i - 1]?.sender?._id === m.sender?._id ? "mt-0.5" : "mt-3"}`}>
                          {!isMine && (
                            <div className="w-7 h-7 shrink-0">
                              {showAvatar && <Avatar name={m.sender?.name || "Lab"} size={7} />}
                            </div>
                          )}
                          <div className={`flex flex-col max-w-[68%] ${isMine ? "items-end" : "items-start"}`}>
                            {showName && (
                              <span className="text-[10px] text-slate-400 font-medium mb-1 px-1">{m.sender?.name || "Lab Team"}</span>
                            )}
                            <div className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word ${
                              isMine
                                ? `text-white rounded-2xl rounded-br-sm ${m._optimistic ? "opacity-60" : ""}`
                                : "bg-white text-slate-700 rounded-2xl rounded-bl-sm shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
                            }`}
                              style={isMine ? { background: "linear-gradient(135deg,#0aabbd,#078a99)" } : {}}>
                              {m.body}
                              {(m.attachmentName || m.attachment) && (
                                <div className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-medium ${isMine ? "text-white/80" : "text-teal"}`}>
                                  <Paperclip size={10} />
                                  {m.attachment
                                    ? <a href={m.attachment} target="_blank" rel="noreferrer" className="underline">{m.attachmentName || "Attachment"}</a>
                                    : <span>{m.attachmentName}</span>}
                                </div>
                              )}
                            </div>
                            <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? "flex-row-reverse" : ""}`}>
                              <span className="text-[10px] text-slate-400">
                                {new Date(m.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {isMine && isLastInGroup && (
                                <CheckCheck size={11} className={m._optimistic ? "text-slate-300" : "text-teal"} />
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
                  <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-teal/5 border border-teal/20 rounded-xl">
                    <FileText size={13} className="text-teal shrink-0" />
                    <span className="text-xs text-slate-600 flex-1 truncate">{attachment.name}</span>
                    <span className="text-[10px] text-slate-400">{(attachment.size / 1024).toFixed(1)} KB</span>
                    <button onClick={() => setAttachment(null)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={13} /></button>
                  </div>
                )}
                <div className="flex gap-2 items-end rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-teal focus-within:bg-white transition-all">
                  <input ref={fileInputRef} type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) setAttachment(e.target.files[0]); e.target.value = ""; }} />
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-teal hover:bg-white transition-colors"
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
                    placeholder={selected._isAdmin ? "Message Prime Smile Lab Admin…" : "Message the lab team… (Enter to send)"}
                    className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 resize-none py-1.5 px-2 leading-relaxed"
                    style={{ maxHeight: "120px" }}
                  />
                  <button onClick={sendMessage} disabled={(!text.trim() && !attachment) || sending}
                    className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-35 hover:scale-105 active:scale-95"
                    style={{ background: "linear-gradient(135deg,#0aabbd,#078a99)" }}>
                    <Send size={15} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 px-1">Shift+Enter for new line · Messages are sent to the Prime Smile lab team</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
