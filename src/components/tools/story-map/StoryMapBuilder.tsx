/**
 * User Story Map — the island root. Backbone steps across the top, release
 * slices as horizontal bands, cards placed by click-assign (no drag anywhere).
 * Persists via story-map-store; mirrors PrFaqBuilder.tsx's prop shape and
 * store wiring, and TreeBuilder.tsx's fullscreen mechanics.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HelpCircle, Map, Maximize2, Plus, X } from "lucide-react";
import { ExerciseShell } from "~/components/course/exercises/exercise-ui";
import StoryMapHelpModal from "./StoryMapHelpModal";
import StoryMapGrid from "./StoryMapGrid";
import StoryMapSwitcher from "./StoryMapSwitcher";
import StoryMapDashboard from "./StoryMapDashboard";
import {
  addCard,
  addSlice,
  addStep,
  contextKeyFor,
  createMap,
  deleteCard,
  deleteMap,
  deleteSlice,
  deleteStep,
  getMap,
  listMaps,
  moveCard,
  renameSlice,
  renameStep,
  reorderCard,
  reorderSlice,
  reorderStep,
  resolveActiveMap,
  saveMapData,
  setActiveId as setActiveIdInStore,
  toMarkdown,
  type StoryMapRecord,
  type StoryMapSource,
} from "~/utils/story-map-store";

interface StoryMapBuilderProps {
  source?: StoryMapSource;
  kicker?: string;
  title?: string;
  instructions?: string;
  showDashboard?: boolean;
}

const FULLSCREEN_PARAM = "map";
const FULLSCREEN_VALUE = "full";

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

export default function StoryMapBuilder({
  source = { type: "standalone" },
  kicker = "Free tool",
  title = "Your story map",
  instructions = "Read the backbone aloud left to right as a user's day. Hang cards under each step, then slice horizontally — each slice is one complete, walkable journey. Everything saves in your browser.",
  showDashboard = false,
}: StoryMapBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [map, setMap] = useState<StoryMapRecord | null>(null);
  const [records, setRecords] = useState<StoryMapRecord[]>([]);
  const [newStepLabel, setNewStepLabel] = useState("");
  const [newSliceLabel, setNewSliceLabel] = useState("");
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const contextKey = contextKeyFor(source);

  useEffect(() => {
    const record = resolveActiveMap(source);
    setActiveId(record.id);
    setMap(record);
    setRecords(listMaps());

    const params = new URLSearchParams(window.location.search);
    if (params.get(FULLSCREEN_PARAM) === FULLSCREEN_VALUE) setFullscreen(true);
    // Only the resolved source (via contextKey) should ever re-run this — source is a fresh object per render otherwise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextKey]);

  // Mirror fullscreen state into the URL (replaceState, not pushState — this is
  // a view mode, not a new history entry) so a refresh re-opens in place.
  const skipFirstUrlSync = useRef(true);
  useEffect(() => {
    if (skipFirstUrlSync.current) {
      skipFirstUrlSync.current = false;
      return;
    }
    const url = new URL(window.location.href);
    if (fullscreen) url.searchParams.set(FULLSCREEN_PARAM, FULLSCREEN_VALUE);
    else url.searchParams.delete(FULLSCREEN_PARAM);
    window.history.replaceState(window.history.state, "", url);
  }, [fullscreen]);

  useEffect(() => {
    if (!fullscreen) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [fullscreen]);

  /** Every mutation writes through the store, then re-reads it. */
  const refresh = (id: string | null = activeId) => {
    if (!id) return;
    setMap(getMap(id) ?? null);
    setRecords(listMaps());
  };

  const mutate = (fn: (id: string) => void) => {
    if (!activeId) return;
    fn(activeId);
    refresh(activeId);
  };

  const switchTo = (id: string) => {
    const record = getMap(id);
    if (!record) return;
    setActiveIdInStore(contextKey, id);
    setActiveId(id);
    setMap(record);
  };

  const createAndSwitch = () => {
    const record = createMap(source);
    setActiveIdInStore(contextKey, record.id);
    setActiveId(record.id);
    setMap(record);
    setRecords(listMaps());
  };

  const removeMap = (id: string) => {
    deleteMap(id);
    const remaining = listMaps();
    if (id === activeId) {
      const next = remaining[0] ?? createMap(source);
      setActiveIdInStore(contextKey, next.id);
      setActiveId(next.id);
      setMap(next);
      setRecords(listMaps());
      return;
    }
    setRecords(remaining);
  };

  const handleAddStep = () => {
    const label = newStepLabel.trim();
    if (!label) return;
    mutate((id) => addStep(id, label));
    setNewStepLabel("");
  };

  const handleAddSlice = () => {
    const label = newSliceLabel.trim();
    if (!label) return;
    mutate((id) => addSlice(id, label));
    setNewSliceLabel("");
  };

  const copyMarkdown = async () => {
    if (!map) return;
    try {
      await navigator.clipboard.writeText(toMarkdown(map));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the export block below still shows the Markdown */
    }
  };

  if (!map || !activeId) return null;

  const hasContent = map.steps.length > 0 || map.cards.length > 0;

  const titleField = (
    <div>
      <label className="text-caption font-semibold text-muted" htmlFor="story-map-title">
        What journey does this map tell?
      </label>
      <input
        id="story-map-title"
        type="text"
        value={map.title}
        onChange={(e) => mutate((id) => saveMapData(id, { title: e.target.value }))}
        placeholder="e.g. New account setup"
        className={`mt-1 ${inputClass}`}
      />
    </div>
  );

  const addControls = (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-ink-200 bg-surface-base p-4">
        <p className="text-caption font-semibold text-muted">Backbone — user steps, left to right</p>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newStepLabel}
            onChange={(e) => setNewStepLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddStep()}
            placeholder="e.g. Sign up, Set up project, Invite team…"
            aria-label="New backbone step"
            className={`${inputClass} !text-caption`}
          />
          <button type="button" onClick={handleAddStep} className="btn btn-primary shrink-0 !py-2">
            <Plus size={14} strokeWidth={2} />
            Add
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-ink-200 bg-surface-base p-4">
        <p className="text-caption font-semibold text-muted">Release slices — top band ships first</p>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newSliceLabel}
            onChange={(e) => setNewSliceLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSlice()}
            placeholder="e.g. MVP, Release 2…"
            aria-label="New release slice"
            className={`${inputClass} !text-caption`}
          />
          <button type="button" onClick={handleAddSlice} className="btn btn-primary shrink-0 !py-2">
            <Plus size={14} strokeWidth={2} />
            Add
          </button>
        </div>
      </div>
    </div>
  );

  const grid =
    map.steps.length > 0 || map.cards.length > 0 ? (
      <div className="mt-4">
        <StoryMapGrid
          steps={map.steps}
          slices={map.slices}
          cards={map.cards}
          onAddCard={(stepId, sliceId, text) => mutate((id) => addCard(id, stepId, text, sliceId))}
          onDeleteCard={(cardId) => mutate((id) => deleteCard(id, cardId))}
          onMoveCard={(cardId, stepId, sliceId) => mutate((id) => moveCard(id, cardId, stepId, sliceId))}
          onReorderCard={(cardId, direction) => mutate((id) => reorderCard(id, cardId, direction))}
          onRenameStep={(stepId, text) => mutate((id) => renameStep(id, stepId, text))}
          onReorderStep={(stepId, direction) => mutate((id) => reorderStep(id, stepId, direction))}
          onDeleteStep={(stepId) => mutate((id) => deleteStep(id, stepId))}
          onRenameSlice={(sliceId, name) => mutate((id) => renameSlice(id, sliceId, name))}
          onReorderSlice={(sliceId, direction) => mutate((id) => reorderSlice(id, sliceId, direction))}
          onDeleteSlice={(sliceId) => mutate((id) => deleteSlice(id, sliceId))}
        />
        <p className="mt-2 text-caption text-faint">
          Deleting a step or a slice never deletes its cards — they fall back to “Unassigned step”
          and the backlog band so nothing you wrote is lost.
        </p>
      </div>
    ) : (
      <p className="mt-6 text-center text-caption text-faint">
        Start with the backbone: add the first step of the user's journey above.
      </p>
    );

  const exportBlock = hasContent && (
    <div className="mt-6 border-t border-ink-200 pt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption font-semibold text-muted">Export</p>
        <button
          type="button"
          onClick={copyMarkdown}
          className="text-caption font-semibold text-accent-700 link-underline"
        >
          {copied ? "Copied ✓" : "Copy as Markdown"}
        </button>
      </div>
      <pre className="mt-2 overflow-x-auto rounded-md bg-ink-100 p-3 text-caption text-strong">
        {toMarkdown(map)}
      </pre>
    </div>
  );

  const switcher = (
    <StoryMapSwitcher
      records={records}
      activeId={activeId}
      onSelect={switchTo}
      onCreate={createAndSwitch}
      onDelete={removeMap}
    />
  );

  const helpButton = (
    <button
      type="button"
      onClick={() => setShowHelp(true)}
      className="btn btn-ghost shrink-0 !py-1.5 !text-caption"
    >
      <HelpCircle size={14} strokeWidth={2} />
      <span>How this works</span>
    </button>
  );

  const helpModal = <StoryMapHelpModal show={showHelp} onClose={() => setShowHelp(false)} />;

  if (fullscreen) {
    return (
      <>
        {createPortal(
          <div
            className="fixed inset-0 z-[100] flex flex-col bg-surface-base"
            role="dialog"
            aria-modal="true"
            aria-label="Your story map — full screen"
          >
            <div className="flex items-center justify-between gap-3 border-b border-ink-200 bg-surface-raised px-5 py-4 shadow-sm lg:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
                  <Map size={20} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="eyebrow mb-0.5">Free tool · Full screen</p>
                  <h3 className="truncate text-h4 text-strong leading-tight">
                    {map.title || title}
                  </h3>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {switcher}
                <button
                  type="button"
                  onClick={() => setFullscreen(false)}
                  className="btn btn-secondary btn-sm shrink-0"
                  aria-label="Exit full screen"
                >
                  <X size={16} strokeWidth={2.5} />
                  <span>Exit full screen</span>
                  <kbd className="rounded border border-current/30 px-1.5 py-0.5 text-[11px] font-normal opacity-70">
                    Esc
                  </kbd>
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
              {titleField}
              {addControls}
              {grid}
              {exportBlock}
            </div>
          </div>,
          document.body,
        )}
        {helpModal}
      </>
    );
  }

  return (
    <>
      <ExerciseShell
        kicker={kicker}
        title={title}
        instructions={instructions}
        headerAction={
          <div className="flex shrink-0 items-center gap-2">
            {switcher}
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="btn btn-ghost shrink-0 !py-1.5 !text-caption"
              aria-label="Expand to full screen"
            >
              <Maximize2 size={14} strokeWidth={2} />
              <span>Full screen</span>
            </button>
          </div>
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">{titleField}</div>
          {helpButton}
        </div>
        {addControls}
        {grid}
        {exportBlock}
        {showDashboard && (
          <StoryMapDashboard
            records={records}
            activeId={activeId}
            onOpen={switchTo}
            onDelete={removeMap}
          />
        )}
      </ExerciseShell>
      {helpModal}
    </>
  );
}
