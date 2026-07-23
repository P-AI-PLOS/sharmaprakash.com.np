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

export interface StoryMapRecord extends ToolRecordBase {
  title: string;
  steps: BackboneStep[];
  slices: ReleaseSlice[];
  cards: StoryCard[];
}

const store = createToolStore<StoryMapRecord>({
  storageKey: "storymap-v1",
  idPrefix: "map",
});

export const listMaps = (): StoryMapRecord[] => store.list();

export const getMap = (id: string): StoryMapRecord | undefined => store.get(id);

export const createMap = (): StoryMapRecord =>
  store.create({
    productId: resolveActiveProduct().id,
    title: "Untitled map",
    steps: [],
    slices: [],
    cards: [],
  });

export const saveMapData = (
  id: string,
  data: Partial<Pick<StoryMapRecord, "title" | "steps" | "slices" | "cards">>,
): void => store.update(id, data);

export const deleteMap = (id: string): void => store.remove(id);

export const getActiveId = (): string | null => store.getActiveId("standalone");

export const setActiveId = (id: string): void => store.setActiveId("standalone", id);

export const resolveActiveMap = (): StoryMapRecord => {
  const activeId = getActiveId();
  const existing = activeId ? getMap(activeId) : undefined;
  if (existing) return existing;
  const created = createMap();
  setActiveId(created.id);
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

export const addCard = (mapId: string, stepId: string, text: string): void => {
  const map = getMap(mapId);
  if (!map) return;
  const sameCell = map.cards.filter((c) => c.stepId === stepId && c.sliceId === null);
  const card: StoryCard = {
    id: uid("card"),
    stepId,
    sliceId: null,
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

export const toMarkdown = (record: StoryMapRecord): string => {
  const sortedSteps = [...record.steps].sort((a, b) => a.order - b.order);
  const sortedSlices = [...record.slices].sort((a, b) => a.order - b.order);
  const backboneLine = sortedSteps.map((s) => s.text).join(" → ");
  const lines: string[] = [
    `# Story map: ${record.title || "Untitled"}`,
    "",
    `**Backbone:** ${backboneLine || "(no steps)"}`,
    "",
  ];
  for (const slice of sortedSlices) {
    lines.push(`## ${slice.name}`);
    for (const step of sortedSteps) {
      const stepCards = record.cards
        .filter((c) => c.stepId === step.id && c.sliceId === slice.id)
        .sort((a, b) => a.order - b.order);
      for (const card of stepCards) {
        lines.push(`- ${step.text}: ${card.text}`);
      }
    }
    lines.push("");
  }
  const unsliced = record.cards
    .filter((c) => c.sliceId === null)
    .sort((a, b) => a.order - b.order);
  if (unsliced.length > 0) {
    lines.push("## Backlog (unsliced)");
    for (const card of unsliced) {
      const step = record.steps.find((s) => s.id === card.stepId);
      const stepLabel = step?.text ?? "Unassigned";
      lines.push(`- ${stepLabel}: ${card.text}`);
    }
    lines.push("");
  }
  return lines.join("\n");
};
