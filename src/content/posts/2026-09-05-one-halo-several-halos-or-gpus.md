---
draft: false
title: "One Halo, Several Halos, or a Desktop Full of GPUs?"
date: "2026-09-05T10:05:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Choose a serving shape for latency, concurrency, and context capacity without confusing replicas, model splitting, or remote cache transfer."
cover: "/images/blog/ai/one-halo-several-halos-or-gpus.png"
thumb: "/images/blog/ai/one-halo-several-halos-or-gpus.png"
use_featured_image: true
series: running-ai-yourself
seriesOrder: 6
---

Our coding assistant can now explain invoice authorization, preserve useful context across follow-ups, and serve colleagues. The remaining question is where to run it: one large shared-memory computer, several networked computers, or a desktop holding discrete GPUs.

There is no useful answer until we distinguish the workload. A person waiting for a short answer wants low latency. Several people arriving together need concurrency. A model with a large weight allocation or a long context needs capacity. These requirements can point toward different arrangements.

This is a workload-based comparison, not a purchase recommendation or a claim that we tested the hardware. Numerical examples are labeled **illustrative calculations**. Vendor capacities are **source-reported specifications**. Runtime support and scaling remain questions for the exact model, engine, operating system, and accelerator combination.

New to the terminology? Use the [AI glossary](/ai/glossary/). Linked terms also show a definition on hover or keyboard focus.

## Three ways to use several machines

The word “cluster” does not tell you what the machines share. Start with these distinct arrangements:

<ai-diagram data-diagram="placements">
<img src="/images/blog/running-ai-yourself/placements.svg" alt="Independent replicas each hold a complete model. Model splitting divides computation. Remote cache transfer supplies compatible KV state to a worker." loading="lazy" />
<p>Independent replicas each hold a complete model. Model splitting divides computation. Remote cache transfer supplies compatible KV state to a worker.</p>
</ai-diagram>

Replicas distribute requests. A model split distributes computation and storage for a request. Cache transfer moves reusable state. A serving system can combine them, but buying several computers does not automatically configure any of them.

## One 128 GB Halo: a straightforward capacity shape

A Halo-class machine with a large shared-memory pool is attractive when a model's resident allocation exceeds a typical discrete card's local memory. Keeping execution within one host can avoid a cross-machine partition and its network dependencies.

But installed memory remains different from usable inference capacity. The operating system, driver allocation limits, runtime buffers, and KV cache still compete for room. [Our memory ledger](/ai/your-model-fits-conversation-memory/) showed how a model that loads can run out of room with longer or simultaneous conversations.

For the invoice assistant, this arrangement is easiest to reason about when one supported model fits with adequate context headroom and the expected concurrency is modest. Queueing can make a small service practical even if it cannot generate for everybody simultaneously.

Latency still needs measurement. Large memory capacity does not by itself imply high prompt throughput or fast decode. The useful experiment is the real repository question, its follow-up, and a burst of colleague requests, with answer quality held constant.

Operationally, a single host has fewer moving parts, but it is also a single failure domain. Decide what colleagues see when the process restarts or the machine is unavailable. “Local” describes placement, not an availability guarantee.

## Several Halos as independent replicas

If one Halo can run the desired model, adding [replicas](/ai/glossary/#replica) can let different people use separate workers. Each worker has its own weights, active conversations, and cache state unless a serving system explicitly connects those caches.

This usually offers a clearer concurrency story than immediately splitting one model across the network. The router can send independent requests to different workers, and losing one worker need not stop every other worker. However, each request's model must fit on its assigned worker.

Replicas do not pool their memory for a single oversized model. Three machines each capable of holding a particular model cannot run a model three times larger merely because their capacities add up on paper.

Routing introduces a tradeoff. Sending invoice follow-ups to the worker with the warm repository prefix can reduce repeated prefill. Sending them to the least busy worker can reduce queueing. A useful router considers both; strict affinity can create a hot worker while others sit idle.

As an **illustrative scenario**, a warm worker has a twelve-second queue while an idle worker needs four seconds of uncached prefill. Ignoring other differences, the idle worker can start sooner despite its miss. A high cache-hit ratio is not the service objective when it increases users' waiting time.

## Splitting a model across networked Halos

If the desired model cannot fit on one machine, distribution becomes a capacity technique. The engine must support the model, accelerator backend, and cross-host partition strategy. It also needs a working transport and compatible runtime configuration on every participant.

Layer and tensor splitting have different traffic patterns, as [part three](/ai/two-gpus-one-narrow-cable/) explained. Across a network, latency and bandwidth constraints can be more pronounced than inside a suitable workstation. Tensor collectives may communicate frequently; a layer pipeline has sequential dependencies and needs suitable scheduling to keep stages occupied.

This may make an otherwise impossible model runnable, which is valuable. It does not establish that a short invoice question finishes faster. Capacity success and latency success need separate evidence.

Failures also become collective. If one required shard is unavailable, the full model request may fail even when the other hosts are healthy. Version alignment, deployment order, restart behavior, and observability become part of the product colleagues experience.

Before choosing this shape, write down the exact workload that cannot be served on a simpler one. “More computers should help” is too vague to justify distributed inference's ongoing work.

## Desktops with one, two, or four Arc Pro B70 cards

Intel lists **32 GB of graphics memory per Arc Pro B70** and describes multi-GPU capability. These are **source-reported specifications**, not evidence of a particular model's scaling. [Intel's B70 datasheet](https://www.intel.com/content/dam/www/central-libraries/us/en/documents/2026-03/datasheet-b70-gpu.pdf).

The following **illustrative capacity arithmetic** uses those advertised per-card capacities: one card contributes 32 GB, two sum to 64 GB, and four sum to 128 GB. The sums describe separate local-memory pools. They are not a unified allocation that an arbitrary inference engine can treat as one device.

With one card, the straightforward case is a supported model plus its runtime and context state fitting in that card's usable memory. With two cards, you can consider independent model replicas or a supported split. Four cards add more placement options, but also more demands on slots, electrical lanes, power delivery, cooling, and backend behavior.

An engine may duplicate some tensors, reserve workspace on every card, place more state on a primary device, or support only certain split modes. Therefore even a nominal sum exceeding the model file size does not prove the model fits in a valid placement.

For this article, B70-specific model compatibility and multi-card throughput are **unverified**. No ordering of Halo versus B70 latency is claimed. Before a purchase decision, require an engine-specific run with the intended artifact, quantization, context, and card count. A general multi-GPU product statement cannot supply that evidence.

## Remote KV reuse is a serving feature

Suppose Halo A processed the invoice repository and Halo B is idle. Could B obtain A's retained context instead of processing the repository again?

Potentially, if the serving stack implements it. The state must correspond to compatible model weights, tokenization, positions, cache format, and execution layout, or a supported conversion must exist. Routing must identify eligible state, the source must still retain it, and the target must have room to receive it.

[LMCache](https://docs.lmcache.ai/) is one implementation reference for storing and reusing KV state across serving arrangements and storage tiers. Its existence demonstrates a concrete software approach, not automatic support for every accelerator. The [installation documentation](https://docs.lmcache.ai/getting_started/installation.html) lists specific backend artifacts; the documented AMD wheels target named Instinct architectures. That is not proof of support for Halo's integrated GPU or Intel B70.

Check the entire integration: cache library, serving-engine connector, hardware backend, model architecture, and transport. A successful package import on a host does not prove that compatible state can be transferred into an active generation.

Also preserve access boundaries. A reusable repository cache is application state derived from source material. The router and cache service need appropriate authorization; sharing a physical network is not permission to reuse every stored context.

## Transfer versus recomputation: do the arithmetic

Consider an **illustrative calculation** with 8 GiB of reusable KV state and an assumed effective transport payload rate of 2 GB/s. Convert units before dividing:

```text
8 GiB = 8 × 2^30 bytes = 8.589934592 GB
Transfer time floor = 8.589934592 / 2 ≈ 4.29 seconds
```

That is a transfer-only floor. Discovery, serialization, staging copies, destination allocation, synchronization, and contention add time. Even an advertised fast network is not evidence that the cache connector sustains the assumed payload rate.

If local recomputation takes an illustrative three seconds, transferring this state is already slower before overhead. If recomputation takes an illustrative twenty seconds, transfer has a plausible opportunity, subject to measured end-to-end behavior.

If the state shrinks through a supported representation, or the transfer overlaps useful work, the comparison changes. If several workers simultaneously request the same state, the source and network may become bottlenecks. The relevant number is time until the destination can continue the user's request correctly, not the fastest isolated copy result.

Remote reuse therefore belongs in the performance budget alongside prefill, queueing, and decode. Several networked Halos do not spontaneously share a cache, and a shared cache does not make their memory one coherent GPU pool.

## Account for power and operational effort

Compare measured wall power under the workload, idle power, and the hours the service stays on. Board ratings and processor power limits are not whole-system energy measurements. Cooling and noise can also decide whether a workstation belongs near people.

For an **illustrative energy calculation**, a system averaging 300 W for eight hours uses 2.4 kWh during that period. Multiply measured energy by your applicable tariff to estimate cost. Do not substitute a component's peak rating for average wall power or assume an unspecified electricity price.

Operational effort includes updating drivers and engines, checking model quality after changes, managing queues, and recovering failures. Replicas can simplify capacity per worker while multiplying hosts to maintain. A dense GPU workstation consolidates hosts but concentrates cooling, power, and failure risk. A distributed model couples several machines' health to one answer.

These costs belong beside token throughput because someone must operate the service after the interesting benchmark is over.

## Choose by the work you need to serve

This decision table describes conditional fits, not a tested hardware ranking.

| Workload priority | Candidate shape | Latency and concurrency | Capacity and support gate | Power and operational effort |
| --- | --- | --- | --- | --- |
| One developer, supported model fits | One Halo or one B70 desktop | Measure repository prefill and follow-up decode; queue bursts | Weights plus context must fit usable memory on the chosen backend | One host; compare actual idle/load power |
| Several independent colleagues | Halo replicas or per-card replicas | More independent work; routing balances queueing and cache locality | Complete model must fit each worker/card placement | More replicas to update and monitor |
| Larger model within one workstation | Two or four B70s with a verified split | Scaling depends on partition and PCIe topology | Per-device allocations and model kernels must work | Chassis, lanes, cooling, and power are material |
| Model exceeds one host's usable capacity | Supported cross-host split | Capacity may improve while single-request latency worsens | Distributed engine/backend evidence required | Highest coupling and transport complexity |
| Repeated long context across workers | Compatible remote KV system | Compare transfer plus setup against local prefill | Cache format, connector, routing, hardware, and authorization must align | Adds cache storage, transport, and eviction operations |

## Optional experiment: a small-office acceptance run

Replay the invoice question, its follow-up, and a burst of independent colleague questions using a non-sensitive snapshot. Hold the model and answer-quality criteria fixed. For each supported placement, record time to first token, generation speed, peak memory, cache hits, total completion time, wall energy if available, and queueing behavior.

Label actual observations **our measurement**, and leave untested configurations explicitly untested. Include failures and recovery behavior. A service that is fast until a worker restarts needs a different operating plan from one that gracefully queues or reroutes requests.

Choose the simplest arrangement that meets your measured workload. The [broader AI stack series](/series/ai-stack/) helps decide whether running locally is worthwhile at all; this series gives you the questions to ask once you take responsibility for the work a hosted API normally hides.
