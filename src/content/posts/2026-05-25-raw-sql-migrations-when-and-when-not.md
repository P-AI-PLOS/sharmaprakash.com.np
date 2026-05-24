---
draft: false
title: "Raw SQL migrations: when they're enough, and the four cracks that force Alembic"
date: "2026-05-25T10:00:00+05:45"
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "Clipdex ships migrations as numbered `.sql` files applied by a Taskfile loop. That's been the right call for a teaching artifact. Here are the four specific cracks that will eventually force a move to Alembic — and the test for when 'eventually' becomes 'now'."
cover: "/images/blog/clipdex/raw-sql-migrations/cover.png"
thumb: "/images/blog/clipdex/raw-sql-migrations/thumb.png"
last_modified_at: "2026-05-25T10:00:00+05:45"
use_featured_image: true
series: clipdex
seriesOrder: 9
tags:
  - python
  - postgres
  - sql
  - alembic
  - migrations
  - sqlalchemy
  - infrastructure
---

The first time I shipped a schema change in [clipdex](/technical-notes/clipdex-project-overview/), I had a choice. The Python toolchain has an obvious default — SQLAlchemy + Alembic, autogenerate revisions, `alembic upgrade head`. The thing every Python+Postgres tutorial reaches for.

I didn't reach for it. Clipdex ships migrations as numbered `.sql` files:

```
migrations/
├── 001_init.sql
├── 002_enrich.sql
├── 003_resolution.sql
└── 004_search.sql
```

Applied by a `Taskfile.yml` loop:

```yaml
db:migrate:
  desc: Apply migrations to the local DB.
  cmds:
    - psql -d clipdex -f migrations/001_init.sql
    - psql -d clipdex -f migrations/002_enrich.sql
    - psql -d clipdex -f migrations/003_resolution.sql
    - psql -d clipdex -f migrations/004_search.sql
```

That's it. No `alembic_version` table. No `env.py`. No autogenerate. No revisions directory. Four files, one loop, every statement is literal SQL you can read in the post that introduced it.

This post is about why that's been the right call so far, the four specific cracks where it stops being the right call, and the test for spotting when "eventually" becomes "now."

---

## Why raw SQL won this round

Clipdex is a build-along teaching artifact. Each post in the series corresponds to a git tag. The reader can check out `series3-post3` and *read the schema that exists at post 3*. That requirement shaped three choices:

**The migration is the diff.** When [post 3](/technical-notes/structured-extraction-with-claude/) adds the `guests`, `topics`, and `quotes` tables, `migrations/002_enrich.sql` is what the post is *describing*. The reader sees the CREATE TABLE statements verbatim. With Alembic the equivalent is a Python file with `op.create_table(...)` calls — readable, but one layer removed from the database, and a layer the post would have to introduce.

**Zero new dependencies.** Adding Alembic means adding SQLAlchemy (Alembic is a sibling project but uses SQLAlchemy's metadata). That's two more libraries the series has to teach, plus the question of whether the API package uses the ORM, Core, or just continues with raw SQL via psycopg. For a series whose stated scope is "local-first, single-user, no auth, no deploy," that's surface area I didn't want.

**Reapplies are safe.** Every migration uses `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, and `CREATE OR REPLACE` where the syntax supports it. `task db:migrate` is idempotent for a caught-up DB and works for bootstrap on a fresh one. Good enough.

For a teaching repo at four migrations, this composition wins on every axis. The cost of Alembic — explanation budget — would not have paid for itself in correctness.

---

## The four cracks

The defense above has a shelf life. Here are the specific failure modes raw numbered SQL has, in roughly the order you hit them.

### 1. No applied-state tracking

`task db:migrate` runs every file every time. Idempotency by `IF NOT EXISTS` works for *creates*, but the moment a migration includes:

- a one-time backfill (`UPDATE episodes SET view_count = 0 WHERE view_count IS NULL`),
- a destructive change (`DROP VIEW`, `ALTER ... DROP COLUMN`),
- a `CREATE INDEX CONCURRENTLY` (cannot run inside a transaction),

…you start hand-guarding each one with conditional logic in PL/pgSQL, or you start commenting out migrations after they run. Both are how this breaks in practice. Alembic's `alembic_version` table makes "which migrations have been applied" a database fact instead of a vibe.

### 2. Ordering ambiguity across branches

Clipdex is single-author. The moment two branches add migrations in parallel — feature branch A adds `005_add_view_count.sql`, feature branch B independently adds `005_add_published_year.sql` — you have a numbering collision and a silent merge conflict. Renaming one to `006_` after merge works, but only because there's no `alembic_version` row pinning the old name. With more than one contributor, this becomes a daily papercut. Alembic's revision hashes (and `down_revision` pointers) make the DAG explicit and detect collisions at `alembic upgrade` time.

### 3. No downgrade, no environments

Today the answer to "I need to roll back" is `dropdb clipdex && createdb clipdex && task db:migrate`, which is *fine* because the data is reproducible by re-running ingest. The day clipdex has any of:

- a staging DB you can't drop,
- a backup snapshot you want to time-travel,
- a long-running ingest you can't redo cheaply,

…that answer stops being acceptable. Alembic's `downgrade()` isn't magic — you still have to write the inverse — but it gives you a *place* for the inverse to live, indexed by revision. With raw SQL, downgrades are just "another .sql file you remember to run, maybe."

### 4. The "did I forget the index?" problem

The biggest practical win of Alembic + SQLAlchemy declarative tables is `--autogenerate`. You change a `Column(...)` on a model, run `alembic revision --autogenerate`, and Alembic diffs the model metadata against the live DB and writes the migration for you. It catches missing indexes, missing NOT NULL constraints, and the foreign keys you forgot.

Raw SQL has no such diff. Today clipdex's source of truth for "what's in the database" is the union of four .sql files; the source of truth for "what the application thinks is in the database" is scattered across `packages/api/src/clipdex_api/db.py` and the Pydantic models in `shared-schema/`. Nothing checks the two agree. They drift silently until a `KeyError` at runtime. Once.

This is the crack I expect to bite first. Every new column is a chance to forget an index, miss a NOT NULL, or skip the foreign-key constraint that would have caught the bug at insert time instead of three queries later.

---

## The test for switching

Three signals, any one of which is enough:

1. **A migration needs a backfill that can't be re-run safely.** The first time you write `UPDATE ... SET ... WHERE ... IS NULL` and realize re-running it after future inserts would corrupt data, you need applied-state tracking. Hand-guarding with `IF NOT EXISTS` doesn't extend to `UPDATE`.
2. **A second contributor lands a migration.** Numbering collisions are a when-not-if.
3. **The DB outlives an `ingest` cycle.** As soon as `dropdb && task db:migrate` stops being a free reset — because there's user data, a staging environment, or a backup you want to layer migrations against — you need real version tracking.

For clipdex, signal #1 is closest. The "popular guests scoring" work in [post 8](/technical-notes/question-generator-and-shipping-locally/) is one good idea away from a backfill that has to know whether it's already run.

---

## What "migrate to Alembic" looks like for clipdex

I'm going to do this in the next post, so this is a sketch. The migration is smaller than the framing suggests.

**Step 1.** Add SQLAlchemy + Alembic to `packages/api/` (or a new `packages/db/` package, depending on whether we want a shared metadata module).

**Step 2.** Define the existing tables as SQLAlchemy declarative models. *Don't switch the query layer.* The API can keep using raw SQL via psycopg. The models exist only to give Alembic something to diff against. This is the trick that makes the migration cheap.

**Step 3.** Stamp the current DB at the head: `alembic stamp head`. This tells Alembic "everything that exists right now is considered applied." No actual migration runs.

**Step 4.** From here on, every schema change is `alembic revision --autogenerate -m "..."`, review the generated file, edit if needed, commit.

**Step 5.** Retire `migrations/00*.sql` to `migrations/legacy/` for reference. New Alembic revisions live under `packages/api/alembic/versions/`.

The retained-raw-SQL-for-existing files matters: the blog posts that introduced those tables can still link to the original `.sql`, so the historical record stays readable. New migrations get the Alembic experience.

---

## What I want you to take from this

Raw numbered SQL migrations are not a beginner mistake. They are a real, defensible composition for a class of project — single-author, reproducible data, teaching artifact, no environments. The mistake is treating them as either *the only sensible choice* or *the obvious wrong choice*. They are the right choice until they aren't, and the four cracks above are the specific tells.

For a sequel-series codebase — clipdex with multiple contributors, a staging DB, irreplaceable data — Alembic is the right default. For the clipdex you can `git clone && task setup` and have working in five minutes, raw SQL is still winning. Both can be true.

Next in this series: doing the Alembic migration above, in commits the reader can follow.
