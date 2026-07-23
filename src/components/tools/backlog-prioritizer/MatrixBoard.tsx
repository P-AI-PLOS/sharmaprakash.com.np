/**
 * The Agreement/Certainty 2x2. Stories plot as dots on continuous 0–100 axes
 * (certainty →, agreement ↑); the Stacey zone is derived from placement, never
 * hand-assigned. Click the board to move the selected dot, or drag a dot with
 * pointer events. The live zone is shown while dragging so placement and zone
 * are argued together (the post's "the debate is the point").
 *
 * Zone tints use `--accent-*` / `--ink-*` tokens only (no hardcoded colors).
 * Dot placement animates only under `motion-safe` (respects reduced-motion).
 */
import { useRef, useState } from "react";
import { AlertTriangle, Link2Off } from "lucide-react";
import { zoneFor, ZONE_LABEL, type MatrixZone } from "~/utils/backlog-store";
import type { EnrichedItem } from "./types";

interface MatrixBoardProps {
  items: EnrichedItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Committed on pointer-up / board click — persist here, not on every move. */
  onCommit: (id: string, agreement: number, certainty: number) => void;
}

interface DragState {
  id: string;
  agreement: number;
  certainty: number;
  moved: boolean;
}

const clamp = (value: number): number => Math.max(0, Math.min(100, value));

/** Regions are positioned in percent (allowed — the token rule is about px/color). */
const ZONE_REGIONS: Array<{
  zone: MatrixZone;
  style: React.CSSProperties;
  tint: string;
}> = [
  // top-left: high agreement, low certainty → complicated
  { zone: "complicated", style: { left: 0, top: 0, width: "50%", height: "50%" }, tint: "bg-accent-50" },
  // top-right: high agreement, high certainty → simple
  { zone: "simple", style: { left: "50%", top: 0, width: "50%", height: "50%" }, tint: "bg-accent-100" },
  // bottom-left: low agreement, low certainty → complex
  { zone: "complex", style: { left: 0, top: "50%", width: "50%", height: "50%" }, tint: "bg-ink-100" },
  // bottom-right: low agreement, high certainty → complicated
  { zone: "complicated", style: { left: "50%", top: "50%", width: "50%", height: "50%" }, tint: "bg-accent-50" },
];

const ZONE_DOT: Record<MatrixZone, string> = {
  simple: "bg-accent-600 text-white",
  complicated: "bg-accent-700 text-white",
  complex: "bg-ink-500 text-white",
  chaotic: "bg-ink-700 text-white",
};

export default function MatrixBoard({ items, selectedId, onSelect, onCommit }: MatrixBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  const posFromEvent = (e: { clientX: number; clientY: number }): { agreement: number; certainty: number } => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { agreement: 50, certainty: 50 };
    const certainty = clamp(((e.clientX - rect.left) / rect.width) * 100);
    const agreement = clamp((1 - (e.clientY - rect.top) / rect.height) * 100);
    return { agreement: Math.round(agreement), certainty: Math.round(certainty) };
  };

  const handleDotPointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    boardRef.current?.setPointerCapture(e.pointerId);
    onSelect(id);
    const { agreement, certainty } = posFromEvent(e);
    setDrag({ id, agreement, certainty, moved: false });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const { agreement, certainty } = posFromEvent(e);
    setDrag({ ...drag, agreement, certainty, moved: true });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!drag) return;
    boardRef.current?.releasePointerCapture?.(e.pointerId);
    if (drag.moved) onCommit(drag.id, drag.agreement, drag.certainty);
    setDrag(null);
  };

  const handleBoardClick = (e: React.MouseEvent) => {
    // A completed drag also fires click — the pointerUp already committed it.
    if (!selectedId || drag) return;
    const { agreement, certainty } = posFromEvent(e);
    onCommit(selectedId, agreement, certainty);
  };

  const liveZone: MatrixZone | null = drag ? zoneFor(drag.agreement, drag.certainty) : null;
  const liveItem = drag ? items.find((entry) => entry.item.id === drag.id) : undefined;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption font-semibold text-muted">Agreement / Certainty matrix</p>
        <p className="min-h-[1.25rem] text-caption text-muted" role="status" aria-live="polite">
          {liveZone && liveItem ? (
            <>
              Placing <span className="font-semibold text-strong">{liveItem.item.storyTitle}</span> →{" "}
              <span className="font-semibold text-accent-700">{ZONE_LABEL[liveZone]}</span>
            </>
          ) : (
            "Drag a dot, or select one and click the board to move it."
          )}
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        {/* Agreement axis label (vertical) */}
        <div className="flex w-6 shrink-0 items-center justify-center">
          <span className="-rotate-90 whitespace-nowrap text-caption font-semibold text-muted">Agreement →</span>
        </div>

        <div className="min-w-0 flex-1">
          <div
            ref={boardRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={handleBoardClick}
            className="relative aspect-square w-full touch-none select-none overflow-hidden rounded-xl border border-ink-200 bg-surface-raised"
          >
            {/* Zone tints */}
            {ZONE_REGIONS.map((region, i) => (
              <div key={i} className={`absolute ${region.tint} opacity-70`} style={region.style} aria-hidden="true" />
            ))}
            {/* Chaotic corner marker (extreme low/low, ≤15/≤15) */}
            <div
              className="absolute bg-ink-300 opacity-80"
              style={{ left: 0, bottom: 0, width: "15%", height: "15%" }}
              aria-hidden="true"
            />
            {/* Midlines */}
            <div className="absolute left-1/2 top-0 h-full w-px bg-ink-200" aria-hidden="true" />
            <div className="absolute left-0 top-1/2 h-px w-full bg-ink-200" aria-hidden="true" />

            {/* Corner labels */}
            <span className="pointer-events-none absolute right-2 top-2 text-[11px] font-semibold text-accent-700">
              Simple
            </span>
            <span className="pointer-events-none absolute left-2 top-2 text-[11px] font-semibold text-accent-700">
              Complicated
            </span>
            <span className="pointer-events-none absolute left-2 bottom-2 text-[11px] font-semibold text-muted">
              Complex / Chaotic
            </span>

            {/* Dots */}
            {items.map((entry) => {
              const isDragging = drag?.id === entry.item.id;
              const agreement = isDragging ? drag.agreement : entry.item.agreement;
              const certainty = isDragging ? drag.certainty : entry.item.certainty;
              const zone = isDragging ? zoneFor(agreement, certainty) : entry.zone;
              const isSelected = selectedId === entry.item.id;
              return (
                <button
                  key={entry.item.id}
                  type="button"
                  onPointerDown={(e) => handleDotPointerDown(e, entry.item.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`${entry.item.storyTitle} — ${ZONE_LABEL[zone]}${entry.offStrategy ? ", off-strategy" : ""}${entry.drift ? ", source removed" : ""}`}
                  title={entry.item.storyTitle}
                  style={{
                    left: `${certainty}%`,
                    top: `${100 - agreement}%`,
                    transition: isDragging ? "none" : undefined,
                  }}
                  className={`absolute z-10 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[10px] font-semibold shadow-md motion-safe:transition-[left,top] motion-safe:duration-150 ${ZONE_DOT[zone]} ${isSelected ? "ring-2 ring-accent-600 ring-offset-1" : ""} ${entry.offStrategy ? "outline outline-2 outline-dashed outline-ink-400" : ""}`}
                >
                  {entry.drift ? (
                    <AlertTriangle size={11} strokeWidth={2.5} />
                  ) : entry.offStrategy ? (
                    <Link2Off size={11} strokeWidth={2.5} />
                  ) : (
                    <span aria-hidden="true">●</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Certainty axis label (horizontal) */}
          <p className="mt-2 text-center text-caption font-semibold text-muted">Certainty →</p>
        </div>
      </div>

      {items.length === 0 && (
        <p className="mt-3 text-caption text-faint">
          No stories plotted yet. Add one from the picker below, then drag it to argue its placement.
        </p>
      )}
    </div>
  );
}
