import { useMemo, useState } from "react";

// FDI permanent dentition arranged as visual dental arch
const UPPER = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const LOWER = [38,37,36,35,34,33,32,31,41,42,43,44,45,46,47,48];

export type ToothRole = "Crown" | "Veneer" | "Inlay" | "Pontic" | "Implant Crown" | "Custom Abutment" | "Missing" | "Other";
export const ROLES: ToothRole[] = ["Crown","Veneer","Inlay","Pontic","Implant Crown","Custom Abutment","Missing","Other"];

interface ToothPos {
  n: number;
  x: number;
  y: number;
  rot: number;
}

function computePositions(
  teeth: number[],
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  isUpper: boolean
): ToothPos[] {
  const count = teeth.length;
  return teeth.map((n, i) => {
    const theta = Math.PI - (i * Math.PI) / (count - 1); // π → 0 across the arch
    const x = cx + rx * Math.cos(theta);
    const y = isUpper ? cy - ry * Math.sin(theta) : cy + ry * Math.sin(theta);
    const dx = -rx * Math.sin(theta);
    const dy = isUpper ? -ry * Math.cos(theta) : ry * Math.cos(theta);
    const rot = (Math.atan2(dy, dx) * 180) / Math.PI - 90;
    return { n, x, y, rot };
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
    () => computePositions(UPPER, 200, 80, 155, 65, true),
    []
  );
  const lower = useMemo(
    () => computePositions(LOWER, 200, 220, 155, 65, false),
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

  const tw = 16;
  const th = 20;

  const renderTooth = (t: ToothPos) => {
    const sel = selected[t.n];
    const isActive = active === t.n;
    return (
      <g
        key={t.n}
        transform={`translate(${t.x}, ${t.y}) rotate(${t.rot})`}
        onClick={() => setActive(t.n)}
        className="cursor-pointer"
        style={{ pointerEvents: "all" }}
      >
        <rect
          x={-tw / 2}
          y={-th / 2}
          width={tw}
          height={th}
          rx={4}
          ry={6}
          fill={isActive ? "#0aabbd" : sel ? "#c9a227" : "#ffffff"}
          stroke={isActive ? "#078a99" : sel ? "#a37e1a" : "#cbd5e1"}
          strokeWidth={1.5}
        />
        <text
          x={0}
          y={1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={7}
          fontWeight={700}
          fontFamily="system-ui, -apple-system, sans-serif"
          fill={isActive ? "#ffffff" : sel ? "#1e293b" : "#64748b"}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {t.n}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto select-none">
      <svg viewBox="0 0 400 300" className="w-full h-auto">
        {/* Arch guide lines */}
        <path
          d={`M ${upper[0].x} ${upper[0].y} Q 200 ${upper[0].y - 50} ${upper[upper.length - 1].x} ${upper[upper.length - 1].y}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <path
          d={`M ${lower[0].x} ${lower[0].y} Q 200 ${lower[0].y + 50} ${lower[lower.length - 1].x} ${lower[lower.length - 1].y}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />

        {/* Labels */}
        <text x="200" y="28" textAnchor="middle" fontSize={10} fill="#64748b" fontWeight={600} fontFamily="system-ui, -apple-system, sans-serif">
          Upper teeth
        </text>
        <text x="200" y="278" textAnchor="middle" fontSize={10} fill="#64748b" fontWeight={600} fontFamily="system-ui, -apple-system, sans-serif">
          Lower teeth
        </text>
        <text x="22" y="60" textAnchor="middle" fontSize={9} fill="#94a3b8" fontFamily="system-ui, -apple-system, sans-serif">Right</text>
        <text x="378" y="60" textAnchor="middle" fontSize={9} fill="#94a3b8" fontFamily="system-ui, -apple-system, sans-serif">Left</text>
        <text x="22" y="240" textAnchor="middle" fontSize={9} fill="#94a3b8" fontFamily="system-ui, -apple-system, sans-serif">Right</text>
        <text x="378" y="240" textAnchor="middle" fontSize={9} fill="#94a3b8" fontFamily="system-ui, -apple-system, sans-serif">Left</text>

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
