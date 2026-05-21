---
title: "Entity resolution for guests: fuzzy matching first, LLM disambiguation second"
date: "2026-05-06T10:00:00+05:45"
excerpt: "The same person shows up as 'Bibhusan Bista', 'Bibhusan B.', and 'B. Bista' across three episodes. Don't ask the LLM first — try cheap deterministic matching, then escalate only the ambiguous cases."
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
tags: [ai, python, claude, postgres, rapidfuzz, entity-resolution, podcast]
cover: "/images/blog/ai-podcast-index/guest-entity-resolution/cover.png"
thumb: "/images/blog/ai-podcast-index/guest-entity-resolution/thumb.png"
series: ai-podcast-index
seriesOrder: 4
use_featured_image: true
last_modified_at: "2026-05-06T10:00:00+05:45"
---

> **Prerequisites**: Assumes you've read [the `uv` series](/technical-notes/why-uv-exists/) (for the toolchain) and [the Python monorepo series](/technical-notes/new-python-project-2026/) (for the layout) — though each post stands alone if you skim those concepts.

By the end of [the previous post](/technical-notes/structured-extraction-with-claude/), the enrich worker is turning transcripts into `GuestMention(name, role, company, confidence)` rows. Run it across a back catalogue and you'll discover something obvious in hindsight: the same person shows up with three different names.

In our reference channel, one founder appears as `"Bibhusan Bista"` in episode 14, `"Bibhusan B."` in episode 27, and `"B. Bista (Young Innovations)"` in episode 41. To the database, those are three different guests with one appearance each, instead of one guest with three appearances. The "popular guests" page is wrong from day one.

This post is about fixing that — cheaply.

## The 70/20/10 stack

The temptation is to fan every new mention out to an LLM: "is this person the same as any of these existing guests?" That works. It also costs a Claude call per mention per existing guest, which at 200 episodes and 4 mentions each gets silly fast.

A better stack:

1. **Deterministic match** (~70% of cases). Normalize, look up by exact key. Free.
2. **Fuzzy match** (~20% of cases). `rapidfuzz` token-set ratio. Microseconds per call.
3. **LLM disambiguation** (~10% of cases). Only the ones the first two stages flagged as ambiguous.

The LLM is the *last* resort, not the first. Each stage trims the workload for the next.

## The schema

Two tables, one canonical concept:

```sql title="packages/shared-schema/sql/guests.sql"
create table guests (
  id            uuid primary key default gen_random_uuid(),
  canonical_name text not null,
  normalized_name text not null,
  company       text,
  created_at    timestamptz not null default now()
);

create unique index guests_normalized_company_idx
  on guests (normalized_name, coalesce(company, ''));

create table guest_aliases (
  id              uuid primary key default gen_random_uuid(),
  guest_id        uuid not null references guests(id) on delete cascade,
  alias_name      text not null,
  normalized_alias text not null,
  source_video_id text not null,
  confidence      numeric(3, 2) not null,
  resolved_by     text not null check (resolved_by in ('exact', 'fuzzy', 'llm', 'manual')),
  created_at      timestamptz not null default now()
);

create index guest_aliases_normalized_idx on guest_aliases (normalized_alias);
create index guest_aliases_guest_idx on guest_aliases (guest_id);
```

`guests` is the canonical record. `guest_aliases` is every name we've ever seen for that person, with a pointer back to the canonical row and a note about how the link was made. New mentions create new alias rows, not new guest rows, when we can match them.

## Stage 1 — deterministic match

Normalization is the workhorse. Get it right and ~70% of mentions resolve without any cleverness at all.

```python title="packages/enrich/src/enrich/resolve.py"
import re
import unicodedata


def normalize_name(name: str) -> str:
    """Lowercase, strip accents, collapse whitespace, drop punctuation."""
    no_accents = "".join(
        c for c in unicodedata.normalize("NFKD", name)
        if not unicodedata.combining(c)
    )
    cleaned = re.sub(r"[^\w\s]", " ", no_accents.lower())
    return re.sub(r"\s+", " ", cleaned).strip()
```

`"Bibhusan Bista"` and `"bibhusan bista"` and `"Bibhúsan  Bista."` all normalize to `bibhusan bista`. That alone catches roughly half the duplicates.

The deterministic lookup is then a single indexed query:

```python title="packages/enrich/src/enrich/resolve.py"
async def find_exact_match(
    conn: AsyncConnection,
    mention: GuestMention,
) -> Guest | None:
    normalized = normalize_name(mention.name)
    row = await conn.fetchrow(
        """
        select id, canonical_name, normalized_name, company
        from guests
        where normalized_name = $1
          and coalesce(company, '') = coalesce($2, '')
        """,
        normalized,
        mention.company,
    )
    return Guest(**row) if row else None
```

Note we key on `(normalized_name, company)`, not just name. "John Smith from Khalti" and "John Smith from Daraz" are very likely different people. If the company is missing, fall back to name-only and treat any hit as a stage 2 candidate.

## Stage 2 — fuzzy match with rapidfuzz

`rapidfuzz` is the right library here: a drop-in `fuzzywuzzy` replacement that's roughly 50x faster because the hot loop is in C++. Install it as a workspace dep:

```sh
uv add --package enrich rapidfuzz
```

The metric I reach for first is `token_set_ratio` — it tokenizes both strings, takes the intersection, and ignores order and duplicates. That's exactly the failure mode we have: `"Bibhusan Bista"` vs `"Bista Bibhusan"` vs `"Bibhusan Bista (Young Innovations)"` all score 100 against the canonical form.

```python title="packages/enrich/src/enrich/resolve.py"
from rapidfuzz import fuzz, process

FUZZY_AUTOMERGE = 90
FUZZY_CANDIDATE = 70


async def find_fuzzy_candidates(
    conn: AsyncConnection,
    mention: GuestMention,
) -> list[FuzzyCandidate]:
    normalized = normalize_name(mention.name)
    rows = await conn.fetch(
        "select id, canonical_name, normalized_name, company from guests"
    )
    scored = process.extract(
        normalized,
        {row["id"]: row["normalized_name"] for row in rows},
        scorer=fuzz.token_set_ratio,
        limit=5,
    )
    return [
        FuzzyCandidate(guest_id=guest_id, score=score)
        for _, score, guest_id in scored
        if score >= FUZZY_CANDIDATE
    ]
```

The decision rule on top:

```python title="packages/enrich/src/enrich/resolve.py"
async def resolve(conn: AsyncConnection, mention: GuestMention) -> Resolution:
    if existing := await find_exact_match(conn, mention):
        return Resolution(guest_id=existing.id, resolved_by="exact", confidence=1.0)

    candidates = await find_fuzzy_candidates(conn, mention)
    if candidates and candidates[0].score >= FUZZY_AUTOMERGE:
        top = candidates[0]
        return Resolution(
            guest_id=top.guest_id,
            resolved_by="fuzzy",
            confidence=top.score / 100,
        )

    if candidates:
        return await escalate_to_llm(conn, mention, candidates)

    return await create_new_guest(conn, mention)
```

For a guest table of a few thousand rows you can afford to score against the whole table in Python — `rapidfuzz.process.extract` is comfortable up to ~50k items per call on a laptop. Past that, pre-filter with a Postgres `pg_trgm` index and only score the trigram-matched subset.

## Stage 3 — LLM disambiguation, with caching

The cases that survive both filters are the genuinely hard ones: "Sushant Acharya" vs "Sushanta Acharya" (typo or different person?), or "Anjila Shrestha (Khalti)" vs "Anjila S. (Khalti Payments)" — same company name, different person?

This is where the LLM earns its keep. The prompt is short, the schema is binary, and — critically — we never ask the same question twice.

```python title="packages/enrich/src/enrich/resolve.py"
class DisambiguationDecision(BaseModel):
    same_person: Literal["yes", "no", "uncertain"]
    confidence: float = Field(ge=0, le=1)
    reasoning: str


async def escalate_to_llm(
    conn: AsyncConnection,
    mention: GuestMention,
    candidates: list[FuzzyCandidate],
) -> Resolution:
    top = candidates[0]
    cached = await conn.fetchrow(
        """
        select same_person, confidence
        from disambiguation_cache
        where mention_normalized = $1 and candidate_guest_id = $2
        """,
        normalize_name(mention.name),
        top.guest_id,
    )
    if cached:
        return _resolution_from_cache(top, cached)

    decision = await llm_client.complete(
        system=DISAMBIGUATION_SYSTEM_PROMPT,
        messages=[await _build_disambiguation_prompt(conn, mention, top)],
        schema=DisambiguationDecision,
        tier="smart",
    )
    await _cache_decision(conn, mention, top, decision)
    return _resolution_from_decision(top, decision)
```

The cache table is a single line of defence against rerunning the worker, and it pays for itself in the first re-ingest:

```sql title="packages/shared-schema/sql/disambiguation_cache.sql"
create table disambiguation_cache (
  mention_normalized text not null,
  candidate_guest_id uuid not null references guests(id) on delete cascade,
  same_person        text not null,
  confidence         numeric(3, 2) not null,
  reasoning          text,
  decided_at         timestamptz not null default now(),
  primary key (mention_normalized, candidate_guest_id)
);
```

The disambiguation prompt is short because the structured output schema is small:

```python title="packages/enrich/src/enrich/prompts.py"
DISAMBIGUATION_SYSTEM_PROMPT = """\
You decide whether two podcast guest mentions refer to the same person.

You will receive:
- Mention A: a new guest mention (name, role, company, episode context).
- Mention B: an existing canonical guest in our database (name, company,
  list of prior episode contexts).

Return `same_person: "yes"` only when the evidence is clear — same name
variant AND consistent role/company OR consistent topic expertise.

Return `"no"` when the company or role is plainly different.

Return `"uncertain"` when you would not bet on it. We will flag uncertain
pairs for a human reviewer; do not guess.
"""
```

The "uncertain" exit is the most important part. The LLM is not the final arbiter — it's a sorter that hands the genuinely hard 1–2% to a human.

## The human-in-the-loop CLI

This is cheap to build and disproportionately useful. A `task guests:review` command pulls every `uncertain` decision and every fuzzy match between 70 and 89, presents them in pairs, and lets you keep / merge / split with a keystroke.

```python title="packages/enrich/src/enrich/cli/review.py"
import typer
from rich.console import Console
from rich.table import Table

app = typer.Typer()


@app.command()
def review(limit: int = 20) -> None:
    """Walk through low-confidence guest matches and resolve each one."""
    console = Console()
    pending = asyncio.run(load_pending_reviews(limit))
    for item in pending:
        _render_pair(console, item)
        choice = typer.prompt("[m]erge / [k]eep separate / [s]kip", default="s")
        asyncio.run(_apply_review(item, choice))
```

Run it once a week after a backfill, knock out the 20 ambiguous cases in five minutes, and your guest table stays clean without making the worker any smarter than it needs to be.

## Splitting when you over-merge

You will over-merge. Fuzzy matching is opinionated and the LLM occasionally gets confident about pairs it shouldn't. The mitigation is an `unmerge` command that splits a guest record by lifting one of its aliases into a new canonical row:

```python title="packages/enrich/src/enrich/cli/review.py"
@app.command()
def unmerge(alias_id: str) -> None:
    """Promote an alias to its own canonical guest record."""
    asyncio.run(_promote_alias_to_canonical(alias_id))
```

The function moves the alias row to a new `guests` entry, reassigns any segment-level mention rows that came from videos linked to that alias, and writes an audit row so you can trace why the split happened. Three to four hundred lines of code, and it's the kind of thing you'll wish you had the first time the homepage shows two people fused into one.

## What we're not building

- **A graph database.** Postgres tables with a `guest_id` foreign key are enough.
- **Active learning loops.** The CLI review is the loop. We're not training a classifier on your decisions.
- **Cross-channel resolution.** Single channel for now; the moment we ingest a second channel, the "is this the same Anjila across two shows?" problem gets a sequel post.

## What's next

The resolver works, but it's only one consumer of the LLM. The enrich worker also chunks long transcripts, generates per-segment classifications, and (next post) generates questions. We've been writing `await llm_client.complete(...)` as if that function already exists. [Next post](/technical-notes/provider-switching-llm-client/) is where we build it: a tiny adapter package that wraps Anthropic, OpenAI, and Ollama behind one interface, with task-tier routing and prompt caching baked in.

---

*This series is being written in parallel with the repo build. Tagged commits will be added to the repo as posts publish — the URL is the source of truth.*

*Full source: <https://github.com/poudelprakash/ai-podcast-index> (tag `series3-post4`)*

<!--
Codex image prompt — cover (21:9) and thumb (16:9):

Editorial illustration for a technical blog post on entity resolution
for podcast guests. Visual metaphor: three name cards on a dark
worktable — "Bibhusan Bista", "Bibhusan B.", "B. Bista" — connected by
faint glowing lines converging into a single canonical name card in
the centre. Subtle Postgres-blue and warm amber accent palette to
match an editorial tech site. Flat, vector-leaning style. No
characters, no logos, no embedded text other than the three name
cards (treat as illustrative shapes, not legible labels). Soft
ambient lighting from upper-left.
-->
