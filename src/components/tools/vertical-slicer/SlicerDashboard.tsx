/**
 * "Your slicing sessions" management grid — one card per saved session with its
 * feature/spec title, chosen pattern, slice count and shippable-vs-flagged
 * tally, plus open/delete. Deletion touches only `pm-slice-v1`.
 *
 * Cards fade up on scroll via the site's `.sr-reveal` primitive, driven by
 * `useReveal` (stagger capped `Math.min(i, 4) * 40`, `prefers-reduced-motion`
 * honoured globally in tokens.css). The hook re-observes after hydration
 * because this grid renders past the Astro `reveal()` pass.
 */
import { CheckCircle2, Scissors, Trash2, TriangleAlert } from "lucide-react";
import {
  isShippable,
  patternLabel,
  titleFor,
  type SliceSession,
} from "~/utils/slicer-store";
import { useReveal } from "./useReveal";

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export default function SlicerDashboard({
  records,
  activeId,
  onOpen,
  onDelete,
}: {
  records: SliceSession[];
  activeId: string;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { containerRef, revealProps } = useReveal<HTMLDivElement>(records.length);

  if (records.length === 0) return null;

  return (
    <div className="mt-6 border-t border-ink-200 pt-4">
      <p className="text-caption font-semibold text-muted">Your slicing sessions ({records.length})</p>
      <div ref={containerRef} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {records.map((r, i) => {
          const shippable = r.stories.filter(isShippable).length;
          const flagged = r.stories.length - shippable;
          const { className: revealClass, ...reveal } = revealProps(r.id, i);
          return (
            <div
              key={r.id}
              {...reveal}
              className={`${revealClass} rounded-lg border p-4 ${r.id === activeId ? "border-accent-600 bg-accent-50" : "border-ink-200 bg-surface-base"}`}
            >
              <p className="line-clamp-2 text-body font-semibold text-strong">{titleFor(r)}</p>
              <p className="mt-1 flex items-center gap-1 text-caption text-faint">
                <Scissors size={12} strokeWidth={2} />
                {r.pattern ? patternLabel(r.pattern) : "No pattern yet"}
                {r.specTitleSnapshot ? ` · ${r.specTitleSnapshot}` : ""}
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted">
                <span>
                  {r.stories.length} {r.stories.length === 1 ? "slice" : "slices"}
                </span>
                {shippable > 0 && (
                  <span className="inline-flex items-center gap-1 text-accent-700">
                    <CheckCircle2 size={13} strokeWidth={2} /> {shippable} vertical
                  </span>
                )}
                {flagged > 0 && (
                  <span className="inline-flex items-center gap-1 text-strong">
                    <TriangleAlert size={13} strokeWidth={2} /> {flagged} flagged
                  </span>
                )}
              </p>
              <p className="mt-1 text-caption text-faint">Updated {formatDate(r.updatedAt)}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpen(r.id)}
                  disabled={r.id === activeId}
                  className="text-caption font-semibold text-accent-700 link-underline disabled:cursor-default disabled:text-faint disabled:no-underline"
                >
                  {r.id === activeId ? "Open in builder above" : "Open in builder"}
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
          );
        })}
      </div>
    </div>
  );
}
