---
draft: false
title: "Adopting Alembic in clipdex without rewriting the query layer"
date: "2026-05-26T10:00:00+05:45"
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "The previous post named four cracks in clipdex's raw-SQL migration story. This one closes them. Declarative models that mirror the live schema, a no-op baseline revision, `alembic stamp head`, and a frozen `migrations/legacy/` directory. No query code changes. Ninety minutes."
cover: "/images/blog/clipdex/adopting-alembic/cover.png"
thumb: "/images/blog/clipdex/adopting-alembic/thumb.png"
last_modified_at: "2026-05-26T10:00:00+05:45"
use_featured_image: true
series: clipdex
seriesOrder: 10
tags:
  - python
  - postgres
  - alembic
  - sqlalchemy
  - migrations
  - fastapi
  - infrastructure
---

[Last post](/technical-notes/raw-sql-migrations-when-and-when-not/) named four cracks in clipdex's raw-SQL migration approach: no applied-state tracking, ordering collisions across branches, no downgrade story, and no autogenerate diff between models and live schema. The fix is Alembic. This post does the migration, in commits the reader can follow.

The constraint that shapes the whole thing: **don't rewrite the query layer.** Clipdex's API uses psycopg with raw SQL strings. That works, the posts that introduced those queries link to them verbatim, and rewriting them to SQLAlchemy ORM would be a separate project. Alembic doesn't need the query layer. It needs metadata. We can get metadata from declarative models that exist *only* for autogenerate to diff against.

This is the move. The query layer doesn't change. Five small steps. Ninety minutes.

---

## What we're aiming at

After the migration:

```
packages/api/
├── alembic.ini
├── alembic/
│   ├── env.py
│   └── versions/
│       └── cad2f1272a8a_baseline_raw_sql_migrations_001_004.py
└── src/clipdex_api/
    ├── db.py            # unchanged — still raw SQL via psycopg
    ├── search.py        # unchanged
    ├── guests.py        # unchanged
    └── models.py        # NEW — declarative tables for autogenerate
migrations/
└── legacy/              # 001-004 moved here, frozen
```

`task db:upgrade` becomes the only command anyone runs for schema changes. `task db:bootstrap` handles fresh DBs: apply the legacy SQL once, stamp the Alembic baseline, then upgrade.

---

## Step 1 — add the dependency, scaffold Alembic

In `packages/api/pyproject.toml`:

```toml
dependencies = [
    ...
    "sqlalchemy[asyncio]>=2.0",
    "alembic>=1.14",
    ...
]
```

`uv sync` to install. Then from the API package directory:

```sh
uv run --package clipdex-api alembic init -t async alembic
```

That creates `packages/api/alembic.ini`, `packages/api/alembic/env.py`, `packages/api/alembic/script.py.mako`, and an empty `versions/` directory. The `-t async` template matters: clipdex's API uses async SQLAlchemy, and the async template's `env.py` already knows how to bridge sync Alembic operations onto an async engine via `connection.run_sync()`.

You can ignore everything in `alembic.ini` except `script_location`. The connection URL is going to come from `.env`, not the ini file.

---

## Step 2 — declarative models that mirror the live schema

This is the trick. We write `models.py` not as the *future* shape of the database, but as the *current* shape — what `001_init.sql` through `004_search.sql` have already produced. Every column type, every index, every check constraint, every server default.

Excerpt from `packages/api/src/clipdex_api/models.py`:

```python
"""SQLAlchemy declarative models mirroring the live Postgres schema.

These exist for Alembic's --autogenerate diff. Application query code still
uses raw SQL via psycopg — these models are NOT imported by the request path.
"""

from sqlalchemy import (
    BigInteger, CheckConstraint, Column, DateTime, ForeignKey, Index,
    Integer, PrimaryKeyConstraint, REAL, Text, text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


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

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'done', 'failed')",
            name="processed_videos_status_check",
        ),
    )
```

Five things worth pointing out in that one class:

**1. `DeclarativeBase` (SQLAlchemy 2.x).** Not the legacy `declarative_base()` factory — the new style is a class you subclass. Cleaner, types better with mypy, what every new project should use.

**2. `text("now()")` for server defaults**, not Python's `datetime.utcnow`. The default is *in the database*, written by Postgres. If you use a Python callable here, autogenerate will think the live schema is wrong and emit a spurious "drop the server default" migration on first run.

**3. Named check constraints.** `name="processed_videos_status_check"` matters because Postgres names check constraints automatically (`processed_videos_status_check` is the conventional pattern), and autogenerate uses the name to diff. Without the name, autogenerate sees the *anonymous* constraint in the model and the *named* one in the DB and emits drop+create.

**4. The reserved word `text`.** `transcript_segments` and `quotes_raw` have a `text` column. `text` is also the SQLAlchemy function we imported. Resolve the conflict like this:

   ```python
   class TranscriptSegment(Base):
       __tablename__ = "transcript_segments"
       text_ = Column("text", Text, nullable=False)   # attr name vs column name
   ```

   The Python attribute is `text_`; the SQL column stays `text`. Both are correct.

**5. The docstring says "NOT imported by the request path."** Important to write down. The temptation in a future PR will be to start using `models.ProcessedVideo` in queries. That's fine eventually — but mixing the ORM and raw SQL prematurely makes both worse. Hold the line: `models.py` is for Alembic, not for query construction.

---

## Step 3 — wire `env.py` to the DATABASE_URL and to `Base.metadata`

The `alembic init -t async` template leaves a placeholder `target_metadata = None`. We want it pointing at our `Base.metadata` so autogenerate has something to diff against. And we want the connection URL to come from `.env`, not from `alembic.ini`.

`packages/api/alembic/env.py`, top of file:

```python
import asyncio
import os
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from clipdex_api.models import Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# DATABASE_URL is the source of truth. Normalise to +psycopg async driver,
# matching clipdex_api.db.
_db_url = os.getenv("DATABASE_URL", "postgresql://localhost:5432/clipdex")
if _db_url.startswith("postgresql://"):
    _db_url = "postgresql+psycopg://" + _db_url[len("postgresql://"):]
config.set_main_option("sqlalchemy.url", _db_url)

target_metadata = Base.metadata
```

And in `do_run_migrations`, two flags worth turning on:

```python
def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()
```

`compare_type=True` makes autogenerate notice column-type changes (e.g., `Integer` → `BigInteger`). `compare_server_default=True` makes it notice changes to `server_default`. Without these, you can swap a column's type in `models.py` and autogenerate will emit an *empty* revision — a particularly demoralising failure mode.

---

## Step 4 — the baseline revision (the trick)

The schema already exists in the live DB. There's nothing to *upgrade* to get there. But Alembic needs a revision in `versions/` to be the parent of every future revision. So we create one whose `upgrade()` is empty:

```sh
uv run --package clipdex-api alembic -c packages/api/alembic.ini \
  revision -m "baseline (raw SQL migrations 001-004)"
```

Edit the generated file:

```python
"""baseline (raw SQL migrations 001-004)

Revision ID: cad2f1272a8a
Revises: 
"""
revision: str = 'cad2f1272a8a'
down_revision = None

def upgrade() -> None:
    """No-op baseline.

    The schema this revision represents was produced by migrations/legacy/
    001_init.sql through 004_search.sql. Existing DBs are stamped to this
    revision (`alembic stamp head`) so future revisions stack on top.
    """
    pass

def downgrade() -> None:
    """No inverse for the baseline — drop the database to undo."""
    pass
```

Then **stamp the live DB** to declare it caught up to this revision:

```sh
DATABASE_URL=postgresql://localhost:5432/clipdex \
  uv run --package clipdex-api alembic -c packages/api/alembic.ini stamp head
```

This creates the `alembic_version` table and inserts one row: `cad2f1272a8a`. It runs no DDL. The DB is unchanged. But Alembic now knows where it is.

Verify:

```sh
$ psql -d clipdex -X -c "select * from alembic_version;"
 version_num  
--------------
 cad2f1272a8a

$ uv run --package clipdex-api alembic -c packages/api/alembic.ini check
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.ddl.postgresql] Detected sequence named 'guest_aliases_id_seq' as owned by integer column 'guest_aliases(id)', assuming SERIAL and omitting
...
No new upgrade operations detected.
```

`No new upgrade operations detected.` is the most important line in the whole migration. It means **`models.py` and the live schema agree**. If autogenerate sees a diff here, your model is wrong somewhere — fix it before continuing.

---

## Step 5 — retire the legacy SQL and rewire the Taskfile

Move the four legacy files into a `migrations/legacy/` directory:

```sh
mkdir -p migrations/legacy
git mv migrations/00*.sql migrations/legacy/
```

Add a `migrations/legacy/README.md` that explains they're frozen and only used for bootstrap.

The Taskfile changes from:

```yaml
db:migrate:
  cmds:
    - psql -d clipdex -f migrations/001_init.sql
    - psql -d clipdex -f migrations/002_enrich.sql
    - psql -d clipdex -f migrations/003_resolution.sql
    - psql -d clipdex -f migrations/004_search.sql
```

…to:

```yaml
db:bootstrap:
  desc: Create the DB if missing, apply legacy SQL, stamp Alembic baseline, then upgrade.
  cmds:
    - createdb clipdex 2>/dev/null || true
    - |
      if ! psql -d clipdex -X -tAc \
        "SELECT 1 FROM information_schema.tables WHERE table_name='alembic_version'" \
        | grep -q 1; then
        echo "Bootstrapping fresh DB from migrations/legacy/..."
        psql -d clipdex -f migrations/legacy/001_init.sql
        psql -d clipdex -f migrations/legacy/002_enrich.sql
        psql -d clipdex -f migrations/legacy/003_resolution.sql
        psql -d clipdex -f migrations/legacy/004_search.sql
        uv run --package clipdex-api alembic -c packages/api/alembic.ini stamp head
      fi
    - task: db:upgrade

db:upgrade:
  cmd: uv run --package clipdex-api alembic -c packages/api/alembic.ini upgrade head

db:revision:
  desc: 'Generate a new Alembic revision. Usage: task db:revision -- "short message"'
  cmd: uv run --package clipdex-api alembic -c packages/api/alembic.ini revision --autogenerate -m "{{.CLI_ARGS}}"

db:current:
  cmd: uv run --package clipdex-api alembic -c packages/api/alembic.ini current
```

The conditional in `db:bootstrap` is the trick that makes it idempotent: if `alembic_version` exists, the legacy SQL doesn't run again — only `alembic upgrade head` does. A fresh `createdb` hits the first branch once and then never again.

---

## The materialized view caveat

Alembic's autogenerate does **not** track materialized views. The `transcript_segments_search` view from `004_search.sql` is invisible to the metadata diff. We can't put it in `models.py` and have autogenerate manage it.

So:

- The legacy file stays as the source of the view's original definition.
- Future changes to the view live in **hand-written revisions** — `alembic revision -m "..."` without `--autogenerate`, then add the DDL in `op.execute(...)`:

  ```python
  def upgrade():
      op.execute("DROP MATERIALIZED VIEW IF EXISTS transcript_segments_search")
      op.execute("""
          CREATE MATERIALIZED VIEW transcript_segments_search AS
          SELECT ...
      """)
      op.execute("CREATE UNIQUE INDEX ... ON transcript_segments_search (...)")
  ```

This is documented in `MIGRATIONS.md` under the "Materialized views" recipe. Anything that needs hand-written DDL — views, extensions, custom functions, `CREATE INDEX CONCURRENTLY` — gets the same treatment: skip `--autogenerate`, write the `op.execute` calls by hand, commit.

The cost of accepting this caveat is small. Materialized views change rarely; when they do, the hand-written DDL is the same DDL you'd write anyway. The benefit — autogenerate for the 95% of changes that *are* tables, columns, indexes — is enormous.

---

## What the daily flow looks like now

Adding a column to `processed_videos`:

```sh
# 1. Edit models.py — add the column to ProcessedVideo
vim packages/api/src/clipdex_api/models.py

# 2. Autogenerate the revision
task db:revision -- "add view_count to processed_videos"
# -> Generating .../alembic/versions/<hash>_add_view_count_to_processed_videos.py

# 3. Review the generated file. Edit if it got something wrong (e.g., a rename
#    came out as drop+add).

# 4. Apply
task db:upgrade

# 5. Confirm
task db:current
# -> <new hash> (head)
```

Five commands, one of which is opening an editor. The four cracks from last post are all closed:

- **Applied-state tracking**: `alembic_version` table.
- **Ordering across branches**: revision hashes + `down_revision` pointers; merge conflicts surface at `task db:upgrade` time, not silently in production.
- **Downgrade path**: `downgrade()` exists in every revision file. Empty by default; fill in when the change is one you might want to roll back.
- **Autogenerate diff**: `task db:revision` writes the migration for you, catching the missed index / missed NOT NULL / forgotten foreign key class of bug at edit time.

---

## What didn't change

Worth being explicit about. **The query layer didn't move.** `packages/api/src/clipdex_api/db.py` still creates a psycopg-backed async engine. `search.py`, `guests.py`, `questions.py`, `stats.py` still execute raw SQL strings. The 25 tests pass without modification.

This is the unlock that made the migration ninety minutes instead of two weeks. Alembic doesn't require you to commit to the SQLAlchemy ORM. It requires *metadata*. A small `models.py` that exists only for `target_metadata = Base.metadata` is enough.

If clipdex eventually moves the query layer to SQLAlchemy Core or the ORM — for type-safe joins, for repository patterns, for whatever — those models are already there to build on. Or not. Both futures stay open.

---

## What I'd do differently next time

Two small things, both about the baseline.

**Port the legacy SQL into the baseline's `upgrade()`.** I chose not to, because keeping the original blog posts link-able to the literal `.sql` files mattered for the series. For any project that's not a teaching artifact, porting the bootstrap into Alembic's `op.create_table(...)` calls means a fresh DB needs only `alembic upgrade head` — no special bootstrap branch in the Taskfile. Simpler.

**Generate the baseline from the live DB.** There's an `alembic revision --autogenerate` you can run against an empty DB *with the models pointed at metadata*, which will generate a `create_all` baseline for you. I wrote the models by hand because I wanted them to mirror the legacy SQL exactly, line-by-line, and to catch any drift between what the legacy SQL said and what the live DB actually had. (There was none, in the end. But the verification was worth it.)

Neither of these is a fix. They're the trade-offs I'd make differently in a non-teaching codebase.

---

Next up in the series: the first *real* Alembic revision. A new feature that adds a table, a column, an index, and tests the autogenerate path end-to-end. That's where the bet pays off — or doesn't.
