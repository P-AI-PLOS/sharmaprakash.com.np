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
  "hooks-subagents-skills-workshop": {
    title: "Workshop · Hooks · Subagents · Skills",
    description:
      "A five-part hands-on workshop: clone a starter repo with a planted barrel-import bug, then build the hook that blocks it, the subagent that audits its siblings, and the skill that wires both into a single slash command. Ends with a 10-minute capstone worksheet.",
    cover: "/images/blog/hooks-subagents-skills-workshop/setup/cover.png",
  },
  "agent-ready-react": {
    title: "Agent-ready React",
    description:
      "An ongoing series on making legacy React codebases ready for AI coding agents — from CLAUDE.md and rules to hooks, subagents, and skills.",
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
  "uv-2026": {
    title: "uv: the 2026 Python toolchain",
    description:
      "A six-part series on uv — why it replaces pip, venv, pyenv, pipx, and pip-tools; how to start a new Python project in 2026; and a pragmatic migration path that keeps requirements.txt where it earns its keep.",
    cover: "/images/blog/series/uv-2026.png",
  },
  "python-monorepo-2026": {
    title: "Python Monorepos in 2026",
    description:
      "A five-part series on building Python monorepos with uv workspaces — package boundaries, Pydantic-to-TypeScript shared schemas, a Vite + React frontend co-living with FastAPI, and CI that scales.",
    cover: "/images/blog/series/python-monorepo-2026.png",
  },
  "ai-podcast-index": {
    title: "Building an AI Podcast Index",
    description:
      "An eight-part build-along: a locally-running tool that ingests a YouTube podcast channel, extracts guests and topics, lets you clip-search by intent, and generates questions for future episodes — using uv, FastAPI, Vite + React, and a provider-switchable LLM client.",
    cover: "/images/blog/series/ai-podcast-index.png",
  },
};

export const getSeriesMeta = (slug: string | undefined): SeriesMeta | null =>
  slug && slug in seriesRegistry ? seriesRegistry[slug] : null;
