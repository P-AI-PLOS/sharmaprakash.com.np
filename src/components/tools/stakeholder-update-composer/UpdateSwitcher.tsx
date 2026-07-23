/**
 * "My updates" dropdown — switches the composer between saved drafts for the
 * active product. Cloned from SlicerSessionSwitcher
 * (records / activeId / onSelect / onCreate / onDelete).
 */
import { useEffect, useRef, useState } from "react";
import { ChevronDown, FileText, Plus, Trash2 } from "lucide-react";
import { quarterKey } from "~/utils/pipeline-store";
import { titleFor, type UpdateRecord } from "~/utils/update-store";

export default function UpdateSwitcher({
  records,
  activeId,
  onSelect,
  onCreate,
  onDelete,
}: {
  records: UpdateRecord[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = records.find((record) => record.id === activeId);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
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
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="btn btn-ghost btn-sm max-w-[240px] shrink-0"
      >
        <FileText size={15} strokeWidth={2} className="shrink-0 text-accent-700" />
        <span className="truncate">{active ? titleFor(active) : "My updates"}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Your saved updates"
          className="absolute right-0 top-full z-10 mt-2 w-72 rounded-lg border border-ink-200 bg-surface-raised p-2 shadow-lg"
        >
          {records.length > 0 ? (
            <ul className="grid max-h-64 gap-0.5 overflow-y-auto">
              {records.map((record) => (
                <li key={record.id} className="flex min-w-0 items-stretch gap-1">
                  <button
                    type="button"
                    role="option"
                    aria-selected={record.id === activeId}
                    onClick={() => {
                      onSelect(record.id);
                      setOpen(false);
                    }}
                    className={`flex min-w-0 flex-1 items-start gap-2 rounded-md px-3 py-2 text-left text-caption transition-colors hover:bg-ink-100 ${
                      record.id === activeId ? "bg-accent-50 text-accent-700" : "text-strong"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{titleFor(record)}</span>
                      <span className="block truncate text-faint">{quarterKey(record.quarter)}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete "${titleFor(record)}"? This can't be undone.`)) {
                        onDelete(record.id);
                      }
                    }}
                    aria-label={`Delete ${titleFor(record)}`}
                    title="Delete this update"
                    className="shrink-0 rounded-md px-2 text-faint transition-colors hover:bg-ink-100 hover:text-accent-700"
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2 text-caption text-faint">No saved updates yet.</p>
          )}
          <button
            type="button"
            onClick={() => {
              onCreate();
              setOpen(false);
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-md border-t border-ink-200 px-3 py-2 pt-3 text-left text-caption font-semibold text-accent-700 hover:bg-ink-100"
          >
            <Plus size={14} strokeWidth={2} />
            Compose a new update
          </button>
        </div>
      )}
    </div>
  );
}
