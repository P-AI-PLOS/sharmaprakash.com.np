---
title: "The Quiet Platform Shift: Why Orchestration Layers Like Multica and Paperclip Matter More Than the Next Model"
date: "2026-05-13T12:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Every conversation about AI in software has quietly moved one altitude up. The interesting question is no longer which model — it's what runs above them. A survey of agent orchestration platforms, from Multica and Paperclip to CrewAI, LangGraph, MetaGPT and ChatDev, and a light forecast of where this is heading."
cover: "/images/blog/ai/future-of-ai-orchestration.png"
thumb: "/images/blog/ai/future-of-ai-orchestration.png"
last_modified_at: "2026-05-13T12:00:00+05:45"
use_featured_image: true
---

A year ago, the most interesting question in AI tooling was "which model is best for this." Six months ago, it had become "which CLI." Today, it's quietly moved one altitude up again: the question that decides whether a team gets real leverage out of AI is **what runs above the agents** — the layer that turns a single coding session with Claude or GPT into a coordinated, resumable, governable piece of work.

This is the layer almost nobody is naming clearly. It's not the model. It's not the agent CLI. It's the orchestration platform — and a small handful of products in this category are starting to look like the first plausible draft of the *operating system* for agentic work.

I want to walk through the landscape, name the products that matter today, and make a modest argument about where this is going. The TL;DR up front: **agent orchestration is the next platform shift, but it's going to feel slow.** We're not at the Salesforce moment. We're at the Trello moment.

## The altitudes of AI tooling

It helps to draw the stack.

- **Layer 0 — Models.** Claude Opus 4.7, GPT-5, Gemini 2.5, the open weights from Z.AI, DeepSeek, Qwen, Kimi. The raw capability.
- **Layer 1 — Agent CLIs / IDEs.** Claude Code, OpenCode, Cursor, Aider, Windsurf, Zed, Continue. The harness that gives a model file access, shell access, tool use, hooks, and a session.
- **Layer 2 — Orchestration / company layers.** Multica, Paperclip, CrewAI, AutoGen, LangGraph, MetaGPT, ChatDev. The layer that **coordinates multiple agent sessions** into something resembling a team, a workflow, or a company.

Each layer commoditises the one below it. The agent CLI made the model question feel less load-bearing — you stop caring whether you're running Opus or Sonnet for any given turn because the harness handles it. By the same logic, the orchestration layer makes the *CLI* question less load-bearing. Multica runs across ~11 different coding tools. Once your work is expressed as a queue of tasks with clear handoffs, swapping Claude Code for OpenCode for one of them is a config change, not a re-platforming.

That's the shift. We're not "using AI to write code" anymore — we're starting to *operate* small teams of agents, and the operating concerns (queueing, identity, budget, governance, visibility) are pulling up into a layer of their own.

## The category, surveyed

The products in this layer don't share a single architecture yet — the field is still pre-paradigmatic. But four broad families have emerged, and you can map every serious project to one of them.

### Family 1: Project-management style (humans and agents on one board)

The mental model is Linear or Jira, except the assignees include agents.

**Multica** is the cleanest example. It's open-source, treats agents as actual team members — they show up in assignee dropdowns, claim tasks, post status updates, file follow-up issues, and operate in the same unified timeline as humans. The full task lifecycle (enqueue → claim → execute → complete/fail) is first-class, streamed in real time. Multica also abstracts the agent runtime: it can dispatch work to ~11 different coding tools (Claude Code, Gemini CLI, and others) from the same dashboard. The implicit thesis is that the agent's *home harness* is an implementation detail; what matters is that work is captured, observable, and resumable.

I used Multica to migrate a small app from SQLite to PostgreSQL last month. The benefit wasn't "the agents did it faster." It was that the migration existed as a queue of named, individually-tracked tasks — schema, data, dialect-specific query rewrites, integration test fixes — and when one of them got stuck on a foreign-key constraint, the failure was *visible* and *resumable*. That's a different shape of work than "open a session and hope."

### Family 2: Company / org-chart style (agents in roles, with budgets)

The mental model is a small company, with structure: roles, reporting lines, approval gates, monthly per-agent budgets, audit trails.

**Paperclip** is the prototype. It's also open-source, and its framing is unusually clear: *"Claude Code and OpenCode are employees. Paperclip is the company."* You hire agents, assign them organisational roles, set goals that trace back to a company mission, run multi-company deployments (dozens of isolated agent orgs in one instance), and review every decision as a ticket with full audit trail. Heartbeats schedule agent wake-ups for recurring work. Board-level approval gates exist for the calls humans want to keep their hands on.

This is a more ambitious frame than Multica's. Multica says "here's a board, agents are on it." Paperclip says "here's a company, agents staff it, and your job is to govern." The ambition is the bet — if even a fraction of the "autonomous business function" pitch lands, this is the shape that lands it.

### Family 3: Framework style (build your own orchestrator)

Different audience: engineers who want to *construct* an orchestrator, not consume one. These ship as Python libraries with strong primitives and an opinionated execution model.

**CrewAI** is the closest in vocabulary to the company-style products, but as a framework. Its core abstractions are crews (teams of agents), agents (individual performers), tasks (work assignments), and processes (the execution workflow that binds them). It targets both engineers (low-level API) and subject-matter experts (visual editor). The project reports adoption inside 60% of the Fortune 500 — which probably says more about the easiest answer when a procurement org asks "what do we use for agent workflows" than it does about long-term winners, but the traction is real.

**AutoGen**, from Microsoft Research, popularised the multi-agent *conversation* pattern: agents talk to each other in structured group chats to solve a problem, with a layered architecture (Core API for message-passing, AgentChat for prototyping, Extensions for third-party plug-ins). Worth flagging: AutoGen is in maintenance mode now, and Microsoft is steering new work toward the **Microsoft Agent Framework** as its enterprise-ready successor. The conceptual contributions are sticky even if the product label shifts.

**LangGraph**, from LangChain, takes a different shape: agents as directed graphs of state. Nodes are processing steps, edges are control flow, and the whole thing is a state machine with persistent memory and native streaming. It's the lowest-level of the three, designed for builders who want fine-grained control and who find CrewAI/AutoGen too opinionated. Human-in-the-loop checkpoints are first-class.

### Family 4: "Agent company" research / demos

These are less products and more proofs of concept — but they shaped the imagination of the category and you can't write an honest survey without them.

**MetaGPT** materialises the slogan *"Code = SOP(Team)"* — code is the output of a Standard Operating Procedure run by a team. It assigns agents to software-company roles (PM, architect, engineer) and runs them through structured workflows. From a one-line prompt ("Create a 2048 game") it produces user stories, an architecture, APIs, and code. It's a research project pretending to be a product, but the demo is the point: the *role-based agent team as software factory* idea has stuck.

**ChatDev**, from OpenBMB, takes the same premise further into a "zero-code multi-agent platform for developing everything," with specialised agents (CEO, CTO, Programmer) progressing through waterfall phases (design → coding → testing → documentation) by holding "functional seminars." ChatDev 2.0 extends beyond code into data visualisation and 3D generation. The waterfall framing reads as a bit dated, but the agent-as-role abstraction is the same primitive Paperclip has now industrialised.

## Where the four families converge, and where they diverge

The four families look different on the surface, but every serious orchestration system in this list reduces to three primitives:

1. **A task queue** — work units with status, ownership, and lifecycle.
2. **An agent identity model** — agents as named, persistent actors with capabilities, not anonymous tool calls.
3. **A memory / context store** — what an agent (or the team) remembers between sessions.

Where they diverge is more interesting than where they converge:

- **Human-in-the-loop posture.** Built-in (Paperclip, LangGraph) vs. bolt-on (most others). The built-in approach is going to win as the work gets riskier.
- **Cost governance.** Paperclip is alone in making monthly per-agent budgets a first-class concept. Everyone else will copy this within a year.
- **Identity model.** Multica and CrewAI treat agents as *workers* — interchangeable executors of named tasks. Paperclip and MetaGPT treat them as *roles* — persistent identities with responsibilities. Different metaphors, different downstream design choices. The roles framing is more ambitious; the workers framing is more useful day-to-day right now.
- **Where the model lives.** Frameworks (CrewAI, LangGraph, AutoGen) are model-agnostic by design. Multica abstracts across CLIs. Paperclip can wrap any agent.

## A light POV on where this goes

Three predictions, ordered from "highest confidence" to "most likely to look wrong in six months."

**1. The shift is real, but it's going to feel slow.** This isn't a 2027-everything-changes moment. The capability is mostly here today — what's missing is institutional muscle. Teams don't yet know how to *operate* a small workforce of agents, the way they once didn't know how to operate a Kanban board or a microservice. The Salesforce moment of this category is a few years out. The Trello moment is now.

**2. The winning shape will be the one that lets humans review without becoming the bottleneck.** Every project in this list has some version of "human-in-the-loop." The ones that ship the right *defaults* — approval gates that catch the 5% that matter without queueing the 95% that don't — will eat the ones that ship a generic queue.

**3. Open-source orchestration eats the closed-source one-vendor pitch faster than usual.** This is the prediction I'm least sure about, but the case is straightforward: the *agents inside* the orchestration layer are already swappable (Claude, GPT, Gemini, open weights via OpenCode and Z.AI). Once the substrate is multi-vendor, lock-in at the layer above feels unjustified. Both Multica and Paperclip being open-source from day one is not a coincidence — it's the strategically correct opening move.

What I'm *not* predicting: that any of these specific products is the eventual winner. We're still in the era where the category vocabulary is unsettled. "Orchestration" is doing a lot of work in this post that it won't be doing two years from now.

## What I'd reach for today

For my own work — repo-bound, ship-the-thing work — **Multica** is the one I keep coming back to. The visible task lifecycle is the feature; the agent abstraction is the implementation detail. **Paperclip** is on the radar for the day my work shape changes from "ship a feature" to "run a function as a small autonomous company." The frameworks (**CrewAI**, **LangGraph**, **AutoGen**) sit on the to-build shelf — they're only the right choice when I want to *construct* an orchestrator, not consume one. **MetaGPT** and **ChatDev** are required reading for the category's vocabulary, less so for daily use.

The toolkit I run today is more or less the toolkit I described in [my four-week AI inventory](/ai/ai-toolkit-four-weeks/). What's changed in writing this post is that I now see that toolkit as *layered*: models at the bottom, harnesses in the middle, and an orchestration layer on top that I'm just starting to depend on. A year from now I expect the orchestration layer to feel as obvious as the harness layer does today — and the question "which model?" to feel quaint.

Until then, the people getting the most leverage out of AI in software aren't the ones with access to the best model. They're the ones who've worked out how to *operate* a team of agents that already exists. That's the platform shift. It's already happening. It just hasn't been named.
