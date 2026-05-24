---
title: "Installing Isn't Teaching: What I Learned From Auditing My Own Shell History"
date: "2026-05-25T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "I asked Claude what new CLI tools I should install based on my last week of shell history. The honest answer wasn't a list of tools — it was that I'd already installed half the modern tools I needed and was still typing `cat` and `cd` like it was 2010. A short note on the gap between *having* a tool and *reaching* for one, and where that same gap shows up in your `CLAUDE.md`."
cover: "/images/blog/ai/installing-isnt-teaching.png"
thumb: "/images/blog/ai/installing-isnt-teaching.png"
last_modified_at: "2026-05-25T10:00:00+05:45"
use_featured_image: true
---

I asked Claude a question I've been meaning to ask for months.

*"Based on my past week's usage, what other CLI tools should I install for ease of workflow?"*

I'd been adding to `~/cli-tools.md` for two years. `eza`, `bat`, `zoxide`, `fd`, `ripgrep`, `atuin`, `delta`, `fzf` — the whole "modern Unix" replacement set, plus the agent-stack tools I'd added in the last six months. The file had crossed three hundred lines. I expected Claude to point at something obvious I'd missed.

It started by running `atuin search --after "1 week ago"` and counting my command frequencies. Here is what it found:

> 126 git
> 116 cd
> 31 ls
> 23 cat
> 18 glow
> 15 mise
> ...
> 6 nano

I had `bat` installed. I had used `cat` twenty-three times.
I had `eza` installed. I had used `ls` thirty-one times.
I had `zoxide` installed. I had used `z` exactly once across one hundred and sixteen directory changes.
I had `nvim` installed. I had reached for `nano` six times.

Claude listed three new tools worth installing — `killport`, `sd`, `gitleaks` — and they were all good calls. But the most useful part of the answer wasn't the new-tools section. It was a section titled, with surgical politeness, **"Habit gaps (tools you have but don't use)."**

I sat with that for a minute.

---

## The cost of installing

There's a particular kind of dopamine in installing a new CLI tool. You read a thread about how `eza --git -l` shows you per-file git status; you run `brew install eza`; you feel like a more serious person. The next time you open a terminal, you type `ls`.

This is not a discipline failure. It's a teaching failure. You taught yourself that `eza` exists. You did not teach yourself to *reach* for it.

The reach is the whole game. A tool you have installed but don't invoke is identical, from your shell's perspective, to a tool you don't have at all. The bytes on disk are doing nothing. The mention in `cli-tools.md` is doing nothing. The screenshot you saved when you first heard of it is doing nothing. Every `cat` you type past the install date is a tax you're paying for the fantasy of having upgraded your workflow.

The most expensive layer of any tooling stack is the human layer. We are very slow to update.

---

## The fix isn't more tools

When I saw the audit, my first instinct was to ask Claude to alias `cat` to `bat`, `ls` to `eza`, `cd` to `z`. The reasonable, two-minute fix. Done.

I said no to most of it.

Not because the aliases would have been wrong — they would have worked. But because I'd just been handed a piece of feedback that was more interesting than the immediate ergonomic win. The aliases would have *covered up* the audit. Six months from now, my `~/cli-tools.md` would have grown another fifty lines, my `~/.zshrc` would have another twenty aliases, and I would have no idea which of those tools I was actually using versus which I had installed and forgotten and aliased over so I'd at least *seem* to be using them.

I kept the aliases off for `cat`, `ls`, `nano`. I installed the three new tools. And I made one other change that turned out to matter more than any of it.

---

## The Claude version of the same problem

After the install, I asked Claude something that, in retrospect, was the actual point of the whole exercise.

*"Will you use any of these proactively?"*

The honest answer was no. Not reliably. Each Claude Code session starts fresh. It doesn't auto-read `~/cli-tools.md`. It only reaches for a tool if (a) that tool is mentioned in a `CLAUDE.md` that loads into the session, (b) it comes up in conversation, or (c) it happens to be the kind of common tool the model already knows.

I had spent the morning teaching myself about three new CLI tools. Claude had not been in the room.

This is the same bug as the `cat`/`bat` bug, scaled up to a coworker. The tools are installed. The knowledge is in a document. The document is not loaded. The reach does not happen.

The fix this time was four lines:

```markdown
## Preferred CLI tools (reach for these first)

- Kill a process on a port: `killport <port>` — not `lsof -i :PORT` + `kill -9 <pid>`.
- Find/replace in a file or pipeline: `sd 'pattern' 'replacement' <file>` — not `sed -i ''` on macOS.
- Scan for secrets before committing: `gitleaks detect` — especially when staging `.env*` or auth code.
```

That block went into `~/.claude/CLAUDE.md` — the *global* one, not a project one — so it loads in every Claude Code session I start on this machine, regardless of which repo I'm in. Now when Claude sees a port conflict, the cheapest path is `killport`. When it sees a regex-replace task in a shell pipeline, the cheapest path is `sd`.

I did not write a hook. I did not write a skill. I did not write a subagent. I put four lines into the document that was already going to load anyway.

---

## The cheapest layer, again

Regular readers will recognize the shape. This is [the same rule as the subagent I deleted](/posts/the-subagent-i-deleted): *pick the lightest layer that catches the rule.*

For my own brain, the layers go something like:

1. **Habit** — I just reach for the tool. Free, but slow to install in the human.
2. **Alias** — `.zshrc` rewrites the old command to the new one. Fast, but hides the audit signal.
3. **Documentation** — `cli-tools.md` exists. Catches almost nothing on its own.

For Claude, the same hierarchy translates to:

1. **Training data** — the model already knows the tool. Free, but limited to common things.
2. **Global `CLAUDE.md`** — loads in every session. Cheap, broad, no per-project setup.
3. **Project `CLAUDE.md`** — loads only in this repo. Use it for repo-specific tooling.
4. **Skills, hooks, subagents** — when you actually need behavior, not just a hint.

The mistake I almost made was layer-skipping in the wrong direction. I almost wrote a skill called `/use-modern-tools` that would lecture the agent on which command to use. That would have been the `import-organizer` mistake, run back: a skill doing the job of a one-line note in `CLAUDE.md`.

A four-line block in the right document beats four hundred lines of skill scaffolding. The same way a habit beats an alias beats a `cli-tools.md` line.

---

## The audit is the artifact

If there's one thing I'll keep doing after this, it isn't `killport` or `sd` or `gitleaks`. Those are nice. The thing I'll keep doing is the audit itself.

```bash
atuin search --after "1 week ago" --limit 2000 --format "{command}" \
  | awk '{print $1}' | sort | uniq -c | sort -rn | head -50
```

That one pipeline, run weekly, is the most honest feedback loop I have about my own workflow. It does not care what I think I'm doing. It tells me what I actually did. The tools in my history are the tools I use; the tools missing from my history are the tools I have installed but not internalized.

The same loop applies to your agent setup. Every so often, look at what Claude actually reached for over a week of work — the tool calls in your sessions, the skills it invoked, the subagents it spawned. If half the `.claude/` directory never fires, that's not a configuration; that's a graveyard.

Installing isn't teaching. Documenting isn't loading. The thing in your tool inventory only counts when the reach happens.

Three new tools went into `mise` today. Two new aliases did not get written. Four lines went into the global `CLAUDE.md`. And one shell history audit became a small permanent ritual.

Minus a few habits. Plus a feedback loop. That's the trade I'll take.
