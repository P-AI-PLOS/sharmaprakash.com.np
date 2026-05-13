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
    iconName: "ri:rocket-2-line",
    title: "Shipping at Varicon",
    body: "Leading the Onboarding squad as Engineering Manager + Product Owner. Roadmap, rituals, recruiting.",
    updated: "May 2026",
  },
  {
    iconName: "ri:edit-2-line",
    title: "Writing AI essays",
    body: "Pumping out the agent-ready React series — six parts and counting. Plain language, opinionated, shippable patterns.",
    updated: "May 2026",
    href: "/category/ai/1/",
  },
  {
    iconName: "ri:terminal-box-line",
    title: "Exploring agent UX",
    body: "Claude Code hooks, design.md as the agent's memory, task-prompts as muscle memory. Building the toolkit I wish I had.",
    updated: "May 2026",
  },
];
