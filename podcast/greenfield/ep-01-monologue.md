---
voice:
  name: Prakash
  id: 7a94qxTnWOxNUMLOxXGR
voice_settings:
  stability: 0.7
  similarity_boost: 0.85
  style: 0.25
  use_speaker_boost: true
model: eleven_v3
title: "Episode 1 — The Rule Lives in Your Head"
duration_target_minutes: 14
excerpt: "Why the corrections you give your coding agent keep evaporating — and the four places a rule can live so that it stops. A story about barrel imports, a UUID that broke staging, and the moment I stopped trusting my own memory as infrastructure."
---

It's a Tuesday afternoon. I'm reviewing a pull request from my own agent... and there it is again.

Line forty-two.

`import Button from 'components/atoms'`.

A barrel import. The third time this week.

[sighs]

I'd told it. I'd told it on Monday. I'd told it on the Friday before. I'd written it in `CLAUDE.md` — *no barrel imports, use the specific path* — in bold, with an example, with a counter-example, with a little ASCII arrow pointing at the right shape.

And here we are again. Line forty-two. Same import. Same agent. Same correction I'd typed... maybe forty times that month, if you counted across every session and every teammate.

That was the moment, I think.

The moment I stopped pretending the problem was the model.

---

Hey. I'm Prakash. This is Greenfield — engineering, AI, the businesses we build from scratch. Broadcasting from Kathmandu. And this is episode one.

[short pause]

I want to talk about a small, specific, annoying thing... and then I want to talk about the much larger thing it's actually a symptom of.

The small thing is this: corrections to your coding agent decay. They don't stick.

You tell it on Monday. It forgets by Wednesday. By Friday, you're typing the same sentence into the same chat window, watching the same diff come back wrong... in the same way.

The larger thing is this: the rule lives in your head.

And your head... is the worst possible place for a rule to live. Your head goes home at night. Your head has a Slack notification halfway through the thought. Your head, frankly, forgets things.

Your head was never meant to be infrastructure.

[short pause]

So this episode is about the four places a rule can live so it stops decaying. I call it the four-trigger model — not because it's a framework I'm trying to sell you, but because once you see it laid out... you cannot un-see it.

Four triggers. Four artifacts. One repo.

But first — let me tell you why the barrel import thing actually matters. Because if it sounds petty... *who cares, it's a barrel import*... you're missing the shape.

---

Here's the shape.

Every codebase I've worked in for the last decade has had this dynamic — a small number of rules that everyone on the team agrees on... that nobody on the team consistently follows.

Use the named export, not the default. Don't import from the deprecated directory. Don't use the browser's built-in UUID call — because we ship to enterprise customers on Safari builds older than my niece, and it's undefined in non-secure contexts, and the page just... silently breaks.

That last one. The UUID one. That actually happened.

Production. Staging environment. Older Safari.

The agent wrote it because every blog post on the internet says that's the modern, correct way to make a UUID. The agent was, in some narrow sense, right. The agent was also wrong — because the codebase has a constraint the internet doesn't know about. We use the `uuid` package. There's a note in `CLAUDE.md`. The agent read it once... and forgot it.

This is the thing.

Most of the rules in a real codebase contradict what the model learned from public code. Not because your codebase is weird — well, maybe a little — but because every codebase has its own history. Its own incidents. Its own *reasons*.

A rule like "use the uuid package" is a fossil. A fossil of a specific bug, from a specific Tuesday, in some specific quarter. And the model has no access to that fossil.

So when you correct the agent in chat — you're transferring a fossil from your head into the conversation. And then... the conversation ends. The session compacts. The teammate switches branches.

The fossil evaporates.

[short pause]

This is why corrections decay. Not because the model is bad. Because the medium is wrong.

---

Okay. So if the chat window is the wrong medium... what's the right one?

This is where the four-trigger model comes in. Four places a rule can live. Each one fires at a different moment in the agent's lifecycle. Each one is good at a different kind of rule.

Let me walk you through them in the order they actually fire — because I think that's the order that makes them stick.

[short pause]

**Trigger one. The prompt.**

This is the simplest. A prompt is a document. A markdown file in your repo, in a folder called `docs/prompts/`.

The agent reads it at the start of a task. It says: *here is how we migrate a list page in this codebase. Step by step. With the rules. With the reference implementation. With the verification checklist.*

A good task prompt is not a vibe document. It's not "follow best practices, write clean code, be respectful of the code." No. It's a numbered list of decisions.

Twenty rules. Each one testable by grep. Each one with a yes example and a no example. Each one with a folder tree drawn in ASCII.

I've seen prompts cut migration time from two hours of back-and-forth down to twenty minutes of pure mechanical work. Eighty percent of UI work is mechanical. Mechanical work is what prompts handle.

You're not writing a poem. You're filling in a form. And the prompt is the form.

So the rule — "no barrel imports" — lives in the prompt. In a numbered rule. With a yes-and-no code block. The agent reads the prompt before it touches a file.

That handles the first read. But the agent still drifts mid-task. Which is why we need...

**Trigger two. The hook.**

A hook is a shell script. It fires at a lifecycle event — before a tool runs, after a tool runs, when the agent stops — and it can block, or allow, what the agent is about to do.

When the agent tries to write `import Button from 'components/atoms'`... the hook reads the diff, greps for the pattern, sees the bare-barrel import, and rejects the write with a message: *no barrel imports. Use the specific path.* The agent gets the rejection. Reads the message. Writes it correctly the second time.

This is the moment everything clicks for me about agentic infrastructure.

Because the hook isn't an LLM. The hook is twenty lines of bash. It's deterministic. It runs in milliseconds. It costs nothing. And it catches the exact failure that the prompt was supposed to prevent... but didn't. Because the prompt is a suggestion. And the hook is a wall.

Same rule. Two layers. The prompt explains *why*. The hook enforces *what*. They're not redundant — they're a belt and suspenders. And you want both.

The UUID thing? Hook. Twelve lines of bash. The agent has not written that call in our repo since the day I wrote that hook.

Not once.

[short pause]

But hooks have a limit. Hooks can only catch what `grep` can catch. Which brings us to...

**Trigger three. The subagent.**

A subagent is a specialist. It's a small markdown file in `.claude/agents/` with a system prompt that says: *you are a read-only type-safety auditor. Scan this module. Look for `any` usage. Missing return types. Untyped API responses. Return a report.*

The parent agent — the one you're chatting with — delegates to it. The subagent runs in its own context window. Reads thirty files. Comes back with a two-hundred-word report.

The parent never had to load those thirty files. The user never had to manage that context.

What hooks can't do... subagents can. Hooks grep. Subagents *reason*.

Is this `any` here actually necessary? Or did the agent give up? A hook can't tell you. A subagent can.

Two of these in production gives you a different kind of repo. A repo where every PR can be reviewed before it's even opened. Where every module can be audited on a weekly cadence... by something that doesn't get tired.

But — and this matters — subagents cost tokens. They're not free like hooks. So you reach for them when the question genuinely needs a brain. Not before.

**Trigger four. The skill.**

The skill is the thin one. The skill is the slash command.

A teammate types `/migrate-list Orders` — and a twelve-line prompt fires. Loading the right doc. Naming the right reference module. Delegating to the right subagent. Finishing with the right validation.

The user typed eight words. The skill did the workflow.

This is the visibility layer. Without skills, your hooks are invisible — they live in `settings.json`. Your subagents are invisible — they live in `.claude/agents/`. Your prompts are invisible — they live in `docs/prompts/`. The new teammate doesn't know any of it exists.

But the new teammate types a slash. The autocompleter pops up. And they see: `/migrate-list`. `/migrate-form`. `/de-barrel`. `/audit-rerenders`.

*Oh*, they think. *That's how we do migrations here.*

The skill is onboarding documentation that runs itself.

---

So that's the four-trigger model.

Prompt. Hook. Subagent. Skill.

Here's why I think you should care about all four — and not just the one that sounds easiest.

Each one catches what the others can't.

The prompt tells the agent the rule... but the agent drifts. The hook enforces the rule... but it can only see patterns. Not intent. The subagent sees intent... but it doesn't fire automatically. The skill fires the workflow on demand... but it doesn't enforce anything on its own.

Pick any one of the four in isolation, and you'll write the same rule into the wrong place.

*I'll just put it in `CLAUDE.md`* — no, the agent drifts.

*I'll just write a hook* — no, the new teammate doesn't know why the hook is blocking them.

*I'll just write a subagent* — no, the subagent only fires when someone remembers to invoke it.

The leverage is in the stack. Each layer covers the seam in the layer below.

---

I want to close on the thing I actually believe. Which is the unglamorous part.

Building this stack is not exciting.

It's not the part of AI engineering that gets you a conference talk. Nobody is going to retweet your shell script that blocks one stray UUID call. Nobody is going to be impressed that you finally got the agent to stop writing barrel imports.

But... the second you build it... your relationship to the agent changes.

You stop being its tutor. You start being its colleague.

You stop typing the same correction forty times a month. You start trusting the diff. You start opening pull requests that the agent wrote and merging them in under three minutes — because the only thing left to look at... is the twenty percent of the work that actually needed your judgement.

That's the prize.

Not "agent does everything." Just — "agent does the eighty percent it's good at. Perfectly. Every time. Because the rules don't live in my head anymore."

The rule lives in the repo. The repo remembers. Your head gets to think about something else.

[short pause]

Next episode — I want to dig into the sharpest line in this model. The line between prompts and subagents. Static and dynamic. When each one wins.

Because I keep seeing teams reach for the wrong one. And the cost of that mistake... is bigger than people realize.

I'm Prakash. From Kathmandu.

This was Greenfield. Talk soon.
