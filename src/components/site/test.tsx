import { useState } from "react";

type ToothType = "incisor" | "canine" | "premolar" | "molar";

interface Tooth {
  id: number;
  x: number;
  y: number;
  rx: number;
  ry: number;
  r: number;
  type: ToothType;
}

/* ──────────────────────────────────────────────
   FDI tooth positions — exact coordinates from
   the Prime Smile professional reference chart.
   ────────────────────────────────────────────── */
const teeth: Tooth[] = [
  // Upper right (midline → back)
  { id: 11, x: 520, y: 145, rx: 70, ry: 65, r: 0, type: "incisor" },
  { id: 12, x: 407, y: 190, rx: 63, ry: 70, r: -22, type: "incisor" },
  { id: 13, x: 318, y: 282, rx: 62, ry: 70, r: -30, type: "canine" },
  { id: 14, x: 255, y: 405, rx: 64, ry: 72, r: -28, type: "premolar" },
  { id: 15, x: 205, y: 545, rx: 68, ry: 76, r: -22, type: "premolar" },
  { id: 16, x: 177, y: 694, rx: 70, ry: 78, r: -10, type: "molar" },
  { id: 17, x: 174, y: 845, rx: 70, ry: 78, r: 0, type: "molar" },
  { id: 18, x: 179, y: 1002, rx: 70, ry: 78, r: -8, type: "molar" },
  // Upper left (midline → back)
  { id: 21, x: 652, y: 145, rx: 70, ry: 65, r: 0, type: "incisor" },
  { id: 22, x: 764, y: 190, rx: 63, ry: 70, r: 22, type: "incisor" },
  { id: 23, x: 859, y: 282, rx: 62, ry: 70, r: 30, type: "canine" },
  { id: 24, x: 928, y: 405, rx: 64, ry: 72, r: 28, type: "premolar" },
  { id: 25, x: 983, y: 545, rx: 68, ry: 76, r: 22, type: "premolar" },
  { id: 26, x: 1012, y: 694, rx: 70, ry: 78, r: 10, type: "molar" },
  { id: 27, x: 1018, y: 845, rx: 70, ry: 78, r: 0, type: "molar" },
  { id: 28, x: 1012, y: 1002, rx: 70, ry: 78, r: 8, type: "molar" },
  // Lower right (back → midline)
  { id: 48, x: 177, y: 1142, rx: 70, ry: 78, r: 0, type: "molar" },
  { id: 47, x: 176, y: 1292, rx: 70, ry: 78, r: 0, type: "molar" },
  { id: 46, x: 192, y: 1435, rx: 70, ry: 78, r: -12, type: "molar" },
  { id: 45, x: 257, y: 1573, rx: 68, ry: 76, r: -38, type: "premolar" },
  { id: 44, x: 366, y: 1678, rx: 62, ry: 70, r: -45, type: "premolar" },
  { id: 43, x: 476, y: 1744, rx: 55, ry: 65, r: -35, type: "canine" },
  { id: 42, x: 555, y: 1780, rx: 50, ry: 60, r: -20, type: "incisor" },
  { id: 41, x: 610, y: 1785, rx: 50, ry: 60, r: 0, type: "incisor" },
  // Lower left (midline → back)
  { id: 31, x: 687, y: 1785, rx: 50, ry: 60, r: 0, type: "incisor" },
  { id: 32, x: 760, y: 1780, rx: 50, ry: 60, r: 20, type: "incisor" },
  { id: 33, x: 837, y: 1744, rx: 55, ry: 65, r: 35, type: "canine" },
  { id: 34, x: 945, y: 1678, rx: 62, ry: 70, r: 45, type: "premolar" },
  { id: 35, x: 1038, y: 1573, rx: 68, ry: 76, r: 38, type: "premolar" },
  { id: 36, x: 1083, y: 1435, rx: 70, ry: 78, r: 12, type: "molar" },
  { id: 37, x: 1076, y: 1292, rx: 70, ry: 78, r: 0, type: "molar" },
  { id: 38, x: 1070, y: 1142, rx: 70, ry: 78, r: 0, type: "molar" },
];

const toothPath = (type: string, rx: number, ry: number) => {
  const hw = rx;
  const hh = ry;

  if (type === "incisor") {
    /* Shield / spade: flat incisal edge, convex sides, rounded cervical */
    return `M ${-hw * 0.78} ${-hh * 0.55} C ${-hw * 0.35} ${-hh * 0.95} ${hw * 0.35} ${-hh * 0.95} ${hw * 0.78} ${-hh * 0.55} C ${hw * 0.9} ${-hh * 0.1} ${hw * 0.82} ${hh * 0.4} ${hw * 0.52} ${hh * 0.78} C ${hw * 0.22} ${hh * 0.98} ${-hw * 0.22} ${hh * 0.98} ${-hw * 0.52} ${hh * 0.78} C ${-hw * 0.82} ${hh * 0.4} ${-hw * 0.9} ${-hh * 0.1} ${-hw * 0.78} ${-hh * 0.55} Z`;
  }

  if (type === "canine") {
    /* Distinct pointed cusp — diamond with sharp tip */
    return `M 0 ${-hh} C ${hw * 0.5} ${-hh * 0.68} ${hw * 0.82} ${-hh * 0.18} ${hw * 0.68} ${hh * 0.32} C ${hw * 0.48} ${hh * 0.72} ${hw * 0.18} ${hh * 0.95} 0 ${hh} C ${-hw * 0.18} ${hh * 0.95} ${-hw * 0.48} ${hh * 0.72} ${-hw * 0.68} ${hh * 0.32} C ${-hw * 0.82} ${-hh * 0.18} ${-hw * 0.5} ${-hh * 0.68} 0 ${-hh} Z`;
  }

  if (type === "premolar") {
    /* Bicuspid ovoid — slightly waisted to suggest two cusps */
    return `M ${-hw * 0.75} ${-hh * 0.82} C ${-hw * 0.2} ${-hh * 0.98} ${hw * 0.2} ${-hh * 0.98} ${hw * 0.75} ${-hh * 0.82} C ${hw * 0.95} ${-hh * 0.25} ${hw * 0.88} ${hh * 0.25} ${hw * 0.75} ${hh * 0.82} C ${hw * 0.2} ${hh * 0.98} ${-hw * 0.2} ${hh * 0.98} ${-hw * 0.75} ${hh * 0.82} C ${-hw * 0.88} ${hh * 0.25} ${-hw * 0.95} ${-hh * 0.25} ${-hw * 0.75} ${-hh * 0.82} Z`;
  }

  /* Molar — squarish with rounded cusp corners */
  return `M ${-hw * 0.68} ${-hh * 0.88} C ${-hw * 0.2} ${-hh * 0.98} ${hw * 0.2} ${-hh * 0.98} ${hw * 0.68} ${-hh * 0.88} C ${hw * 0.95} ${-hh * 0.35} ${hw * 0.95} ${hh * 0.35} ${hw * 0.68} ${hh * 0.88} C ${hw * 0.2} ${hh * 0.98} ${-hw * 0.2} ${hh * 0.98} ${-hw * 0.68} ${hh * 0.88} C ${-hw * 0.95} ${hh * 0.35} ${-hw * 0.95} ${-hh * 0.35} ${-hw * 0.68} ${-hh * 0.88} Z`;
};

const groovePaths = (type: string, rx: number, ry: number) => {
  const hw = rx;
  const hh = ry;

  if (type === "molar") {
    return [
      `M ${-hw * 0.42} ${-hh * 0.15} C ${-hw * 0.18} ${-hh * 0.02}, ${-hw * 0.12} ${hh * 0.15}, ${-hw * 0.35} ${hh * 0.42}`,
      `M ${hw * 0.42} ${-hh * 0.15} C ${hw * 0.18} ${-hh * 0.02}, ${hw * 0.12} ${hh * 0.15}, ${hw * 0.35} ${hh * 0.42}`,
      `M ${-hw * 0.28} ${hh * 0.05} C ${-hw * 0.04} ${-hh * 0.05}, ${hw * 0.04} ${-hh * 0.05}, ${hw * 0.28} ${hh * 0.05}`,
      `M 0 ${-hh * 0.42} C ${-hw * 0.05} ${-hh * 0.12}, ${hw * 0.05} ${hh * 0.12}, 0 ${hh * 0.42}`,
    ];
  }

  if (type === "premolar") {
    return [
      `M ${-hw * 0.35} ${-hh * 0.1} C ${-hw * 0.1} ${hh * 0.05}, ${hw * 0.1} ${hh * 0.05}, ${hw * 0.35} ${-hh * 0.1}`,
      `M 0 ${-hh * 0.38} C ${-hw * 0.08} ${-hh * 0.05}, ${hw * 0.08} ${hh * 0.05}, 0 ${hh * 0.38}`,
    ];
  }

  if (type === "canine") {
    return [
      `M ${-hw * 0.35} ${hh * 0.35} C ${-hw * 0.05} ${hh * 0.05}, ${hw * 0.05} ${hh * 0.05}, ${hw * 0.35} ${hh * 0.35}`,
    ];
  }

  return [
    `M ${-hw * 0.4} ${-hh * 0.45} C ${-hw * 0.1} ${-hh * 0.65}, ${hw * 0.1} ${-hh * 0.65}, ${hw * 0.4} ${-hh * 0.45}`,
  ];
};

/* Roles + interactivity (functionality from file 2) */
const ROLES = [
  "Crown",
  "Veneer",
  "Inlay",
  "Pontic",
  "Implant Crown",
  "Custom Abutment",
  "Missing",
  "Other",
];

/* Arch centre — numbers are pushed radially OUTWARD from here. */
const CX = 600;
const CY = 1072;
const LABEL_GAP = 32;

/* Expanded viewBox so labels never clip (0 0 1199 1816 + padding). */
const VB = { x: -55, y: -90, w: 1310, h: 1996 };

export default function FDIToothChart() {
  const [selected, setSelected] = useState<Record<number, string>>({}); // { [id]: role }
  const [active, setActive] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const setRole = (id: number, role: string) => setSelected((p) => ({ ...p, [id]: role }));
  const clearTooth = (id: number) =>
    setSelected((p) => {
      const next = { ...p };
      delete next[id];
      return next;
    });

  const getFill = (id: number) => {
    if (selected[id] === "Missing") return "#ffffff";
    if (active === id) return "#bfdbfe";
    if (selected[id]) return "#fde68a";
    if (hovered === id) return "#f3f4f6";
    return "#ffffff";
  };

  const labelPos = (tooth: Tooth) => {
    const dx = tooth.x - CX;
    const dy = tooth.y - CY;
    const len = Math.hypot(dx, dy) || 1;
    const rad = Math.max(tooth.rx, tooth.ry) + LABEL_GAP;
    return { lx: tooth.x + (dx / len) * rad, ly: tooth.y + (dy / len) * rad };
  };

  const summary = Object.entries(selected)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([id, r]) => `${id}:${r}`)
    .join(", ");

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 560,
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
        userSelect: "none",
      }}
    >
      <svg
        viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
        width="100%"
        height="auto"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="FDI dental tooth chart"
      >
        <rect
          x={VB.x}
          y={VB.y}
          width={VB.w}
          height={VB.h}
          fill="#ffffff"
          onClick={() => setActive(null)}
        />

        {/* Faint quadrant cross */}
        <line
          x1="600"
          y1={VB.y}
          x2="600"
          y2={VB.y + VB.h}
          stroke="#d4d4d4"
          strokeWidth="2"
          strokeDasharray="10 10"
        />
        <line
          x1={VB.x}
          y1="1072"
          x2={VB.x + VB.w}
          y2="1072"
          stroke="#d4d4d4"
          strokeWidth="2"
          strokeDasharray="10 10"
        />

        {teeth.map((tooth) => {
          const role = selected[tooth.id];
          const isActive = active === tooth.id;
          const isMissing = role === "Missing";
          const hw = tooth.rx;
          const hh = tooth.ry;
          const { lx, ly } = labelPos(tooth);

          return (
            <g key={tooth.id}>
              {/* Tooth (clickable) */}
              <g
                transform={`translate(${tooth.x} ${tooth.y}) rotate(${tooth.r})`}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((cur) => (cur === tooth.id ? null : tooth.id));
                }}
                onMouseEnter={() => setHovered(tooth.id)}
                onMouseLeave={() =>
                  setHovered((h) => (h === tooth.id ? null : h))
                }
              >
                <path
                  d={toothPath(tooth.type, tooth.rx, tooth.ry)}
                  fill={getFill(tooth.id)}
                  stroke={isActive ? "#2563eb" : "#111111"}
                  strokeWidth={isActive ? 4 : 3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={isMissing ? "8 7" : undefined}
                  opacity={isMissing ? 0.55 : 1}
                />

                {!isMissing &&
                  groovePaths(tooth.type, tooth.rx, tooth.ry).map((d, index) => (
                    <path
                      key={index}
                      d={d}
                      fill="none"
                      stroke="#111111"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}

                {isMissing && (
                  <path
                    d={`M ${-hw * 0.55} ${-hh * 0.55} L ${hw * 0.55} ${hh * 0.55} M ${hw * 0.55} ${-hh * 0.55} L ${-hw * 0.55} ${hh * 0.55}`}
                    stroke="#b04030"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                )}
              </g>

              {/* Number — placed OUTSIDE the tooth (like the reference) */}
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="30"
                fontWeight="800"
                fill={isActive ? "#2563eb" : "#111111"}
                style={{ userSelect: "none", pointerEvents: "none" }}
              >
                {tooth.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Inline role selector (from file 2) */}
      {active !== null && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111111" }}>
              Tooth {active}
            </span>
            {selected[active] && (
              <button
                type="button"
                onClick={() => clearTooth(active)}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#dc2626",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            )}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ROLES.map((r) => {
              const on = selected[active] === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(active, r)}
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 7,
                    cursor: "pointer",
                    border: on ? "1px solid #111111" : "1px solid #e2e8f0",
                    background: on ? "#111111" : "#ffffff",
                    color: on ? "#ffffff" : "#475569",
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p
        style={{
          fontSize: 12,
          color: "#6b7280",
          marginTop: 12,
          textAlign: "center",
        }}
      >
        Click a tooth to select. Selected: {Object.keys(selected).length || "none"}.
      </p>
      {summary && (
        <p
          style={{
            fontSize: 12,
            color: "#334155",
            marginTop: 4,
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          {summary}
        </p>
      )}
    </div>
  );
}