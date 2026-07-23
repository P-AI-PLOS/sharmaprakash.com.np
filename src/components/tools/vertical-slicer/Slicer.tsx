/**
 * Vertical Slicer — turn one big feature into independently-shippable story
 * slices. Three steps: describe the feature (or link a spec) → pick a slicing
 * pattern → write slices and check each for shippability. Persists to
 * localStorage via slicer-store; nothing leaves the browser.
 *
 * The shippability checklist is the whole point: a slice that passes all three
 * checks is a vertical slice; any failure flags it as a horizontal layer. The
 * warning never blocks saving or export — it's a teaching tool, not a linter.
 */
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, HelpCircle, Layers, Scissors, Trash2 } from "lucide-react";
import { ExerciseShell } from "~/components/course/exercises/exercise-ui";
import { resolveActiveProduct } from "~/utils/pipeline-store";
import SlicerSessionSwitcher from "./SlicerSessionSwitcher";
import SlicerDashboard from "./SlicerDashboard";
import SlicerHelpModal from "./SlicerHelpModal";
import {
  createSession,
  createStory,
  deleteSession,
  isShippable,
  listSessionsForProduct,
  listSpecsForProduct,
  resolveActiveSession,
  resolveSpecLink,
  saveSession,
  setActiveId,
  SHIPPABILITY_CHECKS,
  toMarkdown,
  type ShippabilityCheckId,
  type SliceSession,
  type SlicingPattern,
  type StorySlice,
} from "~/utils/slicer-store";

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

interface PatternCard {
  id: SlicingPattern;
  label: string;
  definition: string;
  donut: string;
  /** Placeholder prompt seeded into the add-slice input for this pattern. */
  prompt: string;
}

const PATTERN_CARDS: PatternCard[] = [
  {
    id: "workflow-steps",
    label: "Workflow steps",
    definition: "Slice along the path the user walks — happy path first, then the branches.",
    donut: "Order one plain donut & pay → add quantities → add substitutions",
    prompt: "Slice 1 — the happy path, end to end…",
  },
  {
    id: "business-rules",
    label: "Business rules",
    definition: "Slice by the rules the feature must honour, one rule per slice, simplest first.",
    donut: "Flat delivery fee → free over $20 → holiday surge pricing",
    prompt: "One business rule — start with the simplest…",
  },
  {
    id: "data-variations",
    label: "Data variations",
    definition: "Slice by the kinds of data the feature handles, one variation per slice.",
    donut: "One donut type → boxes & dozens → custom-decorated orders",
    prompt: "One data variation — start with the simplest case…",
  },
];

/** One-liner for a failed check, used in the horizontal-layer warning chip. */
const FAILURE_HINT: Record<ShippabilityCheckId, string> = {
  value: "no standalone value",
  demoable: "nothing to demo",
  independent: "needs a later slice",
};

export default function Slicer() {
  const [productId, setProductId] = useState<string>("");
  const [session, setSession] = useState<SliceSession | null>(null);
  const [records, setRecords] = useState<SliceSession[]>([]);
  const [specs, setSpecs] = useState<{ id: string; title: string }[]>([]);
  const [storyDraft, setStoryDraft] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    const product = resolveActiveProduct();
    setProductId(product.id);
    setSpecs(listSpecsForProduct(product.id));
    const active = resolveActiveSession(product.id);
    setSession(active);
    setRecords(listSessionsForProduct(product.id));
    hydrated.current = true;
  }, []);

  // Persist the active session whenever it changes (after hydration).
  useEffect(() => {
    if (!hydrated.current || !session) return;
    saveSession(session.id, {
      featureText: session.featureText,
      specRef: session.specRef,
      specTitleSnapshot: session.specTitleSnapshot,
      pattern: session.pattern,
      stories: session.stories,
    });
    setRecords(listSessionsForProduct(session.productId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (!session) return null;

  // ---- session lifecycle ----
  const switchTo = (id: string) => {
    const record = records.find((r) => r.id === id);
    if (!record) return;
    setActiveId(productId, id);
    setSession(record);
    setStoryDraft("");
  };

  const createAndSwitch = () => {
    const record = createSession(productId);
    setActiveId(productId, record.id);
    setSession(record);
    setRecords(listSessionsForProduct(productId));
    setStoryDraft("");
  };

  const removeSession = (id: string) => {
    deleteSession(id);
    const remaining = listSessionsForProduct(productId);
    setRecords(remaining);
    if (id === session.id) {
      const next = remaining[0] ?? createSession(productId);
      setActiveId(productId, next.id);
      setSession(next);
      setRecords(listSessionsForProduct(productId));
    }
  };

  // ---- feature source ----
  const setFeatureText = (featureText: string) => setSession((s) => (s ? { ...s, featureText } : s));

  const pickSpec = (specId: string) => {
    if (!specId) {
      setSession((s) => (s ? { ...s, specRef: null, specTitleSnapshot: "" } : s));
      return;
    }
    const match = specs.find((sp) => sp.id === specId);
    if (!match) return;
    setSession((s) =>
      s ? { ...s, specRef: { specId }, specTitleSnapshot: match.title } : s,
    );
  };

  // ---- pattern ----
  const choosePattern = (pattern: SlicingPattern) => {
    if (session.pattern === pattern) return;
    if (
      session.pattern &&
      session.stories.length > 0 &&
      !window.confirm(
        "Switch slicing pattern? Your slices are kept — only the pattern label and prompts change.",
      )
    ) {
      return;
    }
    setSession((s) => (s ? { ...s, pattern } : s));
  };

  // ---- stories ----
  const addStory = () => {
    const title = storyDraft.trim();
    if (!title) return;
    setSession((s) => (s ? { ...s, stories: [...s.stories, createStory(title)] } : s));
    setStoryDraft("");
  };

  const renameStory = (id: string, title: string) =>
    setSession((s) =>
      s ? { ...s, stories: s.stories.map((st) => (st.id === id ? { ...st, title } : st)) } : s,
    );

  const setStoryNote = (id: string, note: string) =>
    setSession((s) =>
      s ? { ...s, stories: s.stories.map((st) => (st.id === id ? { ...st, note } : st)) } : s,
    );

  const toggleCheck = (id: string, checkId: ShippabilityCheckId) =>
    setSession((s) =>
      s
        ? {
            ...s,
            stories: s.stories.map((st) =>
              st.id === id ? { ...st, checks: { ...st.checks, [checkId]: !st.checks[checkId] } } : st,
            ),
          }
        : s,
    );

  const removeStory = (id: string) =>
    setSession((s) => (s ? { ...s, stories: s.stories.filter((st) => st.id !== id) } : s));

  const moveStory = (id: string, direction: -1 | 1) =>
    setSession((s) => {
      if (!s) return s;
      const idx = s.stories.findIndex((st) => st.id === id);
      const target = idx + direction;
      if (idx < 0 || target < 0 || target >= s.stories.length) return s;
      const stories = [...s.stories];
      [stories[idx], stories[target]] = [stories[target], stories[idx]];
      return { ...s, stories };
    });

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(toMarkdown(session));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the preview below still shows the export */
    }
  };

  // ---- derived ----
  const specLink = resolveSpecLink(productId, session.specRef, session.specTitleSnapshot);
  const activePattern = PATTERN_CARDS.find((p) => p.id === session.pattern);
  const hasContent = session.featureText.trim() !== "" || session.stories.length > 0;

  return (
    <>
      <ExerciseShell
        kicker="Free tool"
        title="Slice a feature into shippable stories"
        instructions="Describe one big feature, pick how you'll slice it, then write slices that each pass the shippability check. It saves in your browser — nothing is sent anywhere."
        headerAction={
          <SlicerSessionSwitcher
            records={records}
            activeId={session.id}
            onSelect={switchTo}
            onCreate={createAndSwitch}
            onDelete={removeSession}
          />
        }
      >
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="inline-flex items-center gap-1 text-caption font-semibold text-muted transition-colors hover:text-accent-700"
          >
            <HelpCircle size={14} strokeWidth={2} />
            What's a vertical slice?
          </button>
        </div>

        {/* Step 1 — feature source */}
        <div className="mt-4 rounded-lg border border-ink-200 bg-surface-base p-4">
          <p className="text-caption font-semibold text-muted">1 · What are you slicing?</p>
          {specs.length > 0 ? (
            <div className="mt-2">
              <label htmlFor="slicer-spec" className="block text-caption text-faint">
                Link a spec (optional)
              </label>
              <select
                id="slicer-spec"
                value={session.specRef?.specId ?? ""}
                onChange={(e) => pickSpec(e.target.value)}
                className={`mt-1 ${inputClass}`}
              >
                <option value="">Describe a feature manually</option>
                {specs.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="mt-2 text-caption text-faint">
              No specs saved yet — describe the feature manually below. Build one in the{" "}
              <a href="/tools/spec-builder/" className="link-underline text-accent-700">
                Spec Builder
              </a>{" "}
              to link it here.
            </p>
          )}

          {session.specRef && specLink.status !== "live" && (
            <p className="mt-2 inline-flex items-center gap-1 rounded-md border border-ink-200 bg-surface-raised px-2 py-1 text-caption text-strong">
              <span aria-hidden="true">⚠️</span>
              {specLink.status === "missing"
                ? `Linked spec "${session.specTitleSnapshot}" was removed — still using the saved snapshot.`
                : `Linked spec was renamed to "${specLink.title}" — snapshot was "${session.specTitleSnapshot}".`}
            </p>
          )}

          <textarea
            value={session.featureText}
            onChange={(e) => setFeatureText(e.target.value)}
            rows={2}
            placeholder="e.g. Let a customer order a donut for delivery"
            className={`mt-2 ${inputClass} resize-y`}
          />
        </div>

        {/* Step 2 — pattern */}
        <div className="mt-4">
          <p className="text-caption font-semibold text-muted">2 · How will you slice it?</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {PATTERN_CARDS.map((card) => {
              const selected = session.pattern === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => choosePattern(card.id)}
                  aria-pressed={selected}
                  className={`flex flex-col rounded-lg border p-4 text-left transition-colors ${
                    selected
                      ? "border-accent-600 bg-accent-50"
                      : "border-ink-200 bg-surface-base hover:border-accent-600"
                  }`}
                >
                  <span className="flex items-center gap-2 text-body font-semibold text-strong">
                    <Scissors size={15} strokeWidth={2} className="shrink-0 text-accent-700" />
                    {card.label}
                  </span>
                  <span className="mt-1 text-caption text-muted">{card.definition}</span>
                  <span className="mt-2 text-caption italic text-faint">{card.donut}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3 — stories */}
        {session.pattern && (
          <div className="mt-4">
            <p className="text-caption font-semibold text-muted">3 · Your slices</p>

            {session.stories.length > 0 && (
              <ul className="mt-2 grid gap-3">
                {session.stories.map((story, i) => (
                  <StoryRow
                    key={story.id}
                    story={story}
                    index={i}
                    count={session.stories.length}
                    onRename={(title) => renameStory(story.id, title)}
                    onNote={(note) => setStoryNote(story.id, note)}
                    onToggle={(checkId) => toggleCheck(story.id, checkId)}
                    onMove={(dir) => moveStory(story.id, dir)}
                    onRemove={() => removeStory(story.id)}
                  />
                ))}
              </ul>
            )}

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={storyDraft}
                onChange={(e) => setStoryDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addStory()}
                placeholder={activePattern?.prompt ?? "Add a slice…"}
                className={inputClass}
              />
              <button type="button" onClick={addStory} className="btn btn-primary shrink-0 !py-2">
                Add slice
              </button>
            </div>
          </div>
        )}

        {/* Export */}
        {hasContent && (
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
              {toMarkdown(session)}
            </pre>
          </div>
        )}

        <SlicerDashboard
          records={records}
          activeId={session.id}
          onOpen={switchTo}
          onDelete={removeSession}
        />
      </ExerciseShell>
      <SlicerHelpModal open={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}

function StoryRow({
  story,
  index,
  count,
  onRename,
  onNote,
  onToggle,
  onMove,
  onRemove,
}: {
  story: StorySlice;
  index: number;
  count: number;
  onRename: (title: string) => void;
  onNote: (note: string) => void;
  onToggle: (checkId: ShippabilityCheckId) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const shippable = isShippable(story);
  const failed = SHIPPABILITY_CHECKS.filter((c) => !story.checks[c.id]);

  return (
    <li
      className={`rounded-lg border p-4 ${shippable ? "border-accent-600 bg-accent-50" : "border-ink-200 bg-surface-base"}`}
    >
      <div className="flex items-start gap-2">
        <span className="mt-2 text-caption font-semibold text-faint">{index + 1}</span>
        <input
          type="text"
          value={story.title}
          onChange={(e) => onRename(e.target.value)}
          aria-label={`Slice ${index + 1} title`}
          className={`${inputClass} flex-1`}
        />
        <div className="flex shrink-0 flex-col">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={`Move slice ${index + 1} up`}
            className="rounded-md px-1 text-faint transition-colors hover:text-accent-700 disabled:opacity-30"
          >
            <ArrowUp size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === count - 1}
            aria-label={`Move slice ${index + 1} down`}
            className="rounded-md px-1 text-faint transition-colors hover:text-accent-700 disabled:opacity-30"
          >
            <ArrowDown size={14} strokeWidth={2} />
          </button>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove slice ${index + 1}`}
          className="mt-1.5 shrink-0 text-faint transition-colors hover:text-accent-700"
        >
          <Trash2 size={14} strokeWidth={2} />
        </button>
      </div>

      <input
        type="text"
        value={story.note}
        onChange={(e) => onNote(e.target.value)}
        aria-label={`Slice ${index + 1} detail`}
        placeholder="Optional detail…"
        className={`mt-2 ${inputClass} !text-caption`}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {SHIPPABILITY_CHECKS.map((check) => {
          const on = story.checks[check.id];
          return (
            <button
              key={check.id}
              type="button"
              onClick={() => onToggle(check.id)}
              aria-pressed={on}
              className={`rounded-md border px-2.5 py-1 text-caption font-semibold transition-colors ${
                on
                  ? "border-accent-600 bg-surface-raised text-accent-700"
                  : "border-ink-200 bg-surface-raised text-muted hover:border-accent-600"
              }`}
            >
              <span aria-hidden="true" className="mr-1">
                {on ? "✓" : "○"}
              </span>
              {check.label}
            </button>
          );
        })}
      </div>

      <p
        className={`mt-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-caption font-semibold ${
          shippable ? "text-accent-700" : "border border-ink-200 bg-surface-raised text-strong"
        }`}
      >
        {shippable ? (
          <>
            <Scissors size={13} strokeWidth={2} />
            Vertical slice ✓
          </>
        ) : (
          <>
            <Layers size={13} strokeWidth={2} />
            Looks like a horizontal layer — {failed.map((c) => FAILURE_HINT[c.id]).join(", ")}
          </>
        )}
      </p>
    </li>
  );
}
