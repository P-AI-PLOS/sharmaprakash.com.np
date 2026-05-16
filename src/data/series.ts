/**
 * Registry of multi-part essay series. The `series` slug in a post's
 * frontmatter must match a key here for the series chrome (SeriesNavStrip,
 * SeriesContinueBlock) to render.
 *
 * To start a new series:
 *   1. Add an entry here.
 *   2. Set `series: <slug>` + `seriesOrder: N` on each post.
 */
export interface SeriesMeta {
  title: string;
  description: string;
}

export const seriesRegistry: Record<string, SeriesMeta> = {
  "agent-ready-react": {
    title: "Agent-ready React",
    description:
      "A six-part series on making legacy React codebases ready for AI coding agents.",
  },
  "ai-coding-setup": {
    title: "Configure Your AI Coding Environment",
    description:
      "A five-part guide to setting up your .claude folder, CLAUDE.md, hooks, permissions, and cross-tool configuration — the prerequisite for every other agentic workflow.",
  },
  "parallel-developer": {
    title: "The Parallel Developer",
    description:
      "A five-part series on running multiple features in flight simultaneously using git worktrees, OpenSpec, Beads, and AI agents.",
  },
  "ai-tooling": {
    title: "AI Tooling for Developers",
    description:
      "A seven-part guide to the agent ecosystem beyond your coding IDE — MCP vs CLI tradeoffs, Jira/Notion integrations, release note automation, Paperclip, OpenClaw, and Hermes.",
  },
  "ai-stack": {
    title: "Choosing Your AI Stack",
    description:
      "A six-part series on picking models, pricing models, and building workflows that aren't locked to any single provider.",
  },
};

export const getSeriesMeta = (slug: string | undefined): SeriesMeta | null =>
  slug && slug in seriesRegistry ? seriesRegistry[slug] : null;
