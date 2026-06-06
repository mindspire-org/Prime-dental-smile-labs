import { logoUrl } from "@/lib/logo";

export function Preloader() {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#f0f4f8]">
      <div className="relative w-28 h-28">
        {/* Outer ring — teal dots orbiting on Y axis */}
        <div className="absolute inset-0" style={{ perspective: 600 }}>
          <div style={{ transformStyle: "preserve-3d", animation: "orbit3d 3s linear infinite" }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * 360;
              return (
                <div
                  key={`o-${i}`}
                  className="absolute left-1/2 top-1/2"
                  style={{ transform: `rotateY(${angle}deg) translateZ(50px)` }}
                >
                  <span
                    className="block w-2.5 h-2.5 rounded-full bg-[#0aabbd]"
                    style={{
                      marginLeft: -5,
                      marginTop: -5,
                      opacity: 0.55 + (i % 3) * 0.15,
                      animation: `pulseScale 1.4s ease-in-out ${i * 0.12}s infinite alternate`,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Inner ring — gold dots orbiting on X axis, counter-rotating */}
        <div className="absolute inset-0" style={{ perspective: 600 }}>
          <div style={{ transformStyle: "preserve-3d", animation: "orbit3dReverse 2.4s linear infinite" }}>
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i / 6) * 360;
              return (
                <div
                  key={`i-${i}`}
                  className="absolute left-1/2 top-1/2"
                  style={{ transform: `rotateX(${angle}deg) translateZ(32px)` }}
                >
                  <span
                    className="block w-2 h-2 rounded-full bg-[#c9a227]"
                    style={{
                      marginLeft: -4,
                      marginTop: -4,
                      opacity: 0.5 + (i % 2) * 0.2,
                      animation: `pulseScale 1.2s ease-in-out ${i * 0.18}s infinite alternate`,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Center logo mark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-11 h-11 rounded-full bg-white shadow-[0_4px_20px_rgba(10,171,189,0.25)] flex items-center justify-center"
            style={{ animation: "breathe 2.2s ease-in-out infinite" }}
          >
            <img src={logoUrl} alt="" className="w-7 h-7 object-contain" />
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="mt-8 text-center">
        <p className="text-sm font-semibold text-slate-700 tracking-wide">Prime Smile</p>
        <p className="text-xs text-slate-400 mt-1 tracking-widest uppercase">Loading</p>
      </div>

      <style>{`
        @keyframes orbit3d {
          from { transform: rotateY(0deg) rotateX(22deg); }
          to   { transform: rotateY(360deg) rotateX(22deg); }
        }
        @keyframes orbit3dReverse {
          from { transform: rotateX(0deg) rotateY(-18deg); }
          to   { transform: rotateX(360deg) rotateY(-18deg); }
        }
        @keyframes pulseScale {
          from { transform: scale(0.65); opacity: 0.35; }
          to   { transform: scale(1.25); opacity: 1; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1);   box-shadow: 0 4px 20px rgba(10,171,189,0.2); }
          50%      { transform: scale(1.06); box-shadow: 0 6px 28px rgba(10,171,189,0.38); }
        }
      `}</style>
    </div>
  );
}
