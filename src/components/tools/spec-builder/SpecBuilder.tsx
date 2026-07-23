/**
 * Spec Builder — stage 03 of the Donut CRM pipeline. Pick a starred
 * opportunity + solution from an opportunity solution tree, answer one framing
 * question, choose one of three formats, fill the scaffolded sections, list the
 * acceptance criteria, and export Markdown. Persists to localStorage via
 * spec-store; OST data is read, never written.
 */
import { useEffect, useRef, useState } from "react";
import { ExerciseShell } from "~/components/course/exercises/exercise-ui";
import SpecOstPicker from "./SpecOstPicker";
import SpecFormatPicker, { SpecFormatSegmented } from "./SpecFormatPicker";
import SpecSwitcher from "./SpecSwitcher";
import SpecMarkdownExport from "./SpecMarkdownExport";
import {
  SPEC_SECTION_KEYS,
  SPEC_SECTION_META,
  applyPickSeeds,
  createSpec,
  deleteSpec,
  listSpecsForProduct,
  newCriterion,
  resolveActiveProduct,
  resolveActiveSpec,
  setActiveSpecId,
  updateSpec,
  type OstPickRef,
  type SpecFormat,
  type SpecFramingJob,
  type SpecRecord,
} from "~/utils/spec-store";

interface SpecBuilderProps {
  kicker?: string;
  title?: string;
  instructions?: string;
}

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

const hasWriting = (spec: SpecRecord): boolean =>
  Object.values(spec.sections).some((v) => v.trim()) || spec.acceptanceCriteria.length > 0;

export default function SpecBuilder({
  kicker = "Free tool",
  title = "Build your spec",
  instructions = "Start from an opportunity you already found, say what job the spec has to do, then write it in the format that fits. It saves in your browser — nothing is sent anywhere.",
}: SpecBuilderProps) {
  const [productId, setProductId] = useState<string | null>(null);
  const [records, setRecords] = useState<SpecRecord[]>([]);
  const [spec, setSpec] = useState<SpecRecord | null>(null);
  const [showFormatCards, setShowFormatCards] = useState(true);
  const hydrated = useRef(false);

  useEffect(() => {
    const product = resolveActiveProduct();
    const active = resolveActiveSpec(product.id);
    setProductId(product.id);
    setSpec(active);
    setRecords(listSpecsForProduct(product.id));
    setShowFormatCards(!hasWriting(active));
    hydrated.current = true;
  }, []);

  /** Single write path: patch state, persist, refresh the switcher list. */
  const patch = (changes: Partial<Omit<SpecRecord, "id" | "createdAt">>) => {
    if (!spec || !productId) return;
    const next = { ...spec, ...changes, updatedAt: Date.now() };
    setSpec(next);
    updateSpec(spec.id, changes);
    setRecords(listSpecsForProduct(productId));
  };

  const openSpec = (record: SpecRecord) => {
    if (!productId) return;
    setActiveSpecId(productId, record.id);
    setSpec(record);
    setRecords(listSpecsForProduct(productId));
    setShowFormatCards(!hasWriting(record));
  };

  const switchTo = (id: string) => {
    const record = records.find((r) => r.id === id);
    if (record) openSpec(record);
  };

  const createAndSwitch = () => {
    openSpec(createSpec());
  };

  const removeSpec = (id: string) => {
    if (!productId) return;
    deleteSpec(id);
    const remaining = listSpecsForProduct(productId);
    setRecords(remaining);
    if (id === spec?.id) openSpec(remaining[0] ?? createSpec());
  };

  const applyPick = (ref: OstPickRef) => {
    if (!spec) return;
    patch({
      sourcePick: ref,
      sections: applyPickSeeds(spec.sections, ref.opportunityText, ref.solutionText, spec.format),
      title: spec.title.trim() || ref.solutionText,
    });
  };

  const applyManualPick = (opportunityText: string, solutionText: string) => {
    if (!spec) return;
    patch({
      sourcePick: null,
      sections: applyPickSeeds(spec.sections, opportunityText, solutionText, spec.format),
      title: spec.title.trim() || solutionText,
    });
  };

  const changeFormat = (format: SpecFormat) => {
    if (!spec) return;
    const pick = spec.sourcePick;
    patch({
      format,
      // Sections are never dropped on a switch — only empty ones get seeded.
      sections: pick
        ? applyPickSeeds(spec.sections, pick.opportunityText, pick.solutionText, format)
        : spec.sections,
    });
  };

  const setSection = (key: string, value: string) => {
    if (!spec) return;
    patch({ sections: { ...spec.sections, [key]: value } });
  };

  const addCriterion = () => {
    if (!spec) return;
    patch({ acceptanceCriteria: [...spec.acceptanceCriteria, newCriterion()] });
  };

  const setCriterion = (id: string, text: string) => {
    if (!spec) return;
    patch({
      acceptanceCriteria: spec.acceptanceCriteria.map((c) => (c.id === id ? { ...c, text } : c)),
    });
  };

  const removeCriterion = (id: string) => {
    if (!spec) return;
    patch({ acceptanceCriteria: spec.acceptanceCriteria.filter((c) => c.id !== id) });
  };

  if (!spec) {
    return (
      <ExerciseShell kicker={kicker} title={title} instructions={instructions}>
        <p className="text-body text-muted">Loading your specs…</p>
      </ExerciseShell>
    );
  }

  return (
    <ExerciseShell
      kicker={kicker}
      title={title}
      instructions={instructions}
      headerAction={
        <SpecSwitcher
          records={records}
          activeId={spec.id}
          onSelect={switchTo}
          onCreate={createAndSwitch}
          onRename={(id, next) => (id === spec.id ? patch({ title: next }) : updateSpec(id, { title: next }))}
          onDelete={removeSpec}
        />
      }
    >
      <div className="grid gap-6">
        <SpecOstPicker pick={spec.sourcePick} onPick={applyPick} onManualPick={applyManualPick} />

        <div>
          <label htmlFor="spec-title" className="text-caption font-semibold text-muted">
            Spec title
          </label>
          <input
            id="spec-title"
            type="text"
            value={spec.title}
            placeholder="e.g. Shared activity strip on the account record"
            onChange={(e) => patch({ title: e.target.value })}
            className={`mt-1 ${inputClass}`}
          />
        </div>

        {showFormatCards ? (
          <SpecFormatPicker
            framingJob={spec.framingJob}
            format={spec.format}
            onFraming={(job: SpecFramingJob) => patch({ framingJob: job })}
            onFormat={changeFormat}
          />
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SpecFormatSegmented format={spec.format} onFormat={changeFormat} />
            <button
              type="button"
              onClick={() => setShowFormatCards(true)}
              className="text-caption font-semibold text-accent-700 link-underline"
            >
              What do these formats do?
            </button>
          </div>
        )}

        <div className="grid gap-4">
          {SPEC_SECTION_KEYS[spec.format].map((key) => {
            const meta = SPEC_SECTION_META[key];
            return (
              <div key={key}>
                <label htmlFor={`spec-section-${key}`} className="text-caption font-semibold text-muted">
                  {meta?.label ?? key}
                </label>
                {meta?.hint && <p className="text-caption text-faint">{meta.hint}</p>}
                <textarea
                  id={`spec-section-${key}`}
                  value={spec.sections[key] ?? ""}
                  placeholder={meta?.placeholder}
                  rows={3}
                  onChange={(e) => setSection(key, e.target.value)}
                  className={`mt-1 ${inputClass}`}
                />
              </div>
            );
          })}
        </div>

        <div className="border-t border-ink-200 pt-4">
          <p className="text-caption font-semibold text-muted">Acceptance criteria</p>
          <p className="text-caption text-faint">
            What has to be true for this to be done. These travel with the spec into slicing and
            testing, whichever format you write in.
          </p>

          {spec.acceptanceCriteria.length > 0 && (
            <ul className="mt-3 grid gap-2">
              {spec.acceptanceCriteria.map((criterion) => (
                <li key={criterion.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={criterion.text}
                    placeholder="e.g. A rep sees the five most recent activities on any account"
                    onChange={(e) => setCriterion(criterion.id, e.target.value)}
                    aria-label="Acceptance criterion"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeCriterion(criterion.id)}
                    aria-label={`Remove criterion: ${criterion.text || "empty"}`}
                    className="shrink-0 text-caption font-semibold text-faint link-underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button type="button" onClick={addCriterion} className="btn btn-primary mt-3 shrink-0 !py-2">
            Add criterion
          </button>
        </div>

        <SpecMarkdownExport spec={spec} />
      </div>
    </ExerciseShell>
  );
}
