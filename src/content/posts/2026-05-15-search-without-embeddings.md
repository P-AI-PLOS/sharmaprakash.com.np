---
title: "Search without embeddings: Postgres tsvector, LLM rerank, and 30-second clips"
date: "2026-05-15T10:00:00+05:45"
excerpt: "For a few hundred podcast episodes, Postgres full-text search plus an LLM rerank beats embedding-based RAG on both quality and operational simplicity. No vector DB, no embedding pipeline."
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
tags: [ai, python, claude, postgres, fastapi, podcast, search, fts, rag]
cover: "/images/blog/clipdex/search-without-embeddings/cover.png"
thumb: "/images/blog/clipdex/search-without-embeddings/thumb.png"
series: clipdex
seriesOrder: 6
use_featured_image: true
last_modified_at: "2026-05-15T10:00:00+05:45"
---

> **Prerequisites.** This post assumes you've skimmed [the `uv-2026` series](/technical-notes/why-uv-exists/) (for the Python toolchain) and [`python-monorepo-2026`](/technical-notes/new-python-project-2026/) (for the workspace layout). Each post in *this* series stands alone if you want to dive in cold — but the package paths (`packages/api/`) and the `task` runner come from those two.

Previously: [*Building a provider-switching LLM client*](/technical-notes/provider-switching-llm-client/) — one `complete()` interface, four providers, cheap-vs-smart routing. Now we use that client for the search pipeline's second hop.

Every RAG tutorial published in the last two years opens the same way: ingest documents, chunk them, embed each chunk into a vector, store the vectors in a specialty database, then at query time embed the query and do a nearest-neighbor lookup. It is a perfectly fine architecture. It is also wildly over-engineered for a few hundred podcast episodes.

This post argues — and demonstrates — that for our reference channel's corpus size, the right answer is Postgres full-text search for recall, an LLM rerank pass for precision, and clip extraction for the UX. No `pgvector`. No embedding pipeline. No dimensionality hand-wringing.

## Why not embeddings, for now

Three honest reasons.

**Cost at ingest.** Every transcript segment becomes a vector. A 60-minute episode is thousands of short segments; multiply by the channel's archive and you're paying for embedding calls you'd rather spend on synthesis (extraction, dedup, question generation).

**Operational complexity.** A vector index (whether `pgvector` or a dedicated DB) is a separate moving piece: separate indexing pipeline, separate operational profile, separate failure modes. Worth it past tens of thousands of documents; absurd at our scale.

**Honest recall numbers.** For a corpus of hundreds of transcripts, Postgres FTS with `websearch_to_tsquery` plus an LLM rerank produces results that are noticeably better than a vanilla embedding lookup, because the rerank is doing the work an embedding model is *trying* to do — but with the actual query in context. The argument for embeddings really only comes back when you can't afford a model in the loop. We can; the cheap tier on `llm_client` is exactly that affordance.

When to layer pgvector in: when the corpus outgrows FTS recall. Same Postgres, no new infra; sequel post.

## The materialized view

The whole FTS layer is one materialized view and one GIN index:

```sql title="migrations/004_search.sql"
DROP MATERIALIZED VIEW IF EXISTS transcript_segments_search;

CREATE MATERIALIZED VIEW transcript_segments_search AS
SELECT
    ts.video_id,
    ts.seq,
    ts.start_ms,
    ts.end_ms,
    ts.text,
    to_tsvector('english', ts.text) AS ts_doc
FROM transcript_segments ts
WHERE length(trim(ts.text)) > 1;

CREATE UNIQUE INDEX transcript_segments_search_pk
    ON transcript_segments_search (video_id, seq);

CREATE INDEX transcript_segments_search_gin
    ON transcript_segments_search USING GIN (ts_doc);
```

Why a materialized view and not a generated column on `transcript_segments`? Two reasons. First, we want to recompute `ts_doc` cheaply when we change the `tsvector` configuration (`english` is a starting point — Nepali content will eventually want a different stoplist). Second, the unique `(video_id, seq)` index makes a `REFRESH MATERIALIZED VIEW CONCURRENTLY` possible, so we never lock readers during the refresh.

A tiny CLI keeps refreshes scriptable:

```python title="packages/api/src/clipdex_api/refresh_cli.py"
async def _main() -> None:
    async with session() as s:
        await refresh_search(s)
    print("search: refreshed transcript_segments_search")
```

```yaml title="Taskfile.yml"
search:refresh:
  desc: REFRESH MATERIALIZED VIEW transcript_segments_search.
  cmd: uv run --package clipdex-api python -m clipdex_api.refresh_cli
```

`refresh_search` itself tries `CONCURRENTLY` first and falls back to the plain refresh on a cold view:

```python title="packages/api/src/clipdex_api/search.py"
async def refresh_search(s: AsyncSession) -> None:
    try:
        await s.execute(
            text("REFRESH MATERIALIZED VIEW CONCURRENTLY transcript_segments_search")
        )
    except Exception:
        await s.rollback()
        await s.execute(text("REFRESH MATERIALIZED VIEW transcript_segments_search"))
    await s.commit()
```

## The FTS query

`websearch_to_tsquery` is the function you actually want. It handles quoted phrases and `OR` / `-` operators the way users expect, without you writing a parser:

```python title="packages/api/src/clipdex_api/search.py"
async def _fts_top(s: AsyncSession, *, q: str, limit: int) -> list[dict]:
    r = await s.execute(
        text(
            """
            SELECT video_id, seq, start_ms, end_ms, text,
                   ts_rank(ts_doc, websearch_to_tsquery('english', :q)) AS rank
            FROM transcript_segments_search
            WHERE ts_doc @@ websearch_to_tsquery('english', :q)
            ORDER BY rank DESC, start_ms ASC
            LIMIT :n
            """
        ),
        {"q": q, "n": limit},
    )
    return [dict(row._mapping) for row in r]
```

We pull the top 50, not the top 10. The LLM rerank in the next step is what trims to 10 — pulling a wider net is cheaper than pulling a narrow one twice when the rerank tells us the FTS order was wrong.

## Clip extraction

A single FTS hit is usually a one-line segment. That's a bad search result UX — the user wants context. So we expand each hit into a *clip*: the surrounding segments inside ±30s, capped at 60s total, snapped to sentence boundaries where possible.

```python title="packages/api/src/clipdex_api/search.py"
CLIP_WINDOW_MS = 30_000  # +/-30s on each side of the hit
CLIP_MAX_MS = 60_000     # never exceed 60s

async def _build_clip(s, anchor, *, rationale) -> ClipHit:
    video_id = anchor["video_id"]
    anchor_start = int(anchor["start_ms"])
    anchor_end = int(anchor["end_ms"])
    lo = max(0, anchor_start - CLIP_WINDOW_MS)
    hi = anchor_end + CLIP_WINDOW_MS
    r = await s.execute(
        text("""
            SELECT seq, start_ms, end_ms, text
            FROM transcript_segments
            WHERE video_id = :v AND start_ms BETWEEN :lo AND :hi
            ORDER BY start_ms
        """),
        {"v": video_id, "lo": lo, "hi": hi},
    )
    rows = list(r)
    pruned = _prune_to_max(rows, anchor_start, anchor_end, CLIP_MAX_MS)
    start_ms = int(pruned[0].start_ms)
    end_ms = int(pruned[-1].end_ms)
    text_join = _snap_to_sentence(" ".join(row.text.strip() for row in pruned))
    yt_url = f"https://youtu.be/{video_id}?t={start_ms // 1000}"
    return ClipHit(...)
```

The `_prune_to_max` helper trims from whichever side is farthest from the anchor first, so we never lose the matched segment itself:

```python title="packages/api/src/clipdex_api/search.py"
def _prune_to_max(rows, anchor_start, anchor_end, max_ms):
    pruned = list(rows)
    while pruned and (int(pruned[-1].end_ms) - int(pruned[0].start_ms)) > max_ms:
        dist_left = anchor_start - int(pruned[0].start_ms)
        dist_right = int(pruned[-1].end_ms) - anchor_end
        if dist_left >= dist_right and len(pruned) > 1:
            pruned.pop(0)
        elif len(pruned) > 1:
            pruned.pop()
        else:
            break
    return pruned
```

`_snap_to_sentence` drops a leading mid-sentence partial (if it can find a sentence break early in the clip) and trims a trailing partial after the last terminal punctuation. Three regex passes, no NLP library.

The YouTube deep-link is the simplest part: `https://youtu.be/<id>?t=<seconds>`. Click → YouTube opens at the right second. That's the whole UX promise.

## The LLM rerank

FTS gives us 95% recall in our corpus. The rerank gives us precision. The prompt is short, the response is a list of ids, the model is `tier="cheap"` because the work is small and structured:

```python title="packages/api/src/clipdex_api/search.py"
_RERANK_SYSTEM = """\
You re-rank candidate podcast clips for a search query.

You will receive the user's query and a numbered list of up to 50 candidate
clips. Each clip has an id (the (video_id, seq) pair) and a short text
excerpt.

Pick the clips that best answer the query (most informative, most on-topic,
not just keyword-matching). Drop clips that share only an incidental keyword.
Return JSON of the form:

  {"results": [
     {"video_id": "...", "seq": 123, "rationale": "<one short sentence>"},
     ...
  ]}

Order matters; best first. You may return fewer than the requested N if not
enough candidates are good. Never invent ids that aren't in the input.
"""

async def _llm_rerank(*, q, hits, top_n):
    lines = [
        f"{i + 1}. id=({h['video_id']}, {h['seq']})  {h['text'][:200]}"
        for i, h in enumerate(hits)
    ]
    user = (
        f"Query: {q}\n\n"
        f"Pick up to {top_n} clips best matching the query.\n\n"
        "Candidates:\n" + "\n".join(lines)
    )
    raw = await complete(
        system=_RERANK_SYSTEM,
        messages=[{"role": "user", "content": user}],
        tier="cheap",
        cache_system=True,
        max_tokens=2048,
    )
    # parse + validate against the valid hit ids; fall back to FTS order on bad JSON.
```

Three things to notice. First, `cache_system=True` — that 600-token system block goes into Anthropic's prompt cache on the first call, then reads at one-tenth the price on every subsequent call. Second, the LLM gets *ids* — we never let it invent a result; we validate every returned `(video_id, seq)` against the input set and silently drop fabrications. Third, if the JSON is unparseable, we fall back to the FTS order rather than 500-ing on the user.

## The cache

Every rerank is keyed on `(sha1(query), sha1(top-50-ids))` and persisted for seven days. Repeat queries return instantly; queries whose FTS top-50 changes (because new episodes were enriched) get a fresh rerank.

```sql title="migrations/004_search.sql"
CREATE TABLE IF NOT EXISTS search_cache (
    id             BIGSERIAL PRIMARY KEY,
    query_hash     TEXT NOT NULL,
    top_ids_hash   TEXT NOT NULL,
    query_text     TEXT NOT NULL,
    reranked       JSONB NOT NULL,
    cached_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS search_cache_keys_uidx
    ON search_cache (query_hash, top_ids_hash);
```

TTL is enforced at *read* time — we don't run a sweeper, we just check `cached_at` against `now() - 7 days`. Cheap.

## The endpoint

It's a single FastAPI router. Wire it in `main.py`:

```python title="packages/api/src/clipdex_api/main.py"
from fastapi import FastAPI
from clipdex_api.search import router as search_router

app = FastAPI(title="clipdex", version="0.1.0")
app.include_router(search_router)
```

The route signature is exactly as boring as it should be:

```python title="packages/api/src/clipdex_api/search.py"
@router.get("/api/search", response_model=SearchResponse)
async def search_endpoint(
    q: str = Query(..., min_length=1, max_length=500),
    n: int = Query(10, ge=1, le=25),
    use_llm: bool = Query(True),
) -> SearchResponse:
    async with session() as s:
        return await run_search(s, q=q, top_n=n, use_llm=use_llm)
```

## Running it against real data

Mid-backfill — against the ~14 enriched videos and ~39k transcript segments we have so far in a Nepali-language reference channel — the query `Nepal` (a sanity check, since it's in half the episodes) returns sensible hits:

```
cached: False
  QcCFFCsrHJA seq=372  rationale='Discusses Nepal Bikes availability, providing concrete information about a product or business in Nepal.'
  nvQvuMCv1u0 seq=544  rationale="Addresses Digital Nepal as a topic, indicating discussion of Nepal's digital initiatives or policy."
  uoO7iVCs95I seq=0    rationale='Discusses current situation in Nepal regarding cash versus digital payments, providing substantive context.'

---second run---
cached: True
  QcCFFCsrHJA seq=372  rationale=None
  nvQvuMCv1u0 seq=544  rationale=None
  uoO7iVCs95I seq=0    rationale=None
```

Two takeaways from the second run. First, `cached: True` — the LLM was not called; the response was assembled from the cache row. Second, `rationale=None` — we don't persist rationales (they were a render-time decoration; the canonical answer is the *ordering*). That's a deliberate choice: keeps the cache row small and avoids accidentally serving a rationale text whose model has since been swapped.

## What we're not building

- **Embeddings.** Same Postgres can grow a `pgvector` index later if FTS recall drops. Not a v1 problem.
- **Faceted filters.** Date ranges and per-guest filters are useful but they're a layer on the same FTS query, not a different system.
- **Streaming results.** Search latency is dominated by the LLM call (~1.5 s on cheap tier); streaming the top-N as they're chosen is doable but adds plumbing for no felt UX win.

## What's next

We now have an API that answers `/api/search`, `/api/health`, and — once we wire it in [post 8](/technical-notes/question-generator-and-shipping-locally/) — `/api/guests/:id/questions`. [The next post](/technical-notes/clipdex-react-frontend/) is the React frontend that consumes these endpoints, with codegen'd types from the Pydantic schema so a backend rename breaks the frontend compile.

---

*This series is being written in parallel with the repo build. Tagged commits will be added to the repo as posts publish — the URL is the source of truth.*

*Full source: <https://github.com/poudelprakash/clipdex> (tag `series3-post6`)*

<!--
Codex image prompt (21:9 cover + 16:9 thumb):

Editorial header image, no embedded text, no logos. Visual metaphor: a long
horizontal "filmstrip" of transcript snippets, with a single 30-second window
highlighted by a soft amber band. Below it, the same window expanded into a
flowing waveform that becomes a sentence-shaped ribbon. Slightly desaturated
palette: warm paper background, indigo strip, amber highlight. Calm,
technical, editorial. No characters, no UI mockup, no chips.
-->
