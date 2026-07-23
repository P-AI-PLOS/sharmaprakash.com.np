import { createToolStore, resolveActiveProduct, uid, type ToolRecordBase } from "./pipeline-store";

export type MatrixZone = "simple" | "complicated" | "complex" | "chaotic";

export interface MatrixBoardItem {
  id: string;
  text: string;
  zone: MatrixZone | null;
}

export interface MatrixRecord extends ToolRecordBase {
  items: MatrixBoardItem[];
}

const store = createToolStore<MatrixRecord>({
  storageKey: "pm-matrix-v1",
  idPrefix: "matrix",
});

export const listBoards = (): MatrixRecord[] => store.list();

export const getBoard = (id: string): MatrixRecord | undefined => store.get(id);

export const createBoard = (): MatrixRecord =>
  store.create({
    productId: resolveActiveProduct().id,
    items: [],
  });

export const saveBoardData = (id: string, data: Partial<Pick<MatrixRecord, "items">>): void =>
  store.update(id, data);

export const deleteBoard = (id: string): void => store.remove(id);

export const getActiveId = (): string | null => store.getActiveId(resolveActiveProduct().id);

export const setActiveId = (id: string): void => store.setActiveId(resolveActiveProduct().id, id);

export const resolveActiveBoard = (): MatrixRecord => {
  const activeId = getActiveId();
  const existing = activeId ? getBoard(activeId) : undefined;
  if (existing) return existing;
  const created = createBoard();
  setActiveId(created.id);
  return created;
};

export const addItem = (boardId: string, text: string): void => {
  const board = getBoard(boardId);
  if (!board) return;
  const item: MatrixBoardItem = { id: uid("mitem"), text, zone: null };
  saveBoardData(boardId, { items: [...board.items, item] });
};

export const placeItem = (boardId: string, itemId: string, zone: MatrixZone): void => {
  const board = getBoard(boardId);
  if (!board) return;
  const items = board.items.map((item) =>
    item.id === itemId ? { ...item, zone } : item,
  );
  saveBoardData(boardId, { items });
};

export const removeItem = (boardId: string, itemId: string): void => {
  const board = getBoard(boardId);
  if (!board) return;
  saveBoardData(boardId, { items: board.items.filter((i) => i.id !== itemId) });
};
