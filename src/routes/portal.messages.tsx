import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { apiFetch, getCurrentUser, openRealtimeConnection, type AuthUser } from "@/lib/api";
import { Send, Paperclip, CheckCheck, ChevronLeft, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/portal/messages")({
  component: PortalMessages,
});

function PortalMessages() {
  const [cases, setCases] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const wsRef = useRef<any>(null);
  useEffect(() => { setCurrentUser(getCurrentUser()); }, []);

  // Load cases with recent messages
  useEffect(() => {
    apiFetch<any>("/api/cases?limit=50").then(r => setCases(r.items || []));
  }, []);

  // WebSocket for real-time
  useEffect(() => {
    wsRef.current = openRealtimeConnection((event) => {
      if (event.type === "case:new_message" && selected && event.caseId === selected._id) {
        setMessages(prev => [...prev, event.message]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
      }
    });
    return () => wsRef.current?.close?.();
  }, [selected]);

  async function selectCase(c: any) {
    setSelected(c);
    setLoadingMsgs(true);
    try {
      const r = await apiFetch<any>(`/api/messages/case/${c._id}`);
      setMessages(r.messages || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }), 80);
    } finally { setLoadingMsgs(false); }
  }

  async function sendMessage() {
    if (!message.trim() || !selected || sending) return;
    setSending(true);
    const optimistic = {
      _id: `temp-${Date.now()}`,
      body: message.trim(),
      sender: { _id: currentUser?.id, name: currentUser?.name, role: currentUser?.role },
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);
    setMessage("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    try {
      const r = await apiFetch<any>(`/api/messages/case/${selected._id}`, {
        method: "POST",
        body: JSON.stringify({ body: optimistic.body }),
      });
      // Replace optimistic with real message
      setMessages(prev => prev.map(m => m._id === optimistic._id ? r.message : m));
    } catch {
      // Remove optimistic on failure
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      setMessage(optimistic.body);
    } finally { setSending(false); }
  }

  return (
    <div className="h-[calc(100vh-120px)] flex rounded-2xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.07)] bg-white">
      {/* Case list sidebar */}
      <aside className="w-72 shrink-0 border-r border-slate-100 flex flex-col">
        <div className="px-4 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-base">Messages</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Select a case to view the thread</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {cases.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-sm">No cases found</div>
          )}
          {cases.map(c => (
            <button key={c._id} onClick={() => selectCase(c)}
              className={`w-full text-left px-4 py-3.5 hover:bg-slate-50 transition-colors ${selected?._id === c._id ? "bg-cyan-50" : ""}`}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono font-bold text-slate-800 text-xs">{c.caseNumber}</span>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ml-auto ${
                  c.status === "Completed" ? "bg-slate-100 text-slate-500" :
                  c.status === "Awaiting Information" ? "bg-amber-50 text-amber-600" :
                  "bg-cyan-50 text-teal"}`}>{c.status}</span>
              </div>
              <div className="text-xs text-slate-500 truncate">{c.patientRef}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{new Date(c.createdAt).toLocaleDateString("en-GB")}</div>
            </button>
          ))}
        </div>
      </aside>

      {/* Message thread */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-3">
            <MessageSquare size={48} strokeWidth={1} />
            <div className="text-sm text-slate-400">Select a case to start messaging</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div>
                <div className="font-bold text-slate-800 text-sm font-mono">{selected.caseNumber}</div>
                <div className="text-[11px] text-slate-400">{selected.patientRef} · {selected.status}</div>
              </div>
              <Link to="/portal/cases/$id" params={{ id: selected._id }}
                className="ml-auto flex items-center gap-1 text-xs text-teal hover:underline font-medium">
                <ChevronLeft size={12} /> View Case
              </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {loadingMsgs ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className={`h-10 w-48 rounded-2xl bg-slate-100 animate-pulse ${i % 2 === 0 ? "ml-auto" : ""}`} />
                ))
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2 pt-10">
                  <MessageSquare size={36} strokeWidth={1} />
                  <div className="text-sm text-slate-400">No messages yet. Start the conversation.</div>
                </div>
              ) : messages.map(m => {
                const isMine = m.sender?._id === currentUser?.id || m.sender?.role === "dentist";
                return (
                  <div key={m._id} className={`flex flex-col max-w-[75%] gap-1 ${isMine ? "ml-auto items-end" : "items-start"}`}>
                    {!isMine && <span className="text-[10px] text-slate-400 px-1">{m.sender?.name || "Lab"}</span>}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMine ? "text-white rounded-br-sm" : "bg-slate-100 text-slate-700 rounded-bl-sm"
                    } ${m._optimistic ? "opacity-70" : ""}`}
                      style={isMine ? { background: "linear-gradient(135deg,#0aabbd,#078a99)" } : {}}>
                      {m.body}
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] text-slate-400 px-1 ${isMine ? "flex-row-reverse" : ""}`}>
                      <span>{new Date(m.createdAt).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</span>
                      {isMine && <CheckCheck size={10} className={m._optimistic ? "text-slate-300" : "text-teal"} />}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-slate-100">
              <div className="flex gap-2 items-end bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-teal transition-colors">
                <button className="p-2 rounded-xl text-slate-400 hover:text-teal hover:bg-white transition-colors shrink-0">
                  <Paperclip size={15} />
                </button>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  rows={1}
                  placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
                  className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 resize-none py-1.5 px-1 leading-relaxed"
                />
                <button onClick={sendMessage} disabled={!message.trim() || sending}
                  className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#0aabbd,#078a99)" }}>
                  <Send size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
