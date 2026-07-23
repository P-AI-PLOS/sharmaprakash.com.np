/**
 * The ordered per-quarter output. Only Simple and Complicated items rank here
 * (via `rankItems`); Complex/Chaotic stay in the decision queue. Probed items
 * appear in a separate "Probing — not committed" section — a roadmap slot is
 * earned only after the probe reports back (design.md D3/D4). Off-strategy items
 * (zero KR links) rank last within their zone and carry a visible badge.
 * Copy-as-Markdown mirrors the OST export affordance.
 */
import { useState } from "react";
import { rankItems, zoneFor, ZONE_LABEL, type BacklogItem } from "~/utils/backlog-store";
import type { KrOption } from "./okr-source";
import type { EnrichedItem } from "./types";
import KrLinker from "./KrLinker";

interface PriorityListProps {
  items: EnrichedItem[];
  krOptions: KrOption[];
  markdown: string;
  onLink: (itemId: string, option: KrOption) => void;
  onUnlink: (itemId: string, keyResultId: string) => void;
}

const ZONE_BADGE: Record<"simple" | "complicated", string> = {
  simple: "bg-accent-100 text-accent-700",
  complicated: "bg-accent-50 text-accent-700",
};

function Row({
  item,
  position,
  krOptions,
  onLink,
  onUnlink,
  drift,
}: {
  item: BacklogItem;
  position: number;
  krOptions: KrOption[];
  onLink: (itemId: string, option: KrOption) => void;
  onUnlink: (itemId: string, keyResultId: string) => void;
  drift: boolean;
}) {
  const zone = zoneFor(item.agreement, item.certainty) as "simple" | "complicated";
  const offStrategy = item.krRefs.length === 0;

  return (
    <li className="rounded-lg border border-ink-200 bg-surface-base p-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100 text-caption font-semibold text-strong">
          {position}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-body font-semibold text-strong">{item.storyTitle}</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ZONE_BADGE[zone]}`}>
              {ZONE_LABEL[zone]}
            </span>
            {offStrategy && (
              <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-ink-600">
                off-strategy
              </span>
            )}
            {drift && (
              <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-ink-600">
                source removed
              </span>
            )}
          </div>
          <KrLinker item={item} krOptions={krOptions} onLink={onLink} onUnlink={onUnlink} />
        </div>
      </div>
    </li>
  );
}

export default function PriorityList({ items, krOptions, markdown, onLink, onUnlink }: PriorityListProps) {
  const [copied, setCopied] = useState(false);

  const driftById = new Map(items.map((entry) => [entry.item.id, entry.drift]));
  const ranked = rankItems(items.map((entry) => entry.item));
  const probing = items.filter((entry) => entry.zone === "complex" && entry.item.disposition === "probe");

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the export block below still shows the text */
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-h5 text-strong">Priority list</h3>
        <button
          type="button"
          onClick={copyMarkdown}
          className="text-caption font-semibold text-accent-700 link-underline"
          disabled={ranked.length === 0 && probing.length === 0}
        >
          {copied ? "Copied ✓" : "Copy as Markdown"}
        </button>
      </div>

      {ranked.length === 0 ? (
        <p className="mt-3 text-caption text-faint">
          Nothing ranked yet. Plot stories into the Simple or Complicated zones to build the list.
        </p>
      ) : (
        <ol className="mt-3 grid gap-2">
          {ranked.map((item, i) => (
            <Row
              key={item.id}
              item={item}
              position={i + 1}
              krOptions={krOptions}
              onLink={onLink}
              onUnlink={onUnlink}
              drift={driftById.get(item.id) ?? false}
            />
          ))}
        </ol>
      )}

      {probing.length > 0 && (
        <div className="mt-5 border-t border-ink-200 pt-4">
          <h4 className="text-caption font-semibold text-muted">Probing — not committed</h4>
          <p className="mt-1 text-caption text-faint">
            These earn a roadmap slot only after the probe reports back.
          </p>
          <ul className="mt-2 grid gap-1.5">
            {probing.map((entry) => (
              <li key={entry.item.id} className="text-caption text-strong">
                <span className="mr-1" aria-hidden="true">
                  🔬
                </span>
                {entry.item.storyTitle}
                {entry.item.note && <span className="text-faint"> — {entry.item.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(ranked.length > 0 || probing.length > 0) && (
        <pre className="mt-4 overflow-x-auto rounded-md bg-ink-100 p-3 text-caption text-strong">{markdown}</pre>
      )}
    </div>
  );
}
