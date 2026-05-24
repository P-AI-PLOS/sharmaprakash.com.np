---
draft: false
title: "Building Model-Agnostic Workflows"
date: "2026-04-30T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "The model you use today will not be the best model in 12 months. Write your workflow so that switching costs hours, not weeks."
cover: "/images/blog/ai/model-agnostic-workflows.png"
thumb: "/images/blog/ai/model-agnostic-workflows.png"
last_modified_at: "2026-04-30T10:00:00+05:45"
use_featured_image: true
series: ai-stack
seriesOrder: 6
---

I built out a complete workflow around Claude Code: layered `CLAUDE.md`, hooks for `SessionStart` and `PreToolUse`, rules files, slash commands for every repeated workflow, the whole thing. Then a project constraint forced me onto a different tool for two weeks. I found out exactly which parts of my workflow survived and which didn't.

The parts that survived were more than I expected. The parts that didn't were entirely predictable in hindsight — they were the parts I'd built in tool-specific syntax rather than as durable concepts.

---

## The question to ask about every part of your workflow

"Is this concept-specific or tool-specific?"

Concept-specific: the idea works regardless of which tool is executing it. Store context in layered files, write a spec before writing code, track task state in the repo, run tasks in isolated git branches. These survive any model or harness change.

Tool-specific: the implementation only works in one tool. Claude Code slash commands, `.claude/` folder structure, Anthropic-specific hook syntax, `CLAUDE.md` file naming. These require re-implementation when you switch.

The goal isn't to eliminate tool-specific things — you'll always have some. The goal is to minimise unnecessary coupling. When you reach for a tool-specific mechanism, ask whether a portable alternative would serve just as well.

---

## What's portable

**Layered context files.** The concept — a `CLAUDE.md` with project-wide context, `rules/*.md` with domain-specific rules — works in any tool that reads system prompts or context files. The file naming convention is tool-specific; the content and structure are not. You rename `CLAUDE.md` to `AGENTS.md` for OpenAI Codex or some other tools, copy the content as-is.

**Conventional Commits.** A git convention. Agnostic to every AI tool. Your commit message format doesn't care what model wrote the code.

**Git worktrees.** Pure git. The [Parallel Developer](/ai/2026-04-13-why-agentic-coding/) pattern of running multiple agents in isolated branches works identically regardless of which model you're using. The workflow is in your git config, not in your AI tool config.

**Spec files (OpenSpec).** Markdown in the repo. Any agent that can read files can read a spec. The spec format is plain English — no proprietary syntax.

**Beads state.** If you're using Beads for task tracking (JSONL in the repo), any agent can read the current state with a single file read. The state is in a standard format, not inside a tool's database.

**The "spec before code" habit.** Writing a spec first is a cognitive discipline, not a tool feature. It survives every model change.

---

## What's tool-specific

**File naming conventions.** Claude Code reads `CLAUDE.md` and `.claude/`. OpenAI Codex reads `AGENTS.md`. Hermes has its own conventions. The content of these files is portable; the names are not.

**Hook syntax.** Claude Code hooks (`SessionStart`, `PreToolUse`, `PostToolUse`) are Anthropic-specific. The *concept* of a hook that fires before a tool call is universal — but you'll rewrite the implementation in each tool's syntax.

**Slash commands.** `/opsx:explore`, `/opsx:plan` — these are Claude Code skills. They don't transfer. You rebuild the equivalent capability in each new tool.

**`.claude/` folder structure.** Tool-specific. Each harness has its own convention for where it looks for configuration.

---

## Migration checklist

When you switch tools, here's what each asset requires:

| Asset | Portability | Migration effort |
|---|---|---|
| CLAUDE.md / AGENTS.md content | High | Rename file, review for Anthropic-specific phrasing |
| rules/*.md content | High | Copy as-is, minor reformatting if needed |
| Beads state (JSONL) | Full | Zero — it's plain files in the repo |
| Git worktrees | Full | Zero — pure git |
| OpenSpec files | Full | Zero — pure markdown |
| Conventional Commits config | Full | Zero — in .git config or repo root |
| Hooks | Medium | Rewrite in new tool's syntax, same logic |
| Slash commands / skills | Low | Rebuild — tool-specific implementation |
| .claude/ folder structure | None | Start fresh in new tool's convention |

The pattern: the higher up the abstraction stack (concepts, content, conventions), the more portable. The lower down (folder structure, command syntax, API-specific features), the less portable.

---

## Hermes as the reference implementation

[Hermes](/ai/2026-04-24-hermes-self-improving-agents-cheap-infrastructure/) is designed around this problem from the start. Your agent configuration, skills, and memory are model-agnostic by design. Swapping the underlying model — Claude, GPT-4, a local Qwen model, whatever — is a configuration change. The agent's capabilities, the skill definitions, the memory structure all stay the same.

This is the correct architectural direction for anyone building serious agentic workflows. The model is a backend, not a framework. Your workflow logic shouldn't be entangled with which backend you're using.

---

## OpenClaw's approach

[OpenClaw](/ai/2026-04-23-openclaw-personal-ai-with-system-access/) takes the same position. The skills and memory are stored in a model-agnostic format; the LLM provider is a pluggable configuration option. If a better model ships next month, you update one line in your config. The skills you've built, the memory your agent has accumulated, the tools it has access to — unchanged.

The contrast with a purely Claude Code-centric workflow is instructive. A workflow built entirely in Claude Code skills and `.claude/` conventions requires rebuilding from scratch on a new tool. A workflow built in OpenClaw or Hermes with a Claude backend requires changing one config value.

---

## Design principles for portable workflows

These are the habits that pay off when the model landscape shifts:

**1. Keep context in markdown files, not tool-specific formats.**
A `rules/naming-conventions.md` file that any agent can read is more durable than a Claude Code skill that encodes the same rules in tool-specific syntax.

**2. Store task state in standard formats in the repo.**
JSON, JSONL, plain text. Anything a shell script could read. If your task state lives inside a tool's database or memory system, it's locked to that tool.

**3. Write rules as "what to do," not "how Claude should behave."**
Instructions like "use Conventional Commit format" work for any instruction-following model. Instructions like "when you use the Bash tool, check with me first" are Claude-specific phrasing that may not transfer. Prefer general imperative instructions.

**4. Test your workflow with a second model periodically.**
Swap your primary model for a week — a different Claude tier, a local model, DeepSeek via API. You'll find the brittle spots: the instructions that only made sense because Claude was interpreting them charitably, the context files that assumed Claude-specific behaviour, the hooks that relied on Claude Code-specific events.

Finding those spots during a deliberate test is much better than finding them during an emergency migration.

**5. Keep tool-specific implementations thin.**
Your Claude Code skills should call out to general-purpose scripts where possible, not embed complex logic. The slash command invokes a script; the script doesn't care what invoked it. When you switch tools, you rebuild the thin invocation layer, not the logic.

---

## The model landscape will keep changing

GPT-4 was the obvious default for most of 2023. By early 2024, Claude had narrowed the gap significantly. By late 2024, Sonnet was the coding default for a large fraction of developers. DeepSeek benchmarked competitively in early 2025. Open-weight models closed the quality gap further through 2025.

This will keep happening. The model that's clearly best for your use case today will be challenged or replaced within 12-18 months. The teams that switch quickly when that happens are the ones whose workflows aren't deeply coupled to any single model's quirks.

Build the workflow. Make it model-agnostic. Then you can treat model selection as an ongoing optimisation — not a one-time lock-in decision.

---

## Where to go from here

If you haven't set up your AI coding environment yet — the layered configuration, the context files, the hooks — start with [Configure Your AI Coding Environment](/ai/2026-04-08-two-configuration-layers-ai-developer/). That's the prerequisite for everything in this series.

For the workflow that ties these models and tools together into a parallel development practice — running multiple tasks simultaneously across agents — see [The Parallel Developer](/ai/2026-04-13-why-agentic-coding/).
