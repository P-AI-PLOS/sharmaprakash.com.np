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
  greenfield: {
    title: "Greenfield",
    description:
      "Engineering, AI, and the businesses we build from scratch. Solo-narrated essay episodes on the rules, layers, and judgment calls behind working with coding agents in real codebases.",
    cover: "/images/blog/series/greenfield.png",
  },
  "clipdex": {
    title: "Building an AI Podcast Index",
    description:
      "An eight-part build-along: a locally-running tool that ingests a YouTube podcast channel, extracts guests and topics, lets you clip-search by intent, and generates questions for future episodes — using uv, FastAPI, Vite + React, and a provider-switchable LLM client.",
    cover: "/images/blog/series/clipdex.png",
  },
  "agile-first-principles": {
    title: "Agile from First Principles",
    description:
      "A nine-part series on agile as reasoning rather than ritual — rereading the manifesto's four values and twelve principles as engineering advice, running fully agile without Scrum or Kanban, cleaning up a rotten backlog, documented product stories (the FBI's Sentinel, the Spotify model, Cyberpunk 2077, Healthcare.gov) that show the principles doing actual work, a full autopsy of the daily standup, and what agile's constraints become when AI agents make implementation cheap.",
    cover: "/images/blog/series/agile-first-principles.png",
  },
  "innovation-from-within": {
    title: "Innovation From Within",
    description:
      "A ten-part series on how innovation actually happens inside big companies — why good management rationally kills new ideas (the Innovator's Dilemma), where new bets should live (Three Horizons, the ambidextrous organization), labs that compound, real intrapreneurship (Kickbox, 15% time), innovation accounting, and then the outside game: spin-outs and sister companies, corporate venture capital, backing the right startups in a power-law world, pricing new ventures, and managing runway.",
    cover: "/images/blog/series/innovation-from-within.png",
  },
  "innovation-vto": {
    title: "The Innovation V/TO",
    description:
      "An eight-part series running Traction's full Vision/Traction Organizer as an innovation strategy stack, ordered by V/TO section — core values as the permission structure, core focus as the hedgehog, the ten-year target as a long bet held with institutional patience, marketing strategy as beachheads, the three-year picture as a steerable portfolio, the one-year plan as metered money, rocks as ninety-day experiment contracts, and the issues list as the machine that surfaces bad news. Referenced stories throughout: IBM's EBOs, Tesla's master plan, AWS, ASML's EUV, Apple's 1997 product cull, LEGO's near-death, the Challenger, and the Concorde fallacy.",
    cover: "/images/blog/series/innovation-vto.png",
  },
  "product-stories": {
    title: "Product Stories",
    description:
      "A two-part pair on discovery done right and wrong — Segment and Superhuman's evidence-driven pivots, set against Quibi, Juicero, and Humane's false validation, closing with Klarna and Duolingo's AI-first reversals — told from the record rather than the legend.",
    cover: "/images/blog/series/product-stories.png",
  },
  "leadership-frameworks": {
    title: "The Strategy Cascade",
    description:
      "A seven-part series on the product and engineering leadership frameworks that actually earn their keep — organized by the layer of work each one serves, from strategy formation down to org design, with when-to-use guidance and real failure modes for each, closing with the case for principle-first thinking over framework collecting.",
    cover: "/images/blog/series/leadership-frameworks.png",
  },
  "pm-context-repo": {
    title: "The Product Context Repo",
    description:
      "A six-part build-along: a git-based knowledge repo for product work, the structure that lets both agents and humans navigate it, a signal pipeline that turns support tickets, call transcripts, and CRM notes into structured evidence, MCP connections to your tracker, docs, and chat, commands that draft user stories and PRDs from the repo, and the editorial discipline that keeps AI slop out of your backlog.",
    cover: "/images/blog/series/pm-context-repo.png",
  },
  "continuous-discovery": {
    title: "Continuous Discovery, Hands-On",
    description:
      "A six-module hands-on course on opportunity solution trees and continuous discovery, run against one product end to end — Donut CRM, a relationship-first CRM for founders. Defining an outcome, mining interviews and JTBD for opportunities, recruiting and running discovery sessions (including the no-show playbook), ideating solutions alone and with a group using Liberating Structures, assumption mapping and experiments that test the riskiest thing first, and making discovery a weekly habit that coexists with Shape Up, OKRs, and the rest of your stack. Interactive exercises throughout — you leave with your own tree.",
    cover: "/images/blog/series/continuous-discovery.png",
  },
  "continuous-discovery": {
    title: "Continuous Discovery, Hands-On",
    description:
      "A six-module hands-on course on opportunity solution trees and continuous discovery, run against one product end to end — Donut CRM, a relationship-first CRM for founders. Defining an outcome, mining interviews and JTBD for opportunities, recruiting and running discovery sessions (including the no-show playbook), ideating solutions alone and with a group using Liberating Structures, assumption mapping and experiments that test the riskiest thing first, and making discovery a weekly habit that coexists with Shape Up, OKRs, and the rest of your stack. Interactive exercises throughout — you leave with your own tree.",
    cover: "/images/blog/series/continuous-discovery.png",
  },
  "operating-rhythm": {
    title: "The Product Operating Rhythm",
    description:
      "A five-part series on the work between strategy and shipping — a customer-request intake you can defend, the planning stack from undated vision through 5-year, 3-year, yearly, and quarterly plans without repeating yourself, the quarterly planning ritual as a runbook, stakeholder management as a system a product owner runs, and the recovery playbook for when sales sells a feature that was never on the roadmap.",
    cover: "/images/blog/series/operating-rhythm.png",
  },
};

export const getSeriesMeta = (slug: string | undefined): SeriesMeta | null =>
  slug && slug in seriesRegistry ? seriesRegistry[slug] : null;
