/**
 * Cadence & Reflection Kit — stage 05 (Delivery Cadence) of the Donut CRM
 * pipeline, served at `/tools/cadence-reflection-kit/`.
 *
 * Persistence runs on the shared pipeline store factory (`./pipeline-store.ts`,
 * capability `openspec/specs/pipeline-data-contract/spec.md`, key `pm-cadence-v1`,
 * id prefix `cad` from the D4 tables). One record per product per quarter, with
 * a chosen `mode` gating the tracking UI (design D1/D3).
 *
 * OKR linkage (demo checklist, design D5) reads the OKR Organizer's data through
 * the raw `pm-okr-v1` key defensively — the same decoupling the Vertical Slicer
 * uses for `pm-spec-v1`. It deliberately does NOT call `okr-store`'s list methods:
 * those run the sample-seed migration on first touch, which would silently seed
 * OKR data from this tool and hide the "no OKR data" empty state D5 requires. The
 * OKR *types* are imported type-only (erased at build, no runtime coupling, no
 * seed) so the reader stays honest against the contract's OKR shape.
 *
 * localStorage only — nothing here ever leaves the browser, and every write
 * degrades silently when storage is unavailable.
 */

import {
  compareQuarters,
  createToolStore,
  uid,
  type OkrKeyResultRef,
  type QuarterRef,
  type ToolRecordBase,
} from "./pipeline-store";
import type { OkrKeyResult, OkrRecord } from "./okr-store";

// ------------------------------------------------------------------ shapes (D2)

export type CadenceMode = "sprint" | "flow" | "scrumban";

/** One hand-entered tracking period (an iteration or a week, per mode). */
export interface CadencePeriod {
  id: string; // uid("cad") — stable, reorder-safe
  label: string; // "Sprint 3" / "Week of Jul 20"
  // sprint: committed + completed points (velocity; burndown is the delta list)
  committed?: number;
  completed?: number;
  // flow / scrumban: WIP snapshot + finished-item cycle times (days)
  wipLimit?: number;
  wipObserved?: number;
  cycleTimesDays?: number[];
  // scrumban only: did the lightweight planning ritual happen this period?
  planningHeld?: boolean;
}

export type RetroActionStatus = "open" | "done" | "carried-over";

export interface RetroEntry {
  id: string; // uid("cad")
  date: number; // epoch ms
  wentWell: string;
  didntGoWell: string;
  action: string; // exactly ONE committed action — singular by schema
  actionStatus: RetroActionStatus;
}

export interface DemoItem {
  id: string; // uid("cad")
  date: number;
  what: string; // what is being demoed
  keyResult: OkrKeyResultRef | null; // "which KR does this move" — asked first
  keyResultSnapshot: string; // D5 snapshot of the KR text at link time ("" if none)
  done: boolean;
}

export interface CadenceRecord extends ToolRecordBase {
  quarter: QuarterRef;
  mode: CadenceMode | null;
  periods: CadencePeriod[];
  retros: RetroEntry[];
  demos: DemoItem[];
}

// ------------------------------------------------------------------ keys

/** Contract D4 key table. */
export const CADENCE_STORAGE_KEY = "pm-cadence-v1";

export const cadenceStore = createToolStore<CadenceRecord>({
  storageKey: CADENCE_STORAGE_KEY,
  idPrefix: "cad",
});

// ---------------------------------------------------------- record resolution

/**
 * The current-quarter record for a product, creating an empty (`mode: null`)
 * one if none exists. History is other quarters' records, found the same way
 * (`listForProduct` + `compareQuarters`), never a second stored shape (D1/D6).
 */
export const resolveQuarterRecord = (productId: string, quarter: QuarterRef): CadenceRecord => {
  const existing = cadenceStore
    .listForProduct(productId)
    .find((r) => compareQuarters(r.quarter, quarter) === 0);
  if (existing) return existing;
  return cadenceStore.create({
    productId,
    quarter,
    mode: null,
    periods: [],
    retros: [],
    demos: [],
  });
};

/** This product's cadence records in chronological (compareQuarters) order. */
export const listQuartersForProduct = (productId: string): CadenceRecord[] =>
  cadenceStore
    .listForProduct(productId)
    .slice()
    .sort((a, b) => compareQuarters(a.quarter, b.quarter));

// ------------------------------------------------------------------ mutators
//
// Each mints `uid("cad")` ids for nested line items and routes through
// `store.update` so `updatedAt` bumps (task 2.2). They return the freshly
// persisted record so React can adopt it without a second read.

const patchRecord = (
  id: string,
  mutate: (record: CadenceRecord) => Partial<Omit<CadenceRecord, "id" | "createdAt">>,
): CadenceRecord | undefined => {
  const record = cadenceStore.get(id);
  if (!record) return undefined;
  cadenceStore.update(id, mutate(record));
  return cadenceStore.get(id);
};

export const setMode = (id: string, mode: CadenceMode): CadenceRecord | undefined =>
  patchRecord(id, () => ({ mode }));

export const addPeriod = (id: string, label: string): CadenceRecord | undefined =>
  patchRecord(id, (r) => ({
    periods: [...r.periods, { id: uid("cad"), label }],
  }));

export const updatePeriod = (
  id: string,
  periodId: string,
  patch: Partial<Omit<CadencePeriod, "id">>,
): CadenceRecord | undefined =>
  patchRecord(id, (r) => ({
    periods: r.periods.map((p) => (p.id === periodId ? { ...p, ...patch } : p)),
  }));

export const removePeriod = (id: string, periodId: string): CadenceRecord | undefined =>
  patchRecord(id, (r) => ({ periods: r.periods.filter((p) => p.id !== periodId) }));

/** Retro entries are stored newest-first; a new entry always starts `open`. */
export const addRetro = (
  id: string,
  data: Pick<RetroEntry, "wentWell" | "didntGoWell" | "action">,
): CadenceRecord | undefined =>
  patchRecord(id, (r) => ({
    retros: [
      { id: uid("cad"), date: Date.now(), actionStatus: "open" as const, ...data },
      ...r.retros,
    ],
  }));

export const setRetroActionStatus = (
  id: string,
  retroId: string,
  actionStatus: RetroActionStatus,
): CadenceRecord | undefined =>
  patchRecord(id, (r) => ({
    retros: r.retros.map((e) => (e.id === retroId ? { ...e, actionStatus } : e)),
  }));

export const addDemo = (
  id: string,
  data: Pick<DemoItem, "what" | "keyResult" | "keyResultSnapshot">,
): CadenceRecord | undefined =>
  patchRecord(id, (r) => ({
    demos: [{ id: uid("cad"), date: Date.now(), done: false, ...data }, ...r.demos],
  }));

export const updateDemo = (
  id: string,
  demoId: string,
  patch: Partial<Omit<DemoItem, "id">>,
): CadenceRecord | undefined =>
  patchRecord(id, (r) => ({
    demos: r.demos.map((d) => (d.id === demoId ? { ...d, ...patch } : d)),
  }));

export const removeDemo = (id: string, demoId: string): CadenceRecord | undefined =>
  patchRecord(id, (r) => ({ demos: r.demos.filter((d) => d.id !== demoId) }));

// -------------------------------------------------------------- metric helpers
//
// Pure, exported, and kept in the store module so `pnpm check` consumers (and
// the future Stakeholder Update Composer) can reuse them (task 2.3).

/** The metric fields each mode actually reads. Drives the mode-switch note. */
const NATIVE_FIELDS: Record<CadenceMode, (keyof CadencePeriod)[]> = {
  sprint: ["committed", "completed"],
  flow: ["wipLimit", "wipObserved", "cycleTimesDays"],
  scrumban: ["wipLimit", "wipObserved", "cycleTimesDays", "planningHeld"],
};

const ALL_METRIC_FIELDS: (keyof CadencePeriod)[] = [
  "committed",
  "completed",
  "wipLimit",
  "wipObserved",
  "cycleTimesDays",
  "planningHeld",
];

const hasValue = (period: CadencePeriod, field: keyof CadencePeriod): boolean => {
  const value = period[field];
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null;
};

/**
 * True when any period carries metric data belonging to a mode other than the
 * current one — i.e. the record was tracked under a different mode earlier
 * (design D3). Derived from the data itself, so it survives a reload.
 */
export const hasForeignPeriodData = (periods: CadencePeriod[], mode: CadenceMode): boolean => {
  const native = new Set<keyof CadencePeriod>(NATIVE_FIELDS[mode]);
  return periods.some((p) =>
    ALL_METRIC_FIELDS.some((field) => !native.has(field) && hasValue(p, field)),
  );
};

/** Rolling velocity: mean of the last N periods that recorded a `completed` value. */
export const rollingVelocity = (periods: CadencePeriod[], window = 3): number | null => {
  const completed = periods
    .map((p) => p.completed)
    .filter((n): n is number => typeof n === "number");
  if (completed.length === 0) return null;
  const last = completed.slice(-window);
  return last.reduce((sum, n) => sum + n, 0) / last.length;
};

/** Median of a single period's finished-item cycle times, or null when none. */
export const medianCycleTime = (period: CadencePeriod): number | null => {
  const times = (period.cycleTimesDays ?? []).filter((n): n is number => typeof n === "number");
  if (times.length === 0) return null;
  const sorted = [...times].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** Whether a period's observed WIP is over its limit (both must be set). */
export const isWipBreached = (period: CadencePeriod): boolean =>
  typeof period.wipLimit === "number" &&
  typeof period.wipObserved === "number" &&
  period.wipObserved > period.wipLimit;

// -------------------------------------------------- OKR read (defensive, D5)

/** A pickable key result: the ref plus display text and its parent objective. */
export interface KeyResultOption {
  ref: OkrKeyResultRef;
  objective: string;
  text: string;
}

/** How a demo item's stored KR ref resolves against live OKR data today (D5). */
export type KeyResultResolution =
  | { status: "live"; text: string }
  | { status: "changed"; text: string } // still exists, but text differs from snapshot
  | { status: "missing" }; // objective or KR gone

/** The KR's one-line human form, snapshotted at link time and shown thereafter. */
export const keyResultText = (kr: Pick<OkrKeyResult, "who" | "doesWhat" | "byHowMuch">): string => {
  const lead = [kr.who.trim(), kr.doesWhat.trim()].filter(Boolean).join(" ");
  const by = kr.byHowMuch.trim();
  return by ? `${lead} — ${by}` : lead;
};

/**
 * Defensive read of every OKR record for a product, straight off `pm-okr-v1`.
 * Never imports okr-store's runtime (so it can't trigger the sample seed) and
 * never throws — bad/absent data yields `[]`.
 */
const readOkrRecordsForProduct = (productId: string): OkrRecord[] => {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem("pm-okr-v1");
  } catch {
    return [];
  }
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!parsed || typeof parsed !== "object") return [];

  return Object.values(parsed as Record<string, OkrRecord>).filter(
    (r): r is OkrRecord =>
      !!r &&
      typeof r === "object" &&
      typeof r.id === "string" &&
      r.productId === productId &&
      Array.isArray(r.keyResults),
  );
};

/**
 * Every key result the active product can link a demo to, for the given
 * quarter, as flat `KeyResultOption`s. Empty when the OKR Organizer has no data
 * for the product/quarter — the demo checklist's D5 empty-state trigger.
 */
export const listKeyResultOptions = (
  productId: string,
  quarter: QuarterRef,
): KeyResultOption[] => {
  const options: KeyResultOption[] = [];
  for (const okr of readOkrRecordsForProduct(productId)) {
    if (!okr.quarter || compareQuarters(okr.quarter, quarter) !== 0) continue;
    for (const kr of okr.keyResults) {
      if (!kr || typeof kr.id !== "string") continue;
      options.push({
        ref: { okrId: okr.id, keyResultId: kr.id },
        objective: okr.objective ?? "",
        text: keyResultText(kr),
      });
    }
  }
  return options;
};

/**
 * Re-resolves a demo item's stored `OkrKeyResultRef` against live OKR data for
 * the D5 badge rule: `live` when it still reads as the snapshot, `changed` when
 * the KR exists but its text moved, `missing` when the objective or KR is gone.
 * A null ref is treated as `missing` so callers render the snapshot/marker.
 */
export const resolveKeyResult = (
  productId: string,
  ref: OkrKeyResultRef | null,
  snapshot: string,
): KeyResultResolution => {
  if (!ref) return { status: "missing" };
  const okr = readOkrRecordsForProduct(productId).find((r) => r.id === ref.okrId);
  const kr = okr?.keyResults.find((k) => k && k.id === ref.keyResultId);
  if (!kr) return { status: "missing" };
  const current = keyResultText(kr);
  if (current !== snapshot) return { status: "changed", text: current };
  return { status: "live", text: current };
};
