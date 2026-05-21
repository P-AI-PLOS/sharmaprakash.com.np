---
title: "Search without embeddings: Postgres tsvector, LLM rerank, and 30-second clips"
date: "2026-05-15T10:00:00+05:45"
excerpt: "For a few hundred podcast episodes, Postgres full-text search plus an LLM rerank beats embedding-based RAG on both quality and operational simplicity. No vector DB, no embedding pipeline."
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
tags: [ai, python, claude, postgres, fastapi, podcast, search, fts, rag]
cover: "/images/blog/ai-podcast-index/search-without-embeddings/cover.png"
thumb: "/images/blog/ai-podcast-index/search-without-embeddings/thumb.png"
series: ai-podcast-index
seriesOrder: 6
use_featured_image: true
last_modified_at: "2026-05-15T10:00:00+05:45"
---

> **Prerequisites.** This post assumes you've skimmed [the `uv-2026` series](/technical-notes/why-uv-exists/) (for the Python toolchain) and [`python-monorepo-2026`](/technical-notes/new-python-project-2026/) (for the workspace layout). Each post in *this* series stands alone if you want to dive in cold — but the package paths (`packages/api/`, `packages/shared-schema/`) and the `task` runner come from those two.

Previously: [*Building a provider-switching LLM client*](/technical-notes/provider-switching-llm-client/) — one `complete()` interface, three providers, cheap-vs-smart routing. Now we use that client for the search pipeline's second hop.

Every RAG tutorial published in the last two years opens the same way: ingest documents, chunk them, embed each chunk into a vector, store the vectors in a specialty database, then at query time embed the query and do a nearest-neighbor lookup. It is a perfectly fine architecture. It is also wildly over-engineered for a few hundred podcast episodes.

This post argues — and demonstrates — that for our reference channel's corpus size, the right answer is Postgres full-text search for recall, an LLM rerank pass for precision, and clip extraction for the UX. No `pgvector`. No embedding pipeline. No dimensionality hand-wringing.

## Why not embeddings, for now

There are three honest reasons.

**Cost at ingest.** Every transcript segment becomes a vector. A 60-minute episode is ~10k tokens of transcript split into thousands of short segments. Multiply by the channel's archive and you're paying for embedding API calls you'd rather spend on the synthesis steps that actually move the product (extraction, dedup, question generation). Local embedding models work but add a model-management problem you didn't have before.

**Operational complexity.** A vector DB is another service, another schema, another backup story. `pgvector` collapses that — same Postgres — but you still own an HNSW index, dimension choices, and a separate query path next to the SQL one. Nothing wrong with it. Just not free.

**Recall is fine at this size.** Postgres `tsvector` with English stemming + a GIN index gives you sub-50ms full-text search across hundreds of thousands of segments. Stemming handles "fundraise" / "fundraising" / "fundraised". Phrase queries (`websearch_to_tsquery`) handle multi-word intent. The gaps — synonyms, paraphrases, conceptual matches — are exactly what the LLM rerank pass closes.

The rule I keep coming back to: **add embeddings when FTS recall actually breaks**, not before. For our corpus, that's somewhere past tens of thousands of documents, and our podcast index is two orders of magnitude under that.

## The pipeline at a glance

```
user query
   │
   ▼
┌──────────────────────────────────────┐
│  FTS over transcript_segments_fts    │  ← top 50, ranked by ts_rank
│  (Postgres, GIN-indexed tsvector)    │
└──────────────────────────────────────┘
   │   top 50 candidates
   ▼
┌──────────────────────────────────────┐
│  LLM rerank (Haiku via llm_client)   │  ← top 10 + one-line justification
│  tier="cheap", schema=RerankResult   │
└──────────────────────────────────────┘
   │   top 10 segment ids
   ▼
┌──────────────────────────────────────┐
│  Clip extraction                     │  ← expand each hit into a 30–60s clip,
│  (window N segments, snap to .       │     snapped to sentence boundaries
│   sentence boundaries)               │
└──────────────────────────────────────┘
   │   ranked clips
   ▼
┌──────────────────────────────────────┐
│  Cache write + response              │  ← cache (query_hash, candidate_set)
│  with YouTube deep links             │     for 7 days
└──────────────────────────────────────┘
```

Two model calls would be cheaper still — one for rerank, none for embedding — but the rerank is the leverage point. It's where FTS recall becomes search-quality precision.

## The FTS layer

We already have a `transcript_segments` table from [post 2](/technical-notes/ingesting-youtube-transcripts/) shaped like `(id, episode_id, start_ms, end_ms, text)`. We add a `tsvector` column populated by a trigger, then index it.

```sql title="packages/api/migrations/006_transcript_segments_fts.sql"
ALTER TABLE transcript_segments
  ADD COLUMN search_tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(text, ''))) STORED;

CREATE INDEX transcript_segments_search_tsv_idx
  ON transcript_segments
  USING GIN (search_tsv);

-- A view that joins what the rerank prompt needs in one shot.
CREATE OR REPLACE VIEW transcript_segments_search AS
SELECT
  s.id            AS segment_id,
  s.episode_id,
  e.video_id,
  e.title         AS episode_title,
  s.start_ms,
  s.end_ms,
  s.text,
  s.search_tsv
FROM transcript_segments s
JOIN episodes e ON e.id = s.episode_id;
```

A **stored generated column** is the right shape here: Postgres maintains `search_tsv` for us on insert and update; no trigger to forget; no `UPDATE` migration to retroactively backfill old rows. The GIN index makes lookups logarithmic in the corpus size.

The query path:

```python title="packages/api/src/api/search/fts.py"
from dataclasses import dataclass
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection


@dataclass(frozen=True)
class Candidate:
    segment_id: int
    episode_id: int
    video_id: str
    episode_title: str
    start_ms: int
    end_ms: int
    text: str
    rank: float


_FTS_SQL = text(
    """
    SELECT
      segment_id, episode_id, video_id, episode_title,
      start_ms, end_ms, text,
      ts_rank_cd(search_tsv, q) AS rank
    FROM transcript_segments_search,
         websearch_to_tsquery('english', :query) AS q
    WHERE search_tsv @@ q
    ORDER BY rank DESC, start_ms ASC
    LIMIT :limit
    """
)


async def fts_candidates(
    conn: AsyncConnection, *, query: str, limit: int = 50
) -> list[Candidate]:
    rows = await conn.execute(_FTS_SQL, {"query": query, "limit": limit})
    return [Candidate(**dict(r._mapping)) for r in rows]
```

Three things earn their keep:

- **`websearch_to_tsquery`** parses the kind of query a human types — quoted phrases, `OR`, leading minus for negation — without you writing a parser.
- **`ts_rank_cd`** (the *cover density* variant) weights matches that appear close together in the segment higher than scattered ones. For transcripts, where one segment is ~5–10 seconds of speech, that's exactly what we want.
- **`LIMIT 50`** is deliberate. The rerank model takes ~50 short snippets comfortably; going wider mostly adds noise the LLM has to spend tokens filtering out.

A quick sanity check, run against the local DB:

```text title="$ task search:debug -- 'fundraising in Nepal'"
[fts] 50 candidates in 38ms
  1  (rank 0.412) ep_204 @ 00:14:31  "...the early fundraising landscape in Nepal was..."
  2  (rank 0.397) ep_188 @ 00:42:08  "...we raised our seed in Kathmandu, and..."
  3  (rank 0.355) ep_172 @ 01:03:55  "...angel investors here mostly come from..."
  ...
 50  (rank 0.041) ep_119 @ 00:08:17  "...fundraise next year if the runway..."
```

`ts_rank_cd` is monotone enough to be useful but flat enough that 50 candidates can include both the obvious hit (`ep_204` discussing fundraising in Nepal directly) and tangentially-related ones (`ep_119` mentioning a future fundraise in passing). That spread is the rerank's job to sort.

## The rerank pass

This is where the [provider-switching LLM client](/technical-notes/provider-switching-llm-client/) pays for itself. We send the top-50 candidates plus the user query to the *cheap* tier and ask for a ranked top-10 with a one-line justification each. Cheap, fast, structured.

```python title="packages/api/src/api/search/rerank.py"
from pydantic import BaseModel, Field
from llm_client import complete


class RerankedHit(BaseModel):
    segment_id: int
    score: float = Field(ge=0, le=1, description="0–1, higher = more relevant")
    why: str = Field(max_length=140, description="One-line justification")


class RerankResult(BaseModel):
    hits: list[RerankedHit]


_SYSTEM = """\
You are a search reranker for a podcast transcript index.

You receive a user's query and 50 candidate transcript segments retrieved by
full-text search. Return the 10 most relevant segments, ranked.

Rules:
- Prefer segments where the speaker is directly discussing the query topic.
- Demote segments where the query terms appear in passing or as off-topic asides.
- A segment is more relevant if it contains a complete thought rather than a
  partial sentence.
- Score 1.0 = a strong direct match. Score 0.5 = related but not central.
  Score below 0.3 should not appear in the output.

Return JSON matching the provided schema. Do not invent segment_ids.
"""


async def rerank(*, query: str, candidates: list[Candidate]) -> RerankResult:
    user = "QUERY:\n" + query + "\n\nCANDIDATES:\n" + "\n".join(
        f"[{c.segment_id}] {c.text}" for c in candidates
    )
    return await complete(
        system=_SYSTEM,
        messages=[{"role": "user", "content": user}],
        schema=RerankResult,
        tier="cheap",
        cache_system=True,
    )
```

A few notes that aren't obvious until you ship this:

- **The system prompt is cached.** It is identical across every query. `cache_system=True` flips on `cache_control: ephemeral` in the Anthropic adapter (see [post 5](/technical-notes/provider-switching-llm-client/)). At ingest scale that's hundreds of thousands of cached tokens per day.
- **We send `segment_id` and ask the model to echo it back.** This is the cheapest possible "structured output" — no hallucinated text, no fuzzy reconciliation. If the model returns an id we didn't send, we drop it.
- **`tier="cheap"`.** Reranking 50 short snippets is a classification-shaped task, not a synthesis task. Haiku-class models are *better* at this because they're less likely to over-explain. Smart-tier here is a waste of money.
- **`why` is bounded.** 140 chars is enough for "Speaker walks through their own Series A pitch in Nepal" and short enough that the model can't ramble.

One response, lightly cleaned, looks like:

```json
{
  "hits": [
    { "segment_id": 81204, "score": 0.94, "why": "Founder describes their own Nepal fundraising round in detail." },
    { "segment_id": 79018, "score": 0.88, "why": "Guest contrasts Nepali angel scene with India in 2024." },
    { "segment_id": 76553, "score": 0.71, "why": "Quick mention of fundraising regulation changes in Nepal." },
    ...
  ]
}
```

## Clip extraction

A search hit is a single segment — typically 1–10 seconds of speech, often a partial sentence. That's a terrible thing to drop a user into. What we actually want to surface is a **clip**: 30–60 seconds of surrounding context, snapped to sentence boundaries where possible.

```python title="packages/api/src/api/search/clips.py"
from dataclasses import dataclass

MIN_CLIP_MS = 30_000
MAX_CLIP_MS = 60_000
SENTENCE_END = ".!?"


@dataclass(frozen=True)
class Clip:
    episode_id: int
    video_id: str
    episode_title: str
    start_ms: int
    end_ms: int
    text: str
    hit_segment_id: int


async def build_clip(conn, *, hit: Candidate) -> Clip:
    # Pull a generous window of neighbors, then trim to the target span.
    rows = (
        await conn.execute(
            text(
                """
                SELECT id, start_ms, end_ms, text
                FROM transcript_segments
                WHERE episode_id = :episode_id
                  AND start_ms BETWEEN :lo AND :hi
                ORDER BY start_ms
                """
            ),
            {
                "episode_id": hit.episode_id,
                "lo": max(0, hit.start_ms - MAX_CLIP_MS),
                "hi": hit.end_ms + MAX_CLIP_MS,
            },
        )
    ).all()

    # Center the window on the hit, then expand outward until we hit
    # min duration OR a sentence boundary, capped at max duration.
    center = next(i for i, r in enumerate(rows) if r.id == hit.segment_id)
    lo = hi = center
    while True:
        span = rows[hi].end_ms - rows[lo].start_ms
        boundary_ok = rows[lo].text.lstrip()[:1].isupper() or lo == 0
        boundary_ok &= rows[hi].text.rstrip()[-1:] in SENTENCE_END or hi == len(rows) - 1
        if span >= MIN_CLIP_MS and boundary_ok:
            break
        if span >= MAX_CLIP_MS:
            break
        if lo > 0:
            lo -= 1
        if hi < len(rows) - 1:
            hi += 1
        if lo == 0 and hi == len(rows) - 1:
            break

    return Clip(
        episode_id=hit.episode_id,
        video_id=hit.video_id,
        episode_title=hit.episode_title,
        start_ms=rows[lo].start_ms,
        end_ms=rows[hi].end_ms,
        text=" ".join(r.text for r in rows[lo : hi + 1]),
        hit_segment_id=hit.segment_id,
    )
```

The shape of this is more important than the exact numbers:

- **A floor and a ceiling.** Below 30 seconds the clip is too short to follow; above 60 seconds it's no longer a clip, it's a chapter. Anything in between is acceptable.
- **Expand outward, not just forward.** The hit segment can land anywhere — start of a thought, end of a thought, middle of a tangent. Expanding both ways gives a balanced clip.
- **Snap to sentence boundaries when possible, give up gracefully when not.** Auto-captions sometimes don't punctuate. We don't want the algorithm to loop forever waiting for a period that's never coming, so we fall back to the duration cap.

The cap behavior — *"give up gracefully when the data is messy"* — is the kind of thing you only notice the third time you ship something like this. Worth writing down.

## YouTube deep links

The whole point of a clip card is that the user clicks it and lands at the right second of the video.

```python
def youtube_deep_link(video_id: str, start_ms: int) -> str:
    return f"https://youtu.be/{video_id}?t={start_ms // 1000}"
```

YouTube rounds to the second; that's fine — we already overshoot the clip start by a hair (the sentence-boundary expansion). A user landing on the start of a complete sentence beats a user landing mid-word every time.

The API response, then, is just this:

```python title="packages/api/src/api/search/router.py"
class SearchHit(BaseModel):
    video_id: str
    episode_title: str
    start_ms: int
    end_ms: int
    text: str
    youtube_url: str
    score: float
    why: str


class SearchResponse(BaseModel):
    query: str
    hits: list[SearchHit]
    cached: bool


@router.get("/search", response_model=SearchResponse)
async def search(q: str, conn: AsyncConnection = Depends(get_conn)) -> SearchResponse:
    cached = await search_cache_get(conn, query=q)
    if cached is not None:
        return SearchResponse(query=q, hits=cached, cached=True)

    candidates = await fts_candidates(conn, query=q, limit=50)
    if not candidates:
        return SearchResponse(query=q, hits=[], cached=False)

    reranked = await rerank(query=q, candidates=candidates)
    by_id = {c.segment_id: c for c in candidates}
    clips = [
        await build_clip(conn, hit=by_id[h.segment_id])
        for h in reranked.hits
        if h.segment_id in by_id
    ]
    hits = [
        SearchHit(
            video_id=c.video_id,
            episode_title=c.episode_title,
            start_ms=c.start_ms,
            end_ms=c.end_ms,
            text=c.text,
            youtube_url=youtube_deep_link(c.video_id, c.start_ms),
            score=h.score,
            why=h.why,
        )
        for c, h in zip(clips, reranked.hits)
    ]
    await search_cache_put(conn, query=q, hits=hits)
    return SearchResponse(query=q, hits=hits, cached=False)
```

## Caching the rerank

The expensive hop is the rerank — every other step is sub-50ms Postgres. So we cache the *output of the whole pipeline*, keyed by a hash of `(normalized_query, candidate_id_set)`. Two identical queries return instantly; a query that's nearly identical but pulls slightly different FTS candidates does the rerank again (rare; the FTS result for a stable corpus is stable).

```sql title="packages/api/migrations/007_search_cache.sql"
CREATE TABLE search_cache (
  cache_key       text PRIMARY KEY,
  query           text NOT NULL,
  candidate_hash  text NOT NULL,
  hits_json       jsonb NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX search_cache_created_at_idx ON search_cache (created_at);
```

```python title="packages/api/src/api/search/cache.py"
import hashlib
import json
from datetime import timedelta

CACHE_TTL = timedelta(days=7)


def _key(query: str, candidate_ids: list[int]) -> tuple[str, str]:
    norm = " ".join(query.lower().split())
    candidate_hash = hashlib.sha256(
        ",".join(str(i) for i in sorted(candidate_ids)).encode()
    ).hexdigest()[:16]
    return hashlib.sha256(f"{norm}|{candidate_hash}".encode()).hexdigest(), candidate_hash
```

A 7-day TTL is the sweet spot: long enough that repeat traffic is free, short enough that new episodes change the candidate set before the cache outlives its usefulness. A weekly `task search:cache:prune` (covered in [post 8](/technical-notes/question-generator-and-shipping-locally/)) drops stale rows.

## A real query, end to end

```text title="$ http :8000/api/search q=='fundraising in Nepal'"
HTTP/1.1 200 OK
content-type: application/json

{
  "query": "fundraising in Nepal",
  "cached": false,
  "hits": [
    {
      "video_id": "abc123",
      "episode_title": "Ep 204 — Building Khalti, with Binay Mainali",
      "start_ms": 854000,
      "end_ms": 902000,
      "text": "So when we tried to raise our Series A in Nepal, the angel
               base was maybe twenty people. We ended up...",
      "youtube_url": "https://youtu.be/abc123?t=854",
      "score": 0.94,
      "why": "Founder describes their own Nepal fundraising round in detail."
    },
    ...
  ]
}
```

48ms FTS + ~600ms rerank + ~30ms clip building. Under a second cold, instant on cache hit. Without embeddings.

## When you *should* add embeddings

Three signals, any one of which would push me to layer in `pgvector` on top of this:

1. **Recall is actually breaking.** Users search for "raising money in South Asia" and miss the obvious Khalti episode about fundraising in Nepal because no segment contains both *raising* and *South Asia* literally. FTS stemming handles inflection, not concepts.
2. **The corpus is past ~50k segments.** Cover-density ranking starts to flatten and the rerank prompt's top-50 begins to miss things.
3. **Multilingual.** Our reference channel is English-heavy; the day it isn't, FTS with the `english` config stops being enough and embeddings become structurally necessary, not just nice-to-have.

When that day arrives, the path is short: add a `pgvector` column to `transcript_segments`, embed each segment at ingest, and turn the FTS query into a hybrid — `tsvector` match `UNION` vector neighbors, both feeding the same rerank. Same Postgres. No new infra. The rerank pass is provider-agnostic and corpus-agnostic; only the recall layer changes shape. That's a sequel post, not a v1 problem.

---

Next: [the React side — guest pages, search UI, and codegen'd types](/technical-notes/react-frontend-for-podcast-index/). The search response shape we just built is what the frontend's `useSearch(query)` hook consumes.

*Full source: [github.com/poudelprakash/ai-podcast-index](https://github.com/poudelprakash/ai-podcast-index) (tag `series3-post6`). This series is being written in parallel with the repo build — tagged commits will be added as posts publish, and the URL is the source of truth.*

<!--
Codex image prompt (cover, 21:9; thumb, 16:9 crop of the same composition):
Editorial hero illustration for a technical blog post titled "Search without
embeddings: Postgres tsvector, LLM rerank, and 30-second clips." A stylized,
calm composition showing a glowing magnifying glass passing over a horizontal
filmstrip of podcast waveform segments; a thin abstract pipeline thread runs
from the magnifying glass into a small node labeled implicitly by shape (no
literal text), suggesting a rerank step, then out to a single highlighted
clip. Warm editorial palette built around deep indigo, soft amber accents,
muted cream background. Subtle paper grain. Flat, geometric, generous
negative space. No embedded text, no logos, no watermarks, no UI chrome, no
human figures. Cinematic but understated; matches a serif-and-grid editorial
website. 21:9 aspect ratio for cover; identical composition cropped to 16:9
for thumb.
-->
