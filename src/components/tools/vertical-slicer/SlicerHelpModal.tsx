/**
 * "What's a vertical slice?" concepts modal — vertical vs horizontal, the three
 * slicing patterns, and why each shippability check matters, all against the
 * Donut CRM running example. Same portal/escape/overlay shape as OstHelpModal.
 */
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { Layers, Scissors, X } from "lucide-react";

const PATTERNS = [
  {
    label: "Workflow steps",
    body: "Slice along the path a user walks through the feature. The first slice is the happy path, end to end.",
    donut: "Order one plain donut and pay by card → then add quantities → then add substitutions.",
  },
  {
    label: "Business rules",
    body: "Slice by the rules the feature has to honour, one rule per slice, starting with the simplest.",
    donut: "Flat delivery fee first → then free over $20 → then surge pricing on holidays.",
  },
  {
    label: "Data variations",
    body: "Slice by the kinds of data the feature handles, one variation per slice.",
    donut: "One donut type first → then boxes and dozens → then custom-decorated orders.",
  },
];

const CHECKS = [
  {
    label: "Delivers end-to-end value on its own",
    why: "If shipping the slice alone gives a user nothing they can use, it's a layer (a schema, an API, a screen) — not a slice.",
    counter: "“Build the orders database table” passes no user value on its own.",
  },
  {
    label: "A user could see/demo it working",
    why: "A slice you can demo forces the whole stack to exist for one thin path — that's what makes it real, not planned.",
    counter: "“Wire up the payment gateway” has nothing to show until an order flows through it.",
  },
  {
    label: "Doesn't need a later slice to function",
    why: "If a slice only works once a future slice lands, you've split by layer and pushed the value to the end.",
    counter: "“Validate the cart” needs a cart and a checkout that don't exist yet.",
  },
];

export default function SlicerHelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
        aria-label="What's a vertical slice?"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-ink-200 bg-surface-raised p-6 shadow-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
              <Scissors size={20} strokeWidth={2} />
            </span>
            <div>
              <p className="eyebrow mb-0.5">Quick reference</p>
              <h3 className="text-h4 text-strong">What's a vertical slice?</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="btn btn-ghost btn-sm shrink-0 !px-2">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <p className="mt-4 text-body text-strong">
          A <strong>vertical slice</strong> cuts through every layer — UI, logic, data — so one thin path works end
          to end and a user gets real value. A <strong>horizontal layer</strong> (“build the database”,
          “wire the API”) ships nothing usable until every other layer lands too.
        </p>
        <p className="mt-2 flex items-start gap-2 rounded-md border border-ink-200 bg-surface-base p-3 text-caption text-muted">
          <Layers size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-accent-700" />
          <span>
            Donut CRM: “Let a customer order a donut” slices vertically into “order one plain donut, pay
            by card” — a working sale. It slices horizontally into “build the menu table / build the payment
            service / build the cart UI” — three months before anyone can buy anything.
          </span>
        </p>

        <div className="mt-5">
          <p className="text-caption font-semibold text-muted">Three ways to slice</p>
          <ul className="mt-2 grid gap-2">
            {PATTERNS.map((p) => (
              <li key={p.label} className="rounded-md border border-ink-200 bg-surface-base p-3">
                <p className="text-body font-semibold text-strong">{p.label}</p>
                <p className="mt-1 text-caption text-muted">{p.body}</p>
                <p className="mt-1 text-caption italic text-faint">{p.donut}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <p className="text-caption font-semibold text-muted">Why each check matters</p>
          <ul className="mt-2 grid gap-2">
            {CHECKS.map((c) => (
              <li key={c.label} className="flex gap-2 rounded-md border border-ink-200 bg-surface-base p-3 text-body text-muted">
                <span aria-hidden="true">⚠️</span>
                <span>
                  <span className="font-semibold text-strong">{c.label}.</span> {c.why}{" "}
                  <span className="italic text-faint">{c.counter}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <a
          href="/product-management/user-story-mapping-fixing-the-flat-backlog/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 block text-caption font-semibold text-accent-700 link-underline"
        >
          Read the full module — slicing the flat backlog →
        </a>
      </div>
    </div>,
    document.body,
  );
}
