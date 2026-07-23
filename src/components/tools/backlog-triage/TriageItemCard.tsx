/**
 * Single triage item: text, three bucket toggle buttons, drag handle,
 * inline never-reason input when bucket === "never", delete action.
 */
import { GripVertical, Trash2 } from "lucide-react";
import { ChoiceButton } from "~/components/course/exercises/exercise-ui";
import type { TriageBucket, TriageItem } from "~/utils/backlog-triage-store";

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

export default function TriageItemCard({
  item,
  onMove,
  onSetReason,
  onDelete,
}: {
  item: TriageItem;
  onMove: (bucket: TriageBucket) => void;
  onSetReason: (reason: string) => void;
  onDelete: () => void;
}) {
  return (
    <div
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", item.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="rounded-lg border border-ink-200 bg-surface-base p-3"
    >
      <div className="flex items-start gap-2">
        <span
          className="mt-1 shrink-0 cursor-grab text-faint active:cursor-grabbing"
          aria-hidden="true"
        >
          <GripVertical size={14} strokeWidth={2} />
        </span>
        <p className="flex-1 text-body text-strong">{item.text}</p>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete: ${item.text}`}
          className="shrink-0 text-faint transition-colors hover:text-accent-700"
        >
          <Trash2 size={14} strokeWidth={2} />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <ChoiceButton
          label="Now"
          selected={item.bucket === "now"}
          onClick={() => onMove("now")}
        />
        <ChoiceButton
          label="Next"
          selected={item.bucket === "next"}
          onClick={() => onMove("next")}
        />
        <ChoiceButton
          label="Never"
          selected={item.bucket === "never"}
          onClick={() => onMove("never")}
        />
      </div>

      {item.bucket === "never" && (
        <input
          type="text"
          value={item.neverReason}
          onChange={(e) => onSetReason(e.target.value)}
          placeholder="Why? (e.g. closed for age, serves a deprioritized segment)"
          className={`mt-2 ${inputClass}`}
        />
      )}
    </div>
  );
}
