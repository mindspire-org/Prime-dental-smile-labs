import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch, getCurrentUser } from "@/lib/api";
import { Mail, Phone, Building2, Clock, CheckCircle2, Archive, Reply, Inbox } from "lucide-react";

export const Route = createFileRoute("/admin/contact")({
  beforeLoad: () => {
    const user = getCurrentUser();
    if (!user || user.role !== "admin") throw redirect({ to: "/admin/cases" as never });
  },
  component: ContactEnquiriesPage,
});

type Enquiry = {
  _id: string;
  clinicName: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  source?: string;
  createdAt: string;
};

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
];

const STATUS_STYLE: Record<string, string> = {
  new: "bg-amber-50 text-amber-700 border-amber-200",
  read: "bg-blue-50 text-blue-700 border-blue-200",
  replied: "bg-emerald-50 text-emerald-700 border-emerald-200",
  archived: "bg-slate-100 text-slate-500 border-slate-200",
};

function ContactEnquiriesPage() {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    try {
      const qs = status ? `?status=${status}` : "";
      const r = await apiFetch<{ items: Enquiry[] }>(`/api/contact${qs}`);
      setItems(r.items || []);
    } catch (e: any) {
      setMsg(e.message || "Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  async function setEnquiryStatus(id: string, next: Enquiry["status"]) {
    // Optimistic update
    setItems(list => list.map(e => (e._id === id ? { ...e, status: next } : e)));
    try {
      await apiFetch(`/api/contact/${id}/status`, { method: "PUT", body: JSON.stringify({ status: next }) });
    } catch (e: any) {
      setMsg(e.message || "Failed to update status");
      load();
    }
  }

  const newCount = items.filter(e => e.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Inbox size={22} className="text-indigo-500" /> Contact Enquiries
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Submissions received from the website contact form.</p>
        </div>
        {newCount > 0 && (
          <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full">{newCount} new</span>
        )}
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map(t => (
          <button key={t.value} onClick={() => setStatus(t.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
              status === t.value ? "bg-indigo-500 text-white border-indigo-500" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {msg && <div className="text-xs text-red-600">{msg}</div>}

      {loading ? (
        <div className="text-center text-slate-400 text-sm py-12">Loading enquiries…</div>
      ) : items.length === 0 ? (
        <div className="text-center text-slate-400 text-sm py-12 bg-white rounded-2xl border border-slate-100">
          No enquiries{status ? ` with status "${status}"` : ""} yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(e => (
            <div key={e._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-800">{e.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[e.status] || ""}`}>{e.status}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 flex-wrap">
                    <span className="inline-flex items-center gap-1"><Building2 size={12} /> {e.clinicName}</span>
                    <a href={`mailto:${e.email}`} className="inline-flex items-center gap-1 hover:text-indigo-600"><Mail size={12} /> {e.email}</a>
                    <a href={`tel:${e.phone}`} className="inline-flex items-center gap-1 hover:text-indigo-600"><Phone size={12} /> {e.phone}</a>
                    <span className="inline-flex items-center gap-1"><Clock size={12} /> {new Date(e.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 mt-3 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl p-3 border border-slate-100">{e.message}</p>

              <div className="flex flex-wrap gap-2 mt-3">
                <a href={`mailto:${e.email}?subject=Re: Your enquiry to Prime Smile Dental Laboratory`}
                  onClick={() => setEnquiryStatus(e._id, "replied")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white bg-indigo-500 hover:bg-indigo-600">
                  <Reply size={12} /> Reply by Email
                </a>
                {e.status !== "read" && e.status !== "replied" && (
                  <button onClick={() => setEnquiryStatus(e._id, "read")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                    <CheckCircle2 size={12} /> Mark Read
                  </button>
                )}
                {e.status !== "archived" && (
                  <button onClick={() => setEnquiryStatus(e._id, "archived")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                    <Archive size={12} /> Archive
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
