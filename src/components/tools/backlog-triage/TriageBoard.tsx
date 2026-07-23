/**
 * Backlog Triage Board — the island root. Resolves the active board for
 * its source prop, single-line add form, bulk-paste textarea, renders
 * three TriageColumns plus an unbucketed staging area, export action,
 * optional TriageDashboard.
 */
import { useEffect, useRef, useState } from "react";
import { ExerciseShell } from "~/components/course/exercises/exercise-ui";
import TriageColumn from "./TriageColumn";
import TriageItemCard from "./TriageItemCard";
import TriageDashboard from "./TriageDashboard";
import TriageHelpModal, { type TriageConcept } from "./TriageHelpModal";
import {
  contextKeyFor,
  createBoard,
  deleteBoard,
  listBoards,
  resolveActiveBoard,
  saveBoardData,
  setActiveId as setActiveIdInStore,
  titleFor,
  toMarkdown,
  addItem as storeAddItem,
  addItemsBulk,
  moveItem as storeMoveItem,
  setNeverReason as storeSetNeverReason,
  removeItem as storeRemoveItem,
  type TriageBoardRecord,
  type TriageBucket,
  type TriageSource,
} from "~/utils/backlog-triage-store";

interface TriageBoardProps {
  source?: TriageSource;
  kicker?: string;
  title?: string;
  instructions?: string;
  showDashboard?: boolean;
}

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

export default function TriageBoard({
  source = { type: "standalone" },
  kicker = "Free tool",
  title = "Your backlog triage board",
  instructions = "Paste your backlog, then sort each item: Now (committed this cycle), Next (a short queue within a quarter), or Never (said out loud, closed with a reason). Everything saves in your browser.",
  showDashboard = false,
}: TriageBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [board, setBoard] = useState<TriageBoardRecord | null>(null);
  const [records, setRecords] = useState<TriageBoardRecord[]>([]);
  const [draftText, setDraftText] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [copied, setCopied] = useState(false);
  const [helpConcept, setHelpConcept] = useState<TriageConcept | null>(null);
  const hydrated = useRef(false);
  const contextKey = contextKeyFor(source);

  useEffect(() => {
    const record = resolveActiveBoard(source);
    setActiveId(record.id);
    setBoard(record);
    setRecords(listBoards());
    hydrated.current = true;
  }, [contextKey]);

  const refreshBoard = (id: string) => {
    const b = listBoards().find((r) => r.id === id);
    if (b) setBoard(b);
    setRecords(listBoards());
  };

  const switchTo = (id: string) => {
    const record = records.find((r) => r.id === id);
    if (!record) return;
    setActiveIdInStore(contextKey, id);
    setActiveId(id);
    setBoard(record);
  };

  const createAndSwitch = () => {
    const record = createBoard(source);
    setActiveIdInStore(contextKey, record.id);
    setActiveId(record.id);
    setBoard(record);
    setRecords(listBoards());
  };

  const removeBoard = (id: string) => {
    deleteBoard(id);
    const remaining = listBoards();
    setRecords(remaining);
    if (id === activeId) {
      const next = remaining[0] ?? createBoard(source);
      setActiveIdInStore(contextKey, next.id);
      setActiveId(next.id);
      setBoard(next);
      if (remaining.length === 0) setRecords(listBoards());
    }
  };

  const handleAddItem = () => {
    const text = draftText.trim();
    if (!text || !activeId) return;
    storeAddItem(activeId, text);
    setDraftText("");
    refreshBoard(activeId);
  };

  const handleBulkAdd = () => {
    if (!bulkText.trim() || !activeId) return;
    addItemsBulk(activeId, bulkText);
    setBulkText("");
    setShowBulk(false);
    refreshBoard(activeId);
  };

  const handleDrop = (itemId: string, bucket: TriageBucket) => {
    if (!activeId) return;
    storeMoveItem(activeId, itemId, bucket);
    refreshBoard(activeId);
  };

  const handleSetReason = (itemId: string, reason: string) => {
    if (!activeId) return;
    storeSetNeverReason(activeId, itemId, reason);
    refreshBoard(activeId);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!activeId) return;
    storeRemoveItem(activeId, itemId);
    refreshBoard(activeId);
  };

  const copyMarkdown = async () => {
    if (!board) return;
    try {
      await navigator.clipboard.writeText(toMarkdown(board));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (!board) return null;

  const unbucketed = board.items.filter((i) => i.bucket === null);
  const hasItems = board.items.length > 0;

  const editor = (
    <>
      {/* Add items */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            placeholder="Add a backlog item..."
            className={inputClass}
          />
          <button type="button" onClick={handleAddItem} className="btn btn-primary shrink-0 !py-2">
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowBulk(!showBulk)}
            className="btn btn-secondary shrink-0 !py-2 !text-caption"
          >
            {showBulk ? "Single" : "Paste multiple"}
          </button>
        </div>

        {showBulk && (
          <div>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Paste your backlog items, one per line..."
              rows={4}
              className={inputClass}
            />
            <div className="mt-2 flex justify-end">
              <button type="button" onClick={handleBulkAdd} className="btn btn-primary shrink-0 !py-2 !text-caption">
                Add all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Unbucketed staging area */}
      {unbucketed.length > 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-ink-200 bg-surface-base p-4">
          <p className="text-caption font-semibold text-muted">
            Unbucketed ({unbucketed.length}) — sort these into Now, Next, or Never
          </p>
          <div className="mt-2 grid gap-2">
            {unbucketed.map((item) => (
              <TriageItemCard
                key={item.id}
                item={item}
                onMove={(b) => handleDrop(item.id, b)}
                onSetReason={(r) => handleSetReason(item.id, r)}
                onDelete={() => handleDeleteItem(item.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Three columns */}
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {(["now", "next", "never"] as TriageBucket[]).map((bucket) => (
          <TriageColumn
            key={bucket}
            bucket={bucket}
            items={board.items.filter((i) => i.bucket === bucket)}
            allItems={board.items}
            onDrop={(itemId) => handleDrop(itemId, bucket)}
            onMove={(itemId, b) => handleDrop(itemId, b)}
            onSetReason={handleSetReason}
            onDelete={handleDeleteItem}
            onHelp={setHelpConcept}
          />
        ))}
      </div>
    </>
  );

  const exportBlock = hasItems && (
    <div className="mt-6 border-t border-ink-200 pt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption font-semibold text-muted">Export</p>
        <div className="flex gap-4">
          <button type="button" onClick={copyMarkdown} className="text-caption font-semibold text-accent-700 link-underline">
            {copied ? "Copied ✓" : "Copy as Markdown"}
          </button>
        </div>
      </div>
      <pre className="mt-2 overflow-x-auto rounded-md bg-ink-100 p-3 text-caption text-strong">{toMarkdown(board)}</pre>
    </div>
  );

  return (
    <>
      <ExerciseShell
        kicker={kicker}
        title={title}
        instructions={instructions}
        headerAction={
          <div className="flex shrink-0 items-center gap-2">
            {source.type === "standalone" && (
              <button
                type="button"
                onClick={createAndSwitch}
                className="btn btn-ghost btn-sm shrink-0 !text-caption"
              >
                New board
              </button>
            )}
          </div>
        }
      >
        {editor}
        {exportBlock}
        {showDashboard && activeId && (
          <TriageDashboard records={records} activeId={activeId} onOpen={switchTo} onDelete={removeBoard} />
        )}
      </ExerciseShell>
      <TriageHelpModal concept={helpConcept} onClose={() => setHelpConcept(null)} />
    </>
  );
}
