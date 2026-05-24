---
draft: false
title: "The first real Alembic revision: a column, a backfill, and the parts autogenerate can't do"
date: "2026-05-27T10:00:00+05:45"
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "Last post set up Alembic in clipdex. This one cashes the bet: add a duration_ms column to processed_videos, backfill from the existing aggregation, and switch the /episodes endpoint to read it. Three commits. The parts autogenerate gets right, the parts it doesn't, and why the backfill is the line where raw SQL would have started to hurt."
cover: "/images/blog/clipdex/first-real-alembic-revision/cover.png"
thumb: "/images/blog/clipdex/first-real-alembic-revision/thumb.png"
last_modified_at: "2026-05-27T10:00:00+05:45"
use_featured_image: true
series: clipdex
seriesOrder: 11
tags:
  - python
  - postgres
  - alembic
  - sqlalchemy
  - migrations
  - fastapi
  - performance
---

[Last post](/technical-notes/clipdex-adopting-alembic/) set up Alembic in clipdex. The infrastructure works — `task db:upgrade` is the only schema command, `models.py` mirrors the live DB, and `alembic check` reports zero drift. But infrastructure that's never exercised is a hypothesis, not a result.

This post cashes the bet. There's a real, small, useful change clipdex's `/api/episodes` endpoint has been begging for: a `duration_ms` column on `processed_videos`. Today the query computes duration on every request by aggregating `transcript_segments`. That's a `MAX(end_ms) GROUP BY video_id` over every segment of every video, joined back to the videos table, for every page load. It works at the current corpus size. It won't at 10×.

So: add a column, backfill it, switch the query. The kind of work that should be unremarkable. The shape of post 11 is *how unremarkable it actually is*, and what the friction points still are.

---

## The change in plain English

`processed_videos.duration_ms BIGINT NULL` (nullable to start, fill in via backfill, then maybe tighten to NOT NULL later).

The backfill comes from the same query that runs in `_episodes` today:

```sql
UPDATE processed_videos pv
SET duration_ms = ts.duration_ms
FROM (
    SELECT video_id, MAX(end_ms) AS duration_ms
    FROM transcript_segments
    GROUP BY video_id
) ts
WHERE pv.video_id = ts.video_id
  AND pv.duration_ms IS NULL;
```

The ingest worker will need to write the column when it inserts a new `processed_videos` row, after the segments have landed. And `_episodes` gets rewritten to read the column directly.

Three commits:

1. **Schema + backfill.** Add the column via Alembic, run the backfill, apply.
2. **Read path.** Switch `_episodes` to read the column. Existing API consumers don't see anything change.
3. **Write path.** Update the ingest worker to populate `duration_ms` on new rows.

I'll walk through commit 1 in detail — that's where Alembic is doing the work. Commits 2 and 3 are routine application code.

---

## Step 1 — edit `models.py`

```python
class ProcessedVideo(Base):
    __tablename__ = "processed_videos"

    video_id = Column(Text, primary_key=True)
    title = Column(Text, nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(Text, nullable=False)
    source = Column(Text)
    segment_count = Column(Integer)
    ingested_at = Column(DateTime(timezone=True))
    error = Column(Text)
    duration_ms = Column(BigInteger)   # NEW

    __table_args__ = (...)
```

That's the entire model change. One column, nullable by default, no `server_default`. The decision to make it nullable is deliberate — the column is going to spend some time empty between commit 1 and commit 3, and a NOT NULL with a default would lie about "we have duration data for this row" before the backfill runs.

---

## Step 2 — autogenerate the revision

```sh
$ task db:revision -- "add duration_ms to processed_videos"
task: [db:revision] uv run --package clipdex-api alembic \
  -c packages/api/alembic.ini revision --autogenerate \
  -m "add duration_ms to processed_videos"
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.autogenerate.compare] Detected added column
  'processed_videos.duration_ms'
  Generating .../alembic/versions/04370fbe93f4_add_duration_ms_to_processed_videos.py
```

The generated file:

```python
"""add duration_ms to processed_videos

Revision ID: 04370fbe93f4
Revises: cad2f1272a8a
Create Date: 2026-05-27 09:14:22.187493
"""
from alembic import op
import sqlalchemy as sa

revision = '04370fbe93f4'
down_revision = 'cad2f1272a8a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'processed_videos',
        sa.Column('duration_ms', sa.BigInteger(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('processed_videos', 'duration_ms')
```

Two things autogenerate got right that would have taken a half-minute to hand-write:

- The `down_revision` pointer is set to `cad2f1272a8a` — the baseline. Chains correctly.
- `downgrade()` is the inverse of `upgrade()`. If we ever need to roll back, it's there.

One thing autogenerate **doesn't** know: the backfill. It only sees the schema diff (one new column); it has no way to know we want to populate it from `transcript_segments` data. That part is hand-written.

---

## Step 3 — hand-add the backfill

Edit `upgrade()`:

```python
def upgrade() -> None:
    op.add_column(
        'processed_videos',
        sa.Column('duration_ms', sa.BigInteger(), nullable=True),
    )

    # Backfill from the same aggregation _episodes computes today.
    # Idempotent: only touches rows where duration_ms IS NULL.
    op.execute("""
        UPDATE processed_videos pv
        SET duration_ms = ts.duration_ms
        FROM (
            SELECT video_id, MAX(end_ms) AS duration_ms
            FROM transcript_segments
            GROUP BY video_id
        ) ts
        WHERE pv.video_id = ts.video_id
          AND pv.duration_ms IS NULL
    """)
```

The `IS NULL` guard matters. It makes the backfill idempotent at the row level: re-running the migration after a partial failure (Postgres dies mid-UPDATE, you `task db:upgrade` again) re-fills only the rows still missing data. Without that guard, a re-run would clobber any rows that had been correctly populated in the meantime by commit 3's write path.

This is the line where raw SQL migrations start to hurt. With raw SQL, "did this UPDATE already run?" isn't a question the migration runner can answer. With Alembic, the `alembic_version` table records that revision `04370fbe93f4` has been applied; the next `upgrade` call skips it entirely. The `IS NULL` guard is belt-and-braces for the in-flight failure case, not the steady state.

The `downgrade()` doesn't need to undo the backfill — `op.drop_column` removes the data along with the column. Leave it as autogenerated.

---

## Step 4 — apply

```sh
$ task db:upgrade
task: [db:upgrade] uv run --package clipdex-api alembic \
  -c packages/api/alembic.ini upgrade head
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade cad2f1272a8a -> 04370fbe93f4,
  add duration_ms to processed_videos

$ psql -d clipdex -c "
  SELECT
    count(*) FILTER (WHERE duration_ms IS NOT NULL) AS filled,
    count(*) FILTER (WHERE duration_ms IS NULL)     AS empty,
    count(*)                                        AS total
  FROM processed_videos
"
 filled | empty | total
--------+-------+-------
   1020 |    13 |  1033
```

1,020 of 1,033 filled. The 13 empty rows are videos that failed to ingest transcripts — they have a `processed_videos` row but no `transcript_segments`. The backfill silently skipped them, which is correct: there's nothing to backfill from. Commit 3's ingest-worker change will set `duration_ms` on those if they're ever retried successfully.

`task db:current` confirms:

```
04370fbe93f4 (head)
```

Commit the migration file and `models.py` together:

```sh
git add packages/api/src/clipdex_api/models.py \
        packages/api/alembic/versions/04370fbe93f4_*.py
git commit -m "db: add duration_ms to processed_videos + backfill"
```

**Commit `models.py` and the revision file in the same commit, always.** They're a unit. If they diverge across commits, `alembic check` will start emitting spurious diffs on `main`.

---

## Commits 2 and 3 — the application changes

These are routine, but the *order matters*.

**Commit 2** changes `_episodes` to read `pv.duration_ms` instead of the JOIN. Existing rows already have the value (commit 1 backfilled them). New rows since commit 1 will be NULL until commit 3 lands — `_episodes` should `COALESCE(pv.duration_ms, computed)` for that window, or just accept NULL and let the UI render "—". I'd pick the latter; the window is hours, not weeks.

```python
sql = """
    SELECT
      pv.video_id,
      pv.title,
      pv.published_at,
      pv.segment_count,
      pv.duration_ms,    -- was: ts.duration_ms (aggregated subquery)
      ev.video_id IS NOT NULL AND ev.status = 'done' AS enriched,
      ...
    FROM processed_videos pv
    LEFT JOIN enriched_videos ev ON ev.video_id = pv.video_id
    -- the GROUP BY subquery is gone
    WHERE pv.status = 'done'
    {only_enriched_filter}
    ORDER BY pv.published_at DESC NULLS LAST, pv.video_id
    LIMIT :n
"""
```

The endpoint's `response_model=list[EpisodeSummary]` doesn't change because `duration_ms: int | None` was already nullable in the Pydantic schema.

**Commit 3** updates the ingest worker. After it inserts segments and updates `processed_videos.status = 'done'`, it computes `MAX(end_ms)` from the segments it just wrote and sets `duration_ms` in the same transaction. The compute is local to the ingest worker; the API never has to do it again.

The order — schema → read path → write path — is the safe one. The reverse order would have the write path populating a column that doesn't exist yet, or the read path returning NULL for rows the write path hasn't caught up on. Pick an order and stick to it.

---

## What "would Alembic have caught" looks like

Three classes of bug raw SQL migrations would have allowed and Alembic prevents:

**1. Forgot to update `models.py`.** Imagine I added the column via raw SQL but didn't touch `models.py`. Next `task db:revision` would diff the *now-stale model* against the live DB and emit a revision that *drops* the column. `alembic check` in CI would have failed on first PR.

**2. Backfill ran twice.** Without `alembic_version` tracking, `task db:migrate` (raw-SQL style) re-runs every file every time. A backfill that does `SET duration_ms = ...` without the `IS NULL` guard would overwrite live data on every machine that re-runs the migration. With Alembic, the migration is recorded as applied; the next upgrade is a no-op.

**3. Two branches both numbered their migration `005_*.sql`.** Branch A merges first, its file becomes `005_a_thing.sql`. Branch B's still-local file is `005_b_thing.sql`. They both apply locally, but when B merges, A's file no longer exists at the path B's migration expects. With Alembic, branch B's revision has `down_revision = '04370fbe93f4'`. When A merges first and gets a different revision ID, B's `alembic upgrade head` errors with "Multiple head revisions are present" and the developer knows to rebase. Loud failure beats silent corruption.

None of these are theoretical. All three are footguns I've stepped on in raw-SQL migration systems over the years. The cost of Alembic — one declarative-models file, one baseline revision — is paid back the first time any of them would have fired.

---

## What's still annoying

Honest list, for the record:

- **`alembic check` in CI.** Not set up yet. Should be: `task db:upgrade && alembic check` as a CI step. Catches the "forgot to update models.py" class of bug at PR review time.
- **The autogenerated revision file is verbose.** Three `branch_labels = None` / `depends_on = None` lines per file that nobody ever sets. A `script.py.mako` tweak can drop them; on my next pass.
- **Materialized views.** Still hand-written. Nothing to do about it; just stay disciplined.
- **The transaction boundary.** Alembic wraps each revision in a single transaction. That's the right default but blocks `CREATE INDEX CONCURRENTLY`. For the first revision that needs CONCURRENTLY, the file will need `transactional_ddl = False` and the COMMIT/BEGIN dance documented in MIGRATIONS.md. Not a problem yet.

---

## What I'd do tomorrow

Tighten `duration_ms` to NOT NULL once commits 2 and 3 have been running for a week and any backlog of un-backfilled rows has cleared:

```python
# packages/api/src/clipdex_api/models.py
duration_ms = Column(BigInteger, nullable=False)
```

```sh
$ task db:revision -- "tighten duration_ms to NOT NULL"
```

Autogenerate emits:

```python
def upgrade():
    op.alter_column(
        'processed_videos',
        'duration_ms',
        existing_type=sa.BigInteger(),
        nullable=False,
    )
```

That's the entire migration. No backfill needed (the previous backfill already happened, and the ingest worker is writing the column for new rows). One-line schema tightening as a separate revision is exactly the kind of change Alembic makes cheap — and exactly the kind of change raw SQL migrations would have buried in a 20-line file.

---

## Where the bet stands

Three commits in, the post-10 infrastructure has held up:

- One schema change, one autogenerated revision, one hand-edit (the backfill).
- Zero churn on `models.py` other than one new line.
- Zero changes to the request path's connection setup.
- A clear forward path for the next change (NOT NULL tightening), planned, not yet executed.

The thing I want to emphasise: this is the *boring* version of a schema change. It's supposed to be boring. The four cracks from [post 9](/technical-notes/raw-sql-migrations-when-and-when-not/) are all closed; the migration cost from [post 10](/technical-notes/clipdex-adopting-alembic/) was ninety minutes; the first real revision in this post took twenty. That's the whole pitch — adopt the tool, pay the small cost once, and every change after that is a one-liner in a model file and a `task db:revision`.

Next post in the series: probably the question generator's grounding data layer, which is the first schema change that wants more than one table at a time. Or the `search_cache` TTL job, which would teach the materialized-view recipe. I'll pick by whichever I actually need first.
