/**
 * Per-concept quick-reference modal — one for outcome, one for opportunity,
 * one for solution. Triggered from the editor panel (not the diagram) next
 * to wherever that concept is actually authored.
 */
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { Flag, Compass, Lightbulb, X, type LucideIcon } from "lucide-react";

export type OstConcept = "outcome" | "opportunity" | "solution";

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

const CONTENT: Record<OstConcept, ConceptContent> = {
  outcome: {
    icon: Flag,
    label: "Outcome",
    definition:
      "One measurable change in customer behavior your product can plausibly influence — a behavior, not a feature list or a revenue number. A team measured on it should be able to see its own effect.",
    example: "“Increase the share of active workspaces that send a follow-up within 24 hours of a meeting.”",
    gotchas: [
      "A business outcome (revenue, NPS) sits too far from what your team controls — you need a product outcome between the business goal and any single feature.",
      "If the metric could move without anyone touching the product, it isn't tight enough.",
      "Writing a feature as your outcome (\"ship the importer\") is a solution wearing an outcome's clothes.",
    ],
    howTo: [
      "Start from the business outcome, then ask: what customer behavior, if it changed, would plausibly drive that?",
      "Phrase it as a behavior change within the product (\"increase the share of X that do Y\"), not a survey score or dollar figure.",
      "Sanity-check it: could your team see this number move from things they actually build?",
    ],
    blogHref: "/product-management/opportunity-solution-trees-the-shape-of-good-discovery/",
    blogLabel: "The tree: outcomes, opportunities, solutions",
  },
  opportunity: {
    icon: Compass,
    label: "Opportunity",
    definition:
      "A need, pain, or desire that lives in the customer's world, captured in their own words. It would exist even if your product didn't. The tell: could a customer have said this to a friend at dinner?",
    example: "“Half my follow-ups slip because I write them on sticky notes after calls.”",
    gotchas: [
      "The most common trap: writing a solution and calling it an opportunity (\"users need a reminder feature\" is a solution in an opportunity's clothes).",
      "An opportunity phrased in your product's vocabulary, not the customer's, is a red flag.",
      "Brainstorming opportunities in a conference room defeats the point — they come from interviews.",
    ],
    howTo: [
      "Pull directly from interview transcripts — needs, pain points, and desires, ideally as quotes.",
      "Use the dinner-table test: could a customer have said this to a friend? If yes, it's an opportunity.",
      "Arrange parent-to-child: big fuzzy needs break down into specific, addressable ones.",
    ],
    blogHref: "/product-management/finding-opportunities-interviews-jtbd-and-the-opportunity-space/",
    blogLabel: "Finding opportunities: interviews & JTBD",
  },
  solution: {
    icon: Lightbulb,
    label: "Solution",
    definition:
      "An idea that addresses one specific opportunity — it lives in the product's world and names a mechanism. Delete the product and the solution evaporates; the opportunity remains.",
    example: "“Auto-draft a follow-up email as soon as a meeting recording is processed.”",
    gotchas: [
      "Your first idea is almost always a category cliché — it's what every competitor already ships, not a real differentiator.",
      "One solution per opportunity turns the decision into a yes/no vote; you need real alternatives to force honest comparison.",
      "A solution that doesn't trace to a specific opportunity is a pet project, however shiny.",
    ],
    howTo: [
      "Generate solo first: a quota of 15 ideas in 20 minutes, spanning at least four different mechanisms (automate, remind, inform, simplify…).",
      "Converge as a group with a structured method (e.g. 1-2-4-All), not open brainstorming, which anchors on the first idea spoken.",
      "Aim for at least three genuinely different solutions per target opportunity before you test any of them.",
    ],
    blogHref: "/product-management/from-opportunities-to-solutions-ideating-alone-and-together/",
    blogLabel: "From opportunities to solutions: ideating alone and together",
  },
};

export default function OstHelpModal({ concept, onClose }: { concept: OstConcept | null; onClose: () => void }) {
  useEffect(() => {
    if (!concept) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [concept, onClose]);

  if (!concept) return null;
  const { icon: ConceptIcon, label, definition, example, gotchas, howTo, blogHref, blogLabel } = CONTENT[concept];

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-ink-900/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`How to define a ${label.toLowerCase()}`}
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

        <a href={blogHref} className="mt-5 block text-caption font-semibold text-accent-700 link-underline">
          Read the full module — {blogLabel} →
        </a>
      </div>
    </div>,
    document.body,
  );
}
