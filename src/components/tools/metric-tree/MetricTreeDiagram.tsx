/**
 * Renders a MetricTree as a connected node diagram via react-d3-tree.
 * Follows OST TreeDiagram's pattern (scaleX(-1) trick, foreignObject nodes,
 * ResizeObserver) but with homogeneous recursive MetricNodes at any depth.
 */
import { useEffect, useRef, useState } from "react";
import Tree from "react-d3-tree";
import type { CustomNodeElementProps, RawNodeDatum } from "react-d3-tree";
import { TreePine, Leaf, Ghost, Swords } from "lucide-react";
import type { MetricNode } from "~/utils/metric-tree-store";

export type TreeDirection = "top-down" | "left-right" | "right-left";

interface MetricTreeDiagramProps {
  root: MetricNode;
  direction: TreeDirection;
  heightClassName?: string;
}

const toRawData = (node: MetricNode): RawNodeDatum => ({
  name: node.text,
  attributes: {
    isLeaf: node.children.length === 0,
    annotationStatus: node.annotation?.status ?? "",
  },
  children: node.children.map(toRawData),
});

// Two tiers: root is boldest, everything else is leaf vs branch
const nodeStyle = (isRoot: boolean, isLeaf: boolean, annotationStatus: string) => {
  if (isRoot) return { card: "border-accent-600 bg-accent-50 text-strong", icon: "text-accent-700" };
  if (annotationStatus === "orphan") return { card: "border-amber-300 bg-amber-50 text-strong", icon: "text-amber-600" };
  if (annotationStatus === "contested") return { card: "border-rose-300 bg-rose-50 text-strong", icon: "text-rose-600" };
  if (isLeaf) return { card: "border-ink-200 bg-surface-sunken text-muted", icon: "text-ink-400" };
  return { card: "border-ink-300 bg-surface-base text-strong", icon: "text-ink-500" };
};

function DiagramNode({ nodeDatum, mirrored, isRoot }: CustomNodeElementProps & { mirrored: boolean; isRoot: boolean }) {
  const isLeaf = nodeDatum.attributes?.isLeaf === true;
  const annotationStatus = (nodeDatum.attributes?.annotationStatus as string) ?? "";
  const width = 208;
  const height = 84;
  const style = nodeStyle(isRoot, isLeaf, annotationStatus);

  return (
    <foreignObject x={-width / 2} y={-height / 2} width={width} height={height} style={{ overflow: "visible" }}>
      <div
        style={mirrored ? { transform: "scaleX(-1)" } : undefined}
        className={`relative flex h-full items-start gap-2 rounded-lg border p-3 text-caption leading-snug shadow-sm ${style.card}`}
      >
        {annotationStatus === "orphan" && (
          <span className="absolute -right-2 -top-2 flex items-center gap-1 rounded-full border border-amber-400 bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-amber-700 shadow-sm">
            <Ghost size={9} strokeWidth={3} aria-hidden="true" />
            Orphan
          </span>
        )}
        {annotationStatus === "contested" && (
          <span className="absolute -right-2 -top-2 flex items-center gap-1 rounded-full border border-rose-400 bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-rose-700 shadow-sm">
            <Swords size={9} strokeWidth={3} aria-hidden="true" />
            Contested
          </span>
        )}
        {isRoot ? (
          <TreePine size={16} strokeWidth={2} className={`mt-0.5 shrink-0 ${style.icon}`} aria-hidden="true" />
        ) : isLeaf ? (
          <Leaf size={16} strokeWidth={2} className={`mt-0.5 shrink-0 ${style.icon}`} aria-hidden="true" />
        ) : (
          <TreePine size={16} strokeWidth={2} className={`mt-0.5 shrink-0 ${style.icon}`} aria-hidden="true" />
        )}
        <span className="line-clamp-3 font-medium">{nodeDatum.name}</span>
      </div>
    </foreignObject>
  );
}

export default function MetricTreeDiagram({ root, direction, heightClassName }: MetricTreeDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 480 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const mirrored = direction === "right-left";
  const orientation = direction === "top-down" ? "vertical" : "horizontal";
  const translate =
    orientation === "vertical"
      ? { x: dimensions.width / 2, y: 70 }
      : { x: 90, y: dimensions.height / 2 };

  const data = toRawData(root);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`Metric tree: "${root.text || "not set"}" with ${root.children.length} input metric${root.children.length === 1 ? "" : "s"}`}
      className={`${heightClassName ?? "h-[480px]"} min-h-0 w-full overflow-hidden rounded-lg border border-ink-200 bg-surface-sunken`}
      style={mirrored ? { transform: "scaleX(-1)" } : undefined}
    >
      {dimensions.width > 0 && (
        <Tree
          data={data}
          orientation={orientation}
          translate={translate}
          nodeSize={{ x: 220, y: 130 }}
          separation={{ siblings: 1.2, nonSiblings: 1.5 }}
          pathFunc="step"
          collapsible={false}
          zoomable
          draggable
          scaleExtent={{ min: 0.4, max: 1.5 }}
          renderCustomNodeElement={(props) => <DiagramNode {...props} mirrored={mirrored} isRoot={false} />}
        />
      )}
    </div>
  );
}
