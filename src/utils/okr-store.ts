/**
 * Local-first storage for the OKR Organizer (stage 01 of the Donut CRM
 * pipeline, `/tools/okr-organizer/`).
 *
 * Persistence runs on the shared pipeline store factory (`./pipeline-store.ts`,
 * capability `openspec/specs/pipeline-data-contract/spec.md`). Every type,
 * storage key and id prefix below comes from that contract — this module adds
 * only the tool-internal helpers the contract deliberately leaves to each tool.
 *
 * Downstream tools (Backlog Prioritizer, Cadence & Reflection Kit, OKR
 * Check-In, Stakeholder Update Composer) join on `OkrKeyResultRef`
 * (`{ okrId, keyResultId }`), so `OkrRecord.id` and `OkrKeyResult.id` are a
 * published contract: stable from creation, never array indexes, never
 * regenerated on save.
 *
 * localStorage only — nothing here ever leaves the browser, and every write
 * degrades silently when storage is unavailable.
 */

import {
  compareQuarters,
  createToolStore,
  currentQuarter,
  quarterKey,
  resolveActiveProduct,
  uid,
  type QuarterRef,
  type ToolRecordBase,
} from "./pipeline-store";

// ------------------------------------------------------------------ shapes

/**
 * One key result in Jeff Gothelf's customer-centric form: *who* changes their
 * behavior, *what* that observable behavior is, and *by how much* it moves.
 * `byHowMuch` is deliberately free text — real KRs mix percentages, counts,
 * NPS and time-to-X, and no downstream tool computes on the value.
 */
export interface OkrKeyResult {
  /** `uid("kr")` — minted when the row is added, survives edits and reorders. */
  id: string;
  who: string;
  doesWhat: string;
  byHowMuch: string;
}

export type OkrTag = { kind: "department" | "product"; label: string };

/** Provenance for an entry drafted by OKR Check-In (stage 06). */
export interface OkrDraftedFrom {
  checkinId: string;
  quarterKey: string;
}

/**
 * One objective plus its key results, for one quarter. Multiple objectives in
 * a quarter are multiple records sharing the same `quarter` value — the
 * addressable unit is the objective, because that is what `OkrKeyResultRef`
 * points into.
 */
export interface OkrRecord extends ToolRecordBase {
  quarter: QuarterRef;
  objective: string;
  keyResults: OkrKeyResult[];
  tag: OkrTag;
  /**
   * Present (and only ever `true`) while the record is an unaccepted draft
   * handed back by OKR Check-In. Cleared by `acceptDraft`. Only OKR Check-In
   * sets it; records without the field behave exactly as they always have.
   */
  draft?: true;
  /** Retained after acceptance as provenance. */
  draftedFrom?: OkrDraftedFrom;
}

// ------------------------------------------------------------------ keys

/** Contract D4 key table. */
export const OKR_STORAGE_KEY = "pm-okr-v1";
/** Tool-internal UI state, namespaced alongside the store so it stays greppable. */
export const OKR_INTRO_DISMISSED_KEY = "pm-okr-v1-intro-dismissed";

/** More than ~5 key results means the objective isn't focused. */
export const MAX_KEY_RESULTS = 5;

// ------------------------------------------------------------- sample data

/**
 * Seeded once, on a genuinely first run, so the tool teaches the
 * who / does-what / by-how-much form by example instead of by prose. Drop this
 * constant and the `seedSample` call in `migrate` below to ship without it.
 */
export const SAMPLE_OKR: Pick<OkrRecord, "objective" | "tag"> & {
  keyResults: Omit<OkrKeyResult, "id">[];
} = {
  objective: "New bakeries feel Donut CRM is worth paying for before their trial ends",
  tag: { kind: "product", label: "Onboarding" },
  keyResults: [
    {
      who: "Trial bakery owners",
      doesWhat: "complete their first order pipeline",
      byHowMuch: "from 12% to 40% within the trial",
    },
    {
      who: "Trial bakery owners",
      doesWhat: "invite a second person from the shop",
      byHowMuch: "from 1 in 9 trials to 1 in 3",
    },
  ],
};

// ------------------------------------------------------------------ storage

const readRaw = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const writeRaw = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / storage full — the tool still works, just doesn't persist */
  }
};

/** True only when the store key has never been written — deleting every entry persists `{}`. */
const isFirstRun = (): boolean => {
  try {
    return localStorage.getItem(OKR_STORAGE_KEY) === null;
  } catch {
    return false;
  }
};

/**
 * Additive, idempotent: adds the sample entry once, on a first visit, for the
 * product the tools boot into. A visitor who deletes it never gets it back,
 * because by then `pm-okr-v1` exists.
 */
const seedSample = (store: Record<string, OkrRecord>): Record<string, OkrRecord> => {
  if (!isFirstRun() || Object.keys(store).length > 0) return store;

  const now = Date.now();
  const record: OkrRecord = {
    id: uid("okr"),
    productId: resolveActiveProduct().id,
    createdAt: now,
    updatedAt: now,
    quarter: currentQuarter(),
    objective: SAMPLE_OKR.objective,
    tag: SAMPLE_OKR.tag,
    keyResults: SAMPLE_OKR.keyResults.map((kr) => ({ ...kr, id: uid("kr") })),
  };
  store[record.id] = record;
  return store;
};

export const okrStore = createToolStore<OkrRecord>({
  storageKey: OKR_STORAGE_KEY,
  idPrefix: "okr",
  migrate: seedSample,
});

// ------------------------------------------------------------------ helpers

/** A blank key-result row with its id already minted — never id-less, even mid-edit. */
export const newKeyResult = (): OkrKeyResult => ({
  id: uid("kr"),
  who: "",
  doesWhat: "",
  byHowMuch: "",
});

export const titleFor = (record: OkrRecord): string =>
  record.objective.trim() || "Untitled objective";

export const isDraft = (record: OkrRecord): boolean => record.draft === true;

/**
 * Commits a check-in draft: clears `draft`, keeps `draftedFrom` as provenance.
 * (`undefined` is dropped by `JSON.stringify` on persist, so the field is gone
 * on the next read rather than lingering as `draft: undefined`.)
 */
export const acceptDraft = (id: string): void => okrStore.update(id, { draft: undefined });

/** Inverse of the contract's `nextQuarter`. Q1 rolls back into the previous year's Q4. */
export const prevQuarter = (q: QuarterRef): QuarterRef =>
  q.quarter === 1
    ? { year: q.year - 1, quarter: 4 }
    : { year: q.year, quarter: (q.quarter - 1) as QuarterRef["quarter"] };

export interface OkrQuarterGroup {
  /** `quarterKey(quarter)`, e.g. "2026-Q3". */
  key: string;
  quarter: QuarterRef;
  entries: OkrRecord[];
}

/**
 * The product's entries grouped by quarter, most recent quarter first. This is
 * the whole history model — the contract's D6 rule is that history falls out of
 * `listForProduct` + `compareQuarters`, never a second stored shape.
 */
export const entriesByQuarter = (productId: string): OkrQuarterGroup[] => {
  const groups = new Map<string, OkrQuarterGroup>();

  for (const record of okrStore.listForProduct(productId)) {
    const key = quarterKey(record.quarter);
    const group = groups.get(key) ?? { key, quarter: record.quarter, entries: [] };
    group.entries.push(record);
    groups.set(key, group);
  }

  return [...groups.values()].sort((a, b) => compareQuarters(b.quarter, a.quarter));
};

export const listForQuarter = (productId: string, quarter: QuarterRef): OkrRecord[] =>
  okrStore
    .listForProduct(productId)
    .filter((record) => compareQuarters(record.quarter, quarter) === 0);

// ------------------------------------------------------- intro-dismissed flag

export const isIntroDismissed = (): boolean => readRaw<boolean>(OKR_INTRO_DISMISSED_KEY) === true;

export const setIntroDismissed = (dismissed: boolean): void =>
  writeRaw(OKR_INTRO_DISMISSED_KEY, dismissed);
