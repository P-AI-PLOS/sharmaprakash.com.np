/**
 * The single source of truth for the register's four displayed states.
 *
 * Three are stored on the record (`not-automated` / `ai-drafted` /
 * `human-reviewed`); the fourth, `stale`, is derived on every load and
 * overrides whatever is stored — wherever a status appears, a drifted
 * scenario reads as stale and nothing else.
 *
 * Styling is token-only. Stale borrows the site's amber accent ramp (the
 * warning-adjacent tokens the design law already provides) so no new token —
 * and no `design.md` change — is needed for it.
 */
import { Bot, CircleDashed, ShieldCheck, TriangleAlert } from "lucide-react";
import type { DisplayStatus } from "~/utils/test-register-store";

const STYLES: Record<DisplayStatus, { label: string; className: string }> = {
  "not-automated": {
    label: "Not automated",
    className: "border-ink-200 bg-surface-base text-muted",
  },
  "ai-drafted": {
    label: "AI-drafted",
    className: "border-ink-300 bg-surface-base text-strong",
  },
  "human-reviewed": {
    label: "Human-reviewed",
    className: "border-accent-600 bg-surface-base text-accent-700",
  },
  stale: {
    label: "stale — spec may need AI regeneration",
    className: "border-accent-600 bg-accent-50 text-accent-800",
  },
};

const ICONS: Record<DisplayStatus, typeof Bot> = {
  "not-automated": CircleDashed,
  "ai-drafted": Bot,
  "human-reviewed": ShieldCheck,
  stale: TriangleAlert,
};

export default function StatusBadge({ status }: { status: DisplayStatus }) {
  const { label, className } = STYLES[status];
  const Icon = ICONS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-caption font-semibold ${className}`}
    >
      <Icon size={13} strokeWidth={2} className="shrink-0" />
      {label}
    </span>
  );
}

/** Label without the badge chrome — for selects, captions and coverage copy. */
export const statusLabel = (status: DisplayStatus): string => STYLES[status].label;
