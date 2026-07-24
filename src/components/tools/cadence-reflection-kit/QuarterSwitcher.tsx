/**
 * QuarterSwitcher — browse this product's cadence records by quarter. Only the
 * current quarter is editable; selecting a past quarter shows it read-only (D1).
 * Rendered only when more than one quarter exists.
 */
import { quarterKey } from "~/utils/pipeline-store";
import type { CadenceRecord } from "~/utils/cadence-store";

export default function QuarterSwitcher({
  records,
  currentId,
  viewingId,
  onSelect,
}: {
  records: CadenceRecord[];
  currentId: string;
  viewingId: string;
  onSelect: (id: string) => void;
}) {
  // Newest quarter first for the menu; `records` arrives chronological.
  const ordered = records.slice().reverse();

  return (
    <label className="flex items-center gap-2 text-caption text-muted">
      <span className="text-faint">Quarter</span>
      <select
        value={viewingId}
        onChange={(e) => onSelect(e.target.value)}
        aria-label="View a quarter"
        className="rounded-md border border-ink-200 bg-surface-base px-2 py-1 text-caption font-semibold text-strong focus:border-accent-600 focus:outline-none"
      >
        {ordered.map((r) => (
          <option key={r.id} value={r.id}>
            {quarterKey(r.quarter)}
            {r.id === currentId ? " (current)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
