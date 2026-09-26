---
title: "I Tuned My Local AI Server. Then I Tried Ollama."
date: "2026-09-26T18:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Vulkan, Flash Attention, speculative decoding, thread counts, and a custom service. After all that tuning, Ollama matched or slightly beat my Qwen3.8 setup on the same mini PC."
tags: ["local AI", "homelab", "Ollama", "llama.cpp", "Qwen", "benchmarking"]
cover: "/images/blog/ai/i-tuned-local-inference-then-tried-ollama.png"
thumb: "/images/blog/ai/i-tuned-local-inference-then-tried-ollama.png"
use_featured_image: true
---

There is a particular kind of satisfaction in getting a language model running on your own hardware. The model loads. The GPU does something. Tokens start appearing. You own the machine, the files, the endpoint, and every questionable configuration decision between them.

Then you start tweaking.

That was me with Shuri, my Minisforum UM880 Plus. I had a native llama.cpp service running Qwen3.8-27B, a Vulkan backend, Flash Attention, a separate draft model, and a launcher full of settings I had deliberately chosen.

Eventually I asked a question I should have asked much earlier: how does this compare with the model I can just download and run through Ollama?

The answer was mildly embarrassing and very useful. **Ollama generated code a little faster. Intel throughput was effectively tied. The longer fresh response took about the same time in both.**

All that work, and I had not earned a clear performance advantage over the packaged option.

## What I wanted this machine to do

The goal was practical. I wanted local models for intel work, blog writing, and lighter coding tasks: implementing plans that more capable models had already worked out. I was trying to build a useful local worker, not win a benchmark leaderboard.

Shuri has 96 GB of installed RAM and a Radeon 780M integrated GPU. That gives me room to experiment with model sizes, but fitting a model and serving it quickly are separate questions. The GPU uses shared system memory; this is a mini PC, not a dedicated inference server with a large discrete accelerator.

For this comparison, the model was Qwen3.8-27B in roughly four-bit form.

I use “native” here to mean **my directly managed llama.cpp service**. Ollama also runs locally. The comparison is between two installed serving configurations on the same machine.

## The setup I had carefully assembled

My native launcher had quite a few knobs:

- A pinned llama.cpp build, **b10982**.
- **UD Q4_K_M** model weights.
- All model layers offloaded through **Vulkan**.
- **Flash Attention** enabled.
- A **32,768-token context** and one concurrent request.
- Eight generation threads and sixteen batch threads.
- Batch size 2,048 and microbatch size 512.
- **f16 KV cache** and prompt caching.
- Separate **Q4_0 MTP draft weights**, with a maximum draft length of three.

Those settings lived behind a systemd service and an authenticated HTTP endpoint. There were model files to manage, a runtime version to keep track of, and consumers that knew where to find it.

Every individual choice had a reason. Together, they also created an assumption: surely this much attention would buy something over the convenient path.

The Ollama alternative was version **0.34.4**, serving `qwen3.8:27b` with its packaged **Q4_K_M** model and draft setting of four.

It was not literally zero configuration. On this AMD integrated GPU, our Ollama service had Vulkan and integrated-GPU support explicitly enabled. For the test, I also set context size, thread count, sampling, and model residency. We checked that the model was fully placed on the GPU.

But I was taking responsibility for much less of the model packaging and launch configuration.

## First, fix the comparison

I wanted a useful answer to “which installation should I keep?” That required more care than sending a prompt to each endpoint and watching the screen.

We stopped competing GPU workloads and ran the two configurations sequentially. Each received the **same rendered prompt string**, with thinking disabled, temperature zero, seed 42, eight generation threads, and the same 32K context setting. Ollama received the rendered prompt in raw mode, so a second chat template would not quietly change the input.

There were three synthetic cases:

1. A short coding request.
2. A structured intel request that asked for JSON.
3. A coding request with a longer supplied implementation plan.

Each had a 256-token output cap and two requests: a fresh prompt after model warm-up, then an immediate repeat. We recorded time to first text, total elapsed time, generation throughput, and cache information.

The first pass had a problem. Native prompt reuse was disabled while Ollama could reuse prefixes. That made the repeated-request comparison unfair.

We corrected it and ran the benchmark again. In the final pass, both runtimes started each case with zero cached prompt tokens. Both reused the same number of tokens on the repeat.

That correction was one of the most valuable parts of the exercise. A surprisingly fast second request can tell you more about cache state than about the engine you think you are comparing.

## The numbers that changed my mind

These are mean server-reported generation rates from the two requests per workload:

| Workload | My native setup | Ollama | Difference |
| --- | ---: | ---: | --- |
| Short code | 11.93 tokens/s | 12.36 tokens/s | Ollama about 3.5% faster |
| Structured intel | 10.50 tokens/s | 10.47 tokens/s | Effectively tied |
| Code from a supplied plan | 10.40 tokens/s | 10.96 tokens/s | Ollama about 5.3% faster |

No dramatic collapse. No order-of-magnitude revelation. Both delivered roughly **10–12 tokens per second**.

That made the result more interesting to me. My custom setup worked. It just did not work enough better to justify keeping a duplicate serving path for this model.

There was one result in native's favor: **time to first text on the longer fresh prompt**.

| Longer plan prompt | Native | Ollama |
| --- | ---: | ---: |
| Fresh time to first text | 14.123 s | 15.555 s |
| Fresh total response time | 38.640 s | 38.579 s |
| Cached time to first text | 0.431 s | 0.395 s |
| Cached total response time | 24.938 s | 24.099 s |

Native started answering about 1.4 seconds earlier on that fresh prompt. Ollama then generated faster, and the total came out at **about 38.6 seconds either way**.

The immediate repeat was much more responsive in both. First text appeared in under half a second. That was a larger change in the experience than the small difference between runtimes, though repeating an identical prompt is only a narrow cache test.

## What these numbers do—and do not—prove

This was a comparison of **the configurations I actually had installed**. Native used UD Q4_K_M weights; Ollama used its packaged Q4_K_M artifact. Their draft settings differed too. I cannot attribute the small generation gap solely to runtime overhead.

Two requests per workload are also a small sample. A three-to-five-percent difference is a reason to investigate or simplify, not a universal claim that Ollama is faster than llama.cpp.

The short responses had different output lengths. Native generated 205 tokens for the short-code task; Ollama generated 210. Intel responses were 256 and 254 tokens respectively. Total response times need to be read alongside those lengths.

We did some basic output checks. The short-code responses passed their generated assertions. The intel responses parsed as JSON and contained the requested keys. Those checks caught obvious failures; they did not establish real-world task quality.

All the longer coding responses hit the 256-token cap. They were **unfinished implementations**, even where a partial response happened to be valid Python. This test measured their generation speed, not whether they could finish the job.

There was no multi-turn coding agent, tool-use evaluation, or production intel workflow in this experiment. And we did not benchmark blog-writing quality just because that is one of my intended uses.

## The interesting failure was my assumption

I do not regret the tuning. I now understand my setup much better: which files it loads, which device does the work, what gets cached, and why a prompt can sit there for fourteen seconds before the first word appears.

That knowledge is useful even if I stop operating the custom Qwen service.

What I would change is the order. I invested in the adjustable setup before establishing a measured baseline with the convenient one. Once you have chosen the model file, adjusted the threads, enabled speculative decoding, and written the service, it becomes easy to feel that the result must be better.

The benchmark did not care how many settings I had touched.

It also did not tell me which individual setting helped. We had not run an ablation study with each optimization toggled in turn. The evidence was simpler: taken as a whole, my installed configuration did not provide a compelling advantage over the Ollama configuration beside it.

## What I am keeping

My decision is to consolidate **Qwen3.8 on Ollama**.

It already manages other models I want to use. The measured speed is comparable, with a small code-generation advantage in these samples. Keeping a second Qwen3.8 serving path would mean maintaining another set of weights, launch settings, and consumer routes without a demonstrated benefit that matters to me.

That decision is narrower than removing llama.cpp from the machine. Other workloads still use it. At the time of writing, the benchmark is complete and the consolidation decision is made; consumer migration and permanent retirement of the duplicate service are still pending.

For my next model, I want to reverse the sequence:

1. Get the packaged version working on the intended hardware.
2. Verify the actual device placement.
3. Measure representative prompts, separating fresh and cached behavior.
4. Change one thing to address a measured problem.
5. Keep the change only if the benefit is worth maintaining.

I went into this wanting a faster local AI server. I came out with a better understanding of the server, a useful benchmark, and a reason to run less infrastructure.

There is something very homelab about doing all the work yourself, learning why each knob exists, and then deciding that “download the model and use Ollama” is a perfectly good outcome.

---

*Measured on my own Shuri host on September 26, 2026. The tables use the corrected pass with matched prompt-cache behavior. For background on the layers involved, see [local inference runtimes](/ai/llama-cpp-vllm-lm-studio-local-runtimes/), [GPU backends](/ai/cuda-rocm-vulkan-metal-local-ai/), and [model files and quantization](/ai/gguf-quantization-dense-moe-model-files/).*

*The hero is an AI-generated illustration, made on the same Shuri machine with Qwen Image 2.1 through ncnn/Vulkan: 1008 × 432 pixels, 40 denoising steps, seed 42. It illustrates the tinkering-versus-convenience theme; it is not a photograph of my hardware.*
