/**
 * The Test Register's one and only door onto sibling-tool data (design D2).
 *
 * Spec Builder (`pm-spec-v1`) and Vertical Slicer (`pm-slice-v1`) land in
 * parallel lanes, so every read here goes through the *storage keys and
 * structural shapes fixed by the pipeline data contract* rather than through
 * the sibling modules themselves — the same defensive posture the Vertical
 * Slicer already uses to read specs (`slicer-store.ts` → `listSpecsForProduct`).
 * If a sibling renames a module, bumps a key, or ships a half-typed export,
 * only this file changes and the register keeps working with empty pickers.
 *
 * Everything is read-only. Nothing in this file ever writes to localStorage.
 */

// ------------------------------------------------------------------- shapes

/** An acceptance criterion as the register needs it. */
export interface SourceCriterion {
  id: string;
  text: string;
}

/** A Spec Builder spec, flattened to what the register renders and joins on. */
export interface SourceSpec {
  id: string;
  title: string;
  criteria: SourceCriterion[];
}

/** A Vertical Slicer story, carrying its owning spec for grouping. */
export interface SourceStory {
  id: string;
  title: string;
  /** `""` when the slicing session wasn't linked to a spec (contract D1). */
  specId: string;
  /** Snapshot-friendly title of the owning spec; `""` for manual sessions. */
  specTitle: string;
}

export const SPEC_STORAGE_KEY = "pm-spec-v1";
export const SLICE_STORAGE_KEY = "pm-slice-v1";

const UNTITLED_SPEC = "Untitled spec";

// -------------------------------------------------------------- raw reading

/** Parses a `Record<id, record>` localStorage blob, or `[]` on anything odd. */
const readRecords = (storageKey: string): Record<string, unknown>[] => {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(storageKey);
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

  return Object.values(parsed as Record<string, unknown>).filter(
    (value): value is Record<string, unknown> => !!value && typeof value === "object",
  );
};

const str = (value: unknown): string => (typeof value === "string" ? value : "");

const numeric = (value: unknown): number => (typeof value === "number" ? value : 0);

// ------------------------------------------------------------------- specs

/**
 * Specs for a product, most recently updated first, each with its acceptance
 * criteria. Tolerates `title` vs `name`, missing/!array `acceptanceCriteria`,
 * and criteria missing ids or text.
 */
export const listSpecsForProduct = (productId: string): SourceSpec[] =>
  readRecords(SPEC_STORAGE_KEY)
    .filter((record) => str(record.id) !== "" && record.productId === productId)
    .sort((a, b) => numeric(b.updatedAt) - numeric(a.updatedAt))
    .map((record) => ({
      id: str(record.id),
      title: str(record.title).trim() || str(record.name).trim() || UNTITLED_SPEC,
      criteria: Array.isArray(record.acceptanceCriteria)
        ? record.acceptanceCriteria
            .filter(
              (criterion: unknown): criterion is Record<string, unknown> =>
                !!criterion && typeof criterion === "object" && str((criterion as Record<string, unknown>).id) !== "",
            )
            .map((criterion) => ({ id: str(criterion.id), text: str(criterion.text) }))
        : [],
    }));

// ----------------------------------------------------------------- stories

/**
 * Every sliced story for a product, flattened out of its slicing sessions and
 * tagged with the spec the session was sliced from (`""` for manual sessions,
 * per the contract's `storyRefsFor` rule). Sessions are ordered most recently
 * updated first; stories keep their in-session order.
 */
export const listStoriesForProduct = (productId: string): SourceStory[] =>
  readRecords(SLICE_STORAGE_KEY)
    .filter((record) => record.productId === productId)
    .sort((a, b) => numeric(b.updatedAt) - numeric(a.updatedAt))
    .flatMap((session) => {
      const specRef = session.specRef;
      const specId =
        !!specRef && typeof specRef === "object" ? str((specRef as Record<string, unknown>).specId) : "";
      const specTitle = str(session.specTitleSnapshot);
      const stories = Array.isArray(session.stories) ? session.stories : [];

      return stories
        .filter(
          (story: unknown): story is Record<string, unknown> =>
            !!story && typeof story === "object" && str((story as Record<string, unknown>).id) !== "",
        )
        .map((story) => ({
          id: str(story.id),
          title: str(story.title),
          specId,
          specTitle,
        }));
    });
