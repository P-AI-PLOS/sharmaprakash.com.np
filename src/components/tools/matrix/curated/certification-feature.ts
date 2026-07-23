/**
 * Curated item set for "Should Course Guru Build Certificates?".
 * Every item's text, zone, and reasoning is drawn from that post's
 * "Running certificates through the matrix" section — nothing invented.
 *
 * This post names no Complicated and no Chaotic example, so this set has none
 * (design D4: item sets are not normalized to one item per zone).
 */
import type { MatrixItem } from "../AgreementCertaintyMatrix";

export const CERTIFICATION_FEATURE_ITEMS: MatrixItem[] = [
  {
    id: "cert-dashboard-and-export",
    text: "A UI tweak to the instructor dashboard, and a well-precedented CSV export for enrollment data.",
    zone: "simple",
    why: "Two other items on that same wall landed cleanly here and shipped that sprint without ceremony — which is the other half of what the matrix buys you: it's just as useful for confirming what doesn't need a workshop as for catching what does.",
  },
  {
    id: "cert-certification-feature",
    text: "Build the certification feature — \"every LMS has certificates, we're behind, let's just build it.\"",
    zone: "complex",
    why: "Half the room put it near Simple; the other half wouldn't move it off the Complex border. The debate turned up three fault lines under one feature name: whose brand the certificate carries (the merchant's or course guru's), whether merchants want verification overhead at all versus a decorative PDF, and where it sits in pricing and access — where everyone had a confident, mutually exclusive answer. Copying the nearest competitor would have resolved branding by accident, ignored verification entirely, and hard-coded a pricing answer nobody had chosen. The team routed it to a probe instead: a merchant survey plus a cheap prototype test.",
  },
];
