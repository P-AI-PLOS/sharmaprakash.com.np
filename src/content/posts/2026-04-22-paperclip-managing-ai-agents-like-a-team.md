---
draft: true
title: "Paperclip: Managing AI Agents Like a Team"
date: "2026-04-22T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "One agent helping you code is a power tool. Multiple agents running autonomously is a team. Paperclip is the org chart, the budget, and the audit log for that team."
cover: "/images/blog/ai/paperclip-managing-ai-agents-like-a-team.png"
thumb: "/images/blog/ai/paperclip-managing-ai-agents-like-a-team.png"
last_modified_at: "2026-05-31"
use_featured_image: true
series: ai-tooling
seriesOrder: 5
---

Here's the point where agentic tooling quietly stops being a productivity hack and starts being an operational problem: you've got Claude Code handling the coding sessions, an OpenClaw instance processing your email and calendar, a Hermes agent running background research on a schedule. Each one is burning tokens. Each one is making decisions. You have no consolidated view of what any of them spent, no way to pause one without killing the process, no audit trail if something goes wrong.

One agent is a power tool. Three agents running autonomously is an organization — and organizations need management infrastructure.

[Paperclip](https://paperclip.ing/) is that infrastructure. Open-source (MIT), self-hosted, no Paperclip cloud account required.

---

## The Mental Model: Agents as Employees

Paperclip's framing is deliberate: it treats agents as employees. Not scripts, not API calls — employees. They have roles. They report to someone. They have a budget. Their actions are logged. You can approve, pause, or override them.

This framing sounds whimsical until you're debugging why your inbox agent deleted three emails it shouldn't have. At that point "audit log" and "override" go from metaphors to operational necessities.

---

## Core Concepts

### Org Chart

You define agents with roles — "frontend engineer", "inbox manager", "research assistant" — and wire them into a reporting structure. A supervisor agent (which can itself be an AI agent) can coordinate work across multiple subordinate agents, delegate tasks, and aggregate results.

This matters when you have agents that need to hand off work to each other. The org chart is how you define those relationships explicitly rather than hoping the agents figure it out through prompt engineering.

### Budget Enforcement

Each agent gets a monthly token budget. When the budget is exhausted, the agent stops — it doesn't run up an overrun, it stops. You set the ceiling; Paperclip enforces it.

This solves a real problem with autonomous agents: a misconfigured agent or an unexpected input can trigger a runaway loop that burns through your API allocation before you notice. Budget enforcement turns "I'll check on it tomorrow" from a gamble into a safe assumption.

The budget resets at the start of each billing period. You can also manually adjust mid-month — give an agent more budget for a crunch week, pull it back when the crunch is over.

### Audit Log

Every decision, every tool call, every piece of output from every agent is logged. The log is structured and queryable — you can ask "what did the research agent do between 2pm and 5pm yesterday?" and get a precise answer.

This is valuable for debugging, for compliance (if you're in a context where AI agent decisions need to be auditable), and for understanding why an agent made a choice that surprised you. Agents can surprise you. Having a replay of their reasoning is the only reliable way to diagnose it.

### Board Control

Board-level governance: you (or a designated supervisor) can approve new agent configurations before they go live, pause a running agent without killing the underlying process, override an agent's pending decision, and set strategic goals that cascade down to subordinate agents.

In practice, "board control" for a solo developer looks like: you set the goals for the week, the agents execute, and you can pause any of them from a dashboard without touching the underlying process.

### Heartbeat Scheduling

Recurring tasks — daily inbox summary, weekly sprint retrospective, hourly data sync — are configured as heartbeats. Paperclip triggers them on schedule. The agent doesn't need to be running continuously; Paperclip wakes it up, it executes the task, it goes back to sleep.

This is more reliable than a cron job calling a script, because Paperclip applies budget checks, logs the run, and handles failures with retry logic — not just firing and forgetting.

---

## What It Connects To

Paperclip isn't tied to any single AI provider or agent framework. It works with:

- **Claude** (via Anthropic API — this is the obvious one for most readers)
- **[OpenClaw](/ai/2026-04-23-openclaw-personal-ai-with-system-access/)** (covered in Post 6)
- **[Hermes Agent](/ai/2026-04-24-hermes-self-improving-agents-cheap-infrastructure/)** (covered in Post 7)
- **Cursor** (the editor, via its agent mode)
- **HTTP webhooks** — any agent that can make or receive HTTP calls
- **Bash scripts** — a cron-triggered script becomes a "Paperclip employee" with a budget and audit log

This means you can mix agent types under one management layer. Claude Code handles coding sessions; a Hermes instance handles scheduled background tasks; a bash script handles data sync. Paperclip sees all of them, budgets all of them, logs all of them.

---

## When You Need It

**You're running more than 2–3 agents.** Below that threshold, the overhead of Paperclip's setup isn't worth it. Above that threshold, you'll want consolidated visibility.

**You have autonomous agents.** A Claude Code session where you're in the loop the whole time is low-risk. An agent that runs unsupervised on a schedule, with system access, making decisions while you sleep — that's where budget enforcement and audit logs stop being nice-to-have.

**You need accountability.** For compliance. For cost attribution in a team context. For your own peace of mind when you're handing significant access to an autonomous process. Paperclip gives you the paper trail.

**You're building a multi-agent workflow.** If agents need to hand off work to each other, coordinate on shared goals, or report upward to a supervisory agent, you need the org chart primitive.

---

## When You Don't Need It

You're a solo developer running one Claude Code session at a time, in the loop for every decision. Paperclip is org-level infrastructure. Don't reach for it until you're running the kind of operation that would benefit from org-level management.

Start with good `AGENTS.md` rules and session hooks. Graduate to Paperclip when you have multiple autonomous agents and start losing track of what they're doing.

---

## Self-Hosted Setup

Paperclip runs as a Docker Compose stack: a web process, a worker process, and a PostgreSQL database. You run it on your own infrastructure. Your agent API keys never leave your machines — Paperclip is a coordinator, not a proxy.

```bash
git clone https://github.com/paperclip-ai/paperclip
cd paperclip
cp .env.example .env
# Edit .env: set your database credentials and session secret
docker compose up -d
```

First boot creates the database schema. You access the dashboard at `http://localhost:3000`, create your organization, and start adding agents from the UI.

No Paperclip account. No cloud dependency. Your data, your infrastructure.

---

## The Bigger Picture

Individual agents — OpenClaw for your personal communication layer, Hermes for background server tasks, Claude Code for interactive coding — each solve a specific problem well. Paperclip is what connects them into a coherent operation rather than a collection of independent processes you're manually monitoring.

It's the difference between having three capable people on a team with no manager and having three capable people with clear roles, a budget, and someone watching the work. The agents don't need the structure. You do.

---

## Coming next

Post 6 covers OpenClaw — the local, open-source personal AI that connects to your chat apps and has real system access. It's a natural candidate for the "inbox manager" role in a Paperclip org.
