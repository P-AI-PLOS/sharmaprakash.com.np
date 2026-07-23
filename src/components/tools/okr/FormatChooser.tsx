/**
 * The framing moment before the first OKR: is an OKR even the right shape for
 * what you're about to write? Shown on first run above the form, dismissible,
 * never a gate — the form renders below it from the start.
 */
import { Compass, Flag, Target, X } from "lucide-react";

interface Format {
  icon: typeof Target;
  name: string;
  what: string;
  chooseWhen: string;
}

const FORMATS: Format[] = [
  {
    icon: Target,
    name: "OKR",
    what: "A qualitative objective plus key results that measure a change in someone's behaviour.",
    chooseWhen:
      "Choose this when you know which customer behaviour needs to shift, but not yet what you'll build to shift it.",
  },
  {
    icon: Flag,
    name: "Rock",
    what: "A must-finish deliverable with a date — a migration, an audit, a contractual commitment.",
    chooseWhen:
      "Choose this when the work is genuinely done or not done. If you can tick it off, it's a Rock, not a key result.",
  },
  {
    icon: Compass,
    name: "North Star metric",
    what: "One always-on number the whole team watches, with no quarterly target attached.",
    chooseWhen:
      "Choose this when you're still finding the strategy and need a compass more than a destination.",
  },
];

export default function FormatChooser({
  onWriteOkr,
  onDismiss,
}: {
  /** Dismiss and move the visitor into the form. */
  onWriteOkr: () => void;
  /** Dismiss only. */
  onDismiss: () => void;
}) {
  return (
    <section
      aria-label="Choosing between an OKR, a Rock, and a North Star metric"
      className="rounded-xl border border-accent-200 bg-accent-50 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">Before you write one</p>
          <h3 className="text-h4 text-strong leading-tight">Do you actually want an OKR here?</h3>
          <p className="mt-2 max-w-2xl text-body text-muted">
            Most things teams file under &ldquo;OKR&rdquo; are one of the other two. Picking the right
            shape now saves a quarter of arguing about whether you hit it.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss the format guidance"
          className="shrink-0 text-faint transition-colors hover:text-accent-700"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {FORMATS.map(({ icon: Icon, name, what, chooseWhen }) => (
          <div key={name} className="rounded-lg border border-ink-200 bg-surface-raised p-4">
            <p className="flex items-center gap-2 text-body font-semibold text-strong">
              <Icon size={16} strokeWidth={2} className="shrink-0 text-accent-700" />
              {name}
            </p>
            <p className="mt-2 text-caption text-muted">{what}</p>
            <p className="mt-2 text-caption text-strong">{chooseWhen}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={onWriteOkr} className="btn btn-primary !py-2">
          Write an OKR
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-caption font-semibold text-muted link-underline"
        >
          Not now — just let me look around
        </button>
      </div>
    </section>
  );
}
