---
draft: false
title: "Local Models: When You Run the Weights Yourself"
date: "2026-04-29T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Your code never leaves your machine. No API costs. No rate limits. The tradeoffs are real, but for the right use case, running local models is the right call."
cover: "/images/blog/ai/local-models-when-you-run-the-weights.png"
thumb: "/images/blog/ai/local-models-when-you-run-the-weights.png"
last_modified_at: "2026-04-29T10:00:00+05:45"
use_featured_image: true
series: ai-stack
seriesOrder: 5
---

A client engagement last year had a strict data handling requirement: no source code could be sent to third-party services without legal review and explicit approval. That ruled out Claude, GPT-4, Copilot, and every other cloud-hosted coding assistant. The alternative was either no AI tooling or running models locally.

I set up Ollama with Qwen2.5-Coder that afternoon. It was running usably within 20 minutes. The code quality was good enough to keep for the duration of the engagement.

Local models have real tradeoffs. But for the right use case — data sovereignty, zero ongoing cost, no rate limits, air-gapped environments — they're the right call.

---

## The models worth running locally

### Qwen2.5-Coder (Alibaba)

Currently the strongest open-weight coding model family for most developer tasks. Available in 1.5B, 7B, 14B, 32B, and 72B variants. The 7B handles the majority of tasks competently; the 32B competes with cloud-hosted Sonnet on coding benchmarks.

Apache 2.0 licensed. Available on Hugging Face. Active development — Alibaba has been consistently improving the series.

If you're only going to try one local model, start here.

### CodeLlama (Meta)

The established workhorse. Predates the Qwen series; has broader tool integration and community support as a result. Strong at fill-in-the-middle code completion — if autocomplete is your primary use case and you want the most widely supported option, CodeLlama is a solid choice.

Available in 7B, 13B, and 34B. Multiple variants: CodeLlama (general), CodeLlama-Instruct (chat-style), CodeLlama-Python (Python-focused).

### Codestral (Mistral AI)

22B parameter model, optimised specifically for code. Supports fill-in-the-middle. Licensed for personal use (not Apache 2.0 — check the license if you're considering commercial use). Strong at 80+ languages, with notably good performance on less-common languages compared to smaller specialised models.

Slower than 7B models, requires more VRAM, but the quality step up is real for complex tasks.

### DeepSeek-Coder-V2 (open weights)

Same training and quality as the DeepSeek API version. Available as open weights: 16B (MoE architecture, actually runs lighter than the parameter count suggests) and 236B (full MoE, serious hardware required).

The 16B version is a strong option if you want DeepSeek API quality without the data residency concerns. The MoE architecture means it runs faster than a dense 16B model — closer to 7B inference speed at higher quality.

---

## Hardware requirements

A rough guide to what runs where:

| Model size | Min VRAM | Hardware examples |
|---|---|---|
| 7B (Q4 quantised) | 6GB | M1 MacBook Pro, RTX 3060 |
| 13B (Q4 quantised) | 10GB | M2 Pro 16GB, RTX 3080 |
| 32B (Q4 quantised) | 24GB | M3 Max, RTX 4090 |
| 70B+ (Q4 quantised) | 40GB+ | Mac Studio Ultra, A100 |

Q4 quantisation cuts VRAM requirements roughly in half compared to full precision (fp16), with a modest quality reduction. For development tasks, Q4_K_M is the standard sweet spot — better quality than the smallest quantisations, lighter than fp16.

Apple Silicon Macs handle quantised models well because of the unified memory architecture — the model sits in memory shared between CPU and GPU, so a 16GB M2 Pro can run a Q4 13B model without memory pressure.

---

## Tooling for local serving

### Ollama

The standard for local model management and serving. Single command to download and run a model:

```sh
# Install
brew install ollama   # or curl -fsSL https://ollama.com/install.sh | sh on Linux

# Pull and run
ollama run qwen2.5-coder:7b
ollama run codellama:13b
ollama run deepseek-coder-v2:16b
```

Ollama exposes an OpenAI-compatible REST API at `http://localhost:11434`. Any tool that supports a custom OpenAI API endpoint can point at it — Aider, Continue.dev, and various shell scripts all work out of the box.

```sh
# The API works like OpenAI's
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "qwen2.5-coder:7b", "messages": [{"role": "user", "content": "Write a Go HTTP handler"}]}'
```

### LM Studio

GUI application for downloading, managing, and running models. Good for evaluation — you can pull a model, try it interactively, and decide if it's worth integrating into your workflow, all without touching the terminal.

Also exposes a local API server. Slightly higher overhead than Ollama for production use but much friendlier for exploration.

### llama.cpp

CPU-only inference. No GPU required. Runs on any machine, including servers without dedicated GPUs. Much slower — expect 3-8 tokens/second on a modern laptop CPU — but genuinely works.

For tasks where you need air-gapped inference on a machine with no GPU, llama.cpp is the path. For day-to-day development, the speed is too limiting.

---

## Connecting to your workflow

Ollama's OpenAI-compatible API is the integration point. Tools that support custom API endpoints:

**Aider** (terminal-based agentic coding):
```sh
aider --openai-api-base http://localhost:11434/v1 \
      --openai-api-key ollama \
      --model ollama/qwen2.5-coder:7b
```

**Continue.dev** (VS Code extension): supports Ollama natively as a provider. Configure it in your Continue config JSON and you have local code completion and chat in your editor.

**Direct API calls**: any script that calls `openai.ChatCompletion.create()` can point at Ollama by setting `base_url="http://localhost:11434/v1"`.

Claude Code does not currently support Ollama as a backend — it's bound to the Anthropic API. For local model interactive agentic sessions, Aider is the practical choice.

---

## The latency reality check

This is the tradeoff that matters most for interactive use.

A 7B model on an M2 Pro generates roughly 15-30 tokens per second. Claude Sonnet via the API generates around 80-100 tokens per second. For a 500-token response:

- Local 7B: 17-33 seconds
- Cloud Sonnet: 5-6 seconds

For a short autocomplete (20 tokens), the difference is negligible. For a full function implementation with explanation (400-600 tokens), local is 3-6x slower.

For **batch tasks** — where you're processing files sequentially or running overnight jobs — the latency doesn't matter. You're not watching the cursor. For **interactive coding sessions**, 25-second waits per response affect your flow state.

The 32B models are slower still on the same hardware. If you need 32B-class quality for interactive use, you need serious hardware (RTX 4090 or M3 Max class).

---

## The privacy argument

Genuinely strong, not just marketing. When you run local models:

- No code leaves your machine in any form
- No API request logs exist on any third-party server
- No training data contribution from your requests
- Works in air-gapped environments (no internet required after download)
- No rate limits during a crunch

For codebases containing proprietary algorithms, unreleased product code, customer data (even indirectly in test fixtures), or anything covered by an NDA, the privacy argument is real and the risk calculation is clear.

---

## Practical starting point

Install Ollama. Pull `qwen2.5-coder:7b`. Use it with Aider or Continue.dev for a week on a non-critical project.

```sh
brew install ollama
ollama pull qwen2.5-coder:7b
ollama serve &  # starts the API server
```

That's enough to get real-world quality data. If the output quality works for your task profile and the latency is acceptable, you have a zero-cost, zero-privacy-risk alternative to cloud APIs for that slice of your work.

If you need more quality and have better hardware, move to `qwen2.5-coder:32b` or `deepseek-coder-v2:16b` and re-evaluate.

---

## Coming next

Post 6 covers the meta-question: how do you build your workflow so that switching models costs hours, not weeks? The answer involves keeping context in portable formats, storing state in standard files, and periodically testing your workflow against a second model to find the brittle spots before they matter.
