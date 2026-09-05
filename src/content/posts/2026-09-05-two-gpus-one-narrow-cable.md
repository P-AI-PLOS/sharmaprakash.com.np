---
draft: true
title: "Two GPUs, One Narrow Cable: Where Does the Traffic Go?"
date: "2026-09-05T10:02:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Follow model traffic through an upstream link and a PCIe switch, and learn what the Franken Strix experiment does and does not prove."
cover: "/images/blog/ai/two-gpus-one-narrow-cable.png"
thumb: "/images/blog/ai/two-gpus-one-narrow-cable.png"
use_featured_image: true
series: running-ai-yourself
seriesOrder: 3
---

Our invoice assistant needs more room for repository context. A tempting answer is to attach discrete GPUs to a machine with a large shared-memory pool. There is now more memory and more compute, so surely the assistant gets faster too.

Sometimes. First draw where the bytes travel.

A GPU can have extremely fast local memory while its route to another GPU is comparatively narrow. A pair of devices can communicate through a switch without sending every byte to the host, but only if the hardware and software permit that path. Even then, switch fabric and synchronization costs remain.

This article uses Level1Techs' Franken Strix experiment as an attributed case study. We did not build or benchmark the machine. Its reported results are evidence about that configuration, not forecasts for a shopping list. All independent arithmetic below is labeled **illustrative calculation**.

New to the terminology? Use the [AI glossary](/ai/glossary/). Linked terms also show a definition on hover or keyboard focus.

## Draw the host, the switch, and each downstream link

A [PCIe switch](/ai/glossary/#pcie-switch) routes transactions among ports. In an external expansion arrangement, an upstream connection leads toward the host and downstream connections lead toward devices. The integrated GPU remains part of the host platform and accesses its shared-memory pool through the platform's own memory system.

<ai-diagram data-diagram="topology">
<img src="/images/blog/running-ai-yourself/topology.svg" alt="The host connects upstream to a PCIe switch, with separate downstream links to GPUs A and B. Peer and host-staged transfer paths differ." loading="lazy" />
<p>The host connects upstream to a PCIe switch, with separate downstream links to GPUs A and B. Peer and host-staged transfer paths differ.</p>
</ai-diagram>

The diagram is conceptual. It does not assert the lane width, negotiated generation, or peer-routing behavior of an arbitrary enclosure. Those details belong in the actual topology report.

Watch for how the large shared-memory pool and discrete GPUs play different roles in Level1Techs' machine. Keep the [forum write-up](https://forum.level1techs.com/t/franken-strix-halo-2x-r9700s-128gb-strix-halo-unified-memory/254736) beside the video for the reported test configuration and caveats.

<figure>
<iframe src="https://www.youtube-nocookie.com/embed/RfkeZ0HciA0?controls=1" title="Level1Techs: 2x R9700s + 128gb Strix Halo Unified Memory = Unholy Strix Machine" loading="lazy" style="width:100%;aspect-ratio:16/9;border:0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
<figcaption><a href="https://www.youtube.com/watch?v=RfkeZ0HciA0">Watch the Unholy Strix Machine video on YouTube</a> · <a href="https://forum.level1techs.com/t/franken-strix-halo-2x-r9700s-128gb-strix-halo-unified-memory/254736">Read the experiment and benchmark tables</a>.</figcaption>
</figure>

The engineering question after watching is not simply whether the host detects the cards. It is which transfers the inference engine requests, which path serves them, and whether that path works in both directions. Device enumeration is the beginning of verification.

## A switch is not a bifurcation adapter

A passive bifurcation adapter exposes groups of lanes that the host platform must already support splitting. It cannot create host lanes or independently supply the routing behavior of a PCIe switch. A retimer restores signal quality along a link; that function does not make it a packet switch either.

An active switch can connect multiple downstream devices behind an upstream link, potentially with oversubscription. It still cannot give every simultaneous host-bound transfer the full sum of downstream bandwidth when the upstream connection is narrower.

This distinction matters when looking at a product with several full-length slots. Slot shape says little about electrical width, link negotiation, switch fabric, or firmware support. A long slot may carry fewer lanes than its physical connector suggests.

The Level1Techs post identifies a true switch arrangement and distinguishes it from retimers and bifurcation adapters. It also expresses uncertainty about the particular bridge's advertised generation. Accordingly, this article does not identify a required chip or dock purchase. A seller's related listing is not proof of the exact board tested. [Source: the experiment's hardware discussion](https://forum.level1techs.com/t/franken-strix-halo-2x-r9700s-128gb-strix-halo-unified-memory/254736).

## Convert the link rating before comparing it

An **illustrative calculation**: a link advertised at 64 Gbps carries a nominal eight billion bytes per second before overhead, because a byte contains eight bits.

```text
64 gigabits/second ÷ 8 = 8 gigabytes/second
8 GB/s ≈ 7.45 GiB/s
```

That conversion does not establish usable application throughput. Encoding, protocol overhead, transaction sizes, contention, and software copies reduce it. Nor does it establish that the Franken Strix system's particular link runs at this rating; this is a unit example.

Keep three kinds of number separate: the negotiated or advertised link rating, an observed transfer benchmark, and local memory bandwidth. A GPU reading its own VRAM is performing different work from moving data through an external switch.

For another **illustrative calculation**, transferring 4 GB over an ideal 8 GB/s payload path takes half a second. If the measured application payload rate were instead 5 GB/s, it would take 0.8 seconds. Neither figure includes setup or synchronization. A transfer repeated between every generation step can matter far more than the same transfer performed once at model load.

That is why “the cable is only used to load the weights” is not a safe general statement. Whether it is mostly true depends on how the model is divided and where its intermediate state resides.

## Layer splitting moves the boundary between layers

Imagine dividing the model into consecutive groups of layers. GPU A executes one group, then passes activations to GPU B for the next. An activation is the intermediate numerical representation of the current input at that boundary.

This arrangement can expand usable weight capacity without exchanging every layer's full weight arrays on every token. But a single sequence still follows the layer order. GPU B cannot finish its part before the preceding computation produces the input it needs.

With suitable scheduling and multiple requests or microbatches, pipeline stages can overlap work. Without that overlap, simply adding stages does not guarantee proportional speedup. A slower stage can set the pace, especially in a heterogeneous system combining an integrated GPU with faster discrete cards.

The inference engine also decides where attention state lives, how layers are assigned, and whether transfers are asynchronous. A “layer split” label is not a complete traffic trace. For the invoice workload, check both the initial repository prefill and generation at the desired context length.

## Tensor splitting communicates within the work

[Tensor parallelism](/ai/glossary/#tensor-parallelism) divides mathematical operations within layers across devices. Each device computes a shard, then results may need exchange or collective reduction before subsequent operations continue. This creates opportunities for parallel computation and obligations to communicate.

Small messages can be limited by latency and synchronization rather than peak bandwidth. Large transfers can saturate the path. Both make topology important. A communication benchmark involving large contiguous copies cannot by itself predict the cost of many small collectives.

The exact collectives, tensor layouts, and supported models depend on the engine and backend. A configuration that supports layer splitting may not support tensor splitting for the same model. A hardware page saying “multi-GPU” does not resolve those software questions.

For our assistant's short follow-up, frequent synchronization can outweigh saved arithmetic. A long prefill or a larger batch may tell a different story. Benchmarking both is more informative than declaring one partition method universally superior.

<ai-diagram data-diagram="split">
<img src="/images/blog/running-ai-yourself/split.svg" alt="Layer splitting passes activations between layer groups. Tensor splitting exchanges or reduces results between shards of a layer. These are conceptual paths, not transfer measurements." loading="lazy" />
<p>Layer splitting passes activations between layer groups. Tensor splitting exchanges or reduces results between shards of a layer. These are conceptual paths, not transfer measurements.</p>
</ai-diagram>

## Peer-to-peer support has several layers

Peer-to-peer, or P2P, lets a device access or transfer to another device through an eligible route without requiring the application to stage every transfer in host memory. The switch, root complex, firmware, driver, and runtime all participate in determining whether it works.

Support can also be directional. A successful transfer from A to B does not prove the reverse path works, and a capability query does not prove a real kernel will complete correctly. Test the operation the serving engine actually needs.

If traffic falls back through host memory, additional copies and upstream-link traffic can change performance. That fallback may be acceptable for infrequent transfers and unacceptable for a synchronization-heavy split. It may also change memory use on the host.

Keep the operational cost visible: stable boot, device discovery, repeated inference, idle-to-active transitions, and recovery after a process crash all matter for a shared office service. A clever hardware experiment can be educational without already being an appliance colleagues should depend on.

## What the Franken Strix measurements support

The following are **source-reported measurements**, transcribed from the [Level1Techs benchmark table](https://forum.level1techs.com/t/franken-strix-halo-2x-r9700s-128gb-strix-halo-unified-memory/254736). They are llama.cpp text-generation rates for the named quantizations and configurations, not our measurements.

| Reported model / quantization | Integrated GPU | Two R9700s | Integrated GPU plus two R9700s |
| --- | ---: | ---: | ---: |
| Qwen3.6-35B-A3B / Q8_0 | 48.8 tokens/s | 72.3 tokens/s | 55.5 tokens/s |
| gpt-oss-120b / Q4_K_M | 56.5 tokens/s | 100.4 tokens/s | 67.8 tokens/s |

In those comparisons, the discrete pair wins throughput. The additional Halo memory serves capacity and deeper-context opportunities; it is not evidence that adding the integrated GPU accelerates every model. The post also reports software and peer-access constraints, so these numbers should not be generalized to other engines or assumed to describe long-context coding-agent completion time.

For the invoice assistant, the decision has two axes: can the desired model and conversations run, and how long does useful work take? Extra capacity may be worthwhile even if a smaller model decodes faster on fewer devices. Preserve both results rather than choosing only the most flattering number.

## Optional experiment: measure the path and the workload

On hardware you already have, first record the topology using the platform's read-only inspection tools. Note negotiated links, device identities, backend versions, and the chosen split. Use the engine or backend's documented transfer benchmark rather than inventing an unverified P2P test.

Then run the same invoice prompt on each supported configuration. Keep weights, precision, context, output limits, and correctness criteria fixed. Capture time to first token, generation speed, memory per device, cache hits, and total completion time. Include a longer context and multiple active requests if those are your intended workload.

Label observations **our measurement** only after execution. Report unsupported configurations as unsupported, and failures as failures. Do not replace a failed multi-device test with an unrelated smaller model while leaving the comparison label unchanged.

The next optimization may require no new hardware at all: [reuse the stable beginning of the coding request](/ai/caching-for-coding-agents/). For choosing between provider access and local ownership, see [Choosing Your AI Stack](/series/ai-stack/).
