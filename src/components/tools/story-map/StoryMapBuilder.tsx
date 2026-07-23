/**
 * User Story Map — standalone builder island.
 * Backbone (activities) → tasks → stories → release slices.
 * Persists via story-map-store; freeform only (no curated mode by design).
 */
import { useEffect, useRef, useState } from "react";
import { ExerciseShell } from "~/components/course/exercises/exercise-ui";
import StoryMapHelpModal from "./StoryMapHelpModal";
import StoryMapGrid from "./StoryMapGrid";
import {
  addStep,
  addSlice,
  addCard,
  deleteStep,
  deleteCard,
  renameStep,
  resolveActiveMap,
  toMarkdown,
  type StoryMapRecord,
} from "~/utils/story-map-store";

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

export default function StoryMapBuilder({
  kicker = "Free tool",
  title = "Story map builder",
  instructions = "Walk through the user journey left to right. Fill in tasks top to bottom, then slice horizontally for releases.",
}: {
  kicker?: string;
  title?: string;
  instructions?: string;
}) {
  const [showHelp, setShowHelp] = useState(false);
  const [mapId, setMapId] = useState<string | null>(null);
  const [map, setMap] = useState<StoryMapRecord | null>(null);
  const [newStepLabel, setNewStepLabel] = useState("");
  const [newSliceLabel, setNewSliceLabel] = useState("");
  const [newCardLabels, setNewCardLabels] = useState<Record<string, string>>({});
  const hydrated = useRef(false);

  useEffect(() => {
    const m = resolveActiveMap();
    setMapId(m.id);
    setMap(m);
    hydrated.current = true;
  }, []);

  const refresh = () => {
    if (!mapId) return;
    const m = resolveActiveMap();
    setMap(m);
  };

  const handleAddStep = () => {
    const label = newStepLabel.trim();
    if (!label || !mapId) return;
    addStep(mapId, label);
    refresh();
    setNewStepLabel("");
  };

  const handleAddSlice = () => {
    const label = newSliceLabel.trim();
    if (!label || !mapId) return;
    addSlice(mapId, label);
    refresh();
    setNewSliceLabel("");
  };

  const handleAddCard = (stepId: string, sliceId: string | null) => {
    const key = `${stepId}-${sliceId ?? "backlog"}`;
    const text = (newCardLabels[key] ?? "").trim();
    if (!text || !mapId) return;
    addCard(mapId, stepId, text);
    refresh();
    setNewCardLabels((prev) => ({ ...prev, [key]: "" }));
  };

  const handleDeleteStep = (stepId: string) => {
    if (!mapId) return;
    deleteStep(mapId, stepId);
    refresh();
  };

  const handleDeleteCard = (cardId: string) => {
    if (!mapId) return;
    deleteCard(mapId, cardId);
    refresh();
  };

  const handleExport = () => {
    if (!map) return;
    const md = toMarkdown(map);
    navigator.clipboard.writeText(md).catch(() => {});
  };

  const handleRenameStep = (stepId: string, label: string) => {
    if (!mapId || !label.trim()) return;
    renameStep(mapId, stepId, label.trim());
    refresh();
  };

  const sortedSteps = map ? [...map.steps].sort((a, b) => a.order - b.order) : [];
  const sortedSlices = map ? [...map.slices].sort((a, b) => a.order - b.order) : [];
  const unslicedCards = map ? map.cards.filter((c) => c.sliceId === null) : [];

  return (
    <>
      <ExerciseShell
        kicker={kicker}
        title={title}
        instructions={instructions}
      >
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="btn btn-ghost btn-sm !text-caption"
          >
            How this works
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="btn btn-ghost btn-sm !text-caption"
          >
            Export to markdown
          </button>
        </div>

        {/* Add backbone step */}
        <div className="mt-4 rounded-lg border border-ink-200 bg-surface-base p-4">
          <p className="text-caption font-semibold text-muted">Backbone — user activities</p>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newStepLabel}
              onChange={(e) => setNewStepLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddStep()}
              placeholder="e.g. Find a product, Set up account, Check out..."
              className={inputClass}
            />
            <button type="button" onClick={handleAddStep} className="btn btn-primary shrink-0 !py-2">
              Add
            </button>
          </div>
        </div>

        {/* Grid */}
        {map && sortedSteps.length > 0 && (
          <div className="mt-4">
            <StoryMapGrid
              activities={sortedSteps.map((step) => ({
                id: step.id,
                label: step.text,
                tasks: [], // tasks are just cards in the same step
              }))}
              releases={sortedSlices.map((s) => s.name)}
              onDeleteStory={handleDeleteCard}
              onDeleteTask={(_activityId, _taskId) => {}} // No-op since tasks are cards
              onDeleteActivity={handleDeleteStep}
            />
          </div>
        )}

        {/* Add release slice */}
        <div className="mt-4 rounded-lg border border-ink-200 bg-surface-base p-4">
          <p className="text-caption font-semibold text-muted">Release slices</p>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newSliceLabel}
              onChange={(e) => setNewSliceLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSlice()}
              placeholder="e.g. MVP, v1.1, v2.0..."
              className={inputClass}
            />
            <button type="button" onClick={handleAddSlice} className="btn btn-primary shrink-0 !py-2">
              Add
            </button>
          </div>
        </div>

        {/* Cards per step/slice */}
        {map && sortedSteps.length > 0 && (
          <div className="mt-4 grid gap-3">
            {sortedSteps.map((step) => (
              <div key={step.id} className="rounded-lg border border-ink-200 bg-surface-base p-4">
                <p className="text-caption font-semibold text-muted">{step.text}</p>

                {/* Unsliced cards */}
                <div className="mt-2">
                  <p className="text-[11px] text-faint font-semibold">Backlog</p>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={newCardLabels[`${step.id}-backlog`] ?? ""}
                      onChange={(e) =>
                        setNewCardLabels((prev) => ({ ...prev, [`${step.id}-backlog`]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleAddCard(step.id, null)}
                      placeholder="User story..."
                      className={`${inputClass} !text-caption flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCard(step.id, null)}
                      className="btn btn-primary btn-sm shrink-0 !py-1"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Per-slice cards */}
                {sortedSlices.map((slice) => (
                  <div key={slice.id} className="mt-2">
                    <p className="text-[11px] text-faint font-semibold">{slice.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={newCardLabels[`${step.id}-${slice.id}`] ?? ""}
                        onChange={(e) =>
                          setNewCardLabels((prev) => ({ ...prev, [`${step.id}-${slice.id}`]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === "Enter" && handleAddCard(step.id, slice.id)}
                        placeholder="User story..."
                        className={`${inputClass} !text-caption flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCard(step.id, slice.id)}
                        className="btn btn-primary btn-sm shrink-0 !py-1"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {map && sortedSteps.length === 0 && (
          <p className="mt-6 text-center text-caption text-faint">
            Start by adding a user activity above.
          </p>
        )}
      </ExerciseShell>
      <StoryMapHelpModal onClose={() => setShowHelp(false)} />
    </>
  );
}
