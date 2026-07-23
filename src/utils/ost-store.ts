/**
 * Local-first storage for opportunity solution trees, shared by the course
 * exercise embed and the standalone /tools/opportunity-solution-tree/ page.
 * A visitor can hold several trees (one per product, or one per course
 * chapter) and switch between them; everything lives in localStorage, never
 * leaves the browser.
 */

export interface OstOpportunity {
  text: string;
  solutions: string[];
  target: boolean;
}

export interface OstTree {
  outcome: string;
  opportunities: OstOpportunity[];
}

export type OstSource =
  | { type: "standalone" }
  | { type: "course"; courseSlug: string; courseTitle: string; chapterSlug: string; chapterLabel: string; href: string };

export interface OstRecord {
  id: string;
  tree: OstTree;
  source: OstSource;
  createdAt: number;
  updatedAt: number;
}

type StoreShape = Record<string, OstRecord>;

const STORE_KEY = "ost-trees-v1";
const ACTIVE_KEY = "ost-active-v1";
const LEGACY_TREE_KEY = "ost-tree-builder";

export const EMPTY_TREE: OstTree = { outcome: "", opportunities: [] };

const uid = () => `ost_${Math.random().toString(36).slice(2, 10)}`;

const readJson = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / storage full — the tool still works, just doesn't persist */
  }
};

export const contextKeyFor = (source: OstSource): string =>
  source.type === "course" ? `course:${source.courseSlug}:${source.chapterSlug}` : "standalone";

let cachedStore: StoreShape | null = null;

/** Wraps the single tree from the pre-multi-tree version into the new store, once. */
const migrateLegacy = (store: StoreShape): StoreShape => {
  const legacy = readJson<OstTree>(LEGACY_TREE_KEY);
  if (!legacy || (!legacy.outcome && legacy.opportunities?.length === 0)) return store;

  const now = Date.now();
  const record: OstRecord = {
    id: uid(),
    tree: legacy,
    source: { type: "standalone" },
    createdAt: now,
    updatedAt: now,
  };
  store[record.id] = record;

  // The old single-tree builder was embedded on every course chapter and the
  // (not-yet-existing) standalone page, all sharing one localStorage key —
  // so every context that used to show it should keep showing it.
  const active = readJson<Record<string, string>>(ACTIVE_KEY) ?? {};
  active.standalone = record.id;
  active["course:continuous-discovery:solutions"] = record.id;
  active["course:continuous-discovery:habit"] = record.id;
  writeJson(ACTIVE_KEY, active);

  localStorage.removeItem(LEGACY_TREE_KEY);
  return store;
};

const loadStore = (): StoreShape => {
  if (cachedStore) return cachedStore;
  let store = readJson<StoreShape>(STORE_KEY) ?? {};
  store = migrateLegacy(store);
  cachedStore = store;
  return store;
};

const persistStore = (store: StoreShape) => {
  cachedStore = store;
  writeJson(STORE_KEY, store);
};

export const listTrees = (): OstRecord[] =>
  Object.values(loadStore()).sort((a, b) => b.updatedAt - a.updatedAt);

export const getTree = (id: string): OstRecord | undefined => loadStore()[id];

export const createTree = (source: OstSource, tree: OstTree = EMPTY_TREE): OstRecord => {
  const now = Date.now();
  const record: OstRecord = { id: uid(), tree, source, createdAt: now, updatedAt: now };
  const store = loadStore();
  store[record.id] = record;
  persistStore(store);
  return record;
};

export const saveTreeData = (id: string, tree: OstTree): void => {
  const store = loadStore();
  const record = store[id];
  if (!record) return;
  store[id] = { ...record, tree, updatedAt: Date.now() };
  persistStore(store);
};

export const deleteTree = (id: string): void => {
  const store = loadStore();
  delete store[id];
  persistStore(store);
};

export const getActiveId = (contextKey: string): string | null => {
  const active = readJson<Record<string, string>>(ACTIVE_KEY) ?? {};
  return active[contextKey] ?? null;
};

export const setActiveId = (contextKey: string, id: string): void => {
  const active = readJson<Record<string, string>>(ACTIVE_KEY) ?? {};
  active[contextKey] = id;
  writeJson(ACTIVE_KEY, active);
};

/**
 * Resolves the tree a given embed context should show: its remembered active
 * tree if one still exists, else a freshly created one scoped to that source.
 */
export const resolveActiveTree = (source: OstSource): OstRecord => {
  const contextKey = contextKeyFor(source);
  const activeId = getActiveId(contextKey);
  const existing = activeId ? getTree(activeId) : undefined;
  if (existing) return existing;

  const created = createTree(source);
  setActiveId(contextKey, created.id);
  return created;
};

export const titleFor = (record: OstRecord): string => record.tree.outcome.trim() || "Untitled tree";
