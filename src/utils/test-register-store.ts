/**
 * Test Register — local storage for QA-ring test scenarios, persisted via the
 * pipeline store factory (`./pipeline-store.ts`, key `pm-testreg-v1`, prefix
 * `test` per the data contract's D4 tables).
 *
 * A scenario is a named test tied to at least one Vertical Slicer story and/or
 * Spec Builder acceptance criterion, with the source text snapshotted at link
 * time (contract D5). Staleness — "the spec moved after the test was generated
 * from it" — is the core product behaviour and is **never persisted**: it is
 * re-derived on every load by `resolveScenarioLinks` comparing snapshots to
 * the live sibling data. A stored flag would rot the moment a source changed
 * while the tab was closed, which is exactly the silence this tool exists to
 * break.
 *
 * All sibling reads go through `~/components/tools/test-register/sources` and
 * are strictly read-only: this module never writes `pm-spec-v1` or
 * `pm-slice-v1`.
 */

import {
  createToolStore,
  type AcceptanceCriterionRef,
  type StoryRef,
  type ToolRecordBase,
} from "./pipeline-store";
import {
  listSpecsForProduct,
  listStoriesForProduct,
  type SourceSpec,
  type SourceStory,
} from "~/components/tools/test-register/sources";

// ------------------------------------------------------------------ records

/**
 * The stored lifecycle. "Stale" is deliberately absent — it is derived
 * (`resolveScenarioLinks`) and overrides this value at display time only.
 */
export type AutomationStatus = "not-automated" | "ai-drafted" | "human-reviewed";

/** A story link plus the D5 snapshot taken when it was linked or re-baselined. */
export interface LinkedStory {
  ref: StoryRef;
  /** Snapshot of the story title at link/re-baseline time. */
  storyText: string;
  /** Snapshot of the owning spec's title, so removed sources still group. */
  specTitle: string;
}

/** A criterion link plus its D5 snapshot. */
export interface LinkedCriterion {
  ref: AcceptanceCriterionRef;
  /** Snapshot of the criterion text at link/re-baseline time. */
  criterionText: string;
  /** Snapshot of the owning spec's title, so removed sources still group. */
  specTitle: string;
}

/**
 * One test scenario.
 *
 * Invariant: `stories.length + criteria.length >= 1`. It is enforced at the
 * editor layer (`ScenarioEditor`) and by `unlinkSource` refusing to remove the
 * last link — the type system can't express "at least one across two arrays",
 * so it is documented here and guarded at both write paths.
 */
export interface TestScenarioRecord extends ToolRecordBase {
  // id: uid("test"), productId, createdAt, updatedAt from ToolRecordBase
  description: string;
  stories: LinkedStory[];
  criteria: LinkedCriterion[];
  status: AutomationStatus;
  /** e.g. "e2e/orders/discount-code.spec.ts"; may be "" — never verified to exist. */
  specPath: string;
  notes?: string;
}

export const testRegisterStore = createToolStore<TestScenarioRecord>({
  storageKey: "pm-testreg-v1",
  idPrefix: "test",
});

/** Display labels for the three *stored* statuses. Stale is rendered separately. */
export const STATUS_LABELS: Record<AutomationStatus, string> = {
  "not-automated": "Not automated",
  "ai-drafted": "AI-drafted",
  "human-reviewed": "Human-reviewed",
};

// ------------------------------------------------------------ source lookups

/**
 * A pre-built index over the sibling stores so resolving N scenarios costs one
 * pass over the source data rather than N. Built per render, never persisted.
 */
export interface SourceIndex {
  productId: string;
  specs: SourceSpec[];
  stories: SourceStory[];
  /** specId → spec */
  specById: Map<string, SourceSpec>;
  /** `${specId}::${criterionId}` → criterion text */
  criterionText: Map<string, string>;
  /** storyId → story */
  storyById: Map<string, SourceStory>;
}

const criterionKey = (specId: string, criterionId: string) => `${specId}::${criterionId}`;

export const buildSourceIndex = (productId: string): SourceIndex => {
  const specs = listSpecsForProduct(productId);
  const stories = listStoriesForProduct(productId);

  const specById = new Map(specs.map((spec) => [spec.id, spec]));
  const criterionText = new Map<string, string>();
  for (const spec of specs) {
    for (const criterion of spec.criteria) {
      criterionText.set(criterionKey(spec.id, criterion.id), criterion.text);
    }
  }
  const storyById = new Map(stories.map((story) => [story.id, story]));

  return { productId, specs, stories, specById, criterionText, storyById };
};

// -------------------------------------------------------- drift resolution

/**
 * The state of one link against live source data.
 * - `live`    — source found, text matches the snapshot (whitespace-trimmed)
 * - `changed` — source found, text differs: the regeneration trigger
 * - `removed` — the story/criterion (or its spec) is gone; nothing to re-baseline
 */
export type LinkResolution =
  | { state: "live"; currentText: string }
  | { state: "changed"; currentText: string }
  | { state: "removed" };

export interface ScenarioResolution {
  perStory: LinkResolution[];
  perCriterion: LinkResolution[];
  /** True iff any link is `changed` or `removed`. */
  stale: boolean;
}

/**
 * Whitespace-trimmed exact comparison. Any rewording counts as drift: for
 * AI-generated specs "the words changed" *is* the regeneration trigger, and
 * fuzzy-matching "minor" edits would hide exactly the class of change this
 * tool exists to surface (design D2).
 */
const sameText = (a: string, b: string): boolean => a.trim() === b.trim();

/**
 * Re-resolves every link of a scenario against the sibling stores. Pure with
 * respect to its inputs and free of persistence — the derived `stale` boolean
 * is never written anywhere.
 *
 * Pass a shared `index` when resolving a list; it is built from the record's
 * own `productId` otherwise.
 */
export function resolveScenarioLinks(
  rec: TestScenarioRecord,
  index: SourceIndex = buildSourceIndex(rec.productId),
): ScenarioResolution {
  const perStory: LinkResolution[] = rec.stories.map((link) => {
    const story = index.storyById.get(link.ref.storyId);
    if (!story) return { state: "removed" };
    return sameText(story.title, link.storyText)
      ? { state: "live", currentText: story.title }
      : { state: "changed", currentText: story.title };
  });

  const perCriterion: LinkResolution[] = rec.criteria.map((link) => {
    const current = index.criterionText.get(criterionKey(link.ref.specId, link.ref.criterionId));
    if (current === undefined) return { state: "removed" };
    return sameText(current, link.criterionText)
      ? { state: "live", currentText: current }
      : { state: "changed", currentText: current };
  });

  const stale = [...perStory, ...perCriterion].some((r) => r.state !== "live");

  return { perStory, perCriterion, stale };
}

/** The four *displayed* states — the stored lifecycle with stale as an override. */
export type DisplayStatus = AutomationStatus | "stale";

export const displayStatus = (rec: TestScenarioRecord, resolution: ScenarioResolution): DisplayStatus =>
  resolution.stale ? "stale" : rec.status;

// ---------------------------------------------------------------- scenario CRUD

export const listScenariosForProduct = (productId: string): TestScenarioRecord[] =>
  testRegisterStore.listForProduct(productId);

export const getScenario = (id: string): TestScenarioRecord | undefined => testRegisterStore.get(id);

/** Total link count — the invariant every write path checks. */
export const linkCount = (
  rec: Pick<TestScenarioRecord, "stories" | "criteria">,
): number => rec.stories.length + rec.criteria.length;

export type ScenarioDraft = Pick<
  TestScenarioRecord,
  "description" | "stories" | "criteria" | "status" | "specPath"
> &
  Partial<Pick<TestScenarioRecord, "notes">>;

/**
 * Creates a scenario. Returns `null` when the draft has no links — a scenario
 * that verifies nothing is not a scenario (contract D7: never cascade, but
 * never keep an unanchored record either).
 */
export const createScenario = (
  productId: string,
  draft: ScenarioDraft,
): TestScenarioRecord | null => {
  if (linkCount(draft) < 1) return null;
  return testRegisterStore.create({ productId, ...draft });
};

/** Saves an edit. Refuses (returns `false`) a patch that would strip every link. */
export const saveScenario = (id: string, draft: ScenarioDraft): boolean => {
  if (linkCount(draft) < 1) return false;
  if (!testRegisterStore.get(id)) return false;
  testRegisterStore.update(id, draft);
  return true;
};

export const deleteScenario = (id: string): void => testRegisterStore.remove(id);

// ------------------------------------------------------------- lifecycle (D3)

/**
 * "Mark regenerated": re-snapshots every **changed** link to the source's
 * current text and sets the status to `ai-drafted`.
 *
 * `removed` links are deliberately left alone — there is no current text to
 * re-baseline against, so they must be unlinked instead. The demotion is
 * unconditional: even a `human-reviewed` scenario drops to `ai-drafted`,
 * because an AI-regenerated spec is unreviewed by definition. This is the
 * single most important teaching beat in the tool.
 *
 * Returns `false` when the record is gone.
 */
export const markRegenerated = (id: string, index?: SourceIndex): boolean => {
  const rec = testRegisterStore.get(id);
  if (!rec) return false;
  const source = index ?? buildSourceIndex(rec.productId);
  const resolution = resolveScenarioLinks(rec, source);

  const stories = rec.stories.map((link, i) => {
    const state = resolution.perStory[i];
    if (!state || state.state !== "changed") return link;
    const story = source.storyById.get(link.ref.storyId);
    return {
      ...link,
      storyText: state.currentText,
      specTitle: story?.specTitle || link.specTitle,
    };
  });

  const criteria = rec.criteria.map((link, i) => {
    const state = resolution.perCriterion[i];
    if (!state || state.state !== "changed") return link;
    const spec = source.specById.get(link.ref.specId);
    return {
      ...link,
      criterionText: state.currentText,
      specTitle: spec?.title || link.specTitle,
    };
  });

  testRegisterStore.update(id, { stories, criteria, status: "ai-drafted" });
  return true;
};

/**
 * "Mark reviewed": promotes an `ai-drafted`, non-stale scenario to
 * `human-reviewed`. Refuses (returns `false`) on a stale scenario — reviewing
 * a test whose spec has already moved is the exact false comfort the register
 * is built to deny.
 */
export const markReviewed = (id: string, index?: SourceIndex): boolean => {
  const rec = testRegisterStore.get(id);
  if (!rec) return false;
  if (rec.status !== "ai-drafted") return false;
  if (resolveScenarioLinks(rec, index ?? buildSourceIndex(rec.productId)).stale) return false;
  testRegisterStore.update(id, { status: "human-reviewed" });
  return true;
};

/** Identifies a single link on a scenario, for unlinking. */
export type LinkTarget =
  | { kind: "story"; ref: StoryRef }
  | { kind: "criterion"; ref: AcceptanceCriterionRef };

/**
 * Removes one link. Refuses (returns `false`) when it would be the last one:
 * the visitor either links something else first or deletes the scenario.
 */
export const unlinkSource = (id: string, target: LinkTarget): boolean => {
  const rec = testRegisterStore.get(id);
  if (!rec) return false;
  if (linkCount(rec) <= 1) return false;

  if (target.kind === "story") {
    const stories = rec.stories.filter((link) => link.ref.storyId !== target.ref.storyId);
    if (stories.length === rec.stories.length) return false;
    testRegisterStore.update(id, { stories });
    return true;
  }

  const criteria = rec.criteria.filter(
    (link) =>
      !(link.ref.specId === target.ref.specId && link.ref.criterionId === target.ref.criterionId),
  );
  if (criteria.length === rec.criteria.length) return false;
  testRegisterStore.update(id, { criteria });
  return true;
};

// ------------------------------------------------------------- coverage (D4)

/** One coverable item — an acceptance criterion or a sliced story. */
export interface CoverageItem {
  id: string;
  text: string;
  /** Scenario ids linking this item, whether stale or not. */
  scenarioIds: string[];
}

export interface CoverageBucket {
  /** No linked scenarios at all. */
  uncovered: CoverageItem[];
  /** Linked, but every linking scenario is stale — the AI-debt bucket. */
  staleOnly: CoverageItem[];
  /** Items with ≥1 non-stale scenario. */
  coveredCount: number;
  total: number;
}

export interface SpecCoverage {
  specId: string;
  specTitle: string;
  criteria: CoverageBucket;
  stories: CoverageBucket;
}

export interface CoverageReport {
  specs: SpecCoverage[];
  /** Scenarios whose spec no longer resolves, rendered from their snapshots. */
  orphaned: TestScenarioRecord[];
}

const emptyBucket = (): CoverageBucket => ({
  uncovered: [],
  staleOnly: [],
  coveredCount: 0,
  total: 0,
});

/**
 * Gap-list-first coverage, grouped by spec (design D4). A scenario counts
 * toward coverage only when the *whole scenario* is non-stale: one drifted
 * link poisons its contribution, because a test half-generated from an old
 * spec is not trustworthy coverage.
 */
export function buildCoverage(
  scenarios: TestScenarioRecord[],
  index: SourceIndex,
): CoverageReport {
  const staleById = new Map(
    scenarios.map((rec) => [rec.id, resolveScenarioLinks(rec, index).stale] as const),
  );

  // item key -> scenario ids
  const criterionLinks = new Map<string, string[]>();
  const storyLinks = new Map<string, string[]>();
  for (const rec of scenarios) {
    for (const link of rec.criteria) {
      const key = criterionKey(link.ref.specId, link.ref.criterionId);
      criterionLinks.set(key, [...(criterionLinks.get(key) ?? []), rec.id]);
    }
    for (const link of rec.stories) {
      storyLinks.set(link.ref.storyId, [...(storyLinks.get(link.ref.storyId) ?? []), rec.id]);
    }
  }

  const bucketFor = (items: CoverageItem[]): CoverageBucket => {
    const bucket = emptyBucket();
    bucket.total = items.length;
    for (const item of items) {
      if (item.scenarioIds.length === 0) {
        bucket.uncovered.push(item);
        continue;
      }
      if (item.scenarioIds.some((sid) => staleById.get(sid) === false)) {
        bucket.coveredCount += 1;
        continue;
      }
      bucket.staleOnly.push(item);
    }
    return bucket;
  };

  const specs: SpecCoverage[] = index.specs.map((spec) => ({
    specId: spec.id,
    specTitle: spec.title,
    criteria: bucketFor(
      spec.criteria.map((criterion) => ({
        id: criterion.id,
        text: criterion.text,
        scenarioIds: criterionLinks.get(criterionKey(spec.id, criterion.id)) ?? [],
      })),
    ),
    stories: bucketFor(
      index.stories
        .filter((story) => story.specId === spec.id)
        .map((story) => ({
          id: story.id,
          text: story.title,
          scenarioIds: storyLinks.get(story.id) ?? [],
        })),
    ),
  }));

  const orphaned = scenarios.filter((rec) => {
    const specIds = [
      ...rec.criteria.map((link) => link.ref.specId),
      ...rec.stories.map((link) => link.ref.specId),
    ].filter((specId) => specId !== "");
    return specIds.length > 0 && specIds.every((specId) => !index.specById.has(specId));
  });

  return { specs, orphaned };
}
