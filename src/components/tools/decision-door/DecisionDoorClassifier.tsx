/**
 * One-way / two-way door classifier. Two modes:
 * - curated: fixed scenario set, judge-then-reveal, ScoreBar
 * - freeform: classify your own decisions, persisted to localStorage
 *
 * Reuses ExerciseShell/ChoiceButton/Feedback/ScoreBar from exercise-ui.tsx.
 */
import { useEffect, useRef, useState } from "react";
import { HelpCircle, Trash2 } from "lucide-react";
import { ExerciseShell, ChoiceButton, Feedback, ScoreBar } from "~/components/course/exercises/exercise-ui";
import DecisionDoorHelpModal, { type DoorConcept } from "./DecisionDoorHelpModal";
import { CURATED_SCENARIOS, type CuratedScenario } from "./scenarios";
import { listDecisions, addDecision, removeDecision, type DoorType } from "~/utils/decision-door-store";

interface DecisionDoorClassifierProps {
  mode?: "curated" | "freeform";
  source?: { type: "standalone" } | { type: "post" };
}

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

export default function DecisionDoorClassifier({
  mode: initialMode = "curated",
  source = { type: "standalone" },
}: DecisionDoorClassifierProps) {
  const [activeMode, setActiveMode] = useState<"curated" | "freeform">(initialMode);
  const [helpConcept, setHelpConcept] = useState<DoorConcept | null>(null);

  // --- Curated state ---
  const [answers, setAnswers] = useState<Record<string, DoorType | null>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  // --- Freeform state ---
  const [entries, setEntries] = useState(() => listDecisions());
  const [draftText, setDraftText] = useState("");
  const [draftCall, setDraftCall] = useState<DoorType | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const hydrated = useRef(false);

  useEffect(() => {
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) setEntries(listDecisions());
  }, [activeMode]);

  // --- Curated handlers ---
  const totalScenarios = CURATED_SCENARIOS.length;
  const answeredCount = Object.keys(answers).length;
  const correctCount = CURATED_SCENARIOS.filter(
    (s) => answers[s.id] === s.correct,
  ).length;

  const handleCuratedPick = (scenario: CuratedScenario, pick: DoorType) => {
    if (answers[scenario.id] !== undefined) return;
    setAnswers((a) => ({ ...a, [scenario.id]: pick }));
    setRevealed((r) => ({ ...r, [scenario.id]: true }));
  };

  const resetCurated = () => {
    setAnswers({});
    setRevealed({});
  };

  // --- Freeform handlers ---
  const submitFreeform = () => {
    const text = draftText.trim();
    if (!text || !draftCall) return;
    addDecision(text, draftCall, draftNote.trim());
    setEntries(listDecisions());
    setDraftText("");
    setDraftCall(null);
    setDraftNote("");
  };

  const deleteEntry = (id: string) => {
    removeDecision(id);
    setEntries(listDecisions());
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  // --- Curated mode ---
  const curatedContent = (
    <>
      {CURATED_SCENARIOS.map((scenario) => {
        const picked = answers[scenario.id] ?? null;
        const isRevealed = revealed[scenario.id] ?? false;
        const isCorrect = picked === scenario.correct;

        return (
          <div key={scenario.id} className="rounded-lg border border-ink-200 bg-surface-base p-4">
            <p className="text-body text-strong">{scenario.text}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ChoiceButton
                label="One-way door"
                selected={picked === "one-way"}
                disabled={picked !== undefined && picked !== null}
                onClick={() => handleCuratedPick(scenario, "one-way")}
              />
              <ChoiceButton
                label="Two-way door"
                selected={picked === "two-way"}
                disabled={picked !== undefined && picked !== null}
                onClick={() => handleCuratedPick(scenario, "two-way")}
              />
              <button
                type="button"
                onClick={() => setHelpConcept(scenario.correct)}
                className="inline-flex items-center gap-1 text-caption text-muted transition-colors hover:text-accent-700"
              >
                <HelpCircle size={14} strokeWidth={2} />
                Explain
              </button>
            </div>

            {isRevealed && (
              <Feedback correct={isCorrect}>
                {scenario.reasoning}
              </Feedback>
            )}
          </div>
        );
      })}

      <ScoreBar answered={answeredCount} total={totalScenarios} correct={correctCount} onReset={resetCurated} />
    </>
  );

  // --- Freeform mode ---
  const freeformContent = (
    <>
      <div className="rounded-lg border border-ink-200 bg-surface-base p-4">
        <p className="text-caption font-semibold text-muted">What decision are you facing right now?</p>
        <input
          type="text"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder="e.g. Which auth provider should we integrate?"
          className={`mt-2 ${inputClass}`}
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ChoiceButton label="One-way door" selected={draftCall === "one-way"} onClick={() => setDraftCall("one-way")} />
          <ChoiceButton label="Two-way door" selected={draftCall === "two-way"} onClick={() => setDraftCall("two-way")} />
          {draftCall && (
            <button
              type="button"
              onClick={() => setHelpConcept(draftCall)}
              className="inline-flex items-center gap-1 text-caption text-muted transition-colors hover:text-accent-700"
            >
              <HelpCircle size={14} strokeWidth={2} />
              Explain this door
            </button>
          )}
        </div>

        {draftCall && (
          <textarea
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            placeholder="Why did you classify it this way? (optional)"
            rows={2}
            className={`mt-3 ${inputClass}`}
          />
        )}

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={submitFreeform}
            disabled={!draftText.trim() || !draftCall}
            className="btn btn-primary shrink-0 !py-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Log decision
          </button>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="mt-4 grid gap-2">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-ink-200 bg-surface-base p-3"
            >
              <div className="min-w-0">
                <p className="text-body text-strong">{entry.decisionText}</p>
                <p className="mt-1 text-caption text-muted">
                  <span className="font-semibold">{entry.call === "one-way" ? "🚪 One-way" : "🔄 Two-way"}</span>
                  {entry.note && <span className="ml-2">— {entry.note}</span>}
                  <span className="ml-2 text-faint">{formatDate(entry.createdAt)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => deleteEntry(entry.id)}
                aria-label={`Delete: ${entry.decisionText}`}
                className="shrink-0 text-faint transition-colors hover:text-accent-700"
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <p className="mt-4 text-caption text-muted text-center">
          No decisions logged yet. Classify a decision above to start building your log.
        </p>
      )}
    </>
  );

  return (
    <>
      <ExerciseShell
        kicker={source.type === "post" ? "Try it" : "Free tool"}
        title={activeMode === "curated" ? "Classify the doors" : "Classify your own decision"}
        instructions={
          activeMode === "curated"
            ? "For each decision below, decide: is this a one-way door (irreversible, high cost to undo) or a two-way door (reversible, cheap to adjust)?"
            : "Log the decisions you're facing and classify each one. Everything saves in your browser."
        }
        headerAction={
          source.type === "standalone" ? (
            <div className="flex gap-2">
              <ChoiceButton label="Curated" selected={activeMode === "curated"} onClick={() => setActiveMode("curated")} />
              <ChoiceButton label="Your decisions" selected={activeMode === "freeform"} onClick={() => setActiveMode("freeform")} />
            </div>
          ) : undefined
        }
      >
        {activeMode === "curated" ? curatedContent : freeformContent}
      </ExerciseShell>
      <DecisionDoorHelpModal concept={helpConcept} onClose={() => setHelpConcept(null)} />
    </>
  );
}
