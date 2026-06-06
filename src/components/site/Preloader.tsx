import { logoUrl } from "@/lib/logo";

export function Preloader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#f0f4f8]"
      style={{ zIndex: 9999 }}>
      <div className="relative w-24 h-24">
        {/* Pulsing rings */}
        <span className="absolute inset-0 rounded-full border-2 border-teal-500/30"
          style={{ animation: "ringPulse 2s ease-out infinite" }} />
        <span className="absolute inset-0 rounded-full border-2 border-teal-500/20"
          style={{ animation: "ringPulse 2s ease-out 0.6s infinite" }} />
        <span className="absolute inset-0 rounded-full border-2 border-teal-500/10"
          style={{ animation: "ringPulse 2s ease-out 1.2s infinite" }} />

        {/* Rotating spinner arc */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="42" fill="none" stroke="#e2e8f0" strokeWidth="4" />
            <circle cx="48" cy="48" r="42" fill="none" stroke="#0aabbd" strokeWidth="4"
              strokeLinecap="round" strokeDasharray="200" strokeDashoffset="80"
              style={{ transformOrigin: "center", animation: "spin 1.2s linear infinite" }} />
          </svg>
        </div>

        {/* Center logo with soft glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg"
            style={{ animation: "logoBreathe 2s ease-in-out infinite" }}
          >
            <img src={logoUrl} alt="" className="w-8 h-8 object-contain" />
          </div>
        </div>
      </div>

      {/* Brand text with animated dots */}
      <div className="mt-8 text-center">
        <p className="text-[15px] font-semibold text-slate-800 tracking-wide">Prime Smile</p>
        <p className="text-[11px] text-slate-400 mt-1 tracking-widest uppercase flex items-center justify-center gap-[2px]">
          Loading
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block w-1 h-1 rounded-full bg-slate-400"
              style={{ animation: `dotFade 1.4s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </p>
      </div>

      <style>{`
        @keyframes ringPulse {
          0%   { transform: scale(0.85); opacity: 1; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes logoBreathe {
          0%, 100% { transform: scale(1);   box-shadow: 0 0 12px rgba(10,171,189,0.15); }
          50%      { transform: scale(1.08); box-shadow: 0 0 24px rgba(10,171,189,0.35); }
        }
        @keyframes dotFade {
          0%, 100% { opacity: 0.2; transform: scale(0.6); }
          50%      { opacity: 1;   transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
