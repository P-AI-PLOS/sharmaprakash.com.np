/**
 * Stakeholder Update Composer — the pipeline's Founder ring
 * (`/tools/stakeholder-update-composer/`, contract table row 8: "reads any of
 * the above, read by nobody").
 *
 * Persistence runs on the shared pipeline store factory (`./pipeline-store.ts`,
 * capability `openspec/specs/pipeline-data-contract/spec.md`, key `pm-update-v1`
 * / prefix `upd` per the D4 tables). A draft is one editable markdown `body`
 * plus snapshot source refs recording which sibling records fed the last
 * compose (for the coverage panel and the OST drift badge).
 *
 * The *reading* of sibling stores lives in `./update-sources.ts` — this module
 * owns only the composer's own records and never writes to another tool's key.
 *
 * localStorage only — nothing here ever leaves the browser, and every write
 * degrades silently when storage is unavailable.
 */

import {
  createToolStore,
  type QuarterRef,
  type ToolRecordBase,
} from "./pipeline-store";

// ------------------------------------------------------------------ shapes

/**
 * What fed the last compose. Ids are provenance markers (coverage is
 * recomputed live from localStorage, see `update-sources.coverageRows`); the
 * OST snapshot additionally drives the D5 drift badge, since `OstRecord` has no
 * `productId` and so "the product's tree" can only be a user-picked reference.
 */
export interface UpdateSourceRefs {
  okrId?: string; // uid("okr") of an objective present at compose time
  checkinId?: string; // uid("chk")
  cadenceId?: string; // uid("cad")
  ost?: { ostRecordId: string; outcomeSnapshot: string };
}

export interface UpdateRecord extends ToolRecordBase {
  quarter: QuarterRef;
  /** Default: `${product.name} update — ${quarterKey(quarter)}`. */
  title: string;
  /** The editable markdown — single source of truth after compose. */
  body: string;
  /** What fed the last compose (coverage + drift badges). */
  sources: UpdateSourceRefs;
  /** When `body` was last regenerated from sources; compare to `updatedAt`. */
  composedAt: number;
}

// ------------------------------------------------------------------ store

/** Contract D4 key table. */
export const UPDATE_STORAGE_KEY = "pm-update-v1";

export const updateStore = createToolStore<UpdateRecord>({
  storageKey: UPDATE_STORAGE_KEY,
  idPrefix: "upd",
});

// ------------------------------------------------------------------ helpers

export const titleFor = (record: UpdateRecord): string =>
  record.title.trim() || "Untitled update";

/** True once the human has edited `body` since the last compose (D3 warning). */
export const editedSinceCompose = (record: UpdateRecord): boolean =>
  record.updatedAt > record.composedAt;

/** Words in the draft body — for the editor's live count. */
export const wordCount = (body: string): number => {
  const trimmed = body.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
};
