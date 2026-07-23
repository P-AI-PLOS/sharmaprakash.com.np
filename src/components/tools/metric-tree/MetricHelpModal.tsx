/**
 * Help modal for the North Star Metric Tree builder.
 * Explains the tree structure and orphan/contested annotation.
 * Mirrors OstHelpModal's portal/Escape/content structure.
 */
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { TreePine, X } from "lucide-react";

export default function MetricHelpModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!show || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-ink-900/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Metric Tree Help"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-ink-200 bg-surface-raised p-6 shadow-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
              <TreePine size={20} strokeWidth={2} />
            </span>
            <div>
              <p className="eyebrow mb-0.5">How it works</p>
              <h3 className="text-h4 text-strong">North Star Metric Tree</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="btn btn-ghost btn-sm shrink-0 !px-2">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <p className="text-caption font-semibold text-muted">The structure</p>
            <ul className="mt-2 grid gap-2">
              <li className="rounded-md border border-ink-200 bg-surface-base p-3">
                <p className="text-body font-semibold text-strong">Root (top)</p>
                <p className="mt-1 text-caption text-muted">
                  Your North Star metric — the single number that best captures the product's value delivery.
                </p>
              </li>
              <li className="rounded-md border border-ink-200 bg-surface-base p-3">
                <p className="text-body font-semibold text-strong">Input metrics (middle)</p>
                <p className="mt-1 text-caption text-muted">
                  Metrics that drive the North Star. Each can be broken down further — keep decomposing until the metric is team-ownable.
                </p>
              </li>
              <li className="rounded-md border border-ink-200 bg-surface-base p-3">
                <p className="text-body font-semibold text-strong">Leaves (bottom)</p>
                <p className="mt-1 text-caption text-muted">
                  The most granular metrics — where a single team can take action. This is where ownership matters most.
                </p>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-caption font-semibold text-muted">Annotations</p>
            <ul className="mt-2 grid gap-2">
              <li className="rounded-md border border-ink-200 bg-surface-base p-3">
                <p className="text-body font-semibold text-strong">🕳️ Orphan</p>
                <p className="mt-1 text-caption text-muted">
                  No team owns this metric. It falls through the cracks — nobody's responsible for moving it.
                </p>
              </li>
              <li className="rounded-md border border-ink-200 bg-surface-base p-3">
                <p className="text-body font-semibold text-strong">⚔️ Contested</p>
                <p className="mt-1 text-caption text-muted">
                  More than one team claims this metric. This creates confusion about who's actually responsible.
                </p>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-caption font-semibold text-muted">When to stop</p>
            <p className="mt-1 text-body text-strong">
              Keep decomposing until each leaf metric is owned by a single team. If a metric can't be owned by one team, it probably needs further decomposition.
            </p>
          </div>

          <a
            href="/product-management/north-star-metrics-and-metric-trees/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-caption font-semibold text-accent-700 link-underline"
          >
            Read the full framework — North Star Metrics and Metric Trees →
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}
