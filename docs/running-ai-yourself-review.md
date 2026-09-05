# Running AI Yourself: publication review

The six Markdown posts are published content in `src/content/posts/`, with the
`running-ai-yourself` series and orders 1–6. The recurring example is an
invoice repository: an assistant answers an authorization question, handles
follow-ups, then serves colleagues. This document records editorial and
local verification evidence; the articles contain the explanations and sources.

## Article map

| Part | Source | Approximate body words | Route |
| --- | --- | ---: | --- |
| 1 | [Prompt lifecycle](../src/content/posts/2026-09-05-what-happens-when-you-send-an-ai-prompt.md) | 1,838 | `/ai/what-happens-when-you-send-an-ai-prompt/` |
| 2 | [Conversation memory](../src/content/posts/2026-09-05-your-model-fits-conversation-memory.md) | 1,884 | `/ai/your-model-fits-conversation-memory/` |
| 3 | [PCIe topology](../src/content/posts/2026-09-05-two-gpus-one-narrow-cable.md) | 1,797 | `/ai/two-gpus-one-narrow-cable/` |
| 4 | [Agent prompt caching](../src/content/posts/2026-09-05-caching-for-coding-agents.md) | 1,984 | `/ai/caching-for-coding-agents/` |
| 5 | [Prefix caching and prefill](../src/content/posts/2026-09-05-prefix-caching-chunked-prefill.md) | 1,945 | `/ai/prefix-caching-chunked-prefill/` |
| 6 | [Serving placements](../src/content/posts/2026-09-05-one-halo-several-halos-or-gpus.md) | 2,036 | `/ai/one-halo-several-halos-or-gpus/` |

Counts include diagrams, tables, and link labels. All articles contain a
diagram, worked example, optional experiment, and an AI-stack cross-link.
The existing AI-category renderer supplies six registered 1915×821 title
cards, with per-article schematics and both image metadata fields wired.

## Technical review

- The worked conventional KV model uses 80 layers, eight KV heads, dimension
  128, and two-byte elements: 327,680 bytes per token; 32,768 tokens need
  10 GiB and 131,072 need 40 GiB before overhead. Other architectures are
  explicitly excluded from this generic estimate.
- The assumed 112 GiB usable allowance is an illustrative budget, not a
  measured Halo allocation. Weights, cache, runtime overhead, and headroom
  remain separate. Weight quantization does not imply KV quantization.
- The link conversion is 64 Gbps ÷ 8 = 8 GB/s before overhead. The remote
  cache example converts 8 GiB to 8.589934592 GB before dividing by the
  assumed 2 GB/s payload rate.
- Franken Strix rates are labeled source-reported. The smaller-model table
  preserves the discrete pair's throughput advantage; Halo memory supplies
  capacity. The article does not turn the uncertain bridge identity into a
  required purchase.
- Prefix identity includes preceding context. Cache blocks, provider
  breakpoints, scheduling slices, and retrieval passages are distinguished.
- The B70 comparison uses Intel's per-card capacity specification, without
  claiming verified model compatibility or scaling. LMCache's documented
  Instinct wheel targets do not establish Halo or B70 support.
- Provider rules were checked on September 5, 2026. The comparison names
  model-dependent thresholds, retention interfaces, and billing behavior.
  Subscription charges remain separate from API savings.

Primary references are linked beside claims in the articles: provider
documentation, Hugging Face Transformers, vLLM, LMCache, Intel's datasheet,
and the Level1Techs experiment. No inference or hardware benchmark was run.

## Videos

Public availability, titles, and channels were checked through YouTube
metadata. English captions were reviewed for the concepts accompanying each
embed; no timestamps or numerical video-performance claims are attributed.
The caching article explicitly notes that the video's provider-default
discussion is not the current API reference.

| Part | Video | Local preview evidence |
| --- | --- | --- |
| 1 | IBM Technology, `o0gkdZBtwEg` | Playback started; media ready state 4; no media error |
| 3 | Level1Techs, `RfkeZ0HciA0` | Playback started; media ready state 4; no media error |
| 4 | Hugging Face, `SkM4k4SKvCM` | Playback started; media ready state 4; no media error |

All embeds use `youtube-nocookie.com`, lazy loading, descriptive iframe
titles, visible fallback links, controls, and no autoplay. At a 390-pixel
viewport, the player measured 342×192.375 pixels, preserving 16:9. This
proves local inline playback, not playback availability in every network,
browser policy, or future YouTube state.

## Harness companion, illustrations, and glossary

The separate article [From Prompts to Harnesses](../src/content/posts/2026-09-05-from-prompts-to-harness-engineering.md)
has approximately 2,080 body words and a registered title card. Parts 1 and 4
link to it. It preserves the original six-part order and distinguishes the
model, inference server, agent harness, and evaluation harness. Historical
and product claims link to GitHub, OpenAI, and Anthropic primary sources.
The invoice scenario and experiment are illustrative; no agent benchmark was run.

Eight series SVG diagrams replace text schematics; five support user-driven
interaction (inference, memory, splitting, prefix reuse, and scheduling).
Play requires user action; reduced motion retains manual stepping. Static
SVG fallbacks preserve the explanations without JavaScript. The companion
has a separate static harness ownership and feedback diagram.

The shared AI glossary defines inference and harness terminology alongside
the site's other AI terms. Explicit article links show definitions on hover
or keyboard focus, dismiss with Escape, and navigate normally on touch or
without JavaScript. Definitions are maintained in one data file.

Headless browser checks passed for stepping, Play/Pause/Reset, changed-prefix
invalidation, memory overflow and precision, warm versus cold scheduling,
reduced motion, glossary hover/focus/Escape, client-side navigation cleanup,
and no-JavaScript fallbacks. All six articles and the harness companion fit 390- and 1440-pixel viewports.
The companion diagram loaded at both widths; its harness definition opened
on keyboard focus and the link reached the matching glossary entry.

## Site verification

- `pnpm check`: zero errors and warnings (see current check output for informational hints).
- `pnpm build`: passed in the normal draft build.
- `node --test scripts/tests/running-ai-series.test.mjs scripts/tests/ai-diagrams.test.mjs`: eleven passing tests
  covering draft metadata, word bounds, image dimensions, embed contracts,
  published production routes, and internal links.
- `git diff --check`: passed.
- Isolated preview: copied site with this series and its harness companion enabled for preview;
  build passed. All six article pages showed the correct part number out of
  six and loaded their images. At viewport widths 390 and 1440, document
  width matched viewport width. Both series landing pages included the
  reciprocal companion link.

For this environment, run scripts with
`pnpm --config.verify-deps-before-run=false check` and
`pnpm --config.verify-deps-before-run=false build` to use the installed
dependencies. Bare pnpm attempted an automatic reinstall and stopped at a
non-interactive modules-purge prompt. No dependency or lockfile changes
were made for the series.

Draft-only series are excluded from the catalog and static series routes.
All eight remaining draft posts were enabled for publication at the user's
request, including the six-part series, its harness companion, and the older
AI toolkit retrospective. Acceptance tests now require published routes and
series discoverability. Source publication is separate from the deployment
workflow result.
