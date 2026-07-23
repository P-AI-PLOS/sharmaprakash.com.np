/**
 * The loop-closing panel: pick which entries carry into next quarter, then
 * draft (or update / re-draft) a `draft: true` OKR back into OKR Organizer.
 * Draft state is driven by whether `draftedOkrId` still resolves to an
 * unaccepted draft (see `draftStateFor`).
 */
import { useState } from "react";
import { ArrowUpRight, Sprout } from "lucide-react";
import { quarterKey, nextQuarter } from "~/utils/pipeline-store";
import {
  resolveEntryRef,
  type CheckInRecord,
  type DraftState,
  type KeyResultCheckIn,
} from "~/utils/checkin-store";

const ORGANIZER_HREF = "/tools/okr-organizer/";

/** Default-included: confidence "solid" with a logged actual (design D5). */
const defaultIncluded = (entries: KeyResultCheckIn[]): Set<string> =>
  new Set(
    entries
      .filter((e) => e.confidence === "solid" && e.actual != null)
      .map((e) => e.ref.keyResultId),
  );

const BUTTON_LABEL: Record<DraftState, string> = {
  none: "Draft next quarter's OKR",
  "draft-open": "Update draft",
  "accepted-or-gone": "Draft again",
};

export default function NextQuarterDraftPanel({
  checkin,
  draftState,
  onDraft,
}: {
  checkin: CheckInRecord;
  draftState: DraftState;
  onDraft: (includedKrIds: string[]) => void;
}) {
  const [included, setIncluded] = useState<Set<string>>(() => defaultIncluded(checkin.entries));
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const toggle = (id: string) =>
    setIncluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const targetQuarter = quarterKey(nextQuarter(checkin.quarter));

  const draft = () => {
    if (included.size === 0) return;
    // Capture the intent before the parent re-renders and flips draftState.
    const message =
      draftState === "draft-open"
        ? `Updated your ${targetQuarter} draft in OKR Organizer.`
        : `Drafted ${targetQuarter} into OKR Organizer — open it to set targets and accept.`;
    onDraft([...included]);
    setSuccessMessage(message);
  };

  return (
    <div className="mt-8 rounded-lg border border-accent-600/40 bg-accent-50/40 p-5">
      <div className="flex items-center gap-2">
        <Sprout size={18} strokeWidth={2} className="text-accent-700" />
        <h4 className="text-h5 text-strong">Carry into {targetQuarter}</h4>
      </div>
      <p className="mt-1 text-caption text-muted">
        Draft next quarter's OKR from what you closed — objective carried over, each baseline pre-filled
        from your actual. It becomes an editable draft in OKR Organizer; this quarter's OKR is untouched.
      </p>

      <ul className="mt-4 grid gap-2">
        {checkin.entries.map((entry) => {
          const resolution = resolveEntryRef(entry);
          const id = entry.ref.keyResultId;
          return (
            <li key={id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-ink-200 bg-surface-base p-3">
                <input
                  type="checkbox"
                  checked={included.has(id)}
                  onChange={() => toggle(id)}
                  className="mt-1 shrink-0 accent-[var(--accent-600)]"
                />
                <span className="min-w-0 text-body text-strong">
                  <span className="font-semibold">{resolution.who || "Someone"}</span>{" "}
                  {resolution.doesWhat || "does something"}
                  {entry.actual != null && (
                    <span className="text-muted"> — baseline “from {entry.actual} to —”</span>
                  )}
                  {entry.actual == null && (
                    <span className="text-faint"> — no actual logged yet</span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={draft}
          disabled={included.size === 0}
          className="btn btn-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {BUTTON_LABEL[draftState]}
        </button>
        {included.size === 0 && (
          <span className="text-caption text-faint">Tick at least one entry to draft.</span>
        )}
        {(successMessage || draftState !== "none") && (
          <a href={ORGANIZER_HREF} className="inline-flex items-center gap-1 text-caption font-semibold text-accent-700 link-underline">
            Open in OKR Organizer
            <ArrowUpRight size={14} strokeWidth={2} />
          </a>
        )}
      </div>

      {successMessage && (
        <p role="status" className="mt-3 rounded-md border border-accent-600 bg-accent-50 px-4 py-3 text-caption text-strong">
          {successMessage}
        </p>
      )}
    </div>
  );
}
