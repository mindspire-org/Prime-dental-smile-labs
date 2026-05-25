import { useMemo, useState } from "react";

// FDI permanent dentition: upper R 18-11 → upper L 21-28; lower L 38-31 → lower R 41-48
const UPPER = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const LOWER = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

export type ToothRole = "Crown" | "Veneer" | "Inlay" | "Pontic" | "Implant Crown" | "Custom Abutment" | "Missing" | "Other";
export const ROLES: ToothRole[] = ["Crown","Veneer","Inlay","Pontic","Implant Crown","Custom Abutment","Missing","Other"];

export function ToothChart({
  selected, onChange,
}: {
  selected: Record<number, ToothRole>;
  onChange: (next: Record<number, ToothRole>) => void;
}) {
  const [active, setActive] = useState<number | null>(null);

  const setRole = (n: number, role: ToothRole) => {
    const next = { ...selected, [n]: role };
    onChange(next);
    setActive(null);
  };
  const remove = (n: number) => {
    const next = { ...selected };
    delete next[n];
    onChange(next);
    setActive(null);
  };

  const Tooth = ({ n }: { n: number }) => {
    const sel = selected[n];
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setActive(active === n ? null : n)}
          className={`w-9 h-12 rounded-md border-2 text-[10px] font-bold flex items-end justify-center pb-1 transition ${
            sel ? "bg-gold border-gold text-navy" : "bg-white border-border-silver text-muted-grey hover:border-teal"
          }`}
          title={sel ? `${n} — ${sel}` : `${n}`}
        >
          {n}
        </button>
        {active === n && (
          <div className="absolute z-20 top-full mt-1 left-1/2 -translate-x-1/2 bg-white border border-border-silver rounded-lg shadow-lg p-2 w-44">
            <div className="text-xs font-semibold mb-2 text-teal">Tooth {n}</div>
            <div className="grid grid-cols-2 gap-1">
              {ROLES.map((r) => (
                <button key={r} type="button" onClick={() => setRole(n, r)} className={`text-[10px] px-1.5 py-1 rounded text-left ${sel === r ? "bg-teal text-white" : "hover:bg-bg-soft"}`}>{r}</button>
              ))}
            </div>
            {sel && <button type="button" onClick={() => remove(n)} className="text-[10px] text-destructive mt-2 font-semibold">Clear</button>}
          </div>
        )}
      </div>
    );
  };

  const summary = useMemo(() => Object.entries(selected).map(([n, r]) => `${n}:${r}`).join(", "), [selected]);

  return (
    <div>
      <div className="bg-bg-soft p-6 rounded-xl">
        <div className="flex justify-center gap-1 flex-wrap">{UPPER.map((n) => <Tooth key={n} n={n} />)}</div>
        <div className="my-3 border-t border-border-silver mx-auto w-3/4" />
        <div className="flex justify-center gap-1 flex-wrap">{LOWER.map((n) => <Tooth key={n} n={n} />)}</div>
      </div>
      <p className="text-xs text-muted-grey mt-3">Click a tooth to select. Selected teeth: {Object.keys(selected).length || "none"}.</p>
      {summary && <p className="text-xs text-text-slate mt-1 font-medium">{summary}</p>}
    </div>
  );
}
