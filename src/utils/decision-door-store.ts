import { createToolStore, uid, type ToolRecordBase } from "./pipeline-store";

export type DoorType = "one-way" | "two-way";

export interface DecisionLogRecord extends ToolRecordBase {
  decisionText: string;
  call: DoorType;
  note: string;
}

const store = createToolStore<DecisionLogRecord>({
  storageKey: "pm-decisiondoor-v1",
  idPrefix: "door",
});

export const listDecisions = (): DecisionLogRecord[] => store.list();

export const addDecision = (
  decisionText: string,
  call: DoorType,
  note: string,
): DecisionLogRecord =>
  store.create({
    productId: "",  // not product-scoped per design D5
    decisionText,
    call,
    note,
  });

export const removeDecision = (id: string): void => store.remove(id);
