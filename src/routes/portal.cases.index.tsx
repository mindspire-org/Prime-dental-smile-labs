import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Search, ChevronRight, Clock, CheckCircle2, Paperclip } from "lucide-react";

export const Route = createFileRoute("/portal/cases/")({
  component: PortalCasesList,
});

const STATUS_CHIP: Record<string, { bg: string; text: string }> = {
  "Submitted":            { bg: "bg-cyan-50",   text: "text-cyan-700" },
  "Awaiting Information": { bg: "bg-amber-50",  text: "text-amber-700" },
  "In Production":        { bg: "bg-blue-50",   text: "text-blue-700" },
  "Design Stage":         { bg: "bg-violet-50", text: "text-violet-700" },
  "Quality Control":      { bg: "bg-orange-50", text: "text-orange-700" },
  "Dispatched":           { bg: "bg-green-50",  text: "text-green-700" },
  "Completed":            { bg: "bg-slate-100", text: "text-slate-600" },
};
const sc = (s: string) => STATUS_CHIP[s] ?? { bg: "bg-slate-100", text: "text-slate-600" };

const STATUSES = ["", "Submitted", "File Review", "Awaiting Information", "Design Stage",
  "Dentist Approval", "In Production", "Finishing", "Quality Control",
  "Ready for Dispatch", "Dispatched", "Completed"];

function PortalCasesList() {
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  async function load() {
    const p = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) p.set("search", search);
    if (statusFilter) p.set("status", statusFilter);
    setData(await apiFetch<any>(`/api/cases?${p}`));
  }

  useEffect(() => { load(); }, [page, statusFilter]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "#0aabbd" }}>Portal</div>
        <h1 className="text-2xl font-bold text-slate-800">My Cases</h1>
        <p className="text-sm text-slate-400 mt-1">Track all your submitted dental cases.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48 flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-teal transition-colors">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search case number or patient…"
            className="bg-transparent outline-none text-sm text-slate-700 flex-1 placeholder:text-slate-400" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none focus:border-teal">
          {STATUSES.map(s => <option key={s} value={s}>{s || "All Statuses"}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{data?.total ?? 0} cases</span>
      </div>

      {/* Cases list */}
      <div className="space-y-3">
        {!data ? (
          [...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)
        ) : data.items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
            <CheckCircle2 size={40} className="mx-auto text-slate-200 mb-3" />
            <div className="text-slate-400 text-sm">No cases found</div>
          </div>
        ) : data.items.map((c: any) => {
          const chip = sc(c.status);
          return (
            <Link key={c._id} to="/portal/cases/$id" params={{ id: c._id }}
              className="block bg-white rounded-2xl px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(10,171,189,0.12)] transition-all border border-transparent hover:border-teal/20 group">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-slate-800 text-sm">{c.caseNumber}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${chip.bg} ${chip.text}`}>{c.status}</span>
                    {c.urgency !== "Standard" && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.urgency === "Urgent" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>{c.urgency}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                    <span className="font-medium text-slate-600">{c.patientRef}</span>
                    <span>·</span>
                    <span>{c.services?.join(", ") || "—"}</span>
                    <span>·</span>
                    <Clock size={10} className="inline" />
                    <span>{new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                    {c.files?.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal bg-teal/8 px-2 py-0.5 rounded-full">
                        <Paperclip size={9} /> {c.files.length} file{c.files.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-teal transition-colors shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="text-sm font-medium text-slate-500 disabled:opacity-40 hover:text-teal transition-colors">← Previous</button>
          <span className="text-xs text-slate-400">Page {page} of {data.pages}</span>
          <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
            className="text-sm font-medium text-slate-500 disabled:opacity-40 hover:text-teal transition-colors">Next →</button>
        </div>
      )}
    </div>
  );
}
