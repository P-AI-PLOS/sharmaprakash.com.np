---
title: "The question generator, the cron job, and shipping it locally"
date: "2026-05-17T10:00:00+05:45"
excerpt: "Grounded question generation is one prompt away. Wrap the project with a local cron, a one-line backup, and a popular-guests landing query — and the podcast index runs on its own."
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
tags: [ai, python, claude, fastapi, react, podcast, cron, launchd, postgres]
cover: "/images/blog/clipdex/question-generator-and-shipping-locally/cover.png"
thumb: "/images/blog/clipdex/question-generator-and-shipping-locally/thumb.png"
series: clipdex
seriesOrder: 8
use_featured_image: true
last_modified_at: "2026-05-17T10:00:00+05:45"
---

> Assumes you've read the [`uv-2026`](/technical-notes/why-uv-exists/) series for the toolchain and [`python-monorepo-2026`](/technical-notes/python-monorepo-with-uv-workspaces/) for the layout — though this post stands alone if you skim those concepts.

[The previous post](/technical-notes/clipdex-react-frontend/) left one route unimplemented: `POST /api/guests/:id/questions`, the "generate questions for a return episode" button. This post implements it, wraps the project in a local cron, and writes the closer.

## The grounded prompt

The whole point of the feature is that the questions aren't generic. A return guest has already been on the show — their own prior statements are the raw material for the next interview. The model should never have to fall back to "what's your origin story?" because we've handed it ten or fifteen things the guest has already said.

The shape of the input is therefore: canonical name + the topics they discussed (with frequencies) + their top quotes (each tagged with a small integer id). The shape of the output is a list of questions, each referencing one or more of those quote ids:

```python title="packages/shared-schema/src/clipdex_schema/api.py"
class QuoteRef(BaseModel):
    text: str
    video_id: str
    youtube_url: str

class Question(BaseModel):
    text: str
    rationale: str
    grounded_in: list[QuoteRef]

class QuestionSet(BaseModel):
    guest_id: str
    generated_at: datetime
    questions: list[Question]
```

Internally we don't ask the LLM to repeat the entire `QuoteRef` shape back — that's wasteful tokens and a recipe for fabricated urls. We hand it ids and resolve them back into `QuoteRef`s on the server:

```python title="packages/api/src/clipdex_api/questions.py"
class _LlmQuestion(BaseModel):
    text: str
    rationale: str
    grounded_in: list[int]   # quote ids only

class _LlmQuestionSet(BaseModel):
    questions: list[_LlmQuestion]
```

The system prompt is short and explicit about grounding:

```python title="packages/api/src/clipdex_api/questions.py"
SYSTEM_PROMPT = """\
You generate follow-up interview questions for a podcast guest's *return*
episode. You will receive:

- The guest's canonical name.
- A list of topics they discussed in prior appearances (with counts).
- A list of memorable quotes from prior appearances, each tagged with an id.

Generate up to 10 questions. Each question must:

1. Reference at least one of the supplied quotes (by id) in ``grounded_in``.
2. Build on what the guest has already said — never a generic icebreaker.
3. Be specific enough that the answer would be different from the first
   episode's answer.

Reply by filling in the structured response. If the supplied context is too
thin to ground 10 good questions, return fewer rather than padding.
"""
```

The call site is unsurprising — `llm_client` does all the provider work:

```python title="packages/api/src/clipdex_api/questions.py"
raw = await complete(
    system=SYSTEM_PROMPT,
    messages=[{"role": "user", "content": user}],
    schema=_LlmQuestionSet,
    tier="smart",
    cache_system=True,
    max_tokens=2048,
)
assert isinstance(raw, _LlmQuestionSet)

out: list[Question] = []
for lq in raw.questions:
    grounded = [
        ctx.quotes[i] for i in lq.grounded_in if 0 <= i < len(ctx.quotes)
    ]
    out.append(Question(text=lq.text, rationale=lq.rationale, grounded_in=grounded))
```

The bounds-check on `grounded_in` is the only adversarial-input handling we need. If the model hallucinates a quote id, the question is still returned — just without grounding — rather than crashing the response.

`tier="smart"` because this is the synthesis step where the model has to do real work; `cache_system=True` because the same system prompt is reused for every guest, so Anthropic's prompt cache reads it at one-tenth the price after the first call.

## Building the context

Quote/topic selection is one SQL query each, both keyed on the videos where the guest has appeared:

```python title="packages/api/src/clipdex_api/questions.py"
rv = await s.execute(text(
    """
    SELECT DISTINCT source_video_id AS vid
    FROM guest_aliases
    WHERE guest_id = CAST(:gid AS uuid) AND source_video_id IS NOT NULL
    """
), {"gid": guest_id})
vids = [row.vid for row in rv]

rq = await s.execute(text(
    """
    SELECT text, video_id FROM quotes_raw
    WHERE video_id = ANY(:vids)
    ORDER BY quotability_score DESC LIMIT 15
    """
), {"vids": vids})
```

Top 15 quotes by quotability score, top 20 topics by frequency. Two indexed-FK queries, ~5 ms together. The LLM call is the latency.

## What it actually produces

Mid-backfill, against the highest-content guest in the canonical table (Akit, with one source video that produced 16 topics and 10 quotes), this is a real `task` output (truncated):

```
$ curl -s -X POST http://127.0.0.1:8000/api/guests/<uuid>/questions | jq .questions[0:3]
```

```
- "Last time you said, 'Why did nobody teach us about the country?'
   — angry that social studies never taught you to question everything.
   Since then, has your 'How Do They Speak' initiative or any other
   effort actually started filling that gap? What's working, what
   isn't, and what surprised you about what young Nepalis don't know
   versus what they're hungry to learn?"
   rationale: Builds directly on quote 0 and ties it to the How Do They
   Speak initiative he mentioned…
   grounded_in: "Why did nobody teach us about the country?",
                "if you want to understand how Nepal actually works…"

- "You framed your work as motivated by 'love for the country... love
   for people.' A year (or however long) of doing this work later — has
   that love been tested? Are there moments where cynicism crept in,
   and how do you tell the difference between loving the country and
   being naive about it?"
   rationale: Probes evolution of the emotional driver he stated in
   quote 1, forcing a different answer…
   grounded_in: "my love for the country. I think I'm motivated by…"

- "You once said the real question is always 'what policy is hindering
   this from happening... what policy needs to be changed so this
   problem doesn't come again and again.' Can you walk us through one
   specific policy you've been chasing since we last spoke — where it
   stands, who's blocking it, and whether systemic thinking actually
   survives contact with Singha Durbar?"
   rationale: Takes his policy-systems quote and demands a concrete case
   study post-first-episode…
   grounded_in: "It has to be what policy is hindering from happening…",
                "Exactly. So that sort of thinking is what we need…"
```

These are real questions you could open a return episode with. None of them would be reachable without the quote-grounding constraint.

## Popular guests, with a touch of recency

The home page is sorted by `0.7 × normalized_appearance_count + 0.3 × recency`. One CTE-and-cross-join SQL query does both:

```python title="packages/api/src/clipdex_api/guests.py"
WITH per_guest AS (
    SELECT g.id, g.canonical_name,
           COUNT(DISTINCT ga.source_video_id) AS apps,
           MAX(pv.published_at) AS latest
    FROM guests g
    LEFT JOIN guest_aliases ga ON ga.guest_id = g.id
    LEFT JOIN processed_videos pv ON pv.video_id = ga.source_video_id
    GROUP BY g.id, g.canonical_name
),
extents AS (
    SELECT MAX(apps) AS max_apps,
           MIN(latest) AS oldest, MAX(latest) AS newest
    FROM per_guest
)
SELECT pg.id::text AS id, pg.canonical_name, pg.apps,
       /* normalized appearance + normalized recency, both [0,1] */
       ...
ORDER BY (0.7 * norm_apps + 0.3 * recency) DESC, canonical_name ASC
LIMIT :n
```

Normalizing both inputs to `[0, 1]` keeps the weights interpretable: a guest with the most appearances *and* the most recent appearance gets a popularity of 1.0; the dustiest single-appearance guest gets close to 0. Two extremes, no scale-of-channel guesswork.

For now we run the query per request. At our corpus size that's still sub-50 ms. The honest right answer when this gets hot is a one-hour memoization in front of the route — `lru_cache` on a wrapper around `_list_guests` that returns the materialized list, keyed on `(limit,)`, with a sweeper that clears it when a new appearance gets attached. Out of scope until it shows up in a profiler.

## The cron

The whole pipeline — ingest, enrich, resolve, search refresh — is four `task` invocations. Running them at 03:00 local is one launchd plist on macOS:

```xml title="ops/launchd/com.poudelprakash.clipdex.ingest-and-enrich.plist"
<key>ProgramArguments</key>
<array>
  <string>/bin/zsh</string>
  <string>-lc</string>
  <string>cd "$WORKING_DIRECTORY" && task ingest && task enrich && task resolve && task search:refresh</string>
</array>
<key>StartCalendarInterval</key>
<dict>
  <key>Hour</key><integer>3</integer>
  <key>Minute</key><integer>0</integer>
</dict>
```

…or one systemd timer on Linux:

```ini title="ops/systemd/clipdex-nightly.timer"
[Unit]
Description=Daily clipdex ingest + enrich at 03:00

[Timer]
OnCalendar=*-*-* 03:00:00
Persistent=true
Unit=clipdex-nightly.service
```

```ini title="ops/systemd/clipdex-nightly.service"
[Service]
Type=oneshot
WorkingDirectory=%h/workspaces/clipdex
ExecStart=/bin/bash -lc 'task ingest && task enrich && task resolve && task search:refresh'
StandardOutput=append:%h/.local/state/clipdex/nightly.log
StandardError=append:%h/.local/state/clipdex/nightly.log
```

Two operational notes worth flagging. First, `task ingest` short-circuits videos it's already processed (via `processed_videos`), so re-running the whole chain is idempotent. Second, the four steps are sequenced with `&&`, so a failure in `task enrich` skips `resolve` and `search:refresh` — better to leave the world in a half-processed state we can diagnose than to layer a broken resolve on top of half-finished extraction.

## Backups

One line, but worth a paragraph because losing a multi-week enriched dataset would *suck*:

```yaml title="Taskfile.yml"
backup:
  desc: pg_dump the local DB into backups/.
  cmds:
    - mkdir -p backups
    - pg_dump clipdex > backups/clipdex-$(date +%Y%m%d-%H%M%S).sql
```

`backups/` is gitignored — sql dumps don't belong in git history. Running `task backup` after a big enrichment session writes a ~7 MB SQL file you can `psql -d clipdex_test -f` on a fresh DB to verify it restores. That's the whole backup story.

## What's next, if you wanted to productize this

Out of scope for this series, but the obvious sequel hooks:

- **Multi-channel ingest.** The ingest worker keys on `processed_videos(video_id)` and would handle a second channel today — but the "is this Anjila across two channels?" entity resolution gets harder, and the popular-guests query needs a per-channel facet.
- **Auth + multi-user.** Currently single-user local. The first thing that breaks under multi-user is the question generator's cache assumptions (cache key needs a user dimension).
- **Hosting.** A long-running PostgreSQL behind FastAPI; nothing exotic.
- **Embeddings.** When the corpus outgrows FTS recall, `pgvector` on the same Postgres.
- **Contradiction detection.** "This guest said X in episode 14 and not-X in episode 27" is exactly the structured-extraction layer's natural sequel.

## Closer

We built this on top of [`uv`](/technical-notes/why-uv-exists/) and the [Python monorepo layout](/technical-notes/python-monorepo-with-uv-workspaces/) from the earlier series. Eight posts and seven packages (`shared-schema`, `llm-client`, `ingest`, `enrich`, `api`, `codegen`, `web`), each carrying its own concern. Three migrations. One env-driven LLM provider. Three React routes typed off the Pydantic shapes that produced them.

What I learned, restated as a list:

- For a few hundred documents, **Postgres FTS plus an LLM rerank beats embeddings** on both quality and operational simplicity. Embeddings come back when recall numbers say so, not when fashion says so.
- A **provider-switching client** with a tier dial is the single highest-leverage abstraction in an AI codebase. Three different providers, one call shape, costs you ~300 lines you'll read every line of.
- **Codegen across the Python/TypeScript boundary** is a one-evening project that pays for itself the first time a backend field rename breaks the frontend compile.
- The cheap stage of any LLM pipeline (binary classification, triage, "are these two strings the same person?") is **80% of the calls and 5% of the cost**. Building a tier dial so the cheap stage stays cheap is non-negotiable.
- The boring part — **launchd / systemd plus `pg_dump`** — is what makes the whole thing feel like software you own rather than software you keep coaxing back to life.

Series complete. The repo (`<https://github.com/poudelprakash/clipdex>`) holds the tagged source for every post; the URL is the source of truth.

---

*This series is being written in parallel with the repo build. Tagged commits will be added to the repo as posts publish — the URL is the source of truth.*

*Full source: <https://github.com/poudelprakash/clipdex> (tag `series3-post8`)*

<!--
Codex image prompt (21:9 cover + 16:9 thumb):

Editorial header image, no embedded text, no logos. Visual metaphor: a calm
late-night desk scene rendered in flat editorial style. A single soft amber
desk lamp, a moonlit window in the background, and on the desk a faint
mechanical "clock+pipe" motif — gear, then arrow, then arrow, then arrow —
suggesting a nightly automated pipeline. Slightly desaturated palette,
indigo night background, warm amber lamp. No characters, no UI, no chips,
no code.
-->
