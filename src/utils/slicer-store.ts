/**
 * Vertical Slicer — local storage for slicing sessions, persisted via the
 * pipeline store factory (`./pipeline-store.ts`, key `pm-slice-v1`, prefix
 * `slice` per the data contract's D4 tables).
 *
 * A SliceSession is "one big feature being sliced". Its stories nest inside it
 * (like OST opportunities nest in a tree) rather than getting their own store —
 * they are only ever edited in the context of their session. Downstream tools
 * (Backlog Prioritizer, Test Register) join on a StorySlice's stable
 * `uid("story")` id via `storyRefsFor` / `resolveStory`.
 *
 * The spec link reads the raw `pm-spec-v1` localStorage key defensively (see
 * `listSpecsForProduct`) and NEVER imports Spec Builder's module — that module
 * is a sibling lane's deliverable and the contract only fixes the key + that
 * specs carry an id, a productId, and a human-readable title-ish field (D2).
 */
import {
  createToolStore,
  uid,
  type StoryRef,
  type SpecRef,
  type ToolRecordBase,
} from "./pipeline-store";

// ------------------------------------------------------------------ patterns

export type SlicingPattern = "workflow-steps" | "business-rules" | "data-variations";

/** The fixed shippability checklist — order and ids are stable, text is copy. */
export const SHIPPABILITY_CHECKS = [
  { id: "value", label: "Delivers end-to-end value on its own" },
  { id: "demoable", label: "A user could see/demo it working" },
  { id: "independent", label: "Doesn't need a later slice to function" },
] as const;
export type ShippabilityCheckId = (typeof SHIPPABILITY_CHECKS)[number]["id"];

// -------------------------------------------------------------------- records

export interface StorySlice {
  id: string; // uid("story") — the contract join key
  title: string; // "Order one plain donut, pay by card"
  note: string; // optional detail, may be ""
  checks: Record<ShippabilityCheckId, boolean>;
}

export interface SliceSession extends ToolRecordBase {
  // id: uid("slice"), productId, createdAt, updatedAt from ToolRecordBase
  featureText: string; // the big feature being sliced
  specRef: SpecRef | null; // null = manually described feature
  specTitleSnapshot: string; // "" when specRef is null (contract D5)
  pattern: SlicingPattern | null; // null until the visitor picks one
  stories: StorySlice[];
}

export const slicerStore = createToolStore<SliceSession>({
  storageKey: "pm-slice-v1",
  idPrefix: "slice",
});

// --------------------------------------------------------------- story helpers

/** Mints a story with a stable `uid("story")` id and all checks unset. */
export const createStory = (title: string): StorySlice => ({
  id: uid("story"),
  title,
  note: "",
  checks: SHIPPABILITY_CHECKS.reduce(
    (acc, c) => ({ ...acc, [c.id]: false }),
    {} as Record<ShippabilityCheckId, boolean>,
  ),
});

/** A story is a vertical slice only when every shippability check passes. */
export const isShippable = (s: StorySlice): boolean =>
  SHIPPABILITY_CHECKS.every((c) => s.checks[c.id]);

/**
 * StoryRef producer for downstream tools (Backlog Prioritizer, Test Register).
 * Manual (non-spec) sessions emit `specId: ""` — documented in design D1; the
 * downstream lanes badge the empty id rather than crashing on lookup.
 */
export const storyRefsFor = (session: SliceSession): StoryRef[] =>
  session.stories.map((s) => ({ storyId: s.id, specId: session.specRef?.specId ?? "" }));

/**
 * Resolves a `storyId` by scanning every saved session's stories. Returns the
 * story plus its owning session (which carries the spec ref) for downstream
 * tools, or `undefined` when the story no longer exists.
 */
export const resolveStory = (
  storyId: string,
): { story: StorySlice; session: SliceSession } | undefined => {
  for (const session of slicerStore.list()) {
    const story = session.stories.find((s) => s.id === storyId);
    if (story) return { story, session };
  }
  return undefined;
};

// ------------------------------------------------------------- spec link (D2)

/** Minimal shape we read from `pm-spec-v1`; deliberately loose (see D2). */
interface RawSpecRecord {
  id?: unknown;
  productId?: unknown;
  title?: unknown;
  name?: unknown;
  updatedAt?: unknown;
}

/**
 * Defensive reader over the raw `pm-spec-v1` localStorage key. Returns the
 * specs for a product as `{ id, title }[]`, most recently updated first, using
 * `title ?? name ?? "Untitled spec"`. Returns `[]` on missing/unparsable data
 * or when storage is unavailable. Never imports the Spec Builder module.
 */
export const listSpecsForProduct = (productId: string): { id: string; title: string }[] => {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem("pm-spec-v1");
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

  const records = Object.values(parsed as Record<string, RawSpecRecord>).filter(
    (r): r is RawSpecRecord => !!r && typeof r === "object",
  );

  return records
    .filter((r) => typeof r.id === "string" && r.productId === productId)
    .sort((a, b) => (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0))
    .map((r) => ({
      id: r.id as string,
      title:
        (typeof r.title === "string" && r.title.trim()) ||
        (typeof r.name === "string" && r.name.trim()) ||
        "Untitled spec",
    }));
};

/**
 * Re-resolves a saved `SpecRef` against live spec data for the D5 badge rule:
 * `live` when the spec exists with the snapshotted title, `retitled` when it
 * exists under a different title, `missing` when it's gone. Never blocks, never
 * deletes.
 */
export const resolveSpecLink = (
  productId: string,
  specRef: SpecRef | null,
  snapshot: string,
): { status: "none" | "live" | "retitled" | "missing"; title: string } => {
  if (!specRef) return { status: "none", title: "" };
  const match = listSpecsForProduct(productId).find((s) => s.id === specRef.specId);
  if (!match) return { status: "missing", title: snapshot };
  if (match.title !== snapshot) return { status: "retitled", title: match.title };
  return { status: "live", title: match.title };
};

// -------------------------------------------------------------- session CRUD

export const listSessions = (): SliceSession[] => slicerStore.list();

export const listSessionsForProduct = (productId: string): SliceSession[] =>
  slicerStore.listForProduct(productId);

export const getSession = (id: string): SliceSession | undefined => slicerStore.get(id);

export const createSession = (productId: string): SliceSession =>
  slicerStore.create({
    productId,
    featureText: "",
    specRef: null,
    specTitleSnapshot: "",
    pattern: null,
    stories: [],
  });

export const saveSession = (
  id: string,
  data: Partial<
    Pick<SliceSession, "featureText" | "specRef" | "specTitleSnapshot" | "pattern" | "stories">
  >,
): void => slicerStore.update(id, data);

export const deleteSession = (id: string): void => slicerStore.remove(id);

/** Active pointer is product-scoped, per the contract's pipeline convention. */
export const getActiveId = (productId: string): string | null => slicerStore.getActiveId(productId);

export const setActiveId = (productId: string, id: string): void =>
  slicerStore.setActiveId(productId, id);

/**
 * Returns the active session for a product, recovering from a dangling pointer
 * by falling back to the most recently updated session for that product, and
 * creating a fresh one on first visit.
 */
export const resolveActiveSession = (productId: string): SliceSession => {
  const activeId = getActiveId(productId);
  const active = activeId ? getSession(activeId) : undefined;
  if (active && active.productId === productId) return active;

  const fallback = listSessionsForProduct(productId)[0] ?? createSession(productId);
  setActiveId(productId, fallback.id);
  return fallback;
};

export const titleFor = (session: SliceSession): string => {
  const firstLine = session.featureText.split("\n")[0]?.trim();
  return firstLine || session.specTitleSnapshot.trim() || "Untitled feature";
};

// ------------------------------------------------------------------ markdown

const PATTERN_LABELS: Record<SlicingPattern, string> = {
  "workflow-steps": "Workflow steps",
  "business-rules": "Business rules",
  "data-variations": "Data variations",
};

export const patternLabel = (pattern: SlicingPattern): string => PATTERN_LABELS[pattern];

/**
 * Markdown export (design D6): feature line (+ spec title snapshot when linked),
 * pattern name, then one bullet per story with a ✅/⚠️ shippability marker and
 * the failed-check notes.
 */
export const toMarkdown = (session: SliceSession): string => {
  const lines: string[] = [`# Vertical slices: ${titleFor(session)}`, ""];

  lines.push(`**Feature:** ${session.featureText.trim() || "(not described)"}`);
  if (session.specRef && session.specTitleSnapshot) {
    lines.push(`**Linked spec:** ${session.specTitleSnapshot}`);
  }
  lines.push(`**Slicing pattern:** ${session.pattern ? patternLabel(session.pattern) : "(not chosen)"}`);
  lines.push("");

  if (session.stories.length === 0) {
    lines.push("_No slices yet._");
    return lines.join("\n");
  }

  for (const story of session.stories) {
    const shippable = isShippable(story);
    const marker = shippable ? "✅" : "⚠️";
    lines.push(`- ${marker} ${story.title || "(untitled slice)"}`);
    if (story.note.trim()) lines.push(`  - ${story.note.trim()}`);
    if (!shippable) {
      const failed = SHIPPABILITY_CHECKS.filter((c) => !story.checks[c.id]).map((c) => c.label);
      lines.push(`  - Horizontal-layer risk — fails: ${failed.join("; ")}`);
    }
  }

  return lines.join("\n");
};
