---
title: "Workflow vs Agent Team: Two Ways to Run Many Claudes"
date: "2026-06-09T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Once you're spawning subagents, you hit a fork: let the lead agent decide who to spawn and when, or script the orchestration deterministically up front. They feel similar and fail differently. Here's how I pick."
use_featured_image: false
---

The first time you let Claude spawn a subagent, it feels like a cheat code. The lead agent reads the task, decides it needs help, fans out three readers across three subsystems, and synthesizes what comes back. You didn't plan any of that. It just happened.

The second time you need the *same* fan-out, you notice it didn't happen the same way. Different number of agents, different split, different synthesis. The structure is improvised fresh every run.

That's the fork. There are two ways to run more than one Claude at once, and they're not the same tool wearing different hats. One is an **agent team** — a lead agent that decides, at runtime, who to delegate to. The other is a **workflow** — a script you write that decides the structure up front and the agents just fill in the slots. They look similar from the outside. They fail in completely different ways.

---

## What an agent team actually is

An agent team is model-driven control flow. The lead agent — the one you're talking to — holds the plan in its head. When it judges that a piece of work is big enough, parallelizable enough, or far enough from its current focus, it spawns a subagent to handle it and waits for the result. The result comes back as text, the lead reads it, and decides what to do next.

Nobody wrote down "spawn three readers." The lead inferred that three was the right number from the shape of the task. Next time the task is shaped slightly differently, it'll infer something else.

This is the right model when **you don't know the shape of the work before you start.** "Figure out why the build is slow" doesn't decompose cleanly until you've looked. The lead looks, finds two suspicious areas, spawns an agent on each, reads what they find, and maybe spawns a third based on what the first two surfaced. The branching is the point. You couldn't have scripted it because the second decision depended on the first one's answer.

The cost is that the structure is non-reproducible and the lead's context is the bottleneck. Everything funnels back through one agent's working memory. Fan out twelve agents and the lead has to read twelve reports and hold them all at once to synthesize — the same context pressure you were trying to escape.

---

## What a workflow actually is

A workflow is deterministic orchestration. You write a script — actual code, with loops and conditionals — that says exactly what fans out, what runs in parallel, what verifies what, and in what order. The agents are workers; the script is the foreman. Here's the canonical shape, lightly trimmed from one I actually run:

```js title="review.workflow.js"
const DIMENSIONS = [
  { key: "bugs", prompt: "Find correctness bugs in the diff." },
  { key: "perf", prompt: "Find performance regressions in the diff." },
];

const results = await pipeline(
  DIMENSIONS,
  (d) => agent(d.prompt, { phase: "Review", schema: FINDINGS }),
  (review) =>
    parallel(
      review.findings.map((f) => () =>
        agent(`Adversarially verify, try to refute: ${f.title}`, {
          phase: "Verify",
          schema: VERDICT,
        }).then((v) => ({ ...f, verdict: v }))
      )
    )
);

return results.flat().filter((f) => f.verdict?.isReal);
```

Read what that buys you. The `bugs` dimension and the `perf` dimension run at the same time. The moment `bugs` returns findings, each one is handed to a fresh skeptic agent told to *refute* it — while `perf` is still reviewing. Nothing waits on anything it doesn't depend on. And every finding that survives was checked by an agent that never saw the others, so a plausible-but-wrong bug doesn't get to ride along on the lead's optimism.

You could never get that reliably from an agent team. Not because the lead isn't smart enough — because "verify every finding with an independent skeptic before you believe it" is a discipline, and a single agent improvising under context pressure will skip it exactly when it matters most. The script doesn't get tired.

The cost is that you had to know the shape. `DIMENSIONS` is a list I wrote. If the right dimensions only become clear *after* you've looked at the diff, the script can't help you — you're back to the lead deciding.

---

## The tell that decides it

The question isn't "which is more powerful." It's one question about your task:

> **Do I know the structure of the work before the work starts?**

If yes — same operation over a known list, a fixed set of review lenses, a migration across files you can enumerate — write a workflow. You get reproducibility, parallelism that doesn't choke the lead, and verification you can't forget to run.

If no — open-ended diagnosis, exploration where each finding redirects the next — use an agent team. The branching *is* the work, and a script would just be a worse version of the lead's judgment.

The trap is reaching for the powerful-looking one out of order. A workflow over a problem you haven't scoped yet produces a confident, parallel, beautifully-structured answer to the wrong question. An agent team over a problem you've already fully scoped just adds non-determinism and context pressure to something a `for` loop would have nailed.

---

## The move that's usually right: scout, then script

In practice the best runs are neither pure. They're **hybrid, in that order**: let an agent (or just yourself) scout inline first to discover the work-list, *then* hand that list to a workflow to grind through deterministically.

You don't know the shape before the *task* — you know it before the *orchestration step*. So:

1. **Scout.** "List the files that import this deprecated helper." "Find the channels still posting to the old webhook." One agent, or one `grep`, produces a concrete list. This part is fine to improvise — it's discovery.
2. **Script.** Feed that list into a `pipeline()` that transforms each item and verifies the result. This part should be deterministic — it's execution.

The discovery is where judgment lives and reproducibility doesn't matter. The execution is where reproducibility is everything and judgment is a liability. Putting the improvisation in stage one and the rigor in stage two gets you both. Putting them the other way around — scripting the discovery, improvising the execution — gets you neither.

---

## A smaller heuristic, for when you're not sure

If you're genuinely on the fence, ask how bad it is to be **non-reproducible**.

If a re-run that produces a different structure is fine — you're exploring, you'll read whatever comes back anyway — the agent team's flexibility is free upside. If a re-run that quietly skips a verification step or covers eleven of twelve files is a problem you'd ship without noticing, you want the script, because the script is the only one of the two that can't silently drop work.

That's the whole distinction, really. An agent team is judgment you can't reproduce. A workflow is structure that can't think. Most real work wants a little of the first to find the edges and a lot of the second to cover them.
