/**
 * Coverage as a gap list, not a percentage (design D4).
 *
 * Per spec, for both acceptance criteria and sliced stories: what has no test
 * at all, then what is only covered by stale tests — the AI-debt bucket — and
 * only then the non-stale fraction, as a caption. A percentage invites gaming
 * and hides *which* criterion is naked; the register's job is to hand the
 * visitor tomorrow morning's list.
 *
 * A scenario counts toward coverage only when it is itself non-stale: one
 * drifted link poisons the whole scenario's contribution.
 */
import { AlertCircle, CircleSlash, TriangleAlert } from "lucide-react";
import type { CoverageBucket, CoverageReport } from "~/utils/test-register-store";

export default function CoveragePanel({ report }: { report: CoverageReport }) {
  const hasSpecs = report.specs.length > 0;

  return (
    <div className="mt-4">
      {!hasSpecs && (
        <p className="rounded-lg border border-ink-200 bg-surface-base p-4 text-caption text-muted">
          No specs for this product yet, so there's nothing to measure coverage against. Write
          acceptance criteria in the{" "}
          <a href="/tools/spec-builder/" className="link-underline text-accent-700">
            Spec Builder
          </a>{" "}
          and slice stories in the{" "}
          <a href="/tools/vertical-slicer/" className="link-underline text-accent-700">
            Vertical Slicer
          </a>
          , and the gaps show up here.
        </p>
      )}

      <div className="grid gap-3">
        {report.specs.map((spec) => (
          <div key={spec.specId} className="rounded-lg border border-ink-200 bg-surface-base p-4">
            <p className="text-body font-semibold text-strong">{spec.specTitle}</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <BucketView title="Acceptance criteria" bucket={spec.criteria} noun="criterion" />
              <BucketView title="Sliced stories" bucket={spec.stories} noun="story" />
            </div>
          </div>
        ))}
      </div>

      {report.orphaned.length > 0 && (
        <div className="mt-3 rounded-lg border border-accent-600 bg-accent-50 p-4">
          <p className="flex items-center gap-1.5 text-body font-semibold text-strong">
            <AlertCircle size={15} strokeWidth={2} className="shrink-0 text-accent-700" />
            Source removed ({report.orphaned.length})
          </p>
          <p className="mt-1 text-caption text-muted">
            These scenarios point at specs that no longer exist. They're kept, with their last known
            wording — unlink or delete them deliberately.
          </p>
          <ul className="mt-2 grid gap-1">
            {report.orphaned.map((rec) => (
              <li key={rec.id} className="text-caption text-strong">
                {rec.description}
                {rec.criteria[0]?.specTitle || rec.stories[0]?.specTitle ? (
                  <span className="text-faint">
                    {" "}
                    · was {rec.criteria[0]?.specTitle || rec.stories[0]?.specTitle}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function BucketView({
  title,
  bucket,
  noun,
}: {
  title: string;
  bucket: CoverageBucket;
  noun: string;
}) {
  if (bucket.total === 0) {
    return (
      <div>
        <p className="text-caption font-semibold text-muted">{title}</p>
        <p className="mt-1 text-caption text-faint">None yet.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-caption font-semibold text-muted">{title}</p>

      {bucket.uncovered.length > 0 && (
        <div className="mt-2">
          <p className="flex items-center gap-1 text-caption font-semibold text-strong">
            <CircleSlash size={13} strokeWidth={2} className="shrink-0 text-faint" />
            Uncovered ({bucket.uncovered.length})
          </p>
          <ul className="mt-1 grid gap-1">
            {bucket.uncovered.map((item) => (
              <li key={item.id} className="text-caption text-muted">
                {item.text || <em className="text-faint">Untitled {noun}</em>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {bucket.staleOnly.length > 0 && (
        <div className="mt-2 rounded-md border border-accent-600 bg-accent-50 p-2">
          <p className="flex items-center gap-1 text-caption font-semibold text-accent-800">
            <TriangleAlert size={13} strokeWidth={2} className="shrink-0" />
            Covered by stale tests only ({bucket.staleOnly.length})
          </p>
          <ul className="mt-1 grid gap-1">
            {bucket.staleOnly.map((item) => (
              <li key={item.id} className="text-caption text-strong">
                {item.text || <em className="text-faint">Untitled {noun}</em>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {bucket.uncovered.length === 0 && bucket.staleOnly.length === 0 && (
        <p className="mt-1 text-caption text-muted">No gaps — every {noun} has a current test.</p>
      )}

      <p className="mt-2 text-caption text-faint">
        {bucket.coveredCount}/{bucket.total} covered by a non-stale scenario
      </p>
    </div>
  );
}
