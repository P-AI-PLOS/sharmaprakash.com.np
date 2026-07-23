import { createToolStore, resolveActiveProduct, uid, type ToolRecordBase } from "./pipeline-store";

export interface BackboneStep {
  id: string;
  text: string;
  order: number;
}

export interface ReleaseSlice {
  id: string;
  name: string;
  order: number;
}

export interface StoryCard {
  id: string;
  stepId: string;
  sliceId: string | null;
  text: string;
  order: number;
}

/**
 * Where a builder island is mounted. The active-map pointer is scoped per
 * context so the standalone tool and any future post embed each remember their
 * own map, mirroring `metric-tree-store.ts`'s `contextKeyFor`.
 */
export type StoryMapSource =
  | { type: "standalone" }
  | { type: "post"; postSlug: string };

export interface StoryMapRecord extends ToolRecordBase {
  title: string;
  source: StoryMapSource;
  steps: BackboneStep[];
  slices: ReleaseSlice[];
  cards: StoryCard[];
}

export const contextKeyFor = (source: StoryMapSource): string =>
  source.type === "post" ? `post:${source.postSlug}` : "standalone";

const store = createToolStore<StoryMapRecord>({
  storageKey: "storymap-v1",
  idPrefix: "map",
  // Records written before the source field existed were all standalone.
  migrate: (records) => {
    for (const record of Object.values(records)) {
      if (!record.source) record.source = { type: "standalone" };
    }
    return records;
  },
});

export const listMaps = (): StoryMapRecord[] => store.list();

export const getMap = (id: string): StoryMapRecord | undefined => store.get(id);

export const createMap = (source: StoryMapSource = { type: "standalone" }): StoryMapRecord =>
  store.create({
    productId: resolveActiveProduct().id,
    title: "Untitled map",
    source,
    steps: [],
    slices: [],
    cards: [],
  });

export const saveMapData = (
  id: string,
  data: Partial<Pick<StoryMapRecord, "title" | "steps" | "slices" | "cards">>,
): void => store.update(id, data);

export const deleteMap = (id: string): void => store.remove(id);

export const getActiveId = (contextKey: string): string | null => store.getActiveId(contextKey);

export const setActiveId = (contextKey: string, id: string): void =>
  store.setActiveId(contextKey, id);

export const resolveActiveMap = (
  source: StoryMapSource = { type: "standalone" },
): StoryMapRecord => {
  const ck = contextKeyFor(source);
  const activeId = getActiveId(ck);
  const existing = activeId ? getMap(activeId) : undefined;
  if (existing) return existing;
  const created = createMap(source);
  setActiveId(ck, created.id);
  return created;
};

export const titleFor = (record: StoryMapRecord): string =>
  record.title.trim() || "Untitled map";

export const addStep = (mapId: string, text: string): void => {
  const map = getMap(mapId);
  if (!map) return;
  const order = map.steps.length;
  const step: BackboneStep = { id: uid("step"), text, order };
  saveMapData(mapId, { steps: [...map.steps, step] });
};

export const renameStep = (mapId: string, stepId: string, text: string): void => {
  const map = getMap(mapId);
  if (!map) return;
  const steps = map.steps.map((s) => (s.id === stepId ? { ...s, text } : s));
  saveMapData(mapId, { steps });
};

export const reorderStep = (mapId: string, stepId: string, direction: -1 | 1): void => {
  const map = getMap(mapId);
  if (!map) return;
  const sorted = [...map.steps].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((s) => s.id === stepId);
  if (idx < 0) return;
  const target = idx + direction;
  if (target < 0 || target >= sorted.length) return;
  [sorted[idx], sorted[target]] = [sorted[target], sorted[idx]];
  const steps = sorted.map((s, i) => ({ ...s, order: i }));
  saveMapData(mapId, { steps });
};

export const deleteStep = (mapId: string, stepId: string): void => {
  const map = getMap(mapId);
  if (!map) return;
  const steps = map.steps.filter((s) => s.id !== stepId);
  saveMapData(mapId, { steps });
};

export const addSlice = (mapId: string, name: string): void => {
  const map = getMap(mapId);
  if (!map) return;
  const order = map.slices.length;
  const slice: ReleaseSlice = { id: uid("slice"), name, order };
  saveMapData(mapId, { slices: [...map.slices, slice] });
};

export const renameSlice = (mapId: string, sliceId: string, name: string): void => {
  const map = getMap(mapId);
  if (!map) return;
  const slices = map.slices.map((s) => (s.id === sliceId ? { ...s, name } : s));
  saveMapData(mapId, { slices });
};

export const reorderSlice = (mapId: string, sliceId: string, direction: -1 | 1): void => {
  const map = getMap(mapId);
  if (!map) return;
  const sorted = [...map.slices].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((s) => s.id === sliceId);
  if (idx < 0) return;
  const target = idx + direction;
  if (target < 0 || target >= sorted.length) return;
  [sorted[idx], sorted[target]] = [sorted[target], sorted[idx]];
  const slices = sorted.map((s, i) => ({ ...s, order: i }));
  saveMapData(mapId, { slices });
};

export const deleteSlice = (mapId: string, sliceId: string): void => {
  const map = getMap(mapId);
  if (!map) return;
  const slices = map.slices.filter((s) => s.id !== sliceId);
  saveMapData(mapId, { slices });
};

export const addCard = (
  mapId: string,
  stepId: string,
  text: string,
  sliceId: string | null = null,
): void => {
  const map = getMap(mapId);
  if (!map) return;
  const sameCell = map.cards.filter((c) => c.stepId === stepId && c.sliceId === sliceId);
  const card: StoryCard = {
    id: uid("card"),
    stepId,
    sliceId,
    text,
    order: sameCell.length,
  };
  saveMapData(mapId, { cards: [...map.cards, card] });
};

export const moveCard = (mapId: string, cardId: string, stepId: string, sliceId: string | null): void => {
  const map = getMap(mapId);
  if (!map) return;
  const cards = map.cards.map((c) => (c.id === cardId ? { ...c, stepId, sliceId } : c));
  saveMapData(mapId, { cards });
};

export const reorderCard = (mapId: string, cardId: string, direction: -1 | 1): void => {
  const map = getMap(mapId);
  if (!map) return;
  const card = map.cards.find((c) => c.id === cardId);
  if (!card) return;
  const sameCell = [...map.cards]
    .filter((c) => c.stepId === card.stepId && c.sliceId === card.sliceId)
    .sort((a, b) => a.order - b.order);
  const idx = sameCell.findIndex((c) => c.id === cardId);
  if (idx < 0) return;
  const target = idx + direction;
  if (target < 0 || target >= sameCell.length) return;
  [sameCell[idx], sameCell[target]] = [sameCell[target], sameCell[idx]];
  const orderMap = new Map(sameCell.map((c, i) => [c.id, i]));
  const cards = map.cards.map((c) =>
    orderMap.has(c.id) ? { ...c, order: orderMap.get(c.id)! } : c,
  );
  saveMapData(mapId, { cards });
};

export const deleteCard = (mapId: string, cardId: string): void => {
  const map = getMap(mapId);
  if (!map) return;
  saveMapData(mapId, { cards: map.cards.filter((c) => c.id !== cardId) });
};

/** Label shown for cards whose `stepId` points at a deleted step. */
export const UNASSIGNED_STEP_LABEL = "Unassigned step";
/** Label of the trailing band holding cards with no (or a deleted) slice. */
export const BACKLOG_LABEL = "Backlog (unsliced)";

export const toMarkdown = (record: StoryMapRecord): string => {
  const sortedSteps = [...record.steps].sort((a, b) => a.order - b.order);
  const sortedSlices = [...record.slices].sort((a, b) => a.order - b.order);
  const sliceIds = new Set(sortedSlices.map((s) => s.id));
  const stepIds = new Set(sortedSteps.map((s) => s.id));
  const backboneLine = sortedSteps.map((s) => s.text).join(" → ");

  // Columns in backbone order, plus a trailing bucket for cards whose step was
  // deleted — deleting a step never deletes its cards (spec).
  const columns: Array<{ label: string; matches: (card: StoryCard) => boolean }> = [
    ...sortedSteps.map((step) => ({
      label: step.text,
      matches: (card: StoryCard) => card.stepId === step.id,
    })),
    { label: UNASSIGNED_STEP_LABEL, matches: (card: StoryCard) => !stepIds.has(card.stepId) },
  ];

  const section = (
    title: string,
    inBand: (card: StoryCard) => boolean,
    /** Slice sections are always stated; the backlog only when it has cards. */
    alwaysShow: boolean,
  ): string[] => {
    const lines: string[] = [];
    for (const column of columns) {
      const cards = record.cards
        .filter((c) => inBand(c) && column.matches(c))
        .sort((a, b) => a.order - b.order);
      for (const card of cards) lines.push(`- ${column.label}: ${card.text}`);
    }
    if (lines.length === 0 && !alwaysShow) return [];
    return [`## ${title}`, ...(lines.length > 0 ? lines : ["_(no cards yet)_"]), ""];
  };

  return [
    `# Story map: ${record.title || "Untitled"}`,
    "",
    `**Backbone:** ${backboneLine || "(no steps)"}`,
    "",
    ...sortedSlices.flatMap((slice) => section(slice.name, (c) => c.sliceId === slice.id, true)),
    ...section(BACKLOG_LABEL, (c) => c.sliceId === null || !sliceIds.has(c.sliceId), false),
  ].join("\n");
};
