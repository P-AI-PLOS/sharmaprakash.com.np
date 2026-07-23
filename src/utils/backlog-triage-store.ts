import { createToolStore, resolveActiveProduct, uid, type ToolRecordBase } from "./pipeline-store";

export type TriageBucket = "now" | "next" | "never";

export interface TriageItem {
  id: string;
  text: string;
  bucket: TriageBucket | null;
  neverReason: string;
  createdAt: number;
  updatedAt: number;
}

export type TriageSource =
  | { type: "standalone" }
  | { type: "post" };

export interface TriageBoardRecord extends ToolRecordBase {
  title: string;
  items: TriageItem[];
  source: TriageSource;
}

export const NEXT_SIZE_THRESHOLD = 8;

export const contextKeyFor = (source: TriageSource): string =>
  source.type === "post" ? "post" : "standalone";

const store = createToolStore<TriageBoardRecord>({
  storageKey: "pm-backlog-triage-v1",
  idPrefix: "triage",
});

export const listBoards = (): TriageBoardRecord[] => store.list();

export const getBoard = (id: string): TriageBoardRecord | undefined => store.get(id);

export const createBoard = (source: TriageSource): TriageBoardRecord =>
  store.create({
    productId: resolveActiveProduct().id,
    title: "Untitled board",
    items: [],
    source,
  });

export const saveBoardData = (id: string, data: Partial<Pick<TriageBoardRecord, "title" | "items">>): void =>
  store.update(id, data);

export const deleteBoard = (id: string): void => store.remove(id);

export const getActiveId = (contextKey: string): string | null => store.getActiveId(contextKey);

export const setActiveId = (contextKey: string, id: string): void => store.setActiveId(contextKey, id);

export const resolveActiveBoard = (source: TriageSource): TriageBoardRecord => {
  const ck = contextKeyFor(source);
  const activeId = getActiveId(ck);
  const existing = activeId ? getBoard(activeId) : undefined;
  if (existing) return existing;
  const created = createBoard(source);
  setActiveId(ck, created.id);
  return created;
};

export const titleFor = (record: TriageBoardRecord): string =>
  record.title.trim() || "Untitled board";

export const addItem = (boardId: string, text: string): void => {
  const board = getBoard(boardId);
  if (!board) return;
  const now = Date.now();
  const item: TriageItem = {
    id: uid("titem"),
    text,
    bucket: null,
    neverReason: "",
    createdAt: now,
    updatedAt: now,
  };
  saveBoardData(boardId, { items: [...board.items, item] });
};

export const addItemsBulk = (boardId: string, rawText: string): void => {
  const board = getBoard(boardId);
  if (!board) return;
  const now = Date.now();
  const newItems: TriageItem[] = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((text) => ({
      id: uid("titem"),
      text,
      bucket: null,
      neverReason: "",
      createdAt: now,
      updatedAt: now,
    }));
  saveBoardData(boardId, { items: [...board.items, ...newItems] });
};

export const moveItem = (boardId: string, itemId: string, bucket: TriageBucket): void => {
  const board = getBoard(boardId);
  if (!board) return;
  const items = board.items.map((item) =>
    item.id === itemId ? { ...item, bucket, updatedAt: Date.now() } : item,
  );
  saveBoardData(boardId, { items });
};

export const setNeverReason = (boardId: string, itemId: string, reason: string): void => {
  const board = getBoard(boardId);
  if (!board) return;
  const items = board.items.map((item) =>
    item.id === itemId ? { ...item, neverReason: reason, updatedAt: Date.now() } : item,
  );
  saveBoardData(boardId, { items });
};

export const removeItem = (boardId: string, itemId: string): void => {
  const board = getBoard(boardId);
  if (!board) return;
  saveBoardData(boardId, { items: board.items.filter((i) => i.id !== itemId) });
};

export const nextSizeNudge = (items: TriageItem[]): boolean =>
  items.filter((i) => i.bucket === "next").length > NEXT_SIZE_THRESHOLD;

export const hasUnreasonedNever = (items: TriageItem[]): boolean =>
  items.some((i) => i.bucket === "never" && !i.neverReason.trim());

export const toMarkdown = (board: TriageBoardRecord): string => {
  const buckets: TriageBucket[] = ["now", "next", "never"];
  const lines: string[] = [`# ${titleFor(board)}`, ""];
  for (const b of buckets) {
    const bucketItems = board.items.filter((i) => i.bucket === b);
    if (bucketItems.length === 0) continue;
    lines.push(`## ${b.charAt(0).toUpperCase() + b.slice(1)}`);
    for (const item of bucketItems) {
      const reason = b === "never" && item.neverReason ? ` (${item.neverReason})` : "";
      lines.push(`- ${item.text}${reason}`);
    }
    lines.push("");
  }
  return lines.join("\n");
};
