---
title: "Structured extraction with Pydantic + Claude: guests, topics, and quotes from raw transcripts"
date: "2026-05-04T10:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "Schema-first prompting with Pydantic + Anthropic tool use, a Haiku triage pass that gates Sonnet extraction, prompt caching for the system block, and a single retry that feeds the validation error back into the prompt."
cover: "/images/blog/clipdex/structured-extraction-with-claude/cover.png"
thumb: "/images/blog/clipdex/structured-extraction-with-claude/thumb.png"
last_modified_at: "2026-05-04T10:00:00+05:45"
use_featured_image: true
tags: ["ai", "python", "claude", "pydantic", "anthropic", "podcast"]
series: clipdex
seriesOrder: 3
---

> Assumes you've read [`uv-2026`](/blog/why-uv-exists/) (for the toolchain) and [`python-monorepo-2026`](/blog/python-monorepo-2026-why/) (for the layout) — though each post stands alone if you skim those concepts.

[Post 2 — Ingesting YouTube transcripts honestly](/blog/ingesting-youtube-transcripts/) ended with rows in `transcript_segments`: `(video_id, seq, start_ms, end_ms, text, source)`. Useful, but inert. To search by guest, filter by topic, or generate questions grounded in what someone *actually said*, the transcripts need structure.

This post turns raw segments into three Pydantic models — `GuestMention`, `Topic`, `Quote` — using Claude with hand-rolled JSON-schema prompting, a Haiku triage pass that gates the more expensive Sonnet extraction, prompt caching on the system block, and a single retry that feeds the validation error back to the model. No `instructor`, no LangChain, no magic — every line you can read and reason about.

The package lives at `packages/enrich/src/clipdex_enrich/`. Run it with `task enrich` (full sweep) or `task enrich -- <video_id>` (one video).

## The extraction targets

Three categories, three models, one container. They live in `packages/shared-schema/` so the FastAPI side and the codegen'd TypeScript types on the React side both pull from the same source (the killer argument from [the monorepo series](/blog/python-monorepo-2026-shared-schema/)).

```python title="packages/shared-schema/src/clipdex_schema/enrich.py"
from pydantic import BaseModel, Field


class GuestMention(BaseModel):
    name: str = Field(description="Full name of the guest as introduced.")
    role: str | None = Field(default=None, description="Job title or role, if mentioned.")
    company: str | None = Field(default=None, description="Company or organization, if mentioned.")
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence the mention is a real guest (0–1).")


class Topic(BaseModel):
    name: str = Field(description="Short topic label (3–6 words).")
    segment_ids: list[int] = Field(description="Transcript segment `seq` numbers where the topic appears.")
    confidence: float = Field(ge=0.0, le=1.0)


class Quote(BaseModel):
    text: str = Field(description="The quoted text, verbatim from the transcript.")
    segment_id: int = Field(description="Transcript segment `seq` where the quote starts.")
    speaker: str | None = Field(default=None, description="Speaker name, if known.")
    quotability_score: float = Field(ge=0.0, le=1.0, description="How shareable / standalone the quote is (0–1).")


class Extraction(BaseModel):
    """Top-level container returned by the extractor for a single chunk."""

    guests: list[GuestMention] = Field(default_factory=list)
    topics: list[Topic] = Field(default_factory=list)
    quotes: list[Quote] = Field(default_factory=list)
```

A few things worth pointing out:

- **`confidence` everywhere.** The LLM is asked to self-grade. That number is what [post 4](/blog/guest-entity-resolution/) uses to decide whether a `GuestMention` is auto-merged or sent through fuzzy matching.
- **`segment_ids` instead of free-form citations.** The model points at the transcript row, not a copy of the text. Cheaper, verifiable, and lets us reconstruct the source on demand.
- **`speaker` is a free string, not an enum.** Early drafts had `Literal["host", "guest"]`, but real transcripts don't carry speaker labels — the model would just guess. Letting it return `None` when unsure (or a name when explicit) is more honest. Post 4 cleans this up.
- **No `id` fields.** Postgres assigns those on insert. The model's job is to extract; the worker's job is to persist.

## Chunking long transcripts

A 60-minute episode is roughly 10,000 tokens of transcript. That fits a single Sonnet call comfortably, but two reasons push us to chunk anyway:

1. **Context dilution.** Recall drops on long inputs — topics from minute 5 get lost when the bulk of the prompt is minutes 30–60.
2. **Cache stability.** With prompt caching, the system block is what's cached. Smaller, more numerous calls means more cache hits per dollar of input.

5-minute window, 30-second overlap. Segments whose start falls inside the window get included; borderline segments appear in two adjacent chunks, which is exactly the point of the overlap.

```python title="packages/enrich/src/clipdex_enrich/chunk.py"
from dataclasses import dataclass
from clipdex_schema import TranscriptSegment


@dataclass(frozen=True)
class Chunk:
    start_ms: int
    end_ms: int
    segments: list[TranscriptSegment]

    def to_prompt_text(self) -> str:
        return "\n".join(f"[{s.seq}] {s.text.strip()}" for s in self.segments)


def chunk_segments(
    segments: list[TranscriptSegment],
    *,
    window_seconds: int = 300,
    overlap_seconds: int = 30,
) -> list[Chunk]:
    if not segments:
        return []
    window_ms = window_seconds * 1000
    stride_ms = window_ms - overlap_seconds * 1000
    if stride_ms <= 0:
        raise ValueError("overlap must be smaller than window")

    last_end = segments[-1].end_ms
    chunks, start = [], 0
    while start < last_end:
        end = start + window_ms
        bucket = [s for s in segments if s.start_ms < end and s.end_ms > start]
        if bucket:
            chunks.append(Chunk(start_ms=start, end_ms=end, segments=bucket))
        start += stride_ms
    return chunks
```

`to_prompt_text()` formats each segment as `[seq] text` per line. That `[seq]` prefix is what lets the model cite segment numbers back to us in `Topic.segment_ids` and `Quote.segment_id`. Without the prefix the model invents IDs.

## Triage with Haiku before extracting with Sonnet

Not every chunk needs the smart model. A lot of chunks are filler — sponsor reads, music-only intros, garbled outro stings — and asking Sonnet "is this worth extracting from?" is paying for a calculator with a graphing calculator's price tag.

So: a binary Haiku classifier runs first, and only chunks that survive get the Sonnet extraction. Haiku is roughly 5× cheaper per input token and runs faster; at our reference channel's volume the savings compound.

```python title="packages/enrich/src/clipdex_enrich/router.py"
from anthropic import AsyncAnthropic
from clipdex_enrich.settings import settings

_client: AsyncAnthropic | None = None


def get_client() -> AsyncAnthropic:
    global _client
    if _client is None:
        if not settings.anthropic_api_key:
            raise RuntimeError("ANTHROPIC_API_KEY is not set; add it to .env.")
        _client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    return _client


async def is_substantive(chunk_text: str) -> bool:
    client = get_client()
    response = await client.messages.create(
        model=settings.model_cheap,  # claude-haiku-4-5
        max_tokens=8,
        system=(
            "Reply with exactly 'yes' or 'no'. "
            "Default to 'yes' unless the chunk is clearly worthless. "
            "Only answer 'no' when the entire chunk is sponsor reads, intro/outro "
            "music stings, or pure filler with no real content. Any real "
            "conversation — even short — is 'yes'."
        ),
        messages=[{"role": "user", "content": chunk_text}],
    )
    text = "".join(b.text for b in response.content if b.type == "text")
    return text.strip().lower().startswith("y")
```

Two things worth flagging:

- **The prompt biases toward `yes`.** Early drafts ("does this chunk introduce a guest?") were too narrow and dropped substantive topic chunks that happened not to have an intro. The current prompt only filters obvious garbage — and "obvious" is doing real work. A test clip of a 36-segment interview turned out to be mostly the words "winter special" repeating over corrupted captions; Haiku correctly said `no` and we saved a Sonnet call on noise.
- **`max_tokens=8`.** We need one word. Capping output forces the model to commit instead of monologuing.

The model IDs come from `settings.py` (`model_cheap = "claude-haiku-4-5"`, `model_smart = "claude-sonnet-4-6"`) so swapping providers is a one-line change. The proper provider-switching adapter lands in [post 5](/blog/provider-switching-llm-client/); for post 3, a thin direct SDK call is fine.

## Schema-first extraction with `tool_use`

Schema-first prompting means: build the JSON schema from the Pydantic model, paste it into the system prompt, and tell Claude exactly what shape to return. Combined with Anthropic's `tool_use`, the model is *forced* into a valid call — and we get a Pydantic instance on the other end instead of regex-fragile string parsing.

```python title="packages/enrich/src/clipdex_enrich/extract.py"
from anthropic import AsyncAnthropic
from pydantic import ValidationError

from clipdex_enrich.router import get_client
from clipdex_enrich.settings import settings
from clipdex_schema import Extraction

SYSTEM_PROMPT = """\
You extract structured podcast metadata from raw transcript chunks.

Each input line has the form `[N] text`, where N is the segment sequence number.
Use those Ns when reporting `segment_id` / `segment_ids`.

Extract three things:

1. **GuestMention** — people *introduced as guests* (not the host, not third
   parties merely mentioned). Set confidence high (>0.7) only when the line
   clearly introduces them. Skip ambiguous third-party mentions.
2. **Topic** — substantive topics discussed. 3–6 word labels. Cite the seq
   numbers where the topic actually appears, not just where the word appears.
3. **Quote** — standalone, quotable lines from the guest. Skip filler, skip
   the host's questions. `quotability_score` = how well it stands alone.

Return your answer by calling the `record_extraction` tool. If a category has
no entries, return an empty list for it. Never invent data — if the chunk has
no clear guest intro, return an empty `guests` list.
"""

_TOOL_NAME = "record_extraction"


def _tool_definition() -> dict:
    return {
        "name": _TOOL_NAME,
        "description": "Record the structured extraction for one transcript chunk.",
        "input_schema": Extraction.model_json_schema(),
    }


async def extract_chunk(chunk_text: str) -> Extraction:
    client: AsyncAnthropic = get_client()
    tool = _tool_definition()

    response = await client.messages.create(
        model=settings.model_smart,
        max_tokens=4096,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        tools=[tool],
        tool_choice={"type": "tool", "name": _TOOL_NAME},
        messages=[{"role": "user", "content": chunk_text}],
    )

    tool_input = _first_tool_input(response)
    try:
        return Extraction.model_validate(tool_input)
    except ValidationError as e:
        # Retry once with the error fed back in.
        retry_user = (
            f"Your previous tool call failed Pydantic validation:\n\n{e}\n\n"
            "Re-emit the extraction with the schema fixed. Same transcript follows.\n\n"
            f"{chunk_text}"
        )
        response = await client.messages.create(
            model=settings.model_smart,
            max_tokens=4096,
            system=[
                {
                    "type": "text",
                    "text": SYSTEM_PROMPT,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            tools=[tool],
            tool_choice={"type": "tool", "name": _TOOL_NAME},
            messages=[{"role": "user", "content": retry_user}],
        )
        return Extraction.model_validate(_first_tool_input(response))


def _first_tool_input(response) -> dict:
    for block in response.content:
        if block.type == "tool_use" and block.name == _TOOL_NAME:
            return block.input
    raise RuntimeError(
        f"model did not call {_TOOL_NAME}; stop_reason={response.stop_reason!r}"
    )
```

A few details that matter:

- `tool_choice={"type": "tool", "name": _TOOL_NAME}` *forces* Claude to call the tool. No "I think it might be…" preambles, no markdown-fenced JSON to parse.
- `Extraction.model_json_schema()` is the entire schema definition — Pydantic generates it, we don't hand-maintain it. Rename a field and the prompt updates itself.
- `cache_control: {"type": "ephemeral"}` on the system block is the prompt-caching switch. The schema + instructions are identical across thousands of chunks; cache them once, pay ~10% of input cost on every read.
- The retry path is *six lines of branching* — catch `ValidationError`, paste it back into the user prompt, retry once. If the second attempt also fails, the exception propagates up and `run.py` records the video as failed. No infinite loop, no exponential backoff for a deterministic schema mismatch.

## `instructor` vs hand-rolled

[`instructor`](https://github.com/567-labs/instructor) wraps this pattern with a one-liner: `client.chat.completions.create(response_model=Extraction, ...)`. It validates, retries, even handles streaming.

For a teaching series, hand-rolled wins. About sixty lines of code, zero new abstractions, every behavior is debuggable in the call site. When something misbehaves, you don't `git clone instructor` to find out why.

For production, `instructor` is a sensible upgrade — it adds streaming validation, more sophisticated retry strategies, and a wider provider matrix. The interface stays the same; swap when the line count of hand-rolled retries starts to matter.

## Wiring it together

The run loop is unsurprising once the pieces exist:

```python title="packages/enrich/src/clipdex_enrich/run.py"
async def enrich_video(session, video_id: str) -> dict[str, int]:
    segments = await load_segments(session, video_id)
    if not segments:
        return {"chunks": 0, "guests": 0, "topics": 0, "quotes": 0}

    chunks = chunk_segments(
        segments,
        window_seconds=settings.chunk_window_seconds,
        overlap_seconds=settings.chunk_overlap_seconds,
    )

    per_chunk = []
    for c in chunks:
        text = c.to_prompt_text()
        if not await is_substantive(text):
            log.info("enrich: %s chunk@%ds triaged out", video_id, c.start_ms // 1000)
            continue
        ex = await extract_chunk(text)
        per_chunk.append((c.start_ms, ex))

    counts = await save_extractions(session, video_id=video_id, per_chunk=per_chunk)
    return {"chunks": len(chunks), **counts}
```

`save_extractions` does the boring-but-important part: `DELETE FROM guests_raw WHERE video_id = :v` (and same for topics/quotes), `INSERT` fresh rows, and write a `done` row into `enriched_videos` — all in one transaction. Re-running on the same video is therefore safe; the previous extraction is replaced atomically. Failure goes through `mark_failed` and writes a `failed` row with the error, so the worker can be re-run and skip what's already done.

## The schema, written down

The raw tables live in `migrations/002_enrich.sql`. One row per mention, with a back-pointer to the source chunk for debugging:

```sql title="migrations/002_enrich.sql"
CREATE TABLE IF NOT EXISTS guests_raw (
    id           BIGSERIAL PRIMARY KEY,
    video_id     TEXT NOT NULL REFERENCES processed_videos(video_id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    role         TEXT,
    company      TEXT,
    confidence   REAL NOT NULL,
    chunk_start_ms INT NOT NULL,
    extracted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS topics_raw (
    id           BIGSERIAL PRIMARY KEY,
    video_id     TEXT NOT NULL REFERENCES processed_videos(video_id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    segment_ids  INT[] NOT NULL,
    confidence   REAL NOT NULL,
    chunk_start_ms INT NOT NULL,
    extracted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quotes_raw (
    id           BIGSERIAL PRIMARY KEY,
    video_id     TEXT NOT NULL REFERENCES processed_videos(video_id) ON DELETE CASCADE,
    text         TEXT NOT NULL,
    segment_id   INT NOT NULL,
    speaker      TEXT,
    quotability_score REAL NOT NULL,
    chunk_start_ms INT NOT NULL,
    extracted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enriched_videos (
    video_id      TEXT PRIMARY KEY REFERENCES processed_videos(video_id) ON DELETE CASCADE,
    status        TEXT NOT NULL CHECK (status IN ('done', 'failed')),
    chunk_count   INT,
    guest_count   INT,
    topic_count   INT,
    quote_count   INT,
    error         TEXT,
    enriched_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

The `_raw` suffix is deliberate. These are raw mentions — same person, multiple spellings, occasional invented entities. [Post 4](/blog/guest-entity-resolution/) turns `guests_raw` into a canonical `guests` table with stable IDs and an alias index. Same idea will eventually apply to topics. Quotes mostly don't need resolution.

## Prompt caching: the numbers

The system block in this code is around 1,200 input tokens once the Pydantic-generated JSON schema is included. Without caching, that's paid on every chunk. With `cache_control: {"type": "ephemeral"}`, the first chunk writes the cache (1.25× input cost) and every chunk in the next five minutes reads it (~0.1× input cost).

For a 60-minute episode chunked into ~13 windows, that's:

- **Without caching**: 13 × 1,200 = 15,600 system tokens at full input price.
- **With caching**: 1,200 × 1.25 + 12 × 1,200 × 0.1 = 1,500 + 1,440 = 2,940 token-equivalents. Around 5× cheaper on the system block.

The Anthropic response includes `usage.cache_creation_input_tokens` and `usage.cache_read_input_tokens` on every call. Log them; the savings show up immediately and they're how you justify the cache invalidation logic in [post 5](/blog/provider-switching-llm-client/).

## What's not here

A few things I deliberately didn't build into this pass:

- **Merging chunk outputs.** Each chunk's `Extraction` is stored as-is. A guest who's introduced in chunk 0 may show up again in chunk 2 — that's two rows in `guests_raw`. Dedup is post 4's problem; doing it inside the extraction loop tangles two concerns.
- **A real cost-tracking layer.** I log `usage` per call but don't aggregate it. Once the LLM client lands in post 5, that becomes one place to instrument.
- **Concurrency.** The loop is sequential. Anthropic can absolutely handle parallel calls, but at this corpus size it doesn't matter — and parallelism complicates the retry semantics in interesting ways. The optimization belongs after measuring, not before.
- **Tests.** This package has none yet. The integration test is "run it against `1KrkVCFtAt8` and look at the rows" — fine for now, less fine once there are seven extraction models and three retry paths.

## What this gives the next post

By the end of an enrich run, three tables are populated, plus an `enriched_videos` progress row per video. The next problem is that `guests_raw` is full of variant spellings of the same person — *Akit*, *Akit Adhikari*, *Aakkit A.* — and querying it directly is misleading. Resolving raw mentions into canonical entities with stable IDs is its own problem, and it doesn't belong inside the extraction loop.

That's [post 4 — Entity resolution: who is this guest?](/blog/guest-entity-resolution/).

*Full source: [github.com/poudelprakash/clipdex](https://github.com/poudelprakash/clipdex) (tag `series3-post3`).*

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
