/**
 * Local-first storage for Spec Builder records — stage 03 (Definition) of the
 * Donut CRM pipeline. A spec turns one OST pick (a starred opportunity plus one
 * of its solutions) into a written artifact in one of three formats, with
 * stable acceptance-criterion ids that Vertical Slicer (`SpecRef`) and Test
 * Register (`AcceptanceCriterionRef`) join against.
 *
 * Persistence runs on the shared pipeline store factory (`./pipeline-store.ts`,
 * capability `openspec/specs/pipeline-data-contract/spec.md`). OST data is read
 * strictly one-directionally: this module imports `getTree`/`listTrees` from
 * `./ost-store.ts` and never writes to it.
 */

import {
  createToolStore,
  resolveActiveProduct,
  uid,
  type OstPickRef,
  type ToolRecordBase,
} from "./pipeline-store";
import { getTree } from "./ost-store";

export type SpecFormat = "prd" | "shape-up-pitch" | "story-map";

/** The framing answer — "what's the job here?" (D3). `null` = skipped. */
export type SpecFramingJob = "align" | "handoff" | "sequence";

export interface SpecCriterion {
  /** `uid("ac")` — stable across edits, reorders and sibling deletions. */
  id: string;
  text: string;
}

export interface SpecRecord extends ToolRecordBase {
  /** Defaults from the picked solution text. */
  title: string;
  /** `null` = manual entry (visitor had no trees yet). */
  sourcePick: OstPickRef | null;
  framingJob: SpecFramingJob | null;
  format: SpecFormat;
  /** Keyed by the format's section keys (D4); kept across format switches. */
  sections: Record<string, string>;
  acceptanceCriteria: SpecCriterion[];
}

const STORE_KEY = "pm-spec-v1";

// --------------------------------------------------------------- format tables

/** Which section keys each format renders, in order (design.md D4). */
export const SPEC_SECTION_KEYS: Record<SpecFormat, readonly string[]> = {
  prd: ["problem", "outcome", "nonGoals", "successMetric"],
  "shape-up-pitch": ["problem", "appetite", "solution", "rabbitHoles", "noGos"],
  "story-map": ["backbone", "walkingSkeleton", "laterSlices"],
};

export interface SpecSectionMeta {
  label: string;
  hint: string;
  placeholder: string;
}

/** Label + prompt for every section key across all three formats. */
export const SPEC_SECTION_META: Record<string, SpecSectionMeta> = {
  problem: {
    label: "Problem",
    hint: "The customer need, in their words — straight from the opportunity.",
    placeholder: "e.g. I lose track of which trials my teammates already called…",
  },
  outcome: {
    label: "Outcome",
    hint: "What changes for the customer, and for the business, when this ships.",
    placeholder: "e.g. Reps see one shared call history, so nobody double-calls a trial.",
  },
  nonGoals: {
    label: "Non-goals",
    hint: "What this deliberately does not cover — the scope fence.",
    placeholder: "e.g. No call recording. No dialer integration.",
  },
  successMetric: {
    label: "Success metric",
    hint: "One number that moves if this works.",
    placeholder: "e.g. Duplicate outreach on a trial account drops below 5%.",
  },
  appetite: {
    label: "Appetite",
    hint: "How much time this is worth — the budget, not the estimate.",
    placeholder: "e.g. Six weeks, one designer and one engineer.",
  },
  solution: {
    label: "Solution",
    hint: "The shaped approach at the right level of abstraction — fat marker, not wireframe.",
    placeholder: "e.g. A shared activity strip on the account record…",
  },
  rabbitHoles: {
    label: "Rabbit holes",
    hint: "Details worth calling out now so nobody falls in later.",
    placeholder: "e.g. Timezone handling on the activity timestamps.",
  },
  noGos: {
    label: "No-gos",
    hint: "Explicitly out of bounds for this appetite.",
    placeholder: "e.g. Not touching the permissions model.",
  },
  backbone: {
    label: "Backbone",
    hint: "The user's journey left to right — one activity per line.",
    placeholder: "Find the account\nSee what happened\nLog the call",
  },
  walkingSkeleton: {
    label: "Walking skeleton",
    hint: "The thinnest slice that goes end to end — one story per line.",
    placeholder: "See the last five activities on an account",
  },
  laterSlices: {
    label: "Later slices",
    hint: "Everything that comes after the first release — one per line.",
    placeholder: "Filter activity by teammate\nExport the timeline",
  },
};

export interface SpecFormatMeta {
  value: SpecFormat;
  label: string;
  /** What job the format does — the framing card's answers map onto these. */
  blurb: string;
  icon: string;
}

export const SPEC_FORMATS: readonly SpecFormatMeta[] = [
  {
    value: "prd",
    label: "Lightweight PRD",
    blurb: "Hands off unambiguous scope: problem, outcome, non-goals, success metric.",
    icon: "📋",
  },
  {
    value: "shape-up-pitch",
    label: "Shape Up pitch",
    blurb: "Aligns a room: problem, appetite, shaped solution, rabbit holes, no-gos.",
    icon: "🧭",
  },
  {
    value: "story-map",
    label: "Story-map outline",
    blurb: "Sequences a release: backbone, walking skeleton, later slices.",
    icon: "🗺️",
  },
];

export interface SpecFramingMeta {
  value: SpecFramingJob;
  label: string;
  suggests: SpecFormat;
}

/** "What's the job here?" — each answer suggests (never locks) a format (D3). */
export const SPEC_FRAMING_JOBS: readonly SpecFramingMeta[] = [
  { value: "align", label: "Align a room", suggests: "shape-up-pitch" },
  { value: "handoff", label: "Hand off unambiguous scope", suggests: "prd" },
  { value: "sequence", label: "Sequence a release", suggests: "story-map" },
];

export const suggestedFormatFor = (job: SpecFramingJob | null): SpecFormat | null =>
  SPEC_FRAMING_JOBS.find((f) => f.value === job)?.suggests ?? null;

export const formatLabel = (format: SpecFormat): string =>
  SPEC_FORMATS.find((f) => f.value === format)?.label ?? format;

export const sectionLabel = (key: string): string => SPEC_SECTION_META[key]?.label ?? key;

// ------------------------------------------------------------------- OST picks

export interface ResolvedPick {
  /** live = source unchanged · drifted = text edited · missing = record or node gone. */
  status: "live" | "drifted" | "missing";
  /** Always the pick-time snapshot — renderable even when the source is gone (D5). */
  opportunityText: string;
  solutionText: string;
  /** Present only while the source node still exists. */
  currentOpportunityText?: string;
  currentSolutionText?: string;
}

/**
 * Re-resolves a stored pick against live OST data, per contract rule D5:
 * render the snapshot, badge the drift, never block editing or clear the ref.
 * Reads ost-store's existing exports only — the dependency arrow points one way.
 */
export const resolvePick = (pick: OstPickRef): ResolvedPick => {
  const snapshot = { opportunityText: pick.opportunityText, solutionText: pick.solutionText };

  const record = getTree(pick.ostRecordId);
  if (!record) return { status: "missing", ...snapshot };

  const opportunity = record.tree.opportunities.find((o) => o.id === pick.opportunityId);
  const solution = opportunity?.solutions.find((s) => s.id === pick.solutionId);
  if (!opportunity || !solution) return { status: "missing", ...snapshot };

  const drifted =
    opportunity.text !== pick.opportunityText || solution.text !== pick.solutionText;

  return {
    status: drifted ? "drifted" : "live",
    ...snapshot,
    currentOpportunityText: opportunity.text,
    currentSolutionText: solution.text,
  };
};

/** Human label for a resolved pick's status, used by the badge. */
export const pickStatusLabel = (status: ResolvedPick["status"]): string | null =>
  status === "drifted" ? "Source changed" : status === "missing" ? "Source removed" : null;

/**
 * Seed text a pick contributes to a format's sections. Only ever fills sections
 * the visitor has left empty (see `applyPickSeeds`).
 */
export const seedsForPick = (
  opportunityText: string,
  solutionText: string,
  format: SpecFormat,
): Record<string, string> => {
  switch (format) {
    case "prd":
      return { problem: opportunityText, outcome: solutionText };
    case "shape-up-pitch":
      return { problem: opportunityText, solution: solutionText };
    case "story-map":
      return { backbone: solutionText };
  }
};

/** Merges pick seeds into sections without ever overwriting entered text. */
export const applyPickSeeds = (
  sections: Record<string, string>,
  opportunityText: string,
  solutionText: string,
  format: SpecFormat,
): Record<string, string> => {
  const merged = { ...sections };
  for (const [key, value] of Object.entries(seedsForPick(opportunityText, solutionText, format))) {
    if (!merged[key]?.trim() && value.trim()) merged[key] = value;
  }
  return merged;
};

// ----------------------------------------------------------------- the store

const store = createToolStore<SpecRecord>({ storageKey: STORE_KEY, idPrefix: "spec" });

export const newCriterion = (text = ""): SpecCriterion => ({ id: uid("ac"), text });

export const listSpecs = (): SpecRecord[] => store.list();

export const listSpecsForProduct = (productId: string): SpecRecord[] =>
  store.listForProduct(productId);

export const getSpec = (id: string): SpecRecord | undefined => store.get(id);

export const titleForSpec = (record: SpecRecord): string => record.title.trim() || "Untitled spec";

export interface NewSpecInput {
  title?: string;
  sourcePick?: OstPickRef | null;
  framingJob?: SpecFramingJob | null;
  format?: SpecFormat;
  sections?: Record<string, string>;
  acceptanceCriteria?: SpecCriterion[];
}

/** Creates a spec stamped with the active product (D6). */
export const createSpec = (input: NewSpecInput = {}): SpecRecord => {
  const format = input.format ?? "prd";
  const pick = input.sourcePick ?? null;
  const sections = pick
    ? applyPickSeeds(input.sections ?? {}, pick.opportunityText, pick.solutionText, format)
    : (input.sections ?? {});

  return store.create({
    productId: resolveActiveProduct().id,
    title: input.title ?? (pick?.solutionText || ""),
    sourcePick: pick,
    framingJob: input.framingJob ?? null,
    format,
    sections,
    acceptanceCriteria: input.acceptanceCriteria ?? [],
  });
};

export const updateSpec = (
  id: string,
  patch: Partial<Omit<SpecRecord, "id" | "createdAt">>,
): void => store.update(id, patch);

export const deleteSpec = (id: string): void => store.remove(id);

export const getActiveSpecId = (productId: string): string | null => store.getActiveId(productId);

export const setActiveSpecId = (productId: string, id: string): void =>
  store.setActiveId(productId, id);

/**
 * The spec a visit should open: the remembered one if it still exists, else the
 * most recent for this product, else a fresh empty spec.
 */
export const resolveActiveSpec = (productId: string): SpecRecord => {
  const activeId = getActiveSpecId(productId);
  const remembered = activeId ? getSpec(activeId) : undefined;
  if (remembered && remembered.productId === productId) return remembered;

  const existing = listSpecsForProduct(productId)[0];
  if (existing) {
    setActiveSpecId(productId, existing.id);
    return existing;
  }

  const created = createSpec();
  setActiveSpecId(productId, created.id);
  return created;
};

export { resolveActiveProduct, uid };
export type { OstPickRef, ToolRecordBase };
export type { SpecRef, AcceptanceCriterionRef } from "./pipeline-store";
