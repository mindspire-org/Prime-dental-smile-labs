import { useState } from "react";

type ToothType = "incisor" | "canine" | "premolar" | "molar";
type Side = "right" | "left";
export type ToothRole = "Crown" | "Veneer" | "Inlay" | "Pontic" | "Implant Crown" | "Custom Abutment" | "Missing" | "Other";
export const ROLES: ToothRole[] = ["Crown","Veneer","Inlay","Pontic","Implant Crown","Custom Abutment","Missing","Other"];

type Jaw = "upper" | "lower";

type Tooth = {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  type: ToothType;
};

const LOWER_JAW_SHIFT_Y = -28;

const baseTeeth: Tooth[] = [
  // =========================
  // UPPER JAW — RIGHT SIDE 11–18
  // =========================
  { id: 11, x: 474, y: 100, w: 44, h: 64, rotate: 0, type: "incisor" },
  { id: 12, x: 421, y: 118, w: 50, h: 68, rotate: -18, type: "incisor" },
  { id: 13, x: 365, y: 162, w: 56, h: 76, rotate: -28, type: "canine" },
  { id: 14, x: 310, y: 226, w: 60, h: 74, rotate: -28, type: "premolar" },
  { id: 15, x: 264, y: 305, w: 64, h: 76, rotate: -18, type: "premolar" },
  { id: 16, x: 230, y: 396, w: 70, h: 80, rotate: -8, type: "molar" },
  { id: 17, x: 216, y: 493, w: 72, h: 82, rotate: 0, type: "molar" },
  { id: 18, x: 220, y: 590, w: 72, h: 82, rotate: -6, type: "molar" },

  // =========================
  // UPPER JAW — LEFT SIDE 21–28
  // =========================
  { id: 21, x: 526, y: 100, w: 44, h: 64, rotate: 0, type: "incisor" },
  { id: 22, x: 579, y: 118, w: 50, h: 68, rotate: 18, type: "incisor" },
  { id: 23, x: 635, y: 162, w: 56, h: 76, rotate: 28, type: "canine" },
  { id: 24, x: 690, y: 226, w: 60, h: 74, rotate: 28, type: "premolar" },
  { id: 25, x: 736, y: 305, w: 64, h: 76, rotate: 18, type: "premolar" },
  { id: 26, x: 770, y: 396, w: 70, h: 80, rotate: 8, type: "molar" },
  { id: 27, x: 784, y: 493, w: 72, h: 82, rotate: 0, type: "molar" },
  { id: 28, x: 780, y: 590, w: 72, h: 82, rotate: 6, type: "molar" },

  // =========================
  // LOWER JAW — RIGHT SIDE 48–41
  // =========================
  { id: 48, x: 220, y: 710, w: 72, h: 82, rotate: 0, type: "molar" },
  { id: 47, x: 216, y: 807, w: 72, h: 82, rotate: -4, type: "molar" },
  { id: 46, x: 230, y: 894, w: 70, h: 80, rotate: -12, type: "molar" },
  { id: 45, x: 264, y: 982, w: 64, h: 76, rotate: -28, type: "premolar" },
  { id: 44, x: 315, y: 1056, w: 60, h: 74, rotate: -38, type: "premolar" },
  { id: 43, x: 375, y: 1112, w: 56, h: 76, rotate: -30, type: "canine" },
  { id: 42, x: 435, y: 1148, w: 40, h: 60, rotate: -16, type: "incisor" },
  { id: 41, x: 482, y: 1163, w: 36, h: 58, rotate: -4, type: "incisor" },

  // =========================
  // LOWER JAW — LEFT SIDE 31–38
  // =========================
  { id: 31, x: 518, y: 1163, w: 36, h: 58, rotate: 4, type: "incisor" },
  { id: 32, x: 565, y: 1148, w: 40, h: 60, rotate: 16, type: "incisor" },
  { id: 33, x: 625, y: 1112, w: 56, h: 76, rotate: 30, type: "canine" },
  { id: 34, x: 685, y: 1056, w: 60, h: 74, rotate: 38, type: "premolar" },
  { id: 35, x: 736, y: 982, w: 64, h: 76, rotate: 28, type: "premolar" },
  { id: 36, x: 770, y: 894, w: 70, h: 80, rotate: 12, type: "molar" },
  { id: 37, x: 784, y: 807, w: 72, h: 82, rotate: 4, type: "molar" },
  { id: 38, x: 780, y: 710, w: 72, h: 82, rotate: 0, type: "molar" },
];

function getJaw(id: number): Jaw {
  return id < 30 ? "upper" : "lower";
}

function getSide(id: number): Side {
  const secondDigit = id % 10;
  const quadrant = Math.floor(id / 10);
  if (quadrant === 1 || quadrant === 4) return "right";
  if (quadrant === 2 || quadrant === 3) return "left";
  return secondDigit <= 4 ? "right" : "left";
}

function applyFinalLayout(tooth: Tooth): Tooth {
  if (getJaw(tooth.id) === "lower") {
    return { ...tooth, y: tooth.y + LOWER_JAW_SHIFT_Y };
  }
  return tooth;
}

const teeth: Tooth[] = baseTeeth.map(applyFinalLayout);

function getLabelPosition(tooth: Tooth) {
  const jaw = getJaw(tooth.id);
  const side = getSide(tooth.id);

  const sign = side === "right" ? -1 : 1;

  let dx = 0;
  let dy = 0;

  if (jaw === "upper") {
    if (tooth.type === "incisor") {
      dx = tooth.id === 11 || tooth.id === 21 ? 0 : 24 * sign;
      dy = -40;
    } else if (tooth.type === "canine") {
      dx = 30 * sign;
      dy = -16;
    } else if (tooth.type === "premolar") {
      dx = 34 * sign;
      dy = -4;
    } else {
      dx = 36 * sign;
      dy = 8;
    }
  } else {
    if (tooth.type === "incisor") {
      dx = tooth.id === 41 || tooth.id === 31 ? 0 : 16 * sign;
      dy = 56;
    } else if (tooth.type === "canine") {
      dx = 18 * sign;
      dy = 56;
    } else if (tooth.type === "premolar") {
      dx = 30 * sign;
      dy = 34;
    } else {
      dx = 34 * sign;
      dy = 8;
    }
  }

  return {
    x: tooth.x + dx,
    y: tooth.y + dy,
    anchor:
      dx === 0 ? "middle" : side === "right" ? "end" : "start",
  } as const;
}

function toothPath(type: ToothType, w: number, h: number) {
  const hw = w / 2;
  const hh = h / 2;

  if (type === "incisor") {
    return `
      M ${-hw * 0.72} ${-hh * 0.78}
      C ${-hw * 0.4} ${-hh}, ${hw * 0.4} ${-hh}, ${hw * 0.72} ${-hh * 0.78}
      C ${hw * 0.92} ${-hh * 0.18}, ${hw * 0.56} ${hh * 0.8}, 0 ${hh}
      C ${-hw * 0.56} ${hh * 0.8}, ${-hw * 0.92} ${-hh * 0.18}, ${-hw * 0.72} ${-hh * 0.78}
      Z
    `;
  }

  if (type === "canine") {
    return `
      M 0 ${-hh}
      C ${hw * 0.46} ${-hh * 0.96}, ${hw * 0.86} ${-hh * 0.54}, ${hw * 0.84} ${-hh * 0.04}
      C ${hw * 0.82} ${hh * 0.42}, ${hw * 0.42} ${hh * 0.88}, 0 ${hh}
      C ${-hw * 0.42} ${hh * 0.88}, ${-hw * 0.82} ${hh * 0.42}, ${-hw * 0.84} ${-hh * 0.04}
      C ${-hw * 0.86} ${-hh * 0.54}, ${-hw * 0.46} ${-hh * 0.96}, 0 ${-hh}
      Z
    `;
  }

  if (type === "premolar") {
    return `
      M ${-hw * 0.76} ${-hh * 0.82}
      C ${-hw * 0.25} ${-hh * 1.02}, ${hw * 0.66} ${-hh * 0.84}, ${hw * 0.88} ${-hh * 0.24}
      C ${hw * 0.98} ${hh * 0.3}, ${hw * 0.56} ${hh * 0.96}, ${-hw * 0.06} ${hh}
      C ${-hw * 0.72} ${hh * 0.96}, ${-hw * 0.98} ${hh * 0.3}, ${-hw * 0.92} ${-hh * 0.2}
      C ${-hw * 0.88} ${-hh * 0.54}, ${-hw * 0.84} ${-hh * 0.74}, ${-hw * 0.76} ${-hh * 0.82}
      Z
    `;
  }

  return `
    M ${-hw * 0.72} ${-hh * 0.9}
    C ${-hw * 0.28} ${-hh * 1.02}, ${hw * 0.58} ${-hh * 1.02}, ${hw * 0.9} ${-hh * 0.58}
    C ${hw * 1.03} ${-hh * 0.1}, ${hw} ${hh * 0.62}, ${hw * 0.54} ${hh * 0.88}
    C ${hw * 0.06} ${hh * 1.02}, ${-hw * 0.7} ${hh}, ${-hw * 0.94} ${hh * 0.48}
    C ${-hw * 1.04} ${hh * 0.02}, ${-hw} ${-hh * 0.56}, ${-hw * 0.72} ${-hh * 0.9}
    Z
  `;
}

function groovePaths(type: ToothType, w: number, h: number) {
  const hw = w / 2;
  const hh = h / 2;

  if (type === "molar") {
    return [
      `M ${-hw * 0.34} ${-hh * 0.1} C ${-hw * 0.12} ${-hh * 0.02}, ${-hw * 0.08} ${hh * 0.16}, ${-hw * 0.26} ${hh * 0.34}`,
      `M ${hw * 0.34} ${-hh * 0.1} C ${hw * 0.12} ${-hh * 0.02}, ${hw * 0.08} ${hh * 0.16}, ${hw * 0.26} ${hh * 0.34}`,
      `M ${-hw * 0.2} ${hh * 0.02} C ${-hw * 0.04} ${-hh * 0.08}, ${hw * 0.04} ${-hh * 0.08}, ${hw * 0.2} ${hh * 0.02}`,
      `M 0 ${-hh * 0.34} C ${-hw * 0.04} ${-hh * 0.12}, ${hw * 0.04} ${hh * 0.12}, 0 ${hh * 0.34}`,
    ];
  }

  if (type === "premolar") {
    return [
      `M ${-hw * 0.26} ${-hh * 0.05} C ${-hw * 0.08} ${hh * 0.07}, ${hw * 0.08} ${hh * 0.07}, ${hw * 0.26} ${-hh * 0.05}`,
      `M 0 ${-hh * 0.32} C ${-hw * 0.06} ${-hh * 0.08}, ${hw * 0.06} ${hh * 0.08}, 0 ${hh * 0.32}`,
    ];
  }

  if (type === "canine") {
    return [
      `M 0 ${-hh * 0.42} C ${-hw * 0.06} ${-hh * 0.08}, ${hw * 0.06} ${hh * 0.16}, 0 ${hh * 0.42}`,
      `M ${-hw * 0.22} ${hh * 0.1} C ${-hw * 0.06} ${hh * 0.25}, ${hw * 0.06} ${hh * 0.25}, ${hw * 0.22} ${hh * 0.1}`,
    ];
  }

  return [
    `M ${-hw * 0.34} ${-hh * 0.4} C ${-hw * 0.1} ${-hh * 0.56}, ${hw * 0.1} ${-hh * 0.56}, ${hw * 0.34} ${-hh * 0.4}`,
  ];
}

export function ToothChart({
  selected,
  onChange,
}: {
  selected: Record<number, ToothRole>;
  onChange: (next: Record<number, ToothRole>) => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const setRole = (id: number, role: ToothRole) => onChange({ ...selected, [id]: role });
  const clearTooth = (id: number) => {
    const next = { ...selected };
    delete next[id];
    onChange(next);
    setActive(null);
  };

  const getFill = (id: number) => {
    if (selected[id] === "Missing") return "#ffffff";
    if (active === id) return "#bfdbfe";
    if (selected[id]) return "#fde68a";
    if (hovered === id) return "#f3f4f6";
    return "#ffffff";
  };

  const summary = Object.entries(selected)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([id, r]) => `${id}:${r}`)
    .join(", ");

  return (
    <div
      className="w-full select-none"
      style={{ maxWidth: 650, margin: "0 auto" }}
    >
      <svg
        viewBox="0 0 1000 1220"
        width="100%"
        height="auto"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="FDI dental tooth chart"
      >
        <rect width="1000" height="1220" rx="16" fill="#ffffff" />

        {/* Jaw labels */}
        <text x="500" y="252" textAnchor="middle" fontSize="24" fontWeight="700" fill="#9ca3af" letterSpacing="0.08em">
          UPPER JAW
        </text>
        <text x="500" y="935" textAnchor="middle" fontSize="24" fontWeight="700" fill="#9ca3af" letterSpacing="0.08em">
          LOWER JAW
        </text>

        {/* Divider lines */}
        <line x1="500" y1="52" x2="500" y2="1192" stroke="#d1d5db" strokeWidth="1.8" strokeDasharray="8 8" />
        <line x1="150" y1="620" x2="850" y2="620" stroke="#d1d5db" strokeWidth="1.8" strokeDasharray="8 8" />

        {teeth.map((tooth) => {
          const label = getLabelPosition(tooth);
          const role = selected[tooth.id];
          const isActive = active === tooth.id;
          const isMissing = role === "Missing";
          const hw = tooth.w / 2;
          const hh = tooth.h / 2;

          return (
            <g key={tooth.id}>
              <text
                x={label.x}
                y={label.y}
                textAnchor={label.anchor}
                fontSize="24"
                fontWeight="800"
                fill={isActive ? "#2563eb" : "#111827"}
                style={{ userSelect: "none", pointerEvents: "none" }}
              >
                {tooth.id}
              </text>

              <g
                transform={`translate(${tooth.x} ${tooth.y}) rotate(${tooth.rotate})`}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((cur) => (cur === tooth.id ? null : tooth.id));
                }}
                onMouseEnter={() => setHovered(tooth.id)}
                onMouseLeave={() => setHovered((h) => (h === tooth.id ? null : h))}
              >
                <path
                  d={toothPath(tooth.type, tooth.w, tooth.h)}
                  fill={getFill(tooth.id)}
                  stroke={isActive ? "#2563eb" : "#111111"}
                  strokeWidth={isActive ? 3.2 : 2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={isMissing ? "8 7" : undefined}
                  opacity={isMissing ? 0.55 : 1}
                />

                {!isMissing &&
                  groovePaths(tooth.type, tooth.w, tooth.h).map((d, index) => (
                    <path
                      key={index}
                      d={d}
                      fill="none"
                      stroke="#111111"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}

                {isMissing && (
                  <path
                    d={`M ${-hw * 0.55} ${-hh * 0.55} L ${hw * 0.55} ${hh * 0.55} M ${hw * 0.55} ${-hh * 0.55} L ${-hw * 0.55} ${hh * 0.55}`}
                    stroke="#b04030"
                    strokeWidth="2.8"
                    fill="none"
                    strokeLinecap="round"
                  />
                )}
              </g>
            </g>
          );
        })}
      </svg>

      {/* Role selector */}
      {active !== null && (
        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-900">Tooth {active}</span>
            {selected[active] && (
              <button
                type="button"
                onClick={() => clearTooth(active)}
                className="text-[11px] text-red-600 hover:text-red-700 font-medium bg-transparent border-none cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ROLES.map((r) => {
              const on = selected[active] === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(active, r)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition ${
                    on
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-900"
                  }`}
                >
                  {r}
                </button>
              );
            })}
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