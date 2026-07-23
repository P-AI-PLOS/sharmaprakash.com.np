/**
 * Renders a Tree (outcome -> opportunities -> solutions) as a connected node
 * diagram via react-d3-tree, with a switchable layout direction.
 *
 * "right-to-left" isn't a orientation react-d3-tree supports natively (only
 * horizontal/vertical, inverted via depthFactor along a single axis) — it's
 * built here by rendering the normal left-to-right layout inside a
 * scaleX(-1) wrapper, then counter-flipping each node's own content so text
 * reads normally while the tree branches leftward.
 */
import { useEffect, useRef, useState } from "react";
import Tree from "react-d3-tree";
import type { CustomNodeElementProps, RawNodeDatum } from "react-d3-tree";
import { Flag, Compass, Lightbulb, Target } from "lucide-react";

export type TreeDirection = "top-down" | "left-right" | "right-left";

interface DiagramOpportunity {
  text: string;
  solutions: { id: string; text: string }[];
  target: boolean;
}

interface DiagramProps {
  outcome: string;
  opportunities: DiagramOpportunity[];
  direction: TreeDirection;
  /** Tailwind height class for the canvas. Defaults to a fixed height; pass "flex-1" in a flex column (e.g. fullscreen mode) to fill available space. */
  heightClassName?: string;
}

const NODE_KIND_ICON = {
  outcome: Flag,
  opportunity: Compass,
  solution: Lightbulb,
} as const;

// Depth-graduated tiers using only the site's ink/accent tokens (no new
// hues): outcome is boldest, a target opportunity is elevated to the same
// accent tier, a plain opportunity sits at a neutral mid tier, and a
// solution — the leaf — is the quietest.
const nodeStyle = (kind: string, isTarget: boolean) => {
  if (kind === "outcome") return { card: "border-accent-600 bg-accent-50 text-strong", icon: "text-accent-700" };
  if (kind === "opportunity" && isTarget) return { card: "border-accent-600 bg-accent-50 text-strong", icon: "text-accent-700" };
  if (kind === "opportunity") return { card: "border-ink-300 bg-surface-base text-strong", icon: "text-ink-500" };
  return { card: "border-ink-200 bg-surface-sunken text-muted", icon: "text-ink-400" };
};

const toRawData = (outcome: string, opportunities: DiagramOpportunity[]): RawNodeDatum => ({
  name: outcome.trim() || "Outcome (not set)",
  attributes: { kind: "outcome" },
  children: opportunities.map((opp) => ({
    name: opp.text,
    attributes: { kind: "opportunity", target: opp.target },
    children: opp.solutions.map((sol) => ({
      name: sol.text,
      attributes: { kind: "solution" },
    })),
  })),
});

function DiagramNode({ nodeDatum, mirrored }: CustomNodeElementProps & { mirrored: boolean }) {
  const kind = (nodeDatum.attributes?.kind as string) ?? "opportunity";
  const isTarget = nodeDatum.attributes?.target === true;
  const width = 208;
  const height = 84;
  const KindIcon = NODE_KIND_ICON[kind as keyof typeof NODE_KIND_ICON] ?? Compass;
  const style = nodeStyle(kind, isTarget);

  return (
    <foreignObject x={-width / 2} y={-height / 2} width={width} height={height} style={{ overflow: "visible" }}>
      <div
        style={mirrored ? { transform: "scaleX(-1)" } : undefined}
        className={`relative flex h-full items-start gap-2 rounded-lg border p-3 text-caption leading-snug shadow-sm ${style.card}`}
      >
        {isTarget && (
          <span className="absolute -right-2 -top-2 flex items-center gap-1 rounded-full border border-accent-600 bg-accent-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white shadow-sm">
            <Target size={9} strokeWidth={3} aria-hidden="true" />
            Target
          </span>
        )}
        <KindIcon size={16} strokeWidth={2} className={`mt-0.5 shrink-0 ${style.icon}`} aria-hidden="true" />
        <span className="line-clamp-3 font-medium">{nodeDatum.name}</span>
      </div>
    </foreignObject>
  );
}

export default function TreeDiagram({ outcome, opportunities, direction, heightClassName }: DiagramProps) {
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

  const data = toRawData(outcome, opportunities);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`Tree diagram: outcome "${outcome || "not set"}" with ${opportunities.length} opportunit${opportunities.length === 1 ? "y" : "ies"}`}
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
          renderCustomNodeElement={(props) => <DiagramNode {...props} mirrored={mirrored} />}
        />
      )}
    </div>
  );
}
