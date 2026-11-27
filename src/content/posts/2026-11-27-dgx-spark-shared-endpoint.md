---
title: "Sharing a DGX Spark: Read the Per-Stream Numbers First"
date: "2026-11-27"
directory: ai
category: ai
categories: ["ai"]
tags: ["local AI", "DGX Spark", "inference", "concurrency", "Inkling", "GLM"]
excerpt: "Mia's AI Lab publishes more than model recommendations for DGX Spark. Its per-stream results and request-slot behaviour show what matters when people share an endpoint."
series: local-ai-toolkit
seriesOrder: 5
---

[Mia's “Best models to run on your DGX Spark(s)” table](https://x.com/MiaAI_lab/status/2125975423964082600) is a useful starting point for choosing a model. For a shared endpoint, I would start with a different question: what happens when someone else sends a request while yours is still running?

The distinction matters for a small team, and for agents sharing a service. A machine can produce more tokens in total while each reply arrives more slowly. It can also refuse the next request altogether. Mia's AI Lab's recipes contain the per-stream measurements and serving details needed to read beyond the headline rate.

These are Mia's measurements, not a DGX Spark test from my homelab. My [Inkling 2 Mini versus Qwen run on Shuri](/ai/inkling-2-mini-vs-qwen-on-shuri/) is a separate, non-Spark experiment—not a hardware comparison with these results.

## More output does not mean a faster reply

In its [Inkling 2 Mini recipe](https://github.com/MiaAI-Lab/Inkling-2-Mini-DGX-Spark-TensorFold), Mia's AI Lab reports results on one DGX Spark with a GB10 and 128 GB of unified memory. Its aggregate decode comparison shows the following prose results. Here, concurrency counts streams, not machines.

| Concurrent streams | DSpark aggregate, tok/s | DFlash2 aggregate, tok/s |
| --- | ---: | ---: |
| 1 | 46.3 | 52.1 |
| 2 | 68.0 | 84.6 |
| 4 | 96.6 | 115.6 |
| 8 | 136.5 | 168.1 |

All figures in this table are reported by Mia's AI Lab. They describe how much text the endpoint produces across its active streams, not the pace a person sees in a single reply.

The same recipe publishes a separate DSpark per-stream table. Mia's AI Lab reports:

| Concurrent streams | Prose per stream, tok/s | Code per stream, tok/s |
| --- | ---: | ---: |
| 1 | 48.3 | 56.1 |
| 2 | 37.6 | 46.5 |
| 4 | 27.9 | 31.6 |
| 8 | 20.1 | 24.6 |

That is the more useful table when someone asks how the endpoint will feel. At four concurrent streams, Mia reports 27.9 tok/s per prose stream. The aggregate comparison's 96.6 tok/s is not a promise that each person gets that rate.

The tables are separate reported results. Their entries do not reconcile by simply multiplying per-stream speed by concurrency, so I would not combine them into a synthetic benchmark. Nor does the DSpark per-stream table establish what a DFlash2 user gets. Keep the drafter, workload and measurement table attached to the number.

Even per-stream decode leaves out the wait before output begins. Mia's AI Lab reports time to first token increasing from 71 ms to 697 ms across the Inkling sweep. A shared-service decision needs both the wait for the first token and the pace after it arrives; neither alone describes the whole interaction.

## A full endpoint is not necessarily a queue

The most consequential detail in [Mia's Inkling README](https://github.com/MiaAI-Lab/Inkling-2-Mini-DGX-Spark-TensorFold) is not a throughput result: when all `PARALLEL` slots are occupied, new requests are rejected rather than queued. Each stream reserves its whole context window at startup.

That turns context length and slot count into an admission decision. Loading the model is only the beginning. Reserving space for simultaneous conversations has to fit too—the distinction explained in [why a model can fit while its conversation runs out of memory](/ai/your-model-fits-conversation-memory/).

For a team of one to six people, headcount is only a planning scenario, not a benchmark concurrency setting. People do not necessarily submit together, and one person's agents can overlap requests. The shared-service concern behind [four Hermes instances using one model](/homelab/four-hermes-instances-one-model/) is relevant here without implying that those agents were tested on a Spark.

Before choosing a slot count, I would write down the service contract: how many requests may be active, how much context each may reserve, and what the caller sees when the endpoint is full. If waiting is preferable to rejection, an explicit queue in front of this recipe would be a design choice—not a feature to assume the model server already provides. That queue would also add waiting time that a decode benchmark does not measure.

The supplied Inkling results do not include a six-stream per-stream measurement. The surrounding rows are useful context, but not permission to interpolate a six-person experience. That needs a trial with the intended request overlap and context lengths.

## More Sparks do not remove the unit problem

Mia's AI Lab's [GLM 5.3 Flash recipe](https://github.com/MiaAI-Lab/GLM-5.3-Flash-DGX-Sparks-1104) makes the distinction visible on a larger setup. For its four-Spark ring, Mia reports these per-stream rates:

| Concurrent streams | Per-stream decode, tok/s |
| --- | ---: |
| 1 | 77.2 |
| 2 | 49.6 |
| 3 | 40.1 |
| 4 | 35.5 |
| 8 | 23.0 |

Mia separately reports 15.8 tok/s per stream at eight streams with FP8 KV. The cache configuration belongs beside the result; it is not an interchangeable detail.

The recipe's two-Spark harness reports a different kind of figure: Mia's AI Lab gives aggregate throughput of 38.4 tok/s at one stream, 79–81 at four, 94–95 at six, and 105–106 at eight. In particular, the six-stream result is not 94–95 tok/s for each person. It also does not establish six-stream per-user performance on the four-Spark ring.

These are measurements of particular configurations, not a scaling law from which to promise a larger cluster's behaviour. For a shared endpoint, choose the relevant configuration first, then look for per-stream performance and admission behaviour under the workload you mean to serve.

## The method is part of the result

Mia's measurement discipline deserves as much attention as the speed tables. In the measurement account supplied with these recipes, Mia's AI Lab reports that randomising prompt content moved decode throughput by 12.2% while rounds per second varied by less than 0.5%. After changing to fixed prompts, it reports spreads of 1.02%, 0.21% and 0.29%. Those are reported method results, not error bars I can attach to every number above. The cited measurement records are `docs/speed/RESULTS.md` and `docs/speed/AGREEMENT.md`; keep that method account alongside the [Inkling](https://github.com/MiaAI-Lab/Inkling-2-Mini-DGX-Spark-TensorFold) and [GLM](https://github.com/MiaAI-Lab/GLM-5.3-Flash-DGX-Sparks-1104) recipe results.

The useful lesson is that changing the input can change the apparent performance even when another execution-rate metric looks steady. A comparison needs a stable workload before a small improvement deserves an explanation. It is the same reason to be suspicious of a plausible-looking test discussed in [why my NVMe benchmark was misleading](/homelab/why-my-nvme-benchmark-was-misleading/): a tidy result does not rescue a measurement that answers the wrong question.

Mia's stated rule is worth keeping with the charts: “Numerics are measured and reported, never shipped ... The user approves them or they die.” For a shared endpoint, that means treating the published recipe as a starting point for a workload-specific check, not a service guarantee.

## Choose the service, not just the model

There is also an unresolved licensing detail before commercial use. The supplied source review identifies DFlash2 drafter licensing as CC BY-NC-ND 4.0 in the [GLM repository](https://github.com/MiaAI-Lab/GLM-5.3-Flash-DGX-Sparks-1104), but Apache-2.0 in Inkling's `CREDITS.md` in the [Inkling repository](https://github.com/MiaAI-Lab/Inkling-2-Mini-DGX-Spark-TensorFold). Those descriptions differ. A commercial reader must check the exact drafter artifact and applicable terms; this post does not resolve the discrepancy.

Mia's tier table helps narrow the model choice. For a shared service, I would carry a different set of facts into the decision: per-stream decode, time to first token, context reservation, and what happens to the next request when every slot is busy.

The deciding question is not just whether the model runs on the box. It is whether the endpoint can admit the work you intend to send—and whether each admitted reply arrives at a pace its user can tolerate.
