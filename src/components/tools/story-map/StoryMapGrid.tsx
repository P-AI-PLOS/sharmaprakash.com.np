/**
 * The story map itself: backbone steps as columns, release slices as rows,
 * plus a trailing "Backlog (unsliced)" band. Plain CSS grid in a horizontally
 * scrolling container — no canvas library, no drag-and-drop (design D1/D4).
 *
 * Purely presentational: the builder owns the store, this owns the layout.
 * `readOnly` drops every control, which is what the post embed renders.
 */
import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Plus, Trash2 } from "lucide-react";
import {
  BACKLOG_LABEL,
  UNASSIGNED_STEP_LABEL,
  type BackboneStep,
  type ReleaseSlice,
  type StoryCard,
} from "~/utils/story-map-store";

/** Sentinel column id for cards whose backbone step was deleted. */
const UNASSIGNED_STEP_ID = "__unassigned__";

export interface StoryMapGridProps {
  steps: BackboneStep[];
  slices: ReleaseSlice[];
  cards: StoryCard[];
  /** Omits every editing control while keeping the same layout and labels. */
  readOnly?: boolean;
  onAddCard?: (stepId: string, sliceId: string | null, text: string) => void;
  onDeleteCard?: (cardId: string) => void;
  onMoveCard?: (cardId: string, stepId: string, sliceId: string | null) => void;
  onReorderCard?: (cardId: string, direction: -1 | 1) => void;
  onRenameStep?: (stepId: string, text: string) => void;
  onReorderStep?: (stepId: string, direction: -1 | 1) => void;
  onDeleteStep?: (stepId: string) => void;
  onRenameSlice?: (sliceId: string, name: string) => void;
  onReorderSlice?: (sliceId: string, direction: -1 | 1) => void;
  onDeleteSlice?: (sliceId: string) => void;
}

const iconButtonClass =
  "shrink-0 rounded p-0.5 text-faint transition-colors hover:text-accent-700 disabled:cursor-default disabled:opacity-30 disabled:hover:text-faint";

const headerInputClass =
  "w-full min-w-0 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-caption font-semibold text-accent-700 focus:border-accent-600 focus:bg-surface-base focus:outline-none";

const selectClass =
  "min-w-0 flex-1 rounded border border-ink-200 bg-surface-base px-1 py-0.5 text-[11px] text-muted focus:border-accent-600 focus:outline-none";

export default function StoryMapGrid({
  steps,
  slices,
  cards,
  readOnly = false,
  onAddCard,
  onDeleteCard,
  onMoveCard,
  onReorderCard,
  onRenameStep,
  onReorderStep,
  onDeleteStep,
  onRenameSlice,
  onReorderSlice,
  onDeleteSlice,
}: StoryMapGridProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  const sortedSlices = [...slices].sort((a, b) => a.order - b.order);
  const stepIds = new Set(sortedSteps.map((s) => s.id));
  const sliceIds = new Set(sortedSlices.map((s) => s.id));

  // A deleted step or slice never takes its cards with it — the orphans get a
  // visible home instead (spec: "Deleting a step or slice never deletes cards").
  const hasOrphanStepCards = cards.some((c) => !stepIds.has(c.stepId));
  const columns = [
    ...sortedSteps.map((step) => ({ id: step.id, label: step.text || "Untitled step", step })),
    ...(hasOrphanStepCards
      ? [{ id: UNASSIGNED_STEP_ID, label: UNASSIGNED_STEP_LABEL, step: null }]
      : []),
  ];
  const bands = [
    ...sortedSlices.map((slice) => ({ id: slice.id, label: slice.name || "Untitled slice", slice })),
    { id: null as string | null, label: BACKLOG_LABEL, slice: null },
  ];

  const cardsIn = (columnId: string, bandId: string | null): StoryCard[] =>
    cards
      .filter((card) => {
        const inColumn =
          columnId === UNASSIGNED_STEP_ID ? !stepIds.has(card.stepId) : card.stepId === columnId;
        const inBand =
          bandId === null
            ? card.sliceId === null || !sliceIds.has(card.sliceId)
            : card.sliceId === bandId;
        return inColumn && inBand;
      })
      .sort((a, b) => a.order - b.order);

  const submitDraft = (columnId: string, bandId: string | null) => {
    const key = `${columnId}::${bandId ?? "backlog"}`;
    const text = (drafts[key] ?? "").trim();
    if (!text || !onAddCard || columnId === UNASSIGNED_STEP_ID) return;
    onAddCard(columnId, bandId, text);
    setDrafts((prev) => ({ ...prev, [key]: "" }));
  };

  if (columns.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-ink-200 bg-surface-base">
      <div
        className="grid min-w-max"
        style={{
          gridTemplateColumns: `minmax(7rem, 9rem) repeat(${columns.length}, minmax(12rem, 1fr))`,
        }}
      >
        {/* Backbone header */}
        <div className="border-b border-r border-ink-200 bg-surface-raised px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">Backbone →</p>
        </div>
        {columns.map((column, index) => (
          <div
            key={column.id}
            className={`border-b border-ink-200 bg-accent-50 px-2 py-2 ${
              index === columns.length - 1 ? "" : "border-r"
            }`}
          >
            <div className="flex items-center gap-1">
              {readOnly || !column.step ? (
                <p className="min-w-0 flex-1 truncate px-1 text-caption font-semibold text-accent-700">
                  {column.label}
                </p>
              ) : (
                <input
                  type="text"
                  value={column.step.text}
                  onChange={(e) => onRenameStep?.(column.id, e.target.value)}
                  aria-label={`Rename backbone step: ${column.label}`}
                  className={headerInputClass}
                />
              )}
              {!readOnly && column.step && (
                <>
                  <button
                    type="button"
                    onClick={() => onReorderStep?.(column.id, -1)}
                    disabled={index === 0}
                    aria-label={`Move step earlier: ${column.label}`}
                    className={iconButtonClass}
                  >
                    <ArrowLeft size={13} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onReorderStep?.(column.id, 1)}
                    disabled={index === sortedSteps.length - 1}
                    aria-label={`Move step later: ${column.label}`}
                    className={iconButtonClass}
                  >
                    <ArrowRight size={13} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteStep?.(column.id)}
                    aria-label={`Delete step: ${column.label} (its cards are kept)`}
                    className={iconButtonClass}
                  >
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* One row per slice, then the trailing backlog band */}
        {bands.map((band, bandIndex) => (
          <div key={band.id ?? "backlog"} className="contents">
            <div
              className={`border-r border-ink-200 bg-surface-raised px-3 py-3 ${
                bandIndex === bands.length - 1 ? "" : "border-b"
              }`}
            >
              <div className="flex items-start gap-1">
                {readOnly || !band.slice ? (
                  <p className="min-w-0 flex-1 text-caption font-semibold text-muted">{band.label}</p>
                ) : (
                  <input
                    type="text"
                    value={band.slice.name}
                    onChange={(e) => onRenameSlice?.(band.slice!.id, e.target.value)}
                    aria-label={`Rename release slice: ${band.label}`}
                    className={`${headerInputClass} !text-muted`}
                  />
                )}
              </div>
              {!readOnly && band.slice && (
                <div className="mt-1 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onReorderSlice?.(band.slice!.id, -1)}
                    disabled={bandIndex === 0}
                    aria-label={`Move slice earlier: ${band.label}`}
                    className={iconButtonClass}
                  >
                    <ArrowUp size={13} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onReorderSlice?.(band.slice!.id, 1)}
                    disabled={bandIndex === sortedSlices.length - 1}
                    aria-label={`Move slice later: ${band.label}`}
                    className={iconButtonClass}
                  >
                    <ArrowDown size={13} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSlice?.(band.slice!.id)}
                    aria-label={`Delete slice: ${band.label} (its cards are kept)`}
                    className={iconButtonClass}
                  >
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </div>
              )}
              {band.slice === null && (
                <p className="mt-1 text-[11px] text-faint">Not in a release yet</p>
              )}
            </div>

            {columns.map((column, columnIndex) => {
              const cellCards = cardsIn(column.id, band.id);
              const draftKey = `${column.id}::${band.id ?? "backlog"}`;
              const canAdd = !readOnly && column.id !== UNASSIGNED_STEP_ID;
              return (
                <div
                  key={`${column.id}-${band.id ?? "backlog"}`}
                  className={`border-ink-200 px-2 py-2 ${
                    columnIndex === columns.length - 1 ? "" : "border-r"
                  } ${bandIndex === bands.length - 1 ? "" : "border-b"}`}
                >
                  <ul className="grid gap-1.5">
                    {cellCards.map((card, cardIndex) => (
                      <li
                        key={card.id}
                        className="rounded-md border border-ink-200 bg-surface-raised px-2 py-1.5"
                      >
                        <p className="text-caption leading-snug text-strong">{card.text}</p>
                        {!readOnly && (
                          <>
                            <div className="mt-1.5 flex items-center gap-1">
                              <label className="sr-only" htmlFor={`step-${card.id}`}>
                                Backbone step for {card.text}
                              </label>
                              <select
                                id={`step-${card.id}`}
                                value={stepIds.has(card.stepId) ? card.stepId : ""}
                                onChange={(e) =>
                                  e.target.value && onMoveCard?.(card.id, e.target.value, card.sliceId)
                                }
                                className={selectClass}
                              >
                                {!stepIds.has(card.stepId) && <option value="">Unassigned step</option>}
                                {sortedSteps.map((step) => (
                                  <option key={step.id} value={step.id}>
                                    {step.text || "Untitled step"}
                                  </option>
                                ))}
                              </select>
                              <label className="sr-only" htmlFor={`slice-${card.id}`}>
                                Release slice for {card.text}
                              </label>
                              <select
                                id={`slice-${card.id}`}
                                value={
                                  card.sliceId && sliceIds.has(card.sliceId) ? card.sliceId : "backlog"
                                }
                                onChange={(e) =>
                                  onMoveCard?.(
                                    card.id,
                                    card.stepId,
                                    e.target.value === "backlog" ? null : e.target.value,
                                  )
                                }
                                className={selectClass}
                              >
                                <option value="backlog">{BACKLOG_LABEL}</option>
                                {sortedSlices.map((slice) => (
                                  <option key={slice.id} value={slice.id}>
                                    {slice.name || "Untitled slice"}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="mt-1 flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => onReorderCard?.(card.id, -1)}
                                disabled={cardIndex === 0}
                                aria-label={`Move card up: ${card.text}`}
                                className={iconButtonClass}
                              >
                                <ArrowUp size={13} strokeWidth={2} />
                              </button>
                              <button
                                type="button"
                                onClick={() => onReorderCard?.(card.id, 1)}
                                disabled={cardIndex === cellCards.length - 1}
                                aria-label={`Move card down: ${card.text}`}
                                className={iconButtonClass}
                              >
                                <ArrowDown size={13} strokeWidth={2} />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteCard?.(card.id)}
                                aria-label={`Delete card: ${card.text}`}
                                className={iconButtonClass}
                              >
                                <Trash2 size={13} strokeWidth={2} />
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>

                  {canAdd && (
                    <div className="mt-1.5 flex items-center gap-1">
                      <input
                        type="text"
                        value={drafts[draftKey] ?? ""}
                        onChange={(e) =>
                          setDrafts((prev) => ({ ...prev, [draftKey]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === "Enter" && submitDraft(column.id, band.id)}
                        placeholder="Add a card…"
                        aria-label={`Add a card under ${column.label} in ${band.label}`}
                        className="w-full min-w-0 rounded border border-ink-200 bg-surface-base px-2 py-1 text-[11px] text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => submitDraft(column.id, band.id)}
                        aria-label={`Add card under ${column.label} in ${band.label}`}
                        className={iconButtonClass}
                      >
                        <Plus size={14} strokeWidth={2} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
