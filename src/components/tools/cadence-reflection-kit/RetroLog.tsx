/**
 * RetroLog — a running log of retro entries, each committing to exactly one
 * action (design D4). The single `action` field *is* the lesson: the schema
 * can't hold a laundry list, so the form offers no way to add a second action.
 *
 * When the newest entry's action is still `open`, the new-entry flow surfaces
 * it and offers "mark done" or "carry over" — carrying over marks the old entry
 * `carried-over` and prefills the new action.
 */
import { useState } from "react";
import { CircleCheck, CircleDashed, CornerDownRight } from "lucide-react";
import type { CadenceRecord, RetroActionStatus, RetroEntry } from "~/utils/cadence-store";

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none disabled:opacity-60";

const STATUS_LABEL: Record<RetroActionStatus, string> = {
  open: "Open",
  done: "Done",
  "carried-over": "Carried over",
};

const fmtDate = (ms: number): string =>
  new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export default function RetroLog({
  record,
  readOnly,
  onAdd,
  onSetStatus,
}: {
  record: CadenceRecord;
  readOnly: boolean;
  onAdd: (data: Pick<RetroEntry, "wentWell" | "didntGoWell" | "action">) => void;
  onSetStatus: (retroId: string, status: RetroActionStatus) => void;
}) {
  const [wentWell, setWentWell] = useState("");
  const [didntGoWell, setDidntGoWell] = useState("");
  const [action, setAction] = useState("");

  const { retros } = record;
  const latestOpen = retros[0]?.actionStatus === "open" ? retros[0] : null;

  const save = () => {
    if (!wentWell.trim() && !didntGoWell.trim() && !action.trim()) return;
    onAdd({ wentWell: wentWell.trim(), didntGoWell: didntGoWell.trim(), action: action.trim() });
    setWentWell("");
    setDidntGoWell("");
    setAction("");
  };

  const carryOver = () => {
    if (!latestOpen) return;
    onSetStatus(latestOpen.id, "carried-over");
    setAction(latestOpen.action);
  };

  return (
    <section aria-label="Retro log">
      <h4 className="text-h5 text-strong">Retro log</h4>
      <p className="mt-1 text-caption text-muted">
        What went well, what didn't, and the <em>one</em> action you'll actually do next.
      </p>

      {retros.length > 0 && (
        <ul className="mt-3 grid gap-3">
          {retros.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-ink-200 bg-surface-base p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-caption font-semibold text-faint">{fmtDate(entry.date)}</span>
                <StatusChip status={entry.actionStatus} />
              </div>
              <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                <RetroField term="Went well" value={entry.wentWell} />
                <RetroField term="Didn't go well" value={entry.didntGoWell} />
              </dl>
              {entry.action && (
                <p className="mt-2 flex items-start gap-1.5 text-body text-strong">
                  <CornerDownRight
                    size={15}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-accent-700"
                  />
                  <span>
                    <span className="font-semibold">Action:</span> {entry.action}
                  </span>
                </p>
              )}
              {!readOnly && entry.actionStatus === "open" && (
                <button
                  type="button"
                  onClick={() => onSetStatus(entry.id, "done")}
                  className="mt-2 text-caption font-semibold text-accent-700 link-underline"
                >
                  Mark action done
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!readOnly && (
        <div className="mt-4 rounded-lg border border-ink-200 bg-surface-raised p-4">
          <p className="text-caption font-semibold text-muted">New retro entry</p>

          {latestOpen && (
            <div className="mt-2 rounded-md border border-ink-200 bg-surface-base p-3">
              <p className="text-caption text-muted">
                Last action is still open: <span className="text-strong">{latestOpen.action}</span>
              </p>
              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => onSetStatus(latestOpen.id, "done")}
                  className="text-caption font-semibold text-accent-700 link-underline"
                >
                  Mark done
                </button>
                <button
                  type="button"
                  onClick={carryOver}
                  className="text-caption font-semibold text-accent-700 link-underline"
                >
                  Carry over into this entry
                </button>
              </div>
            </div>
          )}

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <textarea
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              rows={2}
              placeholder="What went well…"
              aria-label="What went well"
              className={`${inputClass} resize-y`}
            />
            <textarea
              value={didntGoWell}
              onChange={(e) => setDidntGoWell(e.target.value)}
              rows={2}
              placeholder="What didn't…"
              aria-label="What didn't go well"
              className={`${inputClass} resize-y`}
            />
          </div>

          <label htmlFor="retro-action" className="mt-3 block text-caption text-faint">
            The one action — if everything is a priority, nothing is.
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="retro-action"
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              placeholder="One thing you'll actually do…"
              className={inputClass}
            />
            <button type="button" onClick={save} className="btn btn-primary shrink-0 !py-2">
              Save entry
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function RetroField({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-caption text-faint">{term}</dt>
      <dd className="text-body text-strong">{value || <span className="text-faint">—</span>}</dd>
    </div>
  );
}

function StatusChip({ status }: { status: RetroActionStatus }) {
  const tone =
    status === "done"
      ? "border-accent-600 bg-accent-50 text-accent-700"
      : status === "carried-over"
        ? "border-ink-200 bg-surface-raised text-muted"
        : "border-ink-200 bg-surface-base text-strong";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-caption font-semibold ${tone}`}
    >
      {status === "done" ? (
        <CircleCheck size={12} strokeWidth={2} />
      ) : (
        <CircleDashed size={12} strokeWidth={2} />
      )}
      {STATUS_LABEL[status]}
    </span>
  );
}
