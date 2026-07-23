/**
 * One bucket column: header with label + criteria copy + nudge when applicable,
 * native onDragOver/onDrop target, renders its items.
 */
import type { ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import type { TriageBucket, TriageItem } from "~/utils/backlog-triage-store";
import { NEXT_SIZE_THRESHOLD } from "~/utils/backlog-triage-store";
import TriageItemCard from "./TriageItemCard";
import type { TriageConcept } from "./TriageHelpModal";

const BUCKET_META: Record<
  TriageBucket,
  { label: string; criteria: string; concept: TriageConcept }
> = {
  now: {
    label: "Now",
    criteria: "Committed this cycle, named owner",
    concept: "now",
  },
  next: {
    label: "Next",
    criteria: "Short queue, size-limited, within a quarter",
    concept: "next",
  },
  never: {
    label: "Never",
    criteria: "Said out loud, closed with a reason",
    concept: "never",
  },
};

export default function TriageColumn({
  bucket,
  items,
  allItems,
  onDrop,
  onMove,
  onSetReason,
  onDelete,
  onHelp,
}: {
  bucket: TriageBucket;
  items: TriageItem[];
  allItems: TriageItem[];
  onDrop: (itemId: string) => void;
  onMove: (itemId: string, bucket: TriageBucket) => void;
  onSetReason: (itemId: string, reason: string) => void;
  onDelete: (itemId: string) => void;
  onHelp: (concept: TriageConcept) => void;
}) {
  const meta = BUCKET_META[bucket];
  const nextCount = allItems.filter((i) => i.bucket === "next").length;
  const neverItemsNoReason = allItems.filter(
    (i) => i.bucket === "never" && !i.neverReason.trim(),
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        const itemId = e.dataTransfer.getData("text/plain");
        if (itemId) onDrop(itemId);
      }}
      className="rounded-xl border border-ink-200 bg-surface-raised p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-body font-semibold text-strong">{meta.label}</p>
          <p className="text-caption text-muted">{meta.criteria}</p>
        </div>
        <button
          type="button"
          onClick={() => onHelp(meta.concept)}
          className="inline-flex items-center gap-1 text-caption text-muted transition-colors hover:text-accent-700"
        >
          <HelpCircle size={14} strokeWidth={2} />
        </button>
      </div>

      {bucket === "next" && nextCount > NEXT_SIZE_THRESHOLD && (
        <p className="mt-2 text-caption text-faint italic">
          Next has a size limit by definition — consider moving some items to Now or Never.
        </p>
      )}

      {bucket === "never" && neverItemsNoReason.length > 0 && (
        <p className="mt-2 text-caption text-faint italic">
          Never items should have a reason — the post's whole point.
        </p>
      )}

      <div className="mt-3 grid gap-2">
        {items.map((item) => (
          <TriageItemCard
            key={item.id}
            item={item}
            onMove={(b) => onMove(item.id, b)}
            onSetReason={(r) => onSetReason(item.id, r)}
            onDelete={() => onDelete(item.id)}
          />
        ))}
        {items.length === 0 && (
          <p className="text-caption text-faint text-center py-4">
            Drop items here or use the buttons above.
          </p>
        )}
      </div>
    </div>
  );
}
