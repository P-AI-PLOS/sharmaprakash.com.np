---
draft: true
title: "From Prompts to Harnesses: How AI Coding Became a System"
date: "2026-09-05T16:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Prompt engineering shapes a request. Context engineering supplies the evidence. Harness engineering makes the coding assistant's work loop useful, bounded, and verifiable."
cover: "/images/blog/ai/from-prompts-to-harness-engineering.png"
thumb: "/images/blog/ai/from-prompts-to-harness-engineering.png"
use_featured_image: true
---

You ask your coding assistant to fix invoice permissions. It searches the repository, reads the policy, edits a method, runs a test, sees a failure, changes the patch, and returns a summary. We often describe all of that as “the AI.” But a model call alone does not perform that whole sequence.

Something has to assemble the request, expose tools, execute permitted actions, return their results, and decide when to continue. That surrounding system is an **[agent harness](/ai/glossary/#agent-harness)**. Naming it makes a practical difference: a model can produce a sensible next step while the overall assistant still fails because it cannot find the right file, run the application, or recognize unfinished work.

This is a companion to [Running AI Yourself](/series/running-ai-yourself/) and [Choosing Your AI Stack](/series/ai-stack/). The former explains the machine underneath model calls. Here we follow the same invoice repository through the software around those calls. Linked terminology has short definitions in the [AI glossary](/ai/glossary/).

## From completing code to completing work

The evolution is easier to understand as expanding responsibility than as a procession of obsolete buzzwords.

GitHub introduced the Copilot technical preview in June 2021 as an editor assistant capable of suggesting code from the surrounding context. Its announcement identified OpenAI Codex as the underlying model. That historical model name should not be confused with every capability of today's Codex coding products. The useful unit of interaction was a suggestion that a developer could inspect and accept. [GitHub's original announcement](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/)

In our repository, that might mean completing an invoice policy method after you write its name and a comment. You still locate the method, understand the authorization rules, run the tests, and decide whether the suggestion is correct.

Conversational interfaces expand the interaction. You can ask why the policy behaves a certain way, supply an error, and revise the request. The developer may still be the bridge between the conversation and the actual repository: copying code in, applying a patch, running a command, then pasting the result back.

Tool-using agents move some of that bridging into software. Anthropic distinguishes predefined workflows from agents whose model directs the next steps and tool use dynamically. Both patterns can be useful; autonomy is a design choice, not a requirement for every task. [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)

Now the assistant can discover that the controller delegates to a policy, inspect the policy, and request a test run. The developer's work shifts toward defining the task, shaping the environment, setting boundaries, and reviewing evidence. Completion, conversation, and agentic work remain useful together. A small inline suggestion does not need an elaborate autonomous loop.

## Three layers that deserve different names

The **model** transforms supplied context into output. It can produce an explanation, code, or a structured request to use a tool. Generating a tool request is different from executing the requested operation.

The **[inference server](/ai/glossary/#inference-server)** accepts model requests and returns outputs, using a serving engine to execute and schedule computation. This is where weights, prefill, decode, batching, and KV memory enter the picture. A hosted API hides much of this machinery; a local deployment makes it visible.

The **harness** coordinates the coding task around those requests. It prepares context, dispatches allowed tools, handles their results, and maintains the work loop. Anthropic explicitly describes Claude Code as an agent harness in its evaluation terminology. OpenAI's harness-engineering case study describes the surrounding environment used with Codex. These are useful examples of the layer, not a promise that different products implement it identically. [Anthropic's terminology](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents), [OpenAI's case study](https://openai.com/index/harness-engineering/)

<figure>
<img src="/images/blog/running-ai-yourself/harness.svg" alt="A user task enters a harness. The harness exchanges requests with an inference server and model, and actions with tools in a workspace. Tool results return to the harness before its next model request." loading="lazy" width="480" height="540" />
<figcaption>The model call sits inside the work loop. Tool execution and model inference can run on different machines.</figcaption>
</figure>

A harness on your laptop can call a hosted model while running tests locally. Another setup can send model requests to a homelab server while its tools operate in an isolated workspace elsewhere. “Local AI” therefore needs a more precise question: which of the model, harness, workspace, and stored session state is local?

Buying more GPU memory changes the inference layer. It does not automatically give the harness better repository search, a working test environment, or permission to use a tool.

## Prompt engineering: make the request assessable

**[Prompt engineering](/ai/glossary/#prompt-engineering)** is the work of shaping instructions and examples to elicit useful behavior. It still matters inside an agent. A vague objective gives the system little basis for choosing a correct next action.

Compare “fix invoice permissions” with this request:

> In this example project, members can currently edit invoices belonging to another organization. Find the authorization path, preserve editing within a member's own organization, and add a regression test for the cross-organization case. Explain what you changed and which checks actually ran.

This example supplies the intended behavior, a failure case, a constraint, and evidence expected at the end. It does not prescribe an implementation before the repository has been inspected.

The prompt also exposes an ambiguity worth resolving: do administrators have an exception? If the existing requirements do not answer that, guessing is a product decision disguised as code generation. A good assistant can surface the missing rule while still investigating the established behavior.

Longer is not automatically better. Repeating “be careful” adds less useful information than a concrete example of who may edit which invoice. Contradictory instructions can make a large prompt harder to follow than a short one with clear priorities.

## Context engineering: provide the evidence for this step

**[Context engineering](/ai/glossary/#context-engineering)** concerns what reaches the model at a particular moment: instructions, relevant code, tool descriptions, conversation state, and observed results. Here the term describes a practical responsibility, not a universally standardized job title.

For the invoice task, the useful context may include the policy, its caller, membership relationships, and nearby tests. The whole repository is not necessarily a better input. Generated files, obsolete examples, and unrelated logs can obscure the facts that determine the patch.

Context also changes as work progresses. Before editing, the assistant needs to understand the authorization path. After running a test, it needs the actual failure and enough code to interpret it. A summary saying “tests failed” loses the distinction between a behavioral failure and a missing database service.

A context window is a capacity limit, not a guarantee that every included fact will be used correctly. Retrieval must find relevant material; summaries must preserve important constraints; stale observations need refreshing after edits.

This connects directly to [prompt caching for coding agents](/ai/caching-for-coding-agents/). Stable instructions and tool definitions can form a reusable prefix while changing evidence arrives later. But preserving a cache hit is subordinate to providing correct context. Keeping an outdated policy in the request to avoid recomputation would optimize the wrong outcome.

## Harness engineering: make useful action repeatable

**[Harness engineering](/ai/glossary/#harness-engineering)** is the work of designing and improving the environment and control loop around the model. A useful harness gives an assistant ways to discover facts, take bounded actions, observe consequences, recover from ordinary failures, and stop with an accurate account of the result.

For our example, that includes a search tool that can locate the policy, file operations that report failures, and a test command with a usable environment. It also includes deciding how command timeouts are handled and how much output returns to the next model call.

Permissions belong in this discussion because instructions and enforcement do different jobs. A repository instruction saying “do not deploy” communicates intent. A tool permission boundary or environment without deployment credentials can enforce a limit. An `AGENTS.md` file alone does not mechanically prevent an operation.

OpenAI's February 2026 account emphasizes making a repository and its operating environment legible to agents, including structured documentation and executable architectural checks. Its lesson for this example is concrete: make the correct test discoverable and the relevant constraints checkable, instead of repeatedly describing the same failure in chat. The report is one team's experience, not a universal productivity forecast. [Harness engineering](https://openai.com/index/harness-engineering/)

Long-running work introduces continuity. Anthropic describes using initialization and progress artifacts to help later sessions resume an application-building task. For our repository, a useful handoff records the current finding, changed files, checks completed, and unresolved behavior. A new session still needs to inspect current files: a handoff is evidence about prior work, not proof that the workspace has remained unchanged. [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

## A worked example: diagnose the layer before changing it

Suppose the assistant returns a patch that blocks every invoice edit. This is an illustrative scenario, not a measured comparison between products.

| Observation | Likely question to investigate | Useful change |
| --- | --- | --- |
| The request never said legitimate edits must remain possible | Was the desired behavior clear? | Add the allowed and denied cases to the task |
| The assistant saw the controller but missed the policy | Was relevant context available? | Improve discovery and supply the authorization path |
| It requested tests, but the command could not start | Could the harness observe behavior? | Fix the test environment and report command failures distinctly |
| It saw a failing test but still declared success | Did the work loop enforce its completion criteria? | Require evidence for completion and surface unresolved failures |
| Every operation was available with production credentials | Were action boundaries adequate? | Constrain the tool environment to the intended workspace |

These are diagnostic hypotheses. Inspect the trace and resulting files before deciding which explanation applies. A model reasoning error can remain even when the surrounding system works correctly.

The useful result is a patch that preserves the allowed case, rejects the forbidden case, and comes with checks someone can inspect. A confident final paragraph is insufficient. The harness should distinguish “command requested,” “command completed,” and “behavior verified.”

It should also stop appropriately. A retry after a transient tool failure may help; an endless retry against missing credentials does not. If a requirement is unresolved, the useful output is the concrete question and the investigation already completed.

## Measure the whole task, not just the token stream

The inference series separates time to first token from generation speed. A coding task adds repository search, commands, test execution, repeated model calls, and human review. Faster decoding can coexist with slower task completion if the assistant makes unnecessary edits and spends the rest of the session repairing them.

An **[evaluation harness](/ai/glossary/#evaluation-harness)** is a separate use of the word: infrastructure that runs tasks, records attempts, and grades outcomes. It can evaluate an agent harness together with its model. Anthropic's evaluation guide stresses the difference between the recorded interaction and the actual final state. For coding, both the patch and evidence of its behavior matter. [Demystifying evaluations](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)

Keep task success, unintended changes, elapsed completion time, model usage, and tool failures alongside inference metrics. An assistant that finishes a correct bounded change deserves a different assessment from one that produces an attractive explanation without modifying the right code.

## Optional experiment: change one part of the system

Use a disposable copy of a small repository with a known invoice-permission defect and a working test environment. Define the allowed and forbidden behavior before running the assistant.

Keep the model and task fixed. Compare a plain request with a request containing explicit acceptance cases. Then keep that improved request and supply a concise repository map. Finally, compare environments where the assistant can and cannot execute the relevant tests. Treat these as separate comparisons; changing everything at once cannot identify the cause of improvement.

Start each attempt from the same repository state. Repeat attempts because generated behavior varies. Record the resulting diff, test outcomes, tool errors, total task time, and model usage. Record cache state if comparing latency. Label collected results **our measurement**, with the setup and limitations; this article reports no such run.

The goal is to find the missing support for this workload. Sometimes the task needs a clearer request. Sometimes the agent needs the actual error output. Sometimes the environment needs a runnable test. Understanding those differences makes both hosted coding tools and a local inference stack easier to improve.
