/**
 * "Prior check-ins" dropdown — switches the tool between the product's saved
 * quarter-close records, newest quarter first. Mirrors `ost/OstTreeSwitcher`.
 */
import { useEffect, useRef, useState } from "react";
import { CalendarCheck, ChevronDown, History } from "lucide-react";
import { quarterKey } from "~/utils/pipeline-store";
import { titleForCheckIn, type CheckInRecord } from "~/utils/checkin-store";

export default function CheckInSwitcher({
  records,
  activeId,
  onSelect,
}: {
  records: CheckInRecord[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = records.find((r) => r.id === activeId);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (records.length === 0) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="btn btn-ghost btn-sm max-w-[240px] shrink-0"
      >
        <History size={15} strokeWidth={2} className="shrink-0 text-accent-700" />
        <span className="truncate">
          {active ? `${quarterKey(active.quarter)} check-in` : "Prior check-ins"}
        </span>
        <ChevronDown size={14} strokeWidth={2} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Prior check-ins for this product"
          className="absolute right-0 top-full z-10 mt-2 w-80 rounded-lg border border-ink-200 bg-surface-raised p-2 shadow-lg"
        >
          <ul className="grid max-h-64 gap-0.5 overflow-y-auto">
            {records.map((r) => (
              <li key={r.id} className="flex min-w-0 items-stretch">
                <button
                  type="button"
                  role="option"
                  aria-selected={r.id === activeId}
                  onClick={() => {
                    onSelect(r.id);
                    setOpen(false);
                  }}
                  className={`flex min-w-0 flex-1 items-start gap-2 rounded-md px-3 py-2 text-left text-caption transition-colors hover:bg-ink-100 ${
                    r.id === activeId ? "bg-accent-50 text-accent-700" : "text-strong"
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    <CalendarCheck size={14} strokeWidth={2} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{quarterKey(r.quarter)}</span>
                    <span className="block truncate text-faint">{titleForCheckIn(r)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
