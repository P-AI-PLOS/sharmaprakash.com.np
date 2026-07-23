import type { DoorType } from "~/utils/decision-door-store";

export interface CuratedScenario {
  id: string;
  text: string;
  correct: DoorType;
  reasoning: string;
}

export const CURATED_SCENARIOS: CuratedScenario[] = [
  {
    id: "scenario-1",
    text: "Which button color converts better — green or blue?",
    correct: "two-way",
    reasoning:
      "A classic A/B test. Ship it, learn, adjust. The blast radius is tiny and the decision is fully reversible.",
  },
  {
    id: "scenario-2",
    text: "Which of two similar libraries should we prototype with?",
    correct: "two-way",
    reasoning:
      "A prototype is throwaway by definition. Pick one, learn, swap if needed. The cost of wrong choice is measured in days, not months.",
  },
  {
    id: "scenario-3",
    text: "A data-model choice that will be baked into every downstream integration.",
    correct: "one-way",
    reasoning:
      "Once three systems depend on the shape, migrating it is a project — not a refactor. This needs scrutiny, not speed.",
  },
  {
    id: "scenario-4",
    text: "A vendor contract with a multi-year lock-in.",
    correct: "one-way",
    reasoning:
      "You're committing budget and architectural flexibility for years. The exit cost is high enough that this deserves the full decision process.",
  },
  {
    id: "scenario-5",
    text: "A public API contract your consumers will build against.",
    correct: "one-way",
    reasoning:
      "Changing a public API breaks trust and breaks builds. Once consumers depend on the shape, you're maintaining it forever — or paying the migration cost for everyone who adopted it.",
  },
];
