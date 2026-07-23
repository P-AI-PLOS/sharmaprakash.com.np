/**
 * Backlog Prioritizer store — stage 04 of the Donut CRM pipeline.
 *
 * Plots Vertical Slicer stories (`StoryRef`) on the Agreement/Certainty 2x2 for
 * one (product, quarter), derives the Stacey zone from placement, links plots to
 * OKR key results (`OkrKeyResultRef`), and emits a ranked per-quarter priority
 * list. Complex/Chaotic items never rank until an explicit disposition is
 * recorded — that decision queue is the tool's headline behavior.
 *
 * Contract of record: `pipeline-store.ts` (D1 record shape, D2 zone thresholds,
 * D4 ordering, D5 snapshot/drift rule). localStorage only — nothing leaves the
 * browser.
 */
import {
  compareQuarters,
  createToolStore,
  quarterKey,
  type OkrKeyResultRef,
  type QuarterRef,
  type StoryRef,
  type ToolRecordBase,
} from "./pipeline-store";

// ------------------------------------------------------------------ types (D1)

export type MatrixZone = "simple" | "complicated" | "complex" | "chaotic";
export type Disposition = "probe" | "kill" | "defer";

export interface BacklogItem {
  /** `uid("item")` — tool-internal, never a cross-tool join key. */
  id: string;
  /** Contract join into Vertical Slicer output. */
  story: StoryRef;
  /** Snapshot at pick time (contract D5) — always renderable. */
  storyTitle: string;
  /** 0–100 plot position on the agreement axis. */
  agreement: number;
  /** 0–100 plot position on the certainty axis. */
  certainty: number;
  /** Links into OKR Organizer key results. */
  krRefs: OkrKeyResultRef[];
  /** keyResultId -> display text at link time (D5). */
  krSnapshots: Record<string, string>;
  /** Only meaningful for complex/chaotic items. */
  disposition?: Disposition;
  /** Optional rationale, especially for kill/probe calls. */
  note?: string;
}

export interface BacklogRecord extends ToolRecordBase {
  quarter: QuarterRef;
  items: BacklogItem[];
}

export const backlogStore = createToolStore<BacklogRecord>({
  storageKey: "pm-backlog-v1",
  idPrefix: "bklg",
});

// ------------------------------------------------------------------ labels

export const ZONE_LABEL: Record<MatrixZone, string> = {
  simple: "Simple",
  complicated: "Complicated",
  complex: "Complex",
  chaotic: "Chaotic",
};

// --------------------------------------------------- zone derivation (D2, pure)

/**
 * Derive the Stacey zone from continuous 0–100 placement. The extreme low/low
 * corner is Chaotic (a fire, not a backlog item) and MUST be checked before the
 * Complex quadrant, because the post treats Chaotic as the far corner of Complex
 * rather than a full quadrant.
 */
export function zoneFor(agreement: number, certainty: number): MatrixZone {
  if (agreement <= 15 && certainty <= 15) return "chaotic";
  if (agreement < 50 && certainty < 50) return "complex";
  if (agreement >= 50 && certainty >= 50) return "simple";
  return "complicated";
}

/** Simple/Complicated rank and appear in the priority list; Complex/Chaotic do not. */
export const isRankable = (item: BacklogItem): boolean => {
  const zone = zoneFor(item.agreement, item.certainty);
  return zone === "simple" || zone === "complicated";
};

// --------------------------------------------------------- ordering (D4, pure)

const ZONE_ORDER: Record<"simple" | "complicated", number> = { simple: 0, complicated: 1 };

/**
 * The ranked priority list (D4): Simple before Complicated, then KR-link count
 * desc, then `agreement + certainty` desc, with creation order as a stable
 * tiebreak. Complex/Chaotic items are never returned — they stay in the decision
 * queue until disposed.
 */
export function rankItems(items: BacklogItem[]): BacklogItem[] {
  return items
    .map((item, index) => ({ item, index, zone: zoneFor(item.agreement, item.certainty) }))
    .filter((entry): entry is { item: BacklogItem; index: number; zone: "simple" | "complicated" } =>
      entry.zone === "simple" || entry.zone === "complicated",
    )
    .sort((a, b) => {
      if (a.zone !== b.zone) return ZONE_ORDER[a.zone] - ZONE_ORDER[b.zone];
      if (a.item.krRefs.length !== b.item.krRefs.length) {
        return b.item.krRefs.length - a.item.krRefs.length;
      }
      const sumA = a.item.agreement + a.item.certainty;
      const sumB = b.item.agreement + b.item.certainty;
      if (sumA !== sumB) return sumB - sumA;
      return a.index - b.index;
    })
    .map((entry) => entry.item);
}

// ------------------------------------------------------ board resolution (D1)

/**
 * Find-or-create the board for one (product, quarter) and mark it active. Mirrors
 * ost-store's `resolveActiveTree`: prior boards for other quarters survive
 * untouched, and a quarter switch simply resolves a different record.
 */
export function resolveBoard(productId: string, quarter: QuarterRef): BacklogRecord {
  const existing = backlogStore
    .listForProduct(productId)
    .find((record) => quarterKey(record.quarter) === quarterKey(quarter));

  const board =
    existing ?? backlogStore.create({ productId, quarter, items: [] });
  backlogStore.setActiveId(productId, board.id);
  return board;
}

/** All boards for a product, chronologically by quarter (used by a quarter switcher). */
export function listBoards(productId: string): BacklogRecord[] {
  return backlogStore
    .listForProduct(productId)
    .sort((a, b) => compareQuarters(a.quarter, b.quarter));
}

/** Persist a board's items array (the only mutable field after creation). */
export function saveItems(boardId: string, items: BacklogItem[]): void {
  backlogStore.update(boardId, { items });
}

// --------------------------------------------------------- markdown export (D6)

const offStrategyMark = (item: BacklogItem): string =>
  item.krRefs.length === 0 ? " · ⚠️ off-strategy" : "";

/**
 * Markdown export: quarter header, ranked list with zone + off-strategy markers,
 * then Probing / Deferred / Killed sections with notes. Same affordance pattern
 * as OST's `toMarkdown`.
 */
export function boardToMarkdown(record: BacklogRecord): string {
  const lines: string[] = [`# Backlog priority — ${quarterKey(record.quarter)}`, ""];

  const ranked = rankItems(record.items);
  lines.push("## Priority");
  if (ranked.length === 0) {
    lines.push("", "_Nothing ranked yet — plot stories into Simple or Complicated._");
  } else {
    ranked.forEach((item, i) => {
      const zone = zoneFor(item.agreement, item.certainty);
      lines.push(`${i + 1}. ${item.storyTitle} — ${ZONE_LABEL[zone]}${offStrategyMark(item)}`);
    });
  }

  const withNote = (item: BacklogItem): string =>
    `- ${item.storyTitle}${item.note ? ` — ${item.note}` : ""}`;

  const section = (heading: string, disposition: Disposition) => {
    const matched = record.items.filter(
      (item) => item.disposition === disposition && !isRankable(item),
    );
    if (matched.length === 0) return;
    lines.push("", `## ${heading}`, "", ...matched.map(withNote));
  };

  section("Probing — not committed", "probe");
  section("Deferred", "defer");
  section("Killed", "kill");

  const pending = record.items.filter((item) => !isRankable(item) && !item.disposition);
  if (pending.length > 0) {
    lines.push(
      "",
      "## Needs a conversation (undisposed)",
      "",
      ...pending.map((item) => `- ${item.storyTitle} — ${ZONE_LABEL[zoneFor(item.agreement, item.certainty)]}`),
    );
  }

  return lines.join("\n");
}
