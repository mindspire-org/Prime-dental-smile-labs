import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch, clearSession, getAccessToken, getCurrentUser, setSession, type AuthUser } from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";
import { Save, Eye, EyeOff, LogOut } from "lucide-react";

export const Route = createFileRoute("/portal/profile")({
  component: PortalProfile,
});

function PortalProfile() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", gdcNumber: "" });
  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    if (u) setForm(f => ({ ...f, name: u.name || "", email: u.email || "" }));
  }, []);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  async function saveProfile() {
    setSaving(true);
    try {
      const r = await apiFetch<any>("/api/auth/me", { method: "PATCH", body: JSON.stringify({ name: form.name, phone: form.phone }) });
      if (r.user) setSession({ accessToken: getAccessToken() || "", user: r.user });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  }

  async function changePassword() {
    setPwError("");
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords do not match"); return; }
    if (pwForm.next.length < 8) { setPwError("Password must be at least 8 characters"); return; }
    setPwSaving(true);
    try {
      await apiFetch("/api/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }) });
      setPwForm({ current: "", next: "", confirm: "" });
      setPwSuccess(true); setTimeout(() => setPwSuccess(false), 3000);
    } catch (e: any) {
      setPwError(e.message || "Failed to change password");
    } finally { setPwSaving(false); }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "#0aabbd" }}>Portal</div>
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
      </div>

      {/* Avatar + info */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
          style={{ background: "linear-gradient(135deg,#0aabbd,#078a99)" }}>
          {user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "DR"}
        </div>
        <div>
          <div className="font-bold text-slate-800 text-lg">{user?.name}</div>
          <div className="text-sm text-slate-400">{user?.email}</div>
          <div className="text-[11px] mt-1 px-2 py-0.5 rounded-full bg-cyan-50 text-teal inline-block font-semibold capitalize">{user?.role}</div>
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full inline-block" style={{ background: "#0aabbd" }} />
          Account Details
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[["Full Name", "name", "text"], ["Email", "email", "email"]].map(([label, field, type]) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
              <input type={type} value={(form as any)[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                disabled={field === "email"}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal transition-colors disabled:bg-slate-50 disabled:text-slate-400" />
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-5">
          <button onClick={saveProfile} disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
            style={saved ? { background: "#10b981" } : { background: "linear-gradient(90deg,#0aabbd,#078a99)" }}>
            <Save size={14} />{saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Password change */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-amber-400 inline-block" />
          Change Password
        </h2>
        <div className="space-y-3">
          {[["Current Password", "current"], ["New Password", "next"], ["Confirm New Password", "confirm"]].map(([label, field]) => (
            <div key={field} className="relative">
              <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
              <input type={showPw ? "text" : "password"} value={(pwForm as any)[field]}
                onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full px-3 py-2.5 pr-9 rounded-xl border border-slate-200 text-sm outline-none focus:border-teal transition-colors" />
              {field === "next" && (
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 bottom-2.5 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              )}
            </div>
          ))}
          {pwError && <div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{pwError}</div>}
          {pwSuccess && <div className="text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl">Password changed successfully!</div>}
        </div>
        <div className="flex justify-end mt-5">
          <button onClick={changePassword} disabled={pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(90deg,#c9a227,#a37e1a)" }}>
            {pwSaving ? "Changing…" : "Change Password"}
          </button>
        </div>
      </div>

      {/* Sign out */}
      <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {}); clearSession(); navigate({ to: "/" }); }}
        className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 font-medium transition-colors">
        <LogOut size={15} /> Sign out of all devices
      </button>
    </div>
  );
}
