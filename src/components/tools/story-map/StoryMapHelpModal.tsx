/**
 * Help modal for the User Story Map builder.
 * Explains the story-mapping concept: user activities → user tasks → releases.
 * Mirrors OstHelpModal's portal/Escape/content structure.
 */
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Layers, X } from "lucide-react";

export default function StoryMapHelpModal({ show, onClose }: { show: boolean; onClose: () => void }) {
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
        aria-label="Story Map Help"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-ink-200 bg-surface-raised p-6 shadow-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
              <Layers size={20} strokeWidth={2} />
            </span>
            <div>
              <p className="eyebrow mb-0.5">How it works</p>
              <h3 className="text-h4 text-strong">User Story Mapping</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="btn btn-ghost btn-sm shrink-0 !px-2">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <p className="text-caption font-semibold text-muted">The problem</p>
            <p className="mt-1 text-body text-strong">
              Flat backlogs hide what matters. Without a map, you can't see which stories serve which user goal,
              and "MVP" becomes a guessing game.
            </p>
          </div>

          <div>
            <p className="text-caption font-semibold text-muted">The structure</p>
            <ul className="mt-2 grid gap-2">
              <li className="rounded-md border border-ink-200 bg-surface-base p-3">
                <p className="text-body font-semibold text-strong">Backbone (top)</p>
                <p className="mt-1 text-caption text-muted">
                  User activities in order — what the user does, end-to-end. E.g. "Find a product", "Add to cart", "Check out."
                </p>
              </li>
              <li className="rounded-md border border-ink-200 bg-surface-base p-3">
                <p className="text-body font-semibold text-strong">Tasks (below backbone)</p>
                <p className="mt-1 text-caption text-muted">
                  Breaking each activity into smaller user tasks. These become the columns under each activity.
                </p>
              </li>
              <li className="rounded-md border border-ink-200 bg-surface-base p-3">
                <p className="text-body font-semibold text-strong">Stories (below tasks)</p>
                <p className="mt-1 text-caption text-muted">
                  The actual user stories, grouped by task, written in your language. This is where detail lives.
                </p>
              </li>
              <li className="rounded-md border border-ink-200 bg-surface-base p-3">
                <p className="text-body font-semibold text-strong">Releases (horizontal slices)</p>
                <p className="mt-1 text-caption text-muted">
                  Draw horizontal lines across the map to define what goes into each release. MVP is the top slice.
                </p>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-caption font-semibold text-muted">The discipline</p>
            <p className="mt-1 text-body text-strong">
              Walk through the user's journey left to right. Fill in tasks top to bottom (most important at top).
              Then slice horizontally for releases. The map gives your backlog a shape — and that shape is your roadmap.
            </p>
          </div>

          <div>
            <p className="text-caption font-semibold text-muted">Why it matters</p>
            <p className="mt-1 text-body text-strong">
              Jeff Patton's insight: backlog lists are shopping lists. Maps are blueprints. A map tells you
              what you're building, for whom, and in what order — all in one view.
            </p>
          </div>

          <a
            href="/product-management/user-story-mapping-fixing-the-flat-backlog/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-caption font-semibold text-accent-700 link-underline"
          >
            Read the full framework — User Story Mapping →
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}
