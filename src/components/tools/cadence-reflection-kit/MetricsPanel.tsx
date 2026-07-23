/**
 * MetricsPanel — renders exactly one mode's metrics (design D3). There is no
 * "all metrics" view: the chosen mode decides which inputs and summaries exist.
 *
 * - sprint:   committed vs completed per iteration + rolling-velocity summary
 * - flow:     WIP limit vs observed (breach flagged) + cycle times + median
 * - scrumban: the flow inputs plus a per-period "planning session held?" check
 *
 * Switching mode keeps every entered `CadencePeriod` field and just re-renders
 * the fields the new mode reads; a note appears when earlier periods carry data
 * from a different mode. Numbers are clamped non-negative only — nonsense values
 * (completed > committed) are allowed on purpose; this is a teaching sandbox.
 */
import { useState } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import {
  hasForeignPeriodData,
  isWipBreached,
  medianCycleTime,
  rollingVelocity,
  type CadenceMode,
  type CadencePeriod,
  type CadenceRecord,
} from "~/utils/cadence-store";

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none disabled:opacity-60";

const numClass =
  "w-20 rounded-md border border-ink-200 bg-surface-base px-2 py-1.5 text-body text-strong focus:border-accent-600 focus:outline-none disabled:opacity-60";

const MODE_LABELS: Record<CadenceMode, string> = {
  flow: "Flow",
  scrumban: "Scrumban",
  sprint: "Sprint",
};
const MODE_ORDER: CadenceMode[] = ["flow", "scrumban", "sprint"];

/** Non-negative integer, or undefined when the field is cleared. */
const parseCount = (raw: string): number | undefined => {
  if (raw.trim() === "") return undefined;
  const n = Math.floor(Number(raw));
  return Number.isFinite(n) ? Math.max(0, n) : undefined;
};

/** Comma/space-separated non-negative days → number[] (empty array dropped to undefined). */
const parseCycleTimes = (raw: string): number[] | undefined => {
  const nums = raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n >= 0);
  return nums.length > 0 ? nums : undefined;
};

const fmt = (n: number): string => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export default function MetricsPanel({
  mode,
  record,
  readOnly,
  onChangeMode,
  onAddPeriod,
  onUpdatePeriod,
  onRemovePeriod,
}: {
  mode: CadenceMode;
  record: CadenceRecord;
  readOnly: boolean;
  onChangeMode: (mode: CadenceMode) => void;
  onAddPeriod: (label: string) => void;
  onUpdatePeriod: (periodId: string, patch: Partial<Omit<CadencePeriod, "id">>) => void;
  onRemovePeriod: (periodId: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const { periods } = record;
  const velocity = rollingVelocity(periods);

  const addPeriod = () => {
    const label = draft.trim() || defaultLabel(mode, periods.length);
    onAddPeriod(label);
    setDraft("");
  };

  return (
    <section aria-label="Cadence metrics">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-h5 text-strong">Metrics — {MODE_LABELS[mode]}</h4>
        {!readOnly && (
          <div className="flex items-center gap-1.5" role="group" aria-label="Change cadence mode">
            <span className="text-caption text-faint">Mode:</span>
            {MODE_ORDER.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => m !== mode && onChangeMode(m)}
                aria-pressed={m === mode}
                className={`rounded-md border px-2 py-1 text-caption font-semibold transition-colors ${
                  m === mode
                    ? "border-accent-600 bg-accent-50 text-accent-700"
                    : "border-ink-200 bg-surface-base text-muted hover:border-accent-600"
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
        )}
      </div>

      {hasForeignPeriodData(periods, mode) && (
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-surface-raised px-2 py-1 text-caption text-strong">
          <AlertTriangle size={13} strokeWidth={2} className="shrink-0 text-accent-700" />
          Some earlier periods were tracked under a different mode — their other numbers are kept but
          not shown here.
        </p>
      )}

      {periods.length === 0 ? (
        <p className="mt-3 text-caption text-muted">
          No periods yet. Add your first {mode === "sprint" ? "iteration" : "week"} below.
        </p>
      ) : (
        <ul className="mt-3 grid gap-3">
          {periods.map((period) => (
            <PeriodRow
              key={period.id}
              period={period}
              mode={mode}
              readOnly={readOnly}
              onUpdate={(patch) => onUpdatePeriod(period.id, patch)}
              onRemove={() => onRemovePeriod(period.id)}
            />
          ))}
        </ul>
      )}

      {!readOnly && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPeriod()}
            placeholder={mode === "sprint" ? "Sprint 3…" : "Week of Jul 20…"}
            aria-label="New period label"
            className={inputClass}
          />
          <button type="button" onClick={addPeriod} className="btn btn-primary shrink-0 !py-2">
            <Plus size={15} strokeWidth={2} className="mr-1 inline" />
            Add period
          </button>
        </div>
      )}

      {/* Summaries — mode-specific */}
      {mode === "sprint" ? (
        <SprintSummary periods={periods} velocity={velocity} />
      ) : (
        <FlowSummary periods={periods} />
      )}
    </section>
  );
}

const defaultLabel = (mode: CadenceMode, count: number): string =>
  mode === "sprint" ? `Sprint ${count + 1}` : `Week ${count + 1}`;

function PeriodRow({
  period,
  mode,
  readOnly,
  onUpdate,
  onRemove,
}: {
  period: CadencePeriod;
  mode: CadenceMode;
  readOnly: boolean;
  onUpdate: (patch: Partial<Omit<CadencePeriod, "id">>) => void;
  onRemove: () => void;
}) {
  const breached = isWipBreached(period);
  return (
    <li
      className={`rounded-lg border p-4 ${
        breached ? "border-accent-600 bg-accent-50" : "border-ink-200 bg-surface-base"
      }`}
    >
      <div className="flex items-start gap-2">
        <input
          type="text"
          value={period.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          disabled={readOnly}
          aria-label="Period label"
          className={`${inputClass} flex-1`}
        />
        {!readOnly && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${period.label || "period"}`}
            className="mt-2 shrink-0 text-faint transition-colors hover:text-accent-700"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-4">
        {mode === "sprint" ? (
          <>
            <NumField
              label="Committed"
              value={period.committed}
              readOnly={readOnly}
              onChange={(committed) => onUpdate({ committed })}
            />
            <NumField
              label="Completed"
              value={period.completed}
              readOnly={readOnly}
              onChange={(completed) => onUpdate({ completed })}
            />
          </>
        ) : (
          <>
            <NumField
              label="WIP limit"
              value={period.wipLimit}
              readOnly={readOnly}
              onChange={(wipLimit) => onUpdate({ wipLimit })}
            />
            <NumField
              label="WIP observed"
              value={period.wipObserved}
              readOnly={readOnly}
              onChange={(wipObserved) => onUpdate({ wipObserved })}
            />
            <div>
              <label className="block text-caption text-faint">Cycle times (days)</label>
              <input
                type="text"
                defaultValue={(period.cycleTimesDays ?? []).join(", ")}
                onBlur={(e) => onUpdate({ cycleTimesDays: parseCycleTimes(e.target.value) })}
                disabled={readOnly}
                placeholder="e.g. 2, 3, 5"
                aria-label="Cycle times in days, comma-separated"
                className={`mt-1 ${inputClass} !w-56`}
              />
            </div>
            {mode === "scrumban" && (
              <label className="flex items-center gap-2 pb-2 text-caption font-semibold text-strong">
                <input
                  type="checkbox"
                  checked={period.planningHeld ?? false}
                  onChange={(e) => onUpdate({ planningHeld: e.target.checked })}
                  disabled={readOnly}
                  className="h-4 w-4 accent-[var(--accent-600)]"
                />
                Planning session held?
              </label>
            )}
          </>
        )}
      </div>

      {breached && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-caption font-semibold text-accent-700">
          <AlertTriangle size={13} strokeWidth={2} />
          Over WIP limit — {period.wipObserved} in progress against a limit of {period.wipLimit}.
        </p>
      )}
    </li>
  );
}

function NumField({
  label,
  value,
  readOnly,
  onChange,
}: {
  label: string;
  value: number | undefined;
  readOnly: boolean;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <div>
      <label className="block text-caption text-faint">{label}</label>
      <input
        type="number"
        min={0}
        value={value ?? ""}
        onChange={(e) => onChange(parseCount(e.target.value))}
        disabled={readOnly}
        aria-label={label}
        className={`mt-1 ${numClass}`}
      />
    </div>
  );
}

/** Committed-vs-completed bars, scaled to the largest value across all periods. */
function SprintSummary({
  periods,
  velocity,
}: {
  periods: CadencePeriod[];
  velocity: number | null;
}) {
  const scale = Math.max(
    1,
    ...periods.flatMap((p) => [p.committed ?? 0, p.completed ?? 0]),
  );
  const tracked = periods.filter((p) => p.committed !== undefined || p.completed !== undefined);

  return (
    <div className="mt-6 border-t border-ink-200 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-caption font-semibold text-muted">Rolling velocity</p>
        <p className="text-body font-semibold text-strong">
          {velocity === null ? "—" : `${fmt(velocity)} pts`}
          <span className="ml-1 text-caption font-normal text-faint">mean of last 3 completed</span>
        </p>
      </div>
      {tracked.length > 0 && (
        <ul className="mt-3 grid gap-2.5">
          {tracked.map((p) => (
            <li key={p.id}>
              <div className="flex items-center justify-between text-caption text-muted">
                <span className="text-strong">{p.label}</span>
                <span>
                  {p.completed ?? 0}/{p.committed ?? 0}
                </span>
              </div>
              <div className="mt-1 space-y-1">
                <Bar value={p.committed ?? 0} scale={scale} tone="muted" title="Committed" />
                <Bar value={p.completed ?? 0} scale={scale} tone="accent" title="Completed" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Bar({
  value,
  scale,
  tone,
  title,
}: {
  value: number;
  scale: number;
  tone: "muted" | "accent";
  title: string;
}) {
  const pct = Math.round((value / scale) * 100);
  return (
    <div
      className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100"
      role="img"
      aria-label={`${title}: ${value}`}
    >
      <div
        className={`h-full rounded-full ${tone === "accent" ? "bg-accent-600" : "bg-ink-300"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Per-period median cycle time; overall median across every recorded time. */
function FlowSummary({ periods }: { periods: CadencePeriod[] }) {
  const perPeriod = periods
    .map((p) => ({ label: p.label, median: medianCycleTime(p) }))
    .filter((row) => row.median !== null);
  const breaches = periods.filter(isWipBreached).length;

  return (
    <div className="mt-6 border-t border-ink-200 pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-caption font-semibold text-muted">Cycle-time trend</p>
        {breaches > 0 && (
          <p className="text-caption font-semibold text-accent-700">
            {breaches} period{breaches === 1 ? "" : "s"} over WIP limit
          </p>
        )}
      </div>
      {perPeriod.length === 0 ? (
        <p className="mt-2 text-caption text-faint">
          Add cycle times to a period to see its median.
        </p>
      ) : (
        <ul className="mt-3 grid gap-1.5">
          {perPeriod.map((row) => (
            <li key={row.label} className="flex items-center justify-between text-caption">
              <span className="text-strong">{row.label}</span>
              <span className="text-muted">
                median <span className="font-semibold text-strong">{fmt(row.median as number)}</span>{" "}
                days
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
