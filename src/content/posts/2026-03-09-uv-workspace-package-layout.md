---
title: "Designing a uv workspace: package boundaries that survive contact with reality"
date: "2026-03-09T10:00:00+05:45"
excerpt: "The hardest part of a Python monorepo isn't the tooling — it's deciding where one package ends and another begins. Two rules — change boundaries and interface boundaries — and a worked example."
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
tags: [python, monorepo, uv, fastapi, architecture, packaging]
cover: "/images/blog/python-monorepo-2026/uv-workspace-package-layout/cover.png"
thumb: "/images/blog/python-monorepo-2026/uv-workspace-package-layout/thumb.png"
series: python-monorepo-2026
seriesOrder: 2
use_featured_image: true
last_modified_at: "2026-03-09T10:00:00+05:45"
---

> Builds on the [`uv-2026`](/technical-notes/why-uv-exists/) series — if you've never used `uv` workspaces, start there.

[Post 1](/technical-notes/python-monorepo-with-uv-workspaces/) made the case for `uv workspaces` as the substrate. This post is about the layer on top: where the package lines go.

It is the part that no tool can solve for you. `uv` will resolve any set of packages you give it. The art is which packages you give it, and the cost of getting it wrong is paid in a slow drift towards a `core/` directory that nobody dares to touch.

Two rules carry most of the weight.

## Rule 1: change boundaries

> Things that change together should live in the same package. Things that change for different reasons should not.

This is just the Single Responsibility Principle wearing a different hat — Parnas was writing about it in 1972, and it scales perfectly well to package boundaries. The question to ask is not "what does this code *do*?" but "what makes this code *change*?"

A FastAPI route file changes when the HTTP contract changes. A Pydantic model changes when the domain shape changes. A YouTube-ingest module changes when YouTube's API changes. Those are three different reasons, owned by three different upstreams, on three different cadences. Bundling them into one `app/` package guarantees a thrash: every change to any of them re-tests, re-lints, and re-deploys the others for no reason.

The corollary is just as important: when two modules genuinely change in lockstep, *don't* split them. A premature split forces you to invent a public interface between them — and you'll get that interface wrong, because you're inventing it without a second consumer.

## Rule 2: interface boundaries

> When N>1 packages consume the same code, that code becomes its own package.

This is the moment to extract, not before. A utility used by exactly one package is a utility *in* that package. A utility used by three packages is a shared package — because now its API has consequences, and you want those consequences enforced by the import graph rather than by convention.

Pydantic models are almost always the first thing to cross this line. The API serves them, the ingest pipeline emits them, the LLM client validates against them. The moment a second package needs `Guest` or `Episode`, those models belong in `shared-schema`.

## The reference layout

The [`ai-podcast-index`](https://github.com/poudelprakash/ai-podcast-index) repo — the build-along the next series tackles in earnest — settles on five packages:

```
packages/
  ingest/          # YouTube + Whisper transcription
  enrich/          # LLM extraction over transcripts
  api/             # FastAPI HTTP surface
  llm-client/      # provider-switching adapter
  shared-schema/   # Pydantic models, the source of truth
```

Five, not three, and not seven. The instinct to fold `enrich/` into `ingest/` ("they're both pipeline stages") or to split `api/` into `api-routes/` + `api-deps/` ("separation of concerns!") both fail Rule 1.

Walk through it by change reason:

- **`ingest`** changes when YouTube's `pytube`/`yt-dlp` breaks, when Whisper bumps, when a new audio source is added. It owns the "raw bytes in, transcript out" boundary.
- **`enrich`** changes when the LLM prompts change, when a new extraction (sentiment, named-entities, links) is added. It owns "transcript in, structured records out".
- **`api`** changes when a route is added, when auth changes, when a response shape changes. It owns the HTTP surface.
- **`llm-client`** changes when a provider is added (Anthropic, OpenAI, a local Ollama), when retry policy changes, when streaming semantics change. It owns "prompt in, completion out", and nothing else.
- **`shared-schema`** changes when the *domain* changes — what a `Guest` is, what an `Episode` is. The most stable package by design, and the only one allowed to be imported by everyone else.

Each one fails Rule 1 if folded into a neighbour, and none of them has a second internal consumer waiting to justify a further split.

## Intra-workspace dependencies

In a `uv` workspace, intra-package deps are declared the same way external ones are — by name — and `uv` resolves them as path deps automatically when they match a workspace member.

```toml title="packages/api/pyproject.toml"
[project]
name = "api"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
  "fastapi>=0.115",
  "uvicorn[standard]>=0.30",
  "shared-schema",
  "llm-client",
]

[tool.uv.sources]
shared-schema = { workspace = true }
llm-client = { workspace = true }
```

The `[tool.uv.sources]` block is the part people miss. Without it, `uv` will try to resolve `shared-schema` from PyPI and fail. With it, `uv` knows to look in the workspace, and `uv sync` installs the live source as editable. Edit `packages/shared-schema/src/shared_schema/models.py`, and the next `uv run uvicorn api.main:app` picks up the change. No reinstall, no `pip install -e ..`.

The root `pyproject.toml` declares the workspace itself:

```toml title="pyproject.toml"
[tool.uv.workspace]
members = ["packages/*"]
```

That single glob is the whole workspace declaration. Add a sixth package by creating `packages/audit/` with its own `pyproject.toml`, and it joins the workspace on the next `uv sync` — no registration step.

## Private vs publishable

Not every package in a monorepo wants to be publishable, and the distinction matters because it dictates how strict you are with the package's public surface.

Treat `shared-schema` and `llm-client` as **publishable-ready** from day one:

- Real version numbers in `pyproject.toml`, bumped deliberately.
- A `README.md` at the package root that explains the package as if a stranger from PyPI found it.
- No imports from sibling workspace packages — both of these are *consumed by* others, not the other way around.
- Public API exposed through `__init__.py`. The pattern: thin re-export of what you mean to be public, nothing else.

Treat `ingest`, `enrich`, and `api` as **private workspace-only** packages:

- `version = "0.0.0"` is fine — they're never published.
- A two-line `README.md` is fine — anyone reading them is already in the repo.
- They may import from `shared-schema` and `llm-client` freely.

The reason to bother with the distinction is optionality. If `llm-client` turns out to be useful outside this project — and provider-switching adapters often do — extracting it to PyPI is a `uv publish` away. Versioned, README'd, no leaking workspace imports. If you'd let private packages import from it, that extraction would mean a refactor first.

## The dependency direction rule

The same logic as private/publishable, written as a graph:

```
shared-schema  ←  llm-client  ←  ingest, enrich, api
       ↑___________________________|
```

- `shared-schema` depends on no other workspace package. Ever.
- `llm-client` may depend on `shared-schema`. Only.
- Everything else may depend on either of them, and on nothing else inside the workspace.

This rules out the two classes of mistake that wreck monorepos:

1. **Circular deps.** `shared-schema` importing from `api` to reuse a helper is the start of a cycle that takes weeks to undo.
2. **Lateral deps.** `enrich` importing from `ingest` ("just this one parser") couples two packages that were supposed to change independently. If they need to share code, that code is a third package.

The cheapest enforcement is a CI check — a one-line `grep` that fails if forbidden import patterns appear. Series post 5 wires it into the workflow; the point for now is that the rule is mechanically checkable, so write it down.

## Avoid the `core` package

The most common monorepo failure mode is a single `core/` or `common/` package that grows without bounds. It starts with a date helper. Six months later it contains the database session, the Pydantic models, the LLM client, three half-finished retry decorators, and a settings loader.

`core/` fails both rules at once. It has no single change reason (Rule 1), and it bundles together code with different consumer-counts (Rule 2). When everything depends on `core/`, a one-line fix to a date helper invalidates the cache for every package in the repo.

Resist it by giving the right things their own names. `shared-schema` is not `core.models`. `llm-client` is not `core.llm`. The names are longer; the dependency graph is honest.

## Don't mirror the org chart

The other common failure is splitting packages along team lines instead of change lines. "The platform team owns `core`, the API team owns `api`, the ML team owns `ml`." If the platform team's `core` happens to change for five different reasons, you've packaged Conway's Law and shipped it to your dependency graph.

Org-chart packages also produce the worst kind of cross-package PR: a single coherent change that has to be split across three packages because the boundaries are political rather than technical. You'll see merge-order tickets. You'll see "blocked on platform" comments. Don't.

When the change-boundary and the team-boundary genuinely align — and they sometimes do — you'll get the same layout for free. When they don't, follow the change boundary.

## A rough decision flow

When a new module shows up and you're deciding where it goes:

1. **Does it have its own upstream that changes independently?** (A new audio source, a new LLM provider, a new third-party API.) → New package.
2. **Is it consumed by more than one existing package?** → New package, or fold into `shared-schema`/`llm-client` if it fits.
3. **Is it consumed by exactly one existing package?** → Live in that package. If a second consumer shows up, *then* extract.
4. **Is it a one-off utility?** → Live in the package that uses it. The "DRY across packages" instinct is wrong here — duplication is cheaper than a premature `core/`.

Five packages, three rules, two ways to be wrong. Next post: the payoff for `shared-schema` carrying the Pydantic models — codegen them to TypeScript, consume them in React, and let the compiler catch every schema drift before it ships.

Full source: <https://github.com/poudelprakash/ai-podcast-index> — tags `series2-post2` mark the state of the repo at this post.

<!--
# Image prompt

Codex prompt for cover.png (21:9) and thumb.png (16:9), saved to
public/images/blog/python-monorepo-2026/uv-workspace-package-layout/cover.png
and thumb.png.

Editorial illustration, no embedded text, no logos, no watermarks. Five
distinct geometric volumes — translucent slabs in graduated sizes — arranged
on an invisible grid, each clearly separated by negative space. The largest
slab sits at the base (a foundation), with smaller slabs above resting on it,
suggesting a layered dependency graph without ever drawing arrows. Cool slate
and deep blue palette with a single warm coral accent on one of the upper
slabs. Soft directional light from upper left, generous negative space, matte
finish. Geometric and slightly isometric, calm composition. Aspect ratios:
21:9 hero crop and 16:9 card crop of the same composition.
-->
