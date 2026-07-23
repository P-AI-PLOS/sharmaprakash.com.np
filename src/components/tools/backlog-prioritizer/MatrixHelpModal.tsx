/**
 * Zone explainer for the Backlog Prioritizer. The four zones and their response
 * modes match the 2021 post exactly (Simple → execute, Complicated → bring in
 * the expert, Complex → probe or kill, Chaotic → stabilize first). Links the
 * three 2021 Agreement-Certainty case posts. Mirrors OstHelpModal's
 * portal / Escape / content structure.
 */
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { AlertTriangle, CheckCircle, Settings, Shuffle, X } from "lucide-react";
import { ZONE_LABEL, type MatrixZone } from "~/utils/backlog-store";

const ZONE_ROWS: Array<{
  zone: MatrixZone;
  icon: typeof CheckCircle;
  agreement: string;
  certainty: string;
  response: string;
}> = [
  {
    zone: "simple",
    icon: CheckCircle,
    agreement: "High",
    certainty: "High",
    response: "Best practice exists — execute, no workshop needed. It ranks straight into the list.",
  },
  {
    zone: "complicated",
    icon: Settings,
    agreement: "One axis high",
    certainty: "the other lagging",
    response: "The answer is knowable but needs expertise the room lacks — bring in the expert, then execute.",
  },
  {
    zone: "complex",
    icon: Shuffle,
    agreement: "Low",
    certainty: "Low",
    response: "No best practice exists — probe–sense–respond, or kill it. Never spec a full solution from here. It won't rank until you decide.",
  },
  {
    zone: "chaotic",
    icon: AlertTriangle,
    agreement: "Extreme low",
    certainty: "extreme low",
    response: "A fire, not a backlog item: stabilize first, analyze after. No probe option — only kill or defer.",
  },
];

const CASE_POSTS: Array<{ href: string; label: string }> = [
  {
    href: "/product-management/agreement-certainty-matrix-backlog-triage-recap-crm/",
    label: "Sorting a CRM backlog by how well it's understood",
  },
  {
    href: "/product-management/agreement-certainty-matrix-flaky-test-detection-shortest/",
    label: "Flaky test detection",
  },
  {
    href: "/product-management/agreement-certainty-matrix-accrual-engine-leave-balance/",
    label: "A leave-balance accrual engine",
  },
  {
    href: "/product-management/agreement-certainty-matrix-certification-feature-course-guru/",
    label: "A certification feature",
  },
];

const ZONE_ICON_TINT: Record<MatrixZone, string> = {
  simple: "bg-accent-100 text-accent-700",
  complicated: "bg-accent-50 text-accent-700",
  complex: "bg-ink-100 text-ink-600",
  chaotic: "bg-ink-200 text-ink-700",
};

export default function MatrixHelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-ink-900/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="The four zones and their response modes"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-ink-200 bg-surface-raised p-6 shadow-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow mb-0.5">Quick reference</p>
            <h3 className="text-h4 text-strong">Four zones, four responses</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="btn btn-ghost btn-sm shrink-0 !px-2">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <p className="mt-4 text-body text-muted">
          You argue about <span className="font-semibold text-strong">placement</span> — the zone falls out of the axes.
          Flat ranking hides disagreement; the matrix forces the Complex and Chaotic items into an explicit conversation.
        </p>

        <ul className="mt-5 grid gap-3">
          {ZONE_ROWS.map(({ zone, icon: Icon, agreement, certainty, response }) => (
            <li key={zone} className="rounded-lg border border-ink-200 bg-surface-base p-3">
              <div className="flex items-center gap-2">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${ZONE_ICON_TINT[zone]}`}>
                  <Icon size={16} strokeWidth={2} />
                </span>
                <div>
                  <p className="text-body font-semibold text-strong">{ZONE_LABEL[zone]}</p>
                  <p className="text-[11px] text-faint">
                    Agreement: {agreement} · Certainty: {certainty}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-caption text-muted">{response}</p>
            </li>
          ))}
        </ul>

        <div className="mt-5">
          <p className="text-caption font-semibold text-muted">The method, worked through four backlogs</p>
          <ul className="mt-2 grid gap-1.5">
            {CASE_POSTS.map((post) => (
              <li key={post.href}>
                <a
                  href={post.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-caption font-semibold text-accent-700 link-underline"
                >
                  {post.label} →
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
}
