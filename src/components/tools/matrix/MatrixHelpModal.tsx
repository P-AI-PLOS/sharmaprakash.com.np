/**
 * Per-zone quick-reference modal for the Agreement-Certainty Matrix.
 * Explains all four Stacey matrix zones.
 * Mirrors OstHelpModal's portal/Escape/content structure.
 */
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { CheckCircle, Settings, Shuffle, AlertTriangle, X, type LucideIcon } from "lucide-react";

export type MatrixZone = "simple" | "complicated" | "complex" | "chaotic";

interface ZoneContent {
  icon: LucideIcon;
  label: string;
  agreement: string;
  certainty: string;
  definition: string;
  example: string;
  gotchas: string[];
  howTo: string[];
  approach: string;
  blogHref: string;
  blogLabel: string;
}

const CONTENT: Record<MatrixZone, ZoneContent> = {
  simple: {
    icon: CheckCircle,
    label: "Simple",
    agreement: "High",
    certainty: "High",
    definition:
      "Everyone agrees on what to do and we know how to do it. Best practice applies — just execute.",
    example: "A UI text fix, a known configuration change, a routine deployment.",
    gotchas: [
      "Don't over-process simple work — a lightweight check is enough, not a committee review.",
      "Simple doesn't mean trivially easy — it means the approach is clear and agreed upon.",
    ],
    howTo: [
      "Just do it. A quick check with the team, then execute.",
      "If it takes less than a day, don't schedule a meeting about it.",
    ],
    approach: "Do it — execute with standard process.",
    blogHref: "/product-management/agreement-certainty-matrix-backlog-triage-recap-crm/",
    blogLabel: "Agreement-Certainty Matrix",
  },
  complicated: {
    icon: Settings,
    label: "Complicated",
    agreement: "High",
    certainty: "Low",
    definition:
      "Everyone agrees on what to do, but the how requires expertise. Analyze, plan, then execute — there's a right answer, but you need to find it.",
    example: "A database migration, a performance optimization, a third-party integration.",
    gotchas: [
      "Don't skip the analysis phase — \"we all agree\" doesn't mean \"we know how.\"",
      "Expertise matters here — involve the people who've done this before.",
    ],
    howTo: [
      "Bring in the experts. Plan the approach before executing.",
      "Write down the plan — complicated work rewards up-front thinking.",
    ],
    approach: "Analyze it — expert assessment, then planned execution.",
    blogHref: "/product-management/agreement-certainty-matrix-backlog-triage-recap-crm/",
    blogLabel: "Agreement-Certainty Matrix",
  },
  complex: {
    icon: Shuffle,
    label: "Complex",
    agreement: "Low",
    certainty: "Low",
    definition:
      "Nobody agrees on what to do and we don't know what will work. Probe, sense, respond — experiment your way to clarity.",
    example: "A new market entry, a platform migration, a team restructure.",
    gotchas: [
      "Resist the urge to plan in detail — you don't know enough yet.",
      "Experiment first, commit later — the approach reveals itself through action.",
    ],
    howTo: [
      "Run small experiments to learn what works before committing to a direction.",
      "Create safety to fail — the learning is the point, not the initial attempt.",
    ],
    approach: "Probe it — experiment, learn, then decide.",
    blogHref: "/product-management/agreement-certainty-matrix-backlog-triage-recap-crm/",
    blogLabel: "Agreement-Certainty Matrix",
  },
  chaotic: {
    icon: AlertTriangle,
    label: "Chaotic",
    agreement: "Low",
    certainty: "Low (urgent)",
    definition:
      "No time to figure out what's going on — act first to establish order, then figure out where things settle.",
    example: "A production outage, a data breach, a critical security vulnerability.",
    gotchas: [
      "Don't mistake panic for action — even in chaos, someone needs to be in charge.",
      "The goal is to move the situation out of chaos, not to stay here.",
    ],
    howTo: [
      "Act decisively to establish order — containment first, understanding second.",
      "Once contained, reassess: which zone does this actually live in now?",
    ],
    approach: "Act first — contain the crisis, then reassess.",
    blogHref: "/product-management/agreement-certainty-matrix-backlog-triage-recap-crm/",
    blogLabel: "Agreement-Certainty Matrix",
  },
};

/** That zone's operating instruction — the reveal text freeform mode shows after a
 *  placement, in place of a correctness verdict (design D5: zone copy lives here once). */
export const zoneApproach = (zone: MatrixZone): string => CONTENT[zone].approach;

/** That zone's agreement/certainty reading — the same values the modal badges
 *  show, so the grid can never drift from the modal. Complex and Chaotic are
 *  BOTH low-agreement and low-certainty: the four zones do not split a strict
 *  2×2 on certainty, which is why the grid labels the certainty split on the
 *  top row only. */
export const zoneAxes = (zone: MatrixZone): { agreement: string; certainty: string } => ({
  agreement: CONTENT[zone].agreement,
  certainty: CONTENT[zone].certainty,
});

export default function MatrixHelpModal({
  zone,
  onClose,
}: {
  zone: MatrixZone | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!zone) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zone, onClose]);

  if (!zone || !mounted) return null;
  const { icon: ZoneIcon, label, agreement, certainty, definition, example, gotchas, howTo, approach, blogHref, blogLabel } =
    CONTENT[zone];

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-ink-900/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Zone: ${label}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-ink-200 bg-surface-raised p-6 shadow-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
              <ZoneIcon size={20} strokeWidth={2} />
            </span>
            <div>
              <p className="eyebrow mb-0.5">Zone</p>
              <h3 className="text-h4 text-strong">{label}</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="btn btn-ghost btn-sm shrink-0 !px-2">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="mt-3 flex gap-3 text-caption">
          <span className="rounded-md bg-ink-100 px-2 py-1">Agreement: {agreement}</span>
          <span className="rounded-md bg-ink-100 px-2 py-1">Certainty: {certainty}</span>
        </div>

        <p className="mt-4 text-body text-strong">{definition}</p>
        <p className="mt-2 text-caption italic text-faint">{example}</p>

        <div className="mt-4 rounded-lg border border-accent-600 bg-accent-50 p-3">
          <p className="text-caption font-semibold text-accent-700">Match approach to zone</p>
          <p className="mt-1 text-body text-strong">{approach}</p>
        </div>

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
