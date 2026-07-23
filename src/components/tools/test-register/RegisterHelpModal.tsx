/**
 * Operational quick reference — the four statuses and the actions that move
 * between them, plus the "refresh after editing specs" note (staleness is
 * derived on load, not watched live across tabs).
 *
 * Deliberately thin: the *method* content lives on the page, where it's
 * crawlable and linkable. Same portal/escape/overlay shape as OstHelpModal.
 */
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { Bot, CircleDashed, ClipboardCheck, RefreshCw, ShieldCheck, TriangleAlert, Unlink, X } from "lucide-react";

const STATUSES = [
  {
    Icon: CircleDashed,
    label: "Not automated",
    body: "The scenario is written down and anchored to a criterion or story, but no spec file runs it yet. This is a legitimate resting state — a named gap beats an unnamed one.",
  },
  {
    Icon: Bot,
    label: "AI-drafted",
    body: "A spec file exists and was generated (or largely generated) by a model. It runs; nobody has vouched for what it asserts.",
  },
  {
    Icon: ShieldCheck,
    label: "Human-reviewed",
    body: "Someone read the generated test against the criterion and agreed it verifies the right thing. This is the only status that means the coverage is real.",
  },
  {
    Icon: TriangleAlert,
    label: "Stale",
    body: "A linked criterion or story changed — or was deleted — after this scenario was written. Derived on every load, never stored, and it overrides whatever status the record holds.",
  },
];

const ACTIONS = [
  {
    Icon: RefreshCw,
    label: "Mark regenerated",
    body: "After you've regenerated the spec from the current wording: re-baselines the changed links to today's text and sets the status to AI-drafted — even if it was human-reviewed. A regenerated test is unreviewed by definition.",
  },
  {
    Icon: ShieldCheck,
    label: "Mark reviewed",
    body: "Promotes an AI-drafted scenario to human-reviewed. Unavailable while the scenario is stale: reviewing a test whose spec has already moved is false comfort.",
  },
  {
    Icon: Unlink,
    label: "Unlink",
    body: "For sources that were deleted — there's no current text to re-baseline against. A scenario can't be left with zero links; link something else or delete it.",
  },
];

export default function RegisterHelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
        aria-label="Statuses and actions"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-ink-200 bg-surface-raised p-6 shadow-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
              <ClipboardCheck size={20} strokeWidth={2} />
            </span>
            <div>
              <p className="eyebrow mb-0.5">Quick reference</p>
              <h3 className="text-h4 text-strong">Statuses and actions</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="btn btn-ghost btn-sm shrink-0 !px-2">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="mt-5">
          <p className="text-caption font-semibold text-muted">The four statuses</p>
          <ul className="mt-2 grid gap-2">
            {STATUSES.map(({ Icon, label, body }) => (
              <li key={label} className="rounded-md border border-ink-200 bg-surface-base p-3">
                <p className="flex items-center gap-1.5 text-body font-semibold text-strong">
                  <Icon size={15} strokeWidth={2} className="shrink-0 text-accent-700" />
                  {label}
                </p>
                <p className="mt-1 text-caption text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <p className="text-caption font-semibold text-muted">Actions</p>
          <ul className="mt-2 grid gap-2">
            {ACTIONS.map(({ Icon, label, body }) => (
              <li key={label} className="rounded-md border border-ink-200 bg-surface-base p-3">
                <p className="flex items-center gap-1.5 text-body font-semibold text-strong">
                  <Icon size={15} strokeWidth={2} className="shrink-0 text-accent-700" />
                  {label}
                </p>
                <p className="mt-1 text-caption text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-5 rounded-md border border-ink-200 bg-surface-base p-3 text-caption text-muted">
          Staleness is worked out when the register loads. If you edit a spec in another tab, reload
          this page to see the flags catch up.
        </p>
      </div>
    </div>,
    document.body,
  );
}
