---
title: "Entity resolution for guests: fuzzy matching first, LLM disambiguation second"
date: "2026-05-06T10:00:00+05:45"
excerpt: "The same person shows up as 'Bibhusan Bista', 'Bibhusan B.', and 'B. Bista' across three episodes. Don't ask the LLM first — try cheap deterministic matching, then escalate only the ambiguous cases."
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
tags: [ai, python, claude, postgres, rapidfuzz, entity-resolution, podcast]
cover: "/images/blog/clipdex/guest-entity-resolution/cover.png"
thumb: "/images/blog/clipdex/guest-entity-resolution/thumb.png"
series: clipdex
seriesOrder: 4
use_featured_image: true
last_modified_at: "2026-05-06T10:00:00+05:45"
---

> **Prerequisites**: Assumes you've read [the `uv` series](/technical-notes/why-uv-exists/) (for the toolchain) and [the Python monorepo series](/technical-notes/new-python-project-2026/) (for the layout) — though each post stands alone if you skim those concepts.

By the end of [the previous post](/technical-notes/structured-extraction-with-claude/), the enrich worker is turning transcripts into `GuestMention(name, role, company, confidence)` rows in `guests_raw`. Run it across a back catalogue and you'll discover something obvious in hindsight: the same person shows up with three different names.

In our reference channel, one founder might appear as `"Bibhusan Bista"` in one episode, `"Bibhusan B."` in another, and `"B. Bista (Young Innovations)"` in a third. To the database, those are three different guests with one appearance each, instead of one guest with three appearances. The "popular guests" page is wrong from day one.

This post is about fixing that — cheaply.

## The 70/20/10 stack

The temptation is to fan every new mention out to an LLM: "is this person the same as any of these existing guests?" That works. It also costs a Claude call per mention per existing guest, which at 200 episodes and 4 mentions each gets silly fast.

A better stack:

1. **Deterministic match** (~70% of cases). Normalize, look up by exact key. Free.
2. **Fuzzy match** (~20% of cases). `rapidfuzz` token-set ratio. Microseconds per call.
3. **LLM disambiguation** (~10% of cases). Only the ones the first two stages flagged as ambiguous.

The LLM is the *last* resort, not the first. Each stage trims the workload for the next.

## The schema

Three tables, one canonical concept:

```sql title="migrations/003_resolution.sql"
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS guests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canonical_name  TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS guests_normalized_name_uidx
    ON guests (normalized_name);

CREATE TABLE IF NOT EXISTS guest_aliases (
    id               BIGSERIAL PRIMARY KEY,
    guest_id         UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    alias_name       TEXT NOT NULL,
    normalized_alias TEXT NOT NULL,
    source_video_id  TEXT REFERENCES processed_videos(video_id) ON DELETE SET NULL,
    confidence       REAL NOT NULL,
    decided_by       TEXT NOT NULL CHECK (decided_by IN ('exact','fuzzy','llm','manual')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS guest_aliases_unique_per_guest
    ON guest_aliases (guest_id, normalized_alias);
```

`guests` is the canonical record. `guest_aliases` is every name we've ever seen for that person, with a pointer back to the canonical row and a note about how the link was made (`exact` / `fuzzy` / `llm` / `manual`). New mentions create new alias rows, not new guest rows, when we can match them.

A fourth table caches LLM decisions and a fifth queues human-review candidates — both shown when we get to those stages.

## Stage 1 — deterministic match

Normalization is the workhorse. Get it right and ~70% of mentions resolve without any cleverness at all.

```python title="packages/enrich/src/clipdex_enrich/resolution.py"
def normalize_name(name: str) -> str:
    """Lowercase, strip accents/punctuation, collapse whitespace."""
    s = unicodedata.normalize("NFKD", name)
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return s.strip()
```

`"Bibhusan Bista"`, `"BIBHUSAN  BISTA"`, and `"Bíbhuśan Bistá"` all normalize to `bibhusan bista`. The unit test covers the obvious cases:

```python title="packages/enrich/tests/test_resolution.py"
def test_normalize_basic():
    assert normalize_name("Bibhusan Bista") == "bibhusan bista"
    assert normalize_name("BIBHUSAN  BISTA  ") == "bibhusan bista"
    assert normalize_name("Bibhusan B.") == "bibhusan b"

def test_normalize_strips_accents():
    assert normalize_name("Bíbhuśan Bistá") == "bibhusan bista"
```

The exact-match lookup is then a dictionary check against two pre-loaded maps — the existing aliases and the existing canonical normalized names. We hit the DB once at the start of a run, not once per raw row:

```python title="packages/enrich/src/clipdex_enrich/resolution.py"
canonicals = await _load_canonical(session)
canon_by_norm: dict[str, CanonicalGuest] = {c.normalized_name: c for c in canonicals}

r = await session.execute(
    text("SELECT normalized_alias, guest_id::text AS guest_id FROM guest_aliases")
)
alias_to_guest: dict[str, str] = {row.normalized_alias: row.guest_id for row in r}

# inside the resolve loop:
normalized = normalize_name(raw.name)
existing = alias_to_guest.get(normalized) or (
    canon_by_norm[normalized].id if normalized in canon_by_norm else None
)
```

The dict lookup is free; the DB cost is amortized over the whole sweep. For a few thousand guests it's a one-shot query you don't notice.

## Stage 2 — fuzzy match with rapidfuzz

`rapidfuzz` is the right library here: a drop-in `fuzzywuzzy` replacement with the hot loop in C++. It's already in the workspace deps from `packages/enrich/pyproject.toml`.

The metric I reach for first is `token_set_ratio` — it tokenizes both strings, takes the intersection, and ignores order and duplicates. That's exactly the failure mode we have: `"Bibhusan Bista"` and `"Bista, Bibhusan (Young Innovations)"` should score 100 against the canonical form, despite the noise.

```python title="packages/enrich/src/clipdex_enrich/resolution.py"
from rapidfuzz import fuzz, process

AUTO_MERGE_THRESHOLD = 90  # token_set_ratio >= this -> auto-attach as alias
REVIEW_THRESHOLD = 70      # below this -> treat as a new guest

def _best_fuzzy(
    normalized: str, canonicals: dict[str, CanonicalGuest]
) -> tuple[str | None, float]:
    if not canonicals:
        return None, 0.0
    choices = list(canonicals.keys())
    match = process.extractOne(normalized, choices, scorer=fuzz.token_set_ratio)
    if match is None:
        return None, 0.0
    matched_norm, score, _ = match
    return canonicals[matched_norm].id, float(score)
```

Two thresholds, three outcomes:

| `token_set_ratio` | Outcome |
|---|---|
| ≥ 90 | Auto-attach as a `fuzzy` alias. |
| 70 – 89 | Hand off to stage 3. |
| < 70 | Create a new canonical guest. |

Numbers worth eyeballing yourself before you commit to them:

```python title="packages/enrich/tests/test_resolution.py"
def test_fuzzy_typo_auto_merge():
    s = fuzz.token_set_ratio(
        normalize_name("Bibhusan Bista"), normalize_name("Bibhushan Bista")
    )
    assert s >= AUTO_MERGE_THRESHOLD

def test_fuzzy_initials_below_auto_merge():
    s = fuzz.token_set_ratio(
        normalize_name("Bibhusan B."), normalize_name("Bibhusan Bista")
    )
    assert s >= REVIEW_THRESHOLD

def test_fuzzy_unrelated_below_review():
    s = fuzz.token_set_ratio(
        normalize_name("Bibhusan Bista"), normalize_name("Ramesh Khanal")
    )
    assert s < REVIEW_THRESHOLD
```

A misspelled surname crosses 90 (auto-merge). An initial-vs-full surname sits in the band that needs disambiguation. Two unrelated Nepali names don't get within shouting distance. Tune these to your dataset; the defaults are a starting point, not gospel.

## Stage 3 — LLM disambiguation, with caching

The cases that survive both filters are the genuinely hard ones: "Sushant Acharya" vs "Sushanta Acharya" (typo or different person?), or "Anjila Shrestha (Khalti)" vs "Anjila S. (Khalti Payments)" — same brand, different person?

This is where Claude earns its keep. The prompt is short, the schema is tiny (`yes` / `no` / `uncertain`), and — critically — we never ask the same question twice.

```sql title="migrations/003_resolution.sql"
CREATE TABLE IF NOT EXISTS guest_merge_decisions (
    id          BIGSERIAL PRIMARY KEY,
    norm_a      TEXT NOT NULL,
    norm_b      TEXT NOT NULL,
    decision    TEXT NOT NULL CHECK (decision IN ('yes','no','uncertain')),
    rationale   TEXT,
    decided_by  TEXT NOT NULL CHECK (decided_by IN ('llm','manual')),
    decided_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS guest_merge_decisions_pair_uidx
    ON guest_merge_decisions (norm_a, norm_b);
```

We key on the *normalized* pair, sorted, so `("anjila s", "anjila shrestha")` and `("anjila shrestha", "anjila s")` hit the same row. The cache pays for itself the first time you re-ingest.

The prompt itself fits on one screen:

```python title="packages/enrich/src/clipdex_enrich/resolution.py"
LLM_SYSTEM = """\
You decide whether two podcast guest mentions refer to the same person.

You will be given two candidate names with a snippet of context for each
(role, company, or a quote from the episode they appeared on). Reply with a
single JSON object, no preamble:

  {"decision": "yes" | "no" | "uncertain", "rationale": "<one short sentence>"}

Be conservative. "yes" only if the evidence clearly aligns (matching role,
company, distinctive quote style, or near-identical name with no conflicting
signals). "uncertain" is fine and preferred over a wrong "yes".
"""
```

Context for each candidate is one to three of the highest-`quotability_score` quotes from their source video — enough for the model to anchor on something more than a name. The call uses the cheap tier (`claude-haiku-4-5`) with prompt caching on the system block, since the system prompt never changes:

```python title="packages/enrich/src/clipdex_enrich/resolution.py"
response = await client.messages.create(
    model=settings.model_cheap,
    max_tokens=200,
    system=[
        {
            "type": "text",
            "text": LLM_SYSTEM,
            "cache_control": {"type": "ephemeral"},
        }
    ],
    messages=[{"role": "user", "content": user}],
)
```

The "uncertain" outcome is the most important part. Claude is not the final arbiter — it's a sorter that hands the genuinely hard 1–2% to a human via the review queue:

```sql title="migrations/003_resolution.sql"
CREATE TABLE IF NOT EXISTS guest_merge_review (
    id              BIGSERIAL PRIMARY KEY,
    guest_id        UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    raw_id          BIGINT NOT NULL REFERENCES guests_raw(id) ON DELETE CASCADE,
    candidate_name  TEXT NOT NULL,
    canonical_name  TEXT NOT NULL,
    score           REAL NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    decided_at      TIMESTAMPTZ
);
```

## The human-in-the-loop CLI

`task guests:review` walks every `pending` row in `guest_merge_review`. Each iteration shows the candidate, a couple of quotes from its source episode, and the canonical it's being matched against — then prompts for one keystroke:

```python title="packages/enrich/src/clipdex_enrich/review.py"
async def _run() -> int:
    engine = create_async_engine(_engine_url())
    decided = 0
    async with AsyncSession(engine) as session:
        pending = await _pending(session)
        if not pending:
            print("No pending merges. 👍")
            return 0
        for row in pending:
            quotes = await _quotes_for(session, row["video_id"])
            print(_prompt(row, quotes))
            sys.stdout.write("merge? [y/n/s/q] ")
            sys.stdout.flush()
            choice = sys.stdin.readline().strip().lower()
            if choice == "q":
                break
            if choice in ("s", ""):
                continue
            if choice == "y":
                await _approve(session, row)
            else:
                await _reject(session, row)
            decided += 1
    return 0
```

Three keys: `y` merges (alias attached, decision cached as `manual`/`yes`), `n` splits (new canonical row, decision cached as `manual`/`no`), `s` skips for now. `q` quits the loop without losing the rest. No `typer`, no `rich`, no UI framework — it's stdin and `sqlalchemy`, eighty lines.

Run it once a week after a backfill, knock out the few ambiguous cases, and the guest table stays clean without making the worker any smarter than it needs to be.

## Splitting when you over-merge

Fuzzy matching is opinionated and the LLM occasionally gets confident about pairs it shouldn't. The mitigation is an `unmerge(guest_id, alias_id)` that lifts one alias out of a guest and into its own canonical row:

```python title="packages/enrich/src/clipdex_enrich/resolution.py"
async def unmerge(session, *, guest_id: str, alias_id: int) -> str:
    # Refuse to unmerge the only alias (nothing to split).
    # Reuse an existing canonical if one already has this normalized_name,
    # otherwise insert a fresh guests row.
    # Reassign the alias to the new guest_id.
    # Cache the pair as a 'no' decision so the LLM won't re-merge them.
```

The function returns the new canonical guest's id, and caches a `no` decision for the pair so the next `resolve` sweep doesn't undo the human's call.

## Running it

The whole module ships as one CLI:

```sh
$ task db:migrate     # picks up migrations/003_resolution.sql
$ task resolve        # exact -> fuzzy -> LLM over guests_raw
2026-05-24 09:01:12 INFO resolve: ResolutionCounts(
  seen=2, skipped_already_attached=0,
  exact_match=0, fuzzy_auto_merge=0,
  llm_yes=0, llm_no=0, llm_uncertain=0,
  new_canonical=2, queued_for_review=0
)
```

That's a partial sweep, mid-backfill: nine episodes enriched, two distinct guest mentions, zero merges so far. The interesting numbers show up as the backfill catches up — repeated guests are the whole point — but the structure is what matters and it's the same structure end-to-end.

Re-running `task resolve` after more enrichments is idempotent: `skipped_already_attached` climbs, `seen` climbs, and `new_canonical` / `fuzzy_auto_merge` / `llm_yes` partition the new rows. Nothing is dropped.

## What we're not building

- **A graph database.** Postgres tables with a `guest_id` foreign key are enough.
- **Active learning loops.** The CLI review is the loop. We're not training a classifier on your decisions.
- **Cross-channel resolution.** Single channel for now; the moment we ingest a second channel, "is this the same Anjila across two shows?" gets a sequel post.

## What's next

The resolver makes a direct Anthropic call. So does the extractor from [the previous post](/technical-notes/structured-extraction-with-claude/). That's about to become uncomfortable: we've copy-pasted the same `client.messages.create(...)` shape twice, both pinning the same model identifiers in `settings.py`.

[Next post](/technical-notes/provider-switching-llm-client/) is where we collapse both call sites behind one `complete(...)` interface: a tiny adapter package that wraps Anthropic, OpenAI, and Ollama, routes `tier="cheap"` and `tier="smart"` to the right concrete model, and keeps prompt caching working without any caller having to know about it.

---

*This series is being written in parallel with the repo build. Tagged commits will be added to the repo as posts publish — the URL is the source of truth.*

*Full source: <https://github.com/poudelprakash/clipdex> (tag `series3-post4`)*

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
