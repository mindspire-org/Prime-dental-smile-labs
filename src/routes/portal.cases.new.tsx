import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch, getCurrentUser } from "@/lib/api";
import {
  ArrowLeft, ArrowRight, CheckCircle2, FileText, Clock,
  User, Calendar, Package, Palette, Wrench, Truck, FileCheck,
  Zap, Upload, Sparkles, Info,
} from "lucide-react";
import { ToothChart, type ToothRole } from "@/components/site/ToothChart";

export const Route = createFileRoute("/portal/cases/new")({
  component: NewCasePage,
});

const STEPS = [
  { id: "clinic",      label: "Dentist / Clinic", icon: User,      description: "Your practice information" },
  { id: "patient",     label: "Patient & Case",   icon: Calendar,  description: "Patient details and case info" },
  { id: "services",    label: "Services",          icon: Package,   description: "Select required services" },
  { id: "teeth",       label: "Tooth Chart",       icon: Sparkles,  description: "Select teeth to work on" },
  { id: "material",    label: "Material",          icon: Wrench,    description: "Choose restoration material" },
  { id: "shade",       label: "Shade",             icon: Palette,   description: "Color matching details" },
  { id: "implant",     label: "Implant",           icon: Zap,       description: "Implant system details" },
  { id: "files",       label: "Files",             icon: Upload,    description: "Upload scans and files" },
  { id: "shipping",    label: "Shipping",          icon: Truck,     description: "Delivery preferences" },
  { id: "declaration", label: "Declaration",       icon: FileCheck, description: "Final confirmation" },
];

const SERVICES = [
  { name: "Crown",            category: "Restorative", popular: true },
  { name: "Bridge",           category: "Restorative", popular: true },
  { name: "Veneer",           category: "Cosmetic",    popular: false },
  { name: "Inlay/Onlay",      category: "Restorative", popular: false },
  { name: "Implant Crown",    category: "Implant",     popular: true },
  { name: "Custom Abutment",  category: "Implant",     popular: false },
  { name: "Implant Bar",      category: "Implant",     popular: false },
  { name: "Full Denture",     category: "Removable",   popular: false },
  { name: "Partial Denture",  category: "Removable",   popular: false },
  { name: "Framework (Co-Cr)",category: "Framework",   popular: false },
  { name: "Night Guard",      category: "Appliance",   popular: false },
  { name: "Splint",           category: "Appliance",   popular: false },
  { name: "Surgical Guide",   category: "Digital",     popular: false },
  { name: "Design Only",      category: "Digital",     popular: false },
];

const MATERIALS = [
  { name: "Zirconia (Multilayer)",     type: "Ceramic",       premium: true  },
  { name: "Zirconia (Monolithic)",     type: "Ceramic",       premium: true  },
  { name: "Lithium Disilicate (e.max)",type: "Ceramic",       premium: true  },
  { name: "PFM",                       type: "Metal-Ceramic", premium: false },
  { name: "Cobalt-Chrome",             type: "Metal",         premium: false },
  { name: "Titanium",                  type: "Metal",         premium: false },
  { name: "PMMA (Temporary)",          type: "Temporary",     premium: false },
  { name: "Acrylic",                   type: "Acrylic",       premium: false },
  { name: "Flexible Nylon",            type: "Flexible",      premium: false },
];

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all text-sm placeholder:text-slate-400 hover:border-teal/30";

function Field({ label, required, tooltip, children }: {
  label: string; required?: boolean; tooltip?: string; children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold text-teal uppercase tracking-wider">{label}</span>
        {required && <span className="text-red-500 text-xs">*</span>}
        {tooltip && (
          <div className="relative group/tip">
            <Info size={13} className="text-slate-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tip:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      {children}
    </label>
  );
}

type ClinicInfo = { name?: string; address?: string; phone?: string; email?: string; city?: string; country?: string };

function NewCasePage() {
  const navigate = useNavigate();
  const sessionUser = getCurrentUser();

  const [profile, setProfile] = useState<any>(null);
  const [clinic, setClinic] = useState<ClinicInfo>({});

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<any>(null);
  const [error, setError] = useState("");
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

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
    submittedDate: new Date().toISOString().slice(0, 10),
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
  const [decl, setDecl] = useState({ a: false, b: false, c: false });

  useEffect(() => {
    apiFetch<any>("/api/auth/me").then((r) => {
      const u = r.user;
      setProfile(u);
      const c: ClinicInfo = typeof u.clinic === "object" ? u.clinic : {};
      setClinic(c);
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

  const progress = ((step + 1) / STEPS.length) * 100;
  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const onFiles = (list: FileList | null) => {
    if (list) setFiles((f) => [...f, ...Array.from(list)]);
  };
  const goToStep = (i: number) => { if (i <= step) setStep(i); };

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
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
          shade: shade.body || shade.system ? shade : undefined,
          implant: implant.brand ? implant : undefined,
          shipping: { method: "Standard", address: shipping.returnAddress, instructions: shipping.notes },
          urgency: patientForm.urgency as "Standard" | "Express" | "Urgent",
          requestedCompletion: patientForm.requestedCompletion || undefined,
          notes: patientForm.notes || undefined,
        }),
      });
      setDone(result.case);
    } catch (e: any) {
      setError(e.message || "Submission failed");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-2xl">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal/5 rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-linear-to-br from-teal to-teal/80 text-white flex items-center justify-center">
              <CheckCircle2 size={40} />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-3 text-slate-800">Case Submitted!</h1>
          <p className="text-slate-500 mb-6">Your case has been received and is being processed.</p>
          <div className="bg-teal/5 border border-teal/20 rounded-2xl p-5 mb-8">
            <div className="text-xs text-teal font-semibold mb-1">Case Reference</div>
            <div className="text-2xl font-mono font-bold text-slate-800">{done.caseNumber}</div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate({ to: "/portal/cases" })}
              className="flex-1 px-5 py-3 rounded-xl bg-teal text-white font-semibold text-sm hover:bg-teal/90 transition-colors">
              View My Cases
            </button>
            <button onClick={() => { setDone(null); setStep(0); setServices([]); setTeeth({}); setMaterial(""); setDecl({ a: false, b: false, c: false }); setPatientForm(p => ({ ...p, patientRef: "", clinicReference: "" })); }}
              className="flex-1 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = STEPS[step];
  const StepIcon = currentStep.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "#0aabbd" }}>Portal</div>
        <h1 className="text-2xl font-bold text-slate-800">New Case</h1>
        <p className="text-sm text-slate-400 mt-1">Submit a digital prescription — your details are pre-filled.</p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StepIcon size={16} className="text-teal" />
            <span className="font-semibold text-slate-700 text-sm">Step {step + 1} of {STEPS.length} — {currentStep.label}</span>
          </div>
          <span className="text-xs text-slate-400">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-linear-to-r from-teal to-teal/80 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const done = i < step;
            return (
              <button key={s.id} onClick={() => goToStep(i)} disabled={i > step}
                onMouseEnter={() => setHoveredStep(i)} onMouseLeave={() => setHoveredStep(null)}
                className={`relative aspect-square rounded-xl flex items-center justify-center transition-all ${i > step ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} ${active ? "bg-linear-to-br from-teal to-teal/80 text-white shadow-md scale-110" : done ? "bg-teal/10 text-teal border-2 border-teal" : "bg-slate-100 text-slate-400"}`}>
                <Icon size={14} />
                {hoveredStep === i && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded-lg whitespace-nowrap z-10 pointer-events-none font-medium">
                    {s.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-teal to-teal/80 text-white flex items-center justify-center">
            <StepIcon size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">{currentStep.label}</h2>
            <p className="text-xs text-slate-400">{currentStep.description}</p>
          </div>
        </div>

        {/* Step 0 — Clinic / Dentist (pre-filled) */}
        {step === 0 && (
          <div>
            <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-teal/5 border border-teal/20">
              <CheckCircle2 size={16} className="text-teal mt-0.5 shrink-0" />
              <p className="text-xs text-slate-600">Your profile details have been pre-filled. You can edit them if needed for this specific case.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Dentist Name" required>
                <input className={inputCls} value={clinicForm.dentistName} onChange={e => setClinicForm(f => ({ ...f, dentistName: e.target.value }))} />
              </Field>
              <Field label="Email" required>
                <input type="email" className={inputCls} value={clinicForm.email} readOnly style={{ background: "#f8fafc", color: "#94a3b8" }} />
              </Field>
              <Field label="Clinic Name" required>
                <input className={inputCls} value={clinicForm.clinicName} onChange={e => setClinicForm(f => ({ ...f, clinicName: e.target.value }))} placeholder="Your practice name" />
              </Field>
              <Field label="GDC Number" tooltip="General Dental Council registration number">
                <input className={inputCls} value={clinicForm.gdcNumber} onChange={e => setClinicForm(f => ({ ...f, gdcNumber: e.target.value }))} placeholder="123456" />
              </Field>
              <Field label="Phone / WhatsApp" required>
                <input className={inputCls} value={clinicForm.phone} onChange={e => setClinicForm(f => ({ ...f, phone: e.target.value }))} placeholder="+44 20 1234 5678" />
              </Field>
              <Field label="Country" required>
                <select className={inputCls} value={clinicForm.country} onChange={e => setClinicForm(f => ({ ...f, country: e.target.value }))}>
                  <option>United Kingdom</option><option>Cyprus</option><option>Other</option>
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Clinic Address" tooltip="Physical address for delivery">
                  <input className={inputCls} value={clinicForm.address} onChange={e => setClinicForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Dental Street, London" />
                </Field>
              </div>
              <Field label="Preferred Contact">
                <select className={inputCls} value={clinicForm.preferredContact} onChange={e => setClinicForm(f => ({ ...f, preferredContact: e.target.value }))}>
                  <option>Email</option><option>WhatsApp</option><option>Phone</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* Step 1 — Patient & Case */}
        {step === 1 && (
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Patient Reference" required tooltip="Your internal patient ID">
              <input className={inputCls} value={patientForm.patientRef} onChange={e => setPatientForm(f => ({ ...f, patientRef: e.target.value }))} placeholder="PAT-001" />
            </Field>
            <Field label="Clinic Reference" tooltip="Your case reference number">
              <input className={inputCls} value={patientForm.clinicReference} onChange={e => setPatientForm(f => ({ ...f, clinicReference: e.target.value }))} placeholder="CASE-001" />
            </Field>
            <Field label="Patient Gender">
              <select className={inputCls} value={patientForm.patientGender} onChange={e => setPatientForm(f => ({ ...f, patientGender: e.target.value }))}>
                <option>Female</option><option>Male</option><option>Other</option>
              </select>
            </Field>
            <Field label="Patient Age" tooltip="Patient's age in years">
              <input type="number" className={inputCls} value={patientForm.patientAge} onChange={e => setPatientForm(f => ({ ...f, patientAge: e.target.value }))} placeholder="45" />
            </Field>
            <Field label="Submitted Date">
              <input type="date" className={inputCls} value={patientForm.submittedDate} onChange={e => setPatientForm(f => ({ ...f, submittedDate: e.target.value }))} />
            </Field>
            <Field label="Requested Completion" tooltip="When do you need this case back?">
              <input type="date" className={inputCls} value={patientForm.requestedCompletion} onChange={e => setPatientForm(f => ({ ...f, requestedCompletion: e.target.value }))} />
            </Field>
            <Field label="Urgency" tooltip="Select urgency level">
              <select className={inputCls} value={patientForm.urgency} onChange={e => setPatientForm(f => ({ ...f, urgency: e.target.value }))}>
                <option>Standard</option><option>Express</option><option>Urgent</option>
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Case Notes">
                <textarea rows={3} className={inputCls} value={patientForm.notes} onChange={e => setPatientForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any additional notes..." />
              </Field>
            </div>
          </div>
        )}

        {/* Step 2 — Services */}
        {step === 2 && (
          <div>
            {["Restorative", "Implant", "Cosmetic", "Removable", "Framework", "Appliance", "Digital"].map(cat => (
              <div key={cat} className="mb-5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{cat}</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {SERVICES.filter(s => s.category === cat).map(s => {
                    const sel = services.includes(s.name);
                    return (
                      <button key={s.name} type="button" onClick={() => toggle(services, s.name, setServices)}
                        className={`relative text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${sel ? "border-teal bg-teal/5 text-teal font-semibold" : "border-slate-200 hover:border-teal/40"}`}>
                        {s.popular && <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-amber-400 text-white text-[9px] rounded-full font-bold">Popular</span>}
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${sel ? "bg-teal border-teal" : "border-slate-300"}`}>
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
          </div>
        )}

        {/* Step 3 — Tooth Chart */}
        {step === 3 && (
          <div>
            <div className="mb-4 p-4 bg-teal/5 rounded-xl border border-teal/20 text-xs text-slate-600">
              <strong>How to use:</strong> Click teeth to select them, assign roles via the legend.
            </div>
            <ToothChart selected={teeth} onChange={setTeeth} />
          </div>
        )}

        {/* Step 4 — Material */}
        {step === 4 && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {MATERIALS.map(m => (
              <button key={m.name} type="button" onClick={() => setMaterial(m.name)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${material === m.name ? "border-teal bg-teal/5 shadow-md scale-105" : "border-slate-200 hover:border-teal/40"}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${material === m.name ? "bg-teal border-teal" : "border-slate-300"}`}>
                    {material === m.name && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{m.name}</div>
                    <div className="text-xs text-slate-400">{m.type}</div>
                  </div>
                  {m.premium && <Sparkles size={12} className="ml-auto text-amber-400" />}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 5 — Shade */}
        {step === 5 && (
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Shade System">
              <select className={inputCls} value={shade.system} onChange={e => setShade(s => ({ ...s, system: e.target.value }))}>
                <option>VITA Classical</option><option>VITA 3D Master</option><option>Bleach</option>
              </select>
            </Field>
            <Field label="Body Shade"><input className={inputCls} value={shade.body} onChange={e => setShade(s => ({ ...s, body: e.target.value }))} placeholder="e.g. A2" /></Field>
            <Field label="Cervical Shade"><input className={inputCls} value={shade.cervical} onChange={e => setShade(s => ({ ...s, cervical: e.target.value }))} placeholder="e.g. A3" /></Field>
            <Field label="Incisal Shade"><input className={inputCls} value={shade.incisal} onChange={e => setShade(s => ({ ...s, incisal: e.target.value }))} placeholder="e.g. A1" /></Field>
          </div>
        )}

        {/* Step 6 — Implant */}
        {step === 6 && (
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Implant Brand"><input className={inputCls} value={implant.brand} onChange={e => setImplant(i => ({ ...i, brand: e.target.value }))} placeholder="e.g. Straumann" /></Field>
            <Field label="Implant System"><input className={inputCls} value={implant.system} onChange={e => setImplant(i => ({ ...i, system: e.target.value }))} placeholder="e.g. BLT" /></Field>
            <Field label="Platform"><input className={inputCls} value={implant.platform} onChange={e => setImplant(i => ({ ...i, platform: e.target.value }))} placeholder="e.g. 4.8mm" /></Field>
            <Field label="Connection">
              <select className={inputCls} value={implant.connection} onChange={e => setImplant(i => ({ ...i, connection: e.target.value }))}>
                <option>Internal</option><option>External</option><option>Conical</option>
              </select>
            </Field>
            <Field label="Scanbody"><input className={inputCls} value={implant.scanbody} onChange={e => setImplant(i => ({ ...i, scanbody: e.target.value }))} placeholder="e.g. Original" /></Field>
            <Field label="Retention">
              <select className={inputCls} value={implant.retention} onChange={e => setImplant(i => ({ ...i, retention: e.target.value }))}>
                <option>Screw-retained</option><option>Cement-retained</option>
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Implant Notes"><textarea rows={3} className={inputCls} value={implant.notes} onChange={e => setImplant(i => ({ ...i, notes: e.target.value }))} placeholder="Any special requirements..." /></Field>
            </div>
          </div>
        )}

        {/* Step 7 — Files */}
        {step === 7 && (
          <div>
            <div className="mb-4 p-4 bg-teal/5 rounded-xl border border-teal/20 text-xs text-slate-600">
              <strong>Supported:</strong> STL, PLY, OBJ, DICOM, ZIP, JPG, PNG, PDF — max 50 MB each.
            </div>
            <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${drag ? "border-teal bg-teal/5" : "border-teal/30 bg-slate-50 hover:border-teal/50"}`}>
              <Upload size={28} className="text-teal mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700 mb-1">{drag ? "Drop files here" : "Drag & drop files"}</p>
              <p className="text-xs text-slate-400 mb-4">or click to browse</p>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold cursor-pointer hover:bg-teal/90 transition-colors">
                Browse Files
                <input type="file" multiple onChange={e => onFiles(e.target.files)} className="hidden" />
              </label>
            </div>
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-teal/5 rounded-xl border border-teal/20">
                    <FileText size={16} className="text-teal shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">{f.name}</div>
                      <div className="text-xs text-slate-400">{(f.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button type="button" onClick={() => setFiles(fs => fs.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500 text-xs font-medium">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 8 — Shipping */}
        {step === 8 && (
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Delivery Method">
              <select className={inputCls} value={shipping.method} onChange={e => setShipping(s => ({ ...s, method: e.target.value }))}>
                <option>DHL Express (1-2 days)</option><option>UPS Standard (3-5 days)</option><option>Courier (local - same day)</option>
              </select>
            </Field>
            <Field label="Return Address">
              <select className={inputCls} value={shipping.returnAddress} onChange={e => setShipping(s => ({ ...s, returnAddress: e.target.value }))}>
                <option>Same as clinic address</option><option>Custom address</option>
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Delivery Notes">
                <textarea rows={3} className={inputCls} value={shipping.notes} onChange={e => setShipping(s => ({ ...s, notes: e.target.value }))} placeholder="Any special delivery instructions..." />
              </Field>
            </div>
          </div>
        )}

        {/* Step 9 — Declaration */}
        {step === 9 && (
          <div className="space-y-4">
            <div className="p-4 bg-teal/5 rounded-xl border border-teal/20">
              <p className="text-sm text-slate-600">Please review and confirm all declarations before submitting.</p>
            </div>
            {[
              { key: "a", text: "I confirm the patient information provided is accurate and complete.", detail: "This ensures proper identification and treatment planning." },
              { key: "b", text: "I authorise Prime Smile Dental Laboratory to manufacture this case to the supplied prescription.", detail: "This gives us permission to proceed with the fabrication." },
              { key: "c", text: "I have informed the patient that materials used are CE-certified and traceable.", detail: "This ensures compliance with medical device regulations." },
            ].map(({ key, text, detail }) => (
              <label key={key} className="block p-5 rounded-2xl border-2 border-slate-200 hover:border-teal/40 cursor-pointer transition-all">
                <div className="flex items-start gap-4">
                  <input type="checkbox" checked={(decl as any)[key]} onChange={e => setDecl(d => ({ ...d, [key]: e.target.checked }))}
                    className="w-5 h-5 mt-0.5 accent-teal rounded cursor-pointer" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{detail}</p>
                  </div>
                </div>
              </label>
            ))}

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>
            )}

            <button disabled={!decl.a || !decl.b || !decl.c || submitting} onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-linear-to-r from-teal to-teal/80 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all mt-2">
              <FileCheck size={18} />
              {submitting ? "Submitting…" : "Submit Case"}
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => step === 0 ? navigate({ to: "/portal/cases" }) : setStep(s => s - 1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={15} />
          {step === 0 ? "Back to Cases" : "Previous"}
        </button>
        {step < STEPS.length - 1 && (
          <button onClick={() => {
            if (step === 1 && !patientForm.patientRef.trim()) { setError("Patient reference is required"); return; }
            setError("");
            setStep(s => s + 1);
          }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal/90 transition-colors">
            Next
            <ArrowRight size={15} />
          </button>
        )}
      </div>
      {error && step !== 9 && (
        <div className="text-xs text-red-500 text-right -mt-3">{error}</div>
      )}
    </div>
  );
}
