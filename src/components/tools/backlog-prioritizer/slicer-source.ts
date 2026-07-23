/**
 * The ONLY file that reads Vertical Slicer internals (design.md D5). The slicer
 * lane may not have merged yet, and its exact record shape is unknown until it
 * does, so this reads the raw `pm-slice-v1` localStorage key defensively and
 * returns `[]` whenever the store/module is unavailable or malformed. Whatever
 * listing surface the slicer eventually ships, only this adapter changes.
 *
 * Contract we may rely on (D8): stories carry `uid("story")` ids and the
 * `SpecRef` they were sliced from. Persisted board items store `StoryRef` +
 * a title snapshot — never slicer internals.
 */

export interface SlicerStory {
  storyId: string;
  specId: string;
  title: string;
}

const SLICE_KEY = "pm-slice-v1";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asString = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

/** Pull a story-shaped object out of an unknown array element, or null. */
const readStory = (raw: unknown): SlicerStory | null => {
  if (!isRecord(raw)) return null;

  const storyId = asString(raw.id) ?? asString(raw.storyId);
  if (!storyId) return null;

  const specId =
    asString(raw.specId) ??
    (isRecord(raw.spec) ? asString(raw.spec.specId) : null) ??
    (isRecord(raw.specRef) ? asString(raw.specRef.specId) : null) ??
    "";

  const title =
    asString(raw.title) ??
    asString(raw.text) ??
    asString(raw.name) ??
    asString(raw.summary) ??
    "Untitled story";

  return { storyId, specId, title };
};

/** A slicer record may hold its stories under any array-valued field. */
const collectStories = (record: Record<string, unknown>): SlicerStory[] => {
  const out: SlicerStory[] = [];
  for (const value of Object.values(record)) {
    if (!Array.isArray(value)) continue;
    for (const element of value) {
      const story = readStory(element);
      if (story) out.push(story);
    }
  }
  return out;
};

/**
 * Whether the Vertical Slicer store exists at all. Used to distinguish "the
 * slicer hasn't shipped / has no data" (don't badge anything) from "this
 * specific story was deleted" (drift badge, contract D5).
 */
export function hasSlicerData(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(SLICE_KEY) !== null;
}

/** Stories for the active product, deduped by id. `[]` when the slicer is absent. */
export function listSlicerStories(productId: string): SlicerStory[] {
  if (typeof localStorage === "undefined") return [];

  let parsed: unknown;
  try {
    const raw = localStorage.getItem(SLICE_KEY);
    if (!raw) return [];
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!isRecord(parsed)) return [];

  const stories: SlicerStory[] = [];
  const seen = new Set<string>();
  for (const record of Object.values(parsed)) {
    if (!isRecord(record)) continue;
    if (asString(record.productId) !== productId) continue;
    for (const story of collectStories(record)) {
      if (seen.has(story.storyId)) continue;
      seen.add(story.storyId);
      stories.push(story);
    }
  }
  return stories;
}
