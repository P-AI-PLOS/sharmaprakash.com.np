---
title: "Letting Coding Agents Build It: An Orchestrator, Parallel Lanes and Verification Over Trust"
date: "2026-10-01T18:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "Campsite", "AI agents", "Claude Code", "Codex", "cmux", "git worktrees"]
excerpt: "Much of the Campsite work in this series was implemented by coding agents in parallel worktrees, coordinated by another agent. What made that work was re-checking every result before it merged, and learning from the times it went wrong."
series: campsite-for-agents
seriesOrder: 5
cover: "/images/blog/campsite-for-agents/letting-coding-agents-build-campsite/cover.png"
thumb: "/images/blog/campsite-for-agents/letting-coding-agents-build-campsite/thumb.png"
use_featured_image: false
draft: false
comments: true
share: true
---

The project has a few distinct stories: [why I chose a self-hosted team workspace for agent conversations](/homelab/why-i-self-host-campsite-for-ai-agents/), [where its services run and how the VMs are placed across failure domains](/homelab/where-campsite-runs-in-my-homelab/), [how Kamal deploys each runtime from an exact commit while keeping worker side effects separate](/homelab/deploying-campsite-with-kamal/), and [how the MySQL-to-PostgreSQL migration is being tested and operated](/homelab/campsite-mysql-to-postgresql-patroni/). This article focuses on who did the implementation work.

A lot of it was done by coding agents. Not one agent in one long session, but several at once, each in its own copy of the repository, coordinated by another agent, with me approving anything that touched live infrastructure.

This part is about how that was set up, what kept it honest, and what went wrong.

## The shape of it

```text
                        me (approvals, live changes)
                                    │
                     ┌──────────────▼──────────────┐
                     │  orchestrator (Claude Code)  │
                     │  plans · briefs · verifies   │
                     └───┬───────────┬──────────┬───┘
            KICKOFF brief│           │          │
             ┌───────────▼┐   ┌──────▼─────┐  ┌─▼──────────┐
             │ lane: Codex │   │ lane: Codex│  │ lane: Codex│
             │ worktree A  │   │ worktree B │  │ worktree C │
             └──────┬──────┘   └──────┬─────┘  └──────┬─────┘
                    └──── completion signal ─────────┘
                                    │
                        independent re-verification
                                    │
                           Forgejo PR → merge
```

A Claude Code session acted as the orchestrator. It read the plan, split it into pieces that could proceed independently, wrote a brief for each piece, launched it, and checked the result.

Each piece ran as a **lane**: an OpenAI Codex session, using GPT-6-Luna or GPT-6-Sol at low reasoning effort, in its own [git worktree](/ai/git-worktrees-branches-as-places/). A small `spawn-lane` script created the worktree and opened the lane in its own cmux workspace. cmux is the terminal app I use to run coding agents side by side.

Worktrees matter more than they sound. Two agents editing the same checkout will trample each other. Two agents in two worktrees of the same repository can't, and each lane's diff is exactly its own work.

## The brief is a contract

Every lane started from a `KICKOFF` brief. Nothing clever, but the format was strict:

- **numbered outcomes**: what "done" means, as a list the lane can check itself against;
- **numbered exclusions**: what the lane must not touch, because another lane owns it or because it's out of scope;
- **the environment, pinned**: which database, which Rails environment, which config;
- **forbidden commands**: never print the environment, never push, never deploy;
- **a completion signal**: one command, run once, as the lane's very last action, so the orchestrator knows it has finished instead of guessing from the screen.

That last item sounds minor. It isn't. An agent that finishes, writes a nice summary and goes quiet is indistinguishable from one that's stuck, unless it tells you.

## Verification over trust

The rule I cared about most: **a lane saying it's done is a claim, not a fact.**

Every lane result was verified independently before it merged: the full test suite run again by the orchestrator, the diff reviewed against the brief's outcomes and exclusions, and PostgreSQL runs repeated where the change touched the database. I've written about this idea before as [receipts, not more memory](/ai/exit-0-is-not-evidence/). This was the same idea at a bigger scale.

It paid for itself. Verification caught, among others:

- **A search regression.** A change that looked correct made search return fewer results when some of the matches were hidden from the person searching. The lane's own checks hadn't flagged it; the independent verification did.
- **A behaviour change outside scope.** A lane's diff changed behaviour the brief hadn't asked it to touch. Reviewing the diff against the exclusions caught it.
- **Missing database access rules.** The PostgreSQL configuration a lane prepared was missing the client-authentication (`pg_hba`) rules that replication between the cluster members needs. Without them, replication would have been blocked.

None of these was a bad agent. Each was a reasonable change that nobody had checked from outside the lane.

## Live infrastructure stayed gated

Lanes didn't change live machines. For anything that touched a VM, a host, a firewall or a running service, the lane prepared a plan and a dry run. I reviewed it, and the approved change ran separately.

That split cost some speed. It bought me a clear record of what was proposed, what was approved and what actually ran. It also meant a lane's mistake could only ever be a wrong plan, never a wrong change already applied.

## Tooling I fixed along the way

Running this many agents surfaced problems in the tooling itself:

- **Per-lane effort.** Different lanes needed different reasoning effort, so the launcher gained a per-lane setting instead of one global default.
- **Launch verification.** cmux sometimes dropped or garbled commands typed into a terminal that wasn't ready yet. The launcher now verifies that the agent actually started, by checking for a process running in the lane's directory rather than by reading characters off the screen.
- **First-run prompts.** A fresh worktree can trigger a "do you trust this folder?" prompt that blocks an unattended agent. The launcher now warns about it up front.

Each of these was found by something going wrong once and being written down.

## What went wrong, and what changed

These are the incidents I learned the most from. I'm describing them as lessons, not as a timeline.

**An agent printed its environment.** A lane ran a command that dumped environment variables, and a credential ended up in a log. The credential was rotated. Briefs now forbid printing the environment outright, and [the Kamal deployment preflight checks which secret names are available without displaying their values](/homelab/deploying-campsite-with-kamal/). The lesson: if a secret *can* reach an agent's output, eventually it will.

**A brief didn't pin the environment.** One brief omitted `RAILS_ENV=test`, and a lane dropped a *local* development database while setting up tests. Production was untouched, but it was a clear warning. Every brief now pins the environment explicitly. The lesson: a default you didn't write down isn't a default, it's a coin toss.

**The orchestrator makes mistakes too.** Shell mistakes on the orchestrator side can leak or break things just as easily as a lane's. Commands are now written out plainly, so it's obvious what will actually run. The lesson: the coordinating agent needs the same guardrails as the agents it coordinates.

**The homelab moved underneath us.** During this work, a hypervisor host went down and came back, and a VLAN became unreachable from my laptop in the middle of a rollout. Nothing an agent did caused either. But each time, everything was re-verified before work continued. A plan that assumes yesterday's state is only as good as yesterday.

## Would I do it again?

Yes, with the same shape. The parallelism is real: several independent pieces of a migration moving at once, each reviewable on its own. But the parallelism isn't what made it work. The briefs, the exclusions, the completion signals, and above all the independent verification did.

If I had to keep one practice, it would be this: **verify every result from outside the agent that produced it.** Everything else in this post is just making that cheap enough to do every time.

And the agents that built this are, fittingly, the same kind of agents that now post their updates in Campsite. [The rationale for using Campsite as their shared workspace explains that workflow](/homelab/why-i-self-host-campsite-for-ai-agents/).

<!--
# Image prompt

Codex prompt for cover.png (21:9) and thumb.png (16:9), saved to
public/images/blog/campsite-for-agents/letting-coding-agents-build-campsite/cover.png
and thumb.png.

Editorial illustration, no embedded text, no logos, no watermarks. A wide
forest workshop clearing at dusk seen from slightly above. Several small,
friendly geometric robot figures work at separate parallel workbenches, each
bench inside its own softly glowing rectangular boundary on the ground,
suggesting isolated worktrees. At the head of the clearing, a taller robot
figure holds a lantern and inspects a finished object handed up from one bench,
while a single human silhouette stands beside a small gate leading to a cabin
with a server-rack glow in its window, suggesting approval before anything
reaches live infrastructure. Cool slate and deep-teal palette with a single
warm amber accent on the lantern and the bench boundaries. Calm, geometric,
slightly isometric composition with generous negative space. Matte finish,
restrained palette, no neon. Aspect ratios: 21:9 hero crop and 16:9 card crop
of the same composition.
-->
