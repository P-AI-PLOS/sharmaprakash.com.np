---
title: "Same Model, Five Times the Tokens: What My Agent Harness Was Sending"
date: "2026-11-28T22:30:00+05:45"
directory: ai
category: ["AI"]
categories: ["ai"]
excerpt: "One gem upgrade through Claude Code, Codex, Pi and Hermes showed the harness, not the model, decided whether it cost 37,000 tokens or 190,000."
tags: ["AI agents", "Claude Code", "Pi", "Codex", "Hermes", "tokens", "homelab"]
cover: "/images/blog/ai/same-task-five-agent-harnesses.png"
thumb: "/images/blog/ai/same-task-five-agent-harnesses.png"
use_featured_image: true
draft: false
---

This morning a routine Pi session ate through more of my Claude allowance than I expected. I've only been using Pi for a short while, and early on is the best time to find out a tool is expensive. So I stopped guessing and measured it.

I started from a common suspicion: that Claude bills subscription usage more heavily when it arrives through third-party software. That turned out to be the wrong question. Every Claude path I tested ends up in the official `claude` CLI on my own login. What changed the bill was everything each harness packed around my prompt before the model saw it.

## The first warning sign

My first probe was a patch upgrade of a development-only gem in my Rails app, with no commit. Pi with my everyday configuration used **190,211 tokens**, almost all of them cache writes, and still failed because its shell picked up the wrong Ruby. Pi with every extension, skill and context file switched off did the same job in **37,271**. Same model, same login, same prompt, five times the tokens.

That was enough to justify a proper comparison.

## The real test: upgrade, verify, commit

The main test used Campsite, another Rails API of mine. Each harness got the same instruction in a fresh git worktree:

```text
In this repository's api/ directory: upgrade the brakeman gem to 8.1.1 with
'mise exec -- bundle update --conservative brakeman' (run 'mise trust' first if mise asks).
Verify 'mise exec -- bundle exec brakeman --version' prints 8.1.1. Commit only
api/Gemfile.lock with the message 'Upgrade brakeman to 8.1.1'. Do not push.
```

Success meant a commit on the branch, so there was no room for a confident "done" that hadn't happened. Claude Code, Codex and Pi ran on my laptop. Hermes ran on Friday, a 4-vCPU VM in my homelab where my agent runtime lives.

| Harness | Model | Committed | Tokens | Est. API cost | Time |
| --- | --- | :---: | ---: | ---: | ---: |
| Hermes, tuned lean profile | Sonnet 5.5 | ✅ | 39,073 ¹ | $0.004–$0.10 ² | 119s |
| **Pi, lean** | Sonnet 5.5 | ✅ | **66,006** | $0.108 | 32s |
| Pi, everyday setup after cleanup | Sonnet 5.5 | ✅ | 82,624 | $0.196 | 33s |
| Claude Code, trimmed | Sonnet 5.5 | ✅ | 108,092 | $0.064 | 25s |
| Hermes, full engineering profile | Sonnet 5.5 | ✅ | 135,585 ¹ | $0.014–$0.34 ² | 167s ³ |
| Codex | GPT-6 Luna | ✅ | 222,023 | $0.006 | 39s |

Costs use list API prices. Sonnet 5.5 is $2 per million input tokens, $10 output, $0.10 cache read and $2.50 cache write. GPT-6 Luna is $0.10 input and $0.50 output. On a subscription none of this is billed in dollars, but the same tokens draw down the same allowance.

¹ Hermes's numbers are self-reported and I couldn't verify them. A trivial one-word reply cost 16,957 tokens through the `claude` CLI directly, but only 7,141 by Hermes's own count. Either Hermes replaces Claude Code's long system prompt with a shorter one, or it undercounts. Treat those rows as a floor.
² Hermes doesn't break out cache reads and writes, so its cost is a range between the two.
³ The full profile ran after the lean one had already downloaded the gems, so its time looks better than it was.

## What the numbers say

**The harness matters more than the model.** Lean Pi and trimmed Claude Code drove the same Sonnet model through the same CLI. Pi sent about 60% of the tokens. Hermes's full profile sent roughly three and a half times what its lean profile did.

**Tokens and cost don't rank the same way.** Pi used fewer tokens than Claude Code but cost more, because it wrote its prompt to the cache on each call where Claude Code read it back. Cache writes cost 25 times as much as cache reads, so a harness that caches well can send more tokens and still cost less.

**Codex is in a different price class.** It used the most tokens and cost under a cent, because GPT-6 Luna is a far smaller model. Whether that trade is right depends on the task. For a lockfile bump it was fine.

## Rebuilding Pi

My everyday Pi configuration carried about a dozen extension packages, a GSD workflow layer, over a hundred skills and a 28 KB global policy file. Each was something I had tried in my first weeks. Together they meant a trivial "say ok" cost **91,658 tokens**.

I cut it back to three packages (the Claude provider, a status line and a usage meter), one small extension, six short skills written for Pi, and a 1.7 KB `AGENTS.md` holding only the rules that matter for coding. The same trivial prompt now costs **16,709 tokens**. Everything removed is parked in a `disabled/` folder rather than deleted, so I can bring back whatever I miss.

One cleanup step went wrong in a useful way. Setting `defaultTools` to an empty list doesn't mean "no extras". It means no tools at all, and Pi's next run failed with `Tool bash not found`. Removing the key fixed it.

## Making Hermes usable

Hermes was the slowest by far, and the reasons had little to do with the model. After upgrading Friday to Hermes v0.23.5, a one-word reply took **193 seconds**. Here's where the time went:

- **Lazy installs.** On launch, Hermes was installing default messaging plugins into all 58 profiles on Friday, at about 80 seconds per plugin per profile. Setting `security.allow_lazy_installs: false` brought a cold start down to 61 seconds.
- **The profile itself.** A lean profile with memory off, only the terminal and file toolsets, and no MCP server cut the tool list from 70 tools to 8, and the tool listing from 13,299 tokens to 576. A trivial reply then took 43 to 59 seconds, of which the model call itself was 2 to 6.
- **The machine.** Friday's multiplexed Hermes gateway uses about 63% of a CPU while idle, polling 58 profiles, which keeps the VM's load near 4 on 4 cores.

## A few traps worth knowing

- **Close stdin.** Non-interactive `pi -p` waited on standard input until I redirected it from `/dev/null`.
- **Interactive prompts hang agents.** In a new worktree, `mise` asks whether to trust the project's config. Claude Code's shell closes stdin, so mise fails fast and the agent runs `mise trust`. Pi's shell leaves stdin open, so it waited six minutes for an answer that never came. Trusting the folder in advance fixed it.
- **Don't override your own sandbox config.** My Codex config grants full access. Passing `-s workspace-write` from a script quietly replaced it with a sandbox that blocked mise's state directory and the worktree's `.git` folder.
- **One Hermes launch at a time.** Two concurrent Hermes commands on the same install deadlocked on the Claude provider plugin's lock.

## Where this leaves me

Hermes earns its place as the front door. It takes instructions from Telegram and other channels, and it runs schedules. As a coding worker, though, it brings a heavy runtime to every task. The next arrangement I'm testing keeps a minimal Hermes profile whose only job is to hand the task to Pi, with the same lean Pi setup on every VM. For error monitoring and pull requests, a small script around Pi may be all I need.

What I'm taking from this is simpler than any of the numbers. Choosing a model is the decision everyone talks about, but the harness around it sets the bill. Every extension, skill and policy file rides along on every call, and it's worth knowing exactly what yours is sending.
