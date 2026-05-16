---
draft: true
title: "Claude Models Explained: Opus, Sonnet, Haiku for Coding"
date: "2026-04-26T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Opus for architecture, Sonnet for execution, Haiku for the fast repetitive stuff. And prompt caching that makes the pricing math work in your favour."
cover: "/images/blog/ai/claude-models-explained-coding.png"
thumb: "/images/blog/ai/claude-models-explained-coding.png"
last_modified_at: "2026-04-26T10:00:00+05:45"
use_featured_image: true
series: ai-stack
seriesOrder: 2
---

I spent a month defaulting every task to Opus 4.7 — the most capable model — and watched my API bill climb. Then I switched everything to Haiku — cheapest — and started catching subtle bugs slipping through. The fix wasn't picking one model. It was routing tasks by complexity.

Here's how to think about the three Claude tiers and the prompt caching behaviour that makes the API pricing genuinely manageable.

---

## The three tiers

### Claude Opus 4.7 — when you need the model to think

Opus earns its cost when the task requires actual reasoning, not just execution. When I say reasoning, I mean: holding multiple constraints simultaneously, identifying what you *didn't* ask for but should have, designing something that will survive contact with a real codebase.

Use Opus for:
- Architectural decisions (how should this service boundary work?)
- Auditing a large codebase for patterns or anti-patterns
- Writing a spec or design doc that needs genuine judgment, not just prose
- Debugging a hard problem with no obvious cause — the kind where you need the model to generate hypotheses, not completions
- Code review where the thing you want flagged is the subtle stuff, not the obvious stuff

Don't use Opus for: implementing a feature from a clear spec, writing tests, formatting, refactoring with a defined target shape, anything repetitive. You're paying for a reasoning engine; don't route a typewriter task to it.

### Claude Sonnet 4.6 — the daily driver

Sonnet is what Claude Code defaults to, and it's right to. For the majority of agentic coding tasks — feature implementation, refactoring toward a known target, writing tests, reviewing a PR, summarising what a module does — Sonnet delivers output you'd be happy with at around 60-70% of Opus cost.

The gap between Sonnet and Opus is real but narrow for well-scoped execution tasks. It widens significantly on tasks that require judgment, ambiguity resolution, or multi-step reasoning with no clear correct path.

My heuristic: if I can write the task as a clear spec in one paragraph, Sonnet can execute it. If writing the spec *is* the hard part, I want Opus.

### Claude Haiku 4.5 — fast and cheap for the repetitive

Haiku is quick and costs roughly 1/15th of Opus. That's not a typo. For tasks where the expected output is simple and the tolerance for error is low, it's an easy call.

Good Haiku tasks:
- "Read this file and tell me the exported function signatures"
- "Is this line violating our naming convention?"
- "Generate boilerplate for a new Express route that follows this pattern"
- "Summarise what this commit diff does in one sentence"
- Any step in a pipeline where the action is mechanical and the input is constrained

Bad Haiku tasks: anything requiring judgment, anything where a subtle error compounds downstream, anything architectural.

Note: Haiku is API-only. There's no subscription tier that includes it. If you want to route tasks to Haiku, you need an API key.

---

## The task-routing pattern

The biggest unlock is not picking a model per session — it's routing within a session by complexity.

An agentic session might look like:

1. Load context, understand the task → **Haiku** (mechanical reading)
2. Design the implementation approach → **Opus** (if novel) or **Sonnet** (if routine)
3. Implement the code → **Sonnet**
4. Write tests → **Sonnet**
5. Check if any test violates the naming convention → **Haiku**
6. Summarise what changed for the commit message → **Haiku**

Tools that support multi-model sessions (or where you're scripting API calls directly) make this natural. For interactive Claude Code sessions, you're typically on one model per session — but knowing the tiers means you can consciously pick the right one at session start.

---

## Prompt caching — the underused cost lever

Prompt caching is Anthropic's mechanism for billing repeated context at roughly 10% of the normal token cost. The cache is keyed on the prefix — if the start of your context is identical across requests, subsequent requests pay the cached rate.

Here's what that means in practice.

Your `CLAUDE.md` and `rules/*.md` files are static. They appear at the start of every request in a session. After the first request hits the API and warms the cache, every subsequent request in that session pays the cache rate for those tokens.

**Concrete math:**

Suppose your context header (CLAUDE.md + rules files) is 10,000 tokens. You run 20 requests in a session.

- Without caching: 20 × 10,000 = 200,000 billed input tokens
- With caching: 10,000 (first request, full price) + 19 × 10,000 at cache rate (~$0.30/million instead of $3.00/million)
- Billed equivalent: 10,000 + (19 × 10,000 × 0.10) = 10,000 + 19,000 = 29,000 effective token-equivalents
- **Reduction: ~85%**

For a heavy session with a dense `CLAUDE.md`, the difference between a $2.00 session and a $0.30 session is whether you're hitting the cache.

### How to ensure cache hits

The cache key is the exact text of the prefix. Two things break it:

1. **Editing your `CLAUDE.md` mid-session.** If you change the file, the prefix changes, the cache misses, and you pay full price for the next request. Keep your context files stable within a session.
2. **Dynamic content early in the context.** If you inject a timestamp or a random value at the start of your system prompt, every request is a cache miss. Put dynamic content late in the prompt, after the stable prefix.

The practical rule: write your `CLAUDE.md` before you start a session. Let it be static for the duration. Edit it between sessions, not during.

---

## API vs. subscription per tier

| Model | Available on subscription? | API pricing (approx) |
|---|---|---|
| Opus 4.7 | Claude Max (limited) | ~$15/M input, ~$75/M output |
| Sonnet 4.6 | Claude Pro + Max | ~$3/M input, ~$15/M output |
| Haiku 4.5 | No | ~$0.80/M input, ~$4/M output |

If you're on Claude Pro and doing interactive sessions, you're effectively using Sonnet at no marginal cost. If you want Opus or Haiku at meaningful scale, you need the API.

---

## Practical recommendation

Start with Sonnet 4.6 for everything. It's the right default — strong enough for almost all coding tasks, fast enough for interactive sessions, and it's what the Claude Code team has tuned their tooling around.

Add Haiku explicitly when you're building pipeline steps that are mechanical and high-volume. Add Opus when you hit a task where Sonnet's output genuinely isn't good enough — that's your signal that the task requires more reasoning, not just more trying.

Don't add Opus "just in case." The gap is real for the tasks that need it; for everything else, you're paying a premium for output you wouldn't have been able to distinguish from Sonnet anyway.

---

## Coming next

Post 3 looks at DeepSeek — a model family that matches Sonnet on many coding benchmarks at roughly 10x lower API cost. Including what it's genuinely good at, where it falls short, and what you need to know about data residency before routing any serious work through it.
