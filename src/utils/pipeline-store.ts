/**
 * Shared data contract for the Donut CRM pipeline tools (OKR Organizer, Spec
 * Builder, Vertical Slicer, Backlog Prioritizer, Cadence & Reflection Kit, OKR
 * Check-In, Test Register, Stakeholder Update Composer) and for the migrated
 * opportunity solution tree store in `./ost-store.ts`.
 *
 * localStorage only — nothing here ever leaves the browser, there is no
 * backend, and every write degrades silently when storage is unavailable.
 *
 * Contract of record:
 * `openspec/changes/donut-crm-pipeline-data-contract/design.md`. A tool that
 * needs a shape this module doesn't provide extends that change rather than
 * inventing a parallel shape.
 */

// ------------------------------------------------------------------ storage

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

// ----------------------------------------------------------------- ids

/** `${prefix}_${8 base36 chars}`, e.g. "spec_k3v9q2ax". See the D4 prefix table. */
export const uid = (prefix: string): string => {
  let suffix = "";
  while (suffix.length < 8) suffix += Math.random().toString(36).slice(2);
  return `${prefix}_${suffix.slice(0, 8)}`;
};

/** Every tool record persisted by `createToolStore` extends this. */
export interface ToolRecordBase {
  id: string;
  /** `ProductRecord.id` — the join key across every pipeline tool store. */
  productId: string;
  createdAt: number;
  updatedAt: number;
}

// ------------------------------------------------------------------ products

/** The per-product umbrella record. Its id is the join key for every tool. */
export interface ProductRecord {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export const PRODUCTS_KEY = "pm-products-v1";
export const ACTIVE_PRODUCT_KEY = "pm-active-product-v1";

/** The running case every tool boots into on a first visit. */
export const SAMPLE_PRODUCT_NAME = "Donut CRM";

type ProductShape = Record<string, ProductRecord>;

let cachedProducts: ProductShape | null = null;

const loadProducts = (): ProductShape => {
  if (cachedProducts) return cachedProducts;
  cachedProducts = readJson<ProductShape>(PRODUCTS_KEY) ?? {};
  return cachedProducts;
};

const persistProducts = (store: ProductShape) => {
  cachedProducts = store;
  writeJson(PRODUCTS_KEY, store);
};

/** All products, most recently updated first. */
export const listProducts = (): ProductRecord[] =>
  Object.values(loadProducts()).sort((a, b) => b.updatedAt - a.updatedAt);

export const getProduct = (id: string): ProductRecord | undefined => loadProducts()[id];

export const createProduct = (name: string): ProductRecord => {
  const now = Date.now();
  const record: ProductRecord = { id: uid("prod"), name, createdAt: now, updatedAt: now };
  const store = loadProducts();
  store[record.id] = record;
  persistProducts(store);
  return record;
};

export const renameProduct = (id: string, name: string): void => {
  const store = loadProducts();
  const record = store[id];
  if (!record) return;
  store[id] = { ...record, name, updatedAt: Date.now() };
  persistProducts(store);
};

/** Deletes only the product record — downstream tool records are never cascaded (D7). */
export const deleteProduct = (id: string): void => {
  const store = loadProducts();
  delete store[id];
  persistProducts(store);
};

export const getActiveProductId = (): string | null =>
  readJson<string>(ACTIVE_PRODUCT_KEY) ?? null;

export const setActiveProductId = (id: string): void => writeJson(ACTIVE_PRODUCT_KEY, id);

/**
 * Returns the active product, recovering from a dangling pointer by falling
 * back to the most recently updated product, and seeding + activating a
 * "Donut CRM" sample product on first visit so every tool boots into the
 * running case.
 */
export const resolveActiveProduct = (): ProductRecord => {
  const activeId = getActiveProductId();
  const active = activeId ? getProduct(activeId) : undefined;
  if (active) return active;

  const fallback = listProducts()[0] ?? createProduct(SAMPLE_PRODUCT_NAME);
  setActiveProductId(fallback.id);
  return fallback;
};

// ------------------------------------------------------------------ quarters

/** The one quarter representation. Never re-model quarters as strings or dates. */
export interface QuarterRef {
  year: number;
  quarter: 1 | 2 | 3 | 4;
}

/** "2026-Q3" — the display and map-key form. */
export const quarterKey = (q: QuarterRef): string => `${q.year}-Q${q.quarter}`;

export const parseQuarterKey = (key: string): QuarterRef | null => {
  const match = /^(\d{4})-Q([1-4])$/.exec(key.trim());
  if (!match) return null;
  return { year: Number(match[1]), quarter: Number(match[2]) as QuarterRef["quarter"] };
};

export const currentQuarter = (now: Date = new Date()): QuarterRef => ({
  year: now.getFullYear(),
  quarter: (Math.floor(now.getMonth() / 3) + 1) as QuarterRef["quarter"],
});

/** OKR Check-In drafts next quarter's entry into this. Q4 rolls into next year's Q1. */
export const nextQuarter = (q: QuarterRef): QuarterRef =>
  q.quarter === 4
    ? { year: q.year + 1, quarter: 1 }
    : { year: q.year, quarter: (q.quarter + 1) as QuarterRef["quarter"] };

/** Chronological comparator for sorting quarter-scoped records. */
export const compareQuarters = (a: QuarterRef, b: QuarterRef): number =>
  a.year !== b.year ? a.year - b.year : a.quarter - b.quarter;

// ------------------------------------------------------- cross-tool references

/**
 * Spec Builder's input: a starred opportunity + solution from an `OstRecord`
 * (`./ost-store.ts`). Refs join on stable node ids, but the text is snapshotted
 * at pick time so a badge can be rendered without a second lookup even when the
 * source is later deleted (D5).
 */
export interface OstPickRef {
  ostRecordId: string;
  /** `uid("opp")` — stable across reorders and edits. */
  opportunityId: string;
  /** `uid("sol")` — stable across reorders and edits. */
  solutionId: string;
  /** Snapshot taken at pick time — always renderable. */
  opportunityText: string;
  solutionText: string;
}

/** Vertical Slicer → a Spec Builder spec. */
export interface SpecRef {
  specId: string;
}

/** Backlog Prioritizer / Test Register → a Vertical Slicer story. */
export interface StoryRef {
  storyId: string;
  /** The spec the story was sliced from. */
  specId: string;
}

/** Backlog Prioritizer / Cadence Kit / Check-In → a key result. */
export interface OkrKeyResultRef {
  okrId: string;
  keyResultId: string;
}

/** Test Register → a Spec Builder acceptance criterion. */
export interface AcceptanceCriterionRef {
  specId: string;
  criterionId: string;
}

// -------------------------------------------------------------- store factory

export interface ToolStore<T extends ToolRecordBase> {
  /** All records, most recently updated first. */
  list(): T[];
  listForProduct(productId: string): T[];
  get(id: string): T | undefined;
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): T;
  /** Bumps `updatedAt`; `id` and `createdAt` are preserved. */
  update(id: string, patch: Partial<Omit<T, "id" | "createdAt">>): void;
  remove(id: string): void;
  /**
   * Active pointer, scoped by an arbitrary string key: "which record is open
   * for this scope". The eight pipeline tools pass `productId`; OST passes its
   * `contextKeyFor(source)` (course chapter or "standalone") since its active
   * record is context-scoped rather than product-scoped. One factory, two
   * scoping conventions, same mechanism.
   */
  getActiveId(scopeKey: string): string | null;
  setActiveId(scopeKey: string, id: string): void;
}

export interface ToolStoreOptions<T extends ToolRecordBase> {
  /** From the D4 key table, e.g. "pm-okr-v1". */
  storageKey: string;
  /** From the D4 prefix table, e.g. "okr". */
  idPrefix: string;
  /**
   * Active-pointer key. Defaults to `<storageKey>-active`; OST overrides it to
   * keep its pre-existing `ost-active-v1` key (D4).
   */
  activeKey?: string;
  /**
   * Optional one-time, additive migration run on first load, before anything
   * is read. Return the (possibly mutated) store; it is persisted only when the
   * pass actually changed something. Used by OST for its legacy-tree wrap and
   * its node-id / `productId` backfills (D9).
   */
  migrate?: (store: Record<string, T>) => Record<string, T>;
}

/**
 * Builds a tool's store on the ost-store pattern: versioned key, in-memory
 * cache, `Record<id, T>` shape, silent try/catch persistence, and a separate
 * scope-keyed active pointer.
 */
export function createToolStore<T extends ToolRecordBase>(
  opts: ToolStoreOptions<T>,
): ToolStore<T> {
  const { storageKey, idPrefix, migrate } = opts;
  const activeKey = opts.activeKey ?? `${storageKey}-active`;

  type Shape = Record<string, T>;
  let cache: Shape | null = null;

  const persist = (store: Shape) => {
    cache = store;
    writeJson(storageKey, store);
  };

  const load = (): Shape => {
    if (cache) return cache;
    let store = readJson<Shape>(storageKey) ?? {};
    if (migrate) {
      const before = JSON.stringify(store);
      store = migrate(store);
      if (JSON.stringify(store) !== before) {
        persist(store);
        return store;
      }
    }
    cache = store;
    return store;
  };

  const readActive = (): Record<string, string> =>
    readJson<Record<string, string>>(activeKey) ?? {};

  return {
    list: () => Object.values(load()).sort((a, b) => b.updatedAt - a.updatedAt),

    listForProduct: (productId) =>
      Object.values(load())
        .filter((record) => record.productId === productId)
        .sort((a, b) => b.updatedAt - a.updatedAt),

    get: (id) => load()[id],

    create: (data) => {
      const now = Date.now();
      const record = { ...data, id: uid(idPrefix), createdAt: now, updatedAt: now } as T;
      const store = load();
      store[record.id] = record;
      persist(store);
      return record;
    },

    update: (id, patch) => {
      const store = load();
      const record = store[id];
      if (!record) return;
      store[id] = { ...record, ...patch, id: record.id, createdAt: record.createdAt, updatedAt: Date.now() };
      persist(store);
    },

    remove: (id) => {
      const store = load();
      delete store[id];
      persist(store);
    },

    getActiveId: (scopeKey) => readActive()[scopeKey] ?? null,

    setActiveId: (scopeKey, id) => {
      const active = readActive();
      active[scopeKey] = id;
      writeJson(activeKey, active);
    },
  };
}
