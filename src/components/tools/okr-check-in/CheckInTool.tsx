/**
 * OKR Check-In island root (stage 06 of the Donut CRM pipeline). Resolves the
 * active product, lets the visitor pick which OKR to close, seeds a check-in
 * per key result, drives the per-KR logging cards, and hands off a draft OKR
 * for next quarter into OKR Organizer's store. Mirrors `ost/TreeBuilder`:
 * localStorage via `createToolStore`, in-island reveal via `useReveal`.
 */
import { useEffect, useRef, useState } from "react";
import { CalendarCheck, CheckCircle2, HelpCircle, Plus } from "lucide-react";
import { ExerciseShell } from "~/components/course/exercises/exercise-ui";
import { useReveal } from "~/components/tools/vertical-slicer/useReveal";
import {
  compareQuarters,
  quarterKey,
  resolveActiveProduct,
  type ProductRecord,
} from "~/utils/pipeline-store";
import { entriesByQuarter, okrStore, titleFor, type OkrRecord } from "~/utils/okr-store";
import {
  addSnapshot,
  checkinStore,
  draftNextQuarterOkr,
  draftStateFor,
  listCheckInsForProduct,
  removeSnapshot,
  resolveCheckIn,
  setActual,
  setConfidence,
  setReflection,
  syncKeyResults,
  unsyncedKeyResultCount,
  type CheckInConfidence,
  type CheckInRecord,
} from "~/utils/checkin-store";
import KeyResultCheckInCard from "./KeyResultCheckInCard";
import NextQuarterDraftPanel from "./NextQuarterDraftPanel";
import CheckInSwitcher from "./CheckInSwitcher";
import CheckInHelpModal, { type CheckInConcept } from "./CheckInHelpModal";

const ORGANIZER_HREF = "/tools/okr-organizer/";

const hasCheckIn = (records: CheckInRecord[], okr: OkrRecord): boolean =>
  records.some((r) => r.okrId === okr.id && compareQuarters(r.quarter, okr.quarter) === 0);

export default function CheckInTool() {
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [okrGroups, setOkrGroups] = useState<ReturnType<typeof entriesByQuarter>>([]);
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [activeCheckin, setActiveCheckin] = useState<CheckInRecord | null>(null);
  const [helpConcept, setHelpConcept] = useState<CheckInConcept | null>(null);
  const hydrated = useRef(false);

  const { containerRef, revealProps } = useReveal<HTMLDivElement>(activeCheckin?.id);

  useEffect(() => {
    const p = resolveActiveProduct();
    setProduct(p);
    setOkrGroups(entriesByQuarter(p.id));
    const recs = listCheckInsForProduct(p.id);
    setRecords(recs);

    const activeId = checkinStore.getActiveId(p.id);
    const active = activeId ? checkinStore.get(activeId) : undefined;
    if (active) setActiveCheckin(active);
    hydrated.current = true;
  }, []);

  /** Re-read the open record + list after any store mutation. */
  const syncActive = () => {
    if (!product) return;
    setRecords(listCheckInsForProduct(product.id));
    setActiveCheckin((current) => (current ? checkinStore.get(current.id) ?? null : null));
  };

  const activeOkr: OkrRecord | undefined = activeCheckin ? okrStore.get(activeCheckin.okrId) : undefined;

  const pickOkr = (okr: OkrRecord) => {
    if (!product) return;
    const rec = resolveCheckIn(product.id, okr);
    checkinStore.setActiveId(product.id, rec.id);
    setActiveCheckin(rec);
    setRecords(listCheckInsForProduct(product.id));
  };

  const openCheckin = (id: string) => {
    if (!product) return;
    const rec = checkinStore.get(id);
    if (!rec) return;
    checkinStore.setActiveId(product.id, id);
    setActiveCheckin(rec);
  };

  const onAddSnapshot = (krId: string, snap: { value: number; note?: string }) => {
    if (!activeCheckin) return;
    addSnapshot(activeCheckin.id, krId, snap);
    syncActive();
  };
  const onRemoveSnapshot = (krId: string, index: number) => {
    if (!activeCheckin) return;
    removeSnapshot(activeCheckin.id, krId, index);
    syncActive();
  };
  const onSetActual = (krId: string, actual: number | null) => {
    if (!activeCheckin) return;
    setActual(activeCheckin.id, krId, actual);
    syncActive();
  };
  const onSetConfidence = (krId: string, confidence: CheckInConfidence | null) => {
    if (!activeCheckin) return;
    setConfidence(activeCheckin.id, krId, confidence);
    syncActive();
  };
  const onSetReflection = (krId: string, reflection: string) => {
    if (!activeCheckin) return;
    setReflection(activeCheckin.id, krId, reflection);
    syncActive();
  };
  const onDraft = (includedKrIds: string[]) => {
    if (!activeCheckin) return;
    draftNextQuarterOkr(activeCheckin, includedKrIds);
    syncActive();
  };
  const onSync = () => {
    if (!activeCheckin || !activeOkr) return;
    syncKeyResults(activeCheckin.id, activeOkr);
    syncActive();
  };

  const helpButton = (
    <button
      type="button"
      onClick={() => setHelpConcept("ritual")}
      className="btn btn-ghost shrink-0 !py-1.5 !text-caption"
    >
      <HelpCircle size={14} strokeWidth={2} />
      <span>How this works</span>
    </button>
  );

  const headerAction = (
    <div className="flex shrink-0 items-center gap-2">
      <CheckInSwitcher records={records} activeId={activeCheckin?.id ?? null} onSelect={openCheckin} />
      {helpButton}
    </div>
  );

  const helpModal = <CheckInHelpModal concept={helpConcept} onClose={() => setHelpConcept(null)} />;

  const hasOkrs = okrGroups.length > 0;
  const unsynced = activeCheckin ? unsyncedKeyResultCount(activeCheckin, activeOkr) : 0;

  return (
    <>
      <ExerciseShell
        kicker="Free tool · Stage 06"
        title={product ? `Close the quarter for ${product.name}` : "OKR Check-In"}
        instructions="Pick the OKR you're closing, log the number you actually landed on each key result, add mid-quarter snapshots as you go, then draft next quarter's OKR back into stage 01. Everything saves in your browser — nothing is sent anywhere."
        headerAction={headerAction}
      >
        {!hasOkrs ? (
          <div className="rounded-lg border border-ink-200 bg-surface-base p-6 text-center">
            <p className="text-body text-strong">No OKRs to close yet.</p>
            <p className="mx-auto mt-2 max-w-md text-caption text-muted">
              A check-in closes an OKR you set at the start of the quarter. Set one in the OKR Organizer
              (stage 01) and it will show up here to check in against.
            </p>
            <a href={ORGANIZER_HREF} className="btn btn-primary mt-4 inline-flex">
              <Plus size={15} strokeWidth={2} />
              Set an OKR in the OKR Organizer
            </a>
          </div>
        ) : (
          <>
            {/* OKR picker */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-caption font-semibold text-muted">Which OKR are you closing?</span>
                <button
                  type="button"
                  onClick={() => setHelpConcept("ritual")}
                  className="inline-flex items-center gap-1 text-caption text-muted transition-colors hover:text-accent-700"
                >
                  <HelpCircle size={14} strokeWidth={2} />
                  What's a check-in?
                </button>
              </div>
              <div className="mt-2 grid gap-3">
                {okrGroups.map((group) => (
                  <div key={group.key}>
                    <p className="text-caption font-semibold text-faint">{group.key}</p>
                    <ul className="mt-1 grid gap-1.5">
                      {group.entries.map((okr) => {
                        const closed = hasCheckIn(records, okr);
                        const isActive = activeCheckin?.okrId === okr.id;
                        return (
                          <li key={okr.id}>
                            <button
                              type="button"
                              onClick={() => pickOkr(okr)}
                              aria-pressed={isActive}
                              className={`flex w-full items-start justify-between gap-3 rounded-lg border p-3 text-left transition-colors ${
                                isActive
                                  ? "border-accent-600 bg-accent-50"
                                  : "border-ink-200 bg-surface-base hover:border-accent-600"
                              }`}
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-body font-semibold text-strong">
                                  {titleFor(okr)}
                                </span>
                                <span className="text-caption text-muted">
                                  {okr.keyResults.length} key result{okr.keyResults.length === 1 ? "" : "s"}
                                  {" · "}
                                  {okr.tag.label}
                                </span>
                              </span>
                              {closed && (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-accent-600/40 bg-accent-50 px-2 py-0.5 text-[11px] font-semibold text-accent-700">
                                  <CheckCircle2 size={12} strokeWidth={2.5} />
                                  Checked in
                                </span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Active check-in */}
            {activeCheckin && (
              <div className="mt-8 border-t border-ink-200 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarCheck size={18} strokeWidth={2} className="text-accent-700" />
                    <h4 className="text-h5 text-strong">
                      Closing {quarterKey(activeCheckin.quarter)}
                    </h4>
                  </div>
                  {unsynced > 0 && (
                    <button type="button" onClick={onSync} className="btn btn-secondary btn-sm shrink-0">
                      <Plus size={13} strokeWidth={2} />
                      Sync {unsynced} new key result{unsynced === 1 ? "" : "s"}
                    </button>
                  )}
                </div>

                {activeCheckin.entries.length === 0 ? (
                  <p className="mt-4 text-caption text-muted">
                    This OKR had no key results when you opened it. Add some in the OKR Organizer, then sync.
                  </p>
                ) : (
                  <div ref={containerRef} className="mt-4 grid gap-4">
                    {activeCheckin.entries.map((entry, i) => (
                      <div key={entry.ref.keyResultId} {...revealProps(entry.ref.keyResultId, i)}>
                        <KeyResultCheckInCard
                          entry={entry}
                          index={i}
                          onAddSnapshot={onAddSnapshot}
                          onRemoveSnapshot={onRemoveSnapshot}
                          onSetActual={onSetActual}
                          onSetConfidence={onSetConfidence}
                          onSetReflection={onSetReflection}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeCheckin.entries.length > 0 && (
                  <NextQuarterDraftPanel
                    key={activeCheckin.id}
                    checkin={activeCheckin}
                    draftState={draftStateFor(activeCheckin)}
                    onDraft={onDraft}
                  />
                )}
              </div>
            )}
          </>
        )}
      </ExerciseShell>
      {helpModal}
    </>
  );
}
