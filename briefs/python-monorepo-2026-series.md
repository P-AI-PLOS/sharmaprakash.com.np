# Brief: `python-monorepo-2026` blog series

A five-part series on building a Python monorepo with `uv` workspaces, sharing schemas with a co-located React frontend, and keeping CI sane. For `sharmaprakash.com.np`. Each post is fan-out-ready: a separate `claude` session takes one section below and drafts the post end-to-end.

## Series-wide constraints

- **Slug**: `python-monorepo-2026` (registered in `src/data/series.ts`).
- **Category**: `technical-notes` for every post.
- **Filename pattern**: `src/content/posts/YYYY-MM-DD-<slug>.md` — date matches frontmatter `date`. Pick consecutive weekly Tuesdays starting from the first unclaimed Tuesday after the latest existing 2026 post (check `ls src/content/posts/ | grep 2026 | sort | tail -1`).
- **Required frontmatter**: `title`, `date`, `excerpt`, `category: technical-notes`, `directory: technical-notes` (**required — without it the post routes to `/<slug>/` instead of `/technical-notes/<slug>/` and breaks under the expected URL**), `tags: [python, monorepo, uv, fastapi, react, ...]`, `cover`, `thumb`, `series: python-monorepo-2026`, `seriesOrder: N` (1–5), `use_featured_image: true`.
- **Images**: `public/images/blog/python-monorepo-2026/<post-slug>/cover.png` (21:9) and `thumb.png` (16:9). Per CLAUDE.md image rules: editorial, no embedded text/logos/watermarks. Document the Codex prompt in an HTML comment at the bottom of the post.
- **Voice**: opinionated, code-led, terse. Match existing posts in `src/content/posts/`.
- **Prerequisites callout** at the top of each post: "Builds on the `uv-2026` series — if you've never used `uv` workspaces, start there." Link to `/technical-notes/why-uv-exists/` (post 1 of series 1).
- **Reference repo**: `ai-podcast-index` — the real-world example we'll keep coming back to. If the repo is not yet public when drafting, write code blocks as illustrative and frame them as "what the layout looks like once you've made these decisions." Add a footer note: "Full source: https://github.com/poudelprakash/ai-podcast-index — tags `series2-postN` mark the state of the repo at each post."
- **Cross-links**: post 2 references post 1; post 3 references post 2; etc. Series 3 (`ai-podcast-index`) is teased in post 5's closer as "the build-along that uses everything from this series."

## Post 1 — Why a Python monorepo, and what `uv workspaces` actually gives you

**Working title**: *"Why a Python monorepo: what `uv workspaces` actually gives you"*

**Slug**: `python-monorepo-with-uv-workspaces`

**Thesis**: Most "Python monorepo" pain in 2024 came from gluing pip-tools + tox + manual path-hacks together. `uv workspaces` makes the seam between packages a first-class concept — one lockfile, one resolver, one venv shared across packages — and that's what makes the monorepo worth doing.

**Outline**:
- When a monorepo is the right call: multiple Python services sharing types/utils; a shared client library; coordinated releases; a frontend that needs the same schemas as the backend.
- When it's not: two unrelated apps; teams with separate release cadences; vendor handoff.
- What's new about `uv workspaces` vs. "just put packages in a folder": single `uv.lock` for the whole repo, intra-workspace deps resolved by path (no PyPI publish needed to share code), one `uv sync` sets up every package at once, dev dependencies scoped per-package.
- The workspace `pyproject.toml`: `[tool.uv.workspace]` with `members = ["packages/*"]`, root `[project]` block optional. Show a minimal example.
- What still costs you: CI matrices (covered in post 5), per-package version pinning, the "shared venv" mental shift.
- **Sidebar**: Poetry monorepos vs `uv` monorepos — the migration story. One paragraph, not a section.

## Post 2 — Designing the package layout

**Working title**: *"Designing a uv workspace: package boundaries that survive contact with reality"*

**Slug**: `uv-workspace-package-layout`

**Thesis**: The hardest part of a monorepo is deciding where one package ends and another begins. Use *change boundaries* (what changes together stays together) and *interface boundaries* (what's consumed by N packages becomes its own package) as the two rules.

**Outline**:
- The reference repo's layout (from the `ai-podcast-index` example):
  ```
  packages/
    ingest/          # YouTube + Whisper transcription
    enrich/          # LLM extraction
    api/             # FastAPI HTTP surface
    llm-client/      # provider-switching adapter
    shared-schema/   # Pydantic models, the source of truth
  ```
- Why those five and not three or seven: each one has a different *change reason* (ingest changes when YouTube APIs change; enrich changes when prompts change; api changes when routes change; llm-client changes when providers change; shared-schema changes when domain models change).
- **Intra-workspace deps**: how `packages/api/pyproject.toml` declares `dependencies = ["shared-schema", "llm-client"]` and `uv` resolves them as path deps automatically. Show the `[tool.uv.sources]` block.
- **Private vs publishable**: keep `shared-schema` and `llm-client` *publishable-ready* (proper version, README) so you can extract them to PyPI later if needed. Keep `ingest`/`enrich`/`api` as private workspace-only packages.
- **Avoiding circular deps**: `shared-schema` must not depend on any other workspace package. `llm-client` may depend on `shared-schema`. Everything else may depend on either. Enforce this with a one-line `grep` check in CI (covered in post 5).
- **Anti-patterns**: a single `core` or `common` package that grows without bounds; package boundaries that mirror team org charts instead of change boundaries.

## Post 3 — Shared schemas: Pydantic → JSON Schema → TypeScript

**Working title**: *"The killer monorepo argument: Pydantic models, codegen'd to TypeScript, consumed by React"*

**Slug**: `pydantic-to-typescript-codegen`

**Thesis**: The single best justification for a Python+React monorepo is that schema changes break both sides together. A 20-line codegen pipeline gives you full-coverage type safety from FastAPI's `response_model` all the way to your React `useQuery` call.

**Outline**:
- The problem without it: frontend types written by hand drift from backend models; runtime errors at the API boundary because no one updated `types.ts` after renaming a field.
- The pipeline: `shared-schema` exports Pydantic models → `model.model_json_schema()` produces JSON Schema → `json-schema-to-typescript` (npm) produces `.d.ts` → frontend imports.
- Show the full setup: `packages/shared-schema/src/shared_schema/__init__.py` exports models; `packages/shared-schema/scripts/emit_schema.py` walks them and writes `packages/web/src/generated/schema.json`; `packages/web/package.json` has `"codegen": "json2ts ..."` that runs on `pnpm install` and writes `packages/web/src/generated/types.ts`.
- **The break-together property**: rename a Pydantic field, regenerate, TypeScript compile fails in the React code. This is the whole point.
- Alternatives surveyed in one paragraph each: `pydantic-to-typescript` (Python tool, less control), OpenAPI codegen via `openapi-typescript` (works if you also publish an OpenAPI spec from FastAPI — good if you already do, overkill otherwise), hand-written types (don't).
- **Discriminated unions / tagged unions**: how Pydantic `Annotated[Union[...], Field(discriminator="kind")]` translates cleanly to a TS discriminated union via the JSON-Schema-to-TS path.
- **Gotchas**: dates (`datetime` → `string` in JSON, plan for it on the TS side); enums (`Literal` vs `Enum`, prefer `Literal`); `Optional` vs `default=None` (subtle JSON Schema differences).

## Post 4 — A Vite + React frontend living in the same repo

**Working title**: *"A Vite + React SPA inside a `uv` monorepo: pnpm-workspace, dev proxy, shared types"*

**Slug**: `vite-react-in-uv-monorepo`

**Thesis**: The trick to a polyglot monorepo is two workspace managers minding their own business: `uv` for the Python side, `pnpm-workspace` for the JS side, with a tiny Taskfile/`just` on top so you don't have to remember both.

**Outline**:
- Layout decision: `packages/web/` is both a `uv` workspace member (so it shows up in the repo's `uv` listing for completeness) *and* a `pnpm` workspace member. Show the `pnpm-workspace.yaml` and the `packages/web/package.json`.
- Vite config: `defineConfig` with `server.proxy` routing `/api` to `http://localhost:8000` (FastAPI). Show the 12-line `vite.config.ts`.
- Consuming codegen'd types from `shared-schema`: `import type { Guest, Episode } from "@/generated/types"` — the path alias resolves to `packages/web/src/generated/types.ts` produced by the codegen pipeline from post 3.
- React Query setup with typed responses: `useQuery<Guest[]>(["guests"], () => fetch("/api/guests").then(r => r.json()))` — the `<Guest[]>` annotation is your safety net.
- **Dev workflow**: two terminals (`uv run uvicorn api.main:app --reload` + `pnpm --filter web dev`), or one command via Taskfile (`task dev` runs both with prefixed output). Show both options.
- **Build pipeline**: `pnpm --filter web build` outputs to `packages/web/dist/`, served either by FastAPI itself (`StaticFiles` mount) for the teaching-artifact deployment or by any CDN.
- **Anti-patterns**: serving the React build through FastAPI's templating; hand-writing API types; treating the `web` package as a separate repo accessed via `cd ..`.

## Post 5 — Tasks, CI, and developer experience

**Working title**: *"Taming a polyglot monorepo: Taskfile, selective CI, and reproducible setup"*

**Slug**: `monorepo-tasks-and-ci`

**Thesis**: A monorepo's developer experience is mostly a Taskfile and a CI workflow. Both should answer: "What changed? Run only the things that depend on what changed."

**Outline**:
- **Taskfile** (`Taskfile.yml`, using go-task) as the cross-runtime command runner. Why not `make`: cross-platform, YAML, dependency graph, includes per-package task files. Show the root file with `setup`, `dev`, `test`, `lint`, `check` tasks; show a `packages/api/Taskfile.yml` that the root one includes.
- One-command setup for new contributors: `task setup` runs `uv sync --all-packages` + `pnpm install` + `task codegen`. New laptop to running tests in under 60 seconds.
- **Linting + formatting**: `ruff` and `mypy` installed as `uv tool` (per series 1, post 5) so every package shares the same versions; configured at repo root in `ruff.toml` and `mypy.ini`. Frontend: `biome` or `eslint` + `prettier`, scoped to `packages/web/`.
- **Selective CI**: GitHub Actions with `dorny/paths-filter` to detect which packages changed; run tests only for changed packages + their reverse deps. Show the workflow YAML — ~40 lines total.
- **The lockfile guarantee**: `uv.lock` + `pnpm-lock.yaml` both committed, both checked with `--frozen` / `--frozen-lockfile` in CI. If either drifts, CI fails fast.
- **Schema drift check**: a CI job that runs the codegen pipeline and `git diff --exit-code` on `packages/web/src/generated/` — fails if a backend schema change wasn't accompanied by a regenerated TS file.
- **Closer**: this is the foundation. The next series builds something real on top of it: ingesting podcast transcripts, extracting guests with LLMs, and surfacing them in a React UI. **Building an AI Podcast Index** is series 3.

## Drafting checklist (per fan-out session)

Same as the `uv-2026` brief — verify slug uniqueness, pick a date one week after the latest 2026 post, write the full frontmatter, embed a Codex image prompt as an HTML comment at the bottom, point `cover`/`thumb` at the eventual paths, run `pnpm check`, commit with message `Add python-monorepo-2026 series post N: <title>`.
