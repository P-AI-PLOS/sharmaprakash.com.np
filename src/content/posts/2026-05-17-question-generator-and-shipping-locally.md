---
title: "The question generator, the cron job, and shipping it locally"
date: "2026-05-17T10:00:00+05:45"
excerpt: "Grounded question generation is one prompt away. Wrap the project with a local cron, a one-line backup, and a popular-guests landing query — and the podcast index runs on its own."
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
tags: [ai, python, claude, fastapi, react, podcast, cron, launchd, postgres]
cover: "/images/blog/ai-podcast-index/question-generator-and-shipping-locally/cover.png"
thumb: "/images/blog/ai-podcast-index/question-generator-and-shipping-locally/thumb.png"
series: ai-podcast-index
seriesOrder: 8
use_featured_image: true
last_modified_at: "2026-05-17T10:00:00+05:45"
---

> Assumes you've read [`uv-2026`](/technical-notes/why-uv-exists/) (for the toolchain) and [`python-monorepo-2026`](/technical-notes/python-monorepo-with-uv-workspaces/) (for the layout) — though each post stands alone if you skim those concepts.

Previous post: [*The React side: guest pages, search UI, and codegen'd types*](/technical-notes/react-frontend-for-podcast-index/).

This is the capstone. Seven posts in, we have transcripts in Postgres, structured guests/topics/quotes, a search UI that doesn't need embeddings, and a React frontend that's type-safe end-to-end. What we don't have yet is the *reason a podcast host would actually open the app* — a question generator for return episodes — and a way to keep it ingesting new episodes without me babysitting a terminal.

Both are short. The question generator is one prompt. The cron is one plist. The rest of this post is the few details that make the difference between "ran once" and "still working in three months."

## The grounded prompt

Generic interview questions are useless. "What's your origin story?" works for episode one and never again. The whole point of having every prior segment from a guest in Postgres is that we can ask Claude for questions that *reference what they've already said* — so the host walks in with follow-ups, not warm-ups.

Grounding means each question carries pointers back to the quote or topic it builds on. The frontend renders the question with a tooltip showing the prior statement; the host can read the context in one glance.

```python title="packages/enrich/src/enrich/questions.py"
from llm_client import complete
from shared_schema.questions import QuestionSet, Question, QuoteRef

SYSTEM = """You are an interview producer for a long-running podcast.

Generate 10 follow-up questions for a returning guest. Each question MUST:
- reference a specific prior statement or topic the guest has previously discussed
- ask something the guest has NOT already answered
- be open-ended (no yes/no)
- be specific enough that only this guest could answer it

Return JSON matching the QuestionSet schema. Every question must include
`grounded_in` with at least one quote_id from the provided context."""

async def generate_questions(guest_id: str) -> QuestionSet:
    ctx = await build_guest_context(guest_id)  # quotes + topics + appearances
    user = render_context(ctx)                 # markdown, ~3-6k tokens
    return await complete(
        system=SYSTEM,
        messages=[{"role": "user", "content": user}],
        schema=QuestionSet,
        tier="smart",
        cache_system=True,
    )
```

Two things earn their keep here.

**`cache_system=True`** — the system block is identical across every guest, so it's the textbook prompt-caching case. The adapter we built in [post 5](/technical-notes/provider-switching-llm-client/) wraps the system block with `cache_control: {"type": "ephemeral"}` on Anthropic. After the first call, each subsequent guest pays cache-read pricing on the system block. On Sonnet 4.6 that's a ~10× discount on those tokens — small in absolute terms per guest, but if you batch-regenerate questions for 60 returning guests after a busy month, it adds up to a coffee.

**`schema=QuestionSet`** — the adapter routes this to Anthropic `tool_use` so Claude returns parsed JSON directly. No regex extraction, no JSON-mode-without-schema retries. Validation lives in Pydantic where the rest of the project's contracts live.

Token cost on a real run, from the response metadata, with ~20 quotes and 8 topics in context:

```text
First guest (cache write):
  input:        5,842 tokens
  cache_write:  4,310 tokens (system + schema)
  output:       1,205 tokens

Next 9 guests (cache hits):
  input:        ~1,500 tokens each
  cache_read:   4,310 tokens each (90% off)
  output:       ~1,200 tokens each
```

Without caching, every guest pays full price on those 4,310 system tokens. With it, only the first does.

## The output shape

```python title="packages/shared-schema/src/shared_schema/questions.py"
from datetime import datetime
from pydantic import BaseModel, Field

class QuoteRef(BaseModel):
    quote_id: str
    excerpt: str = Field(description="The exact prior statement being built on.")

class Question(BaseModel):
    text: str
    grounded_in: list[QuoteRef] = Field(min_length=1)
    rationale: str = Field(description="One sentence on why this question is worth asking now.")

class QuestionSet(BaseModel):
    guest_id: str
    generated_at: datetime
    questions: list[Question] = Field(min_length=10, max_length=10)
```

`min_length=1` on `grounded_in` is the load-bearing constraint — it's what stops Claude from regressing to "what's your origin story?" If a question can't cite something, the validator rejects it and the retry loop from [post 3](/technical-notes/structured-extraction-with-claude/) kicks in with the validation error appended to the prompt. One retry, then we log and move on.

The frontend (built in [post 7](/technical-notes/react-frontend-for-podcast-index/)) renders each question with a tooltip pinned to the `grounded_in[0].excerpt`. The rationale shows under a "why ask this" expander. The whole UI is maybe forty lines of TSX because everything's already typed off `schema.json`.

## Cron and scheduling

The point of running this locally is that I shouldn't have to remember to run it. On macOS, `launchd` is the right tool — it survives reboots, it has structured logging, and it doesn't need root.

```xml title="~/Library/LaunchAgents/com.sharmaprakash.podcast-index.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.sharmaprakash.podcast-index</string>

  <key>ProgramArguments</key>
  <array>
    <string>/Users/prakash/.local/bin/task</string>
    <string>daily</string>
  </array>

  <key>WorkingDirectory</key>
  <string>/Users/prakash/workspaces/personal/ai-podcast-index</string>

  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key><integer>3</integer>
    <key>Minute</key><integer>0</integer>
  </dict>

  <key>StandardOutPath</key>
  <string>/Users/prakash/Library/Logs/podcast-index.out.log</string>
  <key>StandardErrorPath</key>
  <string>/Users/prakash/Library/Logs/podcast-index.err.log</string>

  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/Users/prakash/.local/bin:/usr/local/bin:/usr/bin:/bin</string>
  </dict>
</dict>
</plist>
```

Load it once:

```sh
launchctl load -w ~/Library/LaunchAgents/com.sharmaprakash.podcast-index.plist
launchctl list | grep podcast-index    # confirm it's there
```

The `daily` task wraps the whole pipeline:

```yaml title="Taskfile.yml"
tasks:
  daily:
    desc: "End-to-end: ingest new episodes, enrich, regenerate landing cache."
    cmds:
      - task: ingest
      - task: enrich
      - task: cache:refresh
      - task: backup
```

On Linux, the equivalent is a systemd user timer:

```ini title="~/.config/systemd/user/podcast-index.service"
[Unit]
Description=AI podcast index — daily ingest + enrich

[Service]
Type=oneshot
WorkingDirectory=%h/workspaces/personal/ai-podcast-index
ExecStart=%h/.local/bin/task daily
```

```ini title="~/.config/systemd/user/podcast-index.timer"
[Unit]
Description=Run podcast-index daily at 03:00

[Timer]
OnCalendar=*-*-* 03:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

```sh
systemctl --user enable --now podcast-index.timer
systemctl --user list-timers podcast-index.timer
```

`Persistent=true` is the small detail that matters — if the machine was asleep at 03:00, the job runs as soon as it wakes. `launchd` does the same automatically.

## Backups, one paragraph

Losing the enriched dataset would be miserable. Re-ingesting is cheap; re-enriching every episode through Claude is not. A `task backup` that `pg_dump`s to a dated file in `~/Backups/podcast-index/` and prunes anything older than 30 days is fifteen lines and never has to be touched again:

```yaml title="Taskfile.yml"
  backup:
    desc: "pg_dump to ~/Backups/podcast-index/, prune older than 30 days."
    cmds:
      - mkdir -p ~/Backups/podcast-index
      - pg_dump -Fc podcast_index > ~/Backups/podcast-index/{{now | date "2006-01-02"}}.dump
      - find ~/Backups/podcast-index -name '*.dump' -mtime +30 -delete
```

Restore is `pg_restore -d podcast_index <file>`. Verify once on a scratch database after the first backup; never think about it again until you need it. The most expensive bug in a local-only system is the unverified backup.

## The "popular guests" landing query

The homepage shows the top 12 guests, ranked by appearances *and* recency — a guest who came on three times last quarter beats one who came on five times in 2022. The ranking is one query, memoized for an hour because the underlying data only changes after a daily ingest:

```sql title="packages/api/src/api/queries/popular_guests.sql"
WITH stats AS (
  SELECT
    g.id,
    g.canonical_name,
    COUNT(DISTINCT a.episode_id)                            AS appearance_count,
    MAX(e.published_at)                                     AS last_seen
  FROM guests g
  JOIN appearances a   ON a.guest_id = g.id
  JOIN episodes e      ON e.id = a.episode_id
  GROUP BY g.id, g.canonical_name
),
scored AS (
  SELECT
    *,
    -- recency: 1.0 today → 0.0 two years ago, linear, floored at 0.
    GREATEST(
      0.0,
      1.0 - EXTRACT(EPOCH FROM (NOW() - last_seen)) / (60*60*24*730)
    ) AS recency_score
  FROM stats
)
SELECT
  id,
  canonical_name,
  appearance_count,
  last_seen,
  (appearance_count * 0.7 + recency_score * 10 * 0.3) AS rank_score
FROM scored
ORDER BY rank_score DESC
LIMIT 12;
```

Two judgment calls in there. The `* 10` on `recency_score` is because raw appearance counts run 1–8 in our corpus while recency is 0–1; without the rescale, recency contributes nothing. The 730-day window is what felt right for a channel that publishes weekly — tune it for yours. The memoization sits in FastAPI with a 1-hour TTL on `(query_kind="popular_guests",)`, same shape as the search cache from [post 6](/technical-notes/search-without-embeddings/).

## What's next, if you wanted to productize this

This series stops at the line where "useful local tool" becomes "product." The sequel-series hooks, none of which are in scope here:

- **Multi-channel ingest.** The schema already keys everything by `channel_id`; the gap is a channels admin UI and per-channel scheduling.
- **Auth + multi-user.** Local-only means one Postgres, one Postgres role, no token. Productizing means at least JWT, per-user channel subscriptions, and a permissions story for shared guest pages.
- **Hosting.** A managed Postgres, a small VPS or Fly app for the API, static hosting for the React build, and a worker for ingest. The Docker patterns from [`uv-2026` post 6](/technical-notes/uv-in-docker-and-ci/) port directly.
- **Embeddings layer.** Once you cross ~tens of thousands of segments, FTS recall starts to slip on conceptual queries. Add `pgvector` *next to* the `tsvector` column — hybrid retrieval, same Postgres. No new infra.
- **Contradiction alerts.** "Guest X said the opposite in episode 12" is a fun feature: same grounded prompt shape, but the LLM compares the latest statement against prior quotes on the same topic. Genuinely useful for journalists.

I don't know if I'll write that sequel. Whether or not, the local tool is the artifact — it answers questions you couldn't answer before, and it does it with code you can read end-to-end in an afternoon.

## What this whole series was about

The build is a vehicle. The thing I actually wanted to show, in eight posts, is that the Python + AI stack in 2026 lets you do a *lot* with a small set of well-chosen tools:

- `uv` workspaces — from the [uv-2026 series](/technical-notes/why-uv-exists/) — gave us a monorepo where the ingest worker, the enrichment package, the FastAPI app, and the shared schema all share one lockfile and one virtualenv.
- The shared-schema pattern from the [python-monorepo-2026 series](/technical-notes/python-monorepo-with-uv-workspaces/) gave us types that flow from a Pydantic model through Postgres, through the FastAPI response, into the React component — with a build that breaks loudly when any link drifts.
- A thin LLM client adapter (60 lines) outperformed reaching for a framework, because *this* project's needs were narrow enough that the framework's abstractions would cost more than they paid.
- Postgres FTS + LLM rerank handled search without any vector infrastructure, and made the case for keeping embeddings out until the corpus actually demands them.
- Grounded prompting + Pydantic validation made the LLM outputs trustworthy enough to put in a UI without a human-in-the-loop step.

None of those are new ideas. What's new is that the tooling is finally good enough — `uv`, modern Pydantic, the Anthropic SDK's caching and tool-use, Postgres being Postgres — that the project is a weekend if you've done it before and a small handful of weekends if you haven't. Five years ago, the same project would have been a quarter.

That's the actual point. Pick the boring pieces. Read every line. Ship locally first. The interesting work is in the prompts and the schemas, not the plumbing.

---

*Full source: https://github.com/poudelprakash/ai-podcast-index (tag `series3-post8`)*

*This series is being written in parallel with the repo build. Tagged commits will be added to the repo as posts publish — the URL is the source of truth.*

<!--
Codex image prompt (21:9 cover and 16:9 thumb crop, no embedded text, no logos, no watermarks):

An editorial illustration in muted, deep-blue and warm-amber tones depicting a small home-office desk at 3:00 AM. A single low desk lamp casts an amber pool of light across a closed laptop. Beside the laptop, a brass mechanical clock points to 3:00. A faint, looping mechanical conveyor belt diagram is suggested in the background — small icons of microphones, transcript pages, and database cylinders gliding along the belt in soft, blurred motion, evoking an automated overnight pipeline. A coffee cup with a single rising wisp of steam sits in the foreground. Composition is calm, slightly nostalgic, suggestive of quiet automation and care. No text, no logos, no human figures.
-->
