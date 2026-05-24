---
draft: false
title: "Why a Python Monorepo: What uv Workspaces Actually Gives You"
date: "2026-03-02T10:00:00+05:45"
category: ["technical-notes"]
categories:
  - technical-notes
directory: technical-notes
excerpt: "Most Python monorepo pain in 2024 came from gluing pip-tools, tox, and path hacks together. uv workspaces makes the seam between packages a first-class concept — one lockfile, one resolver, one venv. That's what makes the monorepo worth doing."
cover: "/images/blog/python-monorepo-2026/python-monorepo-with-uv-workspaces/cover.png"
thumb: "/images/blog/python-monorepo-2026/python-monorepo-with-uv-workspaces/thumb.png"
last_modified_at: "2026-03-02T10:00:00+05:45"
use_featured_image: true
series: python-monorepo-2026
seriesOrder: 1
tags:
  - python
  - monorepo
  - uv
  - workspaces
  - packaging
  - fastapi
---

> Builds on the [`uv-2026`](/technical-notes/why-uv-exists/) series. If you've never used `uv`, start there — this series assumes you know what `uv sync` and `uv.lock` are.

In 2024, the phrase "Python monorepo" was usually a confession.

It meant someone had a `services/` directory with five FastAPI apps in it, a `libs/` directory with a `common/` package nobody owned, a top-level `requirements.txt` that nobody trusted, and a `tox.ini` that did the actual work of pretending the whole thing fit together. The CI matrix was a 60-line YAML file with `pip install -e ../common` scattered through it. Half the team checked out the repo with `pip install -e .[dev]` and the other half with `pip-compile` and `pip-sync`. The Python version was set in a `.python-version` file that pyenv read, except in Docker, where it was set in a base image, except in CI, where it was set in a `setup-python` action.

If you wanted to share a Pydantic model between `services/api/` and `services/worker/`, the question "what is the source of truth" had four candidate answers, all of them load-bearing.

It's 2026. Same project, on `uv`:

```sh
uv sync --all-packages
```

Done. Every package's deps resolved together. One lockfile. One venv shared across all of them. Intra-repo imports work because `uv` knows about path dependencies. The `common` package the API imports is the same `common` package the worker imports — not a stale `pip install -e ../common` from someone's shell three weeks ago.

The interesting question isn't "uv is faster." The interesting question is what changes when the seams between your packages become a first-class concept instead of a coordination problem.

---

## When the monorepo is the right call

Monorepos aren't a moral position. They're a tradeoff that pays off when a few specific conditions line up:

- **Multiple Python services share types or utilities.** An API and a worker that both consume a `Job` model. A CLI and a service that both call the same provider client. The cost of keeping those models in sync across separate repos — version bumps, coordinated releases, a published-package round trip for every rename — is real and recurring.
- **A shared client library evolves with the service.** You don't want to publish `acme-client==0.4.1` to a private index every time you tweak a route. You want to change the route and the client in one diff.
- **Coordinated releases.** If shipping a feature requires the API, the worker, and the CLI to move together, having them in one repo means one PR, one CI run, one tag.
- **A frontend that needs the same schemas as the backend.** This is the big one, and it gets its own post (post 3). When your React app's types are generated from the same Pydantic models the FastAPI app validates with, schema drift becomes a compile error instead of a 2 AM page.

When the monorepo is *not* the right call:

- **Two unrelated apps.** If `service-a` and `service-b` share nothing except a company name, putting them in one repo just couples their CI runs without any upside.
- **Teams with separate release cadences.** If team A ships daily and team B ships quarterly, a monorepo will force one of those rhythms onto the other. Usually not in a good way.
- **Vendor handoff.** If one of the packages will be open-sourced or sold to a third party, plan for that boundary now. Extracting from a monorepo is doable; it's just work you'd rather not do at the wrong moment.

The rest of this series assumes you're on the right side of that decision. The reference case throughout is a small backend with three services, two shared libraries, and a React frontend that consumes the same schemas the backend validates with. We'll keep coming back to it.

---

## What `uv workspaces` actually is

A `uv` workspace is a single repository that contains multiple Python packages, all resolved together against a single lockfile, all sharing a single virtual environment.

The shape is mechanical. A workspace has:

- A **root** `pyproject.toml` with a `[tool.uv.workspace]` table that declares which directories are workspace members.
- One or more **member packages**, each with its own `pyproject.toml` and its own `[project]` block declaring its name and dependencies.
- A single **`uv.lock`** at the root that resolves every member's dependencies — plus transitive deps — into one consistent dependency graph.
- A single **`.venv/`** at the root that has every member installed in editable mode.

Minimal example. Repo layout:

```
my-monorepo/
├── pyproject.toml
├── uv.lock
└── packages/
    ├── api/
    │   ├── pyproject.toml
    │   └── src/api/__init__.py
    └── shared-schema/
        ├── pyproject.toml
        └── src/shared_schema/__init__.py
```

Root `pyproject.toml`:

```toml title="pyproject.toml"
[project]
name = "my-monorepo"
version = "0"
requires-python = ">=3.12"

[tool.uv.workspace]
members = ["packages/*"]
```

`packages/shared-schema/pyproject.toml`:

```toml title="packages/shared-schema/pyproject.toml"
[project]
name = "shared-schema"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = ["pydantic>=2.7"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

`packages/api/pyproject.toml`:

```toml title="packages/api/pyproject.toml"
[project]
name = "api"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
  "fastapi>=0.110",
  "shared-schema",
]

[tool.uv.sources]
shared-schema = { workspace = true }

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

The two things to notice. First, `api` lists `shared-schema` as a regular dependency. Second, `[tool.uv.sources]` tells `uv` to resolve that dependency from inside the workspace — not from PyPI. There is no `pip install -e ../shared-schema` step. There is no publish-to-private-index step. `shared-schema` is on the filesystem and `uv` knows where.

Run `uv sync --all-packages` at the root once and:

- `uv.lock` gets written, resolving `fastapi`, `pydantic`, and everything transitively required, against the constraints of both packages.
- `.venv/` gets created at the root.
- `fastapi` and `pydantic` are installed from the cache.
- `shared-schema` and `api` are both installed in editable mode, pointing at their source on disk.
- `python -c "from api import ..."` and `python -c "from shared_schema import ..."` both work.

That's the entire workspace concept. Two TOML tables and a `sync` command.

The root `[project]` block is optional. You can skip it if the root isn't itself a package and just keep the `[tool.uv.workspace]` table — useful when the repo is purely a container for member packages. I usually keep a dummy root `[project]` because some tooling (notably IDE Python interpreters) prefers it.

---

## What `uv workspaces` actually gives you

Compared to "just put packages in a folder and `pip install -e` them in a script":

**One lockfile for the whole repo.** `uv.lock` resolves all member packages together. If `api` wants `httpx>=0.27` and `worker` wants `httpx<0.26`, `uv` flags the conflict at resolve time instead of letting it become a "works on my machine" later. With separate venvs per package, that conflict goes undetected until one of them ships a bug.

**Intra-workspace deps resolved by path.** No PyPI round trip. `shared-schema` doesn't need a version bump, doesn't need to be published, doesn't need to be `pip install -e`'d. You change a Pydantic model in `shared-schema` and `api` sees the change on the next run — because both packages are installed editably from the same `.venv`.

**One `uv sync` sets up every package at once.** New contributor clones the repo, runs `uv sync --all-packages`, has a working venv with every member installed and every dependency resolved. No "did you remember to `pip install -e libs/common` first?" No bootstrap script. The bootstrap is the command.

**Dev dependencies scoped per-package.** Each member's `pyproject.toml` can declare its own `[dependency-groups.dev]` — `pytest` for the API, `pytest-asyncio` for the worker, `pytest-httpx` for the client. They all install into the same root `.venv`, but they're declared where they belong. `uv sync --all-packages --group dev` pulls them all in.

**Shared cache.** `uv`'s global hardlink cache works at the workspace level too. If three packages depend on `pydantic`, you get one copy on disk, hardlinked into the venv. Multiply across a real monorepo and the disk-savings are not the point — the install speed is.

The first four are coordination wins. The fifth is just `uv` being `uv`. The first four are what make a Python monorepo worth doing.

---

## What still costs you

`uv workspaces` is not free. It buys you the coordination, but a few costs survive the transition:

**CI matrices get harder, not easier.** If you don't want to run every test in every package on every commit, you need a "what changed" filter. `dorny/paths-filter` in GitHub Actions plus a job-per-package matrix. Doable, but it's not built in. Covered in post 5.

**Per-package version pinning.** Each member has its own `version` field. If you publish any of them — even internally — you need a versioning policy. Sometimes it's "lockstep all packages at the repo's tag," sometimes it's per-package independent versions. Both work. Pick one early.

**The shared-venv mental shift.** You will, at some point, try to `pip install` something into one package's "venv" forgetting that there isn't one — there's just the root `.venv` shared across everything. The right move is `uv add --package api httpx`, which adds the dep to `api/pyproject.toml`, updates the lockfile, and installs into the shared venv. Old muscle memory takes a few weeks to retrain.

**Tooling that assumes one package per repo.** Mostly fine in 2026 — `ruff`, `mypy`, `pytest` all handle workspaces well. But occasionally you hit a Sphinx config, a coverage tool, or an internal script that expected a single `setup.py` at the root. Worth budgeting an afternoon for those when you migrate.

None of these are dealbreakers. They're the cost of the structure. The structure is the point.

---

## Sidebar: Poetry monorepos vs `uv` monorepos

If you already have a Poetry-based monorepo, the migration story is short. Poetry's "path dependencies" feature is the same shape as `uv`'s workspace deps — one package lists another as a dependency with `{ path = "../shared", develop = true }`. The semantics are close. What `uv` adds is a real workspace concept at the repo root (Poetry's "monorepo" was always a collection of independent packages that happened to live in the same folder), a single lockfile across all members (Poetry gives each package its own `poetry.lock`), and a 10–100× faster resolver. If you've felt the resolver pain, you already know whether the migration is worth your week.

---

## Where this series goes

This was the why. The rest is concrete.

- **Post 2** — designing package boundaries. *Change boundaries* vs *interface boundaries*, and the five packages our reference repo settled on. How `[tool.uv.sources]` declares intra-workspace deps and how to keep `shared-schema` clean enough to extract to PyPI later if needed.
- **Post 3** — the killer feature: Pydantic models codegen'd to TypeScript, consumed by a React frontend in the same repo. Schema change in Python? TypeScript compile fails. That's the win.
- **Post 4** — adding a Vite + React frontend that shares the venv repo but lives under `pnpm-workspace`. Dev proxy, typed `fetch`, two workspace managers minding their own business.
- **Post 5** — Taskfile, selective CI, schema-drift checks, and what "one-command setup" actually looks like for a new contributor.

Up next: *Designing a uv workspace: package boundaries that survive contact with reality.*

<!--
# Image prompt

Cover (21:9, public/images/blog/python-monorepo-2026/python-monorepo-with-uv-workspaces/cover.png):
Editorial illustration, no embedded text, no logos, no watermarks. A loose grid of five small geometric blocks (cubes, rounded rectangles, hexagons) arranged on a single shared platform plinth, drawn in flat geometric style. The plinth is a thin slab spanning the full width, suggesting a shared foundation; the blocks sit on top with subtle drop shadows. Thin lines connect a few of the blocks to each other, hinting at internal dependencies, while one block sits slightly apart and connects to multiple others (the shared library). Muted editorial palette: deep navy background, off-white blocks, a single warm accent (terracotta or amber) on the connector lines and the shared block. Soft directional light from upper-left. Generous negative space. Aspect ratio 21:9. No type, no glyphs, no UI chrome, no Python or uv logos.

Thumb (16:9, public/images/blog/python-monorepo-2026/python-monorepo-with-uv-workspaces/thumb.png):
Same scene re-cropped tighter to 16:9 so three of the five blocks and the shared plinth are the focal point, with the connector lines clearly visible between the central shared block and its neighbors. Same palette and rendering style as the cover. No text, no logos, no watermarks.
-->
