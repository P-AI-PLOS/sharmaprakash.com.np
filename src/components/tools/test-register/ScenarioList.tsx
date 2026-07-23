/**
 * The register itself — one card per scenario with its links, derived status,
 * spec path and lifecycle actions.
 *
 * Drift is shown, not summarised: a changed link renders the snapshot the test
 * was generated from *beside* the source's current text, so the visitor can see
 * what moved before deciding to regenerate. A removed source keeps its snapshot
 * with a "source removed" badge — the record is never silently repaired and
 * never cascaded away.
 *
 * Cards fade up on scroll via the site's global `.sr-reveal` primitive (stagger
 * capped `Math.min(i, 4) * 40`, `prefers-reduced-motion` honoured globally in
 * tokens.css). The observer re-runs here because the list renders after
 * hydration, past the Astro `reveal()` pass — same approach as SlicerDashboard.
 */
import { useEffect, useRef } from "react";
import { FileCode2, Layers, ListChecks, Pencil, RefreshCw, ShieldCheck, Trash2, Unlink } from "lucide-react";
import StatusBadge from "./StatusBadge";
import {
  displayStatus,
  resolveScenarioLinks,
  type LinkResolution,
  type LinkTarget,
  type SourceIndex,
  type TestScenarioRecord,
} from "~/utils/test-register-store";

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export default function ScenarioList({
  scenarios,
  index,
  onEdit,
  onRegenerate,
  onReview,
  onUnlink,
  onDelete,
}: {
  scenarios: TestScenarioRecord[];
  index: SourceIndex;
  onEdit: (id: string) => void;
  onRegenerate: (id: string) => void;
  onReview: (id: string) => void;
  onUnlink: (id: string, target: LinkTarget) => void;
  onDelete: (id: string) => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>(".sr-reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          window.setTimeout(() => el.classList.add("is-visible"), Number(el.dataset.srDelay ?? 0));
          io.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [scenarios]);

  if (scenarios.length === 0) return null;

  return (
    <ul ref={listRef} className="mt-3 grid gap-3">
      {scenarios.map((rec, i) => {
        const resolution = resolveScenarioLinks(rec, index);
        const status = displayStatus(rec, resolution);
        const hasChanged = [...resolution.perStory, ...resolution.perCriterion].some(
          (r) => r.state === "changed",
        );
        const linkTotal = rec.stories.length + rec.criteria.length;

        return (
          <li
            key={rec.id}
            data-sr-delay={Math.min(i, 4) * 40}
            className={`sr-reveal rounded-lg border p-4 ${
              resolution.stale ? "border-accent-600 bg-accent-50" : "border-ink-200 bg-surface-base"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-body font-semibold text-strong">{rec.description}</p>
              <StatusBadge status={status} />
            </div>

            <ul className="mt-3 grid gap-2">
              {rec.criteria.map((link, li) => (
                <LinkRow
                  key={`c-${link.ref.specId}-${link.ref.criterionId}`}
                  kind="criterion"
                  specTitle={link.specTitle}
                  snapshot={link.criterionText}
                  resolution={resolution.perCriterion[li]}
                  canUnlink={linkTotal > 1}
                  onUnlink={() => onUnlink(rec.id, { kind: "criterion", ref: link.ref })}
                />
              ))}
              {rec.stories.map((link, li) => (
                <LinkRow
                  key={`s-${link.ref.storyId}`}
                  kind="story"
                  specTitle={link.specTitle}
                  snapshot={link.storyText}
                  resolution={resolution.perStory[li]}
                  canUnlink={linkTotal > 1}
                  onUnlink={() => onUnlink(rec.id, { kind: "story", ref: link.ref })}
                />
              ))}
            </ul>

            {rec.specPath && (
              <p className="mt-3 flex items-center gap-1.5 text-caption text-muted">
                <FileCode2 size={13} strokeWidth={2} className="shrink-0 text-faint" />
                <code className="rounded bg-ink-100 px-1.5 py-0.5 text-caption text-strong">
                  {rec.specPath}
                </code>
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ink-200 pt-3">
              <button
                type="button"
                onClick={() => onEdit(rec.id)}
                className="inline-flex items-center gap-1 text-caption font-semibold text-muted transition-colors hover:text-accent-700"
              >
                <Pencil size={13} strokeWidth={2} /> Edit
              </button>

              {hasChanged && (
                <button
                  type="button"
                  onClick={() => onRegenerate(rec.id)}
                  className="inline-flex items-center gap-1 text-caption font-semibold text-accent-700 link-underline"
                >
                  <RefreshCw size={13} strokeWidth={2} /> Mark regenerated
                </button>
              )}

              {!resolution.stale && rec.status === "ai-drafted" && (
                <button
                  type="button"
                  onClick={() => onReview(rec.id)}
                  className="inline-flex items-center gap-1 text-caption font-semibold text-accent-700 link-underline"
                >
                  <ShieldCheck size={13} strokeWidth={2} /> Mark reviewed
                </button>
              )}

              <span className="ml-auto text-caption text-faint">Updated {formatDate(rec.updatedAt)}</span>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete "${rec.description}"? This can't be undone.`)) onDelete(rec.id);
                }}
                aria-label={`Delete scenario: ${rec.description}`}
                className="text-faint transition-colors hover:text-accent-700"
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </div>

            {resolution.stale && (
              <p className="mt-3 text-caption text-accent-800">
                {hasChanged
                  ? "Regenerate the spec from the current wording, then mark it regenerated here — that drops it back to AI-drafted until a human reviews it again."
                  : "The source is gone. Unlink it (or delete the scenario) — there's nothing left to regenerate against."}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** One link row: snapshot, live text, and the drift detail when they differ. */
function LinkRow({
  kind,
  specTitle,
  snapshot,
  resolution,
  canUnlink,
  onUnlink,
}: {
  kind: "story" | "criterion";
  specTitle: string;
  snapshot: string;
  resolution: LinkResolution | undefined;
  canUnlink: boolean;
  onUnlink: () => void;
}) {
  const Icon = kind === "criterion" ? ListChecks : Layers;
  const kindLabel = kind === "criterion" ? "Acceptance criterion" : "Sliced story";
  const state = resolution?.state ?? "removed";

  return (
    <li className="rounded-md border border-ink-200 bg-surface-raised p-3">
      <p className="flex items-center gap-1.5 text-caption text-faint">
        <Icon size={13} strokeWidth={2} className="shrink-0" />
        {kindLabel}
        {specTitle && <span> · {specTitle}</span>}
        {state === "removed" && (
          <span className="ml-1 rounded border border-accent-600 px-1.5 py-0.5 text-caption font-semibold text-accent-800">
            source removed
          </span>
        )}
      </p>

      {state === "live" ? (
        <p className="mt-1 text-caption text-strong">{snapshot}</p>
      ) : state === "removed" ? (
        <p className="mt-1 text-caption text-strong">
          {snapshot}
          <span className="ml-1 text-faint">— last known wording</span>
        </p>
      ) : (
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-caption font-semibold text-faint">Snapshot the test was written from</p>
            <p className="mt-0.5 text-caption text-muted">{snapshot}</p>
          </div>
          <div>
            <p className="text-caption font-semibold text-accent-800">Current wording</p>
            <p className="mt-0.5 text-caption text-strong">
              {resolution?.state === "changed" ? resolution.currentText : ""}
            </p>
          </div>
        </div>
      )}

      {state !== "live" && (
        <button
          type="button"
          onClick={onUnlink}
          disabled={!canUnlink}
          title={
            canUnlink
              ? undefined
              : "This is the scenario's only link — add another link or delete the scenario instead."
          }
          className="mt-2 inline-flex items-center gap-1 text-caption font-semibold text-muted transition-colors hover:text-accent-700 disabled:cursor-not-allowed disabled:text-faint disabled:hover:text-faint"
        >
          <Unlink size={12} strokeWidth={2} /> Unlink
        </button>
      )}
    </li>
  );
}
