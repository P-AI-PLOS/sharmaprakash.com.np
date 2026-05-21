---
title: "Taming a polyglot monorepo: Taskfile, selective CI, and reproducible setup"
date: "2026-03-30T10:00:00+05:45"
excerpt: "A monorepo's developer experience is mostly a Taskfile plus a CI workflow. Both should answer one question: what changed, and what depends on what changed?"
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
tags: [python, monorepo, uv, taskfile, ci, github-actions, pnpm]
cover: "/images/blog/python-monorepo-2026/monorepo-tasks-and-ci/cover.png"
thumb: "/images/blog/python-monorepo-2026/monorepo-tasks-and-ci/thumb.png"
series: python-monorepo-2026
seriesOrder: 5
use_featured_image: true
last_modified_at: "2026-03-30T10:00:00+05:45"
---

> Builds on the [`uv-2026`](/technical-notes/why-uv-exists/) series — if you've never used `uv` workspaces, start there.

The previous four posts argued *why* a Python monorepo is worth doing and *how* to lay it out: workspace boundaries, intra-workspace path deps, Pydantic-to-TypeScript codegen, a Vite + React SPA living next to FastAPI. That's the structure. None of it survives a week of real development without a thin layer on top: a task runner that hides the polyglot, and a CI workflow that doesn't rebuild the world for a one-line README change.

This post is that layer.

## The shape of the problem

A new contributor clones the repo. To get a dev environment they need to: install `uv`, install `pnpm`, run `uv sync --all-packages`, run `pnpm install`, run the codegen pipeline to produce `packages/web/src/generated/types.ts`, and start *two* dev servers in two terminals. Five tools, seven commands, and an order dependency between two of them.

That's the floor. The ceiling is a CI job that runs the full Python test suite, the JS type-check, the JS test suite, the linter for both stacks, the schema-drift check, and the lockfile-freshness check — on every PR. Done naively this is fifteen minutes and a lot of wasted compute when someone changes a single Markdown file.

A monorepo earns its keep when the *answer to "what do I run?"* is one command for the human and a deterministic dependency graph for the CI.

## Taskfile as the cross-runtime command runner

`make` is the obvious choice and the wrong one here. We're coordinating two ecosystems with different idioms (`uv run`, `pnpm --filter`), running on three OSes (mac, linux, the GitHub Actions runner), and we want per-package task files that the root one can include without manual `include` plumbing.

[Taskfile](https://taskfile.dev/) (the `go-task` project) gives you a YAML file with named tasks, a dependency graph, and first-class includes. It's a single static binary — `mise use -g go-task` and you're done.

Here's the root file in the reference repo:

```yaml title="Taskfile.yml"
version: "3"

includes:
  api: ./packages/api
  web: ./packages/web
  ingest: ./packages/ingest

tasks:
  setup:
    desc: "First-time setup. Install deps for every package."
    cmds:
      - uv sync --all-packages
      - pnpm install
      - task: codegen

  codegen:
    desc: "Regenerate TS types from Pydantic schemas."
    sources:
      - packages/shared-schema/src/**/*.py
    generates:
      - packages/web/src/generated/types.ts
    cmds:
      - uv run --package shared-schema python scripts/emit_schema.py
      - pnpm --filter web run codegen

  dev:
    desc: "Run API + web dev servers with prefixed output."
    deps: [codegen]
    cmds:
      - task: api:dev &
      - task: web:dev

  test:
    desc: "Run every package's test suite."
    cmds:
      - uv run pytest
      - pnpm --filter web test --run

  lint:
    desc: "Lint Python and JS."
    cmds:
      - uv run ruff check .
      - uv run mypy packages/
      - pnpm --filter web lint

  check:
    desc: "What CI runs. Lint, type-check, test, schema-drift, lockfiles."
    deps: [lint, test]
    cmds:
      - task: codegen
      - git diff --exit-code packages/web/src/generated/
      - uv sync --locked
      - pnpm install --frozen-lockfile
```

A few things worth pointing at:

- **`sources` and `generates` on `codegen`.** Taskfile fingerprints those globs and skips the task if nothing relevant changed. The first `task dev` of the day regenerates types; the second one doesn't. Same idea as `make`'s mtime check, just less footgun.
- **`includes:` pulls in per-package tasks.** `task api:dev` runs the `dev` task defined in `packages/api/Taskfile.yml`. Each package owns its own entrypoints.
- **`task check` is the single CI mirror.** If `task check` is green locally, CI is green. No surprises.

A per-package Taskfile is short — it knows its tools and nothing else:

```yaml title="packages/api/Taskfile.yml"
version: "3"

tasks:
  dev:
    desc: "Run the FastAPI server with reload."
    cmds:
      - uv run --package api uvicorn api.main:app --reload --port 8000

  test:
    cmds:
      - uv run --package api pytest packages/api
```

The contract: every package implements `dev` and `test`. The root Taskfile is allowed to call those by name and nothing else.

## One-command setup

`task setup` is the most-used task in the repo. It runs the same three steps a new laptop needs:

```sh
task setup
```

That's it. `uv sync --all-packages` walks the workspace and installs every member's deps into a shared `.venv/` at the repo root. `pnpm install` does the equivalent for the JS side with `pnpm-workspace.yaml`. `task codegen` produces the TypeScript types from the Pydantic models so the frontend's `tsc` doesn't immediately fail.

On a warm cache that's under 60 seconds on a clean machine. On a cold one it's bounded by network, not by orchestration cleverness.

The README needs exactly two lines under "Getting started":

```sh
mise install        # uv, pnpm, go-task — versions pinned in mise.toml
task setup
```

Anything more elaborate is a sign that something else is broken. If `task setup` doesn't get you to a working `task dev`, fix `task setup`.

## Linting and formatting: shared versions, per-package scope

The trap with monorepo linters is letting each package pick its own version. You get a green local run and a red CI run because someone's `mypy` is 1.10 and CI's is 1.13. Two rules avoid this.

**Pin the tool versions at the repo root.** From series 1 post 5: install `ruff` and `mypy` as `uv tool` so every package shares the same binary.

```toml title="pyproject.toml (root)"
[tool.uv]
required-version = ">=0.5"

[tool.uv.workspace]
members = ["packages/*"]

# Dev tools available to every package via `uv run`:
[dependency-groups]
dev = [
  "ruff>=0.7",
  "mypy>=1.13",
  "pytest>=8",
]
```

**Configure once at the root.** `ruff.toml` and `mypy.ini` at the repo root cover every Python package. Per-package overrides only when there's a real reason (a generated-code directory that needs `ignore_errors = true`, say).

```toml title="ruff.toml"
target-version = "py312"
line-length = 100

[lint]
select = ["E", "F", "I", "B", "UP", "N", "RUF"]
ignore = ["E501"]  # line length is handled by the formatter

[lint.per-file-ignores]
"**/scripts/emit_schema.py" = ["T201"]  # print() is fine in build scripts
```

For the JS side I prefer `biome` over `eslint` + `prettier` for a new repo — one binary, no config sprawl, fast enough on the whole tree that you can run it without `--filter`. `biome.json` lives at the repo root and applies to `packages/web/` (and any future JS package). The Python ecosystem has been consolidating on `ruff`; the JS ecosystem is doing the same on `biome`. Lean into both.

## Selective CI: only test what changed

The naive workflow runs `task check` on every push. That's defensible — it's reproducible and the failure mode is "CI is slow," not "CI lied." But once the repo has five Python packages and a frontend, the every-push approach starts costing ten minutes per PR for the kind of changes that touch one file.

[`dorny/paths-filter`](https://github.com/dorny/paths-filter) is the right primitive: declare named filters by path glob, then gate downstream jobs on which filters fired.

```yaml title=".github/workflows/ci.yml"
name: ci

on: [push, pull_request]

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      api: ${{ steps.filter.outputs.api }}
      web: ${{ steps.filter.outputs.web }}
      schema: ${{ steps.filter.outputs.schema }}
      ingest: ${{ steps.filter.outputs.ingest }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            schema:
              - 'packages/shared-schema/**'
            api:
              - 'packages/api/**'
              - 'packages/shared-schema/**'
              - 'packages/llm-client/**'
            ingest:
              - 'packages/ingest/**'
              - 'packages/shared-schema/**'
            web:
              - 'packages/web/**'
              - 'packages/shared-schema/**'

  python:
    needs: changes
    if: ${{ needs.changes.outputs.api == 'true' || needs.changes.outputs.ingest == 'true' || needs.changes.outputs.schema == 'true' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v6
        with:
          enable-cache: true
      - run: uv sync --locked --all-packages
      - run: uv run ruff check .
      - run: uv run mypy packages/
      - run: uv run pytest

  web:
    needs: changes
    if: ${{ needs.changes.outputs.web == 'true' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v6
        with:
          enable-cache: true
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: uv sync --locked --package shared-schema
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter web run codegen
      - run: pnpm --filter web lint
      - run: pnpm --filter web typecheck
      - run: pnpm --filter web test --run

  drift:
    needs: changes
    if: ${{ needs.changes.outputs.schema == 'true' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v6
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: uv sync --locked --all-packages
      - run: pnpm install --frozen-lockfile
      - run: task codegen
      - run: git diff --exit-code packages/web/src/generated/
```

The shape worth noting:

- **The `changes` job is a router.** It runs once, fast, and emits outputs the other jobs gate on.
- **Reverse dependencies are baked into the filter globs.** A change to `shared-schema` triggers `api`, `ingest`, *and* `web` — because they all depend on it. This is the part you have to maintain by hand; there's no tool that reads `pyproject.toml` deps and generates the filter for you. It's worth the maintenance. (When the reference repo grows past ten packages I'll switch to `nx` or `turbo` for the dep graph and revisit. For five packages, the YAML is honest.)
- **The `drift` job is the killer feature** of a polyglot monorepo. Regenerate TS types from Pydantic, then `git diff --exit-code`. If a backend schema change wasn't accompanied by a regenerated `types.ts`, the PR fails with a diff in the log showing exactly what should have been committed.

Total config: about 70 lines of YAML. A typo-fix PR that touches `README.md` runs the `changes` job and stops there — under thirty seconds end to end.

## The lockfile guarantee

Two lockfiles, two checks, same property: fail closed if either has drifted.

```yaml
- run: uv sync --locked --all-packages
- run: pnpm install --frozen-lockfile
```

`uv sync --locked` refuses to install if `uv.lock` and any `pyproject.toml` in the workspace have drifted. `pnpm install --frozen-lockfile` is the equivalent for `pnpm-lock.yaml`. Both fail the build with a useful error rather than silently re-resolving.

Commit both lockfiles. Make a `dependabot` or `renovate` config that bumps them in coordinated PRs (one for `uv`, one for `pnpm`, never combined — they need different reviewers). And never let a `package.json` change merge without the corresponding `pnpm-lock.yaml` update. The CI gate is the only thing that enforces this; humans will forget.

## Schema drift, in detail

This deserves its own section because it's the *thing* a polyglot monorepo gives you that no other layout can.

The pipeline from post 3:

1. `shared-schema` exports Pydantic models.
2. `scripts/emit_schema.py` walks them and writes `packages/web/src/generated/schema.json`.
3. `pnpm --filter web run codegen` runs `json-schema-to-typescript` and writes `packages/web/src/generated/types.ts`.

The generated `.ts` is committed. That's the *contract* the frontend reads against. The `drift` CI job re-runs steps 2 and 3, then `git diff --exit-code` against the generated file.

If a contributor renames `Guest.full_name` to `Guest.display_name` on the Pydantic side, two things happen:

- TypeScript compilation in `packages/web/` fails immediately (locally and in CI), because the frontend code still says `guest.full_name`.
- The `drift` job fails with a diff showing the rename in `types.ts`. The fix is `task codegen && git add packages/web/src/generated/types.ts`.

Both are the right failures at the right time. The thing that *doesn't* happen — a silent runtime error in production three days after merge — is the whole point.

The cost: a generated file in the repo. Some teams hate this. The alternative is generating the types on every `pnpm install` and hoping the install hook never breaks; in practice the committed-artifact pattern is more durable and easier to review. The diff in a PR shows reviewers exactly what schema change is rippling out to the frontend.

## Caching that actually works

Two action choices matter.

**`astral-sh/setup-uv@v6` with `enable-cache: true`.** Persists `~/.cache/uv` between runs, keyed on the lockfile hash. A green build typically restores deps from cache and only re-downloads when `uv.lock` changes. Same story as the Docker pattern from the previous series.

**`actions/setup-node@v4` with `cache: pnpm`.** Persists `~/.local/share/pnpm/store` keyed on `pnpm-lock.yaml`. Same property: green builds reuse the store, lockfile changes invalidate it.

Together these turn a cold ~3-minute install into a warm ~15-second restore. The schema-drift job in particular benefits — it doesn't run tests, just installs, codegens, and diffs, so install time dominates.

## Gotchas

- **`uv sync --all-packages` is not the same as `uv sync`.** Without `--all-packages`, `uv` only installs deps for the package nearest the cwd. In CI you want the whole workspace; in a per-package Taskfile you want just the one.
- **Taskfile globs are evaluated relative to the Taskfile's directory.** A root task that touches `packages/shared-schema/src/**/*.py` works; the same path in `packages/api/Taskfile.yml` won't. Per-package tasks should reference paths within their own package only.
- **`paths-filter` runs against the PR base, not against `HEAD~1`.** On a push to `main` it falls back to the previous commit, but on PRs it correctly compares against the merge target. Don't write filters that assume single-commit pushes.
- **The codegen job needs the *full* repo, not a sparse checkout.** `actions/checkout@v4` with the default config is correct. Sparse checkouts break `uv`'s workspace resolution and `pnpm`'s workspace topology in subtle ways — don't go there for a five-package repo.
- **Don't commit `.venv/` or `node_modules/`.** Obvious, but worth saying: both are large, both are derived, and both belong in `.gitignore` and `.dockerignore` at the repo root.

## Closer

Five posts in, the monorepo story holds together: `uv workspaces` for Python package boundaries (post 1, post 2); Pydantic-to-TypeScript codegen for cross-stack type safety (post 3); a Vite + React frontend sharing the repo via `pnpm-workspace` (post 4); a Taskfile and selective CI to keep developer experience honest (this post). None of it requires inventing anything — every piece is a small, boring, off-the-shelf tool used for the thing it's good at.

This is the foundation. The next series — **Building an AI Podcast Index** — builds something real on top of it: ingesting podcast transcripts with `yt-dlp` and Whisper, extracting guests and topics with an LLM through a provider-switchable client, surfacing them in a typed React UI, and shipping it all from one `task deploy` command. The reference repo from this series (`ai-podcast-index`) is the build-along.

Series 3 starts next week.

<!--
Full source: https://github.com/poudelprakash/ai-podcast-index — tags
`series2-post5` mark the state of the repo at the end of this post.

# Image prompt

Codex prompt for cover.png (21:9) and thumb.png (16:9), saved to
public/images/blog/python-monorepo-2026/monorepo-tasks-and-ci/cover.png and
thumb.png.

Editorial illustration, no embedded text, no logos, no watermarks. A series of
parallel conveyor lanes seen slightly from above, each lane carrying a small
geometric package (cube, sphere, prism) toward a single converging node on the
right. Some lanes are lit and active; others are dimmed, suggesting selective
execution — only the lanes whose cargo changed are running. A faint dotted
graph overlay connects the lanes into a dependency network. Cool slate and
blue background with a single warm accent (amber) on the active lanes. Calm,
geometric, slightly isometric composition with generous negative space. Matte
finish, restrained palette, no neon. Aspect ratios: 21:9 hero crop and 16:9
card crop of the same composition.
-->
