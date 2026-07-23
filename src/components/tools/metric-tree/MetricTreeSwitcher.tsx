/**
 * "My trees" dropdown — switches the builder between saved metric trees.
 * Shared by the normal and full-screen headers. Mirrors OstTreeSwitcher.
 */
import { useEffect, useRef, useState } from "react";
import { ChevronDown, FileText, Globe, Plus, TreePine, Trash2 } from "lucide-react";
import { titleFor, type MetricTreeRecord } from "~/utils/metric-tree-store";

export default function MetricTreeSwitcher({
  records,
  activeId,
  onSelect,
  onCreate,
  onDelete,
}: {
  records: MetricTreeRecord[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
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
        <TreePine size={15} strokeWidth={2} className="shrink-0 text-accent-700" />
        <span className="truncate">{active ? titleFor(active) : "My trees"}</span>
        <ChevronDown size={14} strokeWidth={2} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Your metric trees"
          className="absolute right-0 top-full z-10 mt-2 w-72 rounded-lg border border-ink-200 bg-surface-raised p-2 shadow-lg"
        >
          <ul className="grid max-h-64 gap-0.5 overflow-y-auto">
            {records.map((r) => (
              <li key={r.id} className="flex min-w-0 items-stretch gap-1">
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
                    {r.source.type === "post" ? <FileText size={14} strokeWidth={2} /> : <Globe size={14} strokeWidth={2} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{titleFor(r)}</span>
                    <span className="block truncate text-faint">
                      {r.source.type === "post" ? `From ${r.source.postTitle}` : "Standalone tool"}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete "${titleFor(r)}"? This can't be undone.`)) onDelete(r.id);
                  }}
                  aria-label={`Delete ${titleFor(r)}`}
                  title="Delete this tree"
                  className="shrink-0 rounded-md px-2 text-faint transition-colors hover:bg-ink-100 hover:text-accent-700"
                >
                  <Trash2 size={14} strokeWidth={2} />
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
