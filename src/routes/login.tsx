import { createFileRoute, useNavigate, Link, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Lock, Mail, User, Building2, Phone, BadgeCheck, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { setSession } from "@/lib/api";

export const Route = createFileRoute("/login")({ component: LoginPage });

/* ── tiny field helper ─────────────────────────────────── */
function Field({ icon: Icon, label, type = "text", value, onChange, placeholder, required = true, extra }: {
  icon: any; label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; extra?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
        <input
          type={isPass && show ? "text" : type}
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} required={required}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none text-sm transition-all"
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show ? <EyeOff size={15}/> : <Eye size={15}/>}
          </button>
        )}
        {extra}
      </div>
    </div>
  );
}

/* ── 3-D dental illustration (pure SVG) ────────────────── */
function DentalIllustration() {
  return (
    <svg viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm mx-auto drop-shadow-2xl">
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0aabbd" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#0d1e2c" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="toothGrad" cx="40%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="60%" stopColor="#e8f4f8"/>
          <stop offset="100%" stopColor="#b2d8e2"/>
        </radialGradient>
        <radialGradient id="toothGrad2" cx="40%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="55%" stopColor="#ddf0f5"/>
          <stop offset="100%" stopColor="#9fcfdb"/>
        </radialGradient>
        <linearGradient id="gumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff8fa3"/>
          <stop offset="100%" stopColor="#e05474"/>
        </linearGradient>
        <linearGradient id="mirrorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c8f0f7"/>
          <stop offset="100%" stopColor="#6dd5e8"/>
        </linearGradient>
        <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7f8fa6"/>
          <stop offset="100%" stopColor="#c0cad8"/>
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0aabbd" floodOpacity="0.25"/>
        </filter>
        <filter id="whiteShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.12"/>
        </filter>
      </defs>

      {/* Background glow */}
      <circle cx="210" cy="210" r="200" fill="url(#bgGlow)"/>

      {/* Floating particles */}
      {[
        [60, 80, 4], [350, 100, 3], [380, 300, 5], [40, 320, 3.5],
        [300, 60, 2.5], [130, 360, 4], [310, 380, 3],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#0aabbd" opacity="0.5">
          <animate attributeName="opacity" values="0.5;1;0.5" dur={`${2 + i * 0.4}s`} repeatCount="indefinite"/>
          <animate attributeName="cy" values={`${y};${y - 8};${y}`} dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite"/>
        </circle>
      ))}

      {/* Gum base */}
      <ellipse cx="210" cy="265" rx="130" ry="38" fill="url(#gumGrad)" filter="url(#softShadow)"/>

      {/* Back teeth (molar, left) */}
      <g filter="url(#whiteShadow)">
        <rect x="82" y="165" width="54" height="95" rx="10" fill="url(#toothGrad2)" stroke="#9fcfdb" strokeWidth="1.5"/>
        <rect x="89" y="178" width="40" height="6" rx="3" fill="#b2d8e2" opacity="0.5"/>
        <rect x="89" y="190" width="30" height="5" rx="2.5" fill="#b2d8e2" opacity="0.35"/>
        {/* 3-D highlight */}
        <rect x="82" y="165" width="14" height="95" rx="10" fill="white" opacity="0.35"/>
      </g>

      {/* Back teeth (molar, right) */}
      <g filter="url(#whiteShadow)">
        <rect x="284" y="165" width="54" height="95" rx="10" fill="url(#toothGrad2)" stroke="#9fcfdb" strokeWidth="1.5"/>
        <rect x="291" y="178" width="40" height="6" rx="3" fill="#b2d8e2" opacity="0.5"/>
        <rect x="291" y="190" width="30" height="5" rx="2.5" fill="#b2d8e2" opacity="0.35"/>
        <rect x="284" y="165" width="14" height="95" rx="10" fill="white" opacity="0.35"/>
      </g>

      {/* Left lateral incisor */}
      <g filter="url(#whiteShadow)">
        <rect x="143" y="145" width="46" height="108" rx="10" fill="url(#toothGrad)" stroke="#b2d8e2" strokeWidth="1.5"/>
        <rect x="150" y="158" width="32" height="7" rx="3.5" fill="white" opacity="0.55"/>
        <rect x="143" y="145" width="13" height="108" rx="10" fill="white" opacity="0.4"/>
      </g>

      {/* Right lateral incisor */}
      <g filter="url(#whiteShadow)">
        <rect x="231" y="145" width="46" height="108" rx="10" fill="url(#toothGrad)" stroke="#b2d8e2" strokeWidth="1.5"/>
        <rect x="238" y="158" width="32" height="7" rx="3.5" fill="white" opacity="0.55"/>
        <rect x="231" y="145" width="13" height="108" rx="10" fill="white" opacity="0.4"/>
      </g>

      {/* Central incisors */}
      <g filter="url(#whiteShadow)">
        <rect x="168" y="130" width="40" height="120" rx="11" fill="url(#toothGrad)" stroke="#9fcfdb" strokeWidth="1.5"/>
        <rect x="175" y="144" width="26" height="8" rx="4" fill="white" opacity="0.65"/>
        <rect x="168" y="130" width="13" height="120" rx="11" fill="white" opacity="0.45"/>
      </g>
      <g filter="url(#whiteShadow)">
        <rect x="212" y="130" width="40" height="120" rx="11" fill="url(#toothGrad)" stroke="#9fcfdb" strokeWidth="1.5"/>
        <rect x="219" y="144" width="26" height="8" rx="4" fill="white" opacity="0.65"/>
        <rect x="212" y="130" width="13" height="120" rx="11" fill="white" opacity="0.45"/>
      </g>

      {/* Dental mirror — handle */}
      <g transform="rotate(-35 210 210)" filter="url(#whiteShadow)">
        <rect x="265" y="100" width="10" height="90" rx="5" fill="url(#handleGrad)"/>
        <rect x="268" y="106" width="4" height="78" rx="2" fill="white" opacity="0.3"/>
        {/* Mirror head */}
        <circle cx="270" cy="96" r="22" fill="url(#mirrorGrad)" stroke="#6dd5e8" strokeWidth="2"/>
        <circle cx="270" cy="96" r="22" fill="white" opacity="0.25"/>
        <ellipse cx="264" cy="90" rx="7" ry="5" fill="white" opacity="0.55"/>
      </g>

      {/* Stars / shine sparkles */}
      {[[155, 118],[235, 112],[195, 105]].map(([sx, sy], i) => (
        <g key={i}>
          <line x1={sx} y1={sy - 7} x2={sx} y2={sy + 7} stroke="#0aabbd" strokeWidth="2" strokeLinecap="round">
            <animate attributeName="opacity" values="0;1;0" dur={`${1.6 + i * 0.5}s`} repeatCount="indefinite"/>
          </line>
          <line x1={sx - 7} y1={sy} x2={sx + 7} y2={sy} stroke="#0aabbd" strokeWidth="2" strokeLinecap="round">
            <animate attributeName="opacity" values="0;1;0" dur={`${1.6 + i * 0.5}s`} repeatCount="indefinite"/>
          </line>
        </g>
      ))}

      {/* Badge: "100% Clean" */}
      <g>
        <rect x="290" y="290" width="102" height="36" rx="18" fill="#0aabbd" opacity="0.92" filter="url(#softShadow)"/>
        <text x="341" y="313" textAnchor="middle" fill="white" fontSize="12" fontWeight="700" fontFamily="system-ui">✦ 100% Clean</text>
        <animate attributeName="opacity" values="0.9;1;0.9" dur="2.5s" repeatCount="indefinite"/>
      </g>

      {/* Badge: "Lab Ready" */}
      <g>
        <rect x="28" y="290" width="90" height="36" rx="18" fill="#0d1e2c" opacity="0.88" filter="url(#softShadow)"/>
        <text x="73" y="313" textAnchor="middle" fill="#0aabbd" fontSize="12" fontWeight="700" fontFamily="system-ui">Lab Ready</text>
      </g>
    </svg>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" }) as { redirect?: string };
  const redirectTo = search.redirect || "/portal";
  const [tab, setTab] = useState<"login" | "register">("login");

  /* login state */
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  /* register state */
  const [rName,     setRName]     = useState("");
  const [rEmail,    setREmail]    = useState("");
  const [rPassword, setRPassword] = useState("");
  const [rClinic,   setRClinic]   = useState("");
  const [rPhone,    setRPhone]    = useState("");
  const [rGdc,      setRGdc]      = useState("");

  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (res.status === 503) throw new Error("The server is not connected to the database. Please ensure the backend is running and MongoDB is available.");
      if (!res.ok) throw new Error(data.error || "Login failed");
      setSession(data);
      const role = data.user?.role;
      const isAdmin = role === "admin" || role === "lab_staff";
      navigate({ to: isAdmin ? "/admin" : redirectTo } as any);
    } catch (err) { setError(err instanceof Error ? err.message : "Login failed"); }
    finally { setLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST", credentials: "include", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: rName, email: rEmail, password: rPassword, clinicName: rClinic, phone: rPhone, gdcNumber: rGdc }),
      });
      const data = await res.json();
      if (res.status === 503) throw new Error("The server is not connected to the database. Please ensure the backend is running and MongoDB is available.");
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setSession(data);
      navigate({ to: redirectTo } as any);
    } catch (err) { setError(err instanceof Error ? err.message : "Registration failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "linear-gradient(135deg, #0d1e2c 0%, #0f2a36 50%, #0d1e2c 100%)" }}>

      {/* ── Left panel — illustration ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-12 relative overflow-hidden">
        {/* decorative rings */}
        <div className="absolute inset-0 pointer-events-none">
          {[280, 380, 480].map((s, i) => (
            <div key={i} className="absolute rounded-full border border-cyan-400/10"
              style={{ width: s, height: s, top: "50%", left: "50%", transform: "translate(-50%,-50%)", animationDelay: `${i * 0.4}s` }}/>
          ))}
          {/* slow rotating orbit */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ animation: "spin 40s linear infinite" }}>
            <div className="relative w-96 h-96">
              {[0, 72, 144, 216, 288].map((deg, i) => (
                <div key={i} className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400/40"
                  style={{ top: "50%", left: "50%", transform: `rotate(${deg}deg) translate(190px) translateY(-50%)` }}/>
              ))}
            </div>
          </div>
        </div>

        {/* illustration */}
        <div className={`relative z-10 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ animation: mounted ? "float 4s ease-in-out infinite" : "none" }}>
          <DentalIllustration/>
        </div>

        {/* headline */}
        <div className={`relative z-10 text-center mt-8 transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles size={16} className="text-cyan-400"/>
            <span className="text-cyan-400 text-sm font-semibold tracking-widest uppercase">Dental Lab Portal</span>
            <Sparkles size={16} className="text-cyan-400"/>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">Precision Craftsmanship<br/><span className="text-cyan-400">Delivered Digitally</span></h2>
          <p className="text-slate-400 text-sm mt-3 max-w-xs mx-auto leading-relaxed">
            Submit cases, track progress, and collaborate with your lab — all in one place.
          </p>
          {/* stats row */}
          <div className="flex items-center justify-center gap-8 mt-6">
            {[["500+", "Clinics"], ["99.2%", "On-time"], ["24h", "Avg. turnaround"]].map(([val, lbl]) => (
              <div key={lbl} className="text-center">
                <div className="text-xl font-bold text-white">{val}</div>
                <div className="text-xs text-slate-500 mt-0.5">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* glassy card */}
        <div className={`w-full max-w-md relative transition-all duration-700 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
          {/* card glow */}
          <div className="absolute -inset-1 rounded-3xl opacity-40 blur-xl" style={{ background: "linear-gradient(135deg,#0aabbd,#0077ff)" }}/>
          <div className="relative rounded-3xl overflow-hidden"
            style={{ background: "rgba(15,28,40,0.85)", backdropFilter: "blur(24px)", border: "1px solid rgba(10,171,189,0.25)", boxShadow: "0 32px 64px rgba(0,0,0,0.5)" }}>

            {/* Top logo strip */}
            <div className="px-8 pt-8 pb-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg,#0aabbd,#007acc)", boxShadow: "0 4px 12px rgba(10,171,189,0.4)" }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 2C8 2 5 5 5 9c0 3 1.5 5.5 3 7.5 .5.7 1 2.5 2 3.5h4c1-1 1.5-2.8 2-3.5C17.5 14.5 19 12 19 9c0-4-3-7-7-7z"/>
                    <path d="M9 9c0-1.7 1.3-3 3-3s3 1.3 3 3"/>
                  </svg>
                </div>
                <div>
                  <div className="text-white font-bold text-lg leading-none">Prime<span className="text-cyan-400">Smile</span></div>
                  <div className="text-slate-500 text-[10px] uppercase tracking-widest mt-0.5">Dental Lab</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex rounded-xl p-1 mb-6" style={{ background: "rgba(255,255,255,0.05)" }}>
                {(["login", "register"] as const).map(t => (
                  <button key={t} type="button" onClick={() => { setTab(t); setError(""); }}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={tab === t
                      ? { background: "linear-gradient(135deg,#0aabbd,#007acc)", color: "white", boxShadow: "0 4px 12px rgba(10,171,189,0.35)" }
                      : { color: "rgba(255,255,255,0.4)" }}>
                    {t === "login" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-8 pb-8">
              {/* heading */}
              <div className="mb-5">
                <h1 className="text-xl font-bold text-white">
                  {tab === "login" ? "Welcome back 👋" : "Start your journey ✨"}
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  {tab === "login" ? "Sign in to access your dental lab portal" : "Create your dentist account — it's free"}
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
                  <span className="mt-0.5">⚠</span> {error}
                </div>
              )}

              {/* ── Login form ── */}
              {tab === "login" && (
                <form onSubmit={handleLogin} className="space-y-1">
                  <Field icon={Mail}  label="Email address" type="email"    value={email}    onChange={setEmail}    placeholder="you@clinic.com"/>
                  <Field icon={Lock}  label="Password"      type="password" value={password} onChange={setPassword} placeholder="••••••••"/>
                  <div className="flex justify-end -mt-2 mb-4">
                    <Link to="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Forgot password?</Link>
                  </div>
                  <button disabled={loading} type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-60"
                    style={{ background: loading ? "rgba(10,171,189,0.5)" : "linear-gradient(135deg,#0aabbd,#007acc)", boxShadow: "0 8px 24px rgba(10,171,189,0.35)" }}>
                    {loading ? (
                      <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="8"/></svg> Signing in…</>
                    ) : (
                      <>Sign In <ArrowRight size={16}/></>
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-500 pt-4">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setTab("register")} className="text-cyan-400 hover:text-cyan-300 font-semibold">Create one free</button>
                  </p>
                </form>
              )}

              {/* ── Register form ── */}
              {tab === "register" && (
                <form onSubmit={handleRegister}>
                  <div className="grid grid-cols-2 gap-x-3">
                    <div className="col-span-2"><Field icon={User}      label="Full Name"    value={rName}     onChange={setRName}     placeholder="Dr. Jane Smith"/></div>
                    <div className="col-span-2"><Field icon={Mail}      label="Email"        type="email" value={rEmail}    onChange={setREmail}    placeholder="you@clinic.com"/></div>
                    <div className="col-span-2"><Field icon={Lock}      label="Password"     type="password" value={rPassword} onChange={setRPassword} placeholder="Min. 8 characters"/></div>
                    <div className="col-span-2"><Field icon={Building2} label="Clinic Name"  value={rClinic}   onChange={setRClinic}   placeholder="Bright Smile Dental"/></div>
                    <div><Field icon={Phone}    label="Phone"        value={rPhone}    onChange={setRPhone}    placeholder="+44 7700…" required={false}/></div>
                    <div><Field icon={BadgeCheck} label="GDC Number" value={rGdc}      onChange={setRGdc}      placeholder="GDC…"     required={false}/></div>
                  </div>
                  <button disabled={loading} type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-60 mt-1"
                    style={{ background: loading ? "rgba(10,171,189,0.5)" : "linear-gradient(135deg,#0aabbd,#007acc)", boxShadow: "0 8px 24px rgba(10,171,189,0.35)" }}>
                    {loading ? (
                      <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="8"/></svg> Creating account…</>
                    ) : (
                      <>Create Account <ArrowRight size={16}/></>
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-500 pt-4">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setTab("login")} className="text-cyan-400 hover:text-cyan-300 font-semibold">Sign in</button>
                  </p>
                </form>
              )}
            </div>

            {/* bottom strip */}
            <div className="px-8 py-3 border-t text-center" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
              <Link to="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Back to main site</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
