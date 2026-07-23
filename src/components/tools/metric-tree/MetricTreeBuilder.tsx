/**
 * North Star Metric Tree — the builder island.
 *
 * Root (the North Star) → input metrics → leaves, at any depth. Leaves can be
 * flagged orphan (nobody owns it) or contested (more than one team claims it)
 * with a note. Persists to localStorage via metric-tree-store, which can hold
 * several trees (the post embed, or any number created from the standalone
 * tool) and remembers which tree each embed context last had open.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Ghost, HelpCircle, Maximize2, Plus, Swords, Trash2, TreePine, X } from "lucide-react";
import { ExerciseShell, ChoiceButton } from "~/components/course/exercises/exercise-ui";
import MetricHelpModal from "./MetricHelpModal";
import MetricTreeDiagram, { type TreeDirection } from "./MetricTreeDiagram";
import MetricTreeSwitcher from "./MetricTreeSwitcher";
import MetricTreeDashboard from "./MetricTreeDashboard";
import {
  addChild,
  contextKeyFor,
  createTree,
  deleteTree,
  emptyTree,
  listTrees,
  removeNode,
  renameNode,
  resolveActiveTree,
  saveTreeData,
  setAnnotation,
  setActiveId as setActiveIdInStore,
  toMarkdown,
  type MetricAnnotationStatus,
  type MetricNode,
  type MetricTree,
  type MetricTreeRecord,
  type MetricTreeSource,
} from "~/utils/metric-tree-store";

// Distinct from OST's `?ost=full` so the two tools never read each other's
// full-screen state when both appear on one page.
const FULLSCREEN_PARAM = "mtree";
const FULLSCREEN_VALUE = "full";

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

interface MetricTreeBuilderProps {
  /** Which embed this is — the source post, or the standalone tool. Defaults to standalone. */
  source?: MetricTreeSource;
  kicker?: string;
  title?: string;
  instructions?: string;
  /** Show the "your trees" management grid below the export block (used on the standalone tool page). */
  showDashboard?: boolean;
}

export default function MetricTreeBuilder({
  source = { type: "standalone" },
  kicker = "Build yours",
  title = "Your North Star metric tree",
  instructions = "North Star at the root, the input metrics that compose it underneath, and keep decomposing until every leaf is a number one team can own. It saves in your browser — nothing is sent anywhere.",
  showDashboard = false,
}: MetricTreeBuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tree, setTree] = useState<MetricTree>(emptyTree);
  const [records, setRecords] = useState<MetricTreeRecord[]>([]);
  const [childDrafts, setChildDrafts] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState<TreeDirection>("top-down");
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const hydrated = useRef(false);
  const contextKey = contextKeyFor(source);

  useEffect(() => {
    const record = resolveActiveTree(source);
    setActiveId(record.id);
    setTree(record.tree);
    setRecords(listTrees());
    hydrated.current = true;

    const params = new URLSearchParams(window.location.search);
    if (params.get(FULLSCREEN_PARAM) === FULLSCREEN_VALUE) setFullscreen(true);
    // Only the resolved source (via contextKey) should ever re-run this — source is a fresh object per render otherwise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextKey]);

  // Mirror fullscreen state into the URL (replaceState, not pushState — this
  // is a view mode, not a new history entry) so a refresh re-opens in place.
  const skipFirstUrlSync = useRef(true);
  useEffect(() => {
    if (skipFirstUrlSync.current) {
      skipFirstUrlSync.current = false;
      return;
    }
    const url = new URL(window.location.href);
    if (fullscreen) url.searchParams.set(FULLSCREEN_PARAM, FULLSCREEN_VALUE);
    else url.searchParams.delete(FULLSCREEN_PARAM);
    window.history.replaceState(window.history.state, "", url);
  }, [fullscreen]);

  useEffect(() => {
    if (!hydrated.current || !activeId) return;
    saveTreeData(activeId, tree);
    setRecords(listTrees());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree]);

  useEffect(() => {
    if (!fullscreen) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [fullscreen]);

  const switchTo = (id: string) => {
    const record = records.find((r) => r.id === id);
    if (!record) return;
    setActiveIdInStore(contextKey, id);
    setActiveId(id);
    setTree(record.tree);
  };

  const createAndSwitch = () => {
    const record = createTree(source);
    setActiveIdInStore(contextKey, record.id);
    setActiveId(record.id);
    setTree(record.tree);
    setRecords(listTrees());
  };

  const removeTree = (id: string) => {
    deleteTree(id);
    const remaining = listTrees();
    setRecords(remaining);
    if (id === activeId) {
      const next = remaining[0] ?? createTree(source);
      setActiveIdInStore(contextKey, next.id);
      setActiveId(next.id);
      setTree(next.tree);
      if (remaining.length === 0) setRecords(listTrees());
    }
  };

  const rename = (nodeId: string, text: string) => setTree((t) => renameNode(t, nodeId, text));

  const addChildTo = (parentId: string) => {
    const text = (childDrafts[parentId] ?? "").trim();
    if (!text) return;
    setTree((t) => addChild(t, parentId, text));
    setChildDrafts((d) => ({ ...d, [parentId]: "" }));
  };

  const remove = (nodeId: string) => setTree((t) => removeNode(t, nodeId));

  const annotate = (nodeId: string, status: MetricAnnotationStatus | null, note = "") =>
    setTree((t) => setAnnotation(t, nodeId, status ? { status, note } : null));

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(toMarkdown(tree));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the block below still shows the export */
    }
  };

  const renderNode = (node: MetricNode, depth: number): React.ReactNode => {
    const isLeaf = node.children.length === 0;
    const isRoot = depth === 0;
    const status = node.annotation?.status ?? null;

    return (
      <div
        key={node.id}
        className={depth > 0 ? "mt-3 border-l-2 border-ink-200 pl-3 sm:pl-4" : ""}
      >
        <div className="rounded-lg border border-ink-200 bg-surface-base p-3">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="shrink-0 text-caption">
              {isRoot ? "🌟" : isLeaf ? "🎯" : "📊"}
            </span>
            <input
              type="text"
              value={node.text}
              onChange={(e) => rename(node.id, e.target.value)}
              placeholder={isRoot ? "Your North Star metric…" : "Metric name…"}
              aria-label={isRoot ? "North Star metric" : `Metric: ${node.text || "unnamed"}`}
              className={`${inputClass} !py-1.5 ${isRoot ? "font-semibold" : ""}`}
            />

            {status === "orphan" && (
              <span className="hidden shrink-0 items-center gap-1 rounded-full border border-dashed border-ink-400 px-2 py-0.5 text-[10px] font-semibold text-muted sm:flex">
                <Ghost size={10} strokeWidth={3} aria-hidden="true" /> Orphan
              </span>
            )}
            {status === "contested" && (
              <span className="hidden shrink-0 items-center gap-1 rounded-full border border-accent-600 bg-accent-600 px-2 py-0.5 text-[10px] font-semibold text-white sm:flex">
                <Swords size={10} strokeWidth={3} aria-hidden="true" /> Contested
              </span>
            )}

            {!isRoot && (
              <button
                type="button"
                onClick={() => remove(node.id)}
                aria-label={`Remove metric: ${node.text || "unnamed"}`}
                className="shrink-0 text-faint transition-colors hover:text-accent-700"
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Ownership annotation — leaves only (design D5). An unnamed node
              has nothing to own yet, so the controls wait for a name rather
              than greeting an empty tree with "mark orphan". */}
          {isLeaf && node.text.trim() !== "" && (
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 pl-6">
              <button
                type="button"
                onClick={() => annotate(node.id, status === "orphan" ? null : "orphan", node.annotation?.note ?? "")}
                aria-pressed={status === "orphan"}
                className={`inline-flex items-center gap-1 text-caption font-semibold link-underline ${
                  status === "orphan" ? "text-accent-700" : "text-faint"
                }`}
              >
                <Ghost size={13} strokeWidth={2} aria-hidden="true" />
                {status === "orphan" ? "Orphan ✓" : "Mark orphan"}
              </button>
              <button
                type="button"
                onClick={() => annotate(node.id, status === "contested" ? null : "contested", node.annotation?.note ?? "")}
                aria-pressed={status === "contested"}
                className={`inline-flex items-center gap-1 text-caption font-semibold link-underline ${
                  status === "contested" ? "text-accent-700" : "text-faint"
                }`}
              >
                <Swords size={13} strokeWidth={2} aria-hidden="true" />
                {status === "contested" ? "Contested ✓" : "Mark contested"}
              </button>
              {status && (
                <input
                  type="text"
                  value={node.annotation?.note ?? ""}
                  onChange={(e) => annotate(node.id, status, e.target.value)}
                  placeholder={
                    status === "orphan"
                      ? "Why is it unowned? e.g. no team has claimed this"
                      : "Who's claiming it? e.g. Growth and Lifecycle both"
                  }
                  aria-label={`${status === "orphan" ? "Orphan" : "Contested"} note for ${node.text || "this metric"}`}
                  className={`${inputClass} !py-1 !text-caption min-w-[16rem] flex-1`}
                />
              )}
            </div>
          )}

          {/* Decompose one level further. */}
          <div className="mt-2 flex gap-2 pl-6">
            <input
              type="text"
              value={childDrafts[node.id] ?? ""}
              onChange={(e) => setChildDrafts((d) => ({ ...d, [node.id]: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && addChildTo(node.id)}
              placeholder={isRoot ? "Add an input metric that composes it…" : "Break this down one level further…"}
              aria-label={`Add a child metric under ${node.text || "this metric"}`}
              className={`${inputClass} !py-1 !text-caption`}
            />
            <button
              type="button"
              onClick={() => addChildTo(node.id)}
              className="btn btn-primary btn-sm shrink-0 !py-1"
              aria-label={`Add child metric under ${node.text || "this metric"}`}
            >
              <Plus size={13} strokeWidth={3} aria-hidden="true" />
              Add
            </button>
          </div>
          {isLeaf && status && (
            <p className="mt-2 pl-6 text-caption text-faint">
              Adding a child metric clears this leaf&rsquo;s {status} flag — it&rsquo;s no longer where the tree stops.
            </p>
          )}
        </div>

        {node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  const hasTree = Boolean(tree.root.text.trim()) || tree.root.children.length > 0;

  const editor = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption font-semibold text-muted">
          The tree — North Star at the root, input metrics beneath it
        </span>
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="shrink-0 inline-flex items-center gap-1 text-caption text-muted transition-colors hover:text-accent-700"
        >
          <HelpCircle size={14} strokeWidth={2} aria-hidden="true" />
          How this works
        </button>
      </div>
      <div className="mt-3">{renderNode(tree.root, 0)}</div>
    </>
  );

  const directionToggle = (
    <div className="flex gap-2">
      <ChoiceButton label="Top-down" selected={direction === "top-down"} onClick={() => setDirection("top-down")} />
      <ChoiceButton label="Left-right" selected={direction === "left-right"} onClick={() => setDirection("left-right")} />
      <ChoiceButton label="Right-left" selected={direction === "right-left"} onClick={() => setDirection("right-left")} />
    </div>
  );

  const exportBlock = hasTree && (
    <div className="mt-6 border-t border-ink-200 pt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption font-semibold text-muted">Export</p>
        <div className="flex gap-4">
          <button type="button" onClick={copyMarkdown} className="text-caption font-semibold text-accent-700 link-underline">
            {copied ? "Copied ✓" : "Copy as Markdown"}
          </button>
          <button
            type="button"
            onClick={() => setTree(emptyTree())}
            className="text-caption font-semibold text-faint link-underline"
          >
            Clear tree
          </button>
        </div>
      </div>
      <pre className="mt-2 overflow-x-auto rounded-md bg-ink-100 p-3 text-caption text-strong">{toMarkdown(tree)}</pre>
    </div>
  );

  const switcher = activeId && (
    <MetricTreeSwitcher
      records={records}
      activeId={activeId}
      onSelect={switchTo}
      onCreate={createAndSwitch}
      onDelete={removeTree}
    />
  );

  const helpModal = <MetricHelpModal show={showHelp} onClose={() => setShowHelp(false)} />;

  if (fullscreen) {
    return (
      <>
        {createPortal(
          <div
            className="fixed inset-0 z-[100] flex flex-col bg-surface-base"
            role="dialog"
            aria-modal="true"
            aria-label="Your North Star metric tree — full screen"
          >
            <div className="flex items-center justify-between gap-3 border-b border-ink-200 bg-surface-raised px-5 py-4 shadow-sm lg:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
                  <TreePine size={20} strokeWidth={2} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="eyebrow mb-0.5">{kicker} · Full screen</p>
                  <h3 className="truncate text-h4 text-strong leading-tight">{tree.root.text || title}</h3>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {switcher}
                <button
                  type="button"
                  onClick={() => setFullscreen(false)}
                  className="btn btn-secondary btn-sm shrink-0"
                  aria-label="Exit full screen"
                >
                  <X size={16} strokeWidth={2.5} aria-hidden="true" />
                  <span>Exit full screen</span>
                  <kbd className="rounded border border-current/30 px-1.5 py-0.5 text-[11px] font-normal opacity-70">Esc</kbd>
                </button>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row lg:gap-6 lg:p-6">
              <div className="min-h-0 overflow-y-auto lg:w-[420px] lg:shrink-0 lg:pr-2">
                {editor}
                {exportBlock}
              </div>

              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-caption font-semibold text-muted">Tree diagram</p>
                  {directionToggle}
                </div>
                <div className="mt-3 min-h-0 flex-1">
                  <MetricTreeDiagram root={tree.root} direction={direction} heightClassName="h-full" />
                </div>
                <p className="mt-2 text-caption text-faint">Drag to pan, scroll to zoom.</p>
              </div>
            </div>
          </div>,
          document.body,
        )}
        {helpModal}
      </>
    );
  }

  return (
    <>
      <ExerciseShell
        kicker={kicker}
        title={title}
        instructions={instructions}
        headerAction={
          <div className="flex shrink-0 items-center gap-2">
            {switcher}
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="btn btn-ghost shrink-0 !py-1.5 !text-caption"
              aria-label="Expand to full screen"
            >
              <Maximize2 size={14} strokeWidth={2} aria-hidden="true" />
              <span>Full screen</span>
            </button>
          </div>
        }
      >
        {editor}

        {hasTree && (
          <div className="mt-6 border-t border-ink-200 pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-caption font-semibold text-muted">Tree diagram</p>
              {directionToggle}
            </div>
            <div className="mt-3">
              <MetricTreeDiagram root={tree.root} direction={direction} />
            </div>
            <p className="mt-2 text-caption text-faint">Drag to pan, scroll to zoom.</p>
          </div>
        )}

        {exportBlock}

        {showDashboard && activeId && (
          <MetricTreeDashboard records={records} activeId={activeId} onOpen={switchTo} onDelete={removeTree} />
        )}
      </ExerciseShell>
      {helpModal}
    </>
  );
}
