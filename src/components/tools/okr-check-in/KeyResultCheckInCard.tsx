/**
 * One key result inside a check-in: resolved/badged KR text, the mid-quarter
 * snapshot log with a hand-rolled SVG sparkline + trend tag (tokens only, no
 * chart library), the close-out actual with a "use latest snapshot" shortcut,
 * a solid/noisy/contested confidence toggle, and a reflection textarea.
 */
import { useState } from "react";
import { CornerDownLeft, Trash2 } from "lucide-react";
import { ChoiceButton } from "~/components/course/exercises/exercise-ui";
import {
  resolveEntryRef,
  trendFor,
  type CheckInConfidence,
  type KeyResultCheckIn,
  type MetricSnapshot,
  type TrendVerdict,
} from "~/utils/checkin-store";

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

const CONFIDENCE_LABELS: Record<CheckInConfidence, string> = {
  solid: "Solid",
  noisy: "Noisy",
  contested: "Contested",
};

const TREND_TONE: Record<TrendVerdict, string> = {
  insufficient: "border-ink-200 bg-surface-base text-faint",
  holding: "border-accent-600 bg-accent-50 text-accent-700",
  faded: "border-ink-200 bg-ink-100 text-muted",
  mixed: "border-ink-200 bg-surface-base text-muted",
};

const formatDate = (at: number): string =>
  new Date(at).toLocaleDateString(undefined, { month: "short", day: "numeric" });

/** Tiny sparkline of the snapshot series — plain SVG, `currentColor` from tokens. */
function Sparkline({ snapshots }: { snapshots: MetricSnapshot[] }) {
  if (snapshots.length < 2) return null;
  const values = snapshots.map((s) => s.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 120;
  const h = 32;
  const pad = 4;
  const stepX = (w - pad * 2) / (values.length - 1);
  const points = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (h - pad * 2) * (1 - (v - min) / span);
    return { x, y };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="text-accent-600"
      role="img"
      aria-label={`Snapshot trend: ${values.join(", ")}`}
    >
      <path d={path} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === points.length - 1 ? 3 : 2}
          fill="currentColor"
          className={i === points.length - 1 ? "text-accent-700" : "text-accent-600"}
        />
      ))}
    </svg>
  );
}

export interface KeyResultCheckInCardProps {
  entry: KeyResultCheckIn;
  index: number;
  onAddSnapshot: (keyResultId: string, snapshot: { value: number; note?: string }) => void;
  onRemoveSnapshot: (keyResultId: string, index: number) => void;
  onSetActual: (keyResultId: string, actual: number | null) => void;
  onSetConfidence: (keyResultId: string, confidence: CheckInConfidence | null) => void;
  onSetReflection: (keyResultId: string, reflection: string) => void;
}

export default function KeyResultCheckInCard({
  entry,
  onAddSnapshot,
  onRemoveSnapshot,
  onSetActual,
  onSetConfidence,
  onSetReflection,
}: KeyResultCheckInCardProps) {
  const keyResultId = entry.ref.keyResultId;
  const resolution = resolveEntryRef(entry);
  const trend = trendFor(entry.snapshots);

  const [snapValue, setSnapValue] = useState("");
  const [snapNote, setSnapNote] = useState("");

  const addSnapshot = () => {
    const value = Number(snapValue);
    if (snapValue.trim() === "" || Number.isNaN(value)) return;
    onAddSnapshot(keyResultId, { value, note: snapNote.trim() || undefined });
    setSnapValue("");
    setSnapNote("");
  };

  const latest = entry.snapshots.length ? entry.snapshots[entry.snapshots.length - 1] : null;

  return (
    <div className="rounded-lg border border-ink-200 bg-surface-base p-4">
      {/* KR text + drift badge */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-body text-strong">
          <span className="font-semibold">{resolution.who || "Someone"}</span>{" "}
          {resolution.doesWhat || "does something"}
          {resolution.byHowMuch ? (
            <span className="text-muted"> — {resolution.byHowMuch}</span>
          ) : null}
        </p>
        {resolution.state !== "live" && (
          <span
            className="shrink-0 rounded-full border border-ink-200 bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-muted"
            title={
              resolution.state === "removed"
                ? "This key result was removed from the OKR — showing what you checked in against."
                : "This key result was reworded in the OKR — showing what you checked in against."
            }
          >
            {resolution.state === "removed" ? "Source removed" : "Source changed"}
          </span>
        )}
      </div>

      {/* Snapshot log + sparkline + trend */}
      <div className="mt-4 rounded-md border border-ink-200 bg-surface-raised p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-caption font-semibold text-muted">Mid-quarter snapshots</p>
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${TREND_TONE[trend.verdict]}`}
          >
            {trend.label}
          </span>
        </div>

        {entry.snapshots.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Sparkline snapshots={entry.snapshots} />
            <ul className="grid gap-1 text-caption">
              {entry.snapshots.map((s, i) => (
                <li key={`${s.at}-${i}`} className="flex items-baseline gap-2">
                  <span className="tabular-nums font-semibold text-strong">{s.value}</span>
                  <span className="text-faint">{formatDate(s.at)}</span>
                  {s.note && <span className="text-muted">· {s.note}</span>}
                  <button
                    type="button"
                    onClick={() => onRemoveSnapshot(keyResultId, i)}
                    aria-label={`Remove snapshot ${s.value}`}
                    className="text-faint transition-colors hover:text-accent-700"
                  >
                    <Trash2 size={12} strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={snapValue}
            placeholder="Value"
            onChange={(e) => setSnapValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSnapshot()}
            aria-label="Snapshot value"
            className={`${inputClass} w-24 shrink-0`}
          />
          <input
            type="text"
            value={snapNote}
            placeholder="Note (optional) — e.g. launch week"
            onChange={(e) => setSnapNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSnapshot()}
            aria-label="Snapshot note"
            className={`${inputClass} min-w-[8rem] flex-1`}
          />
          <button type="button" onClick={addSnapshot} className="btn btn-secondary shrink-0 !py-2">
            Log
          </button>
        </div>
      </div>

      {/* Quarter close: actual + confidence + reflection */}
      <div className="mt-4 grid gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1">
            <span className="text-caption font-semibold text-muted">Close-out actual</span>
            <input
              type="number"
              inputMode="decimal"
              value={entry.actual ?? ""}
              placeholder="—"
              onChange={(e) =>
                onSetActual(keyResultId, e.target.value.trim() === "" ? null : Number(e.target.value))
              }
              className={`${inputClass} w-32`}
            />
          </label>
          {latest && (
            <button
              type="button"
              onClick={() => onSetActual(keyResultId, latest.value)}
              className="inline-flex items-center gap-1 pb-2 text-caption font-semibold text-accent-700 link-underline"
            >
              <CornerDownLeft size={13} strokeWidth={2} />
              Use latest snapshot ({latest.value})
            </button>
          )}
        </div>

        <div>
          <span className="text-caption font-semibold text-muted">Confidence</span>
          <div className="mt-1 flex gap-2">
            {(Object.keys(CONFIDENCE_LABELS) as CheckInConfidence[]).map((c) => (
              <ChoiceButton
                key={c}
                label={CONFIDENCE_LABELS[c]}
                selected={entry.confidence === c}
                onClick={() => onSetConfidence(keyResultId, entry.confidence === c ? null : c)}
              />
            ))}
          </div>
        </div>

        <label className="grid gap-1">
          <span className="text-caption font-semibold text-muted">Reflection</span>
          <textarea
            value={entry.reflection}
            placeholder="What actually happened, and why the number is what it is…"
            onChange={(e) => onSetReflection(keyResultId, e.target.value)}
            rows={2}
            className={`${inputClass} resize-y`}
          />
        </label>
      </div>
    </div>
  );
}
