/**
 * Exercise: pick the interview question that gets a story instead of a
 * speculation. Used in course module 2 (finding opportunities).
 */
import { useState } from "react";
import { ExerciseShell, Feedback, ScoreBar } from "./exercise-ui";

interface Pair {
  scenario: string;
  good: string;
  bad: string;
  why: string;
}

const PAIRS: Pair[] = [
  {
    scenario: "You want to learn how a founder keeps track of people they meet.",
    bad: "Would you use a tool that reminded you to follow up with contacts?",
    good: "Tell me about the last person you met at an event. What happened after you exchanged details?",
    why: "The first invites polite speculation — nearly everyone says yes and it means nothing. The second retrieves a specific, recent episode; the follow-up behavior (or its absence) shows up on its own.",
  },
  {
    scenario: "You suspect meeting notes are a pain point.",
    bad: "How important is it for you to remember what was said in meetings?",
    good: "Walk me through your last sales call. What did you do in the ten minutes right after it ended?",
    why: "Asking people to rate importance yields flattering abstractions. Asking for the last concrete instance surfaces what they actually did — sticky notes, a voice memo, nothing at all.",
  },
  {
    scenario: "You're exploring whether reps would trust AI-drafted emails.",
    bad: "Would you let an AI write your follow-up emails?",
    good: "Show me the last follow-up email you sent. How did you write it, and how long did it take?",
    why: "Hypothetical trust questions get identity answers ('I'd always review it!'). The real email, the real process, and the real time cost tell you where drafting help would land — and where trust breaks.",
  },
  {
    scenario: "You want to size how bad the 'lost context before a call' problem is.",
    bad: "Do you usually prepare before customer calls?",
    good: "Think of your most recent customer call. What did you look at, if anything, in the five minutes before joining?",
    why: "'Usually' questions retrieve self-image, not behavior. Anchoring to the most recent instance gets you the truth — including the awkward 'honestly, nothing, I winged it.'",
  },
  {
    scenario: "A user churned from Donut CRM last month and agreed to a call.",
    bad: "What features were missing for you?",
    good: "Take me back to the week you decided to stop using it. What was going on, and what did you switch to?",
    why: "Asking for missing features outsources product strategy to the customer and gets a wish list. The story of the switching moment reveals the real forces — what pushed them out and what pulled them elsewhere.",
  },
];

export default function InterviewQuestionQuiz() {
  // answers[i]: 0 = picked first shown option, 1 = picked second
  const [answers, setAnswers] = useState<Record<number, "good" | "bad">>({});

  const answered = Object.keys(answers).length;
  const correct = PAIRS.filter((_, i) => answers[i] === "good").length;

  return (
    <ExerciseShell
      title="Which question would you ask?"
      instructions="Five interview moments from Donut CRM's discovery. In each, one question retrieves a story and one retrieves a speculation. Pick the one you'd ask."
    >
      <ol className="grid gap-4">
        {PAIRS.map((pair, i) => {
          const picked = answers[i];
          // Alternate ordering so the better question isn't always in the same slot.
          const options =
            i % 2 === 0
              ? ([
                  { key: "bad", text: pair.bad },
                  { key: "good", text: pair.good },
                ] as const)
              : ([
                  { key: "good", text: pair.good },
                  { key: "bad", text: pair.bad },
                ] as const);
          return (
            <li key={i} className="rounded-lg border border-ink-200 bg-surface-base p-4">
              <p className="text-caption font-semibold text-muted">{pair.scenario}</p>
              <div className="mt-3 grid gap-2">
                {options.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={picked !== undefined}
                    aria-pressed={picked === opt.key}
                    onClick={() => setAnswers((a) => ({ ...a, [i]: opt.key }))}
                    className={`rounded-md border px-4 py-3 text-left text-body transition-colors ${
                      picked === opt.key
                        ? "border-accent-600 bg-accent-50 text-strong"
                        : "border-ink-200 text-strong hover:border-accent-600"
                    } disabled:cursor-not-allowed`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
              {picked !== undefined && (
                <Feedback correct={picked === "good"}>
                  {picked === "good" ? pair.why : `The other one. ${pair.why}`}
                </Feedback>
              )}
            </li>
          );
        })}
      </ol>
      <ScoreBar answered={answered} total={PAIRS.length} correct={correct} onReset={() => setAnswers({})} />
    </ExerciseShell>
  );
}
