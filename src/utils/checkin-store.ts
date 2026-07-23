/**
 * Local-first storage for OKR Check-In (stage 06 of the Donut CRM pipeline,
 * `/tools/okr-check-in/`) — the quarter-close ritual and the only stage that
 * loops rather than terminates.
 *
 * Persistence runs on the shared pipeline store factory (`./pipeline-store.ts`,
 * capability `openspec/specs/pipeline-data-contract/spec.md`). Reads join to OKR
 * Organizer (`./okr-store.ts`, stage 01) on `OkrKeyResultRef`; the loop-closing
 * write is a `draft: true` OKR record created *through OKR Organizer's store* —
 * never a private copy and never a mutation of a committed entry.
 *
 * localStorage only — nothing here ever leaves the browser, and every write
 * degrades silently when storage is unavailable (inherited from the factory).
 */

import {
  compareQuarters,
  createToolStore,
  nextQuarter,
  quarterKey,
  uid,
  type OkrKeyResultRef,
  type QuarterRef,
  type ToolRecordBase,
} from "./pipeline-store";
import { isDraft, okrStore, type OkrRecord } from "./okr-store";

// ------------------------------------------------------------------ shapes

/** How trustworthy the quarter-close number is — the contract D5 confidence set. */
export type CheckInConfidence = "solid" | "noisy" | "contested";

/** One timestamped reading of a key result's metric during the quarter. */
export interface MetricSnapshot {
  /** epoch ms — when the number was read (the series is kept sorted by this). */
  at: number;
  value: number;
  /** e.g. "launch week", "post-onboarding fix". */
  note?: string;
}

/**
 * One key result inside a check-in. Entries carry no own `uid()` — nothing
 * outside this tool references them and they are addressed by `ref.keyResultId`
 * (itself a stable contract id, prefix `kr`).
 */
export interface KeyResultCheckIn {
  /** Contract D2 join key back into `pm-okr-v1`. */
  ref: OkrKeyResultRef;
  /** D5 snapshot taken at link time — always renderable, even after drift. */
  krSnapshot: { who: string; doesWhat: string; byHowMuch: string };
  /** 0..n observations across the quarter, sorted by `at`. */
  snapshots: MetricSnapshot[];
  /** The deliberate close-out outcome — distinct from the snapshot series. */
  actual: number | null;
  confidence: CheckInConfidence | null;
  reflection: string;
}

export interface CheckInRecord extends ToolRecordBase {
  /** Contract D6 — the quarter being closed. */
  quarter: QuarterRef;
  /** The OKR Organizer entry this check-in closes. */
  okrId: string;
  /** D5 snapshot of the objective, for rendering after the source drifts. */
  okrObjectiveSnapshot: string;
  /** One per key result at link time; `syncKeyResults` appends, never removes. */
  entries: KeyResultCheckIn[];
  /** `uid("okr")` of the drafted next-quarter entry, once drafted. */
  draftedOkrId: string | null;
}

// ------------------------------------------------------------------ keys

/** Contract D4 key + prefix table. */
export const CHECKIN_STORAGE_KEY = "pm-checkin-v1";

export const checkinStore = createToolStore<CheckInRecord>({
  storageKey: CHECKIN_STORAGE_KEY,
  idPrefix: "chk",
});

// ------------------------------------------------------------------ seeding

const seedEntry = (kr: OkrRecord["keyResults"][number], okrId: string): KeyResultCheckIn => ({
  ref: { okrId, keyResultId: kr.id },
  krSnapshot: { who: kr.who, doesWhat: kr.doesWhat, byHowMuch: kr.byHowMuch },
  snapshots: [],
  actual: null,
  confidence: null,
  reflection: "",
});

/**
 * The existing check-in for (okr.id, okr.quarter), or a fresh one seeding an
 * entry per key result. At most one record per (okrId, quarter) — re-picking an
 * already-closed OKR reopens rather than duplicates (design risk note).
 */
export const resolveCheckIn = (productId: string, okr: OkrRecord): CheckInRecord => {
  const existing = checkinStore
    .listForProduct(productId)
    .find((rec) => rec.okrId === okr.id && compareQuarters(rec.quarter, okr.quarter) === 0);
  if (existing) return existing;

  return checkinStore.create({
    productId,
    quarter: okr.quarter,
    okrId: okr.id,
    okrObjectiveSnapshot: okr.objective,
    entries: okr.keyResults.map((kr) => seedEntry(kr, okr.id)),
    draftedOkrId: null,
  });
};

// ------------------------------------------------------------- entry mutators

/**
 * Patches the single entry matching `keyResultId` and persists, returning the
 * refreshed record (or the untouched record if the id no longer matches).
 */
const patchEntry = (
  checkinId: string,
  keyResultId: string,
  patch: (entry: KeyResultCheckIn) => KeyResultCheckIn,
): CheckInRecord | undefined => {
  const record = checkinStore.get(checkinId);
  if (!record) return undefined;
  const entries = record.entries.map((entry) =>
    entry.ref.keyResultId === keyResultId ? patch(entry) : entry,
  );
  checkinStore.update(checkinId, { entries });
  return checkinStore.get(checkinId);
};

export const setActual = (checkinId: string, keyResultId: string, actual: number | null) =>
  patchEntry(checkinId, keyResultId, (e) => ({ ...e, actual }));

export const setConfidence = (
  checkinId: string,
  keyResultId: string,
  confidence: CheckInConfidence | null,
) => patchEntry(checkinId, keyResultId, (e) => ({ ...e, confidence }));

export const setReflection = (checkinId: string, keyResultId: string, reflection: string) =>
  patchEntry(checkinId, keyResultId, (e) => ({ ...e, reflection }));

/** Appends a snapshot and keeps the series sorted by `at`. */
export const addSnapshot = (
  checkinId: string,
  keyResultId: string,
  snapshot: { value: number; note?: string; at?: number },
) =>
  patchEntry(checkinId, keyResultId, (e) => ({
    ...e,
    snapshots: [
      ...e.snapshots,
      { at: snapshot.at ?? Date.now(), value: snapshot.value, ...(snapshot.note ? { note: snapshot.note } : {}) },
    ].sort((a, b) => a.at - b.at),
  }));

/** Removes the snapshot at `index` in the (sorted) series. */
export const removeSnapshot = (checkinId: string, keyResultId: string, index: number) =>
  patchEntry(checkinId, keyResultId, (e) => ({
    ...e,
    snapshots: e.snapshots.filter((_, i) => i !== index),
  }));

/**
 * Appends entries for key results added to the OKR after check-in creation.
 * Never removes existing entries — their logged data is the point of the tool.
 */
export const syncKeyResults = (checkinId: string, okr: OkrRecord): CheckInRecord | undefined => {
  const record = checkinStore.get(checkinId);
  if (!record) return undefined;
  const known = new Set(record.entries.map((e) => e.ref.keyResultId));
  const additions = okr.keyResults.filter((kr) => !known.has(kr.id)).map((kr) => seedEntry(kr, okr.id));
  if (additions.length === 0) return record;
  checkinStore.update(checkinId, { entries: [...record.entries, ...additions] });
  return checkinStore.get(checkinId);
};

/** Count of key results present on the live OKR that this check-in has no entry for. */
export const unsyncedKeyResultCount = (record: CheckInRecord, okr: OkrRecord | undefined): number => {
  if (!okr) return 0;
  const known = new Set(record.entries.map((e) => e.ref.keyResultId));
  return okr.keyResults.filter((kr) => !known.has(kr.id)).length;
};

// -------------------------------------------------------- stale-ref resolution

export type EntryRefState = "live" | "changed" | "removed";

export interface EntryRefResolution {
  state: EntryRefState;
  /** The text to render: live values when `live`, the stored snapshot otherwise. */
  who: string;
  doesWhat: string;
  byHowMuch: string;
}

/**
 * Re-resolves an entry's `OkrKeyResultRef` against `pm-okr-v1` (contract D5):
 * live text when the KR is found and unchanged; the stored snapshot with a
 * `changed`/`removed` marker when the OKR or KR is gone or its text drifted.
 * Never mutates and never cascades a deletion.
 */
export const resolveEntryRef = (entry: KeyResultCheckIn): EntryRefResolution => {
  const snap = entry.krSnapshot;
  const okr = okrStore.get(entry.ref.okrId);
  const kr = okr?.keyResults.find((k) => k.id === entry.ref.keyResultId);
  if (!kr) {
    return { state: "removed", ...snap };
  }
  const matches = kr.who === snap.who && kr.doesWhat === snap.doesWhat && kr.byHowMuch === snap.byHowMuch;
  if (matches) {
    return { state: "live", who: kr.who, doesWhat: kr.doesWhat, byHowMuch: kr.byHowMuch };
  }
  // Text drifted — render the snapshot (what was checked in) with a badge.
  return { state: "changed", ...snap };
};

// ------------------------------------------------------------- trend readout

export type TrendVerdict = "insufficient" | "holding" | "faded" | "mixed";

export interface TrendReadout {
  verdict: TrendVerdict;
  label: string;
}

/**
 * Pure display heuristic (design D4), computed at render time and never
 * persisted so thresholds can be tuned without a storage migration.
 */
export const trendFor = (snapshots: MetricSnapshot[]): TrendReadout => {
  if (snapshots.length < 2) {
    return { verdict: "insufficient", label: "Not enough points yet" };
  }
  const values = [...snapshots].sort((a, b) => a.at - b.at).map((s) => s.value);
  const first = values[0];
  const last = values[values.length - 1];
  const max = Math.max(...values);

  // Last value is the peak (within 5%) → the movement is holding at close.
  if (last >= max * 0.95) {
    return { verdict: "holding", label: "Trend holding" };
  }
  // An earlier snapshot was the peak and more than a third of the gain is gone.
  const gain = max - first;
  const givenBack = max - last;
  if (gain > 0 && givenBack > gain / 3) {
    return { verdict: "faded", label: "Spike faded" };
  }
  return { verdict: "mixed", label: "Mixed" };
};

// ---------------------------------------------------------------- draft handoff

/**
 * Builds the `byHowMuch` baseline for a drafted KR from the achieved actual —
 * "from <actual> to —", left for the user to finish in OKR Organizer. Falls
 * back to the carried-over target text when no actual was logged.
 */
const baselineFrom = (entry: KeyResultCheckIn): string =>
  entry.actual != null ? `from ${entry.actual} to —` : entry.krSnapshot.byHowMuch;

/**
 * The loop-closing handoff (design D5): create a `draft: true` OKR record for
 * `nextQuarter(checkin.quarter)` through OKR Organizer's store, one KR per
 * included entry with a **fresh** `uid("kr")`. Idempotent: while `draftedOkrId`
 * still resolves to a record marked `draft: true`, its key results/objective
 * are rewritten in place; once accepted (draft cleared) or deleted, a fresh
 * draft is created. The source quarter's OKR is never touched.
 *
 * Returns the drafted `OkrRecord`.
 */
export const draftNextQuarterOkr = (
  checkin: CheckInRecord,
  includedKrIds: string[],
): OkrRecord => {
  const included = new Set(includedKrIds);
  const source = okrStore.get(checkin.okrId);
  const keyResults = checkin.entries
    .filter((entry) => included.has(entry.ref.keyResultId))
    .map((entry) => ({
      id: uid("kr"),
      who: entry.krSnapshot.who,
      doesWhat: entry.krSnapshot.doesWhat,
      byHowMuch: baselineFrom(entry),
    }));

  const objective = checkin.okrObjectiveSnapshot;
  const tag = source?.tag ?? { kind: "product" as const, label: "Product" };
  const quarter = nextQuarter(checkin.quarter);

  // Update in place only while the prior draft still exists and is unaccepted.
  const prior = checkin.draftedOkrId ? okrStore.get(checkin.draftedOkrId) : undefined;
  if (prior && isDraft(prior)) {
    okrStore.update(prior.id, { objective, tag, quarter, keyResults });
    return okrStore.get(prior.id) as OkrRecord;
  }

  const created = okrStore.create({
    productId: checkin.productId,
    quarter,
    objective,
    keyResults,
    tag,
    draft: true,
    draftedFrom: { checkinId: checkin.id, quarterKey: quarterKey(checkin.quarter) },
  });
  checkinStore.update(checkin.id, { draftedOkrId: created.id });
  return created;
};

/**
 * Resolution state of a check-in's drafted next-quarter OKR, driving the draft
 * panel's Draft / Update draft / Draft again button.
 */
export type DraftState = "none" | "draft-open" | "accepted-or-gone";

export const draftStateFor = (checkin: CheckInRecord): DraftState => {
  if (!checkin.draftedOkrId) return "none";
  const rec = okrStore.get(checkin.draftedOkrId);
  if (rec && isDraft(rec)) return "draft-open";
  return "accepted-or-gone";
};

// ------------------------------------------------------------------ listing

/** Prior check-ins for the product, most recent quarter first (design D6). */
export const listCheckInsForProduct = (productId: string): CheckInRecord[] =>
  checkinStore.listForProduct(productId).sort((a, b) => compareQuarters(b.quarter, a.quarter));

/** Display title for a check-in in switchers/lists. */
export const titleForCheckIn = (record: CheckInRecord): string =>
  record.okrObjectiveSnapshot.trim() || "Untitled objective";
