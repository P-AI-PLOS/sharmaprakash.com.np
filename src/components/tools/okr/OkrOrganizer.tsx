/**
 * Stage 01 of the Donut CRM pipeline: capture customer-centric OKRs — an
 * aspirational objective plus key results in who / does-what / by-how-much
 * form — one quarter at a time, with the previous quarters browsable below.
 *
 * Everything persists to localStorage via `~/utils/okr-store`; nothing is sent
 * anywhere. Key-result ids minted here are what the four downstream pipeline
 * tools join on as `OkrKeyResultRef`.
 */
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, HelpCircle, Plus, Target } from "lucide-react";
import { ExerciseShell } from "~/components/course/exercises/exercise-ui";
import FormatChooser from "./FormatChooser";
import OkrEntryForm from "./OkrEntryForm";
import QuarterHistory, { DraftBadge, TagChip } from "./QuarterHistory";
import {
  acceptDraft,
  entriesByQuarter,
  isIntroDismissed,
  listForQuarter,
  prevQuarter,
  setIntroDismissed,
  titleFor,
  type OkrRecord,
} from "~/utils/okr-store";
import {
  currentQuarter,
  nextQuarter,
  quarterKey,
  resolveActiveProduct,
  type ProductRecord,
  type QuarterRef,
} from "~/utils/pipeline-store";

const EDITOR_ANCHOR_ID = "okr-editor";

export default function OkrOrganizer() {
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [quarter, setQuarter] = useState<QuarterRef>(() => currentQuarter());
  const [introOpen, setIntroOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  // Bumped after every store write so the derived lists below re-read.
  const [version, setVersion] = useState(0);

  // localStorage only exists on the client — resolve everything after mount,
  // same as tools/ost/TreeBuilder.
  useEffect(() => {
    setProduct(resolveActiveProduct());
    setIntroOpen(!isIntroDismissed());
  }, []);

  const entries = useMemo(
    () => (product ? listForQuarter(product.id, quarter) : []),
    // `version` is the store-write signal; the store is not reactive on its own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product, quarter, version],
  );

  const groups = useMemo(
    () => (product ? entriesByQuarter(product.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product, version],
  );

  const refresh = () => setVersion((v) => v + 1);

  const closeEditor = () => {
    setEditingId(null);
    setCreating(false);
  };

  const startCreating = () => {
    setEditingId(null);
    setCreating(true);
  };

  const openEntry = (record: OkrRecord) => {
    setQuarter(record.quarter);
    setCreating(false);
    setEditingId(record.id);
  };

  const dismissIntro = () => {
    setIntroDismissed(true);
    setIntroOpen(false);
  };

  const reopenIntro = () => {
    setIntroDismissed(false);
    setIntroOpen(true);
  };

  const commitDraft = (id: string) => {
    acceptDraft(id);
    refresh();
  };

  const selectedKey = quarterKey(quarter);
  const editing = editingId ? (entries.find((e) => e.id === editingId) ?? null) : null;
  // An entry opened from history could belong to a quarter we just switched to,
  // so fall back to closing the editor if it has since been deleted.
  const editorOpen = creating || Boolean(editing);

  return (
    <ExerciseShell
      kicker="Free tool"
      title="Organize this quarter's OKRs"
      instructions="An objective is the qualitative change you want. Each key result names who changes their behaviour, what that behaviour is, and by how much it moves. It all saves in your browser — nothing is sent anywhere."
      headerAction={
        <button
          type="button"
          onClick={reopenIntro}
          className="btn btn-ghost shrink-0 !py-1.5 !text-caption"
        >
          <HelpCircle size={14} strokeWidth={2} />
          <span>What&rsquo;s the difference?</span>
        </button>
      }
    >
      {!product ? (
        <p className="text-body text-muted">Loading your OKRs…</p>
      ) : (
        <>
          {introOpen && (
            <div className="mb-6">
              <FormatChooser
                onWriteOkr={() => {
                  dismissIntro();
                  startCreating();
                }}
                onDismiss={dismissIntro}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-caption text-muted">
              <Target size={14} strokeWidth={2} className="text-accent-700" />
              Product: <span className="font-semibold text-strong">{product.name}</span>
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  closeEditor();
                  setQuarter(prevQuarter(quarter));
                }}
                aria-label="Previous quarter"
                className="rounded-md border border-ink-200 p-1.5 text-muted transition-colors hover:border-accent-600 hover:text-accent-700"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
              <span className="min-w-[5.5rem] text-center text-body font-semibold text-strong">
                {selectedKey}
              </span>
              <button
                type="button"
                onClick={() => {
                  closeEditor();
                  setQuarter(nextQuarter(quarter));
                }}
                aria-label="Next quarter"
                className="rounded-md border border-ink-200 p-1.5 text-muted transition-colors hover:border-accent-600 hover:text-accent-700"
              >
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div id={EDITOR_ANCHOR_ID} className="mt-4 grid gap-3">
            {entries.map((entry) =>
              entry.id === editingId ? (
                <OkrEntryForm
                  key={entry.id}
                  productId={product.id}
                  quarter={quarter}
                  record={entry}
                  onSaved={() => {
                    refresh();
                    closeEditor();
                  }}
                  onCancel={closeEditor}
                  onDeleted={() => {
                    refresh();
                    closeEditor();
                  }}
                />
              ) : (
                <article
                  key={entry.id}
                  className={`rounded-lg border p-4 ${
                    entry.draft
                      ? "border-dashed border-ink-400 bg-surface-base"
                      : "border-ink-200 bg-surface-base"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-body font-semibold text-strong">{titleFor(entry)}</h4>
                      <span className="mt-2 flex flex-wrap items-center gap-2">
                        <TagChip tag={entry.tag} />
                        {entry.draft && <DraftBadge />}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {entry.draft && (
                        <button
                          type="button"
                          onClick={() => commitDraft(entry.id)}
                          className="text-caption font-semibold text-accent-700 link-underline"
                        >
                          Accept draft
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEntry(entry)}
                        className="text-caption font-semibold text-accent-700 link-underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <ul className="mt-3 grid gap-2 border-t border-ink-200 pt-3">
                    {entry.keyResults.map((kr) => (
                      <li key={kr.id} className="text-body text-muted">
                        <span className="font-semibold text-strong">{kr.who || "Someone"}</span>{" "}
                        {kr.doesWhat || "changes a behaviour"}{" "}
                        <span className="text-strong">{kr.byHowMuch}</span>
                      </li>
                    ))}
                  </ul>

                  {entry.draftedFrom && !entry.draft && (
                    <p className="mt-3 text-caption text-faint">
                      Drafted from the {entry.draftedFrom.quarterKey} check-in.
                    </p>
                  )}
                </article>
              ),
            )}

            {creating && (
              <OkrEntryForm
                productId={product.id}
                quarter={quarter}
                record={null}
                onSaved={() => {
                  refresh();
                  closeEditor();
                }}
                onCancel={closeEditor}
                onDeleted={closeEditor}
              />
            )}

            {entries.length === 0 && !creating && (
              <div className="rounded-lg border border-dashed border-ink-300 bg-surface-base p-6 text-center">
                <p className="text-body font-semibold text-strong">
                  Nothing set for {selectedKey} yet.
                </p>
                <p className="mx-auto mt-1 max-w-md text-caption text-muted">
                  {groups.length === 0
                    ? "Start with one objective. One is usually enough — a quarter rarely has room for three."
                    : "Write this quarter's first objective, or open a past one from the history below."}
                </p>
              </div>
            )}
          </div>

          {!editorOpen && (
            <button
              type="button"
              onClick={startCreating}
              className="btn btn-primary mt-4 !py-2"
            >
              <Plus size={14} strokeWidth={2} />
              Add objective
            </button>
          )}

          <QuarterHistory groups={groups} selectedKey={selectedKey} onOpen={openEntry} />
        </>
      )}
    </ExerciseShell>
  );
}
