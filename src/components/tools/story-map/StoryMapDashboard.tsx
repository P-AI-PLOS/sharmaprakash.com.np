/**
 * "Your maps" management grid — lists every saved story map, lets you open or
 * delete one. Rendered only where showDashboard is set. Mirrors PrFaqDashboard.tsx.
 */
import { Map, Trash2 } from "lucide-react";
import { titleFor, type StoryMapRecord } from "~/utils/story-map-store";

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const summarize = (r: StoryMapRecord) => {
  const steps = r.steps.length === 1 ? "1 step" : `${r.steps.length} steps`;
  const slices = r.slices.length === 1 ? "1 slice" : `${r.slices.length} slices`;
  const cards = r.cards.length === 1 ? "1 card" : `${r.cards.length} cards`;
  return `${steps} · ${slices} · ${cards}`;
};

export default function StoryMapDashboard({
  records,
  activeId,
  onOpen,
  onDelete,
}: {
  records: StoryMapRecord[];
  activeId: string;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (records.length === 0) return null;

  return (
    <div className="mt-6 border-t border-ink-200 pt-4">
      <p className="text-caption font-semibold text-muted">Your maps ({records.length})</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {records.map((r) => (
          <div
            key={r.id}
            className={`rounded-lg border p-4 ${
              r.id === activeId ? "border-accent-600 bg-accent-50" : "border-ink-200 bg-surface-base"
            }`}
          >
            <p className="line-clamp-2 text-body font-semibold text-strong">{titleFor(r)}</p>
            <p className="mt-1 flex items-center gap-1 text-caption text-faint">
              <Map size={12} strokeWidth={2} />
              {summarize(r)}
            </p>
            <p className="mt-1 text-caption text-faint">Updated {formatDate(r.updatedAt)}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onOpen(r.id)}
                disabled={r.id === activeId}
                className="text-caption font-semibold text-accent-700 link-underline disabled:cursor-default disabled:text-faint disabled:no-underline"
              >
                {r.id === activeId ? "Open in editor above" : "Open in editor"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete "${titleFor(r)}"? This can't be undone.`)) onDelete(r.id);
                }}
                aria-label={`Delete ${titleFor(r)}`}
                className="text-faint transition-colors hover:text-accent-700"
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
