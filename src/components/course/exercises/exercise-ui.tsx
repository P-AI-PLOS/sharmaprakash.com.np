/**
 * Shared chrome for interactive course exercises. Every exercise island wraps
 * itself in <ExerciseShell> so the widgets read as one system inside prose.
 */
import type { ReactNode } from "react";

export function ExerciseShell({
  kicker,
  title,
  instructions,
  children,
}: {
  kicker?: string;
  title: string;
  instructions: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="not-prose my-10 rounded-xl border border-ink-200 bg-surface-raised p-5 lg:p-7 shadow-md"
    >
      <p className="eyebrow mb-1">{kicker ?? "Try it"}</p>
      <h3 className="text-h4 text-strong">{title}</h3>
      <p className="mt-2 text-body text-muted">{instructions}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ChoiceButton({
  label,
  onClick,
  selected = false,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`rounded-md border px-3 py-1.5 text-caption font-semibold transition-colors ${
        selected
          ? "border-accent-600 bg-accent-50 text-accent-700"
          : "border-ink-200 bg-surface-base text-muted hover:border-accent-600 hover:text-accent-700"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {label}
    </button>
  );
}

export function Feedback({
  correct,
  children,
}: {
  correct: boolean;
  children: ReactNode;
}) {
  return (
    <p
      role="status"
      className={`mt-3 rounded-md border px-4 py-3 text-body ${
        correct
          ? "border-accent-600 bg-accent-50 text-strong"
          : "border-ink-200 bg-surface-base text-strong"
      }`}
    >
      <span className="mr-1.5 font-semibold">{correct ? "Right." : "Not quite."}</span>
      {children}
    </p>
  );
}

export function ScoreBar({
  answered,
  total,
  correct,
  onReset,
}: {
  answered: number;
  total: number;
  correct: number;
  onReset: () => void;
}) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink-200 pt-4">
      <p className="text-caption text-muted">
        {answered} of {total} answered · <span className="font-semibold text-strong">{correct} correct</span>
      </p>
      {answered > 0 && (
        <button type="button" onClick={onReset} className="text-caption font-semibold text-accent-700 link-underline">
          Start over
        </button>
      )}
    </div>
  );
}
