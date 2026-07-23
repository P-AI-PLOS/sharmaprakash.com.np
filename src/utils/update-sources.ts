/**
 * Read-only source assembly for the Stakeholder Update Composer.
 *
 * The composer drafts one section per pipeline source that exists for the
 * active product + selected quarter, degrading gracefully when a source is
 * absent (the normal case early in a quarter). It reads sibling data WITHOUT
 * ever mutating it and WITHOUT importing sibling store modules that may not
 * have merged yet (design.md D1):
 *
 *  - OKR Organizer (`pm-okr-v1`) and OKR Check-In (`pm-checkin-v1`) and the
 *    Cadence & Reflection Kit (`pm-cadence-v1`) are read through the published
 *    localStorage keys via `readStore`, typed only against the contract-level
 *    (D8) fields — never tool-internal ones. `okr-store.ts` exists on main;
 *    `checkin-store.ts` / `cadence-store.ts` are parallel lanes and may be
 *    absent, so their keys are read defensively (missing/malformed = absent).
 *  - The Opportunity Solution Tree store (`./ost-store.ts`) predates the
 *    contract, is already on main, and exposes read helpers, so it is imported
 *    directly — read-only (`listTrees` / `getTree` / `getActiveId`), never
 *    written (design.md D2).
 *
 * Contract D8: this tool MUST NOT mutate other tools' records — nothing here
 * exposes a write path.
 *
 * ⚠ Reconciliation note (for the integration orchestrator): the Check-In and
 * Cadence field names below (`entries[].ref/actual/confidence`, and the
 * cadence status-line candidate keys) track the *proposed* sibling shapes. When
 * those lanes merge, reconcile these local interfaces against the real
 * `checkin-store.ts` / `cadence-store.ts` — the contract only fixes `quarter`,
 * `OkrKeyResultRef`, and "actuals/confidence exist per entry".
 */

import {
  quarterKey,
  type OkrKeyResultRef,
  type ProductRecord,
  type QuarterRef,
  type ToolRecordBase,
} from "./pipeline-store";
import {
  getActiveId as ostGetActiveId,
  getTree,
  listTrees,
  titleFor as ostTitleFor,
  type OstRecord,
} from "./ost-store";

// ---------------------------------------------------- contract-level (D8) types

/** OKR Organizer record — only the D8-guaranteed fields. */
export interface OkrSourceRecord extends ToolRecordBase {
  quarter: QuarterRef;
  objective: string;
  keyResults: Array<{ id: string; who: string; doesWhat: string; byHowMuch: string }>;
}

/** One OKR Check-In entry — the contract fixes only that these three exist. */
export interface CheckinEntry {
  ref: OkrKeyResultRef;
  actual: string;
  confidence: number;
}

/** OKR Check-In record — only the D8-guaranteed fields. */
export interface CheckinSourceRecord extends ToolRecordBase {
  quarter: QuarterRef;
  entries: CheckinEntry[];
}

/**
 * Cadence & Reflection Kit record. The contract fixes only `quarter`;
 * everything else is Cadence-Kit-internal, so we read a status line from
 * whatever human-readable field is present and tolerate the absence of any of
 * them (see `cadenceStatusLine`).
 */
export interface CadenceSourceRecord extends ToolRecordBase {
  quarter: QuarterRef;
  [field: string]: unknown;
}

// ------------------------------------------------------------------ storage keys

/** Contract D4 key table. */
export const OKR_SOURCE_KEY = "pm-okr-v1";
export const CHECKIN_SOURCE_KEY = "pm-checkin-v1";
export const CADENCE_SOURCE_KEY = "pm-cadence-v1";

// ------------------------------------------------------------------ read helpers

/**
 * Read-only view of a sibling store: `Record<id, T>` → `T[]`. Silent on every
 * failure (key absent, private mode, malformed JSON, non-object shape) — a
 * source that can't be read is simply an absent source. No write path.
 */
export const readStore = <T extends ToolRecordBase>(key: string): T[] => {
  try {
    if (typeof localStorage === "undefined") return [];
    const raw = localStorage.getItem(key);
    const map = raw ? (JSON.parse(raw) as Record<string, T>) : {};
    if (!map || typeof map !== "object") return [];
    return Object.values(map).filter(
      (record): record is T =>
        !!record && typeof record === "object" && typeof (record as T).id === "string",
    );
  } catch {
    return [];
  }
};

const forProductQuarter = <T extends ToolRecordBase & { quarter: QuarterRef }>(
  records: T[],
  productId: string,
  quarter: QuarterRef,
): T[] =>
  records.filter(
    (record) =>
      record.productId === productId &&
      !!record.quarter &&
      quarterKey(record.quarter) === quarterKey(quarter),
  );

export const readOkrs = (productId: string, quarter: QuarterRef): OkrSourceRecord[] =>
  forProductQuarter(readStore<OkrSourceRecord>(OKR_SOURCE_KEY), productId, quarter).filter(
    (record) => Array.isArray(record.keyResults),
  );

export const readCheckins = (productId: string, quarter: QuarterRef): CheckinSourceRecord[] =>
  forProductQuarter(readStore<CheckinSourceRecord>(CHECKIN_SOURCE_KEY), productId, quarter).filter(
    (record) => Array.isArray(record.entries),
  );

export const readCadences = (productId: string, quarter: QuarterRef): CadenceSourceRecord[] =>
  forProductQuarter(readStore<CadenceSourceRecord>(CADENCE_SOURCE_KEY), productId, quarter);

// ------------------------------------------------------------------ OST resolver

export interface DiscoveryHighlights {
  ostRecordId: string;
  title: string;
  outcome: string;
  /** Texts of opportunities marked `target: true`. */
  targets: string[];
  opportunityCount: number;
  /** Solutions under the targeted opportunities (fallback: all opportunities). */
  solutionCount: number;
}

/**
 * Resolves the discovery tree to draft from (design.md D2): a previously-picked
 * tree if it still exists, else the standalone active tree, else the most
 * recently updated tree, else none.
 */
export const resolveOstRecord = (preferredId?: string): OstRecord | undefined => {
  if (preferredId) {
    const chosen = getTree(preferredId);
    if (chosen) return chosen;
  }
  const activeId = ostGetActiveId("standalone");
  const active = activeId ? getTree(activeId) : undefined;
  if (active) return active;
  return listTrees()[0];
};

/** Every field here exists on `OstTree` today (design.md D2). */
export const highlightsFor = (record: OstRecord): DiscoveryHighlights => {
  const opportunities = record.tree.opportunities ?? [];
  const targets = opportunities.filter((opp) => opp.target);
  const targetTexts = targets.map((opp) => opp.text.trim()).filter(Boolean);
  const scoped = targets.length ? targets : opportunities;
  const solutionCount = scoped.reduce((total, opp) => total + (opp.solutions?.length ?? 0), 0);
  return {
    ostRecordId: record.id,
    title: ostTitleFor(record),
    outcome: record.tree.outcome.trim(),
    targets: targetTexts,
    opportunityCount: opportunities.length,
    solutionCount,
  };
};

/** Trees offered in the composer's discovery-source picker. */
export interface OstChoice {
  id: string;
  label: string;
}

export const listOstChoices = (): OstChoice[] =>
  listTrees().map((record) => ({ id: record.id, label: ostTitleFor(record) }));

// ------------------------------------------------------------------ cadence line

/**
 * A status line from a Cadence record. The Kit's shape is not yet contract
 * code, so we surface the first recognisable human-readable field, else a
 * generic "tracked" line. Reconcile the candidate keys when the lane merges.
 */
export const cadenceStatusLine = (record: CadenceSourceRecord): string => {
  for (const key of ["status", "health", "summary", "note", "state", "headline"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "Cadence tracked for this quarter.";
};

// ------------------------------------------------------------------ assembly

export interface AssembledSources {
  okrs: OkrSourceRecord[];
  checkin?: CheckinSourceRecord;
  cadence?: CadenceSourceRecord;
  discovery?: DiscoveryHighlights;
  /** The resolved OST record, kept for the live drift re-check. */
  ostRecord?: OstRecord;
}

/**
 * Reads localStorage fresh (no long-lived cache of sibling data, design.md
 * risks) and returns whatever exists for the product + quarter. `preferredOstId`
 * pins the discovery tree to a previously-picked one.
 */
export const assembleSources = (
  productId: string,
  quarter: QuarterRef,
  preferredOstId?: string,
): AssembledSources => {
  const ostRecord = resolveOstRecord(preferredOstId);
  return {
    okrs: readOkrs(productId, quarter),
    checkin: readCheckins(productId, quarter)[0],
    cadence: readCadences(productId, quarter)[0],
    discovery: ostRecord ? highlightsFor(ostRecord) : undefined,
    ostRecord,
  };
};

// ------------------------------------------------------------------ coverage

export type SourceStatus = "found" | "missing";

export interface CoverageRow {
  key: "okr" | "discovery" | "cadence" | "adoption";
  label: string;
  status: SourceStatus;
  /** The tool to visit to fill a missing source. */
  hint: string;
  href: string;
  /** OST drift against the draft's snapshot (design.md D5), discovery row only. */
  drift?: "changed" | "removed";
}

/**
 * The four-source coverage panel, recomputed live. `storedOst` is the draft's
 * saved OST snapshot; when the referenced tree is gone or its outcome text has
 * drifted, the discovery row carries a badge (the composed `body` is already
 * plain text, so drift never corrupts it).
 */
export const coverageRows = (
  assembled: AssembledSources,
  storedOst?: { ostRecordId: string; outcomeSnapshot: string },
): CoverageRow[] => {
  let drift: CoverageRow["drift"];
  if (storedOst) {
    const live = getTree(storedOst.ostRecordId);
    if (!live) drift = "removed";
    else if (live.tree.outcome.trim() !== storedOst.outcomeSnapshot.trim()) drift = "changed";
  }

  const discoveryFound = Boolean(
    assembled.discovery &&
      (assembled.discovery.outcome || assembled.discovery.opportunityCount > 0),
  );
  const adoptionFound = Boolean(
    assembled.checkin?.entries.some((entry) => entry.actual?.trim()),
  );

  return [
    {
      key: "okr",
      label: "Objectives & key results",
      status: assembled.okrs.length ? "found" : "missing",
      hint: "OKR Organizer",
      href: "/tools/okr-organizer/",
    },
    {
      key: "discovery",
      label: "Discovery highlights",
      status: discoveryFound ? "found" : "missing",
      hint: "Opportunity Solution Tree",
      href: "/tools/opportunity-solution-tree/",
      drift,
    },
    {
      key: "cadence",
      label: "Delivery cadence",
      status: assembled.cadence ? "found" : "missing",
      hint: "Cadence & Reflection Kit",
      href: "/tools/",
    },
    {
      key: "adoption",
      label: "Adoption signal",
      status: adoptionFound ? "found" : "missing",
      hint: "OKR Check-In",
      href: "/tools/",
    },
  ];
};

// ------------------------------------------------------------------ composition

const krLine = (kr: OkrSourceRecord["keyResults"][number]): string =>
  [kr.who, kr.doesWhat, kr.byHowMuch]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

const confidenceFor = (
  checkin: CheckinSourceRecord | undefined,
  okrId: string,
  keyResultId: string,
): CheckinEntry | undefined =>
  checkin?.entries.find(
    (entry) => entry.ref?.okrId === okrId && entry.ref?.keyResultId === keyResultId,
  );

/**
 * Pure markdown assembly in a fixed section order: headline, Objectives & key
 * results (KR line + confidence where a check-in entry matches its
 * `keyResultId`), Discovery, Delivery cadence, Adoption signal, and an
 * always-present Asks & next steps prompt. Any section whose source is absent
 * is skipped. Deterministic — no dates, no randomness — so it is safe to
 * recompute and safe for a future unit test.
 */
export const composeBody = (
  product: ProductRecord,
  quarter: QuarterRef,
  sources: AssembledSources,
): string => {
  const lines: string[] = [];
  lines.push(`# ${product.name} — stakeholder update (${quarterKey(quarter)})`);

  if (sources.okrs.length) {
    lines.push("", "## Objectives & key results");
    for (const okr of sources.okrs) {
      lines.push("", `**${okr.objective.trim() || "Untitled objective"}**`);
      if (okr.keyResults.length === 0) {
        lines.push("- _No key results yet._");
      }
      for (const kr of okr.keyResults) {
        const entry = confidenceFor(sources.checkin, okr.id, kr.id);
        const confidence = entry ? ` _(confidence ${entry.confidence})_` : "";
        lines.push(`- ${krLine(kr) || "—"}${confidence}`);
      }
    }
  }

  const discovery = sources.discovery;
  if (discovery && (discovery.outcome || discovery.opportunityCount > 0)) {
    lines.push("", "## Discovery");
    if (discovery.outcome) lines.push(`Outcome we're driving: ${discovery.outcome}`);
    if (discovery.targets.length) {
      lines.push("", "Opportunities we're betting on:");
      for (const target of discovery.targets) lines.push(`- ${target}`);
    } else if (discovery.opportunityCount > 0) {
      const n = discovery.opportunityCount;
      lines.push(`${n} ${n === 1 ? "opportunity" : "opportunities"} mapped, none targeted yet.`);
    }
    if (discovery.solutionCount > 0) {
      const n = discovery.solutionCount;
      lines.push(`${n} solution${n === 1 ? "" : "s"} under exploration.`);
    }
  }

  if (sources.cadence) {
    lines.push("", "## Delivery cadence", cadenceStatusLine(sources.cadence));
  }

  const adoption = sources.checkin?.entries.filter((entry) => entry.actual?.trim()) ?? [];
  if (adoption.length) {
    lines.push("", "## Adoption signal");
    for (const entry of adoption) {
      lines.push(`- ${entry.actual.trim()} _(confidence ${entry.confidence})_`);
    }
  }

  lines.push(
    "",
    "## Asks & next steps",
    "- _What do you need from the founder / exec this period? (edit before sending)_",
  );

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
};
