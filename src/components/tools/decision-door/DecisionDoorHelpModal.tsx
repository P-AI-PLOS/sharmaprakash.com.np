/**
 * Per-door-type quick-reference modal — one for one-way doors, one for
 * two-way doors. Triggered from the classifier's judgment buttons.
 * Mirrors OstHelpModal's portal/Escape/content structure.
 */
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { DoorOpen, RotateCcw, X, type LucideIcon } from "lucide-react";

export type DoorConcept = "one-way" | "two-way";

interface DoorContent {
  icon: LucideIcon;
  label: string;
  definition: string;
  example: string;
  gotchas: string[];
  howTo: string[];
  blogHref: string;
  blogLabel: string;
}

const CONTENT: Record<DoorConcept, DoorContent> = {
  "one-way": {
    icon: DoorOpen,
    label: "One-way door",
    definition:
      "A decision you can't walk back without real cost — baked-in data models, multi-year contracts, public API contracts. Once you're through, you're not getting back to where you started.",
    example:
      "A schema decision made in a fifteen-minute stand-up because \"we can always migrate later\" — eighteen months later that migration was still on the roadmap, un-started, because three other systems depended on the shape they'd chosen quickly.",
    gotchas: [
      "The most common failure mode is treating every decision like a one-way door — more meetings, more sign-off, more caution always looks responsible, but that caution has an invisible cost.",
      "A one-way door treated with two-way-door speed is how you end up with eighteen-month migration backlogs nobody started.",
      "The framework doesn't make the classification for you — it gives you ten seconds of pause to ask which kind of door you're standing in front of.",
    ],
    howTo: [
      "Ask: once this decision is made, what would it cost to reverse it? If the answer is \"a project, not an afternoon,\" it's a one-way door.",
      "Give it an explicit owner and a date — not a committee, not a vote, but someone accountable for the decision and its consequences.",
      "Write down what you considered and rejected (an ADR). The next time someone asks \"why did we do it this way?\" you'll have a link instead of a meeting.",
    ],
    blogHref: "/product-management/risk-reduction-and-decision-making-the-vocabulary-i-use-under-pressure/",
    blogLabel: "Risk reduction: the vocabulary I use under pressure",
  },
  "two-way": {
    icon: RotateCcw,
    label: "Two-way door",
    definition:
      "A decision you can walk back — reversible, cheap to undo, low blast radius. Ship it, learn, adjust. The cost of being wrong is measured in days, not months.",
    example:
      "Which button color converts better? Ship the A/B test, learn, revert if it doesn't work. The decision is fully reversible and the blast radius is tiny.",
    gotchas: [
      "The failure mode is spending six weeks in a steering committee on a reversible A/B test — I've watched teams spend more calendar time deciding than they later spent running it.",
      "The vocabulary is only useful if someone in the room is willing to say \"this is a two-way door, let's just decide and move.\"",
      "Don't let \"bias toward action\" become an excuse to skip the classification — knowing it's a two-way door is what gives you permission to move fast.",
    ],
    howTo: [
      "Ask: if this turns out to be wrong, can we revert it within a week? If yes, it's a two-way door.",
      "Decide it today, by whoever's closest to it — don't schedule a meeting for something reversible.",
      "Ship it and learn. The point of a two-way door is that you can adjust after you see what happens.",
    ],
    blogHref: "/product-management/risk-reduction-and-decision-making-the-vocabulary-i-use-under-pressure/",
    blogLabel: "Risk reduction: the vocabulary I use under pressure",
  },
};

export default function DecisionDoorHelpModal({
  concept,
  onClose,
}: {
  concept: DoorConcept | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!concept) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [concept, onClose]);

  if (!concept || !mounted) return null;
  const { icon: ConceptIcon, label, definition, example, gotchas, howTo, blogHref, blogLabel } =
    CONTENT[concept];

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-ink-900/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`How to recognize a ${label.toLowerCase()}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-ink-200 bg-surface-raised p-6 shadow-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
              <ConceptIcon size={20} strokeWidth={2} />
            </span>
            <div>
              <p className="eyebrow mb-0.5">Quick reference</p>
              <h3 className="text-h4 text-strong">{label}</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="btn btn-ghost btn-sm shrink-0 !px-2">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <p className="mt-4 text-body text-strong">{definition}</p>
        <p className="mt-2 text-caption italic text-faint">{example}</p>

        <div className="mt-5">
          <p className="text-caption font-semibold text-muted">Gotchas</p>
          <ul className="mt-2 grid gap-2">
            {gotchas.map((g) => (
              <li key={g} className="flex gap-2 rounded-md border border-ink-200 bg-surface-base p-3 text-body text-muted">
                <span aria-hidden="true">⚠️</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <p className="text-caption font-semibold text-muted">How to recognize it</p>
          <ol className="mt-2 grid gap-2">
            {howTo.map((step, i) => (
              <li key={step} className="flex gap-2 text-body text-strong">
                <span className="shrink-0 font-semibold text-accent-700">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <a
          href={blogHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 block text-caption font-semibold text-accent-700 link-underline"
        >
          Read the full framework — {blogLabel} →
        </a>
      </div>
    </div>,
    document.body,
  );
}
