import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { z } from "zod";

export const Route = (createFileRoute as any)("/reset-password")({
  validateSearch: z.object({ token: z.string().optional() }),
  component: ResetPassword,
});

function ResetPassword() {
  const { token } = useSearch({ from: "/reset-password" as any });
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Reset failed");
      setDone(true);
      setTimeout(() => navigate({ to: "/login" }), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg,#060d14 0%,#0a1a26 60%,#060d14 100%)" }}>
      <div className="text-center">
        <div className="text-red-400 font-semibold mb-2">Invalid reset link</div>
        <Link to={"./forgot-password" as any} className="text-sm underline" style={{ color: "#0aabbd" }}>Request a new one</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg,#060d14 0%,#0a1a26 60%,#060d14 100%)" }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(10,171,189,0.2)", backdropFilter: "blur(16px)" }}>
          <div className="px-8 pt-8 pb-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <h1 className="text-xl font-bold text-white">Set new password</h1>
            <p className="text-sm text-slate-400 mt-1">Choose a strong password for your account.</p>
          </div>

          <div className="px-8 py-7">
            {done ? (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-emerald-400"/>
                </div>
                <div>
                  <div className="font-semibold text-white text-base">Password updated!</div>
                  <p className="text-slate-400 text-sm mt-1">Redirecting you to sign in…</p>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                {[["New Password", password, setPassword], ["Confirm Password", confirm, setConfirm]].map(([label, val, setter], idx) => (
                  <div key={label as string}>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">{label as string}</label>
                    <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border transition-colors"
                      style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}>
                      <Lock size={15} className="text-slate-500 shrink-0"/>
                      <input
                        type={show ? "text" : "password"}
                        required minLength={8}
                        value={val as string}
                        onChange={e => (setter as any)(e.target.value)}
                        placeholder="••••••••"
                        className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-600"
                      />
                      {idx === 0 && (
                        <button type="button" onClick={() => setShow(v => !v)} className="text-slate-500 hover:text-slate-300 transition-colors">
                          {show ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {error && (
                  <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</div>
                )}

                <button type="submit" disabled={loading || !password || !confirm}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#0aabbd,#007acc)", boxShadow: "0 6px 20px rgba(10,171,189,0.35)" }}>
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
