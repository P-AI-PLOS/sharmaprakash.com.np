/**
 * "My trees" dropdown — switches the builder between saved trees. Shared by
 * the normal and full-screen headers.
 */
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Compass, Globe, Plus } from "lucide-react";
import { titleFor, type OstRecord } from "~/utils/ost-store";

export default function OstTreeSwitcher({
  records,
  activeId,
  onSelect,
  onCreate,
}: {
  records: OstRecord[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="btn btn-ghost btn-sm max-w-[220px] shrink-0"
      >
        <Compass size={15} strokeWidth={2} className="shrink-0 text-accent-700" />
        <span className="truncate">{active ? titleFor(active) : "My trees"}</span>
        <ChevronDown size={14} strokeWidth={2} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Your opportunity solution trees"
          className="absolute right-0 top-full z-10 mt-2 w-72 rounded-lg border border-ink-200 bg-surface-raised p-2 shadow-lg"
        >
          <ul className="grid max-h-64 gap-0.5 overflow-y-auto">
            {records.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={r.id === activeId}
                  onClick={() => {
                    onSelect(r.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-caption transition-colors hover:bg-ink-100 ${
                    r.id === activeId ? "bg-accent-50 text-accent-700" : "text-strong"
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    {r.source.type === "course" ? <Compass size={14} strokeWidth={2} /> : <Globe size={14} strokeWidth={2} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{titleFor(r)}</span>
                    <span className="block truncate text-faint">
                      {r.source.type === "course" ? `From ${r.source.courseTitle} · ${r.source.chapterLabel}` : "Standalone tool"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              onCreate();
              setOpen(false);
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-md border-t border-ink-200 px-3 py-2 pt-3 text-left text-caption font-semibold text-accent-700 hover:bg-ink-100"
          >
            <Plus size={14} strokeWidth={2} />
            New tree
          </button>
        </div>
      )}
    </div>
  );
}
