---
title: "uv in Docker and CI: lockfile-driven builds that actually cache"
date: "2026-02-23T10:00:00+05:45"
excerpt: "Two patterns — multi-stage Docker with uv sync --frozen and GitHub Actions with setup-uv — give you reproducible, fast Python builds with almost no boilerplate."
category: ["technical-notes"]
categories: ["technical-notes"]
directory: technical-notes
tags: [uv, python, tooling, docker, ci, github-actions]
cover: "/images/blog/uv-2026/uv-in-docker-and-ci/cover.png"
thumb: "/images/blog/uv-2026/uv-in-docker-and-ci/thumb.png"
series: uv-2026
seriesOrder: 6
use_featured_image: true
last_modified_at: "2026-02-23T10:00:00+05:45"
---

Local dev is where `uv` is most visible — `uv add`, `uv run`, no `activate`. But the place it quietly pays for itself is the boring path: a CI run that needs to install dependencies the same way every time, and a Docker build that doesn't reinvalidate the install layer because someone touched the README.

`uv` was designed for that path. The lockfile is the contract; everything else is plumbing.

## Why `uv.lock` matters in CI

`pip install -r requirements.txt` is *resolved at install time*. The version pins in your `requirements.txt` can be loose; even if they aren't, transitive dependencies aren't pinned at all unless you ran `pip-compile`. Two CI runs ten minutes apart can install slightly different trees, and you'll find out which one was broken sometime next Tuesday.

`uv.lock` is the opposite. It records the full resolved graph, hashes, source URLs, and the resolution context (Python version, markers). `uv sync --locked` *refuses to install* if the lockfile and `pyproject.toml` have drifted. Fails closed, with a useful error.

That single property — failing the build when the lockfile is stale — is worth more than any speedup.

## The Docker pattern

Multi-stage build. Stage one has `uv` and installs deps to `.venv/` using only `pyproject.toml` + `uv.lock`. Stage two is a small runtime image that copies the venv and the app code.

```dockerfile title="Dockerfile"
# syntax=docker/dockerfile:1.7

# --- builder ---------------------------------------------------------------
FROM ghcr.io/astral-sh/uv:0.5-python3.12-bookworm-slim AS builder

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never

WORKDIR /app

# Install deps first, in their own layer, so app code changes don't bust it.
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# Now copy the project and install it on top of the cached deps.
COPY . .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# --- runtime ---------------------------------------------------------------
FROM python:3.12-slim-bookworm AS runtime

WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app /app

ENV PATH="/app/.venv/bin:$PATH"

CMD ["python", "-m", "myapp"]
```

A few things earn their keep here:

- **`COPY pyproject.toml uv.lock ./` is its own layer.** That's the cache anchor. If neither file changed, the entire `uv sync` step is reused. Bumping a dep invalidates it; editing `src/myapp/routes.py` does not.
- **Two `uv sync` calls.** The first installs *only the dependencies*, before the project source is in the image. The second installs the project itself on top. Same cache-shape trick `cargo` and `poetry` users will recognize.
- **`UV_LINK_MODE=copy`.** Inside Docker the cache mount and the project live on different layers, and `uv`'s default of hardlinking from the cache will warn and fall back. Setting `copy` upfront silences the warning and is the right default for container builds.
- **`UV_COMPILE_BYTECODE=1`.** Precompiles `.pyc` at install time. Cold-start wins, especially in serverless.
- **`UV_PYTHON_DOWNLOADS=never`.** The builder image already has Python; don't let `uv` decide to fetch its own.
- **`--no-dev`.** Dev dependencies don't belong in the runtime venv.

### Cache mounts keep the hardlink cache hot

```dockerfile
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev
```

The `--mount=type=cache` directive persists `/root/.cache/uv` across builds on the same builder. The global hardlink cache stays warm, so even when the dep layer *is* invalidated (you bumped one package), the rebuild downloads only what changed. Astral's docs cover this in the [Docker integration guide](https://docs.astral.sh/uv/guides/integration/docker/).

### `uv sync --frozen` vs `uv sync --locked`

Both refuse to update the lockfile. They differ in what they check against `pyproject.toml`:

- **`--frozen`**: install exactly what's in `uv.lock`. Don't even *look* at `pyproject.toml` for resolution. This is what you want in Docker — the lockfile is the source of truth and the build should be the fastest, most deterministic path.
- **`--locked`**: install from `uv.lock`, but verify it's still consistent with `pyproject.toml`. Fails the build if they've drifted. This is what you want in a CI verification job, where catching a stale lockfile *is* the point.

Rule of thumb: `--frozen` in Docker, `--locked` in CI. A "lockfile check" job that runs `uv sync --locked` and nothing else is the cheapest insurance policy you can buy against drift PRs.

## GitHub Actions

The official action is `astral-sh/setup-uv`. It installs `uv`, sets up the global cache, and exposes `uv` on `PATH`. A complete test workflow fits in fifteen lines.

```yaml title=".github/workflows/test.yml"
name: test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v6
        with:
          enable-cache: true
      - run: uv sync --locked
      - run: uv run pytest
```

That's it. No `setup-python`, no manual `pip install -r`, no venv activation. `enable-cache: true` makes the action persist `~/.cache/uv` between runs keyed on the lockfile hash — so a green build typically restores deps from cache and only re-downloads when `uv.lock` changes.

### Python version in CI

Two options:

1. **`.python-version` in the repo + `uv python install` in the workflow.** The version is co-located with the code, the same file your local `uv run` uses, no duplication.
2. **`python-version` input on the action.** Convenient for a matrix.

```yaml
strategy:
  matrix:
    python-version: ["3.11", "3.12", "3.13"]
steps:
  - uses: actions/checkout@v4
  - uses: astral-sh/setup-uv@v6
    with:
      python-version: ${{ matrix.python-version }}
      enable-cache: true
  - run: uv sync --locked
  - run: uv run pytest
```

For a single-version repo I prefer `.python-version` — one less place for the version to drift. For matrix testing the action input wins.

## `uv export` for legacy CI

Sometimes the CI is older than the project: a Jenkins pipeline that runs `pip install -r requirements.txt`, a deploy step that uploads a `requirements.txt` to a managed runtime, a partner ops team that audits `requirements.txt` and not much else. You don't have to change any of that.

Generate `requirements.txt` from `uv.lock` as a build artifact:

```sh
uv export --format requirements-txt --no-dev --no-hashes > requirements.txt
```

Run that as a step in your build, upload it as an artifact, or commit it on a CI bot branch. The lockfile stays the source of truth; `requirements.txt` becomes a derived export. This is the hybrid pattern from Post 4 of this series, applied to CI instead of to your local workflow.

If you want hashes (for pip's `--require-hashes` mode), drop `--no-hashes`. If you want dev deps, add `--group dev` instead of `--no-dev`.

## Gotchas

A short list of things that bit me or that I see bite other people.

- **The lockfile must be in the Docker context.** If your `.dockerignore` is aggressive (`*` then `!src/`), `uv.lock` and `pyproject.toml` won't reach the builder and `--frozen` will fail with a confusing message. Whitelist them explicitly.
- **`.venv/` belongs in `.dockerignore`.** Otherwise you'll copy your host's venv into the image, then immediately overwrite it with `uv sync` — wasted bandwidth and confusing layer diffs.
- **`uv sync` is not `uv pip install -e .`.** In a dev container where you want the project installed in editable mode against a mounted source directory, `uv sync` is what you want — `--editable` is implied for the workspace project. Reaching for `uv pip install -e .` here is a habit from the pip era; you don't need it.
- **The `uv` image tag matters.** `ghcr.io/astral-sh/uv:latest` is fine for experiments; pin to a specific `0.5-pythonX.Y-<distro>-slim` tag in production so your base image doesn't shift under you.
- **Don't run `uv lock` in CI by accident.** A workflow that re-locks on every run defeats the entire point. Use `--locked` (verify) or `--frozen` (install), never bare `uv sync`.

## Series wrap

Six posts in, the throughline: `uv` isn't a faster `pip`. It's a coordination layer that finally lets `pyproject.toml`, the lockfile, the venv, and the Python version *agree* with each other — locally, in CI, and in Docker. The speedup is real, but the reason to adopt is reproducibility you can defend in a postmortem.

Next series: **Python Monorepos in 2026** — `uv workspaces`, package boundaries, shared schemas across a Python backend and a TypeScript frontend, and CI that doesn't rebuild the world on every PR. The natural sequel for readers ready to scale `uv` past a single package.

<!--
# Image prompt

Codex prompt for cover.png (21:9) and thumb.png (16:9), saved to
public/images/blog/uv-2026/uv-in-docker-and-ci/cover.png and thumb.png.

Editorial illustration, no embedded text, no logos, no watermarks. A stack of
translucent shipping containers stacked in two distinct strata, the upper
stratum smaller and lit warmer than the lower — a visual metaphor for a
multi-stage Docker build. Faint, abstract conveyor lines run beneath the
containers, suggesting a CI pipeline. Cool blue and slate background with a
single warm accent (amber or coral) highlighting the topmost container.
Geometric, slightly isometric, calm composition with generous negative space.
Matte finish, restrained palette, no neon. Aspect ratios: 21:9 hero crop and
16:9 card crop of the same composition.
-->
