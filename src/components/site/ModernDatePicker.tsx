import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  return d;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export function ModernDatePicker({
  value,
  onChange,
  placeholder = "Select date",
  min,
  max,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const d = parseDate(value) || new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    const d = parseDate(value);
    if (d) setView(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [value]);

  const selected = parseDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = view.getFullYear();
  const month = view.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const minDate = min ? parseDate(min) : null;
  const maxDate = max ? parseDate(max) : null;

  function isDisabled(day: number) {
    const cell = new Date(year, month, day);
    if (minDate && cell < minDate) return true;
    if (maxDate && cell > maxDate) return true;
    return false;
  }

  function selectDay(day: number) {
    if (isDisabled(day)) return;
    onChange(formatDate(new Date(year, month, day)));
    setOpen(false);
  }

  function clear() {
    onChange("");
    setOpen(false);
  }

  const display = value
    ? new Date(value + "T00:00:00").toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm outline-none transition-all text-left
          ${open ? "border-teal ring-2 ring-teal/15" : "border-slate-200 hover:border-teal/60"}
          bg-white text-slate-700`}
      >
        <Calendar size={14} className="text-teal shrink-0" />
        <span className="flex-1 truncate">{display || <span className="text-slate-400">{placeholder}</span>}</span>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            className="text-slate-300 hover:text-slate-500 transition-colors"
          >
            <X size={13} />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute z-30 top-full mt-2 left-0 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 p-4 w-[280px] select-none">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setView(new Date(year, month - 1, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="text-sm font-bold text-slate-800">
              {MONTHS[month]} {year}
            </div>
            <button
              type="button"
              onClick={() => setView(new Date(year, month + 1, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
              <div key={d} className="text-[10px] font-semibold text-slate-400 text-center py-1 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {weeks.flat().map((day, i) => {
              if (day === null) return <div key={i} className="h-8" />;
              const cell = new Date(year, month, day);
              const isToday = cell.getTime() === today.getTime();
              const isSelected = selected?.getTime() === cell.getTime();
              const disabled = isDisabled(day);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                  className={`h-8 w-8 mx-auto rounded-lg text-[11px] font-medium flex items-center justify-center transition-all
                    ${disabled ? "text-slate-200 cursor-not-allowed" : "cursor-pointer hover:bg-teal/10"}
                    ${isSelected ? "bg-teal text-white shadow-md shadow-teal/25" : ""}
                    ${!isSelected && isToday ? "bg-teal/10 text-teal font-bold" : ""}
                    ${!isSelected && !isToday && !disabled ? "text-slate-700" : ""}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={clear}
              className="text-[11px] font-semibold text-slate-400 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                onChange(formatDate(now));
                setOpen(false);
              }}
              className="text-[11px] font-semibold text-teal hover:text-teal/80 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
