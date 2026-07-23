/**
 * Root island for the Backlog Prioritizer. Resolves the active product, holds a
 * board per (product, quarter), and wires the board → decision queue → priority
 * list around `backlogStore`. Everything is localStorage-only; all store access
 * happens after mount so the island hydrates cleanly.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";
import { ExerciseShell } from "~/components/course/exercises/exercise-ui";
import {
  currentQuarter,
  nextQuarter,
  quarterKey,
  resolveActiveProduct,
  uid,
  type ProductRecord,
  type QuarterRef,
} from "~/utils/pipeline-store";
import {
  boardToMarkdown,
  resolveBoard,
  saveItems,
  zoneFor,
  type BacklogItem,
  type BacklogRecord,
  type Disposition,
} from "~/utils/backlog-store";
import { hasSlicerData, listSlicerStories, type SlicerStory } from "./slicer-source";
import { listKeyResults, type KrOption } from "./okr-source";
import type { EnrichedItem } from "./types";
import MatrixBoard from "./MatrixBoard";
import StoryPicker from "./StoryPicker";
import DecisionQueue from "./DecisionQueue";
import PriorityList from "./PriorityList";
import MatrixHelpModal from "./MatrixHelpModal";

const prevQuarter = (q: QuarterRef): QuarterRef =>
  q.quarter === 1
    ? { year: q.year - 1, quarter: 4 }
    : { year: q.year, quarter: (q.quarter - 1) as QuarterRef["quarter"] };

export default function BacklogPrioritizer() {
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [quarter, setQuarter] = useState<QuarterRef>(() => currentQuarter());
  const [board, setBoard] = useState<BacklogRecord | null>(null);
  const [allStories, setAllStories] = useState<SlicerStory[]>([]);
  const [krOptions, setKrOptions] = useState<KrOption[]>([]);
  const [krFilter, setKrFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const hydrated = useRef(false);

  const openBoard = useCallback((productId: string, q: QuarterRef) => {
    setBoard(resolveBoard(productId, q));
    setAllStories(listSlicerStories(productId));
    setKrOptions(listKeyResults(productId, q));
    setSelectedId(null);
    setKrFilter(null);
  }, []);

  useEffect(() => {
    const resolved = resolveActiveProduct();
    const q = currentQuarter();
    setProduct(resolved);
    setQuarter(q);
    openBoard(resolved.id, q);
    hydrated.current = true;
  }, [openBoard]);

  const changeQuarter = (q: QuarterRef) => {
    if (!product) return;
    setQuarter(q);
    openBoard(product.id, q);
  };

  const mutate = (updater: (items: BacklogItem[]) => BacklogItem[]) => {
    setBoard((current) => {
      if (!current) return current;
      const items = updater(current.items);
      saveItems(current.id, items);
      return { ...current, items, updatedAt: Date.now() };
    });
  };

  const addStory = (story: SlicerStory) => {
    mutate((items) => [
      ...items,
      {
        id: uid("item"),
        story: { storyId: story.storyId, specId: story.specId },
        storyTitle: story.title,
        agreement: 50,
        certainty: 50,
        krRefs: [],
        krSnapshots: {},
      },
    ]);
  };

  const moveItem = (id: string, agreement: number, certainty: number) => {
    mutate((items) => items.map((item) => (item.id === id ? { ...item, agreement, certainty } : item)));
  };

  const disposeItem = (id: string, disposition: Disposition, note: string) => {
    mutate((items) =>
      items.map((item) =>
        item.id === id ? { ...item, disposition, note: note || undefined } : item,
      ),
    );
  };

  const reopenItem = (id: string) => {
    mutate((items) =>
      items.map((item) =>
        item.id === id ? { ...item, disposition: undefined, note: undefined } : item,
      ),
    );
  };

  const removeItem = (id: string) => {
    mutate((items) => items.filter((item) => item.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  };

  const linkKr = (itemId: string, option: KrOption) => {
    mutate((items) =>
      items.map((item) => {
        if (item.id !== itemId) return item;
        if (item.krRefs.some((ref) => ref.keyResultId === option.ref.keyResultId)) return item;
        return {
          ...item,
          krRefs: [...item.krRefs, option.ref],
          krSnapshots: { ...item.krSnapshots, [option.ref.keyResultId]: option.label },
        };
      }),
    );
  };

  const unlinkKr = (itemId: string, keyResultId: string) => {
    mutate((items) =>
      items.map((item) => {
        if (item.id !== itemId) return item;
        const krSnapshots = { ...item.krSnapshots };
        delete krSnapshots[keyResultId];
        return {
          ...item,
          krRefs: item.krRefs.filter((ref) => ref.keyResultId !== keyResultId),
          krSnapshots,
        };
      }),
    );
  };

  if (!product || !board) {
    return (
      <ExerciseShell kicker="Free tool" title="Backlog Prioritizer" instructions="Loading your board…">
        <p className="text-caption text-faint">Preparing the Agreement / Certainty matrix…</p>
      </ExerciseShell>
    );
  }

  const slicerPresent = hasSlicerData();
  const storyIds = new Set(allStories.map((story) => story.storyId));
  const plottedIds = new Set(board.items.map((item) => item.story.storyId));
  const unplotted = allStories.filter((story) => !plottedIds.has(story.storyId));

  const enrichAll: EnrichedItem[] = board.items.map((item) => ({
    item,
    zone: zoneFor(item.agreement, item.certainty),
    offStrategy: item.krRefs.length === 0,
    drift: slicerPresent && !storyIds.has(item.story.storyId),
  }));
  const enriched = krFilter
    ? enrichAll.filter((entry) => entry.item.krRefs.some((ref) => ref.keyResultId === krFilter))
    : enrichAll;

  const markdown = boardToMarkdown(board);

  return (
    <>
      <ExerciseShell
        kicker="Free tool"
        title="Backlog Prioritizer"
        instructions="Plot each sliced story by how much stakeholders agree on it and how certain you are it'll work. The zone falls out of the placement — and the low-agreement, low-certainty ones don't get silently ranked; they land in a decision queue for an explicit kill, probe, or defer."
        headerAction={
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="inline-flex shrink-0 items-center gap-1 text-caption text-muted transition-colors hover:text-accent-700"
          >
            <HelpCircle size={14} strokeWidth={2} />
            Zones
          </button>
        }
      >
        {/* Quarter switcher + KR filter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-caption font-semibold text-muted">Quarter</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeQuarter(prevQuarter(quarter))}
                aria-label="Previous quarter"
                className="rounded-md border border-ink-200 bg-surface-base px-2 py-1 text-caption font-semibold text-muted transition-colors hover:border-accent-600 hover:text-accent-700"
              >
                ←
              </button>
              <span className="min-w-[4.5rem] text-center text-caption font-semibold text-strong">
                {quarterKey(quarter)}
              </span>
              <button
                type="button"
                onClick={() => changeQuarter(nextQuarter(quarter))}
                aria-label="Next quarter"
                className="rounded-md border border-ink-200 bg-surface-base px-2 py-1 text-caption font-semibold text-muted transition-colors hover:border-accent-600 hover:text-accent-700"
              >
                →
              </button>
            </div>
          </div>

          {krOptions.length > 0 && (
            <label className="flex items-center gap-2 text-caption text-muted">
              Filter by key result
              <select
                value={krFilter ?? ""}
                onChange={(e) => setKrFilter(e.target.value || null)}
                className="max-w-[16rem] rounded-md border border-ink-200 bg-surface-base px-2 py-1 text-caption text-strong focus:border-accent-600 focus:outline-none"
              >
                <option value="">All items</option>
                {krOptions.map((option) => (
                  <option key={option.ref.keyResultId} value={option.ref.keyResultId}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="mt-5">
          <MatrixBoard
            items={enriched}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCommit={moveItem}
          />
        </div>

        <div className="mt-5">
          <StoryPicker stories={unplotted} hasAnyStories={allStories.length > 0} onAdd={addStory} />
        </div>

        <div className="mt-8 border-t border-ink-200 pt-6">
          <DecisionQueue items={enriched} onDispose={disposeItem} onReopen={reopenItem} onRemove={removeItem} />
        </div>

        <div className="mt-8 border-t border-ink-200 pt-6">
          <PriorityList
            items={enriched}
            krOptions={krOptions}
            markdown={markdown}
            onLink={linkKr}
            onUnlink={unlinkKr}
          />
        </div>
      </ExerciseShell>

      <MatrixHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
