/**
 * Link a plotted item to the active quarter's OKR key results. Shows current
 * links as removable chips and an add-dropdown of the not-yet-linked options.
 * When no key results exist for the quarter, points at the OKR Organizer.
 */
import type { BacklogItem } from "~/utils/backlog-store";
import type { KrOption } from "./okr-source";

interface KrLinkerProps {
  item: BacklogItem;
  krOptions: KrOption[];
  onLink: (itemId: string, option: KrOption) => void;
  onUnlink: (itemId: string, keyResultId: string) => void;
}

export default function KrLinker({ item, krOptions, onLink, onUnlink }: KrLinkerProps) {
  const linkedIds = new Set(item.krRefs.map((ref) => ref.keyResultId));
  const available = krOptions.filter((option) => !linkedIds.has(option.ref.keyResultId));

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {item.krRefs.map((ref) => (
        <span
          key={ref.keyResultId}
          className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-medium text-accent-700"
        >
          {item.krSnapshots[ref.keyResultId] ?? "Key result"}
          <button
            type="button"
            onClick={() => onUnlink(item.id, ref.keyResultId)}
            aria-label={`Unlink key result: ${item.krSnapshots[ref.keyResultId] ?? "key result"}`}
            className="text-accent-700/70 transition-colors hover:text-accent-700"
          >
            ×
          </button>
        </span>
      ))}

      {krOptions.length === 0 ? (
        <a href="/tools/okr-organizer/" className="text-[11px] text-faint link-underline">
          No key results yet — set OKRs →
        </a>
      ) : available.length > 0 ? (
        <select
          value=""
          aria-label="Link a key result"
          onChange={(e) => {
            const option = available.find((o) => o.ref.keyResultId === e.target.value);
            if (option) onLink(item.id, option);
          }}
          className="rounded-md border border-ink-200 bg-surface-base px-2 py-0.5 text-[11px] text-muted focus:border-accent-600 focus:outline-none"
        >
          <option value="" disabled>
            + Link key result
          </option>
          {available.map((option) => (
            <option key={option.ref.keyResultId} value={option.ref.keyResultId}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}
