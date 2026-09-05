---
draft: false
title: "Prefix Caching, Chunked Prefill, and the Trouble with Chunks"
date: "2026-09-05T10:04:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Trace shared and changed prompts through cache blocks and scheduling slices, and resolve what people mean by chunked prefixing."
cover: "/images/blog/ai/prefix-caching-chunked-prefill.png"
thumb: "/images/blog/ai/prefix-caching-chunked-prefill.png"
use_featured_image: true
series: running-ai-yourself
seriesOrder: 5
---

Our invoice assistant now serves a small team. One person asks a quick follow-up while another submits a large repository excerpt. Someone suggests enabling “chunked prefixing.” That phrase hides two different ideas and can lead to the wrong experiment.

**[Prefix caching](/ai/glossary/#prefix-caching) reuses prior computation. Chunked prefill schedules prompt processing in smaller pieces. They can work together.** Neither is the same as splitting documents for retrieval, and neither is fully described by an API cache breakpoint.

The distinctions matter because they solve different problems. Reuse can reduce the work required for a repeated repository snapshot. Scheduling can make a new long prompt coexist more fairly with people already receiving answers. Document selection can reduce how much context enters the request in the first place.

This article uses a deliberately small symbolic example. Every block count, token count, and timing scenario is an **illustrative calculation**, not a serving-engine default or a measured result.

New to the terminology? Use the [AI glossary](/ai/glossary/). Linked terms also show a definition on hover or keyboard focus.

## Four meanings of chunk

| Term | What gets divided or marked | Main purpose |
| --- | --- | --- |
| Reusable prefix block | Stored attention state for a contiguous part of an eligible prefix | Avoid repeating computation |
| API cache breakpoint | A boundary in a provider request | Indicate where eligible cached context ends |
| Chunked prefill slice | Prompt tokens scheduled during an execution step | Share accelerator time with other work |
| Retrieval/document chunk | A source passage selected or indexed by the application | Find and supply relevant context |

The boundaries need not line up. A file can span many cache blocks. A prefill slice can cover many files or part of one. A provider breakpoint can sit after a collection of source excerpts. A retrieval chunk may never enter the model request if the search does not select it.

When a performance discussion uses “chunk,” ask what is being divided and who chooses the boundary. That question often reveals whether the proposed setting belongs in the application, API payload, or serving scheduler.

## Trace the first request into a cache

Let the stable instructions and tools be block A, the repository's authorization policy be B, and related invoice code be C. The user's question is D. Real block boundaries follow tokens and implementation rules rather than these tidy semantic categories, but lettered blocks make the dependency visible.

<ai-diagram data-diagram="prefix">
<img src="/images/blog/running-ai-yourself/prefix.svg" alt="Retained A–B–C–D state can supply the A–B–C prefix of a new A–B–C–E request. An earlier edit forces the affected suffix to be processed again." loading="lazy" />
<p>Retained A–B–C–D state can supply the A–B–C prefix of a new A–B–C–E request. An earlier edit forces the affected suffix to be processed again.</p>
</ai-diagram>

Each block represents state computed with its preceding context. For an ordinary causal transformer, the representation at a later position depends on the earlier sequence. A block is therefore more than the text it contains in isolation.

[vLLM's prefix-cache design](https://docs.vllm.ai/en/stable/design/prefix_caching/) uses identities that incorporate the parent block and token content, with additional distinguishing information where needed. Its block management also tracks whether blocks remain referenced. The important lesson for our example is that matching the words in C is insufficient if the context before C changed.

This avoids a tempting but incorrect analogy with a compiler caching an independent file by its content hash. Model attention state is generally contextual. Reusing a source file's old state in an unrelated preceding prompt would not reproduce ordinary full-prompt computation.

## The follow-up can share a beginning

Now a colleague submits an independent question E against the same snapshot:

```text
Existing:      [A][B][C][D]
New request:   [A][B][C][E]
Work:          hit hit hit new
```

Under the example's idealized cache conditions, the server reuses A through C and processes E. D belongs to a different branch and does not need to be included in the colleague's conversation.

If instead we continue the original conversation, its answer and follow-up append after D. More of the earlier sequence may be reusable. This is one reason to distinguish an independent question from a continuation rather than calling both a “second request.”

Cache availability still matters. The right blocks must remain present, the request must reach the right server or cache tier, and the model and relevant configuration must match. “Potential hit” is a more accurate planning label than assuming every repeated prompt is free.

vLLM's [automatic prefix caching overview](https://docs.vllm.ai/en/stable/features/automatic_prefix_caching/) describes reuse of shared prompt computation. It does not eliminate the work of generating new output. Even a very high prompt-hit ratio can coexist with a long answer time when decode dominates.

## An early change alters everything that follows

Change the authorization policy B to B-prime:

```text
Existing:      [A][B ][C][D]
New request:   [A][B'][C][E]
Work:          hit new new new
```

C contains identical source text, but it follows a changed policy. Its previously computed attention state is not automatically valid. This is the point most “cache the repo in chunks” explanations miss.

If the changed text occurs inside a block, the reusable boundary may stop before that block. Real engines also have rules about full versus partial blocks, alignment, and other cache identities. Our letters intentionally omit that implementation detail; they demonstrate the dependency, not an exact hit counter.

This is not a defect to work around by suppressing updates. If the policy changed, the assistant needs the new policy. Reprocessing the affected suffix preserves the intended context. A cache that returned old state regardless of changed predecessors would be fast for the wrong computation.

Ordering stable material early can increase reuse. But the earlier material should be stable because it is genuinely shared, not because you hide relevant task changes from the model.

## Invalidation, eviction, and expiration are different events

After changing B, the old branch may still be usable for requests that legitimately use the old snapshot. It need not be physically deleted just because the new request cannot match it. Here “invalidation” describes loss of eligibility for the new request, not necessarily global destruction of stored bytes.

**[Eviction](/ai/glossary/#eviction)** occurs when the serving system reclaims retained state, often under memory pressure. An identical later prompt then misses because the blocks are gone. **Expiration** concerns a retention policy or lifetime. A provider may stop retaining an entry after its allowed period even without an application edit.

An active generation can also face preemption under resource pressure. Depending on the engine, resuming it may require restoration or recomputation. That is different from discarding an idle reusable prefix, although both can increase latency.

For the invoice service, log enough to distinguish these cases. Repeated misses after repository edits suggest changing identity. Misses after unrelated large requests suggest memory competition. Misses after idle periods suggest lifetime or routing effects. These are hypotheses to test, not conclusions drawn from response speed alone.

## Chunked prefill addresses a scheduling problem

Suppose Alice is receiving an answer token by token when Bob submits a long uncached repository prompt. Processing all of Bob's prefill as one large scheduling unit can delay Alice's next output, depending on the engine.

Chunked prefill lets the scheduler process part of Bob's prompt, make progress on ongoing decodes, and then continue Bob's prompt. It changes when the work runs. Bob's uncached tokens still require processing.

<ai-diagram data-diagram="scheduler">
<img src="/images/blog/running-ai-yourself/scheduler.svg" alt="Chunked prefill lets an ongoing decode progress between pieces of a new prompt. Prefix reuse separately reduces the amount of new prefill work." loading="lazy" />
<p>Chunked prefill lets an ongoing decode progress between pieces of a new prompt. Prefix reuse separately reduces the amount of new prefill work.</p>
</ai-diagram>

Actual engines may batch decode tokens and prefill tokens in the same execution step rather than alternate them as separate boxes. The diagram shows the scheduling intention, not a GPU trace.

The [vLLM optimization guide](https://docs.vllm.ai/en/stable/configuration/optimization/) describes V1 chunked prefill as enabled where possible, prioritizing pending decodes and using the remaining token budget for prefill. Its `max_num_batched_tokens` setting affects that balance. The setting is a scheduling budget, not the model's maximum context window or a reusable-cache block size.

## A worked example of reuse plus scheduling

Consider an **illustrative calculation**: Bob submits 16,384 prompt tokens, of which 12,288 form a retained matching prefix. Only 4,096 prompt tokens need fresh processing in this simplified example.

If a hypothetical scheduler could give that prefill 1,024 new tokens per step, it would need four prefill slices rather than sixteen for a completely cold request. These are invented slice sizes; actual available budget can vary each step because Alice and other active requests consume resources too.

There are two distinct improvements here. Prefix reuse removed 12,288 tokens of repeated prompt computation. Chunking divided the remaining work into scheduling opportunities. Turning on chunking without a hit would still require all sixteen illustrative slices.

Smaller slices can help protect ongoing response cadence but may increase overhead or delay the new request's first token. Larger slices can improve progress on the incoming prompt while occupying more of a scheduling step. The best setting depends on latency goals, arrival patterns, and the hardware. There is no universally optimal “chunk size.”

A fair benchmark therefore measures Alice's inter-token delays as well as Bob's time to first token. Reporting only aggregate throughput can hide a bad interactive experience.

## Document chunking happens before these decisions

Our assistant might search the repository and select only the invoice controller and policy tests. That application-level selection changes the input. It can reduce prefill and memory use whether or not prefix caching exists.

Splitting the repository into searchable passages is useful for retrieval, but it does not automatically produce reusable KV blocks. Selected passages still acquire model state in the context and order in which the request supplies them.

A system designed for more advanced context reuse may have specialized techniques beyond ordinary prefix matching. Those require their own correctness assumptions and implementation evidence. Do not silently apply that promise to a conventional prefix cache.

For the practical coding assistant, combine sensible retrieval with deterministic presentation of stable context. The repository should not be pasted wholesale merely because the server has a cache, and a changed passage should not be omitted merely because it breaks a match.

## Optional experiment: isolate the mechanisms

Use an existing local server that documents both features. Build separate test conditions for cold versus warm prefixes and for the supported scheduling configuration. Use the same invoice prompt, model, precision, and output settings throughout.

Test a repeated beginning, a changed latest question, an early policy edit, and an identical request after deliberate cache pressure in a disposable environment. Separately, submit a long uncached request while another request is decoding. Avoid clearing or reconfiguring a shared production service for this experiment.

Record time to first token, output speed, gaps between output events, total completion time, allocated memory, cache hits, and queue or preemption metrics where exposed. Distinguish token timing from buffered network events. Mark observations **our measurement** only after collecting them, and include correctness checks for both old and changed policy versions.

You should now be able to explain a result precisely: the prefix hit reduced repeated work; the scheduling policy changed how the remaining work affected other requests; retrieval changed the input itself. [The final article](/ai/one-halo-several-halos-or-gpus/) applies those distinctions to choosing a single machine or several, alongside the broader [AI stack decisions](/series/ai-stack/).
