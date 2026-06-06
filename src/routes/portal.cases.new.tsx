import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { apiFetch, getCurrentUser } from "@/lib/api";
import {
  CheckCircle2, FileText, User, Calendar, Package,
  Wrench, Truck, FileCheck, Zap, Upload, Sparkles, Info, ArrowLeft,
} from "lucide-react";
import { ToothChart, type ToothRole } from "@/components/site/ToothChart";
import { ModernDatePicker } from "@/components/site/ModernDatePicker";
import { UploadProgressModal, type UploadFile } from "@/components/site/UploadProgressModal";
import { formatBytes } from "@/lib/utils";

export const Route = createFileRoute("/portal/cases/new")({
  component: NewCasePage,
});

const SERVICES = [
  { name: "Crown",             category: "Restorative", popular: true  },
  { name: "Bridge",            category: "Restorative", popular: true  },
  { name: "Veneer",            category: "Cosmetic",    popular: false },
  { name: "Inlay/Onlay",       category: "Restorative", popular: false },
  { name: "Implant Crown",     category: "Implant",     popular: true  },
  { name: "Custom Abutment",   category: "Implant",     popular: false },
  { name: "Implant Bar",       category: "Implant",     popular: false },
  { name: "Full Denture",      category: "Removable",   popular: false },
  { name: "Partial Denture",   category: "Removable",   popular: false },
  { name: "Framework (Co-Cr)", category: "Framework",   popular: false },
  { name: "Night Guard",       category: "Appliance",   popular: false },
  { name: "Splint",            category: "Appliance",   popular: false },
  { name: "Surgical Guide",    category: "Digital",     popular: false },
  { name: "Design Only",       category: "Digital",     popular: false },
];

const MATERIALS = [
  { name: "Zirconia (Multilayer)",      type: "Ceramic",       premium: true  },
  { name: "Zirconia (Monolithic)",      type: "Ceramic",       premium: true  },
  { name: "Lithium Disilicate (e.max)", type: "Ceramic",       premium: true  },
  { name: "PFM",                        type: "Metal-Ceramic", premium: false },
  { name: "Cobalt-Chrome",              type: "Metal",         premium: false },
  { name: "Titanium",                   type: "Metal",         premium: false },
  { name: "PMMA (Temporary)",           type: "Temporary",     premium: false },
  { name: "Acrylic",                    type: "Acrylic",       premium: false },
  { name: "Flexible Nylon",             type: "Flexible",      premium: false },
];

const inp = "w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white focus:border-teal focus:ring-2 focus:ring-teal/15 outline-none transition-all text-sm placeholder:text-slate-400";

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
      <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-teal" />
      </div>
      <div>
        <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

function Field({ label, required, tooltip, half, children }: {
  label: string; required?: boolean; tooltip?: string; half?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={half ? "col-span-1" : ""}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">{label}</span>
        {required && <span className="text-red-400 text-xs leading-none">*</span>}
        {tooltip && (
          <div className="relative group/tip">
            <Info size={14} className="text-teal cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover/tip:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-lg">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

type ClinicInfo = { name?: string; address?: string; phone?: string; email?: string; city?: string; country?: string };

function NewCasePage() {
  const navigate = useNavigate();
  const sessionUser = getCurrentUser();

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<any>(null);
  const [error, setError] = useState("");

  const [clinicForm, setClinicForm] = useState({
    dentistName: sessionUser?.name || "",
    email: sessionUser?.email || "",
    clinicName: "",
    gdcNumber: "",
    phone: "",
    address: "",
    country: "United Kingdom",
    preferredContact: "Email",
  });

  const [patientForm, setPatientForm] = useState({
    patientRef: "",
    clinicReference: "",
    patientGender: "Female",
    patientAge: "",
    requestedCompletion: "",
    urgency: "Standard",
    notes: "",
  });

  const [services, setServices] = useState<string[]>([]);
  const [teeth, setTeeth] = useState<Record<number, ToothRole>>({});
  const [material, setMaterial] = useState("");
  const [shade, setShade] = useState({ system: "VITA Classical", body: "", cervical: "", incisal: "" });
  const [implant, setImplant] = useState({ brand: "", system: "", platform: "", connection: "Internal", scanbody: "", retention: "Screw-retained", notes: "" });
  const [shipping, setShipping] = useState({ method: "DHL Express (1-2 days)", returnAddress: "Same as clinic address", notes: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [drag, setDrag] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadFile[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadPhase, setUploadPhase] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const xhrRefs = useRef<XMLHttpRequest[]>([]);
  const [decl, setDecl] = useState({ a: false, b: false, c: false });

  useEffect(() => {
    apiFetch<any>("/api/auth/me").then((r) => {
      const u = r.user;
      const c: ClinicInfo = typeof u.clinic === "object" ? u.clinic : {};
      setClinicForm((prev) => ({
        ...prev,
        dentistName: u.name || prev.dentistName,
        email: u.email || prev.email,
        gdcNumber: u.gdcNumber || prev.gdcNumber,
        phone: u.phone || prev.phone,
        clinicName: c.name || prev.clinicName,
        address: c.address || (c.city ? `${c.city}, ${c.country || ""}` : prev.address),
        country: c.country || prev.country,
      }));
    }).catch(() => {});
  }, []);

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const MAX_FILE_SIZE = 250 * 1024 * 1024; // 250 MB per file
  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    const tooLarge = incoming.find((f) => f.size > MAX_FILE_SIZE);
    if (tooLarge) {
      setError(`File "${tooLarge.name}" exceeds the ${formatBytes(MAX_FILE_SIZE)} limit.`);
      return;
    }
    setFiles((f) => [...f, ...incoming]);
  };

  async function handleSubmit() {
    if (!patientForm.patientRef.trim()) { setError("Patient Reference is required."); return; }
    if (!patientForm.requestedCompletion) { setError("Requested Completion Date is required."); return; }
    if (!decl.a || !decl.b || !decl.c) { setError("Please confirm all three declarations."); return; }
    setSubmitting(true);
    setError("");
    xhrRefs.current = [];

    // Show modal immediately so user knows something is happening
    if (files.length > 0) {
      const progressInit: UploadFile[] = files.map((f) => ({
        name: f.name,
        size: f.size,
        progress: 0,
        status: "pending" as const,
      }));
      setUploadProgress(progressInit);
      setUploadPhase("Creating case…");
      setShowUploadModal(true);
      setIsUploading(true);
    }

    try {
      const result = await apiFetch<any>("/api/cases", {
        method: "POST",
        body: JSON.stringify({
          patientRef: patientForm.patientRef,
          clinicReference: patientForm.clinicReference || undefined,
          patientGender: patientForm.patientGender || undefined,
          patientAge: patientForm.patientAge ? Number(patientForm.patientAge) : undefined,
          services,
          teeth: Object.fromEntries(Object.entries(teeth).map(([k, v]) => [String(k), v])),
          material: material || undefined,
          shade: shade.body || shade.cervical || shade.incisal ? shade : undefined,
          implant: implant.brand ? implant : undefined,
          shipping: { method: shipping.method, address: shipping.returnAddress, instructions: shipping.notes },
          urgency: patientForm.urgency as "Standard" | "Express" | "Urgent",
          requestedCompletion: patientForm.requestedCompletion || undefined,
          notes: patientForm.notes || undefined,
        }),
      });

      // Upload all attached files to the newly created case with progress tracking
      const caseId = result.case._id;
      if (files.length > 0 && caseId) {
        setUploadPhase("Uploading files…");

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setUploadProgress((prev) =>
            prev.map((p, idx) => (idx === i ? { ...p, status: "uploading" as const } : p))
          );
          try {
            const { uploadUrl } = await apiFetch<{ uploadUrl: string }>("/api/files/upload-url", {
              method: "POST",
              body: JSON.stringify({ caseId, fileName: file.name, contentType: file.type || "application/octet-stream", size: file.size }),
            });

            // Upload with XMLHttpRequest for progress tracking (no timeout for large files)
            await new Promise<void>((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhrRefs.current.push(xhr);
              xhr.timeout = 0; // Never abort large uploads
              xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable) {
                  const pct = Math.round((event.loaded / event.total) * 100);
                  setUploadProgress((prev) =>
                    prev.map((p, idx) => (idx === i ? { ...p, progress: pct } : p))
                  );
                }
              });
              xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  setUploadProgress((prev) =>
                    prev.map((p, idx) => (idx === i ? { ...p, progress: 100, status: "done" as const } : p))
                  );
                  resolve();
                } else {
                  reject(new Error(`Upload failed: ${xhr.status}`));
                }
              });
              xhr.addEventListener("error", () => reject(new Error("Network error")));
              xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));
              xhr.open("PUT", uploadUrl);
              xhr.setRequestHeader("content-type", file.type || "application/octet-stream");
              xhr.send(file);
            });
          } catch (uploadErr: any) {
            console.error("File upload failed:", uploadErr);
            setUploadProgress((prev) =>
              prev.map((p, idx) => (idx === i ? { ...p, status: "error" as const } : p))
            );
            // Continue with remaining files instead of breaking everything
          }
        }

        setUploadPhase("All files uploaded!");
        // Let user see "complete" for a moment before hiding
        await new Promise((r) => setTimeout(r, 1500));
      }

      setShowUploadModal(false);
      setIsUploading(false);
      setSubmitting(false);
      setDone(result.case);
    } catch (e: any) {
      setError(e.message || "Submission failed. Please try again.");
      setShowUploadModal(false);
      setIsUploading(false);
      setSubmitting(false);
      // Abort any in-flight uploads
      xhrRefs.current.forEach((xhr) => { try { xhr.abort(); } catch {} });
    }
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto mt-8">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-56 h-56 bg-teal/5 rounded-full -translate-y-28 translate-x-28 pointer-events-none" />
          <div className="w-20 h-20 mx-auto rounded-full bg-teal/10 flex items-center justify-center mb-6">
            <CheckCircle2 size={40} className="text-teal" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Case Submitted!</h1>
          <p className="text-slate-500 text-sm mb-6">Your case has been received and is being processed by our lab team.</p>
          <div className="bg-teal/5 border border-teal/20 rounded-2xl p-5 mb-8">
            <div className="text-[10px] text-teal font-bold uppercase tracking-wider mb-1">Case Reference</div>
            <div className="text-3xl font-mono font-bold text-slate-800">{done.caseNumber}</div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate({ to: "/portal/cases" })}
              className="flex-1 px-5 py-3 rounded-xl bg-teal text-white font-semibold text-sm hover:bg-teal/90 transition-colors">
              View My Cases
            </button>
            <button onClick={() => {
              setDone(null); setServices([]); setTeeth({}); setMaterial("");
              setDecl({ a: false, b: false, c: false });
              setPatientForm(p => ({ ...p, patientRef: "", clinicReference: "", notes: "", requestedCompletion: "" }));
            }}
              className="flex-1 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "#0aabbd" }}>Portal</div>
          <h1 className="text-2xl font-bold text-slate-800">New Case Submission</h1>
          <p className="text-sm text-slate-400 mt-1">Complete all sections below — required fields are marked <span className="text-red-400">*</span></p>
        </div>
        <button onClick={() => navigate({ to: "/portal/cases" })}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mt-1">
          <ArrowLeft size={14} /> Back to Cases
        </button>
      </div>

      {/* ── Section 1: Dentist / Clinic ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6">
        <SectionHeader icon={User} title="Dentist & Clinic Details" subtitle="Pre-filled from your profile — edit if needed" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Dentist Name" required>
            <input className={inp} value={clinicForm.dentistName} onChange={e => setClinicForm(f => ({ ...f, dentistName: e.target.value }))} />
          </Field>
          <Field label="Email">
            <input type="email" className={inp} value={clinicForm.email} readOnly style={{ background: "#f8fafc", color: "#94a3b8" }} />
          </Field>
          <Field label="Clinic / Practice Name" required>
            <input className={inp} value={clinicForm.clinicName} onChange={e => setClinicForm(f => ({ ...f, clinicName: e.target.value }))} placeholder="Your practice name" />
          </Field>
          <Field label="GDC Number" tooltip="General Dental Council registration number">
            <input className={inp} value={clinicForm.gdcNumber} onChange={e => setClinicForm(f => ({ ...f, gdcNumber: e.target.value }))} placeholder="123456" />
          </Field>
          <Field label="Phone / WhatsApp" required>
            <input className={inp} value={clinicForm.phone} onChange={e => setClinicForm(f => ({ ...f, phone: e.target.value }))} placeholder="+44 20 1234 5678" />
          </Field>
          <Field label="Country">
            <select className={inp} value={clinicForm.country} onChange={e => setClinicForm(f => ({ ...f, country: e.target.value }))}>
              <option>United Kingdom</option><option>Cyprus</option><option>Other</option>
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="Clinic Address" tooltip="Used for return delivery">
              <input className={inp} value={clinicForm.address} onChange={e => setClinicForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Dental Street, London, E1 1AA" />
            </Field>
          </div>
          <Field label="Preferred Contact Method">
            <select className={inp} value={clinicForm.preferredContact} onChange={e => setClinicForm(f => ({ ...f, preferredContact: e.target.value }))}>
              <option>Email</option><option>WhatsApp</option><option>Phone</option>
            </select>
          </Field>
        </div>
      </div>

      {/* ── Section 2: Patient & Case ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6">
        <SectionHeader icon={Calendar} title="Patient & Case Information" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Patient Reference" required tooltip="Your internal patient ID — no names for GDPR">
            <input className={inp} value={patientForm.patientRef} onChange={e => setPatientForm(f => ({ ...f, patientRef: e.target.value }))} placeholder="PAT-001" />
          </Field>
          <Field label="Clinic Reference" tooltip="Your own case/job number">
            <input className={inp} value={patientForm.clinicReference} onChange={e => setPatientForm(f => ({ ...f, clinicReference: e.target.value }))} placeholder="JOB-001" />
          </Field>
          <Field label="Patient Gender">
            <select className={inp} value={patientForm.patientGender} onChange={e => setPatientForm(f => ({ ...f, patientGender: e.target.value }))}>
              <option>Female</option><option>Male</option><option>Other</option>
            </select>
          </Field>
          <Field label="Patient Age" tooltip="Approximate age in years">
            <input type="number" min={1} max={120} className={inp} value={patientForm.patientAge} onChange={e => setPatientForm(f => ({ ...f, patientAge: e.target.value }))} placeholder="e.g. 45" />
          </Field>
          <Field label="Requested Completion Date" required tooltip="When do you need this case returned?">
            <ModernDatePicker
              value={patientForm.requestedCompletion}
              onChange={(val) => setPatientForm(f => ({ ...f, requestedCompletion: val }))}
              placeholder="Pick a date"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed flex items-start gap-1">
              <Info size={12} className="text-teal shrink-0 mt-0.5" />
              Production of your dental prosthesis is usually completed within 3 working days after case approval, although complex cases may require additional time.
            </p>
          </Field>
          <Field label="Urgency">
            <select className={inp} value={patientForm.urgency} onChange={e => setPatientForm(f => ({ ...f, urgency: e.target.value }))}>
              <option value="Standard">Standard</option>
              <option value="Express">Express (+1 day)</option>
              <option value="Urgent">Urgent (same day)</option>
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="Case Notes / Prescription Details">
              <textarea rows={3} className={inp} value={patientForm.notes} onChange={e => setPatientForm(f => ({ ...f, notes: e.target.value }))} placeholder="Special instructions, preferences, occlusion notes..." />
            </Field>
          </div>
        </div>
      </div>

      {/* ── Section 3: Services ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6">
        <SectionHeader icon={Package} title="Services Required" subtitle="Select all that apply" />
        {["Restorative", "Implant", "Cosmetic", "Removable", "Framework", "Appliance", "Digital"].map(cat => (
          <div key={cat} className="mb-4 last:mb-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{cat}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {SERVICES.filter(s => s.category === cat).map(s => {
                const sel = services.includes(s.name);
                return (
                  <button key={s.name} type="button" onClick={() => toggle(services, s.name, setServices)}
                    className={`relative text-left px-3 py-2.5 rounded-xl border-2 text-xs font-medium transition-all ${sel ? "border-teal bg-teal/5 text-teal" : "border-slate-200 text-slate-600 hover:border-teal/40"}`}>
                    {s.popular && <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-amber-400 text-white text-[8px] rounded-full font-bold leading-none">Popular</span>}
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 ${sel ? "bg-teal border-teal" : "border-slate-300"}`}>
                        {sel && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      {s.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {services.length > 0 && (
          <div className="mt-4 p-3 bg-teal/5 rounded-xl border border-teal/15 text-xs text-teal font-medium">
            Selected: {services.join(", ")}
          </div>
        )}
      </div>

      {/* ── Section 4: Tooth Chart ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6">
        <SectionHeader icon={Sparkles} title="Tooth Chart" subtitle="Click teeth to select them, assign roles via the legend" />
        <ToothChart selected={teeth} onChange={setTeeth} />
      </div>

      {/* ── Section 5: Material & Shade ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6">
        <SectionHeader icon={Wrench} title="Material & Shade" />
        <div className="mb-5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Restoration Material</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MATERIALS.map(m => (
              <button key={m.name} type="button" onClick={() => setMaterial(material === m.name ? "" : m.name)}
                className={`text-left px-3 py-3 rounded-xl border-2 text-xs transition-all ${material === m.name ? "border-teal bg-teal/5 text-teal font-semibold shadow-sm" : "border-slate-200 text-slate-600 hover:border-teal/40"}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 ${material === m.name ? "bg-teal border-teal" : "border-slate-300"}`}>
                    {material === m.name && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{m.name}</div>
                    <div className="text-slate-400 text-[10px]">{m.type}</div>
                  </div>
                  {m.premium && <Sparkles size={10} className="text-amber-400 shrink-0" />}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-100 pt-5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Shade Matching</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Shade System">
              <select className={inp} value={shade.system} onChange={e => setShade(s => ({ ...s, system: e.target.value }))}>
                <option>VITA Classical</option><option>VITA 3D Master</option><option>Bleach</option>
              </select>
            </Field>
            <Field label="Body Shade">
              <input className={inp} value={shade.body} onChange={e => setShade(s => ({ ...s, body: e.target.value }))} placeholder="e.g. A2" />
            </Field>
            <Field label="Cervical Shade">
              <input className={inp} value={shade.cervical} onChange={e => setShade(s => ({ ...s, cervical: e.target.value }))} placeholder="e.g. A3" />
            </Field>
            <Field label="Incisal Shade">
              <input className={inp} value={shade.incisal} onChange={e => setShade(s => ({ ...s, incisal: e.target.value }))} placeholder="e.g. A1" />
            </Field>
          </div>
        </div>
      </div>

      {/* ── Section 6: Implant Details ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6">
        <SectionHeader icon={Zap} title="Implant Details" subtitle="Only complete if this is an implant case" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Implant Brand">
            <input className={inp} value={implant.brand} onChange={e => setImplant(i => ({ ...i, brand: e.target.value }))} placeholder="e.g. Straumann, Nobel, Zimmer" />
          </Field>
          <Field label="Implant System">
            <input className={inp} value={implant.system} onChange={e => setImplant(i => ({ ...i, system: e.target.value }))} placeholder="e.g. BLT, BL, Active" />
          </Field>
          <Field label="Platform / Diameter">
            <input className={inp} value={implant.platform} onChange={e => setImplant(i => ({ ...i, platform: e.target.value }))} placeholder="e.g. 4.8mm" />
          </Field>
          <Field label="Connection Type">
            <select className={inp} value={implant.connection} onChange={e => setImplant(i => ({ ...i, connection: e.target.value }))}>
              <option>Internal</option><option>External</option><option>Conical</option>
            </select>
          </Field>
          <Field label="Scanbody Used">
            <input className={inp} value={implant.scanbody} onChange={e => setImplant(i => ({ ...i, scanbody: e.target.value }))} placeholder="e.g. Original, 3rd party" />
          </Field>
          <Field label="Retention Type">
            <select className={inp} value={implant.retention} onChange={e => setImplant(i => ({ ...i, retention: e.target.value }))}>
              <option>Screw-retained</option><option>Cement-retained</option>
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="Implant Notes">
              <textarea rows={2} className={inp} value={implant.notes} onChange={e => setImplant(i => ({ ...i, notes: e.target.value }))} placeholder="Any special implant requirements..." />
            </Field>
          </div>
        </div>
      </div>

      {/* ── Section 7: File Upload ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6">
        <SectionHeader icon={Upload} title="Files & Scans" subtitle={`STL, PLY, OBJ, DICOM, ZIP, JPG, PNG, PDF — max ${formatBytes(MAX_FILE_SIZE)} each`} />
        <div onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${drag ? "border-teal bg-teal/5" : "border-slate-200 hover:border-teal/40 bg-slate-50"}`}>
          <Upload size={24} className="mx-auto text-teal/50 mb-2" />
          <p className="text-sm text-slate-500 font-medium">{drag ? "Drop to add files" : "Drag & drop files here"}</p>
          <p className="text-xs text-slate-400 mb-3">or</p>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal text-white text-xs font-semibold cursor-pointer hover:bg-teal/90 transition-colors">
            Browse Files
            <input type="file" multiple onChange={e => onFiles(e.target.files)} className="hidden" />
          </label>
        </div>
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <FileText size={14} className="text-teal shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">{f.name}</div>
                  <div className="text-xs text-slate-400">{formatBytes(f.size)}</div>
                </div>
                <button type="button" onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))}
                  className="text-slate-400 hover:text-red-500 text-xs transition-colors">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Section 8: Shipping ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6">
        <SectionHeader icon={Truck} title="Shipping & Delivery" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Delivery Method">
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: "DHL Express", sub: "1-2 days", img: "https://upload.wikimedia.org/wikipedia/commons/a/ac/DHL_Logo.svg" },
                { name: "UPS Standard", sub: "3-5 days", img: "https://upload.wikimedia.org/wikipedia/commons/6/6b/United_Parcel_Service_logo_2014.svg" },
                { name: "Local Courier", sub: "Same day", img: null },
              ].map((opt) => {
                const selected = shipping.method.startsWith(opt.name);
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setShipping(s => ({ ...s, method: `${opt.name} (${opt.sub})` }))}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition text-center ${
                      selected ? "border-teal bg-teal/5 ring-1 ring-teal" : "border-slate-200 hover:border-teal/40"
                    }`}
                  >
                    {opt.img ? (
                      <img src={opt.img} alt={opt.name} className="h-7 w-auto object-contain" />
                    ) : (
                      <Truck size={22} className="text-slate-400" />
                    )}
                    <span className={`text-xs font-semibold ${selected ? "text-teal" : "text-slate-700"}`}>{opt.name}</span>
                    <span className="text-[10px] text-slate-400">{opt.sub}</span>
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Return Address">
            <select className={inp} value={shipping.returnAddress} onChange={e => setShipping(s => ({ ...s, returnAddress: e.target.value }))}>
              <option>Same as clinic address</option><option>Custom address</option>
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="Delivery Instructions">
              <textarea rows={2} className={inp} value={shipping.notes} onChange={e => setShipping(s => ({ ...s, notes: e.target.value }))} placeholder="e.g. Leave with reception, call on arrival..." />
            </Field>
          </div>
        </div>
      </div>

      {/* ── Section 9: Declaration & Submit ── */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6">
        <SectionHeader icon={FileCheck} title="Declaration & Submission" subtitle="Please confirm all three statements before submitting" />
        <div className="space-y-3 mb-6">
          {[
            { key: "a", text: "I confirm the patient information provided is accurate and complete.", detail: "Required for proper identification and treatment planning." },
            { key: "b", text: "I authorise Prime Smile Dental Laboratory to manufacture this case to the supplied prescription.", detail: "Required to proceed with fabrication." },
            { key: "c", text: "I have informed the patient that materials used are CE-certified and traceable.", detail: "Required for medical device regulation compliance." },
          ].map(({ key, text, detail }) => (
            <label key={key}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${(decl as any)[key] ? "border-teal bg-teal/5" : "border-slate-200 hover:border-teal/30"}`}>
              <input type="checkbox" checked={(decl as any)[key]}
                onChange={e => setDecl(d => ({ ...d, [key]: e.target.checked }))}
                className="w-4 h-4 mt-0.5 accent-teal cursor-pointer shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-800">{text}</p>
                <p className="text-xs text-slate-400 mt-0.5">{detail}</p>
              </div>
            </label>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>
        )}

        <button disabled={submitting} onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-teal text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal/90 hover:shadow-lg transition-all">
          <FileCheck size={18} />
          {submitting ? "Submitting Case…" : "Submit Case to Prime Smile Lab"}
        </button>
        <p className="text-center text-xs text-slate-400 mt-3">You'll receive a confirmation email once submitted.</p>
      </div>

      {/* Upload Progress Modal */}
      <UploadProgressModal
        open={showUploadModal}
        files={uploadProgress}
        phase={uploadPhase}
        canCancel={isUploading}
        onCancel={() => {
          xhrRefs.current.forEach((xhr) => { try { xhr.abort(); } catch {} });
          setShowUploadModal(false);
          setIsUploading(false);
          setSubmitting(false);
        }}
      />
    </div>
  );
}
