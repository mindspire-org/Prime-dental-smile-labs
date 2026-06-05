import { useMemo, useState } from "react";

// FDI permanent dentition — occlusal-view layout
const UPPER = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const LOWER = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

export type ToothRole = "Crown" | "Veneer" | "Inlay" | "Pontic" | "Implant Crown" | "Custom Abutment" | "Missing" | "Other";
export const ROLES: ToothRole[] = ["Crown","Veneer","Inlay","Pontic","Implant Crown","Custom Abutment","Missing","Other"];

interface ToothItem {
  n: number;
  x: number;
  y: number;
  lx: number;
  ly: number;
  rot: number;
  rw: number; // ellipse radius x
  rh: number; // ellipse radius y
}

/* Position teeth along a wide flat elliptical arc.
   The arch is very wide (large rx) and relatively flat (small ry)
   so it resembles a real dental arch viewed from above. */
function archPositions(
  teeth: number[],
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  isUpper: boolean,
  labelOffset: number
): ToothItem[] {
  const count = teeth.length;
  return teeth.map((n, i) => {
    const t = Math.PI - (i * Math.PI) / (count - 1); // π → 0 (left → right)

    const x = cx + rx * Math.cos(t);
    const y = isUpper ? cy - ry * Math.sin(t) : cy + ry * Math.sin(t);

    // Labels pushed radially outward
    const lx = cx + (rx + labelOffset) * Math.cos(t);
    const ly = isUpper
      ? cy - (ry + labelOffset) * Math.sin(t)
      : cy + (ry + labelOffset) * Math.sin(t);

    // Rotation so the tooth follows the arch tangent
    const dx = -rx * Math.sin(t);
    const dy = isUpper ? -ry * Math.cos(t) : ry * Math.cos(t);
    const rot = (Math.atan2(dy, dx) * 180) / Math.PI - 90;

    // Tooth size: back molars are biggest, front incisors smallest
    const distFromCenter = Math.abs(i - (count - 1) / 2);
    const rw = distFromCenter < 2 ? 11 : distFromCenter < 5 ? 13 : 15;
    const rh = distFromCenter < 2 ? 14 : distFromCenter < 5 ? 17 : 20;

    return { n, x, y, lx, ly, rot, rw, rh };
  });
}

export function ToothChart({
  selected,
  onChange,
}: {
  selected: Record<number, ToothRole>;
  onChange: (next: Record<number, ToothRole>) => void;
}) {
  const [active, setActive] = useState<number | null>(null);

  /* Wide flat dental arch */
  const upper = useMemo(
    () => archPositions(UPPER, 350, 130, 280, 48, true, 32),
    []
  );
  const lower = useMemo(
    () => archPositions(LOWER, 350, 320, 280, 48, false, 32),
    []
  );

  const setRole = (n: number, role: ToothRole) => {
    const next = { ...selected, [n]: role };
    onChange(next);
  };
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

  const renderTooth = (t: ToothItem) => {
    const sel = selected[t.n];
    const isActive = active === t.n;
    const fill = isActive ? "#0aabbd" : sel ? "#c9a227" : "#ffffff";
    const stroke = isActive ? "#078a99" : sel ? "#a37e1a" : "#94a3b8";

    return (
      <g key={t.n} className="cursor-pointer" style={{ pointerEvents: "all" }}>
        {/* Click target */}
        <circle
          cx={t.x}
          cy={t.y}
          r={22}
          fill="transparent"
          onClick={() => setActive(t.n)}
        />
        {/* Tooth: rotated ellipse, wider than tall */}
        <ellipse
          cx={t.x}
          cy={t.y}
          rx={t.rw}
          ry={t.rh}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.5}
          transform={`rotate(${t.rot}, ${t.x}, ${t.y})`}
          style={{ pointerEvents: "none" }}
        />
        {/* Number label outside the arch */}
        <text
          x={t.lx}
          y={t.ly + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={11}
          fontWeight={700}
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#475569"
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {t.n}
        </text>
      </g>
    );
  };

  const archPath = (arr: ToothItem[], isUpper: boolean) => {
    const s = arr[0];
    const e = arr[arr.length - 1];
    const cy = isUpper ? 130 : 320;
    const controlY = isUpper ? cy - 115 : cy + 115;
    return `M ${s.x} ${s.y} Q 350 ${controlY} ${e.x} ${e.y}`;
  };

  return (
    <div className="w-full mx-auto select-none">
      <svg viewBox="0 0 700 450" className="w-full h-auto">
        {/* Soft background fill between arches */}
        <path
          d={`M ${upper[0].x} ${upper[0].y} Q 350 ${upper[0].y - 100} ${upper[upper.length - 1].x} ${upper[upper.length - 1].y} L ${lower[lower.length - 1].x} ${lower[lower.length - 1].y} Q 350 ${lower[0].y + 100} ${lower[0].x} ${lower[0].y} Z`}
          fill="#f8fafc"
          stroke="none"
        />

        {/* Arch guide lines */}
        <path
          d={archPath(upper, true)}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={2}
          strokeDasharray="6 6"
        />
        <path
          d={archPath(lower, false)}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={2}
          strokeDasharray="6 6"
        />

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
