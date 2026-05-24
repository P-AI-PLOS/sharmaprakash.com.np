/**
 * "Now" items — what I'm focused on this season.
 * Edit this list to update the homepage NowFocus section. No code change
 * needed.
 */
export interface NowItem {
  iconName: string;
  title: string;
  body: string;
  updated: string;   // free-form, e.g. "May 2026" or "This week"
  href?: string;     // optional link target
}

export const nowItems: NowItem[] = [
  {
    iconName: "ri:edit-2-line",
    title: "Writing AI essays",
    body: "Agent-ready React series — thirteen parts in. Plain language, opinionated, shippable patterns.",
    updated: "May 2026",
    href: "/category/ai/1/",
  },
  {
    iconName: "ri:terminal-box-line",
    title: "Parallel agent coding",
    body: "OpenSpec for spec-before-code, Beads as the local task graph, git worktrees for isolation. The toolkit I wish I had.",
    updated: "May 2026",
  },
  {
    iconName: "ri:git-pull-request-line",
    title: "Hermes for release notes",
    body: "Wiring a Hermes agent to draft release notes from commits and PRs. Cron-scheduled, model-agnostic, ~$5 of infra.",
    updated: "May 2026",
  },
];
