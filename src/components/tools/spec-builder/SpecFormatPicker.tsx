/**
 * The framing moment ("what's the job here?") and the three format cards.
 * Answering pre-selects the suggested format but never locks it, and the whole
 * question is skippable (design.md D3). The `compact` variant is the segmented
 * control that keeps the current format visible in the editor header.
 */
import { useState } from "react";
import {
  SPEC_FORMATS,
  SPEC_FRAMING_JOBS,
  suggestedFormatFor,
  type SpecFormat,
  type SpecFramingJob,
} from "~/utils/spec-store";

export function SpecFormatSegmented({
  format,
  onFormat,
}: {
  format: SpecFormat;
  onFormat: (format: SpecFormat) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Spec format"
      className="flex flex-wrap gap-1 rounded-md border border-ink-200 bg-surface-base p-1"
    >
      {SPEC_FORMATS.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => onFormat(f.value)}
          aria-pressed={format === f.value}
          className={`rounded px-2.5 py-1 text-caption font-semibold transition-colors ${
            format === f.value
              ? "bg-accent-50 text-accent-700"
              : "text-muted hover:text-accent-700"
          }`}
        >
          <span aria-hidden="true">{f.icon} </span>
          {f.label}
        </button>
      ))}
    </div>
  );
}

export default function SpecFormatPicker({
  framingJob,
  format,
  onFraming,
  onFormat,
}: {
  framingJob: SpecFramingJob | null;
  format: SpecFormat;
  onFraming: (job: SpecFramingJob) => void;
  onFormat: (format: SpecFormat) => void;
}) {
  const [skipped, setSkipped] = useState(false);
  const showFraming = framingJob === null && !skipped;
  const suggested = suggestedFormatFor(framingJob);

  return (
    <div className="grid gap-4">
      {showFraming ? (
        <div className="rounded-lg border border-ink-200 bg-surface-sunken p-4">
          <p className="text-body font-semibold text-strong">What’s the job here?</p>
          <p className="mt-1 text-caption text-muted">
            Each answer suggests a format. You can still pick any of the three.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SPEC_FRAMING_JOBS.map((job) => (
              <button
                key={job.value}
                type="button"
                onClick={() => {
                  onFraming(job.value);
                  onFormat(job.suggests);
                }}
                className="rounded-md border border-ink-200 bg-surface-base px-3 py-1.5 text-caption font-semibold text-muted transition-colors hover:border-accent-600 hover:text-accent-700"
              >
                {job.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSkipped(true)}
              className="text-caption font-semibold text-faint link-underline"
            >
              Skip
            </button>
          </div>
        </div>
      ) : (
        framingJob && (
          <p className="text-caption text-muted">
            Job:{" "}
            <span className="font-semibold text-strong">
              {SPEC_FRAMING_JOBS.find((j) => j.value === framingJob)?.label}
            </span>{" "}
            · suggested {SPEC_FORMATS.find((f) => f.value === suggested)?.label}
          </p>
        )
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {SPEC_FORMATS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onFormat(f.value)}
            aria-pressed={format === f.value}
            className={`rounded-lg border p-4 text-left transition-colors ${
              format === f.value
                ? "border-accent-600 bg-accent-50"
                : "border-ink-200 bg-surface-base hover:border-accent-600"
            }`}
          >
            <span aria-hidden="true" className="text-h4">
              {f.icon}
            </span>
            <span className="mt-1 flex items-baseline gap-2">
              <span
                className={`text-body font-semibold ${format === f.value ? "text-accent-700" : "text-strong"}`}
              >
                {f.label}
              </span>
              {suggested === f.value && format !== f.value && (
                <span className="text-caption font-semibold text-accent-700">suggested</span>
              )}
            </span>
            <span className="mt-1 block text-caption text-muted">{f.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
