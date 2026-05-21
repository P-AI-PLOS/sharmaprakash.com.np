---
title: "Structured extraction with Pydantic + Claude: guests, topics, and quotes from raw transcripts"
date: "2026-05-04T10:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "Schema-first prompting with Pydantic + Anthropic tool use, tiered routing between Haiku and Sonnet, prompt caching for the system block, and a single retry that feeds the validation error back into the prompt."
cover: "/images/blog/ai-podcast-index/structured-extraction-with-claude/cover.png"
thumb: "/images/blog/ai-podcast-index/structured-extraction-with-claude/thumb.png"
last_modified_at: "2026-05-04T10:00:00+05:45"
use_featured_image: true
tags: ["ai", "python", "claude", "pydantic", "anthropic", "podcast"]
series: ai-podcast-index
seriesOrder: 3
---

> Assumes you've read [`uv-2026`](/blog/why-uv-exists/) (for the toolchain) and [`python-monorepo-2026`](/blog/python-monorepo-2026-why/) (for the layout) — though each post stands alone if you skim those concepts.

[Post 2 — Ingesting YouTube transcripts honestly](/blog/ingesting-youtube-transcripts/) ended with rows in `transcript_segments`: `(episode_id, start_ms, end_ms, text)`. Useful, but inert. To search by guest, filter by topic, or generate questions grounded in what someone *actually said*, the transcripts need structure.

This post turns raw segments into three Pydantic models — `GuestMention`, `Topic`, `Quote` — using Claude with hand-rolled JSON-schema prompting, tiered routing (Haiku for triage, Sonnet for synthesis), prompt caching on the system block, and a single retry that feeds the validation error back to the model. No `instructor`, no LangChain, no magic — every line you can read and reason about.

## The extraction targets

Three tables, three models. They live in `packages/shared-schema/` so the FastAPI side and the codegen'd TypeScript types on the React side both pull from the same source (the killer argument from [the monorepo series](/blog/python-monorepo-2026-shared-schema/)).

```python title="packages/shared_schema/src/shared_schema/extraction.py"
from pydantic import BaseModel, Field
from typing import Literal

class GuestMention(BaseModel):
    """A person introduced as a guest in this segment range."""
    name: str = Field(..., description="Full name as introduced on-air.")
    role: str | None = Field(None, description="e.g. 'CEO', 'founder', 'researcher'.")
    company: str | None = Field(None, description="Organization, if mentioned.")
    confidence: float = Field(..., ge=0.0, le=1.0)

class Topic(BaseModel):
    """A discrete subject discussed across one or more segments."""
    name: str = Field(..., max_length=80)
    segment_ids: list[int] = Field(..., min_length=1)
    confidence: float = Field(..., ge=0.0, le=1.0)

class Quote(BaseModel):
    """A self-contained statement worth surfacing in the UI."""
    text: str = Field(..., min_length=20, max_length=400)
    segment_id: int
    speaker: Literal["host", "guest"] = "guest"
    quotability_score: float = Field(..., ge=0.0, le=1.0)

class ExtractionResult(BaseModel):
    """What `enrich` returns per chunk."""
    guests: list[GuestMention] = []
    topics: list[Topic] = []
    quotes: list[Quote] = []
```

Three things worth pointing out:

- **`confidence` everywhere.** The LLM is asked to self-grade. That number is what [post 4](/blog/guest-entity-resolution/) uses to decide whether a `GuestMention` is auto-merged or sent through fuzzy matching.
- **`segment_ids` instead of free-form citations.** The model points at the segment row, not a copy of the text. Cheaper, verifiable, and lets us reconstruct the source on demand.
- **No `id` fields.** Postgres assigns those on insert. The model's job is to extract; the worker's job is to persist.

## The prompt pattern

Schema-first prompting means: build the JSON schema from the Pydantic model, paste it into the system prompt, and tell Claude exactly what shape to return. Combined with Anthropic's `tool_use`, the model is forced into a valid call — and we get a Pydantic instance on the other end instead of a regex-fragile string parse.

```python title="packages/enrich/src/enrich/extract.py"
import json
from anthropic import AsyncAnthropic
from pydantic import ValidationError
from shared_schema.extraction import ExtractionResult

SYSTEM_PROMPT = """You extract structured information from podcast transcript chunks.

Each segment is shown as `[id] text`. Extract:
  - Guests introduced or interviewed (not the host).
  - Topics discussed (max 6 per chunk; merge near-duplicates).
  - Quotes (self-contained, >= 20 chars, speaker labeled).

Confidence is your honest assessment: 0.9+ only when explicit, 0.5–0.8 when
inferred from context, below 0.5 means don't emit it. Skip the host — they
are not a guest. Skip filler ("um", "you know"). Return the tool call only;
do not add prose."""

EXTRACT_TOOL = {
    "name": "record_extractions",
    "description": "Emit extracted guests, topics, and quotes for this chunk.",
    "input_schema": ExtractionResult.model_json_schema(),
}

client = AsyncAnthropic()

async def extract_chunk(segments: list[dict], *, model: str) -> ExtractionResult:
    user_block = "\n".join(f"[{s['id']}] {s['text']}" for s in segments)
    resp = await client.messages.create(
        model=model,
        max_tokens=2048,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        tools=[EXTRACT_TOOL],
        tool_choice={"type": "tool", "name": "record_extractions"},
        messages=[{"role": "user", "content": user_block}],
    )
    tool_use = next(b for b in resp.content if b.type == "tool_use")
    return ExtractionResult.model_validate(tool_use.input)
```

A few details that matter:

- `tool_choice={"type": "tool", "name": "record_extractions"}` forces Claude to call the tool. No "I think it might be…" preambles, no markdown-fenced JSON to parse.
- `model.model_json_schema()` is the entire schema definition — Pydantic generates it, we don't hand-maintain it. Rename a field, ship the rename.
- `cache_control: {"type": "ephemeral"}` on the system block is the prompt-caching switch. The schema + instructions are identical across thousands of chunks; cache them once, pay 10% of input cost on the rest.

## `instructor` vs hand-rolled

[`instructor`](https://github.com/567-labs/instructor) wraps this pattern with a one-liner: `client.chat.completions.create(response_model=ExtractionResult, ...)`. It validates, retries, even handles streaming.

For a teaching series, hand-rolled wins. Forty lines of code, zero new abstractions, every behavior is debuggable in the call site. The retry loop below is six lines you can read once. The schema generation is one method. The tool wiring is the SDK call. When something misbehaves, you don't `git clone instructor` to find out why.

For production, `instructor` is a sensible upgrade — it adds streaming validation, more sophisticated retry strategies, and a wider provider matrix. The interface stays the same; swap when the line count of hand-rolled retries starts to matter.

## Chunking long transcripts

A 60-minute episode is roughly 10,000 tokens of transcript. That fits a single Sonnet call comfortably, but two problems push us to chunk anyway:

1. **Context dilution.** The model's recall drops on long inputs — topics from minute 5 get lost when the bulk of the prompt is minutes 30–60.
2. **Cache stability.** With prompt caching, the *system* block is what's cached. The user content varies per call. Smaller, more numerous calls = more cache hits, lower total cost.

The pattern: a 5-minute window, 30-second overlap, extract per chunk, merge results.

```python title="packages/enrich/src/enrich/chunker.py"
from shared_schema.extraction import ExtractionResult

WINDOW_MS = 5 * 60 * 1000      # 5 minutes
OVERLAP_MS = 30 * 1000          # 30 seconds

def windows(segments: list[dict]) -> list[list[dict]]:
    if not segments:
        return []
    end = segments[-1]["end_ms"]
    out, start = [], 0
    while start < end:
        stop = start + WINDOW_MS
        chunk = [s for s in segments if s["start_ms"] < stop and s["end_ms"] > start]
        if chunk:
            out.append(chunk)
        start = stop - OVERLAP_MS
    return out

def merge(results: list[ExtractionResult]) -> ExtractionResult:
    merged = ExtractionResult()
    seen_names: set[str] = set()
    seen_quotes: set[int] = set()
    seen_topics: dict[str, Topic] = {}
    for r in results:
        for g in r.guests:
            key = g.name.lower().strip()
            if key not in seen_names:
                seen_names.add(key)
                merged.guests.append(g)
        for q in r.quotes:
            if q.segment_id not in seen_quotes:
                seen_quotes.add(q.segment_id)
                merged.quotes.append(q)
        for t in r.topics:
            key = t.name.lower().strip()
            existing = seen_topics.get(key)
            if existing:
                existing.segment_ids = sorted({*existing.segment_ids, *t.segment_ids})
            else:
                seen_topics[key] = t
                merged.topics.append(t)
    return merged
```

The merge is naive on purpose — name-lowercase dedupe for guests, segment-id dedupe for quotes, name-lowercase union for topics. Anything sharper goes into post 4's entity-resolution pipeline. This is the cheap pass.

## Tiered routing

Not every extraction needs Sonnet. A lot of segments are filler — intros, sponsor reads, banter — and asking Sonnet "is this segment a guest introduction?" is paying for a calculator with a graphing calculator's price tag.

Tier the work:

- **Haiku (`tier="cheap"`)** — binary classifications: *Is this chunk worth extracting from?* Run on every chunk.
- **Sonnet (`tier="smart"`)** — the actual extraction. Run only on chunks Haiku flagged as substantive.

```python title="packages/enrich/src/enrich/enrich.py"
from llm_client import complete  # post 5
from .chunker import windows, merge
from .extract import extract_chunk

TRIAGE_PROMPT = """Answer yes or no: does this chunk contain a guest introduction,
a substantive topic, or a quotable statement? Filler, sponsor reads, and pure
banter are no."""

async def enrich_episode(segments: list[dict]) -> ExtractionResult:
    results = []
    for chunk in windows(segments):
        text = "\n".join(s["text"] for s in chunk)
        keep = await complete(
            system=TRIAGE_PROMPT,
            messages=[{"role": "user", "content": text}],
            tier="cheap",
        )
        if "yes" not in keep.lower():
            continue
        result = await extract_chunk(chunk, model="claude-sonnet-4-6")
        results.append(result)
    return merge(results)
```

At our reference channel's volume — a few new episodes a week — the triage pass drops Sonnet calls by 30–40%. Haiku is cheap enough that it's effectively free at this scale; the savings are real and they compound. [Post 5](/blog/provider-switching-llm-client/) is where that `tier="cheap"` argument earns its keep — the LLM client adapter maps it to `claude-haiku-4-5` for Anthropic, `gpt-4o-mini` for OpenAI, `llama3.2:3b` for Ollama.

## Retry on validation error

Even with `tool_use` forcing a schema, things slip. A guest with a 12-character `name` from a brand the model invented. A `confidence` of `1.2`. A `segment_id` that points to a segment outside the chunk.

When Pydantic raises, catch it, append the error to the prompt, retry once. Don't retry forever — at the second failure, log and move on.

```python title="packages/enrich/src/enrich/extract.py"
from pydantic import ValidationError

async def extract_chunk_with_retry(
    segments: list[dict], *, model: str
) -> ExtractionResult | None:
    try:
        return await extract_chunk(segments, model=model)
    except ValidationError as e:
        retry_user = (
            f"Your previous response failed validation:\n{e}\n\n"
            f"Re-extract from the same chunk, fixing the issue.\n\n"
            + "\n".join(f"[{s['id']}] {s['text']}" for s in segments)
        )
        try:
            resp = await client.messages.create(
                model=model,
                max_tokens=2048,
                system=[
                    {
                        "type": "text",
                        "text": SYSTEM_PROMPT,
                        "cache_control": {"type": "ephemeral"},
                    }
                ],
                tools=[EXTRACT_TOOL],
                tool_choice={"type": "tool", "name": "record_extractions"},
                messages=[{"role": "user", "content": retry_user}],
            )
            tool_use = next(b for b in resp.content if b.type == "tool_use")
            return ExtractionResult.model_validate(tool_use.input)
        except ValidationError as e2:
            logger.warning("extraction failed twice for chunk", extra={"err": str(e2)})
            return None
```

Two failures means the chunk is genuinely confusing — long table of contents, foreign-language passage, garbled captions — and the right call is to skip it, not retry it into a loop. A `None` return is data: `enrich_episode` filters it out and the metric counter ticks up.

## Prompt caching: the numbers

The system block in this code is around 1,800 input tokens once you include the Pydantic-generated JSON schema. Without caching, that's paid on every chunk. With `cache_control: {"type": "ephemeral"}`, the first chunk writes the cache (1.25× input cost) and every chunk in the next five minutes reads it (0.1× input cost).

For a 60-minute episode chunked into ~13 windows, that's:

- **Without caching**: 13 × 1,800 = 23,400 system tokens at full input price.
- **With caching**: 1,800 × 1.25 + 12 × 1,800 × 0.1 = 2,250 + 2,160 = 4,410 token-equivalents. ~5× cheaper on the system block.

The Anthropic response includes `usage.cache_creation_input_tokens` and `usage.cache_read_input_tokens` on each call. Log them; the savings show up immediately and they're how you justify the cache invalidation logic in [post 5](/blog/provider-switching-llm-client/).

## What this gives the next post

By the end of an enrich run, three tables are populated:

- `guest_mentions(id, episode_id, name, role, company, confidence)`
- `topics(id, episode_id, name, segment_ids[], confidence)`
- `quotes(id, episode_id, segment_id, text, speaker, quotability_score)`

Querying `guest_mentions` directly is misleading — a guest who's been on four times shows up as four rows, sometimes spelled four ways. Resolving those rows into a single canonical `guests` entity is its own problem, and it doesn't belong inside the extraction loop. That's [post 4 — Entity resolution: who is this guest?](/blog/guest-entity-resolution/).

*Full source: [github.com/poudelprakash/ai-podcast-index](https://github.com/poudelprakash/ai-podcast-index) (tag `series3-post3`).*

*This series is being written in parallel with the repo build. Tagged commits will be added to the repo as posts publish — the URL is the source of truth.*

<!--
Codex image prompt (21:9 cover + 16:9 thumb):
Editorial header image, no embedded text, no logos, no watermarks. A flat-design
composition: a flowing audio waveform on the left side resolves into a clean
column of structured JSON-like brackets and key-value pairs on the right, with
three small color-coded chips floating between them labeled by shape only
(circle, triangle, square) to suggest guest/topic/quote categories. Muted
editorial palette — slate blue, warm sand, a single accent of terracotta on the
chips. Subtle paper-grain texture. Sharp geometric forms, soft shadows, generous
negative space. Generate one 21:9 hero crop and one 16:9 card crop.
-->
