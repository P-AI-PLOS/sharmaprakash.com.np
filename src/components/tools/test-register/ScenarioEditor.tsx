/**
 * Create/edit form for one test scenario.
 *
 * The pickers are the point: a scenario has to name what it verifies, so the
 * save is blocked — with an explanation, not a disabled button and silence —
 * until at least one story or acceptance criterion is ticked. Picking snapshots
 * the source text (contract D5); that snapshot is what later drift is measured
 * against.
 *
 * `stale` is absent from the status select by design: it is derived, never
 * chosen.
 */
import { useMemo, useState } from "react";
import { FileCode2, Info, Layers, ListChecks } from "lucide-react";
import type {
  AutomationStatus,
  LinkedCriterion,
  LinkedStory,
  ScenarioDraft,
  TestScenarioRecord,
} from "~/utils/test-register-store";
import { STATUS_LABELS } from "~/utils/test-register-store";
import type { SourceIndex } from "~/utils/test-register-store";

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

const STATUS_ORDER: AutomationStatus[] = ["not-automated", "ai-drafted", "human-reviewed"];

/** Stable key for a criterion selection. */
const critKey = (specId: string, criterionId: string) => `${specId}::${criterionId}`;

export default function ScenarioEditor({
  index,
  editing,
  onSave,
  onCancel,
}: {
  index: SourceIndex;
  /** `null` when creating. */
  editing: TestScenarioRecord | null;
  onSave: (draft: ScenarioDraft) => void;
  onCancel: () => void;
}) {
  const [description, setDescription] = useState(editing?.description ?? "");
  const [specPath, setSpecPath] = useState(editing?.specPath ?? "");
  const [status, setStatus] = useState<AutomationStatus>(editing?.status ?? "not-automated");
  const [storyIds, setStoryIds] = useState<string[]>(
    () => editing?.stories.map((link) => link.ref.storyId) ?? [],
  );
  const [criterionKeys, setCriterionKeys] = useState<string[]>(
    () => editing?.criteria.map((link) => critKey(link.ref.specId, link.ref.criterionId)) ?? [],
  );
  const [error, setError] = useState("");

  /** Specs that actually have something to link, plus their sliced stories. */
  const groups = useMemo(
    () =>
      index.specs.map((spec) => ({
        spec,
        stories: index.stories.filter((story) => story.specId === spec.id),
      })),
    [index],
  );

  /** Stories from sessions that were never linked to a spec (contract D1: specId ""). */
  const unlinkedStories = useMemo(
    () => index.stories.filter((story) => story.specId === "" || !index.specById.has(story.specId)),
    [index],
  );

  const hasSources = index.specs.length > 0 || index.stories.length > 0;

  const toggleStory = (id: string) =>
    setStoryIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const toggleCriterion = (key: string) =>
    setCriterionKeys((keys) => (keys.includes(key) ? keys.filter((x) => x !== key) : [...keys, key]));

  const submit = () => {
    if (storyIds.length + criterionKeys.length < 1) {
      setError(
        "A scenario has to verify something. Tick at least one acceptance criterion or sliced story before saving.",
      );
      return;
    }
    if (!description.trim()) {
      setError("Give the scenario a description — what does this test actually assert?");
      return;
    }

    const stories: LinkedStory[] = storyIds.flatMap((id) => {
      const story = index.storyById.get(id);
      if (!story) return [];
      return [
        {
          ref: { storyId: story.id, specId: story.specId },
          storyText: story.title,
          specTitle: story.specTitle || index.specById.get(story.specId)?.title || "",
        },
      ];
    });

    const criteria: LinkedCriterion[] = criterionKeys.flatMap((key) => {
      const [specId, criterionId] = key.split("::");
      const spec = index.specById.get(specId ?? "");
      const criterion = spec?.criteria.find((c) => c.id === criterionId);
      if (!spec || !criterion) return [];
      return [
        {
          ref: { specId: spec.id, criterionId: criterion.id },
          criterionText: criterion.text,
          specTitle: spec.title,
        },
      ];
    });

    if (stories.length + criteria.length < 1) {
      setError("Those sources are no longer available — pick something that still exists.");
      return;
    }

    setError("");
    onSave({ description: description.trim(), stories, criteria, status, specPath: specPath.trim() });
  };

  return (
    <div className="rounded-lg border border-accent-600 bg-surface-base p-4">
      <p className="text-caption font-semibold text-muted">
        {editing ? "Edit scenario" : "New scenario"}
      </p>

      <label htmlFor="testreg-description" className="mt-3 block text-caption text-faint">
        What does this test verify?
      </label>
      <input
        id="testreg-description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g. Applying an expired discount code shows an error and leaves the total unchanged"
        className={`mt-1 ${inputClass}`}
      />

      {/* Sources */}
      <div className="mt-4">
        <p className="text-caption font-semibold text-muted">What it covers</p>

        {!hasSources ? (
          <div className="mt-2 rounded-md border border-ink-200 bg-surface-raised p-3">
            <p className="flex items-start gap-2 text-caption text-muted">
              <Info size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-accent-700" />
              <span>
                Nothing to link yet. Write acceptance criteria in the{" "}
                <a href="/tools/spec-builder/" className="link-underline text-accent-700">
                  Spec Builder
                </a>
                , or cut stories in the{" "}
                <a href="/tools/vertical-slicer/" className="link-underline text-accent-700">
                  Vertical Slicer
                </a>
                , then come back — a scenario has to be anchored to one of them.
              </span>
            </p>
          </div>
        ) : (
          <div className="mt-2 grid gap-3">
            {groups.map(({ spec, stories }) => (
              <div key={spec.id} className="rounded-md border border-ink-200 bg-surface-raised p-3">
                <p className="text-body font-semibold text-strong">{spec.title}</p>

                {spec.criteria.length > 0 && (
                  <>
                    <p className="mt-2 flex items-center gap-1 text-caption text-faint">
                      <ListChecks size={13} strokeWidth={2} /> Acceptance criteria
                    </p>
                    <ul className="mt-1 grid gap-1">
                      {spec.criteria.map((criterion) => {
                        const key = critKey(spec.id, criterion.id);
                        return (
                          <li key={key}>
                            <label className="flex cursor-pointer items-start gap-2 text-caption text-muted">
                              <input
                                type="checkbox"
                                checked={criterionKeys.includes(key)}
                                onChange={() => toggleCriterion(key)}
                                className="mt-0.5 shrink-0 accent-accent-600"
                              />
                              <span>{criterion.text || <em className="text-faint">Empty criterion</em>}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}

                {stories.length > 0 && (
                  <>
                    <p className="mt-2 flex items-center gap-1 text-caption text-faint">
                      <Layers size={13} strokeWidth={2} /> Sliced stories
                    </p>
                    <ul className="mt-1 grid gap-1">
                      {stories.map((story) => (
                        <li key={story.id}>
                          <label className="flex cursor-pointer items-start gap-2 text-caption text-muted">
                            <input
                              type="checkbox"
                              checked={storyIds.includes(story.id)}
                              onChange={() => toggleStory(story.id)}
                              className="mt-0.5 shrink-0 accent-accent-600"
                            />
                            <span>{story.title || <em className="text-faint">Untitled story</em>}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {spec.criteria.length === 0 && stories.length === 0 && (
                  <p className="mt-2 text-caption text-faint">
                    No criteria or slices under this spec yet.
                  </p>
                )}
              </div>
            ))}

            {unlinkedStories.length > 0 && (
              <div className="rounded-md border border-ink-200 bg-surface-raised p-3">
                <p className="text-body font-semibold text-strong">Slices without a spec</p>
                <ul className="mt-1 grid gap-1">
                  {unlinkedStories.map((story) => (
                    <li key={story.id}>
                      <label className="flex cursor-pointer items-start gap-2 text-caption text-muted">
                        <input
                          type="checkbox"
                          checked={storyIds.includes(story.id)}
                          onChange={() => toggleStory(story.id)}
                          className="mt-0.5 shrink-0 accent-accent-600"
                        />
                        <span>{story.title || <em className="text-faint">Untitled story</em>}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status + spec path */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="testreg-status" className="block text-caption text-faint">
            Automation status
          </label>
          <select
            id="testreg-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as AutomationStatus)}
            className={`mt-1 ${inputClass}`}
          >
            {STATUS_ORDER.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-caption text-faint">
            Stale isn't a choice — it's derived when a linked spec moves.
          </p>
        </div>
        <div>
          <label htmlFor="testreg-specpath" className="block text-caption text-faint">
            Spec file path (optional)
          </label>
          <div className="relative mt-1">
            <FileCode2
              size={15}
              strokeWidth={2}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              id="testreg-specpath"
              type="text"
              value={specPath}
              onChange={(e) => setSpecPath(e.target.value)}
              placeholder="e2e/orders/discount-code.spec.ts"
              className={`${inputClass} pl-9`}
            />
          </div>
          <p className="mt-1 text-caption text-faint">Never checked against disk — it's a pointer, not a promise.</p>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-md border border-accent-600 bg-accent-50 px-3 py-2 text-caption text-accent-800"
        >
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button type="button" onClick={submit} className="btn btn-primary !py-2">
          {editing ? "Save scenario" : "Add scenario"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-caption font-semibold text-muted transition-colors hover:text-accent-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
