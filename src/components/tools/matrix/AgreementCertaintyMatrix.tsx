/**
 * Agreement-Certainty Matrix — 2×2 grid with labeled axes.
 * Two modes: curated (scored, fixed items) and freeform (unscored, own items).
 * Uses ChoiceButton-style controls for zone selection.
 */
import { useEffect, useRef, useState } from "react";
import { HelpCircle, Trash2 } from "lucide-react";
import { ExerciseShell, ChoiceButton, Feedback } from "~/components/course/exercises/exercise-ui";
import MatrixHelpModal, { zoneApproach, zoneAxes, type MatrixZone } from "./MatrixHelpModal";
import { addItem, placeItem, removeItem, resolveActiveBoard } from "~/utils/matrix-store";

export interface MatrixItem {
  id: string;
  text: string;
  zone?: MatrixZone;
  why?: string;
  contested?: boolean;
}

interface AgreementCertaintyMatrixProps {
  mode: "curated" | "freeform";
  items?: MatrixItem[];
  kicker?: string;
  title?: string;
  instructions?: string;
}

const ZONES: MatrixZone[] = ["simple", "complicated", "complex", "chaotic"];

/** Rows are the agreement axis (high on top): Simple/Complicated share the
 *  high-agreement row, Complex/Chaotic the low-agreement row. Certainty splits
 *  the TOP ROW only — Complex and Chaotic are both low-certainty, so no strict
 *  2×2 column claim is true for the bottom row. Each cell prints its own
 *  reading from `zoneAxes()`, which reads the same table the help modal shows. */
const ZONE_GRID_ORDER: MatrixZone[][] = [
  ["simple", "complicated"],
  ["complex", "chaotic"],
];

const ZONE_LABELS: Record<MatrixZone, string> = {
  simple: "Simple",
  complicated: "Complicated",
  complex: "Complex",
  chaotic: "Chaotic",
};

const AXIS_ROW_CAPTION = "High agreement on the top row, low on the bottom.";
const AXIS_COL_CAPTION =
  "Certainty splits the top row — high on the left, low on the right. Both bottom-row zones are low-certainty; Chaotic is the extreme corner.";

/** One header, used by both modes, so the curated legend and the freeform grid
 *  cannot describe the axes differently. */
function AxisHeader() {
  return (
    <div className="pl-8">
      <p className="text-caption font-semibold text-muted">Agreement ↓ — {AXIS_ROW_CAPTION}</p>
      <p className="mt-0.5 text-caption text-faint">{AXIS_COL_CAPTION}</p>
    </div>
  );
}

/** The zone's own axis reading, sourced from the help modal's content table. */
function ZoneAxisBadges({ zone }: { zone: MatrixZone }) {
  const { agreement, certainty } = zoneAxes(zone);
  return (
    <p className="text-caption text-faint">
      Agreement: {agreement} · Certainty: {certainty}
    </p>
  );
}

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

export default function AgreementCertaintyMatrix({
  mode,
  items: curatedItems = [],
  kicker = "Free tool",
  title = "Sort your backlog",
  instructions = "Place each item on the matrix by clicking a zone. The quadrant tells you what kind of action fits.",
}: AgreementCertaintyMatrixProps) {
  const [placed, setPlaced] = useState<Record<string, MatrixZone | null>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [helpZone, setHelpZone] = useState<MatrixZone | null>(null);
  const [draftText, setDraftText] = useState("");
  const [freeformItems, setFreeformItems] = useState<
    { id: string; text: string; zone: MatrixZone | null }[]
  >([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const hydrated = useRef(false);

  // Freeform: resolve active board
  useEffect(() => {
    if (mode === "freeform") {
      const board = resolveActiveBoard();
      setActiveId(board.id);
      setFreeformItems(board.items.map((i) => ({ id: i.id, text: i.text, zone: i.zone })));
    }
    hydrated.current = true;
  }, [mode]);

  // Curated handlers
  const totalScored = curatedItems.filter((i) => !i.contested).length;
  const answeredCount = curatedItems.filter(
    (i) => !i.contested && placed[i.id] !== undefined && placed[i.id] !== null,
  ).length;
  const correctCount = curatedItems.filter(
    (i) => !i.contested && placed[i.id] === i.zone,
  ).length;

  const handleCuratedPlace = (item: MatrixItem, zone: MatrixZone) => {
    if (placed[item.id] !== undefined && placed[item.id] !== null) return;
    setPlaced((p) => ({ ...p, [item.id]: zone }));
    setRevealed((r) => ({ ...r, [item.id]: true }));
  };

  const resetCurated = () => {
    setPlaced({});
    setRevealed({});
  };

  // Freeform handlers
  const addFreeformItem = () => {
    const text = draftText.trim();
    if (!text || !activeId) return;
    addItem(activeId, text);
    const board = resolveActiveBoard();
    setFreeformItems(board.items.map((i) => ({ id: i.id, text: i.text, zone: i.zone })));
    setDraftText("");
  };

  const placeFreeformItem = (itemId: string, zone: MatrixZone) => {
    if (!activeId) return;
    placeItem(activeId, itemId, zone);
    const board = resolveActiveBoard();
    setFreeformItems(board.items.map((i) => ({ id: i.id, text: i.text, zone: i.zone })));
  };

  const deleteFreeformItem = (itemId: string) => {
    if (!activeId) return;
    removeItem(activeId, itemId);
    const board = resolveActiveBoard();
    setFreeformItems(board.items.map((i) => ({ id: i.id, text: i.text, zone: i.zone })));
  };

  // Curated mode
  const curatedContent = (
    <>
      {/* Axis-labeled 2×2 legend — the per-item choice buttons below sit in these
          same four positions, so the crossing of the two axes stays visible. */}
      <div className="mb-5 rounded-xl border border-ink-200 bg-surface-base p-3">
        <AxisHeader />
        {ZONE_GRID_ORDER.map((row, rowIdx) => (
          <div key={rowIdx} className="mt-2 flex gap-2">
            {rowIdx === 0 ? (
              <div className="flex w-8 shrink-0 items-center justify-center">
                <p className="text-caption text-faint -rotate-90 whitespace-nowrap">Agreement</p>
              </div>
            ) : (
              <div className="w-8 shrink-0" />
            )}
            {row.map((zone) => (
              <div
                key={zone}
                className="flex flex-1 items-start justify-between gap-2 rounded-lg border border-ink-200 bg-surface-raised px-3 py-2"
              >
                <div>
                  <p className="text-caption font-semibold text-strong">{ZONE_LABELS[zone]}</p>
                  <ZoneAxisBadges zone={zone} />
                </div>
                <button
                  type="button"
                  onClick={() => setHelpZone(zone)}
                  aria-label={`What does ${ZONE_LABELS[zone]} mean?`}
                  className="shrink-0 text-muted transition-colors hover:text-accent-700"
                >
                  <HelpCircle size={14} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="grid gap-3">
      {curatedItems.map((item) => {
        const itemZone = placed[item.id] ?? null;
        const isRevealed = revealed[item.id] ?? false;
        const isCorrect = itemZone === item.zone;
        const isContested = item.contested ?? false;

        return (
          <div key={item.id} className="rounded-lg border border-ink-200 bg-surface-base p-4">
            <p className="text-body text-strong">{item.text}</p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {ZONE_GRID_ORDER.flat().map((zone) => (
                <ChoiceButton
                  key={zone}
                  label={ZONE_LABELS[zone]}
                  selected={itemZone === zone}
                  disabled={itemZone !== null}
                  onClick={() => handleCuratedPlace(item, zone)}
                />
              ))}
            </div>

            {isRevealed && (
              <div className="mt-3">
                {isContested ? (
                  /* Contested items are never marked right or wrong — the source
                     post presents no single correct placement for them. */
                  <p
                    role="status"
                    className="rounded-md border border-dashed border-ink-200 bg-surface-base px-4 py-3 text-body text-strong"
                  >
                    <span className="mr-1.5 font-semibold">Contested.</span>
                    {item.why ?? "This item sparked debate — no single placement was agreed."}
                  </p>
                ) : (
                  <Feedback correct={isCorrect}>
                    {!isCorrect && item.zone && (
                      <span className="mr-1.5 font-semibold">
                        This one sat in {ZONE_LABELS[item.zone]}.
                      </span>
                    )}
                    {item.why}
                  </Feedback>
                )}
              </div>
            )}
          </div>
        );
      })}
      </div>

      {curatedItems.length > 0 && (
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink-200 pt-4">
          <p className="text-caption text-muted">
            {answeredCount} of {totalScored} scored · <span className="font-semibold text-strong">{correctCount} correct</span>
          </p>
          {answeredCount > 0 && (
            <button type="button" onClick={resetCurated} className="text-caption font-semibold text-accent-700 link-underline">
              Start over
            </button>
          )}
        </div>
      )}
    </>
  );

  // Freeform mode
  const freeformContent = (
    <>
      <div className="rounded-lg border border-ink-200 bg-surface-base p-4">
        <p className="text-caption font-semibold text-muted">Add an item</p>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFreeformItem()}
            placeholder="e.g. Database migration, new dashboard, security fix..."
            className={inputClass}
          />
          <button type="button" onClick={addFreeformItem} className="btn btn-primary shrink-0 !py-2">
            Add
          </button>
        </div>
      </div>

      {/* 2x2 grid with axis labels */}
      <div className="mt-4">
        <AxisHeader />

        {ZONE_GRID_ORDER.map((row, rowIdx) => (
          <div key={rowIdx} className="mt-2 flex gap-2">
            {rowIdx === 0 && (
              <div className="flex w-8 shrink-0 items-center justify-center">
                <p className="text-caption text-faint -rotate-90 whitespace-nowrap">Agreement</p>
              </div>
            )}
            {rowIdx === 1 && <div className="w-8 shrink-0" />}
            {row.map((zone) => {
              const items = freeformItems.filter((i) => i.zone === zone);
              return (
                <div
                  key={zone}
                  className="flex-1 rounded-xl border border-ink-200 bg-surface-raised p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-body font-semibold text-strong">{ZONE_LABELS[zone]}</p>
                      <ZoneAxisBadges zone={zone} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setHelpZone(zone)}
                      aria-label={`What does ${ZONE_LABELS[zone]} mean?`}
                      className="shrink-0 text-muted transition-colors hover:text-accent-700"
                    >
                      <HelpCircle size={14} strokeWidth={2} />
                    </button>
                  </div>
                  <div className="mt-2 grid gap-1.5">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2 rounded-md bg-surface-base p-2">
                        <p className="text-caption text-strong truncate flex-1">{item.text}</p>
                        <button
                          type="button"
                          onClick={() => deleteFreeformItem(item.id)}
                          aria-label={`Delete: ${item.text}`}
                          className="shrink-0 text-faint transition-colors hover:text-accent-700"
                        >
                          <Trash2 size={12} strokeWidth={2} />
                        </button>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <p className="text-caption text-faint text-center py-2">No items</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Every item, placed or not — pick a zone to place it, pick another to move it. */}
      {freeformItems.length > 0 && (
        <div className="mt-4 rounded-lg border border-dashed border-ink-200 bg-surface-base p-3">
          <p className="text-caption font-semibold text-muted">
            Your items — pick a zone to place one, or a different zone to move it
          </p>
          <div className="mt-2 grid gap-1.5">
            {freeformItems.map((item) => (
                <div key={item.id} className="rounded-md bg-surface-raised p-2">
                  <div className="flex items-center gap-2">
                    <p className="text-caption text-strong flex-1">{item.text}</p>
                    <div className="flex gap-1">
                      {ZONES.map((zone) => (
                        <button
                          key={zone}
                          type="button"
                          aria-pressed={item.zone === zone}
                          onClick={() => placeFreeformItem(item.id, zone)}
                          className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
                            item.zone === zone
                              ? "border-accent-600 bg-accent-50 text-accent-700"
                              : "border-ink-200 bg-surface-base text-muted hover:border-accent-600 hover:text-accent-700"
                          }`}
                        >
                          {ZONE_LABELS[zone]}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteFreeformItem(item.id)}
                      aria-label={`Delete: ${item.text}`}
                      className="shrink-0 text-faint transition-colors hover:text-accent-700"
                    >
                      <Trash2 size={12} strokeWidth={2} />
                    </button>
                  </div>
                  {item.zone && (
                    /* No answer key for a reader's own backlog — the reveal is the
                       zone's operating instruction, never a verdict. */
                    <p role="status" className="mt-1.5 text-caption text-muted">
                      <span className="font-semibold text-strong">{ZONE_LABELS[item.zone]}:</span>{" "}
                      {zoneApproach(item.zone)}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <ExerciseShell
        kicker={kicker}
        title={title}
        instructions={instructions}
      >
        {mode === "curated" ? curatedContent : freeformContent}
      </ExerciseShell>
      <MatrixHelpModal zone={helpZone} onClose={() => setHelpZone(null)} />
    </>
  );
}
