/**
 * Exercise: classify statements from Donut CRM's discovery notes as an
 * opportunity, a solution, or an experiment. Used in course module 1.
 */
import { useState } from "react";
import { ExerciseShell, ChoiceButton, Feedback, ScoreBar } from "./exercise-ui";

type Kind = "opportunity" | "solution" | "experiment";

interface Item {
  text: string;
  kind: Kind;
  why: string;
}

const ITEMS: Item[] = [
  {
    text: "“I can never remember what we talked about the last time we met.”",
    kind: "opportunity",
    why: "It's a need expressed in the customer's world — no feature mentioned, many possible solutions could address it.",
  },
  {
    text: "Add AI-generated meeting summaries to every contact timeline.",
    kind: "solution",
    why: "It names a specific feature. The unmet need behind it (remembering past conversations) is the opportunity; this is one of many ways to address it.",
  },
  {
    text: "“Half my follow-ups slip because I write them on sticky notes after calls.”",
    kind: "opportunity",
    why: "A pain point in the customer's own words. It doesn't presuppose any particular fix — reminders, capture, automation could all serve it.",
  },
  {
    text: "For two weeks, have onboarding calls end with the rep creating one follow-up task, and measure whether week-2 retention moves.",
    kind: "experiment",
    why: "It has a time box, a behavior change, and a measurement. It exists to generate evidence, not to ship value directly.",
  },
  {
    text: "Auto-draft a follow-up email as soon as a meeting recording is processed.",
    kind: "solution",
    why: "Specific, buildable, and already commits to a mechanism (auto-drafting). The opportunity underneath is 'following up takes effort I don't have.'",
  },
  {
    text: "“I don't trust the CRM's data enough to send an email it wrote.”",
    kind: "opportunity",
    why: "Trust is a customer need. It sounds like an objection, but objections heard repeatedly in interviews are opportunities — address them and the product's value unlocks.",
  },
  {
    text: "Show a fake-door “Import from LinkedIn” button and count clicks for a week.",
    kind: "experiment",
    why: "A smoke-screen test: it measures demand before building. The click count is evidence, not a feature.",
  },
];

const LABELS: { kind: Kind; label: string }[] = [
  { kind: "opportunity", label: "Opportunity" },
  { kind: "solution", label: "Solution" },
  { kind: "experiment", label: "Experiment" },
];

export default function OpportunitySorter() {
  const [answers, setAnswers] = useState<Record<number, Kind>>({});

  const answered = Object.keys(answers).length;
  const correct = ITEMS.filter((it, i) => answers[i] === it.kind).length;

  return (
    <ExerciseShell
      title="Opportunity, solution, or experiment?"
      instructions="Seven statements pulled from Donut CRM's discovery notes. Classify each one — the distinctions are the whole game, and they're slipperier than they look."
    >
      <ol className="grid gap-4">
        {ITEMS.map((item, i) => {
          const picked = answers[i];
          return (
            <li key={i} className="rounded-lg border border-ink-200 bg-surface-base p-4">
              <p className="text-body text-strong">{item.text}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {LABELS.map(({ kind, label }) => (
                  <ChoiceButton
                    key={kind}
                    label={label}
                    selected={picked === kind}
                    disabled={picked !== undefined}
                    onClick={() => setAnswers((a) => ({ ...a, [i]: kind }))}
                  />
                ))}
              </div>
              {picked !== undefined && (
                <Feedback correct={picked === item.kind}>
                  {picked === item.kind ? item.why : `It's ${item.kind === "opportunity" ? "an" : "a"} ${item.kind}. ${item.why}`}
                </Feedback>
              )}
            </li>
          );
        })}
      </ol>
      <ScoreBar answered={answered} total={ITEMS.length} correct={correct} onReset={() => setAnswers({})} />
    </ExerciseShell>
  );
}
