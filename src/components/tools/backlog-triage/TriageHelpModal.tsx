/**
 * Per-bucket quick-reference modal for the Backlog Triage Board.
 * Explains Now, Next, and Never in the post's own terms.
 * Mirrors OstHelpModal's portal/Escape/content structure.
 */
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Clock, ListTodo, Ban, X, type LucideIcon } from "lucide-react";

export type TriageConcept = "now" | "next" | "never";

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

const CONTENT: Record<TriageConcept, ConceptContent> = {
  now: {
    icon: Clock,
    label: "Now",
    definition:
      "Committed this cycle, with a named owner. If it's in Now, someone is responsible for it and it's happening — not \"we'd like to,\" but \"we are.\"",
    example:
      "The payment integration that blocks the Q3 launch. It has a named engineer, a deadline, and the team has agreed it's the priority.",
    gotchas: [
      "Putting something in Now because it's urgent-feeling, not because the team actually committed to it — urgency without commitment is just noise.",
      "Having more items in Now than the team can realistically deliver — Now is a commitment, not a wish list.",
      "Forgetting to name an owner — \"we'll figure it out\" is not a commitment, it's a hope.",
    ],
    howTo: [
      "Ask: has the team explicitly said \"we are doing this this cycle\"? If not, it's not Now.",
      "Name the owner — one person, not a team. If nobody claims it, it's not committed.",
      "If the list feels too long, something needs to move to Next or be cut entirely.",
    ],
    blogHref: "/product-management/backlog-cleanup-how-to-actually-do-it/",
    blogLabel: "Backlog cleanup: how to actually do it",
  },
  next: {
    icon: ListTodo,
    label: "Next",
    definition:
      "A short queue within a quarter — size-limited by definition. Next is not \"later\" or \"someday,\" it's \"we'll get to this soon, but not this cycle.\"",
    example:
      "The dashboard redesign that's been validated but isn't as urgent as the payment integration. It's in the queue for next quarter.",
    gotchas: [
      "Treating Next as a parking lot — if items pile up without a review cadence, Next becomes a graveyard.",
      "Putting more than a handful of items in Next — the post's point is that Next has a size limit by definition.",
      "Not reviewing Next regularly — the queue should shrink as items move to Now or get cut.",
    ],
    howTo: [
      "Keep it short — a handful of items, not a second backlog. If it's longer than the team can tackle in a quarter, it's too long.",
      "Review it regularly — weekly or biweekly, move things up or cut them.",
      "Size-limit yourself: if you're adding something, ask what's leaving to make room.",
    ],
    blogHref: "/product-management/backlog-cleanup-how-to-actually-do-it/",
    blogLabel: "Backlog cleanup: how to actually do it",
  },
  never: {
    icon: Ban,
    label: "Never",
    definition:
      "Said out loud, closed with a reason. Never is not \"not now\" — it's a deliberate decision that this isn't happening, documented so nobody re-opens it six months later.",
    example:
      "The mobile app that was always on the roadmap but never had the team or the market to justify it. Closed with: \"serves a segment we've deprioritized.\"",
    gotchas: [
      "Closing something as Never without a reason — the next person who asks \"why didn't we do this?\" needs an answer.",
      "Putting things in Never that are actually Next — if you might do it, it's not Never.",
      "Being afraid to use Never — the post's whole point is that saying no clearly is more respectful than letting things silently rot.",
    ],
    howTo: [
      "Write the reason — it doesn't have to be long, but it has to exist. \"Closed for age\" or \"serves a deprioritized segment\" is enough.",
      "Say it out loud in a meeting — Never is a decision, not a quiet deletion.",
      "If you hesitate, that's a sign it might be Next instead of Never.",
    ],
    blogHref: "/product-management/backlog-cleanup-how-to-actually-do-it/",
    blogLabel: "Backlog cleanup: how to actually do it",
  },
};

export default function TriageHelpModal({
  concept,
  onClose,
}: {
  concept: TriageConcept | null;
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
        aria-label={`How to triage into: ${label.toLowerCase()}`}
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
