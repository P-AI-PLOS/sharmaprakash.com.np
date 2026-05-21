---
title: "The Agentic Developer's Field Guide"
date: "2026-04-07T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Everything published here about agentic coding, AI tooling, and developer workflows — in one place, with a recommended reading order."
cover: "/images/blog/ai/agentic-developer-field-guide.png"
thumb: "/images/blog/ai/agentic-developer-field-guide.png"
last_modified_at: "2026-04-07T10:00:00+05:45"
use_featured_image: true
---

"Agentic coding" is an overloaded phrase. It gets used to mean inline AI autocomplete, autonomous multi-step coding agents, AI-orchestrated CI pipelines, and everything in between.

This guide maps what I've written about it — four series covering different layers of the same problem — and gives you a recommended entry point based on where you're at.

---

## What agentic coding actually means

A copilot-style tool (GitHub Copilot, Cursor tab completion) makes inline suggestions. You approve them one at a time. The model sees one file. The feedback loop is fast.

An agent is different. It reads many files, runs commands, makes decisions, writes multiple files, opens pull requests. It operates over longer time horizons. It fails when it has ambiguous context. It succeeds when the workflow around it is structured.

The tools and techniques in these series are about that second category. The structure you build around the agent is most of the work — and most of the value.

---

## Four series. One reading order.

### 1. Configure Your AI Coding Environment ← start here

Before anything else works, you need the configuration layer in place. This series covers the `.claude/` folder structure, how to write `CLAUDE.md` files agents actually follow, hooks that automate your session setup, team permission sharing, and a cross-tool guide for Cursor, Copilot, Windsurf, and Windows users.

**Start with:** [The Two Configuration Layers Every AI Developer Needs](/ai/2026-04-08-two-configuration-layers-ai-developer/)

| Post | What it covers |
|------|----------------|
| [The Two Configuration Layers](/ai/2026-04-08-two-configuration-layers-ai-developer/) | `~/.claude/` vs `.claude/` — what belongs where |
| [Writing CLAUDE.md That Agents Follow](/ai/2026-04-09-writing-claude-md-agents-follow/) | Short + enforced beats long + aspirational |
| [Hooks That Pay for Themselves](/ai/2026-04-10-hooks-that-pay-for-themselves/) | Session-start, pre/post-tool automation |
| [Project Settings and Team Sharing](/ai/2026-04-11-project-settings-permissions-team-sharing/) | `settings.json`, gitignore strategy, onboarding |
| [Not on Claude? Cross-Tool Configuration](/ai/2026-04-12-cross-tool-configuration-guide/) | Cursor, Copilot, Windsurf, Windows/Linux notes |

---

### 2. Agent-Ready React

If your AI agent keeps making inconsistent choices in your codebase — writing different patterns for similar tasks, using deprecated components, ignoring your stated conventions — the problem usually isn't the agent. It's the codebase. This series covers how to diagnose and fix it.

**Start with:** [Why Your Legacy React Codebase Confuses AI Agents](/ai/2026-05-07-why-legacy-react-confuses-ai-agents/)

| Post | What it covers |
|------|----------------|
| [Why Legacy React Confuses AI Agents](/ai/2026-05-07-why-legacy-react-confuses-ai-agents/) | The five patterns that make agents inconsistent |
| [A 3-Week Plan to Agent-Ready React](/ai/2026-05-08-three-week-plan-agent-ready-react/) | Concrete execution: audit, lint gate, architectural collapse |
| [Rules Agents Actually Follow](/ai/2026-05-09-rules-agents-actually-follow/) | Enforcement over aspiration — pre-commit hooks and CI |
| [What to Put in design.md](/ai/2026-05-10-design-md-template/) | The decision document, not the style guide |
| [Writing Task-Specific Agent Prompts](/ai/2026-05-11-task-prompts-that-work/) | The highest-leverage agentic asset most teams skip |
| [Session-Start Hooks That Pay for Themselves](/ai/2026-05-12-session-start-hooks-that-pay-for-themselves/) | Zero ongoing cost, measurable improvement on every session |

---

### 3. The Parallel Developer

One developer, three features in flight simultaneously. No context switches, no stash dance, no "which migration was I on?" This series covers git worktrees for parallel workspaces, OpenSpec for spec-before-code, Beads for local task graphs, and the full agentic loop from GitHub Issue to merged PR.

**Start with:** [Why Agentic Coding? It's Not About the AI](/ai/2026-04-13-why-agentic-coding/)

| Post | What it covers |
|------|----------------|
| [Why Agentic Coding?](/ai/2026-04-13-why-agentic-coding/) | Copilot vs. agents, structure as the actual value |
| [Git Worktrees: Branches as Places](/ai/2026-04-14-git-worktrees-branches-as-places/) | One repo, three running apps, zero context switches |
| [OpenSpec: Contract Before Code](/ai/2026-04-15-openspec-contract-before-code/) | Explore → Propose → Apply. The human review gate. |
| [Beads: A Local-First Task Graph](/ai/2026-04-16-beads-local-first-task-graph/) | `bd ready`, one bead = one worktree, jq queries |
| [AI Agents That Work](/ai/2026-04-17-ai-agents-structured-workflow/) | The 10-step loop. Three worktrees. A day in the life. |

---

### 4. AI Tooling for Developers

The agent ecosystem beyond your coding IDE — MCP versus CLI tradeoffs, Jira and Notion integrations, automated release notes, and three tools worth knowing: Paperclip for multi-agent governance, OpenClaw for personal automation, and Hermes for model-agnostic self-improving agents.

**Start with:** [MCP vs CLI: The Token Cost You're Not Tracking](/ai/2026-04-18-mcp-vs-cli-token-cost/)

| Post | What it covers |
|------|----------------|
| [MCP vs CLI](/ai/2026-04-18-mcp-vs-cli-token-cost/) | Token overhead, decision framework, hybrid pattern |
| [Jira MCP Setup](/ai/2026-04-19-jira-mcp-server-setup/) | Step-by-step, sprint cache trick, when to skip MCP |
| [Notion MCP Setup](/ai/2026-04-20-notion-mcp-server-setup/) | Setup, quirks, session-start hook for caching |
| [Automating Release Notes](/ai/2026-04-21-automating-release-notes-ai-agents/) | git log → beads → agent → Notion/Jira, end to end |
| [Paperclip: Managing Agents Like a Team](/ai/2026-04-22-paperclip-managing-ai-agents-like-a-team/) | Org charts, budgets, audit logs for multiple agents |
| [OpenClaw: A Personal AI with System Access](/ai/2026-04-23-openclaw-personal-ai-with-system-access/) | Local, connects to chat apps, self-improving skills |
| [Hermes: Self-Improving Agents on Cheap Infrastructure](/ai/2026-04-24-hermes-self-improving-agents-cheap-infrastructure/) | Model-agnostic, MCP-compatible, $5 VPS |

---

### 5. Choosing Your AI Stack

The model you use today won't be the best model in 12 months. This series covers token vs. subscription pricing math, when each Claude tier earns its cost, DeepSeek as a legitimate cost alternative, GLM and CodeGeeX for open-weight and bilingual needs, local models when code can't leave your machine, and how to build workflows that survive model switches.

**Start with:** [Token vs Subscription: Which AI Pricing Model Is Right for You](/ai/2026-04-25-token-vs-subscription-ai-pricing/)

| Post | What it covers |
|------|----------------|
| [Token vs Subscription](/ai/2026-04-25-token-vs-subscription-ai-pricing/) | Break-even math, team dynamics, hybrid approach |
| [Claude Models for Coding](/ai/2026-04-26-claude-models-explained-coding/) | Opus/Sonnet/Haiku decision tree, prompt caching math |
| [DeepSeek for Developers](/ai/2026-04-27-deepseek-for-developers/) | 10x cheaper, strong at code, data residency notes |
| [GLM Models](/ai/2026-04-28-glm-models-open-source-alternative/) | Open weights, bilingual, CodeGeeX IDE extension |
| [Local Models](/ai/2026-04-29-local-models-when-you-run-the-weights/) | Qwen-Coder, hardware requirements, Ollama setup |
| [Model-Agnostic Workflows](/ai/2026-04-30-model-agnostic-workflows/) | What's portable vs. tool-specific, migration checklist |

---

## Where to start based on your situation

**"I want to start using AI for coding today"** → [Configure Your AI Coding Environment](/ai/2026-04-08-two-configuration-layers-ai-developer/) first, then come back here.

**"My AI agent keeps making inconsistent choices"** → [Why Legacy React Confuses AI Agents](/ai/2026-05-07-why-legacy-react-confuses-ai-agents/).

**"I want to run multiple features in parallel without context switching"** → [Why Agentic Coding?](/ai/2026-04-13-why-agentic-coding/).

**"I want to automate things beyond just coding"** → [MCP vs CLI](/ai/2026-04-18-mcp-vs-cli-token-cost/).

**"I don't know which model or pricing plan to use"** → [Token vs Subscription](/ai/2026-04-25-token-vs-subscription-ai-pricing/).

**"I'm not using Claude — I use Cursor / Copilot / something else"** → [Not on Claude? The Cross-Tool Configuration Guide](/ai/2026-04-12-cross-tool-configuration-guide/).

**"I'm on Windows"** → Same as above — Windows notes are in that post.
