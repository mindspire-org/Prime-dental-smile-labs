import { useMemo, useState } from "react";

// FDI permanent dentition — occlusal-view layout (matches standard dental chart)
const UPPER = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const LOWER = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

export type ToothRole = "Crown" | "Veneer" | "Inlay" | "Pontic" | "Implant Crown" | "Custom Abutment" | "Missing" | "Other";
export const ROLES: ToothRole[] = ["Crown","Veneer","Inlay","Pontic","Implant Crown","Custom Abutment","Missing","Other"];

interface ToothItem {
  n: number;
  x: number;
  y: number;
  lx: number; // label x
  ly: number; // label y
}

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

    // Label pushed radially outward
    const lr = labelOffset;
    const lx = cx + (rx + lr) * Math.cos(t);
    const ly = isUpper
      ? cy - (ry + lr) * Math.sin(t)
      : cy + (ry + lr) * Math.sin(t);

    return { n, x, y, lx, ly };
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

  const upper = useMemo(
    () => archPositions(UPPER, 200, 88, 148, 58, true, 22),
    []
  );
  const lower = useMemo(
    () => archPositions(LOWER, 200, 228, 148, 58, false, 22),
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

  const tw = 17;
  const th = 22;

  const renderTooth = (t: ToothItem) => {
    const sel = selected[t.n];
    const isActive = active === t.n;
    return (
      <g key={t.n} className="cursor-pointer" style={{ pointerEvents: "all" }}>
        {/* Click target (invisible, larger) */}
        <circle
          cx={t.x}
          cy={t.y}
          r={16}
          fill="transparent"
          onClick={() => setActive(t.n)}
        />
        {/* Tooth shape — upright rounded capsule */}
        <rect
          x={t.x - tw / 2}
          y={t.y - th / 2}
          width={tw}
          height={th}
          rx={8}
          ry={10}
          fill={isActive ? "#0aabbd" : sel ? "#c9a227" : "#ffffff"}
          stroke={isActive ? "#078a99" : sel ? "#a37e1a" : "#cbd5e1"}
          strokeWidth={1.5}
          style={{ pointerEvents: "none" }}
        />
        {/* Number label outside arch */}
        <text
          x={t.lx}
          y={t.ly + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={8}
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

  // Arch outline paths
  const archPath = (arr: ToothItem[], isUpper: boolean) => {
    const s = arr[0];
    const e = arr[arr.length - 1];
    const cy = isUpper ? 88 : 228;
    return `M ${s.x} ${s.y} Q 200 ${isUpper ? cy - 75 : cy + 75} ${e.x} ${e.y}`;
  };

  return (
    <div className="w-full max-w-lg mx-auto select-none">
      <svg viewBox="0 0 400 320" className="w-full h-auto">
        {/* Soft arch outlines */}
        <path
          d={archPath(upper, true)}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <path
          d={archPath(lower, false)}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />

        {/* Subtle palate / tongue area */}
        <path
          d={`M ${upper[0].x} ${upper[0].y} Q 200 ${upper[0].y - 60} ${upper[upper.length - 1].x} ${upper[upper.length - 1].y} L ${lower[lower.length - 1].x} ${lower[lower.length - 1].y} Q 200 ${lower[0].y + 60} ${lower[0].x} ${lower[0].y} Z`}
          fill="#f1f5f9"
          stroke="none"
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
