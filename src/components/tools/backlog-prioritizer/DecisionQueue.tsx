/**
 * The "Needs a conversation" queue — Complex and Chaotic items that have no
 * disposition yet. These NEVER silently rank; they stay here until the visitor
 * records an explicit probe / kill / defer call (design.md D3). Chaotic gets the
 * post's treatment verbatim: "stabilize first, analyze after" and no probe
 * option, because a fire is not a backlog item. Killed and Deferred items keep
 * their note (the record of the conversation) in collapsed sections.
 */
import { useState } from "react";
import { AlertTriangle, Shuffle } from "lucide-react";
import { ZONE_LABEL, type Disposition } from "~/utils/backlog-store";
import type { EnrichedItem } from "./types";

interface DecisionQueueProps {
  items: EnrichedItem[];
  onDispose: (id: string, disposition: Disposition, note: string) => void;
  /** Clear a disposition, returning the item to the queue. */
  onReopen: (id: string) => void;
  onRemove: (id: string) => void;
}

const COMPLEX_COPY = "No best practice exists — probe before committing, or kill it. Never spec a full solution from here.";
const CHAOTIC_COPY = "A fire, not a backlog item: stabilize first, analyze after. It can't earn a roadmap slot as-is.";

function QueueCard({
  entry,
  onDispose,
  onRemove,
}: {
  entry: EnrichedItem;
  onDispose: (id: string, disposition: Disposition, note: string) => void;
  onRemove: (id: string) => void;
}) {
  const [note, setNote] = useState("");
  const isChaotic = entry.zone === "chaotic";

  return (
    <div className="rounded-lg border border-ink-200 bg-surface-base p-4">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0 text-ink-500" aria-hidden="true">
          {isChaotic ? <AlertTriangle size={16} strokeWidth={2} /> : <Shuffle size={16} strokeWidth={2} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-body font-semibold text-strong">{entry.item.storyTitle}</p>
          <p className="mt-0.5 text-caption text-muted">
            <span className="font-semibold">{ZONE_LABEL[entry.zone]}.</span> {isChaotic ? CHAOTIC_COPY : COMPLEX_COPY}
          </p>
          {entry.drift && (
            <p className="mt-1 text-[11px] font-semibold text-ink-500">⚠️ Source story removed — snapshot shown.</p>
          )}
        </div>
      </div>

      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={isChaotic ? "What are you doing to stabilize it? (optional)" : "Why probe or kill? (optional rationale)"}
        className="mt-3 w-full rounded-md border border-ink-200 bg-surface-raised px-3 py-1.5 text-caption text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!isChaotic && (
          <button
            type="button"
            onClick={() => onDispose(entry.item.id, "probe", note.trim())}
            className="rounded-md border border-accent-600 bg-accent-50 px-3 py-1 text-caption font-semibold text-accent-700 transition-colors hover:bg-accent-100"
          >
            Probe
          </button>
        )}
        <button
          type="button"
          onClick={() => onDispose(entry.item.id, "defer", note.trim())}
          className="rounded-md border border-ink-200 bg-surface-raised px-3 py-1 text-caption font-semibold text-muted transition-colors hover:border-accent-600 hover:text-accent-700"
        >
          Defer
        </button>
        <button
          type="button"
          onClick={() => onDispose(entry.item.id, "kill", note.trim())}
          className="rounded-md border border-ink-200 bg-surface-raised px-3 py-1 text-caption font-semibold text-muted transition-colors hover:border-accent-600 hover:text-accent-700"
        >
          Kill
        </button>
        <button
          type="button"
          onClick={() => onRemove(entry.item.id)}
          className="ml-auto text-[11px] font-semibold text-faint link-underline"
        >
          Remove from board
        </button>
      </div>
    </div>
  );
}

function CollapsedSection({
  title,
  entries,
  onRestore,
}: {
  title: string;
  entries: EnrichedItem[];
  onRestore: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  if (entries.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg border border-ink-200 bg-surface-base">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-caption font-semibold text-muted"
      >
        <span>
          {title} · {entries.length}
        </span>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <ul className="grid gap-1.5 px-4 pb-3">
          {entries.map((entry) => (
            <li key={entry.item.id} className="flex items-start justify-between gap-2 text-caption">
              <span className="min-w-0 flex-1">
                <span className="text-strong">{entry.item.storyTitle}</span>
                {entry.item.note && <span className="text-faint"> — {entry.item.note}</span>}
              </span>
              <button
                type="button"
                onClick={() => onRestore(entry.item.id)}
                className="shrink-0 text-[11px] font-semibold text-faint link-underline"
              >
                Reopen
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DecisionQueue({ items, onDispose, onReopen, onRemove }: DecisionQueueProps) {
  const needsConversation = items.filter(
    (entry) => (entry.zone === "complex" || entry.zone === "chaotic") && !entry.item.disposition,
  );
  const killed = items.filter(
    (entry) => (entry.zone === "complex" || entry.zone === "chaotic") && entry.item.disposition === "kill",
  );
  const deferred = items.filter(
    (entry) => (entry.zone === "complex" || entry.zone === "chaotic") && entry.item.disposition === "defer",
  );

  const nothing = needsConversation.length === 0 && killed.length === 0 && deferred.length === 0;

  return (
    <div>
      <div className="flex items-center gap-2">
        <h3 className="text-h5 text-strong">Needs a conversation</h3>
        {needsConversation.length > 0 && (
          <span className="rounded-full bg-accent-100 px-2 py-0.5 text-[11px] font-semibold text-accent-700">
            {needsConversation.length}
          </span>
        )}
      </div>
      <p className="mt-1 text-caption text-muted">
        Low-agreement, low-certainty stories don't get silently sorted to the bottom — decide them here first.
      </p>

      {nothing ? (
        <p className="mt-3 text-caption text-faint">
          Nothing to resolve. Complex and Chaotic placements will surface here for an explicit call.
        </p>
      ) : (
        <div className="mt-3 grid gap-3">
          {needsConversation.map((entry) => (
            <QueueCard key={entry.item.id} entry={entry} onDispose={onDispose} onRemove={onRemove} />
          ))}
        </div>
      )}

      <CollapsedSection title="Deferred" entries={deferred} onRestore={onReopen} />
      <CollapsedSection title="Killed" entries={killed} onRestore={onReopen} />
    </div>
  );
}
