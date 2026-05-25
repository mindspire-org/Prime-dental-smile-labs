import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = (createFileRoute as any)("/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Request failed");
      }
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg,#060d14 0%,#0a1a26 60%,#060d14 100%)" }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(10,171,189,0.2)", backdropFilter: "blur(16px)" }}>
          <div className="px-8 pt-8 pb-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 mb-5 transition-colors">
              <ArrowLeft size={12}/> Back to Sign In
            </Link>
            <h1 className="text-xl font-bold text-white">Reset your password</h1>
            <p className="text-sm text-slate-400 mt-1">Enter your email and we'll send a reset link.</p>
          </div>

          <div className="px-8 py-7">
            {sent ? (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-emerald-400"/>
                </div>
                <div>
                  <div className="font-semibold text-white text-base">Check your inbox</div>
                  <p className="text-slate-400 text-sm mt-1">If an account exists for <strong className="text-slate-300">{email}</strong>, a reset link has been sent.</p>
                </div>
                <Link to="/login" className="mt-2 text-sm font-semibold text-teal hover:underline" style={{ color: "#0aabbd" }}>
                  Return to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                  <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}>
                    <Mail size={15} className="text-slate-500 shrink-0"/>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</div>
                )}

                <button type="submit" disabled={loading || !email}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#0aabbd,#007acc)", boxShadow: "0 6px 20px rgba(10,171,189,0.35)" }}>
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            )}
          </div>
        </div>
        <div className="mt-6 text-center text-xs text-slate-700">
          Prime<span style={{ color: "#0aabbd" }}>Smile</span> Labs &mdash; Digital Dental Laboratory
        </div>
      </div>
    </div>
  );
}
