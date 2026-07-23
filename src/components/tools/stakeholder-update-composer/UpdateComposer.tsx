/**
 * Stakeholder Update Composer — the pipeline's Founder ring. Given the active
 * product and a selected quarter, it assembles whatever pipeline data already
 * exists (OKR + KR confidence, discovery highlights, cadence status, adoption
 * signal) into one editable, copyable markdown draft. Partial pipelines are the
 * normal case: any missing source simply produces no section plus an honest
 * coverage note. It composes; it never transmits — output leaves only through
 * copy-to-clipboard of plain text. Persists via `update-store`; reads sibling
 * data read-only via `update-sources`.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { ExerciseShell } from "~/components/course/exercises/exercise-ui";
import {
  currentQuarter,
  nextQuarter,
  quarterKey,
  resolveActiveProduct,
  type ProductRecord,
  type QuarterRef,
} from "~/utils/pipeline-store";
import {
  editedSinceCompose,
  updateStore,
  type UpdateRecord,
  type UpdateSourceRefs,
} from "~/utils/update-store";
import {
  assembleSources,
  composeBody,
  coverageRows,
  listOstChoices,
  type AssembledSources,
  type OstChoice,
} from "~/utils/update-sources";
import CoverageChecklist from "./CoverageChecklist";
import DraftEditor from "./DraftEditor";
import UpdateSwitcher from "./UpdateSwitcher";

/** Inverse of the contract's `nextQuarter` — kept local to avoid coupling to a sibling store. */
const prevQuarter = (quarter: QuarterRef): QuarterRef =>
  quarter.quarter === 1
    ? { year: quarter.year - 1, quarter: 4 }
    : { year: quarter.year, quarter: (quarter.quarter - 1) as QuarterRef["quarter"] };

const refsFrom = (assembled: AssembledSources): UpdateSourceRefs => ({
  okrId: assembled.okrs[0]?.id,
  checkinId: assembled.checkin?.id,
  cadenceId: assembled.cadence?.id,
  ost: assembled.discovery
    ? { ostRecordId: assembled.discovery.ostRecordId, outcomeSnapshot: assembled.discovery.outcome }
    : undefined,
});

const selectClass =
  "rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong focus:border-accent-600 focus:outline-none";

export default function UpdateComposer() {
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [quarter, setQuarter] = useState<QuarterRef>(() => currentQuarter());
  const [records, setRecords] = useState<UpdateRecord[]>([]);
  const [draft, setDraft] = useState<UpdateRecord | null>(null);
  const [ostChoices, setOstChoices] = useState<OstChoice[]>([]);
  const [ostChoice, setOstChoice] = useState<string>("");
  const hydrated = useRef(false);

  useEffect(() => {
    const active = resolveActiveProduct();
    setProduct(active);
    setOstChoices(listOstChoices());
    const list = updateStore.listForProduct(active.id);
    setRecords(list);
    const activeId = updateStore.getActiveId(active.id);
    const current = (activeId ? updateStore.get(activeId) : undefined) ?? list[0] ?? null;
    if (current) {
      setDraft(current);
      setQuarter(current.quarter);
      setOstChoice(current.sources.ost?.ostRecordId ?? "");
    }
    hydrated.current = true;
  }, []);

  // Live source assembly — reads localStorage fresh so sibling edits made on
  // their own pages are always reflected on the next render.
  const assembled = useMemo<AssembledSources>(() => {
    if (!product) return { okrs: [] };
    const preferred = ostChoice || draft?.sources.ost?.ostRecordId || undefined;
    return assembleSources(product.id, quarter, preferred);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, quarter, ostChoice, draft?.id, draft?.composedAt]);

  const rows = useMemo(
    () => coverageRows(assembled, draft?.sources.ost),
    [assembled, draft?.sources.ost],
  );

  if (!product) return null;

  const refresh = () => setRecords(updateStore.listForProduct(product.id));

  const createDraft = () => {
    const fresh = assembleSources(product.id, quarter, ostChoice || undefined);
    const now = Date.now();
    const record = updateStore.create({
      productId: product.id,
      quarter,
      title: `${product.name} update — ${quarterKey(quarter)}`,
      body: composeBody(product, quarter, fresh),
      sources: refsFrom(fresh),
      composedAt: now,
    });
    updateStore.setActiveId(product.id, record.id);
    setDraft(record);
    setOstChoice(record.sources.ost?.ostRecordId ?? "");
    refresh();
  };

  const switchTo = (id: string) => {
    const record = updateStore.get(id);
    if (!record) return;
    updateStore.setActiveId(product.id, id);
    setDraft(record);
    setQuarter(record.quarter);
    setOstChoice(record.sources.ost?.ostRecordId ?? "");
  };

  const removeDraft = (id: string) => {
    updateStore.remove(id);
    const remaining = updateStore.listForProduct(product.id);
    setRecords(remaining);
    if (draft?.id === id) {
      const next = remaining[0] ?? null;
      if (next) {
        updateStore.setActiveId(product.id, next.id);
        setDraft(next);
        setQuarter(next.quarter);
        setOstChoice(next.sources.ost?.ostRecordId ?? "");
      } else {
        setDraft(null);
      }
    }
  };

  const recompose = () => {
    if (!draft) return;
    const message = editedSinceCompose(draft)
      ? "Recompose from sources? This replaces the current draft, including your edits since the last compose."
      : "Recompose from sources? This replaces the current draft body.";
    if (!window.confirm(message)) return;
    const fresh = assembleSources(product.id, quarter, ostChoice || undefined);
    updateStore.update(draft.id, {
      quarter,
      body: composeBody(product, quarter, fresh),
      sources: refsFrom(fresh),
      composedAt: Date.now(),
    });
    const updated = updateStore.get(draft.id);
    if (updated) setDraft(updated);
    refresh();
  };

  const patchDraft = (patch: Partial<Pick<UpdateRecord, "title" | "body">>) => {
    if (!draft) return;
    updateStore.update(draft.id, patch);
    const updated = updateStore.get(draft.id);
    if (updated) setDraft(updated);
    refresh();
  };

  return (
    <ExerciseShell
      kicker="Free tool"
      title="Compose a stakeholder update"
      instructions="Pick a quarter and the composer drafts an update from whatever pipeline data you've already captured for this product. Edit it, then copy it out — it saves in your browser and nothing is sent anywhere."
      headerAction={
        <UpdateSwitcher
          records={records}
          activeId={draft?.id ?? null}
          onSelect={switchTo}
          onCreate={createDraft}
          onDelete={removeDraft}
        />
      }
    >
      {/* Product + quarter + discovery source */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="text-caption text-faint">Product</p>
          <p className="mt-1 text-body font-semibold text-strong">{product.name}</p>
        </div>

        <div>
          <label className="block text-caption text-faint" id="update-quarter-label">
            Quarter
          </label>
          <div className="mt-1 flex items-center gap-1" aria-labelledby="update-quarter-label">
            <button
              type="button"
              onClick={() => setQuarter((current) => prevQuarter(current))}
              aria-label="Previous quarter"
              className="rounded-md border border-ink-200 bg-surface-base p-2 text-muted transition-colors hover:border-accent-600 hover:text-accent-700"
            >
              <ChevronLeft size={15} strokeWidth={2} />
            </button>
            <span className="min-w-[5rem] text-center text-body font-semibold text-strong">
              {quarterKey(quarter)}
            </span>
            <button
              type="button"
              onClick={() => setQuarter((current) => nextQuarter(current))}
              aria-label="Next quarter"
              className="rounded-md border border-ink-200 bg-surface-base p-2 text-muted transition-colors hover:border-accent-600 hover:text-accent-700"
            >
              <ChevronRight size={15} strokeWidth={2} />
            </button>
          </div>
        </div>

        {ostChoices.length > 0 && (
          <div>
            <label htmlFor="update-ost" className="block text-caption text-faint">
              Discovery tree
            </label>
            <select
              id="update-ost"
              value={ostChoice}
              onChange={(event) => setOstChoice(event.target.value)}
              className={`mt-1 ${selectClass}`}
            >
              <option value="">Auto (active or most recent)</option>
              {ostChoices.map((choice) => (
                <option key={choice.id} value={choice.id}>
                  {choice.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-5">
        <CoverageChecklist rows={rows} />
      </div>

      {draft ? (
        <div className="mt-4">
          <DraftEditor
            title={draft.title}
            body={draft.body}
            edited={editedSinceCompose(draft)}
            onTitle={(title) => patchDraft({ title })}
            onBody={(body) => patchDraft({ body })}
            onRecompose={recompose}
          />
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-ink-200 bg-surface-base p-6 text-center">
          <p className="text-body text-muted">
            No draft for {quarterKey(quarter)} yet. Compose one from the sources above — even an OKR
            and an opportunity tree make a valid early-quarter update.
          </p>
          <button
            type="button"
            onClick={createDraft}
            className="btn btn-primary mt-4 inline-flex items-center gap-2"
          >
            <Sparkles size={15} strokeWidth={2} />
            Compose {quarterKey(quarter)} update
          </button>
        </div>
      )}
    </ExerciseShell>
  );
}
