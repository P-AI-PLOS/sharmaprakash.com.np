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
  cover: string;
}

export const seriesRegistry: Record<string, SeriesMeta> = {
  "agent-ready-react": {
    title: "Agent-ready React",
    description:
      "A six-part series on making legacy React codebases ready for AI coding agents.",
    cover: "/images/blog/series/agent-ready-react.png",
  },
  "ai-coding-setup": {
    title: "Configure Your AI Coding Environment",
    description:
      "A five-part guide to setting up your .claude folder, CLAUDE.md, hooks, permissions, and cross-tool configuration — the prerequisite for every other agentic workflow.",
    cover: "/images/blog/series/ai-coding-setup.png",
  },
  "parallel-developer": {
    title: "The Parallel Developer",
    description:
      "A five-part series on running multiple features in flight simultaneously using git worktrees, OpenSpec, Beads, and AI agents.",
    cover: "/images/blog/series/parallel-developer.png",
  },
  "ai-tooling": {
    title: "AI Tooling for Developers",
    description:
      "A seven-part guide to the agent ecosystem beyond your coding IDE — MCP vs CLI tradeoffs, Jira/Notion integrations, release note automation, Paperclip, OpenClaw, and Hermes.",
    cover: "/images/blog/series/ai-tooling.png",
  },
  "ai-stack": {
    title: "Choosing Your AI Stack",
    description:
      "A six-part series on picking models, pricing models, and building workflows that aren't locked to any single provider.",
    cover: "/images/blog/series/ai-stack.png",
  },
};

export const getSeriesMeta = (slug: string | undefined): SeriesMeta | null =>
  slug && slug in seriesRegistry ? seriesRegistry[slug] : null;
