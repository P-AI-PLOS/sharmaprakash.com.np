/**
 * Exercise: classify the assumptions underneath one Donut CRM solution into
 * the five assumption categories, then pick the riskiest. Module 5.
 */
import { useState } from "react";
import { ExerciseShell, ChoiceButton, Feedback, ScoreBar } from "./exercise-ui";

type Category = "desirability" | "viability" | "feasibility" | "usability" | "ethical";

interface Assumption {
  text: string;
  category: Category;
  why: string;
  /** Part of the riskiest-assumption debrief. */
  riskNote: string;
  riskiest?: boolean;
}

const SOLUTION =
  "Auto-draft a follow-up email from the meeting transcript, ready to review and send from the contact page.";

const ASSUMPTIONS: Assumption[] = [
  {
    text: "Reps want help writing follow-ups (they see follow-up writing as a chore, not their craft).",
    category: "desirability",
    why: "It's about whether the customer wants this at all. If reps see follow-ups as personal relationship work, drafting help is unwelcome no matter how good it is.",
    riskNote: "Strong interview evidence already: reps repeatedly called follow-ups a chore that slips.",
  },
  {
    text: "The transcript quality is good enough to draft a sendable email from.",
    category: "feasibility",
    why: "A can-we-build-it question — speech-to-text noise, crosstalk, and missing context are technical constraints.",
    riskNote: "Partially known: transcripts exist today, but nobody has measured draft quality against them.",
  },
  {
    text: "Reps will actually review the draft rather than firing it off blind.",
    category: "usability",
    why: "It's about how people will really use the flow — whether the design produces the reviewing behavior the feature depends on.",
    riskNote: "Untested, and the failure mode (embarrassing emails sent unread) damages trust badly.",
    riskiest: true,
  },
  {
    text: "Drafting emails from recorded conversations won't cross consent or privacy lines for the people who were recorded.",
    category: "ethical",
    why: "Whether we should build it: the meeting's other participants never opted into their words becoming sales collateral.",
    riskNote: "Consequential but partially mitigable with recording-consent flows that already exist.",
  },
  {
    text: "Better follow-up rates will show up in retention, which is the business case for building it.",
    category: "viability",
    why: "It ties the feature to the business: if follow-ups don't move retention, the investment doesn't pay back.",
    riskNote: "Correlational data supports it; causation unproven, but cheap to keep measuring.",
  },
];

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "desirability", label: "Desirability" },
  { key: "viability", label: "Viability" },
  { key: "feasibility", label: "Feasibility" },
  { key: "usability", label: "Usability" },
  { key: "ethical", label: "Ethical" },
];

export default function AssumptionClassifier() {
  const [answers, setAnswers] = useState<Record<number, Category>>({});
  const [riskPick, setRiskPick] = useState<number | null>(null);

  const answered = Object.keys(answers).length;
  const correct = ASSUMPTIONS.filter((a, i) => answers[i] === a.category).length;
  const allClassified = answered === ASSUMPTIONS.length;

  return (
    <ExerciseShell
      title="Map the assumptions under one solution"
      instructions={`Donut CRM's team wants to build: “${SOLUTION}” Below are five assumptions this bet quietly makes. First classify each; then pick the one you'd test first.`}
    >
      <ol className="grid gap-4">
        {ASSUMPTIONS.map((a, i) => {
          const picked = answers[i];
          return (
            <li key={i} className="rounded-lg border border-ink-200 bg-surface-base p-4">
              <p className="text-body text-strong">{a.text}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CATEGORIES.map(({ key, label }) => (
                  <ChoiceButton
                    key={key}
                    label={label}
                    selected={picked === key}
                    disabled={picked !== undefined}
                    onClick={() => setAnswers((s) => ({ ...s, [i]: key }))}
                  />
                ))}
              </div>
              {picked !== undefined && (
                <Feedback correct={picked === a.category}>
                  {picked === a.category ? a.why : `This one is ${a.category}. ${a.why}`}
                </Feedback>
              )}
            </li>
          );
        })}
      </ol>

      {allClassified && (
        <div className="mt-6 rounded-lg border border-accent-600 bg-surface-base p-4">
          <p className="text-h5 font-semibold text-strong">Now: which would you test first?</p>
          <p className="mt-1 text-caption text-muted">
            The riskiest assumption is the one that is both load-bearing (the idea dies if it's false) and
            weakly evidenced (you're mostly guessing).
          </p>
          <div className="mt-3 grid gap-2">
            {ASSUMPTIONS.map((a, i) => (
              <button
                key={i}
                type="button"
                disabled={riskPick !== null}
                aria-pressed={riskPick === i}
                onClick={() => setRiskPick(i)}
                className={`rounded-md border px-4 py-2.5 text-left text-body transition-colors ${
                  riskPick === i
                    ? "border-accent-600 bg-accent-50 text-strong"
                    : "border-ink-200 text-strong hover:border-accent-600"
                } disabled:cursor-not-allowed`}
              >
                {a.text}
              </button>
            ))}
          </div>
          {riskPick !== null && (
            <Feedback correct={Boolean(ASSUMPTIONS[riskPick].riskiest)}>
              {ASSUMPTIONS[riskPick].riskiest
                ? `That's the leap of faith: ${ASSUMPTIONS[riskPick].riskNote} A cheap moderated prototype test settles it before anyone writes production code.`
                : `Defensible, but there's a riskier one. ${ASSUMPTIONS[riskPick].riskNote} The review-behavior assumption is both untested and catastrophic if false — evidence is weakest exactly where the stakes are highest.`}
            </Feedback>
          )}
        </div>
      )}

      <ScoreBar
        answered={answered}
        total={ASSUMPTIONS.length}
        correct={correct}
        onReset={() => {
          setAnswers({});
          setRiskPick(null);
        }}
      />
    </ExerciseShell>
  );
}
