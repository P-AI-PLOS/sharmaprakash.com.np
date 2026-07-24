/**
 * Editor for one OKR entry: the objective, its department/product tag, and its
 * key results in who / does-what / by-how-much form. The three-field split is
 * the teaching lever — there is deliberately no free-text "key result" box.
 */
import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import {
  MAX_KEY_RESULTS,
  newKeyResult,
  okrStore,
  titleFor,
  type OkrKeyResult,
  type OkrRecord,
  type OkrTag,
} from "~/utils/okr-store";
import { quarterKey, type QuarterRef } from "~/utils/pipeline-store";

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

const KR_FIELDS: {
  key: keyof Omit<OkrKeyResult, "id">;
  label: string;
  hint: string;
  placeholder: string;
}[] = [
  {
    key: "who",
    label: "Who",
    hint: "The population whose behaviour changes — not your team.",
    placeholder: "Trial bakery owners",
  },
  {
    key: "doesWhat",
    label: "Does what",
    hint: "A behaviour that proves they got value — not a feature they touched.",
    placeholder: "stop touching the paper order book during a live rush",
  },
  {
    key: "byHowMuch",
    label: "By how much",
    hint: "Phrase it \"up from X to Y\" so it reads as one sentence with who + does what.",
    placeholder: "up from 1 in 8 trials to 1 in 2",
  },
];

const isBlankKr = (kr: OkrKeyResult) =>
  !kr.who.trim() && !kr.doesWhat.trim() && !kr.byHowMuch.trim();

export default function OkrEntryForm({
  productId,
  quarter,
  record,
  onSaved,
  onCancel,
  onDeleted,
}: {
  productId: string;
  /** The quarter a brand-new entry is stamped with. Ignored when editing. */
  quarter: QuarterRef;
  /** The entry being edited, or `null` to create a new one. */
  record: OkrRecord | null;
  onSaved: (id: string) => void;
  onCancel: () => void;
  onDeleted: (id: string) => void;
}) {
  const [objective, setObjective] = useState(record?.objective ?? "");
  const [tag, setTag] = useState<OkrTag>(record?.tag ?? { kind: "department", label: "" });
  const [keyResults, setKeyResults] = useState<OkrKeyResult[]>(
    record?.keyResults?.length ? record.keyResults : [newKeyResult()],
  );
  const [error, setError] = useState<string | null>(null);

  const stampedQuarter = record?.quarter ?? quarter;

  const patchKr = (id: string, field: keyof Omit<OkrKeyResult, "id">, value: string) =>
    setKeyResults((rows) => rows.map((kr) => (kr.id === id ? { ...kr, [field]: value } : kr)));

  const addKr = () =>
    setKeyResults((rows) => (rows.length >= MAX_KEY_RESULTS ? rows : [...rows, newKeyResult()]));

  const removeKr = (id: string) =>
    setKeyResults((rows) => (rows.length <= 1 ? rows : rows.filter((kr) => kr.id !== id)));

  const save = () => {
    if (!objective.trim()) {
      setError("Give the objective a sentence — it's what the key results are evidence for.");
      return;
    }
    if (!tag.label.trim()) {
      setError("Tag the entry with the department or product that owns it.");
      return;
    }
    // Blank rows are dropped, but ids on the rows that survive are never re-minted.
    const kept = keyResults.filter((kr) => !isBlankKr(kr));
    if (kept.length === 0) {
      setError("Add at least one key result — who changes their behaviour, and by how much.");
      return;
    }

    const data = {
      objective: objective.trim(),
      tag: { kind: tag.kind, label: tag.label.trim() },
      keyResults: kept,
    };

    if (record) {
      okrStore.update(record.id, data);
      onSaved(record.id);
    } else {
      const created = okrStore.create({ productId, quarter: stampedQuarter, ...data });
      onSaved(created.id);
    }
  };

  const remove = () => {
    if (!record) return;
    if (!window.confirm(`Delete "${titleFor(record)}"? This can't be undone.`)) return;
    okrStore.remove(record.id);
    onDeleted(record.id);
  };

  return (
    <div className="rounded-lg border border-accent-600 bg-surface-raised p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption font-semibold text-muted">
          {record ? "Editing" : "New objective"} · {quarterKey(stampedQuarter)}
        </p>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close the editor"
          className="shrink-0 text-faint transition-colors hover:text-accent-700"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      <label className="mt-4 block">
        <span className="text-caption font-semibold text-muted">
          Objective — the qualitative change you want
        </span>
        <textarea
          value={objective}
          rows={2}
          placeholder="e.g. Trial bakery owners trust Donut CRM enough to close the paper order book for good"
          onChange={(e) => {
            setObjective(e.target.value);
            setError(null);
          }}
          className={`mt-1 ${inputClass}`}
        />
      </label>

      <fieldset className="mt-4">
        <legend className="text-caption font-semibold text-muted">Owned by</legend>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-md border border-ink-200">
            {(["department", "product"] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setTag((t) => ({ ...t, kind }))}
                aria-pressed={tag.kind === kind}
                className={`px-3 py-2 text-caption font-semibold capitalize transition-colors ${
                  tag.kind === kind
                    ? "bg-accent-600 text-white"
                    : "bg-surface-base text-muted hover:text-accent-700"
                }`}
              >
                {kind}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={tag.label}
            placeholder={tag.kind === "department" ? "e.g. Growth" : "e.g. Onboarding"}
            aria-label={`${tag.kind} name`}
            onChange={(e) => {
              setTag((t) => ({ ...t, label: e.target.value }));
              setError(null);
            }}
            className={`${inputClass} sm:max-w-xs`}
          />
        </div>
      </fieldset>

      <div className="mt-5">
        <p className="text-caption font-semibold text-muted">
          Key results ({keyResults.length} of {MAX_KEY_RESULTS})
        </p>
        <p className="mt-1 text-caption text-faint">
          Each one names a person, a behaviour, and an amount. If you can &ldquo;finish&rdquo; it,
          it&rsquo;s a Rock, not a key result.
        </p>

        <div className="mt-3 grid gap-3">
          {keyResults.map((kr, i) => (
            <div key={kr.id} className="rounded-lg border border-ink-200 bg-surface-base p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-caption font-semibold text-strong">Key result {i + 1}</p>
                <button
                  type="button"
                  onClick={() => removeKr(kr.id)}
                  disabled={keyResults.length <= 1}
                  aria-label={`Remove key result ${i + 1}`}
                  className="shrink-0 text-faint transition-colors hover:text-accent-700 disabled:cursor-default disabled:opacity-40 disabled:hover:text-faint"
                >
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {KR_FIELDS.map((field) => (
                  <label key={field.key} className="block">
                    <span className="text-caption font-semibold text-muted">{field.label}</span>
                    <input
                      type="text"
                      value={kr[field.key]}
                      placeholder={field.placeholder}
                      onChange={(e) => {
                        patchKr(kr.id, field.key, e.target.value);
                        setError(null);
                      }}
                      className={`mt-1 ${inputClass}`}
                    />
                    <span className="mt-1 block text-caption text-faint">{field.hint}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {keyResults.length < MAX_KEY_RESULTS && (
          <button
            type="button"
            onClick={addKr}
            className="mt-3 inline-flex items-center gap-1 text-caption font-semibold text-accent-700 link-underline"
          >
            <Plus size={14} strokeWidth={2} />
            Add key result
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-caption font-semibold text-accent-800">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 pt-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={save} className="btn btn-primary !py-2">
            {record ? "Save changes" : "Save objective"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-caption font-semibold text-muted link-underline"
          >
            Cancel
          </button>
        </div>
        {record && (
          <button
            type="button"
            onClick={remove}
            className="inline-flex items-center gap-1 text-caption font-semibold text-faint link-underline"
          >
            <Trash2 size={14} strokeWidth={2} />
            Delete objective
          </button>
        )}
      </div>
    </div>
  );
}
