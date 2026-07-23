/**
 * The Test Register's one and only door onto sibling-tool data (design D2).
 *
 * Reads go through the sibling stores' *public exports* — Spec Builder's
 * `listSpecsForProduct` (`src/utils/spec-store.ts`) and Vertical Slicer's
 * `listSessionsForProduct` (`src/utils/slicer-store.ts`) — not their raw
 * localStorage keys. Those modules own the shape of their own records; this
 * file only flattens what they return into the small view the register joins
 * on. If a sibling changes its storage internals, its own list helper absorbs
 * it and the register keeps working.
 *
 * Everything is read-only. Nothing in this file ever writes to localStorage,
 * and it only calls the siblings' read helpers.
 */

import { listSpecsForProduct as listSpecRecords } from "~/utils/spec-store";
import { listSessionsForProduct } from "~/utils/slicer-store";

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

// ------------------------------------------------------------------- specs

/**
 * Specs for a product, each with its acceptance criteria, in the order the
 * Spec Builder store returns them (most recently updated first). Reads through
 * `spec-store`'s public list helper; the store guarantees `[]` on missing or
 * unparsable data.
 */
export const listSpecsForProduct = (productId: string): SourceSpec[] =>
  listSpecRecords(productId).map((spec) => ({
    id: spec.id,
    title: spec.title.trim() || "Untitled spec",
    criteria: spec.acceptanceCriteria.map((criterion) => ({
      id: criterion.id,
      text: criterion.text,
    })),
  }));

// ----------------------------------------------------------------- stories

/**
 * Every sliced story for a product, flattened out of its slicing sessions and
 * tagged with the spec the session was sliced from (`""` for manual sessions,
 * per the contract's `storyRefsFor` rule). Sessions keep the store's order
 * (most recently updated first); stories keep their in-session order. Reads
 * through `slicer-store`'s public list helper.
 */
export const listStoriesForProduct = (productId: string): SourceStory[] =>
  listSessionsForProduct(productId).flatMap((session) => {
    const specId = session.specRef?.specId ?? "";
    const specTitle = session.specTitleSnapshot;

    return session.stories.map((story) => ({
      id: story.id,
      title: story.title,
      specId,
      specTitle,
    }));
  });
