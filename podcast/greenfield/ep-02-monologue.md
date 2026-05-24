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
title: "Episode 2 — Static and Dynamic: When Each Wins"
duration_target_minutes: 12
excerpt: "Prompts and subagents look similar from a distance — both are markdown files, both shape how the agent works. They are not the same tool. One is static, one is dynamic, and the line between them is sharper than people realize. A story about a 900-line prompt that paid for itself and a subagent that didn't."
---

There's a prompt in one of my repos... that's nine hundred lines long.

Nine. Hundred. Lines.

I remember the moment I finished writing it. Sitting at my desk in Kathmandu. Leaning back. Looking at this enormous markdown file. Thinking: *no one is going to read this.*

Not me. Not the next person who joins the team. Certainly not the agent.

Nine hundred lines. Twenty-one numbered rules. Three reference implementations. A verification checklist with thirty-eight items.

I shipped it anyway.

And the next morning, I gave the agent a scope — *migrate the Customers list page* — and a pointer at the prompt. And I watched it produce, in about twenty minutes... a working list page that passed typecheck on the first try.

Twenty minutes.

The previous migration on the same codebase — done with no prompt, and lots of chat back-and-forth — had taken me two hours. Two hours. By hand. With me steering.

The prompt did it in twenty minutes. With me getting coffee.

[short pause]

That's when I understood what a prompt actually is.

And — more importantly — what it isn't.

---

Hey. I'm Prakash. This is Greenfield. Episode two.

[short pause]

Last episode I laid out the four-trigger model. Prompts. Hooks. Subagents. Skills.

Today, I want to zoom in on just two of those four — because the line between them is, I think, the sharpest and most misunderstood line in this whole conversation.

Prompts. And subagents.

They look similar from a distance. Both are markdown files. Both shape how the agent works. Both live in your repo. Both get versioned in git. Both feel like *configuration*.

They are not the same tool. They are not interchangeable.

And the cost of treating them as interchangeable is, in my experience... the single most common way teams end up with an agentic setup that costs money but doesn't deliver.

[short pause]

Let me draw the line.

---

A prompt is **static**.

It's a document. The agent reads it. Nothing happens to the document. The document doesn't think. The document doesn't decide. The document is — and I mean this as a compliment — a piece of paper.

A really, really detailed piece of paper.

When you point the agent at a prompt, you are saying: *here are the rules. Apply them. Verbatim. To the work in front of you.* The agent does the thinking. The prompt is the constraint.

A subagent is **dynamic**.

It's a process. The parent agent delegates to it. The subagent gets a fresh context window. Runs its own tools. Reads files. Forms an opinion. Returns a report.

The subagent *thinks*. The subagent costs tokens. The subagent can come back with different answers on different runs.

[short pause]

Static. And dynamic.

Page. Versus process.

Rules. Versus reasoning.

That's the line.

And here's why it matters.

---

The mistake I see most often... is teams reaching for a subagent when a prompt would do.

Picture it.

The team has decided their list pages need to follow a specific architecture. So someone — usually the most enthusiastic person on the team — writes a subagent called `list-page-builder`. The subagent's system prompt is, essentially: *"build a list page following our conventions."*

You invoke it. It runs. It produces a list page.

It works! Mostly. Sometimes. The first time.

The fifth time... the agent has drifted. Maybe it picked up a slightly different convention from a file it happened to grep. Maybe the model is just having an off day.

Output varies. Output costs tokens. Output requires review.

The same job — done by a prompt — would have been deterministic.

The prompt is twenty-one rules. The rules don't have a bad day. The rules say: *folder name matches the exported component name. Always. Here is the ASCII tree.* The agent that reads the prompt and writes the list page is doing essentially the same work every time. Because the work is mostly mechanical. And the prompt has nailed down the mechanical parts.

The rule for when a prompt wins:

**When the work is mostly mechanical. And consistency matters more than judgement.**

Eighty-fifteen, roughly. Eighty-five percent of the lines are predictable from the pattern. Fifteen percent require domain knowledge — which Zod schema, which API endpoint, which column definitions.

The prompt handles the eighty-five. The agent's intelligence handles the fifteen. You get consistency and good judgement at the same time.

That's the trade. Prompts give you determinism — in exchange for upfront writing effort.

[short pause]

A nine-hundred-line prompt is not over-engineered.

A nine-hundred-line prompt is a one-time investment that runs every time someone does the task. The first migration pays the writing cost. The second migration is free. The tenth migration is free.

By the fiftieth migration... you have rewritten the economics of that whole class of work.

I have seen a single well-written prompt save more engineering hours than entire AI features I've shipped. I'm not exaggerating.

It is not the glamorous part of this job. It is the part that pays.

---

Now. The other direction.

When does a subagent win? When does a prompt fail?

The subagent wins the moment the work needs *reading and forming an opinion*. Not pattern-matching to rules. Reading code. Holding several files in mind at once. And concluding something.

Type-safety auditing is the classic example.

You can't write a rule that says *"don't use `any` unless it's necessary."* What does "necessary" mean? It's a judgement call. It depends on the surrounding code. The upstream type. Whether there's a reasonable narrower alternative.

A grep finds the `any`. A grep cannot tell you whether the `any` is okay.

A subagent can.

You give it a scope — *scan this module* — and a list of things to look for, and a pinned output format. It reads thirty files. Holds them in context. Decides which `any` uses are real findings, and which are noise. It produces a report. File paths. Line numbers. Suggested fixes. Ranked by impact.

That's not a job for a prompt. That's not a job for a hook. That is, specifically and exactly... the job a subagent is shaped for.

[short pause]

The other thing subagents are uniquely good at — **isolated context**.

The subagent reads thirty files. The parent sees only the report. You preserve the parent's context window for the actual user-facing work.

Without subagents, every audit pollutes the main thread with thirty file reads and the agent's working notes. And pretty soon... the parent has no room left to think.

Subagents are how you keep the main conversation small.

---

So. The test.

If the question can be answered by *applying rules* — write a prompt. If the question requires *reading code and reasoning* — write a subagent.

If the work is mechanical with a handful of judgement calls — write a prompt.

If the work is a judgement call from start to finish — write a subagent.

If the same person could do it from a checklist — write a prompt.

If the same person needs to read the code first, and then think — write a subagent.

[short pause]

I keep this rule in my head when I'm tempted to write the wrong one.

Because I have written the wrong one. More than once.

I wrote a subagent for a job that was actually a prompt. Ran it for a month. Watched it cost real money in tokens. And finally rewrote the subagent's system prompt as a docs-folder prompt — and the work got more consistent... and cheaper... at the same time.

Going the other direction is rarer. But also a trap.

I once wrote a prompt for a code-review task. *Here are the conventions. Here is what good code looks like. Please review this diff.*

It failed.

Because code review is not the application of rules. It's the reading of code with rules in mind. The agent followed the prompt and produced very confident, very generic reviews that missed the actual problems.

The job was a subagent's job. I rewrote it as a subagent. And the next review... caught three real bugs that had slipped past me.

---

There's a deeper version of this distinction that I think is worth landing on.

Prompts compress *knowledge*.

Subagents compress *attention*.

[short pause]

When you write a prompt, you're taking the knowledge that lived in your head — *here is how we do list pages* — and you're crystallizing it into a document. The document is the knowledge. The agent borrows the knowledge to do the work.

When you write a subagent, you're taking your *attention*. The act of focusing on one specific aspect of code. Looking only at type safety. Or only at re-render patterns. Or only at security. And you're delegating that attention to a worker.

The subagent isn't smarter than the parent agent. The subagent is just looking at one thing.

This is why the cost equations are different.

Knowledge, once written, is free to reapply. Attention, every time, costs the tokens to look.

That's why prompts amortize beautifully. And subagents stay expensive.

It's not an implementation detail. It's the nature of what each one is.

---

If you're starting out — if you have one repo, one team, and you're trying to figure out where to invest first — write the prompts.

Always.

Prompts are the cheaper investment. Prompts are the higher leverage. Prompts are the layer that turns repetitive work from "creative writing" into "filling in a form." And that's where most engineering time actually goes.

Write your first list-page prompt this afternoon.

Do the task once by hand. Cleanly. Codify what you did. Hand it to the agent. Watch what breaks. Fix the prompt. Run it again.

Within a week, you'll have two or three prompts covering the patterns you do most. Within a month, the team is faster than it has ever been... and you are doing none of the boring parts.

The subagents can come later.

The subagents are the layer that wins when you've already automated the mechanical work and you're starting to feel the next bottleneck — the *review* bottleneck. The *audit* bottleneck. That bottleneck shows up around month three of a serious agentic setup.

When you feel it — write the subagent. Until then, the answer is almost always... the prompt.

---

[short pause]

Next episode... I want to tell you about the subagent I wrote and then deleted.

Because the lesson there is the inverse of this one. When *not* to reach for a subagent. And the broader thing it taught me — about the taxonomy of these little agent-side artifacts piling up in our repos.

I'm Prakash. From Kathmandu.

This was Greenfield. Talk soon.
