/**
 * Curated item set for "Accrual Engine vs. UI for Leave Balance".
 * Every item's text, zone, and reasoning is drawn from that post's
 * "Running it on leave balance" section — nothing invented.
 *
 * This post names no Simple and no Chaotic example, so this set has none
 * (design D4: item sets are not normalized to one item per zone).
 */
import type { MatrixItem } from "../AgreementCertaintyMatrix";

export const ACCRUAL_ENGINE_ITEMS: MatrixItem[] = [
  {
    id: "accrual-engine-work",
    text: "Accrual rates, carryover caps, proration math, and how a policy exception should compute.",
    zone: "complicated",
    why: "Technically intricate, sometimes genuinely hard to implement correctly, but there's a right answer: a compliance reference or someone who's read the actual policy document can adjudicate a disagreement in minutes. One group placed the proration bug in Complex on first pass because the implementation had been messy last time — the debate reclassified it once someone pointed out the mess was an execution problem, not a disagreement about what correct behavior should be.",
  },
  {
    id: "accrual-approval-screen",
    text: "Redesign the manager approval screen.",
    zone: "complex",
    why: "It landed Complex almost every time. Some managers wanted the requester's remaining balance and recent history visible inline; others found that cluttered and wanted a clean approve/deny. No textbook settled the disagreement, because it wasn't a factual question — so it got routed to a proper probe, a round of contextual interviews before any screen got built.",
  },
  {
    id: "accrual-balance-summary",
    text: "Redesign the employee-facing balance summary.",
    contested: true,
    why: "This one split the room three ways. One group placed it Simple (\"just show the number clearly\"), another placed it Complicated (\"there's a known best pattern for balance displays\"), and a third placed it Complex once someone raised that employees in different countries expect different units — days versus hours versus a rolling entitlement — and nobody in the room agreed on which to default to. Where placements diverge across groups, that divergence is itself information.",
  },
];
