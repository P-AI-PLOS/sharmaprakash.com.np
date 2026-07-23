/**
 * Quarter-over-quarter history: every objective the active product has ever
 * had, grouped by quarter, most recent first. There is no stored history model
 * — the groups fall straight out of `listForProduct` + `compareQuarters`.
 */
import { Building2, FileClock, Package } from "lucide-react";
import { titleFor, type OkrQuarterGroup, type OkrRecord, type OkrTag } from "~/utils/okr-store";

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

/** Department/product tag, shown everywhere an entry is listed. */
export function TagChip({ tag }: { tag: OkrTag }) {
  const Icon = tag.kind === "department" ? Building2 : Package;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-caption font-medium text-accent-700">
      <Icon size={12} strokeWidth={2} />
      {tag.label}
      <span className="sr-only"> ({tag.kind})</span>
    </span>
  );
}

/** Marks an entry OKR Check-In drafted for the next quarter and nobody has accepted yet. */
export function DraftBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-ink-400 px-2 py-0.5 text-caption font-semibold text-muted">
      <FileClock size={12} strokeWidth={2} />
      Draft from check-in
    </span>
  );
}

export default function QuarterHistory({
  groups,
  selectedKey,
  onOpen,
}: {
  groups: OkrQuarterGroup[];
  /** `quarterKey` of the quarter currently being edited above, labelled as such. */
  selectedKey: string;
  onOpen: (record: OkrRecord) => void;
}) {
  if (groups.length === 0) return null;

  return (
    <section aria-label="Quarter history" className="mt-8 border-t border-ink-200 pt-5">
      <p className="text-caption font-semibold text-muted">
        History ({groups.length} {groups.length === 1 ? "quarter" : "quarters"})
      </p>
      <p className="mt-1 text-caption text-faint">
        How the OKRs moved quarter to quarter. Open any past objective to edit it.
      </p>

      <div className="mt-4 grid gap-5">
        {groups.map((group) => (
          <div key={group.key}>
            <p className="text-caption font-semibold text-strong">
              {group.key}
              {group.key === selectedKey && (
                <span className="ml-2 font-normal text-faint">· shown above</span>
              )}
            </p>
            <ul className="mt-2 grid gap-2">
              {group.entries.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(entry)}
                    className="w-full rounded-lg border border-ink-200 bg-surface-base p-3 text-left transition-colors hover:border-accent-600"
                  >
                    <p className="text-body font-semibold text-strong">{titleFor(entry)}</p>
                    <span className="mt-2 flex flex-wrap items-center gap-2 text-caption text-faint">
                      <TagChip tag={entry.tag} />
                      {entry.draft && <DraftBadge />}
                      <span>
                        {entry.keyResults.length}{" "}
                        {entry.keyResults.length === 1 ? "key result" : "key results"}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Updated {formatDate(entry.updatedAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
