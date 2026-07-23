/**
 * Local-first storage for opportunity solution trees, shared by the course
 * exercise embed and the standalone /tools/opportunity-solution-tree/ page.
 * A visitor can hold several trees (one per product, or one per course
 * chapter) and switch between them; everything lives in localStorage, never
 * leaves the browser.
 *
 * Persistence runs on the shared pipeline store factory (`./pipeline-store.ts`,
 * contract of record: openspec/changes/donut-crm-pipeline-data-contract/design.md
 * D9). The storage keys and every exported function below are unchanged from
 * the hand-rolled version — only the internals moved.
 */

import {
  createToolStore,
  resolveActiveProduct,
  uid,
  type ToolRecordBase,
} from "./pipeline-store";

export interface OstSolution {
  id: string;
  text: string;
}

export interface OstOpportunity {
  id: string;
  text: string;
  solutions: OstSolution[];
  target: boolean;
}

export interface OstTree {
  outcome: string;
  opportunities: OstOpportunity[];
}

export type OstSource =
  | { type: "standalone" }
  | { type: "course"; courseSlug: string; courseTitle: string; chapterSlug: string; chapterLabel: string; href: string };

export interface OstRecord extends ToolRecordBase {
  tree: OstTree;
  source: OstSource;
}

const STORE_KEY = "ost-trees-v1";
const ACTIVE_KEY = "ost-active-v1";
const LEGACY_TREE_KEY = "ost-tree-builder";

export const EMPTY_TREE: OstTree = { outcome: "", opportunities: [] };

export const newSolution = (text: string): OstSolution => ({ id: uid("sol"), text });

export const newOpportunity = (text: string): OstOpportunity => ({
  id: uid("opp"),
  text,
  solutions: [],
  target: false,
});

export const contextKeyFor = (source: OstSource): string =>
  source.type === "course" ? `course:${source.courseSlug}:${source.chapterSlug}` : "standalone";

/** The shapes this store used to persist, before the D9 migration. */
type LegacySolution = string | OstSolution;
type LegacyOpportunity = Omit<OstOpportunity, "id" | "solutions"> &
  Partial<Pick<OstOpportunity, "id">> & { solutions?: LegacySolution[] };
type LegacyTree = { outcome: string; opportunities?: LegacyOpportunity[] };
type LegacyRecord = Omit<OstRecord, "productId" | "tree"> &
  Partial<Pick<OstRecord, "productId">> & { tree: LegacyTree };

const readRaw = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const writeRaw = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / storage full — the tool still works, just doesn't persist */
  }
};

/** Wraps the single tree from the pre-multi-tree version into the store, once. */
const migrateLegacy = (store: Record<string, OstRecord>): Record<string, OstRecord> => {
  const legacy = readRaw<LegacyTree>(LEGACY_TREE_KEY);
  if (!legacy || (!legacy.outcome && legacy.opportunities?.length === 0)) return store;

  const now = Date.now();
  const record = {
    id: uid("ost"),
    tree: legacy,
    source: { type: "standalone" },
    createdAt: now,
    updatedAt: now,
  } as unknown as OstRecord; // node ids and productId are filled in by the passes below
  store[record.id] = record;

  // The old single-tree builder was embedded on every course chapter and the
  // (not-yet-existing) standalone page, all sharing one localStorage key —
  // so every context that used to show it should keep showing it.
  const active = readRaw<Record<string, string>>(ACTIVE_KEY) ?? {};
  active.standalone = record.id;
  active["course:continuous-discovery:solutions"] = record.id;
  active["course:continuous-discovery:habit"] = record.id;
  writeRaw(ACTIVE_KEY, active);

  try {
    localStorage.removeItem(LEGACY_TREE_KEY);
  } catch {
    /* nothing to clean up if storage is unavailable */
  }
  return store;
};

/**
 * Additive, idempotent backfill: gives every opportunity and solution a stable
 * id and every record a `productId`. Never rewrites text, target flags or
 * order, so a record that already has ids passes through untouched.
 */
const backfillIds = (store: Record<string, OstRecord>): Record<string, OstRecord> => {
  const records = Object.values(store) as unknown as LegacyRecord[];
  const needsProduct = records.some((record) => !record.productId);
  // Only seed/resolve a product when there is actually a record to attach it to.
  const productId = needsProduct ? resolveActiveProduct().id : "";

  for (const record of records) {
    if (!record.productId) record.productId = productId;

    const tree = record.tree;
    if (!tree || !Array.isArray(tree.opportunities)) continue;

    tree.opportunities = tree.opportunities.map((opp) => ({
      ...opp,
      id: opp.id ?? uid("opp"),
      target: Boolean(opp.target),
      solutions: (opp.solutions ?? []).map((sol) =>
        typeof sol === "string" ? newSolution(sol) : { ...sol, id: sol.id ?? uid("sol") },
      ),
    })) as OstOpportunity[];
  }

  return store;
};

const store = createToolStore<OstRecord>({
  storageKey: STORE_KEY,
  idPrefix: "ost",
  activeKey: ACTIVE_KEY,
  migrate: (records) => backfillIds(migrateLegacy(records)),
});

export const listTrees = (): OstRecord[] => store.list();

export const getTree = (id: string): OstRecord | undefined => store.get(id);

export const createTree = (source: OstSource, tree: OstTree = EMPTY_TREE): OstRecord =>
  store.create({ productId: resolveActiveProduct().id, tree, source });

export const saveTreeData = (id: string, tree: OstTree): void => store.update(id, { tree });

export const deleteTree = (id: string): void => store.remove(id);

export const getActiveId = (contextKey: string): string | null => store.getActiveId(contextKey);

export const setActiveId = (contextKey: string, id: string): void =>
  store.setActiveId(contextKey, id);

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
