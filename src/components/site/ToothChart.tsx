import { useState } from "react";
import type { CSSProperties } from "react";

type ToothType = "incisor" | "canine" | "premolar" | "molar";
type Jaw = "upper" | "lower";
type Side = "right" | "left";

export type ToothRole = "Crown" | "Veneer" | "Inlay" | "Pontic" | "Implant Crown" | "Custom Abutment" | "Missing" | "Other";
export const ROLES: ToothRole[] = ["Crown","Veneer","Inlay","Pontic","Implant Crown","Custom Abutment","Missing","Other"];

type Tooth = {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
  type: ToothType;
};

const COLORS = {
  page: "#ffffff",
  chartBg: "#f5f5f5",
  stroke: "#111111",
  guide: "#bdbdbd",
  label: "#111111",
  softLabel: "#9ca3af",
  border: "#e5e7eb",
};

const teeth: Tooth[] = [
  // =========================
  // UPPER JAW
  // Corrected carefully: reduced gap without overlap
  // =========================

  // Right side: 11–18
  { id: 11, x: 470, y: 112, w: 60, h: 84, rotate: 0, type: "incisor" },
  { id: 12, x: 424, y: 122, w: 55, h: 80, rotate: -18, type: "incisor" },
  { id: 13, x: 382, y: 150, w: 54, h: 74, rotate: -28, type: "canine" },
  { id: 14, x: 338, y: 198, w: 58, h: 72, rotate: -28, type: "premolar" },
  { id: 15, x: 294, y: 258, w: 66, h: 76, rotate: -18, type: "premolar" },
  { id: 16, x: 258, y: 334, w: 72, h: 80, rotate: -8, type: "molar" },
  { id: 17, x: 236, y: 425, w: 74, h: 84, rotate: 0, type: "molar" },
  { id: 18, x: 238, y: 514, w: 74, h: 84, rotate: -6, type: "molar" },

  // Left side: 21–28
  { id: 21, x: 530, y: 112, w: 60, h: 84, rotate: 0, type: "incisor" },
  { id: 22, x: 576, y: 122, w: 55, h: 80, rotate: 18, type: "incisor" },
  { id: 23, x: 618, y: 150, w: 54, h: 74, rotate: 28, type: "canine" },
  { id: 24, x: 662, y: 198, w: 58, h: 72, rotate: 28, type: "premolar" },
  { id: 25, x: 706, y: 258, w: 66, h: 76, rotate: 18, type: "premolar" },
  { id: 26, x: 742, y: 334, w: 72, h: 80, rotate: 8, type: "molar" },
  { id: 27, x: 764, y: 425, w: 74, h: 84, rotate: 0, type: "molar" },
  { id: 28, x: 762, y: 514, w: 74, h: 84, rotate: 6, type: "molar" },

  // =========================
  // LOWER JAW
  // Preserved corrected anterior arc: 43 → 42 → 41 → 31 → 32 → 33
  // =========================

  // Right side: 48–41
  { id: 48, x: 238, y: 660, w: 74, h: 84, rotate: 0, type: "molar" },
  { id: 47, x: 236, y: 744, w: 74, h: 84, rotate: -4, type: "molar" },
  { id: 46, x: 252, y: 824, w: 72, h: 80, rotate: -12, type: "molar" },
  { id: 45, x: 290, y: 898, w: 66, h: 76, rotate: -28, type: "premolar" },
  { id: 44, x: 336, y: 958, w: 58, h: 72, rotate: -38, type: "premolar" },
  { id: 43, x: 393, y: 1005, w: 52, h: 74, rotate: -30, type: "canine" },
  { id: 42, x: 439, y: 1039, w: 42, h: 62, rotate: 162, type: "incisor" },
  { id: 41, x: 481, y: 1055, w: 38, h: 60, rotate: 175, type: "incisor" },

  // Left side: 31–38
  { id: 31, x: 519, y: 1055, w: 38, h: 60, rotate: 185, type: "incisor" },
  { id: 32, x: 561, y: 1039, w: 42, h: 62, rotate: 198, type: "incisor" },
  { id: 33, x: 607, y: 1005, w: 52, h: 74, rotate: 30, type: "canine" },
  { id: 34, x: 664, y: 958, w: 58, h: 72, rotate: 38, type: "premolar" },
  { id: 35, x: 710, y: 898, w: 66, h: 76, rotate: 28, type: "premolar" },
  { id: 36, x: 748, y: 824, w: 72, h: 80, rotate: 12, type: "molar" },
  { id: 37, x: 764, y: 744, w: 74, h: 84, rotate: 4, type: "molar" },
  { id: 38, x: 762, y: 660, w: 74, h: 84, rotate: 0, type: "molar" },
];

function getJaw(id: number): Jaw {
  return id < 30 ? "upper" : "lower";
}

function getSide(id: number): Side {
  const quadrant = Math.floor(id / 10);
  return quadrant === 1 || quadrant === 4 ? "right" : "left";
}

function getLabelPosition(tooth: Tooth) {
  const jaw = getJaw(tooth.id);
  const side = getSide(tooth.id);
  const dir = side === "right" ? -1 : 1;

  let dx = 0;
  let dy = 0;

  if (jaw === "upper") {
    if (tooth.id === 11 || tooth.id === 21) {
      dx = tooth.id === 11 ? -8 : 8;
      dy = -58;
    } else if (tooth.type === "incisor") {
      dx = 22 * dir;
      dy = -42;
    } else if (tooth.type === "canine") {
      dx = 28 * dir;
      dy = -16;
    } else if (tooth.type === "premolar") {
      dx = 34 * dir;
      dy = 0;
    } else {
      dx = 38 * dir;
      dy = 12;
    }
  } else {
    if (tooth.id === 41 || tooth.id === 31) {
      dx = tooth.id === 41 ? -6 : 6;
      dy = 58;
    } else if (tooth.type === "incisor") {
      dx = 15 * dir;
      dy = 56;
    } else if (tooth.type === "canine") {
      dx = 22 * dir;
      dy = 52;
    } else if (tooth.type === "premolar") {
      dx = 30 * dir;
      dy = 34;
    } else {
      dx = 36 * dir;
      dy = 12;
    }
  }

  return {
    x: tooth.x + dx,
    y: tooth.y + dy,
    anchor: dx === 0 ? "middle" : side === "right" ? "end" : "start",
  } as const;
}

function toothPath(type: ToothType, w: number, h: number) {
  const hw = w / 2;
  const hh = h / 2;

  if (type === "incisor") {
    return `
      M ${-hw * 0.78} ${-hh * 0.8}
      C ${-hw * 0.5} ${-hh}, ${hw * 0.5} ${-hh}, ${hw * 0.78} ${-hh * 0.8}
      C ${hw * 0.94} ${-hh * 0.22}, ${hw * 0.6} ${hh * 0.78}, 0 ${hh}
      C ${-hw * 0.6} ${hh * 0.78}, ${-hw * 0.94} ${-hh * 0.22}, ${-hw * 0.78} ${-hh * 0.8}
      Z
    `;
  }

  if (type === "canine") {
    return `
      M 0 ${-hh * 0.92}
      C ${hw * 0.28} ${-hh * 0.94}, ${hw * 0.66} ${-hh * 0.74}, ${hw * 0.82} ${-hh * 0.34}
      C ${hw * 0.98} ${hh * 0.08}, ${hw * 0.66} ${hh * 0.78}, 0 ${hh}
      C ${-hw * 0.66} ${hh * 0.78}, ${-hw * 0.98} ${hh * 0.08}, ${-hw * 0.82} ${-hh * 0.34}
      C ${-hw * 0.66} ${-hh * 0.74}, ${-hw * 0.28} ${-hh * 0.94}, 0 ${-hh * 0.92}
      Z
    `;
  }

  if (type === "premolar") {
    return `
      M ${-hw * 0.76} ${-hh * 0.84}
      C ${-hw * 0.22} ${-hh * 1.02}, ${hw * 0.68} ${-hh * 0.82}, ${hw * 0.9} ${-hh * 0.22}
      C ${hw} ${hh * 0.32}, ${hw * 0.56} ${hh * 0.98}, ${-hw * 0.06} ${hh}
      C ${-hw * 0.74} ${hh * 0.98}, ${-hw} ${hh * 0.3}, ${-hw * 0.94} ${-hh * 0.2}
      C ${-hw * 0.9} ${-hh * 0.54}, ${-hw * 0.86} ${-hh * 0.76}, ${-hw * 0.76} ${-hh * 0.84}
      Z
    `;
  }

  return `
    M ${-hw * 0.72} ${-hh * 0.92}
    C ${-hw * 0.26} ${-hh * 1.04}, ${hw * 0.58} ${-hh * 1.02}, ${hw * 0.9} ${-hh * 0.58}
    C ${hw * 1.04} ${-hh * 0.1}, ${hw} ${hh * 0.64}, ${hw * 0.54} ${hh * 0.88}
    C ${hw * 0.06} ${hh * 1.04}, ${-hw * 0.72} ${hh}, ${-hw * 0.94} ${hh * 0.48}
    C ${-hw * 1.06} ${hh * 0.04}, ${-hw * 1.02} ${-hh * 0.56}, ${-hw * 0.72} ${-hh * 0.92}
    Z
  `;
}

function groovePaths(type: ToothType, w: number, h: number) {
  const hw = w / 2;
  const hh = h / 2;

  if (type === "molar") {
    return [
      `M ${-hw * 0.34} ${-hh * 0.12} C ${-hw * 0.12} ${-hh * 0.02}, ${-hw * 0.1} ${hh * 0.16}, ${-hw * 0.28} ${hh * 0.34}`,
      `M ${hw * 0.34} ${-hh * 0.12} C ${hw * 0.12} ${-hh * 0.02}, ${hw * 0.1} ${hh * 0.16}, ${hw * 0.28} ${hh * 0.34}`,
      `M ${-hw * 0.2} ${hh * 0.02} C ${-hw * 0.04} ${-hh * 0.08}, ${hw * 0.04} ${-hh * 0.08}, ${hw * 0.2} ${hh * 0.02}`,
      `M 0 ${-hh * 0.34} C ${-hw * 0.04} ${-hh * 0.12}, ${hw * 0.04} ${hh * 0.12}, 0 ${hh * 0.34}`,
    ];
  }

  if (type === "premolar") {
    return [
      `M ${-hw * 0.28} ${-hh * 0.06} C ${-hw * 0.08} ${hh * 0.08}, ${hw * 0.08} ${hh * 0.08}, ${hw * 0.28} ${-hh * 0.06}`,
      `M 0 ${-hh * 0.34} C ${-hw * 0.06} ${-hh * 0.08}, ${hw * 0.06} ${hh * 0.08}, 0 ${hh * 0.34}`,
    ];
  }

  if (type === "canine") {
    return [
      `M 0 ${-hh * 0.36} C ${-hw * 0.05} ${-hh * 0.08}, ${hw * 0.05} ${hh * 0.16}, 0 ${hh * 0.36}`,
      `M ${-hw * 0.16} ${hh * 0.12} C ${-hw * 0.05} ${hh * 0.22}, ${hw * 0.05} ${hh * 0.22}, ${hw * 0.16} ${hh * 0.12}`,
    ];
  }

  return [
    `M ${-hw * 0.36} ${-hh * 0.4} C ${-hw * 0.1} ${-hh * 0.58}, ${hw * 0.1} ${-hh * 0.58}, ${hw * 0.36} ${-hh * 0.4}`,
  ];
}

const textCommon: CSSProperties = {
  userSelect: "none",
  pointerEvents: "none",
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

export function ToothChart({
  selected,
  onChange,
  readOnly = false,
}: {
  selected: Record<number, ToothRole>;
  onChange?: (next: Record<number, ToothRole>) => void;
  readOnly?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const setRole = (id: number, role: ToothRole) => onChange?.({ ...selected, [id]: role });
  const clearTooth = (id: number) => {
    const next = { ...selected };
    delete next[id];
    onChange?.(next);
    setActive(null);
  };

  const getFill = (id: number) => {
    if (selected[id] === "Missing") return COLORS.chartBg;
    if (active === id) return "#bfdbfe";
    if (selected[id]) return "#fde68a";
    if (hovered === id) return "#e5e7eb";
    return COLORS.chartBg;
  };

  const summary = Object.entries(selected)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([id, r]) => `${id}:${r}`)
    .join(", ");

  return (
    <div
      className="w-full select-none"
      style={{
        maxWidth: 640,
        margin: "0 auto",
        background: COLORS.page,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 20,
        padding: 10,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <svg
        viewBox="0 0 1000 1145"
        width="100%"
        height="min(86vh, 900px)"
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: "auto",
          maxWidth: "100%",
          display: "block",
        }}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="FDI dental tooth chart"
      >
        <rect width="1000" height="1145" rx="18" fill={COLORS.chartBg} onClick={() => !readOnly && setActive(null)} />

        <line
          x1="500"
          y1="18"
          x2="500"
          y2="1127"
          stroke={COLORS.guide}
          strokeWidth="1.8"
          strokeDasharray="9 8"
        />

        <line
          x1="18"
          y1="587"
          x2="982"
          y2="587"
          stroke={COLORS.guide}
          strokeWidth="1.8"
          strokeDasharray="9 8"
        />

        <text
          x="500"
          y="245"
          textAnchor="middle"
          fontSize="21"
          fontWeight="700"
          fill={COLORS.softLabel}
          letterSpacing="0.08em"
          style={textCommon}
        >
          UPPER JAW
        </text>

        <text
          x="500"
          y="885"
          textAnchor="middle"
          fontSize="21"
          fontWeight="700"
          fill={COLORS.softLabel}
          letterSpacing="0.08em"
          style={textCommon}
        >
          LOWER JAW
        </text>

        <text
          x="54"
          y="572"
          textAnchor="middle"
          fontSize="19"
          fontWeight="700"
          fill={COLORS.softLabel}
          letterSpacing="0.1em"
          transform="rotate(-90 54 572)"
          style={textCommon}
        >
          RIGHT
        </text>

        <text
          x="946"
          y="572"
          textAnchor="middle"
          fontSize="19"
          fontWeight="700"
          fill={COLORS.softLabel}
          letterSpacing="0.1em"
          transform="rotate(90 946 572)"
          style={textCommon}
        >
          LEFT
        </text>

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
                fontSize="26"
                fontWeight="800"
                fill={isActive ? "#2563eb" : COLORS.label}
                style={textCommon}
              >
                {tooth.id}
              </text>

              <g
                transform={`translate(${tooth.x} ${tooth.y}) rotate(${tooth.rotate})`}
                style={{ cursor: readOnly ? "default" : "pointer" }}
                onClick={(e) => {
                  if (readOnly) return;
                  e.stopPropagation();
                  setActive((cur) => (cur === tooth.id ? null : tooth.id));
                }}
                onMouseEnter={() => !readOnly && setHovered(tooth.id)}
                onMouseLeave={() => !readOnly && setHovered((h) => (h === tooth.id ? null : h))}
              >
                <path
                  d={toothPath(tooth.type, tooth.w, tooth.h)}
                  fill={getFill(tooth.id)}
                  stroke={isActive ? "#2563eb" : COLORS.stroke}
                  strokeWidth={isActive ? 3.2 : 2.35}
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
                      stroke={COLORS.stroke}
                      strokeWidth="1.85"
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

      {!readOnly && active !== null && (
        <div
          className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
          style={{ width: "100%", maxWidth: 600 }}
        >
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

      {!readOnly && (
        <p className="text-xs text-muted-grey mt-3 text-center">
          Click a tooth to select. Selected: {Object.keys(selected).length || "none"}.
        </p>
      )}
      {summary && (
        <p className="text-xs text-text-slate mt-1 font-medium text-center">{summary}</p>
      )}
    </div>
  );
}
