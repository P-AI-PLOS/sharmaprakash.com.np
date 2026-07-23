/**
 * Per-concept quick-reference modal for the PR/FAQ Builder.
 * Explains why customer language matters, why a quote, and why each
 * of the five seeded FAQ questions is worth dreading.
 * Mirrors OstHelpModal's portal/Escape/content structure.
 */
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { FileText, MessageCircle, X, type LucideIcon } from "lucide-react";

export type PrFaqConcept =
  | "headline"
  | "customer-language"
  | "customer-quote"
  | "faq-pricing"
  | "faq-switching"
  | "faq-cannibalization"
  | "faq-hardest-problem"
  | "faq-why-us";

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

const CONTENT: Record<PrFaqConcept, ConceptContent> = {
  headline: {
    icon: FileText,
    label: "Headline",
    definition:
      "The headline of your press release — written for the customer, not for your internal team. It should read like something a journalist would write about your product's launch.",
    example: '"Introducing Acme Sync: Never Lose a Meeting Follow-Up Again"',
    gotchas: [
      `Writing a headline about your technology ("Acme's New AI-Powered Engine") instead of the customer's outcome.`,
      "Making it too clever or too vague — if a customer can't tell what the product does from the headline, it's not doing its job.",
    ],
    howTo: [
      "Write the headline last, after you've filled in the problem and solution.",
      "Test it: would a customer care about this if they saw it in a newsletter?",
      "Keep it under ten words — press release headlines are short for a reason.",
    ],
    blogHref: "/product-management/working-backwards-the-pr-faq-and-the-discipline-of-narrative/",
    blogLabel: "Working backwards: the PR/FAQ",
  },
  "customer-language": {
    icon: MessageCircle,
    label: "Customer language",
    definition:
      `Write the problem and solution in the words your customers actually use, not your internal jargon. If your customers say "I keep losing track of follow-ups," don't write "post-meeting action-item tracking gap."`,
    example:
      `"Half my follow-ups slip because I write them on sticky notes after calls." — this is customer language. "Leveraging automated task extraction" is not.`,
    gotchas: [
      "The most common trap: writing the problem in your product's vocabulary instead of the customer's.",
      "Internal stakeholders will push back because customer language feels imprecise — that's the point.",
      "Brainstorming opportunities in a conference room defeats the point — customer language comes from interviews.",
    ],
    howTo: [
      "Pull directly from interview transcripts — needs, pain points, and desires, ideally as quotes.",
      "Use the dinner-table test: could a customer have said this to a friend? If yes, it's good language.",
      "When in doubt, use the exact words from a customer interview verbatim.",
    ],
    blogHref: "/product-management/working-backwards-the-pr-faq-and-the-discipline-of-narrative/",
    blogLabel: "Working backwards: the PR/FAQ",
  },
  "customer-quote": {
    icon: MessageCircle,
    label: "Customer quote",
    definition:
      "A hypothetical quote from a customer who loves the product. It forces you to imagine the emotional reaction, not just the feature list — and it reveals whether you actually understand the value.",
    example:
      '"I used to spend twenty minutes after every call writing up what we decided. Now I just hit record and the summary is in my inbox before the meeting ends."',
    gotchas: [
      "Writing a quote that sounds like marketing copy instead of something a real person would say.",
      "Making the quote about the product's features instead of the customer's experience.",
      "Skipping the quote because it feels fake — it's supposed to be hypothetical, that's the point.",
    ],
    howTo: [
      "Write the quote from the perspective of a specific customer you've interviewed.",
      "Focus on the emotional shift: what changed for them, not what the product does.",
      "Read it out loud — if it sounds like a brochure, rewrite it in plainer language.",
    ],
    blogHref: "/product-management/working-backwards-the-pr-faq-and-the-discipline-of-narrative/",
    blogLabel: "Working backwards: the PR/FAQ",
  },
  "faq-pricing": {
    icon: FileText,
    label: "Pricing question",
    definition:
      "The question you hope nobody asks: what does it cost and what will customers pay? If you can't answer this honestly in the PR/FAQ, you haven't thought through the business model.",
    example:
      `"How much does this cost?" — the question every stakeholder will ask, the question most teams dodge until launch day.`,
    gotchas: [
      `Dodging the question with "we'll figure out pricing later" — the PR/FAQ is the cheapest place to confront it.`,
      "Pricing based on what you want to charge instead of what the value is worth to the customer.",
    ],
    howTo: [
      "Write the price you think is right, then write the price that would make you uncomfortable.",
      "If you can't articulate why a customer would pay that amount, the price is wrong or the value prop is weak.",
      "Reference comparable products — not as a ceiling, but as a signal of what the market expects.",
    ],
    blogHref: "/product-management/working-backwards-the-pr-faq-and-the-discipline-of-narrative/",
    blogLabel: "Working backwards: the PR/FAQ",
  },
  "faq-switching": {
    icon: FileText,
    label: "Switching question",
    definition:
      `The question you hope nobody asks: why will people switch from what they do today? If the answer is "because our product is better," you haven't actually thought about the switching cost.`,
    example:
      `"Our current process is broken but it works" — the reality most teams face. The switching cost is real, even when the current solution is terrible.`,
    gotchas: [
      "Assuming people will switch because your product is better — better isn't enough when the current solution is free and familiar.",
      "Ignoring the migration cost: data, training, workflow changes, habit.",
    ],
    howTo: [
      "Name the specific current solution (even if it's spreadsheets or sticky notes).",
      "Quantify the switching cost if you can: time, money, risk, effort.",
      "Identify the trigger — what moment makes the switching cost worth paying?",
    ],
    blogHref: "/product-management/working-backwards-the-pr-faq-and-the-discipline-of-narrative/",
    blogLabel: "Working backwards: the PR/FAQ",
  },
  "faq-cannibalization": {
    icon: FileText,
    label: "Cannibalization question",
    definition:
      "The question you hope nobody asks: which existing product does this cannibalize? If your new feature replaces part of your current offering, that's a revenue question, not a product question.",
    example:
      '"If we build this, will customers cancel the existing plan?" — the question that kills features in roadmaps, and the one most teams avoid thinking about until it\'s too late.',
    gotchas: [
      "Denying cannibalization exists because it's uncomfortable — it's better to confront it in the PR/FAQ than in the quarterly review.",
      "Building a feature that cannibalizes your highest-margin product without a plan for the revenue gap.",
    ],
    howTo: [
      "List every existing product or feature this could overlap with.",
      "For each overlap, ask: does this make the existing product more valuable, or less?",
      "If it's less, write the mitigation in the PR/FAQ — don't wait for someone to ask in a board meeting.",
    ],
    blogHref: "/product-management/working-backwards-the-pr-faq-and-the-discipline-of-narrative/",
    blogLabel: "Working backwards: the PR/FAQ",
  },
  "faq-hardest-problem": {
    icon: FileText,
    label: "Hardest technical problem",
    definition:
      "The question you hope nobody asks: what's the hardest technical problem, and what if it doesn't yield? If the answer is \"we don't know yet,\" that's honest — but it means the PR/FAQ should flag it as a risk, not hide it.",
    example:
      `"The real-time sync engine might not work at scale" — the kind of thing that's obvious in hindsight but gets buried in the excitement of a new feature.`,
    gotchas: [
      "Hand-waving away the hard problem because you're confident it'll work out — confidence isn't evidence.",
      "Not writing down what happens if the hard problem doesn't yield — what's the fallback?",
    ],
    howTo: [
      "Name the hardest technical risk honestly.",
      "Write what you'll do if it doesn't work — the fallback plan, the MVP without it, the timeline extension.",
      "If you can spike it (time-boxed prototype), do that before committing to the full build.",
    ],
    blogHref: "/product-management/working-backwards-the-pr-faq-and-the-discipline-of-narrative/",
    blogLabel: "Working backwards: the PR/FAQ",
  },
  "faq-why-us": {
    icon: FileText,
    label: "Why us question",
    definition:
      "The question you hope nobody asks: why us? If a competitor could build this just as easily, the PR/FAQ should explain what makes your team uniquely positioned — or admit that it's execution speed, not a moat.",
    example:
      `"Anyone could build this" — the honest answer most teams don't want to give. Sometimes the advantage is speed, not a moat, and that's fine if you say it out loud.`,
    gotchas: [
      `Claiming a moat that doesn't exist — "our proprietary algorithm" when it's three API calls.`,
      "Not answering the question at all, hoping nobody notices.",
    ],
    howTo: [
      "List your actual advantages: team expertise, existing distribution, data, relationships, timing.",
      `If the answer is "speed to market," say that — it's a valid advantage if you're honest about it.`,
      "Ask: if a well-funded competitor decided to build this tomorrow, what would they have to replicate?",
    ],
    blogHref: "/product-management/working-backwards-the-pr-faq-and-the-discipline-of-narrative/",
    blogLabel: "Working backwards: the PR/FAQ",
  },
};

export default function PrFaqHelpModal({
  concept,
  onClose,
}: {
  concept: PrFaqConcept | null;
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
        aria-label={`How to approach: ${label.toLowerCase()}`}
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
