---
draft: true
title: "Stop Reprocessing the Same Prompt: Caching for Coding Agents"
date: "2026-09-05T10:03:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Arrange stable repository context for reuse, compare provider cache controls, and distinguish API savings from coding-assistant subscription behavior."
cover: "/images/blog/ai/caching-for-coding-agents.png"
thumb: "/images/blog/ai/caching-for-coding-agents.png"
use_featured_image: true
series: running-ai-yourself
seriesOrder: 4
---

The first question asked where invoice editing is authorized. The next asks which tests cover that policy. Then a colleague wants to know whether a background job follows the same rule. Each request needs much of the same repository context.

An assistant that repeatedly sends that material can create substantial repeated work. [Prompt caching](/ai/glossary/#prefix-caching) lets a serving system reuse eligible computation for a matching beginning of a request. It is especially relevant to coding agents because instructions, tool descriptions, and source excerpts can dwarf the latest question.

The benefit depends on what remains stable, which cache interface the provider exposes, and whether the request reaches usable retained state. This is not answer caching: a hit does not return yesterday's explanation in place of generating a new one.

Provider details below were checked against the linked documentation on September 5, 2026. Treat the numerical interface rules as **source-reported specifications**, not measured performance. The worked request and cost examples are **illustrative calculations**. No paid requests were run for this article.

New to the terminology? Use the [AI glossary](/ai/glossary/). Linked terms also show a definition on hover or keyboard focus.

The **[agent harness](/ai/glossary/#agent-harness)** assembles these requests and manages tool results between calls. The inference server processes them. [From Prompts to Harnesses](/ai/from-prompts-to-harness-engineering/) explains that surrounding work loop and how prompt, context, and harness engineering fit together.

## Build a repeatable beginning

Suppose we are writing the API client ourselves. A useful conceptual order is stable instructions, a stable tool catalog, a repository snapshot, prior conversation, and the new request. Providers serialize roles and tools according to their own rules, so this diagram describes stability rather than a promise about raw wire order.

<ai-diagram data-diagram="requests">
<img src="/images/blog/running-ai-yourself/requests.svg" alt="Instructions, tools and the repository form a shared beginning; independent questions branch after that prefix." loading="lazy" />
<p>Instructions, tools and the repository form a shared beginning; independent questions branch after that prefix.</p>
</ai-diagram>

For an **illustrative example**, assume the shared instructions, tools, and repository total 12,000 tokens, and each independent question adds 500. Across three independent questions, uncached prompt processing covers 37,500 tokens. If an engine reuses the entire shared prefix after the first request, newly processed prompt material totals 13,500 tokens. That saves 24,000 tokens of repeated prefill work under these assumptions; it does not remove output generation, cache reads, or billing for those reads.

Watch for the repeated agent context in Hugging Face's explanation. In our example, the important thing to identify is the boundary where the common repository material ends and each request starts to differ.

<figure>
<iframe src="https://www.youtube-nocookie.com/embed/SkM4k4SKvCM?controls=1" title="Hugging Face: Prompt Caching Explained: Stop Overpaying for AI Agents" loading="lazy" style="width:100%;aspect-ratio:16/9;border:0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
<figcaption><a href="https://www.youtube.com/watch?v=SkM4k4SKvCM">Watch Prompt Caching Explained: Stop Overpaying for AI Agents on YouTube</a>.</figcaption>
</figure>

The application lesson is to make stable context reproducible. Do not change instruction wording, tool order, or repository serialization without a reason. Equally, do not keep stale source code merely to preserve a hit. Correct context is the purpose of the request; caching is an optimization of that request.

The video illustrates an agent session and cache misses after expiry or prompt changes. Its provider-default discussion is not a current interface reference: automatic caching options now differ from some examples in the recording. Use the checked documentation below for those settings.

## Compare interfaces, not just discount headlines

The table records selected documented API behavior. It intentionally names models where thresholds differ. It is not an exhaustive catalog, and an older SDK may not expose the newest fields.

| Interface | Developer control | Selected source-reported limits and charges |
| --- | --- | --- |
| OpenAI Responses, GPT-5.6 and later | Implicit placement or explicit `prompt_cache_breakpoint`; `prompt_cache_options` selects mode and TTL; `prompt_cache_key` assists routing | Minimum 1,024 visible input tokens; `30m` TTL; writes 1.25× and reads 0.1× the uncached input rate |
| OpenAI earlier models | Implicit caching; model-specific `prompt_cache_retention` | Documented minimum 2,048 tokens, with some shorter hits possible; no added write charge; retention and read prices vary by model |
| Claude API | Top-level automatic `cache_control`, or block-level explicit breakpoints | Sonnet 4.6 minimum 1,024 tokens; Opus 4.6 minimum 4,096. Default five-minute writes 1.25×; one-hour writes 2×; those models' reads 0.1× |
| Gemini API | Implicit caching; explicit cache resource referenced by later requests | Listed minima include 2,048 tokens for Gemini 2.5 Flash/Pro and 4,096 for Gemini 3.1 Pro Preview. Explicit TTL defaults to one hour; cached input and storage duration are billed |

Sources: [OpenAI prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching), [Claude prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), [Gemini context caching](https://ai.google.dev/gemini-api/docs/caching), and [Gemini's Generate Content explicit-cache interface](https://ai.google.dev/gemini-api/docs/generate-content/caching).

For OpenAI's newer explicit mode, mark a supported input content block and inspect response usage; selecting explicit-only mode without breakpoints creates no cache writes. Earlier-model settings are not interchangeable with that interface. The [OpenAI guide](https://developers.openai.com/api/docs/guides/prompt-caching) documents both generations.

Claude's automatic control moves the caching boundary as the conversation grows; explicit block markers let an API developer identify boundaries deliberately. Lifetime and minimum length still apply. The [Claude guide](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) also documents pricing exceptions for other models, so the selected table rows should not be treated as universal Claude pricing.

Gemini's explicit resource is a different client shape: create cached content, then refer to its name in later requests. Its storage charge makes expected reuse and retention duration part of the cost calculation. Implicit hits are opportunistic. The [Generate Content documentation](https://ai.google.dev/gemini-api/docs/generate-content/caching) contains the resource lifecycle examples; it is a distinct interface from assuming every API has the same cache fields.

## A breakpoint is a boundary, not a bag of files

For our repository snapshot, placing a cache marker after the source excerpts expresses an eligible prefix ending there. It does not instruct the provider to cache every file independently and reassemble arbitrary combinations without processing.

If an early instruction changes, the later context may no longer match the previous prefix even when the invoice file itself is unchanged. If only the latest question changes, the stable beginning remains a candidate. [Part five](/ai/prefix-caching-chunked-prefill/) explains why preceding context is part of the identity.

A practical client can serialize files deterministically: fixed ordering, explicit paths, predictable delimiters, and actual content. Keep volatile metadata out of the beginning when it is not semantically required there. For example, a request ID belongs in application telemetry rather than being pasted before every repository snapshot.

But do not sort tool results or conversation turns arbitrarily to chase hits. Their order may carry meaning. Stability should come from a consistent representation of the real task, not rearranging evidence until the cache counter looks better.

## Savings need a workload, not a percentage

Here is a provider-independent **illustrative cost calculation**. Assume uncached input costs one abstract unit per token, a cache write costs 1.25 units, and a cache read costs 0.1 units. These are assumed rates for the arithmetic, not a quoted bill.

Use the earlier 12,000-token prefix with a new 500-token suffix for each request. Assume ten requests, a single prefix write, nine complete hits, no expiration, and uncached suffixes. Ignore output because it is unchanged between the compared scenarios.

```text
Without reuse:
10 × (12,000 + 500) = 125,000 cost units

With reuse:
12,000 × 1.25          = 15,000  prefix write
9 × 12,000 × 0.1       = 10,800  prefix reads
10 × 500              =  5,000  changing suffixes
Total                 = 30,800 cost units
```

The illustrative reduction is 75.36% of input cost. It is not a reduction of the entire agent bill. Output, tool charges, storage where applicable, failed requests, and cache misses can change the result. If the prefix is used once, the assumed write premium makes it more expensive than simply processing it once.

This suggests an operational question: how often is each prefix reused within its effective lifetime? A huge snapshot updated on every request may perform worse economically than a smaller stable core plus current task material. The right answer depends on the workload's actual reuse, not merely the maximum advertised discount.

## What Codex and Claude Code users control

An API developer can construct payloads and choose exposed cache controls. A person using a coding assistant often controls project instructions, enabled tools, selected files, and conversation actions, while the client constructs the requests internally.

Claude Code documents automatic cache management and explains how model switches and compaction affect subsequent reuse. Its cache statistics can help distinguish normal rebuilding from persistent misses. Those are documented client behaviors, not settings you need to reinvent as API payload annotations. [Claude Code's prompt-caching guide](https://code.claude.com/docs/en/prompt-caching).

For Codex, the provider's API guide is not proof that a particular installed client exposes every API field as a user setting. Without verifying that client's implementation and documentation, do not invent a configuration option to force breakpoints or a retention period. Inspect available usage reporting and keep claims limited to what the client actually exposes.

The productive habits are straightforward: provide concise durable instructions, avoid irrelevant context, and preserve a useful conversation when following up on the same work. Restart or compact when the task needs it, accepting that context changes may incur fresh processing. Keeping a confused or outdated conversation alive solely to retain a cache hit is poor engineering.

Subscription accounting is separate. A lower API-equivalent token cost does not imply that a flat monthly subscription invoice shrinks by the same percentage. Nor does an API cache discount establish a subscription's message limits or included usage. [Choosing Your AI Stack](/series/ai-stack/) addresses access and pricing choices; the caching mechanism does not replace those terms.

## Cache state is not shared knowledge

When a colleague asks about the same invoice repository, reuse is possible only if the provider's isolation, routing, model identity, and matching rules allow it. Never assume another account's cache is available, and never place confidential material in a common prompt just to increase sharing.

Even within one service, a cache key is not authorization. The application must decide who may receive repository material before constructing or referencing cached context. A retained prefix should have an owner, an appropriate lifetime, and a way to stop using stale revisions.

Version the repository snapshot in your application metadata. When its content changes, create the new context honestly and expect corresponding misses. This makes an unexpected answer easier to debug than relying on an opaque “warm” label.

## Optional experiment: observe reuse without guessing

Use a non-sensitive excerpt and an existing authorized endpoint. First send the stable prefix with question A, then with question B. Next change an early instruction and repeat. Keep the model and other settings fixed, and let the first request establish its cache before testing sequential reuse.

Record time to first token, generated-token speed, total completion time, token usage, cache read/write counters, and memory where you control the server. Record retention settings and elapsed time between requests. Mark unavailable hosted memory statistics as unavailable rather than estimating them from cost.

Compare actual charges using the selected model's documented rates. Label the resulting observations **our measurement**. A quicker second answer alone is not evidence of a cache hit: queueing, output length, and backend load also vary.

Finally, check the answer still identifies the right invoice authorization rule after the prefix changes. Caching succeeds when it avoids repeating valid work. Next we separate that reuse from another optimization with a confusingly similar name: [chunked prefill](/ai/prefix-caching-chunked-prefill/).
