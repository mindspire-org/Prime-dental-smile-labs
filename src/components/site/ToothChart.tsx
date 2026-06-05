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
  rot: number;
  rx: number;
  ry: number;
  shape: string;
}

function toothSize(n: number): { rx: number; ry: number; shape: string } {
  const fdi = n % 10;
  if (fdi <= 2) return { rx: 9, ry: 12, shape: "incisor" };
  if (fdi === 3) return { rx: 8, ry: 10, shape: "canine" };
  if (fdi <= 5) return { rx: 9, ry: 10, shape: "premolar" };
  if (fdi <= 7) return { rx: 13, ry: 13, shape: "molar" };
  return { rx: 11, ry: 11, shape: "wisdom" };
}

/* ────────────────────────────────
   3D Tooth — Canvas-style ellipse
   with radial gradient, occlusal
   details, and white highlights.
   ──────────────────────────────── */
function Tooth3D({
  x,
  y,
  rx,
  ry,
  shape,
  fillId,
  isMissing,
  isActive,
}: {
  x: number;
  y: number;
  rx: number;
  ry: number;
  shape: string;
  fillId: string;
  isMissing: boolean;
  isActive: boolean;
}) {
  return (
    <g transform={`translate(${x},${y})`}>
      {isMissing ? (
        <g opacity={0.6}>
          <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="none" stroke="#888" strokeWidth={1} strokeDasharray="3 3" />
          <path d={`M -${rx * 0.5},-${ry * 0.5} L ${rx * 0.5},${ry * 0.5} M ${rx * 0.5},-${ry * 0.5} L -${rx * 0.5},${ry * 0.5}`}
            stroke="#a04030" strokeWidth={1.5} fill="none" />
        </g>
      ) : (
        <>
          {/* Main body */}
          <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={`url(#${fillId})`} />

          {/* Occlusal details */}
          {shape === "molar" || shape === "wisdom" ? (
            <g opacity={0.5}>
              <path d={`M -${rx * 0.25},-${ry * 0.5} L -${rx * 0.25},${ry * 0.5}`} stroke="#3a3028" strokeWidth={0.8} fill="none" />
              <path d={`M ${rx * 0.25},-${ry * 0.5} L ${rx * 0.25},${ry * 0.5}`} stroke="#3a3028" strokeWidth={0.8} fill="none" />
              <path d={`M -${rx * 0.6},0 L ${rx * 0.6},0`} stroke="#3a3028" strokeWidth={0.8} fill="none" />
              <ellipse cx={-rx * 0.42} cy={-ry * 0.32} rx={rx * 0.14} ry={ry * 0.13} fill="rgba(0,0,0,0.12)" />
              <ellipse cx={rx * 0.42} cy={-ry * 0.32} rx={rx * 0.14} ry={ry * 0.13} fill="rgba(0,0,0,0.12)" />
              <ellipse cx={-rx * 0.42} cy={ry * 0.32} rx={rx * 0.14} ry={ry * 0.13} fill="rgba(0,0,0,0.12)" />
              <ellipse cx={rx * 0.42} cy={ry * 0.32} rx={rx * 0.14} ry={ry * 0.13} fill="rgba(0,0,0,0.12)" />
              <ellipse cx={0} cy={0} rx={rx * 0.14} ry={ry * 0.13} fill="rgba(0,0,0,0.12)" />
            </g>
          ) : shape === "premolar" ? (
            <g opacity={0.5}>
              <path d={`M 0,-${ry * 0.55} L 0,${ry * 0.55}`} stroke="#3a3028" strokeWidth={0.8} fill="none" />
              <ellipse cx={-rx * 0.3} cy={0} rx={rx * 0.2} ry={ry * 0.18} fill="rgba(0,0,0,0.1)" />
              <ellipse cx={rx * 0.3} cy={0} rx={rx * 0.2} ry={ry * 0.18} fill="rgba(0,0,0,0.1)" />
            </g>
          ) : shape === "canine" ? (
            <ellipse cx={0} cy={ry * 0.1} rx={rx * 0.25} ry={ry * 0.3} fill="rgba(0,0,0,0.08)" />
          ) : null}

          {/* White highlight 1 */}
          <ellipse
            cx={-rx * 0.28}
            cy={-ry * 0.35}
            rx={rx * 0.42}
            ry={ry * 0.28}
            transform={`rotate(-36, ${-rx * 0.28}, ${-ry * 0.35})`}
            fill="url(#tooth-hi1)"
          />
          {/* White highlight 2 */}
          <ellipse
            cx={rx * 0.25}
            cy={-ry * 0.15}
            rx={rx * 0.22}
            ry={ry * 0.15}
            fill="url(#tooth-hi2)"
          />

          {/* Outline */}
          <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={0.7} />

          {/* Selection ring */}
          {isActive && (
            <ellipse cx={0} cy={0} rx={rx + 2} ry={ry + 2} fill="none" stroke="rgba(100,180,255,0.9)" strokeWidth={2} />
          )}
        </>
      )}
    </g>
  );
}

/* ────────────────────────────────
   Arch Positioning
   True elliptical arc like the
   Canvas reference code.
   ──────────────────────────────── */
function archPositions(
  teeth: number[],
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  startAngle: number,
  endAngle: number
): ToothItem[] {
  return teeth.map((n, i) => {
    const t = i / (teeth.length - 1);
    const a = startAngle + (endAngle - startAngle) * t;
    const x = cx + rx * Math.cos(a);
    const y = cy + ry * Math.sin(a);

    // Tangent angle for tooth rotation
    const dx = -rx * Math.sin(a);
    const dy = ry * Math.cos(a);
    const rot = (Math.atan2(dy, dx) * 180) / Math.PI;

    const sz = toothSize(n);
    return { n, x, y, rot, rx: sz.rx, ry: sz.ry, shape: sz.shape };
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

  const upper = useMemo(
    () => archPositions(UPPER, 330, 195, 230, 130, Math.PI * 1.08, Math.PI * 1.92),
    []
  );
  const lower = useMemo(
    () => archPositions(LOWER, 330, 530, 230, 130, Math.PI * 0.08, Math.PI * 0.92),
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

  // Determine fill color based on state
  const getFillId = (n: number) => {
    if (active === n) return "grad-active";
    if (selected[n]) return "grad-selected";
    return "grad-default";
  };

  const renderTooth = (t: ToothItem, isUpperArch: boolean) => {
    const sel = selected[t.n];
    const isActive = active === t.n;

    return (
      <g key={t.n} style={{ pointerEvents: "all" }}>
        {/* 3D tooth ellipse — pointer-events: none so clicks pass through to target below */}
        <g style={{ pointerEvents: "none" }}>
          <Tooth3D
            x={t.x}
            y={t.y}
            rx={t.rx}
            ry={t.ry}
            shape={t.shape}
            fillId={getFillId(t.n)}
            isMissing={sel === "Missing"}
            isActive={isActive}
          />
        </g>
        {/* Number label */}
        <text
          x={t.x}
          y={t.y + (isUpperArch ? t.ry + 13 : -t.ry - 4)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fontWeight={isActive ? 700 : 600}
          fontFamily="system-ui, -apple-system, sans-serif"
          fill={isActive ? "#88ccff" : "rgba(200,180,160,0.85)"}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {t.n}
        </text>
        {/* Invisible click target — rendered last so it sits on top */}
        <ellipse
          cx={t.x}
          cy={t.y}
          rx={Math.max(t.rx, t.ry) + 8}
          ry={Math.max(t.rx, t.ry) + 8}
          fill="transparent"
          className="cursor-pointer"
          onClick={() => setActive(t.n)}
        />
      </g>
    );
  };

  return (
    <div className="w-full mx-auto select-none">
      <svg viewBox="0 0 660 820" className="w-full h-auto">
        <defs>
          {/* Drop shadow for depth */}
          <filter id="tooth-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="2" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.35" />
          </filter>

          {/* White highlight gradients */}
          <radialGradient id="tooth-hi1" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.72)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <radialGradient id="tooth-hi2" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.38)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          {/* Default tooth: realistic cream enamel */}
          <radialGradient id="grad-default" cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#f8f4ec" />
            <stop offset="35%" stopColor="#e0d8c4" />
            <stop offset="75%" stopColor="#c8c0a8" />
            <stop offset="100%" stopColor="#888070" />
          </radialGradient>

          {/* Selected tooth: gold highlight */}
          <radialGradient id="grad-selected" cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="35%" stopColor="#fde68a" />
            <stop offset="75%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>

          {/* Active tooth: blue selection ring (matches Canvas) */}
          <radialGradient id="grad-active" cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#cce8ff" />
            <stop offset="35%" stopColor="#88bbee" />
            <stop offset="75%" stopColor="#5599cc" />
            <stop offset="100%" stopColor="#2266aa" />
          </radialGradient>

          {/* Gum tissue radial gradient */}
          <radialGradient id="gum-grad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#c8706a" />
            <stop offset="40%" stopColor="#b05a55" />
            <stop offset="80%" stopColor="#8a3a35" />
            <stop offset="100%" stopColor="#5a2020" />
          </radialGradient>

          {/* Palate highlight */}
          <radialGradient id="palate-grad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="rgba(220,160,150,0.35)" />
            <stop offset="100%" stopColor="rgba(80,20,20,0)" />
          </radialGradient>

          {/* Gum inner shadow */}
          <filter id="gum-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur" />
            <feOffset dx="0" dy="3" result="offsetBlur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.35" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="offsetBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Upper gum — exact Canvas bezier path */}
        <path
          d="M 68,320 C 40,290 28,230 50,180 C 80,100 160,55 280,42 C 320,38 370,38 380,42 C 500,55 580,100 610,180 C 632,230 620,290 592,320 C 560,350 500,370 330,372 C 160,370 100,350 68,320 Z"
          fill="url(#gum-grad)"
          stroke="none"
          filter="url(#gum-shadow)"
        />
        <path
          d="M 68,320 C 40,290 28,230 50,180 C 80,100 160,55 280,42 C 320,38 370,38 380,42 C 500,55 580,100 610,180 C 632,230 620,290 592,320 C 560,350 500,370 330,372 C 160,370 100,350 68,320 Z"
          fill="none"
          stroke="#8a3a35"
          strokeWidth={1.2}
        />
        {/* Palate highlight */}
        <ellipse cx={330} cy={225} rx={130} ry={95} fill="url(#palate-grad)" />

        {/* Lower gum — exact Canvas bezier path */}
        <path
          d="M 68,455 C 40,470 28,510 50,570 C 80,640 160,688 280,700 C 320,705 370,705 380,700 C 500,688 580,640 610,570 C 632,510 620,470 592,455 C 560,440 500,432 330,430 C 160,432 100,440 68,455 Z"
          fill="url(#gum-grad)"
          stroke="none"
          filter="url(#gum-shadow)"
        />
        <path
          d="M 68,455 C 40,470 28,510 50,570 C 80,640 160,688 280,700 C 320,705 370,705 380,700 C 500,688 580,640 610,570 C 632,510 620,470 592,455 C 560,440 500,432 330,430 C 160,432 100,440 68,455 Z"
          fill="none"
          stroke="#8a3a35"
          strokeWidth={1.2}
        />

        {/* Divider between arches */}
        <path
          d="M 50,398 C 150,392 480,392 610,398"
          fill="none"
          stroke="rgba(100,60,40,0.3)"
          strokeWidth={1}
        />

        {/* Render all teeth with shadow filter */}
        <g filter="url(#tooth-shadow)">
          {upper.map((t) => renderTooth(t, true))}
          {lower.map((t) => renderTooth(t, false))}
        </g>
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
