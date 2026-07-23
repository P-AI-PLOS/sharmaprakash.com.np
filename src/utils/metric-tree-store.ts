import { createToolStore, resolveActiveProduct, uid, type ToolRecordBase } from "./pipeline-store";

export type MetricAnnotationStatus = "orphan" | "contested";

export interface MetricAnnotation {
  status: MetricAnnotationStatus;
  note: string;
}

export interface MetricNode {
  id: string;
  text: string;
  children: MetricNode[];
  annotation: MetricAnnotation | null;
}

export interface MetricTree {
  root: MetricNode;
}

export type MetricTreeSource =
  | { type: "standalone" }
  | { type: "post"; postSlug: string; postTitle: string; href: string };

export interface MetricTreeRecord extends ToolRecordBase {
  tree: MetricTree;
  source: MetricTreeSource;
}

export const newNode = (text: string): MetricNode => ({
  id: uid("mtn"),
  text,
  children: [],
  annotation: null,
});

export const emptyTree = (): MetricTree => ({ root: newNode("") });

/**
 * The post's own marketplace worked example (design D7): weekly transactions
 * → active buyers × transactions per buyer; active buyers → new activations +
 * retained + resurrected; activation → signups × onboarding completion ×
 * first-transaction rate. Built fresh per call so every seeded record gets its
 * own node ids.
 */
const seededTree = (): MetricTree => ({
  root: {
    ...newNode("Weekly transactions"),
    children: [
      {
        ...newNode("Active buyers"),
        children: [
          {
            ...newNode("New activations"),
            children: [
              newNode("Signups"),
              newNode("Onboarding completion"),
              newNode("First-transaction rate"),
            ],
          },
          newNode("Retained"),
          newNode("Resurrected"),
        ],
      },
      newNode("Transactions per buyer"),
    ],
  },
});

export const contextKeyFor = (source: MetricTreeSource): string =>
  source.type === "post" ? `post:${source.postSlug}` : "standalone";

const store = createToolStore<MetricTreeRecord>({
  storageKey: "pm-metric-tree-v1",
  idPrefix: "mt",
  activeKey: "metric-tree-active-v1",
});

export const listTrees = (): MetricTreeRecord[] => store.list();

export const getTree = (id: string): MetricTreeRecord | undefined => store.get(id);

export const createTree = (source: MetricTreeSource, tree: MetricTree = emptyTree()): MetricTreeRecord =>
  store.create({
    productId: resolveActiveProduct().id,
    tree,
    source,
  });

export const saveTreeData = (id: string, tree: MetricTree): void => store.update(id, { tree });

export const deleteTree = (id: string): void => store.remove(id);

export const getActiveId = (contextKey: string): string | null => store.getActiveId(contextKey);

export const setActiveId = (contextKey: string, id: string): void => store.setActiveId(contextKey, id);

export const resolveActiveTree = (source: MetricTreeSource): MetricTreeRecord => {
  const ck = contextKeyFor(source);
  const activeId = getActiveId(ck);
  const existing = activeId ? getTree(activeId) : undefined;
  if (existing) return existing;
  // D7: only a brand-new post-embed record is seeded with the worked example;
  // an existing record is returned untouched, so a returning visitor sees
  // their own edits rather than a re-seed.
  const created = createTree(source, source.type === "post" ? seededTree() : emptyTree());
  setActiveId(ck, created.id);
  return created;
};

export const titleFor = (record: MetricTreeRecord): string =>
  record.tree.root.text.trim() || "Untitled tree";

// --- Pure tree helpers ---

const findNode = (node: MetricNode, id: string): MetricNode | null => {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
};

const cloneTree = (node: MetricNode): MetricNode => ({
  ...node,
  children: node.children.map(cloneTree),
});

export const addChild = (tree: MetricTree, parentId: string, text: string): MetricTree => {
  const root = cloneTree(tree.root);
  const parent = findNode(root, parentId);
  if (!parent) return tree;
  parent.children.push(newNode(text));
  // D5: clear annotation when a leaf gains a child
  if (parent.annotation) parent.annotation = null;
  return { root };
};

export const removeNode = (tree: MetricTree, nodeId: string): MetricTree => {
  if (tree.root.id === nodeId) return tree; // never remove root
  const root = cloneTree(tree.root);
  const removeFrom = (node: MetricNode): boolean => {
    const idx = node.children.findIndex((c) => c.id === nodeId);
    if (idx >= 0) { node.children.splice(idx, 1); return true; }
    return node.children.some(removeFrom);
  };
  removeFrom(root);
  return { root };
};

export const renameNode = (tree: MetricTree, nodeId: string, text: string): MetricTree => {
  const root = cloneTree(tree.root);
  const node = findNode(root, nodeId);
  if (node) node.text = text;
  return { root };
};

export const setAnnotation = (
  tree: MetricTree,
  nodeId: string,
  annotation: MetricAnnotation | null,
): MetricTree => {
  const root = cloneTree(tree.root);
  const node = findNode(root, nodeId);
  if (node && node.children.length === 0) node.annotation = annotation;
  return { root };
};

export const toMarkdown = (tree: MetricTree): string => {
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
  return [`# North Star metric tree`, "", ...lineFor(tree.root, 0), ""].join("\n");
};
