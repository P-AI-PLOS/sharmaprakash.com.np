/**
 * ModePicker — the mode gate. Names the job in one sentence, then offers the
 * three cadences as peer choices (design D3): none pre-selected, and Sprint is
 * deliberately last so the tool doesn't smuggle in "delivery == Scrum". Each
 * card states its rhythm and the reflection loop it implies.
 */
import { GitCommitHorizontal, Repeat, Waypoints } from "lucide-react";
import type { CadenceMode } from "~/utils/cadence-store";

interface ModeCard {
  id: CadenceMode;
  label: string;
  Icon: typeof Waypoints;
  rhythm: string;
  loop: string;
}

// Order is intentional: Flow, Scrumban, Sprint — Sprint is not the default.
const MODE_CARDS: ModeCard[] = [
  {
    id: "flow",
    label: "Flow",
    Icon: Waypoints,
    rhythm: "Continuous — pull the next thing when there's room, cap work in progress.",
    loop: "Reflect on cycle time and WIP breaches whenever they hurt, not on a timer.",
  },
  {
    id: "scrumban",
    label: "Scrumban",
    Icon: Repeat,
    rhythm: "Flow's pull system with a light, regular planning heartbeat to refill the queue.",
    loop: "A short recurring retro plus a per-period check that planning actually happened.",
  },
  {
    id: "sprint",
    label: "Sprint",
    Icon: GitCommitHorizontal,
    rhythm: "Fixed-length iterations — commit to a batch, ship it, repeat.",
    loop: "Compare committed vs completed each iteration; retro at the boundary.",
  },
];

export default function ModePicker({ onChoose }: { onChoose: (mode: CadenceMode) => void }) {
  return (
    <div>
      <p className="text-body text-strong">
        The job: turn a prioritized backlog into shipped work, on a rhythm, with a reflection loop.
        Pick the rhythm that fits how your team actually delivers — you can change it later.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {MODE_CARDS.map(({ id, label, Icon, rhythm, loop }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChoose(id)}
            className="flex flex-col rounded-lg border border-ink-200 bg-surface-base p-4 text-left transition-colors hover:border-accent-600"
          >
            <span className="flex items-center gap-2 text-body font-semibold text-strong">
              <Icon size={16} strokeWidth={2} className="shrink-0 text-accent-700" />
              {label}
            </span>
            <span className="mt-2 text-caption text-muted">{rhythm}</span>
            <span className="mt-2 text-caption italic text-faint">Reflection loop: {loop}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
