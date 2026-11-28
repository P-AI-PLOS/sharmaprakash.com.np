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

This morning a routine Pi session ate through more of my Claude allowance than I expected. I've only been on Pi for a short while, and early in an adoption is the best time to find out a tool is expensive. So I stopped guessing and measured it.

The suspicion I started with was a familiar one: that Claude bills subscription usage more heavily when it comes through third-party software. That turned out to be the wrong question. Every Claude path I tested ends up in the official `claude` CLI on my own login. What changed the bill was everything the harness packed around my prompt before the model ever saw it.

## One small job, one prompt

The test needed to be real work, but small enough to repeat. I picked a patch upgrade in my Rails app, LeaveBalance: move the development-only `lookbook` gem from 2.3.14 to 2.3.17 and prove the new version loads. Every harness got the same instruction in its own fresh git worktree off `main`:

```text
Upgrade the lookbook gem to 2.3.17 with 'mise exec -- bundle update --conservative lookbook',
then confirm Lookbook::VERSION prints 2.3.17. Do not commit. Reply with one line: done or the error.
```

A correct run changes seven lines of `Gemfile.lock` and nothing else. That made success easy to check with `git diff --stat`, and the token counts came from each tool's own JSON output.

## The results

| Harness | Model | Result | Tokens | Cache write | Cache read | Output | Est. API cost |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| **Pi, lean** | Sonnet 5.5 | ✅ | **37,271** | 16,530 | 20,514 | 223 | **$0.046** |
| Claude Code, trimmed | Sonnet 5.5 | ✅ | 75,294 | 13,346 | 61,602 | 340 | $0.043 |
| Codex | GPT-6 Luna | ✅ | 92,405 | — | 30,336 | 152 | $0.007 |
| Pi, my full setup | Sonnet 5.5 | ❌ | 190,211 | 186,613 | 2,986 | 608 | **$0.473** |
| Hermes, full profile | Opus 5.5 | ❌ ¹ | 95,770 | n/a | n/a | ~680 | $0.07–$0.98 ² |
| Hermes, lean | Sonnet 5.5 | ❌ ¹ | 22,258 | n/a | n/a | n/a | under $0.06 ² |

Costs use list API prices: Sonnet 5.5 at $2 per million input tokens, $10 output, $0.10 cache read and $2.50 cache write; Opus 5.5 at four times that; GPT-6 Luna at $0.10 input and $0.50 output. On a subscription none of this is billed in dollars, but the same tokens draw down the same allowance, so the dollar column is a fair way to compare runs.

¹ Hermes runs on a different machine in my homelab that can't compile the `rugged` native extension, so `bundle update` failed there for reasons unrelated to Hermes. Its rows measure overhead, not success.
² Hermes reports totals without the cache split, so its cost is a range between all-read and all-write.

## Where 150,000 extra tokens came from

The two Pi rows use the same model, the same login and the same prompt. The only difference is what Pi loaded at startup. My everyday Pi configuration carries about a dozen extension packages (subagents, plan mode, a usage meter, web browsing, a memory provider and others), a skill library, prompt templates and a long global `AGENTS.md` policy file. Each of them is useful. Together they put roughly 150,000 tokens of instructions and tool definitions in front of a request to update one gem.

Worse, almost all of it showed up as **cache writes**. Prompt caching only pays off when the next call reads what the last one wrote, and here the cache read was just 3,000 tokens. At list prices a cache write costs 25 times as much as a cache read, so the full setup cost ten times the lean one, even though it used only five times the tokens.

The lean run turned all of that off and loaded only the provider that bridges Pi to Claude Code:

```sh
pi --no-extensions -e ~/.pi/agent/npm/node_modules/claude-code-pi/src/index.ts \
   --no-skills --no-prompt-templates --no-context-files \
   --model claude-code-cli/sonnet -p "..."
```

That run finished the job in two model calls and 37,271 tokens, about half of what trimmed Claude Code used. On cost the two came out level, because Pi's smaller prompt was written to cache rather than read from it. For a one-shot task, a lean harness and a trimmed Claude Code are about the same price. Load everything, and the cost jumps an order of magnitude.

## Hermes showed the same pattern

Hermes is the agent runtime behind my homelab factories, and it had always felt slow to me. Its full `em` profile took about eight and a half minutes and almost 96,000 tokens on Opus to reach the build failure. Restricting it to the terminal toolset, capping turns and switching to Sonnet got it to the same failure in 85 seconds and 22,258 tokens.

```sh
hermes -p em chat -Q --oneshot -t terminal --max-turns 8 -m sonnet -q "..."
```

That isn't a like-for-like comparison with the laptop runs, because the machine and the outcome are different. But the ratio matches what Pi showed: the work itself is cheap, and the default context is what you pay for.

## What I'm changing

- **A lean Pi command for focused work.** My full configuration stays for exploratory sessions, where subagents and memory earn their keep. Narrow, well-specified jobs get a `pi-lean` shell function with only the Claude provider loaded.
- **Toolsets per Hermes job.** Scheduled and single-purpose Hermes jobs should name the toolsets and model they need, instead of inheriting a profile built for open-ended engineering.
- **Measure before rolling out.** I was partway through making Claude the primary model across every Hermes install in my homelab. One machine has switched. The rest wait until their profiles are trimmed, because every machine draws on the same allowance.

A few practical notes for anyone repeating this. Non-interactive `pi -p` waited on standard input until I redirected it from `/dev/null`. Codex's `workspace-write` sandbox blocks network access unless you enable it, which cost one failed run of 61,000 tokens before I noticed. And the Claude bridge inside Pi didn't inherit mise's shims, so `bundle` quietly ran on the system Ruby until I put them on `PATH`.

## The takeaway

Choosing a model is the decision everyone talks about, but on this test it was the smaller lever. The bigger one is how much the harness sends along with each request. Every extension, skill and policy file rides along on every call, whether the task needs it or not.

I'm glad I caught this in my first weeks with Pi rather than after a year of habits had formed around it. The tooling is good. It just pays to know what it is sending on your behalf.
