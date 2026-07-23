/**
 * Agreement-Certainty Matrix — 2×2 grid with labeled axes.
 * Two modes: curated (scored, fixed items) and freeform (unscored, own items).
 * Uses ChoiceButton-style controls for zone selection.
 */
import { useEffect, useRef, useState } from "react";
import { HelpCircle, Trash2 } from "lucide-react";
import { ExerciseShell, ChoiceButton, Feedback } from "~/components/course/exercises/exercise-ui";
import MatrixHelpModal, { type MatrixZone } from "./MatrixHelpModal";
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

const ZONE_GRID_ORDER: MatrixZone[][] = [
  ["complex", "chaotic"],
  ["simple", "complicated"],
];

const ZONE_LABELS: Record<MatrixZone, string> = {
  simple: "Simple",
  complicated: "Complicated",
  complex: "Complex",
  chaotic: "Chaotic",
};

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
      {curatedItems.map((item) => {
        const itemZone = placed[item.id] ?? null;
        const isRevealed = revealed[item.id] ?? false;
        const isCorrect = itemZone === item.zone;
        const isContested = item.contested ?? false;

        return (
          <div key={item.id} className="rounded-lg border border-ink-200 bg-surface-base p-4">
            <p className="text-body text-strong">{item.text}</p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {ZONES.map((zone) => (
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
                  <Feedback correct={false}>
                    <span className="font-semibold">Contested.</span> {item.why ?? "Multiple valid placements — this item sparked debate."}
                  </Feedback>
                ) : (
                  <Feedback correct={isCorrect}>
                    {item.why}
                  </Feedback>
                )}
              </div>
            )}
          </div>
        );
      })}

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
        <div className="flex items-center gap-2">
          <p className="text-caption font-semibold text-muted">Certainty →</p>
          <p className="text-caption text-faint">High certainty on the left, low on the right</p>
        </div>

        {ZONE_GRID_ORDER.map((row, rowIdx) => (
          <div key={rowIdx} className="mt-2 flex gap-2">
            {rowIdx === 0 && (
              <div className="flex w-8 shrink-0 items-center justify-center">
                <p className="text-caption text-faint -rotate-90 whitespace-nowrap">Agreement ↓</p>
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
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-body font-semibold text-strong">{ZONE_LABELS[zone]}</p>
                    <button
                      type="button"
                      onClick={() => setHelpZone(zone)}
                      className="text-muted transition-colors hover:text-accent-700"
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

      {/* Unplaced items */}
      {freeformItems.filter((i) => i.zone === null).length > 0 && (
        <div className="mt-4 rounded-lg border border-dashed border-ink-200 bg-surface-base p-3">
          <p className="text-caption font-semibold text-muted">Unplaced items — click a zone above to place</p>
          <div className="mt-2 grid gap-1.5">
            {freeformItems
              .filter((i) => i.zone === null)
              .map((item) => (
                <div key={item.id} className="flex items-center gap-2 rounded-md bg-surface-raised p-2">
                  <p className="text-caption text-strong flex-1">{item.text}</p>
                  <div className="flex gap-1">
                    {ZONES.map((zone) => (
                      <button
                        key={zone}
                        type="button"
                        onClick={() => placeFreeformItem(item.id, zone)}
                        className="rounded-md border border-ink-200 bg-surface-base px-2 py-1 text-[11px] font-semibold text-muted transition-colors hover:border-accent-600 hover:text-accent-700"
                      >
                        {ZONE_LABELS[zone]}
                      </button>
                    ))}
                  </div>
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
