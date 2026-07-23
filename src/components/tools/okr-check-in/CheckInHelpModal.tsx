/**
 * Per-concept quick-reference modal for the check-in ritual — mirrors
 * `ost/OstHelpModal.tsx`. One card each for what a check-in is, why mid-quarter
 * snapshots beat a single launch-week number, and what drafting hands off.
 */
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { CalendarCheck, LineChart, Sprout, X, type LucideIcon } from "lucide-react";

export type CheckInConcept = "ritual" | "snapshots" | "draft";

interface ConceptContent {
  icon: LucideIcon;
  label: string;
  definition: string;
  example: string;
  gotchas: string[];
  howTo: string[];
  blogHref: string;
  blogLabel: string;
}

const CONTENT: Record<CheckInConcept, ConceptContent> = {
  ritual: {
    icon: CalendarCheck,
    label: "The quarter-close check-in",
    definition:
      "A short ritual at the end of a quarter: for each key result, you record the number you actually landed, how much you trust it, and one honest reflection. It closes the loop the OKR opened — not a grade, a look at what really happened.",
    example: "“We aimed to move first-order completion from 12% to 40%. We landed 31% — solid, but the last two weeks stalled.”",
    gotchas: [
      "Skipping the reflection turns the check-in into a scoreboard; the sentence about why the number is what it is is the part worth keeping.",
      "Waiting for a “final” quarter-close before logging anything means you lose the mid-quarter story — log snapshots as you go.",
      "A check-in isn't a weighted OKR score; there's no grading formula here on purpose.",
    ],
    howTo: [
      "Pick the OKR you're closing — the tool seeds one entry per key result.",
      "For each key result, enter the close-out actual, flag your confidence, and write one line of reflection.",
      "Then decide what carries into next quarter and draft it.",
    ],
    blogHref: "/product-management/",
    blogLabel: "Product management writing",
  },
  snapshots: {
    icon: LineChart,
    label: "Mid-quarter snapshots",
    definition:
      "Timestamped readings of a key result's metric taken through the quarter, not just at the end. A trend of three points tells you whether movement is real; a single launch-week number can't distinguish a lasting change from a spike that faded.",
    example: "Snapshots of 10 → 60 → 22 look great at week 2 and disappointing at close — the tool marks that a spike that faded, not sustained movement.",
    gotchas: [
      "Adoption isn't launch week: the number the week you ship is almost always the least representative one.",
      "Fewer than two points can't show a trend — the readout says so rather than guessing.",
      "The snapshot value and the close-out actual are separate on purpose; “use latest snapshot” copies one across when they happen to match.",
    ],
    howTo: [
      "Log a snapshot whenever you read the metric — add an optional note like “launch week” for context.",
      "Aim for two or three across the quarter, spaced out.",
      "Read the trend tag next to the sparkline: holding, faded, or not enough points yet.",
    ],
    blogHref: "/product-management/",
    blogLabel: "Product management writing",
  },
  draft: {
    icon: Sprout,
    label: "Drafting next quarter",
    definition:
      "The loop-closing step: the tool writes a draft OKR for next quarter back into OKR Organizer — objective carried over, one key result per entry you include, each baseline pre-filled from what you actually landed. Stage 01 never restarts from a blank page.",
    example: "Landed 31% on first-order completion → next quarter's draft key result reads “from 31 to —”, waiting for you to set the new target in OKR Organizer.",
    gotchas: [
      "Drafting never touches this quarter's committed OKR — it only creates a new, clearly-marked draft entry you accept or edit later.",
      "Re-drafting updates that same draft in place; once you accept it in OKR Organizer, drafting again makes a fresh one instead of overwriting your edits.",
      "By default only solid entries with a logged actual are included — untick or tick any before you draft.",
    ],
    howTo: [
      "Finish logging actuals and confidence for the entries worth continuing.",
      "In the draft panel, confirm which entries carry over.",
      "Draft, then open OKR Organizer to set next quarter's targets and accept it.",
    ],
    blogHref: "/tools/okr-organizer/",
    blogLabel: "OKR Organizer — stage 01",
  },
};

export default function CheckInHelpModal({
  concept,
  onClose,
}: {
  concept: CheckInConcept | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!concept) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [concept, onClose]);

  if (!concept) return null;
  const { icon: ConceptIcon, label, definition, example, gotchas, howTo, blogHref, blogLabel } =
    CONTENT[concept];

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-ink-900/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
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
          <p className="text-caption font-semibold text-muted">How to do it</p>
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
          className="mt-5 block text-caption font-semibold text-accent-700 link-underline"
        >
          {blogLabel} →
        </a>
      </div>
    </div>,
    document.body,
  );
}
