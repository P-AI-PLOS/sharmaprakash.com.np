/**
 * DemoChecklist — demo-day items whose FIRST question is "which key result does
 * this demo move" (design D5). The KR options come from the OKR Organizer's data
 * for the active product and current quarter; picking one stores an
 * `OkrKeyResultRef` plus a text snapshot.
 *
 * Degrades per the contract's D5 rule: on render each item's ref is re-resolved,
 * a reworded KR shows the snapshot with a "source changed" badge and a removed
 * one a "source removed" badge — items stay editable and completable either way.
 * When the product has no OKR data at all the form still works, stores a null
 * ref, and shows a visible "not tied to a key result" marker linking to the OKR
 * Organizer.
 */
import { useState } from "react";
import { CheckSquare, ExternalLink, Square, Target, Trash2 } from "lucide-react";
import type { OkrKeyResultRef } from "~/utils/pipeline-store";
import {
  resolveKeyResult,
  type CadenceRecord,
  type DemoItem,
  type KeyResultOption,
} from "~/utils/cadence-store";

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none disabled:opacity-60";

const optionKey = (ref: OkrKeyResultRef): string => `${ref.okrId}:${ref.keyResultId}`;

export default function DemoChecklist({
  productId,
  record,
  readOnly,
  krOptions,
  onAdd,
  onUpdate,
  onRemove,
}: {
  productId: string;
  record: CadenceRecord;
  readOnly: boolean;
  krOptions: KeyResultOption[];
  onAdd: (data: Pick<DemoItem, "what" | "keyResult" | "keyResultSnapshot">) => void;
  onUpdate: (demoId: string, patch: Partial<Omit<DemoItem, "id">>) => void;
  onRemove: (demoId: string) => void;
}) {
  const [selectedKey, setSelectedKey] = useState("");
  const [what, setWhat] = useState("");

  const hasOkrData = krOptions.length > 0;

  const add = () => {
    if (!what.trim()) return;
    const option = krOptions.find((o) => optionKey(o.ref) === selectedKey);
    onAdd({
      what: what.trim(),
      keyResult: option ? option.ref : null,
      keyResultSnapshot: option ? option.text : "",
    });
    setWhat("");
    setSelectedKey("");
  };

  return (
    <section aria-label="Demo-day checklist">
      <h4 className="text-h5 text-strong">Demo-day checklist</h4>
      <p className="mt-1 text-caption text-muted">
        Every demo should move a key result. Name the outcome first, then what you'll show.
      </p>

      {record.demos.length > 0 && (
        <ul className="mt-3 grid gap-3">
          {record.demos.map((item) => (
            <DemoRow
              key={item.id}
              item={item}
              productId={productId}
              readOnly={readOnly}
              onToggle={() => onUpdate(item.id, { done: !item.done })}
              onRemove={() => onRemove(item.id)}
            />
          ))}
        </ul>
      )}

      {!readOnly && (
        <div className="mt-4 rounded-lg border border-ink-200 bg-surface-raised p-4">
          <p className="text-caption font-semibold text-muted">Add a demo</p>

          <label htmlFor="demo-kr" className="mt-2 block text-caption text-faint">
            1 · Which key result does this move?
          </label>
          {hasOkrData ? (
            <select
              id="demo-kr"
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className={`mt-1 ${inputClass}`}
            >
              <option value="">— not tied to a key result —</option>
              {krOptions.map((o) => (
                <option key={optionKey(o.ref)} value={optionKey(o.ref)}>
                  {o.text}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-1 text-caption text-muted">
              No key results yet for this quarter — this demo will be saved as{" "}
              <span className="font-semibold text-strong">not tied to a key result</span>. Set
              outcomes in the{" "}
              <a href="/tools/okr-organizer/" className="link-underline text-accent-700">
                OKR Organizer
              </a>{" "}
              to link them here.
            </p>
          )}

          <label htmlFor="demo-what" className="mt-3 block text-caption text-faint">
            2 · What are you demoing?
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="demo-what"
              type="text"
              value={what}
              onChange={(e) => setWhat(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="e.g. One-click reorder from the order history screen"
              className={inputClass}
            />
            <button type="button" onClick={add} className="btn btn-primary shrink-0 !py-2">
              Add
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function DemoRow({
  item,
  productId,
  readOnly,
  onToggle,
  onRemove,
}: {
  item: DemoItem;
  productId: string;
  readOnly: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const resolution = resolveKeyResult(productId, item.keyResult, item.keyResultSnapshot);

  return (
    <li
      className={`rounded-lg border p-4 ${
        item.done ? "border-accent-600 bg-accent-50" : "border-ink-200 bg-surface-base"
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={readOnly ? undefined : onToggle}
          disabled={readOnly}
          aria-pressed={item.done}
          aria-label={item.done ? "Mark not done" : "Mark done"}
          className="mt-0.5 shrink-0 text-accent-700 disabled:opacity-60"
        >
          {item.done ? (
            <CheckSquare size={18} strokeWidth={2} />
          ) : (
            <Square size={18} strokeWidth={2} className="text-faint" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className={`text-body text-strong ${item.done ? "line-through opacity-70" : ""}`}>
            {item.what}
          </p>
          <KeyResultLine item={item} resolution={resolution} />
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove demo item"
            className="shrink-0 text-faint transition-colors hover:text-accent-700"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        )}
      </div>
    </li>
  );
}

function KeyResultLine({
  item,
  resolution,
}: {
  item: DemoItem;
  resolution: ReturnType<typeof resolveKeyResult>;
}) {
  // Never linked to a KR — the visible "not tied" marker (D5 empty-state path).
  if (item.keyResult === null) {
    return (
      <p className="mt-1 inline-flex items-center gap-1.5 text-caption text-muted">
        <Target size={12} strokeWidth={2} className="shrink-0 text-faint" />
        Not tied to a key result ·{" "}
        <a href="/tools/okr-organizer/" className="link-underline text-accent-700">
          set outcomes <ExternalLink size={10} strokeWidth={2} className="inline" />
        </a>
      </p>
    );
  }

  const badge =
    resolution.status === "changed"
      ? "source changed"
      : resolution.status === "missing"
        ? "source removed"
        : null;
  const text = resolution.status === "live" ? resolution.text : item.keyResultSnapshot;

  return (
    <p className="mt-1 flex flex-wrap items-center gap-1.5 text-caption">
      <Target size={12} strokeWidth={2} className="shrink-0 text-accent-700" />
      <span className="text-muted">{text}</span>
      {badge && (
        <span className="rounded-md border border-ink-200 bg-surface-raised px-1.5 py-0.5 font-semibold text-strong">
          {badge}
        </span>
      )}
    </p>
  );
}
