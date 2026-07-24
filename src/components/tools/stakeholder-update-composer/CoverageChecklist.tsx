/**
 * The four-source coverage panel: which pipeline sources exist for the active
 * product + quarter, which are still empty (naming the tool to fill them), and
 * the OST drift badge (design.md D5). It is informational — it renders above
 * the editor and NEVER blocks composing; a partial pipeline is the normal case.
 */
import { AlertTriangle, Check, CircleDashed } from "lucide-react";
import type { CoverageRow } from "~/utils/update-sources";

const driftLabel: Record<NonNullable<CoverageRow["drift"]>, string> = {
  changed: "source changed",
  removed: "source removed",
};

export default function CoverageChecklist({ rows }: { rows: CoverageRow[] }) {
  const found = rows.filter((row) => row.status === "found").length;

  return (
    <div className="rounded-lg border border-ink-200 bg-surface-base p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-caption font-semibold text-muted">Source coverage</p>
        <p className="text-caption text-faint">
          {found} of {rows.length} sources
        </p>
      </div>

      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {rows.map((row) => {
          const isFound = row.status === "found";
          return (
            <li
              key={row.key}
              className="flex items-start gap-2 rounded-md border border-ink-200 bg-surface-raised px-3 py-2"
            >
              {row.drift ? (
                <AlertTriangle size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-accent-700" />
              ) : isFound ? (
                <Check size={15} strokeWidth={2.5} className="mt-0.5 shrink-0 text-accent-700" />
              ) : (
                <CircleDashed size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-faint" />
              )}
              <span className="min-w-0">
                <span className="block text-caption font-semibold text-strong">{row.label}</span>
                {row.drift ? (
                  // The referenced tree drifted or vanished; the composed draft
                  // still carries the compose-time snapshot, so this never blocks.
                  <span className="block text-caption font-semibold text-strong">
                    {driftLabel[row.drift]} since compose — draft keeps the last snapshot
                  </span>
                ) : isFound ? (
                  <span className="block text-caption text-faint">Included in the draft</span>
                ) : (
                  <span className="block text-caption text-faint">
                    Nothing yet — fill it in{" "}
                    <a href={row.href} className="link-underline text-accent-700">
                      {row.hint}
                    </a>
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
