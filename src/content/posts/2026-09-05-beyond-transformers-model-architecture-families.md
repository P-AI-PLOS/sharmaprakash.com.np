---
title: "Beyond Transformers: Five Model Families and the Names You Know"
date: "2026-09-05T17:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "A practical guide to attention, recurrent, convolutional, state-space, and hybrid models—with Llama, BERT, RWKV, WaveNet, Mamba, and Jamba as examples."
tags: ["model architecture", "Transformers", "RWKV", "Mamba", "inference"]
cover: "/images/blog/ai/beyond-transformers-model-architecture-families.png"
thumb: "/images/blog/ai/beyond-transformers-model-architecture-families.png"
use_featured_image: true
comments: true
share: true
---

You read an explanation of how a language model works and encounter the phrase “an attention-based model.” It sounds like a detail you can skip. Then the explanation starts talking about a KV cache that grows with the conversation, and the qualifier suddenly matters.

What would a model without attention do instead? Would it still generate text? Would it remember the conversation? And where do names like Mamba, RWKV, and mixture of experts fit?

The useful starting point is **how information moves through a sequence**. A sequence might be words, code tokens, or audio samples. Some models look back at individual positions. Some carry information forward in a compact state. Others combine patterns from nearby positions. These choices affect what the model can access directly and what the inference server needs to retain.

This is a map of sequence-model architectures, not a catalogue of every machine-learning method. The examples include familiar model families and influential historical systems. They are not equally popular, equally capable, or interchangeable chat assistants. Specific versions are named deliberately: a brand can change architecture between releases.

## The five families at a glance

| Family | Main way of using earlier information | Recognizable examples | What to keep in mind |
| --- | --- | --- | --- |
| Attention / Transformer | Compare token representations and combine relevant information | Llama 3.1; BERT | BERT is an encoder, not a next-token chat assistant |
| Recurrent | Update a state as each element arrives | RWKV; the original LSTM sequence-to-sequence model | Modern recurrence can support parallel training |
| Convolutional | Combine nearby positions through learned filters | WaveNet; ConvS2S | WaveNet generates audio; ConvS2S also uses attention |
| State-space | Evolve a structured state through the sequence | Mamba; Mamba-2 | Compact state does not mean perfect recall |
| Hybrid | Combine multiple sequence mechanisms | Jamba; Nemotron-H | Memory and execution depend on the actual layer mix |

The sections below link to the original papers and model documentation. Treat the families as useful groupings, not sealed boxes: state-space models can run recurrently, RWKV connects recurrence with linear attention, and attention can be added to other architectures.

## 1. Transformers: look back at relevant positions

Before attention, text tokens become [embeddings](/ai/glossary/#embedding): numerical vectors the network can transform. Layers update these representations. In a next-token model, the output stage produces [logits](/ai/glossary/#logits), scores that can be turned into probabilities with [softmax](/ai/glossary/#softmax). A decoding rule selects the next token; a fluent continuation is not automatically a factually correct answer.

3Blue1Brown's [Transformer lesson](https://www.3blue1brown.com/lessons/gpt/) makes another useful distinction visible: learned weights and the changing data passing through them are separate. Ordinary prompting changes the latter. It does not retrain the weights. The lesson uses historical GPT-3 dimensions to explain the mechanism; those numbers are not specifications for every model today.

Suppose a prompt contains “The invoice belongs to Acme” followed much later by “Which company owns it?” Attention gives the later token representations a way to combine information from accessible earlier positions. The relevance scores are learned numerical relationships; the model is not running a literal search for the word “Acme.”

A useful analogy is a notebook whose earlier pages remain available for consultation. The original Transformer made attention the central sequence mechanism, replacing recurrence and convolution in that role. Its other components still do essential work: a Transformer is more than an attention operation. [The Transformer paper](https://arxiv.org/abs/1706.03762).

**Llama 3.1** is a concrete decoder-only Transformer family. Its causal attention prevents a position from reading future tokens, and its text-generation process predicts a continuation. Meta's model card explicitly documents the architecture and grouped-query attention. [Llama 3.1 model card](https://huggingface.co/meta-llama/Llama-3.1-8B).

**BERT** shows why “Transformer” and “chatbot” are different categories. BERT is a bidirectional Transformer encoder: its representations can use context from both sides of a word. It was designed for language-understanding tasks, with masked-language-model pretraining, rather than the ordinary chat loop of appending one token at a time. [BERT paper](https://arxiv.org/abs/1810.04805).

For a conventional autoregressive attention model, the server can retain earlier keys and values in a **KV cache**. Later generation reuses them instead of computing those projections again. Under full-context attention, that retained state grows with the tokens kept in context. Sliding-window attention and other variants change the storage pattern, so the exact architecture matters. [Hugging Face's cache explanation](https://huggingface.co/docs/transformers/main/cache_explanation).

## 2. Recurrent models: carry a running state

A recurrent neural network passes information from one step to the next through an internal state. Imagine reading a document while continually updating working notes. At the next step, you have the new input and those notes, rather than direct access to a separate representation of every earlier position.

**LSTM** and **GRU** are recurrent building blocks, not individual chatbot products. Gates control how their states change. A landmark example is the **2014 sequence-to-sequence translation model**, which used LSTMs to encode an input sentence and produce an output sentence. It is a historical example of learned translation, not a modern general-purpose assistant. [Sequence to Sequence Learning with Neural Networks](https://arxiv.org/abs/1409.3215).

**RWKV** is a more recent language-model family built around efficient recurrent inference. Its name expands to Receptance Weighted Key Value. Despite those words, you should not assume it keeps the same growing, per-token KV cache as conventional softmax attention. The original RWKV formulation connects a linear-attention mechanism with a recurrent computation and supports parallelized training. [RWKV paper](https://arxiv.org/abs/2305.13048).

This distinction separates training from generation. An architecture may process training sequences with parallel operations yet generate through recurrent state updates. “Recurrent” does not automatically mean every stage must use the same slow, token-by-token training procedure as a basic RNN.

The working-notes analogy also exposes a trade-off. A bounded state cannot be treated as an unlimited, lossless transcript. Which details survive depends on the learned update mechanism and the task. Adding a longer input does not guarantee that an exact identifier from its beginning will remain recoverable.

## 3. Convolutional models: build from nearby patterns

A convolution applies a learned filter across positions. Lower layers combine small neighborhoods; additional layers let those combinations cover more of the sequence. **Dilation** spaces out the filter's input positions, expanding its reach without requiring one enormous filter.

**WaveNet** is the recognizable example here. The original model uses causal, dilated convolutions to generate raw audio. Causal means the prediction uses earlier samples, not future ones. It is autoregressive, but the sequence consists of audio samples rather than text tokens. That makes it an important generative model without making it a chat-model alternative. [WaveNet paper](https://arxiv.org/abs/1609.03499).

For text, **ConvS2S** is an influential convolutional sequence-to-sequence translation architecture. It also equips decoder layers with attention. Calling it convolutional describes its sequence-processing backbone; calling it completely attention-free would be wrong. [Convolutional Sequence to Sequence Learning](https://arxiv.org/abs/1705.03122).

Convolutions help explain why the five-family table is a map rather than a strict taxonomy. A network can use convolution to assemble local information and attention to connect it with other positions. When reading a model description, ask which operation performs which job.

For a purely convolutional causal model with a fixed receptive field, generation can retain the intermediate history its filters need. That differs from storing attention keys and values for every token in a growing context. Once attention is added, its storage requirements need to be counted too.

## 4. State-space models: selectively update structured memory

State-space models describe a sequence through an evolving internal state. In **Mamba**, the way that state changes depends on the input: the mechanism can selectively preserve or discard information as it moves through the sequence. The original architecture avoids attention and includes an algorithm designed for efficient execution on accelerators. [Mamba paper](https://arxiv.org/abs/2312.00752).

**Mamba** and **Mamba-2** are the names to recognize. They refer to architectures and associated model releases, not one universal assistant. The official repository includes language-model checkpoints such as `mamba-2.8b` and `mamba2-2.7b`. These are useful concrete examples, without implying that their size or architecture makes them substitutes for every instruction-tuned chat model. [Official Mamba repository](https://github.com/state-spaces/mamba).

Mamba-2 develops the connection between structured state-space models and attention through **state-space duality**. This is another reason not to picture recurrence, attention, and state spaces as unrelated inventions with impermeable boundaries. [Mamba-2 paper](https://arxiv.org/abs/2405.21060).

During recurrent decoding, a pure Mamba model maintains state whose size is fixed with respect to the sequence length for a given model and batch size. It does not need a growing attention KV cache. More concurrent requests still require more state; weights and temporary buffers still consume memory. Training and parallel prompt processing have their own allocations. [Mamba implementation and inference examples](https://github.com/state-spaces/mamba).

That property is attractive for long streams. It does not give the model infinite reliable memory. A long input must still be processed, and compact state must still preserve the information the eventual question requires. Efficient storage and accurate retrieval are separate things to test.

## 5. Hybrids: combine direct access with recurrent state

Instead of choosing one sequence mechanism for every layer, a hybrid can mix them.

**Jamba** interleaves Transformer and Mamba layers and adds mixture-of-experts computation in some layers. Its architecture is explicitly a combination, not an attention model renamed after a state-space model. [Jamba paper](https://arxiv.org/abs/2403.19887).

**NVIDIA Nemotron-H** is another documented Mamba-Transformer hybrid family. NVIDIA describes models that combine Mamba-2, attention, and feed-forward layers. Use the specific “Nemotron-H” name when making this claim; the broader Nemotron brand is not enough to identify one architecture. [NVIDIA's Nemotron-H research page](https://research.nvidia.com/labs/adlr/nemotronh/).

For inference, think of a hybrid as maintaining the state required by each component. Attention layers can retain keys and values, while state-space layers retain their own recurrent state. Fewer attention layers can reduce the attention-cache contribution compared with an otherwise comparable model using attention throughout. The actual saving depends on dimensions, precision, context length, and the layer mix.

A hybrid still needs a serving engine that supports its particular operations. An attractive architecture diagram is not evidence that the model will run quickly on your laptop.

## MoE, diffusion, and “reasoning” answer different questions

Model names often mix several classifications into one phrase. Separating them makes the name easier to read.

| Label | The question it answers | Example |
| --- | --- | --- |
| Transformer, recurrent, state-space, hybrid | How does information move across the sequence? | Llama 3.1, RWKV, Mamba, Jamba |
| Dense or mixture of experts | Which parameter groups do the computation? | Mixtral 8x7B uses selected experts |
| Autoregressive or diffusion | How is an output constructed? | Next-token continuation or iterative denoising |
| Text, audio, image, multimodal | What kinds of input/output does it handle? | WaveNet produces audio |
| Base, instruction-tuned, reasoning-focused | How has it been trained or adapted to behave? | These labels alone do not specify the backbone |

**Mixtral 8x7B** is a Transformer with sparse mixture-of-experts layers. Its router selects two feed-forward experts per token at each layer. MoE therefore does not compete with attention as a way to connect sequence positions: they do different work inside the same model. Active parameters also differ from total parameters, which matters when estimating compute and weight storage. [Mixtral paper](https://arxiv.org/abs/2401.04088).

**Diffusion** describes a different generation process, commonly explained as learning to reverse a sequence of noise-corruption steps. It can use a Transformer backbone: **DiT**, the Diffusion Transformer, is an explicit example. A list that treats “Transformer” and “diffusion” as mutually exclusive model types mixes architecture with generation method. [Diffusion Transformer paper](https://arxiv.org/abs/2212.09748).

Likewise, a “reasoning model” label does not reveal whether its sequence mechanism uses attention, recurrence, or a hybrid. An agent adds another layer of distinction: tools, retrieval, and orchestration around a model do not, by themselves, tell you its internal architecture.

## What this changes when you use a model

Imagine testing an assistant on a long repository prompt. Near the beginning sits a permission rule; near the end is a question about a controller. The useful experiment is whether the assistant connects them correctly, including an exception hidden in a background job.

Measure the answer alongside the resource use. Record the exact model version and runtime, prompt length, concurrent requests, time until output begins, generation speed, and peak memory. Then check whether the response identifies the real rule and its callers. Those are measurements of your workload, not properties you can infer from a family name.

For an attention model, inspect its context and cache design. For a recurrent or state-space model, inspect its state requirements and test retention of distant details. For a hybrid, account for both. For every family, verify that the runtime actually supports the model and its chosen precision.

When you next read “an attention-based model,” pause at the qualifier. The explanation is describing a particular way to connect information across a sequence. Llama, RWKV, WaveNet, Mamba, and Jamba give you concrete reference points for asking what changes when that mechanism changes.

## A visual learning path from 3Blue1Brown

For the intuition behind the names, Grant Sanderson's lessons are a useful companion:

- [Neural networks](https://www.3blue1brown.com/lessons/neural-networks/) introduces learned weights and activations through a small network.
- [Transformers, chapter 5](https://www.youtube.com/watch?v=wjZofJX0v4M) connects embeddings, repeated transformations, and next-token probabilities. Its [written adaptation](https://www.3blue1brown.com/lessons/gpt/) lets you revisit the diagrams at your own pace.
- [Attention, chapter 6](https://www.3blue1brown.com/lessons/attention/) explains how queries and keys determine mixing weights and how values supply the information being combined. Multiple heads provide multiple learned transformations, not a set of human-assigned specialist roles.
- [Backpropagation calculus](https://www.3blue1brown.com/lessons/backpropagation-calculus/) is optional depth on how derivatives help train the weights. It is not a step the server repeats for every ordinary chat request.

Use the illustrations to understand the mechanism, then return to the exact model card for its dimensions and architecture. These lessons explain neural networks and Transformers; they do not establish which local runtime or GPU backend will perform best on your machine. For that practical layer, continue with the [Local AI Toolkit](/series/local-ai-toolkit/).
