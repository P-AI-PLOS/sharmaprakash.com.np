---
voice:
  name: Prakash
  id: 7a94qxTnWOxNUMLOxXGR
voice_settings:
  stability: 0.4
  similarity_boost: 0.8
  style: 0.55
  use_speaker_boost: true
model: eleven_v3
title: "Episode 3 — The Subagent I Didn't Need"
duration_target_minutes: 13
excerpt: "A confession about a subagent I wrote, ran for a month, and quietly deleted — and the broader taxonomy of agent-side artifacts that helped me see why. Five things live in a mature agent-ready repo, and they are not interchangeable. A field guide to when not to delegate."
---

I want to tell you about a subagent I wrote... and then deleted.

I wrote it on a Sunday afternoon.

I remember because I was feeling clever. That very specific kind of clever you feel when you've just discovered a new tool — and every problem in your repo starts to look like the shape of that tool.

I had recently understood subagents. Really *understood* them. And I was making a list of all the things I could delegate.

The subagent's name was `import-organizer`.

Its job was to look at a TypeScript file after the agent had edited it... and reorganize the imports. Group them. Third-party packages first. Then absolute paths from `src/`. Then relative paths. Alphabetize within each group. Insert a blank line between groups.

I gave it a beautiful system prompt. I gave it a `Read` and `Edit` tool. I wrote a small skill so I could invoke it on demand. I committed it. I felt very smart.

[sighs]

Within about ten days... I noticed something.

The subagent was firing. I'd invoke it. It would whir. It would rearrange the imports. It would return a report. It was *working*.

But every time I looked at the diff it produced, I felt a small, specific irritation. The same irritation I get when I see someone use a moving truck... to deliver a single envelope.

The subagent was costing me tokens. In real money. Every single time. To do something Prettier already does. With a config file. For free. Locally. In milliseconds. Without an LLM.

[short pause]

I deleted the subagent. I wrote three lines of Prettier config. I never thought about import ordering again.

---

Hey. I'm Prakash. This is Greenfield. Episode three.

[short pause]

I think the most important skill in this whole agentic-engineering thing is not knowing when to reach for a subagent.

It's knowing when *not* to.

And I think the reason that's hard... is that we don't have a good map of what kinds of things actually live in a mature agent-ready repo. We just have a vague sense of "AI stuff." A folder called `.claude/`. And a slowly growing pile of files in it.

So I want to do, on this episode, what the `import-organizer` taught me to do.

I want to lay out the taxonomy. Five different categories of agent-side artifact. And then I want to talk about how to pick the right one — and especially, how to recognize when *none* of them is the right one... and the answer is just a Prettier config and a deep breath.

---

Five things live in a healthy agent-ready repo. They are not interchangeable.

Here they are. From heaviest to lightest.

[short pause]

**One. The persistent context document.**

Usually `CLAUDE.md`. The agent reads it at the start of every session. It holds the things that are true about your codebase, no matter what task is in front of you.

*We use pnpm. We don't import barrels. We ship to enterprise customers on older Safari.*

This is the standing brief. The agent reads it once per session, and carries it forward.

**Two. The task prompt.**

A markdown file in `docs/prompts/` for a specific repeatable task. *How we migrate a list page. How we add an audit log.*

The agent reads it when you tell it to. And it shapes one specific session's work. Static. Deterministic. Costs nothing per invocation after the read.

**Three. The hook.**

A shell script in `.claude/hooks/` wired to a lifecycle event. Fires automatically. Blocks bad edits. Formats files. Reminds the agent of pre-handoff checks.

Deterministic. Free per run. Catches what `grep` can catch.

**Four. The subagent.**

A markdown file in `.claude/agents/` with a system prompt for a specialist worker. The parent agent delegates. The subagent runs in its own context window. It returns a report.

Reads code. Forms an opinion. Costs tokens.

**Five. The skill.**

A markdown file in `.claude/commands/`. A slash command. The user-facing surface.

The teammate types `/migrate-list Orders`, and the right workflow fires. Loads the right prompt. Invokes the right subagent. Runs the right checks.

[short pause]

Five categories. Each one shaped for a specific kind of job.

---

The trap I fell into with `import-organizer` is what I think of as the **wrong-layer trap**.

The job was real — keep imports tidy. The category I picked was the most expensive layer in the stack. Five times too heavy.

And the right answer? Was *not even in the agent stack at all*. It was a regular development tool... that has existed for years.

[short pause]

So here's the test I now run before I write any new artifact. I call it the four questions.

**Question one. Is this a rule? Or is it a workflow?**

A rule is a constraint. *Don't do X.* A workflow is a sequence. *To do this thing, first do A. Then B. Then C.*

Rules go in `CLAUDE.md` or in hooks. Workflows go in prompts, subagents, or skills.

If you find yourself writing a hook that has to know about a sequence of steps... you're trying to encode a workflow into the rules layer. And you'll feel the pain within a week.

**Question two. Does this need to be automatic? Or on-demand?**

Hooks are automatic — they fire every time the lifecycle event fires. Skills are on-demand — they fire when a user types the slash. Subagents are usually invoked by the parent, often through a skill. Prompts are read when pointed at.

If the answer to "when should this fire" is *every time the agent edits a file* — it's a hook. If the answer is *when the user explicitly asks* — it's a skill.

Mixing these up is how you get noisy enforcement.

**Question three. Does this need an LLM at all?**

This is the question I missed with `import-organizer`.

The honest test: can a regular tool — Prettier, ESLint, Renovate, a precommit hook, a TypeScript compiler flag — do this job?

If yes... use the regular tool.

The agent stack is for things regular tools can't do. Don't pay LLM prices to do work that has had a `--fix` flag since 2018.

**Question four. If it does need an LLM... does it need a *separate* LLM?**

Subagents are separate processes. They cost a fresh context. A fresh system prompt. Fresh tool budget.

You write a subagent when you genuinely need the isolation. Usually because the parent shouldn't see the noise. Or because the worker needs a restricted tool surface.

If you don't need the isolation... the job can just be the parent agent following a prompt. One LLM. Not two.

---

Let me give you the inverse story too. The subagent that was actually correct.

A few weeks after I deleted `import-organizer`, I had a different problem.

I had a module with — I'm not exaggerating — over two hundred files. Imports from a deprecated component directory. *Every* component import in that module pointed at a deprecated path. The codebase had a hook blocking new imports from that path. But the existing ones were grandfathered.

I needed to swap every one of them.

Two hundred files. Multiple imports per file. Some of them needed prop renaming. Some had been wrapped in higher-order components that no longer existed in the new module. Every file needed to be opened. Read. Edited. Run through typecheck.

I thought about writing a prompt.

The prompt would have told the parent agent: *open each file, swap the imports, fix the props, run typecheck.* And the parent would have done it. And the parent's context would have filled up around file forty. And the agent would have lost the thread. And I would have spent the next three hours babysitting.

I wrote a subagent instead.

`deprecated-migrator`. Tools: `Read, Glob, Grep, Edit, Bash`. System prompt: find every file using the deprecated path. Swap to the canonical path. Adjust prop name changes. Run typecheck. Loop until clean or stuck.

I ran it.

Forty-five minutes later, it came back with a report. Two hundred and three files migrated. Typecheck clean. I reviewed the diff in fifteen minutes. Merged it.

[short pause]

That was a subagent's job.

Not because it required deep reasoning. But because it required *its own context window*. The parent could not have held two hundred files in its head. The subagent didn't have to — it loaded ten at a time. Made the edits. Moved on.

Isolated attention. That's what subagents are for.

The `import-organizer` was the wrong job for a subagent. The `deprecated-migrator` was exactly the right job.

The artifact shape is the same. The fit is what differs.

---

[short pause]

I think the broader lesson — the one I want to leave you with — is something like this.

The mistake we make, when we get excited about a new layer in the stack... is treating that layer as a hammer. And looking for nails.

New subagent system? Suddenly every recurring task feels like it deserves a subagent.

New skills system? Suddenly we want a slash command for everything.

New hook system? You'll write a hook for the same rule you've already put in `CLAUDE.md`, and in a path-scoped rule, and in a task prompt — four layers deep — and the only one actually catching anything... is the hook.

[short pause]

The discipline is: pick the *lightest* layer that catches the rule.

If `CLAUDE.md` catches it ninety percent of the time, that might be enough. If it's not — add the hook. But don't also write a subagent for the same rule. If a regular dev tool catches it for free, that's the right layer.

The agent stack is a series of layers of increasing cost and capability. And your job is to land each rule... on the cheapest layer that holds it.

Five categories. Four questions. One Prettier config that should not be a subagent.

That's the field guide.

Memorize the categories. Ask the four questions before you commit any new file in `.claude/`. And give yourself permission to delete the things that aren't earning their tokens.

The `import-organizer` deletion was the best commit I made that month.

---

I want to close on this.

The way you tell whether someone's agent-ready repo is mature... is not by counting how many subagents are in it.

It's by looking at what each one does. And asking — could a hook have done this? Could a prompt have done this? Could *Prettier* have done this?

A mature setup is not the one with the most artifacts.

It's the one where every artifact is in the right place. Where the hooks do hook things. The subagents do subagent things. The prompts do prompt things. And there is no `import-organizer` quietly burning money in the background... while Prettier is already installed.

[short pause]

If you want the longer, written version of the `import-organizer` story — the four questions, the deletion, the minus-one-hundred-and-forty-lines commit — I wrote it up on the site. It's called *The Subagent I Deleted*. Same arc, with the actual config snippets.

[short pause]

That wraps the first three episodes.

Prompt, hook, subagent, skill — the four-trigger model. Static and dynamic — the line between prompts and subagents. And today, the taxonomy — five categories. Four questions. When not to delegate.

Build the artifacts. Pick the right layer. Delete the ones that don't earn their keep.

The rule lives in the repo. Not in your head.

I'm Prakash. From Kathmandu.

This was Greenfield. Talk soon.
