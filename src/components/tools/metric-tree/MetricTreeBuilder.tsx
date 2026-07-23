/**
 * North Star Metric Tree — standalone builder island.
 * Root (North Star) → input metrics → leaves, any depth.
 * Persists via metric-tree-store; freeform only.
 */
import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Ghost, Swords, ChevronRight, Copy, Maximize2, Minimize2 } from "lucide-react";
import { ExerciseShell } from "~/components/course/exercises/exercise-ui";
import MetricHelpModal from "./MetricHelpModal";
import MetricTreeDiagram, { type TreeDirection } from "./MetricTreeDiagram";
import {
  addChild,
  removeNode,
  renameNode,
  setAnnotation,
  resolveActiveTree,
  saveTreeData,
  type MetricNode,
} from "~/utils/metric-tree-store";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

const inputClass =
  "w-full rounded-md border border-ink-200 bg-surface-base px-3 py-2 text-body text-strong placeholder:text-faint focus:border-accent-600 focus:outline-none";

// Markdown export
const ICON = { root: "🌟", branch: "📊", leaf: "🎯" } as const;

const lineFor = (node: MetricNode, depth: number): string[] => {
  const isLeaf = node.children.length === 0;
  const icon = depth === 0 ? ICON.root : isLeaf ? ICON.leaf : ICON.branch;
  const badge =
    node.annotation?.status === "orphan" ? " — 🕳️ orphan" :
    node.annotation?.status === "contested" ? " — ⚔️ contested" : "";
  const line = `${"  ".repeat(depth)}- ${icon} ${node.text}${badge}`;
  return [line, ...node.children.flatMap((c) => lineFor(c, depth + 1))];
};

const exportToMarkdown = (root: MetricNode): string => {
  const lines = [`# North Star metric tree`, "", ...lineFor(root, 0)];
  return lines.join("\n");
};

interface MetricTreeBuilderProps {
  source?: { type: "standalone" } | { type: "post"; postSlug: string; postTitle: string; href: string };
  showDashboard?: boolean;
  kicker?: string;
  title?: string;
  instructions?: string;
}

export default function MetricTreeBuilder({
  source = { type: "standalone" },
  showDashboard = false,
  kicker = "Free tool",
  title = "North Star metric tree",
  instructions = "Decompose your North Star into input metrics. Keep going until each leaf is owned by a single team.",
}: MetricTreeBuilderProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [treeId, setTreeId] = useState<string | null>(null);
  const [root, setRoot] = useState<MetricNode>({ id: "", text: "", children: [], annotation: null });
  const [direction, setDirection] = useState<TreeDirection>("left-right");
  const [fullscreen, setFullscreen] = useState(false);
  const [newChildTexts, setNewChildTexts] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const hydrated = useRef(false);

  useEffect(() => {
    const tree = resolveActiveTree(source);
    setTreeId(tree.id);
    setRoot(tree.tree.root);
    hydrated.current = true;
  }, [source]);

  const persist = (nextRoot: MetricNode) => {
    setRoot(nextRoot);
    // persistence happens inside metric-tree-store on each mutation call
  };

  const findNode = (node: MetricNode, id: string): MetricNode | null => {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
    return null;
  };

  const replaceNode = (node: MetricNode, id: string, replacement: MetricNode | null): MetricNode => {
    if (node.id === id) return replacement ?? node;
    return {
      ...node,
      children: node.children
        .map((child) => replaceNode(child, id, replacement))
        .filter((c): c is MetricNode => c !== null),
    };
  };

  const handleAddChild = (parentId: string) => {
    const text = (newChildTexts[parentId] ?? "").trim();
    if (!text || !treeId) return;
    const tree = resolveActiveTree(source);
    const updatedTree = addChild(tree.tree, parentId, text);
    saveTreeData(treeId, updatedTree);
    persist(updatedTree.root);
    setNewChildTexts((prev) => ({ ...prev, [parentId]: "" }));
  };

  const handleDelete = (nodeId: string) => {
    if (!treeId || nodeId === root.id) return; // can't delete root
    const tree = resolveActiveTree(source);
    const updatedTree = removeNode(tree.tree, nodeId);
    saveTreeData(treeId, updatedTree);
    persist(updatedTree.root);
  };

  const handleAnnotate = (nodeId: string, status: "orphan" | "contested") => {
    if (!treeId) return;
    const tree = resolveActiveTree(source);
    const updatedTree = setAnnotation(tree.tree, nodeId, { status, note: "" });
    saveTreeData(treeId, updatedTree);
    persist(updatedTree.root);
  };

  const handleClearAnnotation = (nodeId: string) => {
    if (!treeId) return;
    const tree = resolveActiveTree(source);
    const updatedTree = setAnnotation(tree.tree, nodeId, null);
    saveTreeData(treeId, updatedTree);
    persist(updatedTree.root);
  };

  const handleStartEdit = (nodeId: string, currentText: string) => {
    setEditingId(nodeId);
    setEditingText(currentText);
  };

  const handleSaveEdit = (nodeId: string) => {
    if (!treeId || !editingText.trim()) return;
    const tree = resolveActiveTree(source);
    const updatedTree = renameNode(tree.tree, nodeId, editingText.trim());
    saveTreeData(treeId, updatedTree);
    persist(updatedTree.root);
    setEditingId(null);
    setEditingText("");
  };

  const handleExport = () => {
    const md = exportToMarkdown(root);
    navigator.clipboard.writeText(md).catch(() => {});
  };

  const renderNode = (node: MetricNode, depth: number = 0): React.ReactNode => {
    const isLeaf = node.children.length === 0;
    const isRoot = depth === 0;

    return (
      <div key={node.id} className={`${depth > 0 ? "ml-4 mt-2 border-l-2 border-ink-200 pl-3" : ""}`}>
        <div className="flex items-center gap-2 rounded-lg border border-ink-200 bg-surface-base p-3">
          {editingId === node.id ? (
            <div className="flex flex-1 items-center gap-2">
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(node.id)}
                className={`${inputClass} !text-caption flex-1`}
                autoFocus
              />
              <button type="button" onClick={() => handleSaveEdit(node.id)} className="btn btn-primary btn-sm !py-1">
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="btn btn-ghost btn-sm !py-1 text-faint"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <span
                className="flex-1 text-body font-semibold text-strong cursor-pointer hover:text-accent-700"
                onClick={() => handleStartEdit(node.id, node.text)}
              >
                {isRoot && <span className="mr-1">🌟</span>}
                {isLeaf && !isRoot && <span className="mr-1">🎯</span>}
                {!isLeaf && !isRoot && <span className="mr-1">📊</span>}
                {node.text || "(empty)"}
              </span>

              {/* Annotation badges */}
              {node.annotation?.status === "orphan" && (
                <span className="flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  <Ghost size={10} strokeWidth={3} /> Orphan
                </span>
              )}
              {node.annotation?.status === "contested" && (
                <span className="flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                  <Swords size={10} strokeWidth={3} /> Contested
                </span>
              )}

              {/* Actions */}
              {!isRoot && (
                <button
                  type="button"
                  onClick={() => handleDelete(node.id)}
                  aria-label={`Delete: ${node.text}`}
                  className="shrink-0 text-faint transition-colors hover:text-accent-700"
                >
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              )}
              {isLeaf && !isRoot && (
                <>
                  {node.annotation?.status !== "orphan" && (
                    <button
                      type="button"
                      onClick={() => handleAnnotate(node.id, "orphan")}
                      className="shrink-0 text-faint transition-colors hover:text-amber-600"
                      title="Mark as orphan"
                    >
                      <Ghost size={14} strokeWidth={2} />
                    </button>
                  )}
                  {node.annotation?.status !== "contested" && (
                    <button
                      type="button"
                      onClick={() => handleAnnotate(node.id, "contested")}
                      className="shrink-0 text-faint transition-colors hover:text-rose-600"
                      title="Mark as contested"
                    >
                      <Swords size={14} strokeWidth={2} />
                    </button>
                  )}
                  {node.annotation && (
                    <button
                      type="button"
                      onClick={() => handleClearAnnotation(node.id)}
                      className="text-[10px] text-faint hover:text-accent-700"
                    >
                      clear
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Add child input */}
        <div className="mt-2 flex items-center gap-2">
          <ChevronRight size={14} className="text-faint" />
          <input
            type="text"
            value={newChildTexts[node.id] ?? ""}
            onChange={(e) => setNewChildTexts((prev) => ({ ...prev, [node.id]: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleAddChild(node.id)}
            placeholder="Add child metric..."
            className={`${inputClass} !text-caption flex-1`}
          />
          <button
            type="button"
            onClick={() => handleAddChild(node.id)}
            className="btn btn-primary btn-sm shrink-0 !py-1"
          >
            <Plus size={12} strokeWidth={3} />
          </button>
        </div>

        {/* Children */}
        {node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <>
      <ExerciseShell
        kicker={kicker}
        title={title}
        instructions={instructions}
      >
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="btn btn-ghost btn-sm !text-caption"
          >
            How this works
          </button>
          <div className="flex items-center gap-2">
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as TreeDirection)}
              className="rounded-md border border-ink-200 bg-surface-base px-2 py-1 text-caption text-strong"
            >
              <option value="left-right">Left → Right</option>
              <option value="top-down">Top → Bottom</option>
            </select>
            <button
              type="button"
              onClick={() => setFullscreen(!fullscreen)}
              className="btn btn-ghost btn-sm !py-1"
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="btn btn-ghost btn-sm !text-caption"
            >
              <Copy size={12} /> Export
            </button>
          </div>
        </div>

        {/* Diagram */}
        <div className={fullscreen ? "fixed inset-0 z-50 bg-surface-base p-4" : ""}>
          {fullscreen && (
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                className="btn btn-ghost btn-sm"
              >
                <Minimize2 size={14} /> Exit
              </button>
            </div>
          )}
          <MetricTreeDiagram
            root={root}
            direction={direction}
            heightClassName={fullscreen ? "flex-1" : undefined}
          />
        </div>

        {/* Editor */}
        <div className={fullscreen ? "hidden" : ""}>
          {renderNode(root)}
        </div>
      </ExerciseShell>
      <MetricHelpModal show={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}
