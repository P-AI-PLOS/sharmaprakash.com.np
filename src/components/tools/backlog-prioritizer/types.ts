/** View-model shared by the board, queue, and priority list. */
import type { BacklogItem, MatrixZone } from "~/utils/backlog-store";

export interface EnrichedItem {
  item: BacklogItem;
  zone: MatrixZone;
  /** No key results linked — surfaced, not hidden (D4). */
  offStrategy: boolean;
  /** Source story no longer present in the slicer (contract D5). */
  drift: boolean;
}
