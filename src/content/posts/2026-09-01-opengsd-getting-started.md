---
draft: false
title: "OpenGSD Getting Started: From Install to Your First Shipped Phase"
date: "2026-09-01T09:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Install GSD Core in the coding agent you already use, learn the five-command loop, and take an existing repository from vague request to verified phase without losing the decisions in chat."
tags: ["OpenGSD", "GSD Core", "Codex", "Claude Code", "agentic coding"]
cover: "/images/blog/parallel-developer/opengsd-getting-started/cover.png"
thumb: "/images/blog/parallel-developer/opengsd-getting-started/thumb.png"
use_featured_image: true
series: parallel-developer
seriesOrder: 6
---

OpenGSD clicked for me when I stopped treating it as another AI coding tool.

It is an operating system for the work around the coding tool: deciding what a phase means, recording the decisions, turning them into plans that fit inside a clean context, executing those plans, and checking that the result actually works. The model may change. The repository may survive for years. The workflow remains.

The project name can be slightly confusing. **OpenGSD** is the wider open-source ecosystem. **GSD Core**, published as `@opengsd/gsd-core`, is the prompt and context-engineering framework that installs into Claude Code, Codex, Cursor, Copilot, OpenCode, and other supported runtimes. This article is about GSD Core.

The shortest useful mental model is:

> **Discuss → Plan → Execute → Verify → Ship**

Remember those five verbs and you can recover when a long project starts to feel fuzzy.

## What GSD adds to your coding agent

A normal agent conversation is temporary. You explain a feature, answer several questions, approve a trade-off, and watch the context window fill with logs. When you start a new session, much of that reasoning is gone or reduced to a summary.

GSD writes the important state into `.planning/`:

```text
.planning/
├── PROJECT.md
├── REQUIREMENTS.md
├── ROADMAP.md
├── STATE.md
└── phases/
    └── 01-example-phase/
        ├── CONTEXT.md
        ├── RESEARCH.md
        ├── 01-01-PLAN.md
        └── VERIFICATION.md
```

The exact files vary by workflow and configuration, but the principle does not: chat is where you collaborate; the repository is where the durable decisions live.

GSD also sends heavy research, planning, execution, and verification into fresh specialist contexts. That is its answer to **context rot**: the quiet drop in quality that happens when one long-running agent has to remember the entire project, every command result, and every earlier correction at once.

The [official GSD Core overview](https://github.com/open-gsd/gsd-core) describes the same five-stage loop and explains why the installer, rather than copying prompt files by hand, is the supported entry point.

## Install from the source of truth

You need Git, Node.js and the AI coding runtime you already use. Check the current runtime requirements in the [official installation guide](https://github.com/open-gsd/gsd-core/blob/next/docs/how-to/install-on-your-runtime.md), because supported versions and integration details move faster than blog posts.

For the guided installer:

```bash
npx @opengsd/gsd-core@latest
```

The installer asks which runtime to target and whether the install should be global or local. For an explicit global install:

```bash
# Codex
npx @opengsd/gsd-core@latest --codex --global

# Claude Code
npx @opengsd/gsd-core@latest --claude --global
```

Do not copy `agents/` or `commands/` from the GitHub repository. Each runtime expects different schemas and directories. The installer performs those transformations; for example, it creates TOML agent definitions for Codex.

After a Codex install, restart Codex or run:

```bash
codex --reload
```

Then confirm the install landed where the runtime expects it:

```bash
ls ~/.codex/skills/gsd-*/SKILL.md
ls ~/.codex/agents/gsd-*.toml
```

For Claude Code, start a new session and check that the `/gsd-*` commands appear. For Codex, the same workflows appear as `$gsd-*` skills. I use slash-command spelling in the rest of this series because it matches the upstream documentation; translate `/gsd-plan-phase` to `$gsd-plan-phase` when your Codex interface exposes skills with a dollar prefix.

## Start greenfield or onboard brownfield

In a new repository:

```text
/gsd-new-project
```

GSD interviews you about the product, researches the domain when configured to do so, and creates requirements and a phased roadmap.

In an existing repository:

```text
/gsd-onboard
```

Onboarding matters. A mature codebase already contains conventions, boundaries, tests, deployment paths, and historical accidents. GSD needs a grounded map of what exists before it can write a credible roadmap for what should change.

Do not use `/gsd-new-project` to pretend an existing codebase is greenfield. The plan may look clean, but it will be clean in the way a map of an empty field is clean.

## Run your first phase

Once `ROADMAP.md` contains a phase, walk the loop in order.

### 1. Discuss

```text
/gsd-discuss-phase 1
```

This is where you decide the things a planner should not guess: user experience, boundaries, compatibility, migration posture, acceptable shortcuts, and explicit exclusions. Good discussion makes planning boring.

### 2. Plan

```text
/gsd-plan-phase 1
```

GSD researches the codebase, splits the phase into executable plans, identifies dependencies, and checks whether each plan fits in a fresh execution context. Read the plans. A generated plan is a proposal, not authority transferred to a machine.

### 3. Execute

```text
/gsd-execute-phase 1
```

Independent plans can run in parallel waves. Dependent plans remain ordered. Executors work from the recorded context instead of reconstructing product decisions from a one-line ticket.

### 4. Verify

```text
/gsd-verify-work 1
```

Verification asks whether the phase goal was achieved, not merely whether tasks were marked complete. A green unit test is evidence for one claim. It is not evidence that the browser flow works, a migration is safe, or production contains the intended revision.

### 5. Ship

```text
/gsd-ship
```

Shipping packages the work for review. It does not erase your repository's authority rules. If your team requires an explicit approval before push, deployment, migration, or merge, GSD must follow that contract.

The upstream [first-project tutorial](https://github.com/open-gsd/gsd-core/blob/next/docs/tutorials/your-first-project.md) walks through this entire loop with a small example.

## Is OpenGSD used by big companies?

I could not find a reliable official customer list or a named enterprise case study that proves a specific large company uses GSD Core internally. The project publicly supports runtimes from companies such as Anthropic, OpenAI, Microsoft/GitHub, Cursor, and others. **Runtime compatibility is not customer adoption.**

The honest evidence today is that GSD Core is an active MIT-licensed open-source project with a visible repository, releases, contributors, and community. That is useful evidence when evaluating a tool. It is not permission to place enterprise logos on a slide.

If OpenGSD later publishes a verifiable case study, add the company and link the primary source. Until then, say “works with Codex and Claude Code,” not “used by OpenAI and Anthropic.”

## The first-week rule

Do not begin by enabling every autonomous option. Run one phase manually through all five verbs. Watch which files change. Read one plan. Observe one verification failure. Learn where your runtime puts the skills and how your repository handles branches and commits.

The goal of week one is not maximum agent throughput. It is learning where judgment enters the loop.

Next: [OpenGSD after installation: the everyday commands and habits that keep it useful](/ai/opengsd-everyday-workflow/).

## Sources

- [GSD Core repository and quickstart](https://github.com/open-gsd/gsd-core)
- [Install GSD Core on your runtime](https://github.com/open-gsd/gsd-core/blob/next/docs/how-to/install-on-your-runtime.md)
- [Your first GSD project](https://github.com/open-gsd/gsd-core/blob/next/docs/tutorials/your-first-project.md)
