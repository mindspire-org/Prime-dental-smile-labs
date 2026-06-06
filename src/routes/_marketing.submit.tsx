import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  CheckCircle2, 
  FileText, 
  Clock, 
  Shield, 
  Zap,
  Info,
  Sparkles,
  User,
  Calendar,
  Package,
  Palette,
  Wrench,
  Truck,
  FileCheck
} from "lucide-react";
import { ToothChart, type ToothRole } from "@/components/site/ToothChart";
import { ModernDatePicker } from "@/components/site/ModernDatePicker";
import { Reveal } from "@/components/site/Reveal";
import { analytics } from "@/components/analytics/GoogleAnalytics";
import { getCurrentUser } from "@/lib/api";
import { formatBytes } from "@/lib/utils";

export const Route = createFileRoute("/_marketing/submit")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    if (!getCurrentUser()) {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST", credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.accessToken && data?.user) {
            const { setSession } = await import("@/lib/api");
            setSession({ accessToken: data.accessToken, user: data.user });
            return;
          }
        }
      } catch {}
      throw redirect({ to: "/login" as any, search: { redirect: "/submit" } });
    }
  },
  head: () => ({
    meta: [
      { title: "Submit a Case — Prime Smile Dental Laboratory" },
      { name: "description", content: "Submit a new dental lab case via our 10-step digital prescription." },
    ],
  }),
  component: SubmitPage,
});

const STEPS = [
  { id: "clinic", label: "Dentist / Clinic", icon: User, description: "Your practice information" },
  { id: "patient", label: "Patient & Case", icon: Calendar, description: "Patient details and case info" },
  { id: "services", label: "Services", icon: Package, description: "Select required services" },
  { id: "teeth", label: "Tooth Chart", icon: Sparkles, description: "Select teeth to work on" },
  { id: "material", label: "Material", icon: Wrench, description: "Choose restoration material" },
  { id: "shade", label: "Shade", icon: Palette, description: "Color matching details" },
  { id: "implant", label: "Implant", icon: Zap, description: "Implant system details" },
  { id: "files", label: "Files", icon: Upload, description: "Upload scans and files" },
  { id: "shipping", label: "Shipping", icon: Truck, description: "Delivery preferences" },
  { id: "declaration", label: "Declaration", icon: FileCheck, description: "Final confirmation" },
];

const SERVICES = [
  { name: "Crown", category: "Restorative", popular: true },
  { name: "Bridge", category: "Restorative", popular: true },
  { name: "Veneer", category: "Cosmetic", popular: false },
  { name: "Inlay/Onlay", category: "Restorative", popular: false },
  { name: "Implant Crown", category: "Implant", popular: true },
  { name: "Custom Abutment", category: "Implant", popular: false },
  { name: "Implant Bar", category: "Implant", popular: false },
  { name: "Full Denture", category: "Removable", popular: false },
  { name: "Partial Denture", category: "Removable", popular: false },
  { name: "Framework (Co-Cr)", category: "Framework", popular: false },
  { name: "Night Guard", category: "Appliance", popular: false },
  { name: "Splint", category: "Appliance", popular: false },
  { name: "Surgical Guide", category: "Digital", popular: false },
  { name: "Design Only", category: "Digital", popular: false },
];

const MATERIALS = [
  { name: "Zirconia (Multilayer)", type: "Ceramic", premium: true, color: "from-purple-500 to-pink-500" },
  { name: "Zirconia (Monolithic)", type: "Ceramic", premium: true, color: "from-purple-500 to-pink-500" },
  { name: "Lithium Disilicate (e.max)", type: "Ceramic", premium: true, color: "from-blue-500 to-cyan-500" },
  { name: "PFM", type: "Metal-Ceramic", premium: false, color: "from-gray-500 to-gray-600" },
  { name: "Cobalt-Chrome", type: "Metal", premium: false, color: "from-gray-600 to-gray-700" },
  { name: "Titanium", type: "Metal", premium: false, color: "from-gray-500 to-gray-600" },
  { name: "PMMA (Temporary)", type: "Temporary", premium: false, color: "from-pink-500 to-rose-500" },
  { name: "Acrylic", type: "Acrylic", premium: false, color: "from-orange-500 to-red-500" },
  { name: "Flexible Nylon", type: "Flexible", premium: false, color: "from-indigo-500 to-purple-500" },
];

function Field({ label, children, required, tooltip }: { 
  label: string; 
  children: React.ReactNode; 
  required?: boolean; 
  tooltip?: string;
}) {
  return (
    <label className="block group">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold text-teal uppercase tracking-wider">{label}</span>
        {required && <span className="text-red-500 text-xs">*</span>}
        {tooltip && (
          <div className="relative group/tooltip">
            <Info size={14} className="text-teal cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-10">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      {children}
    </label>
  );
}

const inputCls = "w-full px-4 py-3 rounded-xl border border-border-silver bg-white focus:border-teal focus:ring-2 focus:ring-teal/20 outline-none transition-all duration-200 text-sm placeholder:text-muted-grey/50 hover:border-teal/30";

function SubmitPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [teeth, setTeeth] = useState<Record<number, ToothRole>>({});
  const [services, setServices] = useState<string[]>([]);
  const [material, setMaterial] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [drag, setDrag] = useState(false);
  const [decl, setDecl] = useState({ a: false, b: false, c: false });
  const [requestedCompletion, setRequestedCompletion] = useState("");
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const next = () => {
    analytics.event("step_complete", "engagement", STEPS[step].id, step + 1);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  
  const prev = () => setStep((s) => Math.max(0, s - 1));
  const progress = ((step + 1) / STEPS.length) * 100;

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const newFiles = Array.from(list);
    setFiles((f) => [...f, ...newFiles]);
    newFiles.forEach(file => {
      analytics.fileUpload(file.type, file.size);
    });
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex <= step) {
      setStep(stepIndex);
      analytics.event("step_navigation", "engagement", `to_${STEPS[stepIndex].id}`, stepIndex);
    }
  };

  if (done) {
    const caseId = `PSDL-UK-2026-${Math.floor(Math.random() * 9000) + 1000}`;
    
    return (
      <div className="min-h-screen bg-linear-to-br from-teal/5 via-white to-gold/5 py-20">
        <div className="max-w-2xl mx-auto px-5 lg:px-8">
          <Reveal>
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-teal/10 to-transparent rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-linear-to-tr from-gold/10 to-transparent rounded-full translate-y-24 -translate-x-24" />
              
              {/* Success icon with animation */}
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto rounded-full bg-linear-to-br from-teal to-teal/80 text-white flex items-center justify-center shadow-lg">
                  <CheckCircle2 size={48} className="animate-pulse" />
                </div>
                <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-teal/20 animate-ping" />
              </div>
              
              <h1 className="text-4xl font-bold mb-4 bg-linear-to-r from-teal to-teal/70 bg-clip-text text-transparent">
                Case Submitted Successfully!
              </h1>
              
              <p className="text-lg text-muted-grey mb-6">
                Your digital prescription has been generated and is now being processed by our dental technicians.
              </p>
              
              <div className="bg-linear-to-r from-teal/5 to-gold/5 rounded-2xl p-6 mb-8 border border-teal/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="text-teal" size={20} />
                  <span className="text-sm font-semibold text-teal">Case Reference</span>
                </div>
                <p className="text-2xl font-mono font-bold text-text-slate">{caseId}</p>
                <p className="text-xs text-muted-grey mt-2">Please save this reference for your records</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <Clock className="text-teal mx-auto mb-2" size={24} />
                  <p className="text-xs text-muted-grey">Processing Time</p>
                  <p className="font-semibold text-sm">5-7 working days</p>
                </div>
                <div className="text-center">
                  <Package className="text-teal mx-auto mb-2" size={24} />
                  <p className="text-xs text-muted-grey">Quality Check</p>
                  <p className="font-semibold text-sm">Multi-stage inspection</p>
                </div>
                <div className="text-center">
                  <Truck className="text-teal mx-auto mb-2" size={24} />
                  <p className="text-xs text-muted-grey">Delivery</p>
                  <p className="font-semibold text-sm">Secure packaging</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => { 
                    setDone(false); 
                    setStep(0); 
                    analytics.event("new_case_started", "engagement", "from_success");
                  }} 
                  className="flex-1 btn-gold"
                >
                  Submit Another Case
                </button>
                <Link to="/portal/cases" className="flex-1 btn-outline-teal text-center">
                  View My Cases
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    );
  }

  const currentStep = STEPS[step];
  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen bg-linear-to-br from-teal/5 via-white to-gold/5">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-teal to-teal/80 text-white py-12">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <StepIcon size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Digital Case Submission</h1>
              <p className="text-teal/80">{currentStep.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-8">
        {/* Interactive Progress Indicator */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <StepIcon className="text-teal" size={20} />
              <span className="font-semibold text-text-slate">Step {step + 1} of {STEPS.length}</span>
              <span className="text-muted-grey">• {currentStep.label}</span>
            </div>
            <span className="text-sm text-muted-grey">{Math.round(progress)}% Complete</span>
          </div>
          
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
            <div 
              className="h-full bg-linear-to-r from-teal to-teal/80 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step Navigation */}
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {STEPS.map((s, index) => {
              const Icon = s.icon;
              const isActive = index === step;
              const isCompleted = index < step;
              const canNavigate = index <= step;
              
              return (
                <button
                  key={s.id}
                  onClick={() => canNavigate && goToStep(index)}
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                  disabled={!canNavigate}
                  className={`relative group transition-all duration-200 ${
                    canNavigate ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isActive 
                      ? 'bg-linear-to-br from-teal to-teal/80 text-white shadow-lg scale-110' 
                      : isCompleted 
                        ? 'bg-teal/10 text-teal border-2 border-teal'
                        : 'bg-gray-100 text-gray-400 border-2 border-transparent'
                  }`}>
                    <Icon size={16} />
                  </div>
                  
                  {/* Tooltip */}
                  {hoveredStep === index && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                      <div className="font-semibold">{s.label}</div>
                      <div className="text-gray-300">{s.description}</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Form Content */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-teal to-teal/80 text-white flex items-center justify-center">
                <StepIcon size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-slate">{currentStep.label}</h2>
                <p className="text-muted-grey text-sm">{currentStep.description}</p>
              </div>
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
              {step === 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Clinic Name" required tooltip="Your registered dental practice name">
                <input className={inputCls} placeholder="Enter clinic name" />
              </Field>
              <Field label="Dentist Name" required tooltip="Your full name as registered">
                <input className={inputCls} placeholder="Dr. Smith" />
              </Field>
              <Field label="GDC Number" tooltip="General Dental Council registration number">
                <input className={inputCls} placeholder="123456" />
              </Field>
              <Field label="Email" required tooltip="For order updates and communication">
                <input type="email" className={inputCls} placeholder="dentist@clinic.com" />
              </Field>
              <Field label="Phone / WhatsApp" required tooltip="Primary contact number">
                <input className={inputCls} placeholder="+44 20 1234 5678" />
              </Field>
              <Field label="Country" required>
                <select className={inputCls}>
                  <option>United Kingdom</option>
                  <option>Cyprus</option>
                  <option>Other</option>
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Clinic Address" tooltip="Physical address for delivery">
                  <input className={inputCls} placeholder="123 Dental Street, London, UK" />
                </Field>
              </div>
              <Field label="Preferred Contact">
                <select className={inputCls}>
                  <option>Email</option>
                  <option>WhatsApp</option>
                  <option>Phone</option>
                </select>
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Patient Reference" required tooltip="Your internal patient ID">
                <input className={inputCls} placeholder="PAT-001" />
              </Field>
              <Field label="Clinic Reference" tooltip="Your case reference number">
                <input className={inputCls} placeholder="CASE-001" />
              </Field>
              <Field label="Patient Gender">
                <select className={inputCls}>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field label="Patient Age" tooltip="Patient's age in years">
                <input type="number" className={inputCls} placeholder="45" />
              </Field>
              <Field label="Submitted Date">
                <input type="date" className={inputCls} />
              </Field>
              <Field label="Requested Completion" required tooltip="When do you need this case back?">
                <ModernDatePicker
                  value={requestedCompletion}
                  onChange={setRequestedCompletion}
                  placeholder="Pick a date"
                />
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed flex items-start gap-1">
                  <Info size={12} className="text-teal shrink-0 mt-0.5" />
                  Production of your dental prosthesis is usually completed within 3 working days after case approval, although complex cases may require additional time.
                </p>
              </Field>
              <Field label="Urgency" tooltip="Select urgency level">
                <select className={inputCls}>
                  <option>Standard</option>
                  <option>Express</option>
                  <option>Urgent</option>
                </select>
              </Field>
              <Field label="Case Type" tooltip="Brief description of the case">
                <input className={inputCls} placeholder="e.g. Posterior crown" />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-6 p-4 bg-linear-to-r from-teal/5 to-gold/5 rounded-xl border border-teal/20">
                <p className="text-sm text-muted-grey">
                  <strong>Tip:</strong> Select all services that apply to this case. Popular services are highlighted for your convenience.
                </p>
              </div>
              
              {/* Service categories */}
              {["Restorative", "Implant", "Cosmetic", "Removable", "Framework", "Appliance", "Digital"].map(category => (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-semibold text-text-slate mb-3 uppercase tracking-wider">{category}</h3>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {SERVICES.filter(s => s.category === category).map((s) => {
                      const isSelected = services.includes(s.name);
                      return (
                        <button 
                          key={s.name} 
                          type="button" 
                          onClick={() => toggle(services, s.name, setServices)}
                          className={`group relative text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                            isSelected 
                              ? "border-teal bg-linear-to-r from-teal/5 to-teal/10 text-teal font-semibold shadow-md" 
                              : "border-border-silver hover:border-teal/50 hover:bg-teal/5"
                          }`}
                        >
                          {s.popular && (
                            <div className="absolute -top-2 -right-2 px-2 py-1 bg-gold text-white text-xs rounded-full font-semibold">
                              Popular
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              isSelected 
                                ? "bg-teal border-teal" 
                                : "border-border-silver group-hover:border-teal/50"
                            }`}>
                              {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <span className="text-sm font-medium">{s.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="mb-6 p-4 bg-linear-to-r from-teal/5 to-gold/5 rounded-xl border border-teal/20">
                <p className="text-sm text-muted-grey">
                  <strong>How to use:</strong> Click on teeth to select them. Use the legend to assign different roles (prepare, temporary, scan, implant, extract).
                </p>
              </div>
              <ToothChart selected={teeth} onChange={setTeeth} />
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="mb-6 p-4 bg-linear-to-r from-teal/5 to-gold/5 rounded-xl border border-teal/20">
                <p className="text-sm text-muted-grey">
                  <strong>Material Guide:</strong> Premium materials offer superior aesthetics and durability. Select based on case requirements and patient preferences.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {MATERIALS.map((m) => (
                  <button 
                    key={m.name} 
                    type="button" 
                    onClick={() => setMaterial(m.name)}
                    className={`group relative text-left p-4 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                      material === m.name 
                        ? "border-teal bg-linear-to-r from-teal/5 to-teal/10 text-teal font-semibold shadow-lg scale-105" 
                        : "border-border-silver hover:border-teal/50 hover:shadow-md"
                    }`}
                  >
                    {m.premium && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-linear-to-br from-gold to-gold/80 rounded-full flex items-center justify-center">
                          <Sparkles size={12} className="text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mt-0.5 ${
                        material === m.name 
                          ? "bg-teal border-teal" 
                          : "border-border-silver group-hover:border-teal/50"
                      }`}>
                        {material === m.name && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">{m.name}</div>
                        <div className="text-xs text-muted-grey">{m.type}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Shade System" tooltip="Select the shade guide system">
                <select className={inputCls}>
                  <option>VITA Classical</option>
                  <option>VITA 3D Master</option>
                  <option>Bleach</option>
                </select>
              </Field>
              <Field label="Body Shade" tooltip="Main tooth color">
                <input className={inputCls} placeholder="e.g. A2"/>
              </Field>
              <Field label="Cervical Shade" tooltip="Neck area color">
                <input className={inputCls} placeholder="e.g. A3"/>
              </Field>
              <Field label="Incisal Shade" tooltip="Edge area color">
                <input className={inputCls} placeholder="e.g. A1"/>
              </Field>
              <div className="md:col-span-2">
                <Field label="Shade Photos" tooltip="Upload photos for accurate color matching">
                  <div className="border-2 border-dashed border-border-silver rounded-xl p-6 text-center hover:border-teal/50 transition-colors">
                    <Upload className="text-teal mx-auto mb-2" size={24} />
                    <p className="text-sm text-muted-grey">Click to upload shade photos</p>
                    <p className="text-xs text-muted-grey mt-1">JPG, PNG up to 10MB</p>
                    <input type="file" multiple accept="image/*" className="hidden" />
                  </div>
                </Field>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Implant Brand" tooltip="Manufacturer of the implant system">
                <input className={inputCls} placeholder="e.g. Straumann"/>
              </Field>
              <Field label="Implant System" tooltip="Specific implant system">
                <input className={inputCls} placeholder="e.g. BLT"/>
              </Field>
              <Field label="Platform" tooltip="Implant platform diameter">
                <input className={inputCls} placeholder="e.g. 4.8mm"/>
              </Field>
              <Field label="Connection" tooltip="Type of implant connection">
                <select className={inputCls}>
                  <option>Internal</option>
                  <option>External</option>
                  <option>Conical</option>
                </select>
              </Field>
              <Field label="Scanbody" tooltip="Scanbody type used">
                <input className={inputCls} placeholder="e.g. Original"/>
              </Field>
              <Field label="Retention" tooltip="Type of restoration retention">
                <select className={inputCls}>
                  <option>Screw-retained</option>
                  <option>Cement-retained</option>
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Implant Notes" tooltip="Additional implant-related information">
                  <textarea rows={3} className={inputCls} placeholder="Any special requirements or notes..."/>
                </Field>
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <div className="mb-6 p-4 bg-linear-to-r from-teal/5 to-gold/5 rounded-xl border border-teal/20">
                <p className="text-sm text-muted-grey">
                  <strong>Supported formats:</strong> STL, PLY, OBJ, DICOM, ZIP, RAR, JPG, PNG, PDF. Maximum file size: 250MB per file.
                </p>
              </div>
              
              <div
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
                  drag 
                    ? "border-teal bg-linear-to-br from-teal/5 to-teal/10 scale-[1.02]" 
                    : "border-teal/40 bg-bg-soft hover:border-teal/60 hover:bg-teal/5"
                }`}
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-linear-to-br from-teal to-teal/80 text-white flex items-center justify-center mb-4">
                  <Upload size={32} />
                </div>
                <h3 className="text-lg font-semibold text-text-slate mb-2">
                  {drag ? "Drop files here" : "Drag & drop your files"}
                </h3>
                <p className="text-sm text-muted-grey mb-6">or click to browse from your computer</p>
                <label className="btn-teal inline-flex cursor-pointer px-6 py-3">
                  Browse Files
                  <input type="file" multiple onChange={(e) => onFiles(e.target.files)} className="hidden"/>
                </label>
              </div>
              
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-text-slate mb-4">Uploaded Files ({files.length})</h3>
                  <div className="space-y-3">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-linear-to-r from-teal/5 to-transparent rounded-xl border border-teal/20">
                        <div className="w-10 h-10 rounded-lg bg-teal/10 text-teal flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-slate truncate">{f.name}</p>
                          <p className="text-xs text-muted-grey">{formatBytes(f.size)}</p>
                        </div>
                        <div className="w-32 h-2 bg-white rounded-full overflow-hidden">
                          <div className="h-full bg-linear-to-r from-teal to-teal/80" style={{width: "100%"}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 8 && (
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Delivery Method" tooltip="Choose your preferred delivery service">
                <select className={inputCls}>
                  <option>DHL Express (1-2 days)</option>
                  <option>UPS Standard (3-5 days)</option>
                  <option>Courier (local - same day)</option>
                </select>
              </Field>
              <Field label="Return Address" tooltip="Where should we send the completed case?">
                <select className={inputCls}>
                  <option>Same as clinic address</option>
                  <option>Custom address</option>
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Delivery Notes" tooltip="Special delivery instructions">
                  <textarea rows={3} className={inputCls} placeholder="Any special delivery requirements..."/>
                </Field>
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-6">
              <div className="p-6 bg-linear-to-r from-teal/5 to-gold/5 rounded-2xl border border-teal/20">
                <h3 className="font-semibold text-text-slate mb-4 flex items-center gap-2">
                  <Shield className="text-teal" size={20} />
                  Legal Declaration
                </h3>
                <p className="text-sm text-muted-grey mb-4">
                  Please review and confirm the following declarations before submitting your case.
                </p>
              </div>
              
              {[
                { 
                  key: "a", 
                  text: "I confirm the patient information provided is accurate and complete.",
                  detail: "This ensures proper identification and treatment planning."
                },
                { 
                  key: "b", 
                  text: "I authorise Prime Smile Dental Laboratory to manufacture this case to the supplied prescription.",
                  detail: "This gives us permission to proceed with the fabrication."
                },
                { 
                  key: "c", 
                  text: "I have informed the patient that materials used are CE-certified and traceable.",
                  detail: "This ensures compliance with medical device regulations."
                },
              ].map(({ key, text, detail }) => (
                <label key={key} className="group block p-6 rounded-2xl border-2 border-border-silver hover:border-teal/50 cursor-pointer transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={(decl as any)[key]} 
                        onChange={(e) => setDecl({ ...decl, [key]: e.target.checked })} 
                        className="w-5 h-5 accent-teal rounded-md border-2 border-border-silver focus:border-teal focus:ring-2 focus:ring-teal/20"
                      />
                      {(decl as any)[key] && (
                        <div className="absolute inset-0 w-5 h-5 bg-teal rounded-md flex items-center justify-center">
                          <CheckCircle2 size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-slate mb-1">{text}</p>
                      <p className="text-xs text-muted-grey">{detail}</p>
                    </div>
                  </div>
                </label>
              ))}
              
              <div className="pt-6">
                <button
                  disabled={!decl.a || !decl.b || !decl.c}
                  onClick={() => {
                    setDone(true);
                    analytics.caseSubmit(services, "Standard");
                    analytics.event("case_completed", "conversion", "digital_submission", 1);
                  }}
                  className="w-full btn-gold text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <FileCheck size={20} />
                  Submit Case & Generate Prescription PDF
                </button>
                <p className="text-xs text-muted-grey text-center mt-3">
                  By submitting, you agree to our terms of service and privacy policy.
                </p>
              </div>
            </div>
          )}
            </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 p-6 bg-linear-to-r from-teal/5 to-gold/5 rounded-2xl">
          <button 
            onClick={prev} 
            disabled={step === 0} 
            className="btn-outline-teal disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Previous Step
          </button>
          
          <div className="text-sm text-muted-grey">
            Step {step + 1} of {STEPS.length}
          </div>
          
          {step < STEPS.length - 1 && (
            <button onClick={next} className="btn-teal flex items-center gap-2">
              Next Step
              <ArrowRight size={16} />
            </button>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
