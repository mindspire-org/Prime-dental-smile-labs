import { useMemo, useState, type ReactNode } from "react";

// FDI permanent dentition — occlusal-view layout
const UPPER = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const LOWER = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

export type ToothRole = "Crown" | "Veneer" | "Inlay" | "Pontic" | "Implant Crown" | "Custom Abutment" | "Missing" | "Other";
export const ROLES: ToothRole[] = ["Crown","Veneer","Inlay","Pontic","Implant Crown","Custom Abutment","Missing","Other"];

interface ToothItem {
  n: number;
  x: number;
  y: number;
  rot: number;
  hw: number;
  hh: number;
  shape: string;
}

// Oval centre — all teeth orient/label radially from here.
const OCX = 210;
const OCY = 280;

function toothSize(n: number): { hw: number; hh: number; shape: string } {
  const f = n % 10;
  const upper = n < 30;
  if (f === 1) return upper ? { hw: 10, hh: 12, shape: "incisor" } : { hw: 7, hh: 10, shape: "incisor" };
  if (f === 2) return upper ? { hw: 9, hh: 11, shape: "incisor" } : { hw: 7, hh: 10, shape: "incisor" };
  if (f === 3) return { hw: 9, hh: 12, shape: "canine" };
  if (f <= 5) return { hw: 9, hh: 9, shape: "premolar" };
  if (f <= 7) return { hw: 11, hh: 10, shape: "molar" };
  return { hw: 10, hh: 9, shape: "wisdom" };
}

// 4-point occlusal star (concave diamond) — the fissure pattern.
function star(s: number): string {
  const k = 0.2 * s;
  return `M 0,${-s} Q ${k},${-k} ${s},0 Q ${k},${k} 0,${s} Q ${-k},${k} ${-s},0 Q ${-k},${-k} 0,${-s} Z`;
}

/* ────────────────────────────────
   Anatomical crown shapes (FDI
   chart style) with refined paths.
   ──────────────────────────────── */
function Tooth3D({
  x, y, rot, hw, hh, shape, fill, isMissing, isActive,
}: {
  x: number; y: number; rot: number; hw: number; hh: number;
  shape: string; fill: string; isMissing: boolean; isActive: boolean;
}) {
  const stroke = isActive ? "#2563eb" : "#1a1a1a";
  const sw = isActive ? 2.0 : 1.3;
  const mk = "#1a1a1a";
  const mkw = 1.0;

  let outline: ReactNode;
  let occ: ReactNode = null;

  const w = hw, h = hh;

  if (shape === "molar" || shape === "wisdom") {
    // Rounded rectangle with slight buccal/lingual bulge
    const r = Math.min(w, h) * 0.35;
    outline = (
      <path
        d={`M ${-w + r},${-h}
            Q 0,${-h * 1.04} ${w - r},${-h}
            L ${w},${-h + r}
            Q ${w * 1.02},0 ${w},${h - r}
            L ${w - r},${h}
            Q 0,${h * 1.04} ${-w + r},${h}
            L ${-w},${h - r}
            Q ${-w * 1.02},0 ${-w},${-h + r} Z`}
        fill={fill} stroke={stroke} strokeWidth={sw}
      />
    );
    // 4-point star fissure — exactly like reference
    const s = Math.min(w, h) * 0.58;
    occ = (
      <path
        d={star(s)}
        fill="none" stroke={mk} strokeWidth={mkw} opacity={0.55}
      />
    );
  } else if (shape === "premolar") {
    // Clean ellipse — matches reference perfectly
    outline = (
      <ellipse
        cx={0} cy={0} rx={w} ry={h}
        fill={fill} stroke={stroke} strokeWidth={sw}
      />
    );
    // Simple Y-fissure
    const c = Math.min(w, h) * 0.55;
    occ = (
      <g opacity={0.5}>
        <path d={`M 0,${-c} L 0,${c * 0.1}`} stroke={mk} strokeWidth={mkw} />
        <path d={`M 0,${c * 0.1} L ${-c * 0.42},${c * 0.42}`} stroke={mk} strokeWidth={mkw} />
        <path d={`M 0,${c * 0.1} L ${c * 0.42},${c * 0.42}`} stroke={mk} strokeWidth={mkw} />
      </g>
    );
  } else if (shape === "canine") {
    // Pointed oval — sharper than incisor, simpler than before
    outline = (
      <path
        d={`M 0,${-h}
            C ${w * 0.68},${-h * 0.62} ${w},${-h * 0.12} ${w * 0.82},${h * 0.28}
            C ${w * 0.58},${h * 0.75} ${w * 0.25},${h * 0.95} 0,${h}
            C ${-w * 0.25},${h * 0.95} ${-w * 0.58},${h * 0.75} ${-w * 0.82},${h * 0.28}
            C ${-w},${-h * 0.12} ${-w * 0.68},${-h * 0.62} 0,${-h} Z`}
        fill={fill} stroke={stroke} strokeWidth={sw}
      />
    );
    // Single ridge line
    occ = (
      <path
        d={`M 0,${-h * 0.58} Q ${w * 0.15},0 0,${h * 0.55}`}
        fill="none" stroke={mk} strokeWidth={mkw} opacity={0.45}
      />
    );
  } else {
    // Incisor — shovel shape: wide flat incisal edge, rounded cervical
    outline = (
      <path
        d={`M ${-w * 0.9},${-h * 0.18}
            C ${-w * 0.9},${-h * 0.65} ${-w * 0.38},${-h * 0.98} 0,${-h}
            C ${w * 0.38},${-h * 0.98} ${w * 0.9},${-h * 0.65} ${w * 0.9},${-h * 0.18}
            C ${w * 0.95},${h * 0.28} ${w * 0.48},${h * 0.95} 0,${h}
            C ${-w * 0.48},${h * 0.95} ${-w * 0.95},${h * 0.28} ${-w * 0.9},${-h * 0.18} Z`}
        fill={fill} stroke={stroke} strokeWidth={sw}
      />
    );
    // Incisal edge + two marginal ridges
    occ = (
      <g opacity={0.45}>
        <path d={`M ${-w * 0.55},${-h * 0.52} Q 0,${-h * 0.78} ${w * 0.55},${-h * 0.52}`} fill="none" stroke={mk} strokeWidth={mkw} />
        <path d={`M ${-w * 0.32},${-h * 0.22} L ${-w * 0.32},${h * 0.42}`} fill="none" stroke={mk} strokeWidth={mkw * 0.6} />
        <path d={`M ${w * 0.32},${-h * 0.22} L ${w * 0.32},${h * 0.42}`} fill="none" stroke={mk} strokeWidth={mkw * 0.6} />
      </g>
    );
  }

  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`}>
      {isMissing ? (
        <g opacity={0.6}>
          <rect x={-hw} y={-hh} width={hw * 2} height={hh * 2} rx={hw * 0.35} fill="none" stroke="#999" strokeWidth={1.2} strokeDasharray="3 3" />
          <path d={`M ${-hw * 0.55},${-hh * 0.55} L ${hw * 0.55},${hh * 0.55} M ${hw * 0.55},${-hh * 0.55} L ${-hw * 0.55},${hh * 0.55}`} stroke="#b04030" strokeWidth={1.4} fill="none" />
        </g>
      ) : (
        <>
          {outline}
          {occ}
        </>
      )}
    </g>
  );
}

/* Parabolic horseshoe arch; teeth orient radially from the oval centre. */
function archPositions(
  teeth: number[], cx: number, vertexY: number,
  Rx: number, Ry: number, phiMax: number, isUpper: boolean
): ToothItem[] {
  const n = teeth.length;
  return teeth.map((tooth, i) => {
    const phi = -phiMax + (i / (n - 1)) * (2 * phiMax);
    const x = cx + Rx * Math.sin(phi);
    const y = isUpper ? vertexY + Ry * (1 - Math.cos(phi)) : vertexY - Ry * (1 - Math.cos(phi));
    const rot = (Math.atan2(y - OCY, x - OCX) * 180) / Math.PI + 90;
    const sz = toothSize(tooth);
    return { n: tooth, x, y, rot, hw: sz.hw, hh: sz.hh, shape: sz.shape };
  });
}

/* ────────────────────────────────
   Main Component
   ──────────────────────────────── */
export function ToothChart({
  selected,
  onChange,
}: {
  selected: Record<number, ToothRole>;
  onChange: (next: Record<number, ToothRole>) => void;
}) {
  const [active, setActive] = useState<number | null>(null);

  // Upper opens downward, lower opens upward; mirror around OCY for a clean oval.
  const upper = useMemo(() => archPositions(UPPER, OCX, 70, 155, 190, 1.48, true), []);
  const lower = useMemo(() => archPositions(LOWER, OCX, 490, 155, 190, 1.48, false), []);

  const setRole = (n: number, role: ToothRole) => onChange({ ...selected, [n]: role });
  const remove = (n: number) => {
    const next = { ...selected };
    delete next[n];
    onChange(next);
    setActive(null);
  };

  const summary = useMemo(
    () => Object.entries(selected).map(([n, r]) => `${n}:${r}`).join(", "),
    [selected]
  );

  const getFill = (n: number) => {
    if (active === n) return "#bfdbfe";
    if (selected[n]) return "#fde68a";
    return "#ffffff";
  };

  const renderTooth = (t: ToothItem) => {
    const sel = selected[t.n];
    const isActive = active === t.n;

    const ndx = t.x - OCX;
    const ndy = t.y - OCY;
    const len = Math.hypot(ndx, ndy) || 1;
    const rad = Math.max(t.hw, t.hh);
    const lx = t.x + (ndx / len) * (rad + 14);
    const ly = t.y + (ndy / len) * (rad + 14);

    return (
      <g key={t.n} style={{ pointerEvents: "all" }}>
        <g style={{ pointerEvents: "none" }}>
          <Tooth3D
            x={t.x} y={t.y} rot={t.rot} hw={t.hw} hh={t.hh}
            shape={t.shape} fill={getFill(t.n)}
            isMissing={sel === "Missing"} isActive={isActive}
          />
        </g>
        <text
          x={lx} y={ly}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={14}
          fontWeight={700}
          fontFamily="system-ui, -apple-system, sans-serif"
          fill={isActive ? "#2563eb" : "#111111"}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {t.n}
        </text>
        <ellipse
          cx={t.x} cy={t.y} rx={rad + 5} ry={rad + 5}
          fill="transparent"
          style={{ pointerEvents: "all" }}
          className="cursor-pointer"
          onClick={() => setActive(t.n)}
        />
      </g>
    );
  };

  return (
    <div className="w-full mx-auto select-none" style={{ maxWidth: 340 }}>
      <svg viewBox="0 0 420 560" className="w-full h-auto">
        {/* Faint quadrant cross */}
        <line x1={OCX} y1={20} x2={OCX} y2={540} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3 6" />
        <line x1={24} y1={OCY} x2={396} y2={OCY} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3 6" />

        {/* Teeth */}
        {upper.map(renderTooth)}
        {lower.map(renderTooth)}
      </svg>

      {/* Inline role selector */}
      {active !== null && (
        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-teal">Tooth {active}</span>
            {selected[active] && (
              <button
                type="button"
                onClick={() => remove(active)}
                className="text-[11px] text-red-600 hover:text-red-700 font-medium"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(active, r)}
                className={`text-[11px] px-2.5 py-1 rounded-md border transition ${
                  selected[active] === r
                    ? "bg-teal text-white border-teal"
                    : "bg-white text-slate-600 border-slate-200 hover:border-teal"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-grey mt-3 text-center">
        Click a tooth to select. Selected: {Object.keys(selected).length || "none"}.
      </p>
      {summary && (
        <p className="text-xs text-text-slate mt-1 font-medium text-center">{summary}</p>
      )}
    </div>
  );
}
