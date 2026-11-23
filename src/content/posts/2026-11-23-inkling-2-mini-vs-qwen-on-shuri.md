---
title: "Inkling 2 Mini vs Qwen 27B on a Radeon 780M"
date: "2026-11-23T23:45:00+05:45"
directory: ai
category: ["AI"]
categories: ["ai"]
excerpt: "I benchmarked Inkling 2 Mini and Qwen 27B on a 64 GB mini PC, then ran the same Inkling weights through Strata to see which engine I would keep serving."
tags: ["local AI", "homelab", "Inkling", "Qwen", "llama.cpp", "Strata", "Vulkan", "ROCm"]
series: local-ai-toolkit
seriesOrder: 4
draft: false
---

On Shuri, my AMD mini PC, Inkling 2 Mini generated **13.48 tokens per second**. The Qwen 27B build I already had generated **4.14 tokens per second**. Both model files occupied roughly 16 GiB on disk. When I ran the same Inkling file through Strata, it read prompts faster but generated replies more slowly. I kept Inkling on llama.cpp.

## The machine and the model files

Shuri is a Minisforum UM880 Plus running Ubuntu, with a Ryzen 7 8845HS, integrated Radeon 780M graphics, and 64 GB of DDR5. The GPU shares system memory. I could offload either model to it without a discrete graphics card.

I used the ggml-org `IQ4_NL` build of Inkling 2 Mini (16.41 GiB, about 4.5 bits per weight) and the `Q4_K_M` file from my existing `qwen3.8:27b` Ollama tag (15.65 GiB). The llama.cpp benchmark identified the latter as a 27B model with GGUF architecture `qwen35`. The Ollama tag identifies the installed artifact in this test. [Inkling GGUF files](https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF/tree/main)

The similar file sizes describe how much weight data I had to store. They tell me less about how much of that data the engine touches per token. Inkling is a mixture-of-experts model. Thinking Machines reports 26.4B total parameters, 3.4B active parameters, and 5.4B weight activations per token once repeated layer visits are counted. That gives a plausible reason for the gap against dense Qwen. This test measures the combined effect of architecture, quantization, and the engine's kernels. [Thinking Machines release notes](https://thinkingmachines.ai/news/inkling-2-mini/) · [A primer on GGUF, quantization, and MoE](/ai/gguf-quantization-dense-moe-model-files/)

## Inkling vs Qwen in llama.cpp

I ran both files directly through `llama-bench` build b12651. The settings were full Vulkan offload, Flash Attention, and eight CPU threads. I ran the 512-token prompt-processing test and the 128-token short-context generation test three times for each model. Prompt processing is the work the engine does to read the input. Generation is the rate at which it produces the reply. [llama.cpp b12651](https://github.com/ggml-org/llama.cpp/releases/tag/b12651)

| Model | Model file | Prompt processing, 512 tokens | Short-context generation, 128 tokens |
| --- | ---: | ---: | ---: |
| Inkling 2 Mini `IQ4_NL` | 16.41 GiB | 160.49 tok/s | **13.48 tok/s** |
| Qwen 27B `Q4_K_M` | 15.65 GiB | 94.86 tok/s | **4.14 tok/s** |

Inkling generated about **3.3× as fast** and processed the benchmark prompt about **1.7× as fast**. After a 4,096-token prefix, its generation rate dropped to **11.35 tok/s**. A short interactive reply ran at **12.7 tok/s**, including reasoning tokens.

To repeat the main comparison, run this once for each GGUF, setting `model` to its path.

```sh
llama-bench -m "$model" -p 512 -n 128 -ngl 99 -t 8 -fa on -r 3
```

I also changed the thread count while keeping the GPU offload settings. Four threads produced 12.44 tok/s, eight produced 13.48, and sixteen produced 12.73. An initial 96-token comparison measured 13.40 tok/s with full offload and 4.76 with zero GPU layers. Those results made eight threads and full offload a straightforward choice on this machine.

## The same Inkling GGUF in Strata

I built Strata v0.2.20's Inkling engine for the Radeon 780M's `gfx1103` target. The HIP backend used the same `IQ4_NL` GGUF directly and reported native execution for all 3,072 routed expert entries, with no requantization. I paused the resident llama.cpp service during the test and disabled hipBLASLt for the experimental 780M path. [Strata v0.2.20](https://github.com/Niko1221/Strata/releases/tag/v0.2.20) · [Strata’s Radeon 780M build guide](https://github.com/Niko1221/Strata/blob/v0.2.20/docs/RADEON_780M.md)

| Inkling test | llama.cpp Vulkan | Strata HIP |
| --- | ---: | ---: |
| Prompt processing, 512 tokens | 160.49 tok/s | **212.8 tok/s** |
| Short-context generation | **13.48 tok/s** | 8.9 tok/s |
| Generation after a 4,096-token prefix | **11.35 tok/s** | 8.2 tok/s |

Strata also processed a 4,096-token prompt at **207.1 tok/s**, taking **19.77 seconds**. I measured 8.7 tok/s of generation after its 512-token prompt. The runtimes use different benchmark programs. The llama.cpp figures are three-run averages, while the Strata figures are single runs. Strata's short-context test starts from one prompt token, and both short-context tests generate 128 tokens.

For a request with 512 input tokens and a 128-token reply, my measurements suggest Strata saves less than a second on prompt processing, while llama.cpp has the larger advantage during generation. I treated that as a guide to the trade-off. An end-to-end timing would need identical prompts, sampling, and output lengths across the two runtimes.

## What stayed on Shuri

I restored llama.cpp after the Strata trial and made Inkling the always-on local model on Shuri. It runs under systemd, using full Vulkan offload, Flash Attention, and eight CPU threads. The service now has two request slots with 65,536 tokens per slot and quantized KV caches. OpenCode and my engineering, product, and growth Hermes factories can select it through its OpenAI-compatible API. I verified actual replies from both clients. I kept the Qwen files on disk so I can load them again when I want to compare a task.

The speed figures came from single-request tests. My comparison also focused on text throughput, so a model-quality decision would need a separate set of prompts and scoring. For the day-to-day local endpoint, Inkling on llama.cpp was the combination that spent less time generating the replies I wanted to read.
