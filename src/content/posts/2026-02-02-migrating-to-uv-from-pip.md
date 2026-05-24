---
title: "Migrating to uv from pip + venv + requirements.txt: a pragmatic path"
date: "2026-02-02T10:00:00+05:45"
excerpt: "You don't have to commit to a full migration to benefit from uv. The pip compatibility layer is a zero-effort speedup. Move source-of-truth to pyproject.toml only when it earns its keep."
category: technical-notes
categories:
  - technical-notes
directory: technical-notes
tags:
  - uv
  - python
  - tooling
  - pip
  - migration
cover: "/images/blog/uv-2026/migrating-to-uv-from-pip/cover.png"
thumb: "/images/blog/uv-2026/migrating-to-uv-from-pip/thumb.png"
use_featured_image: true
series: uv-2026
seriesOrder: 4
last_modified_at: "2026-02-02T10:00:00+05:45"
---

Most migration guides assume you want to swap your build system on Monday morning. This one doesn't. A working `pip + venv + requirements.txt` project is not broken; it's just slow and a little brittle at the edges. `uv` lets you trade off those problems one at a time.

The order matters. Day one buys you speed for free. Week one buys you a real lockfile. Month one — if and only if you'd actually use them — buys you `pyproject.toml`-native workflows.

## Day one: the free speedup

If you change nothing else, change this:

```diff
- python -m venv .venv
- source .venv/bin/activate
- pip install -r requirements.txt
+ uv venv
+ uv pip install -r requirements.txt
```

Same `requirements.txt`. Same packages. Same resolved versions. 10–100× faster, depending on cache state. CI gets faster on the next push; local installs feel instant.

`uv pip` is a drop-in for the `pip` CLI surface that most projects actually use — `install`, `uninstall`, `freeze`, `list`, `show`, `compile`. It reads the same flags, talks to the same PyPI, writes wheels into the same `.venv/`. Nothing downstream of `pip install` notices the swap.

*From pip:* yes, you still get a `.venv/` directory. No, you don't need to `source` it — `uv pip install` finds it via `VIRTUAL_ENV` or the nearest `.venv/`. If you'd rather keep activating, that still works.

*From Node:* this is the `npm` → `pnpm install` story. Same `package.json`, faster install, content-addressable cache. You're not converting the project; you're swapping the installer.

## When to keep `requirements.txt`

There are honest reasons to leave `requirements.txt` in place, and pretending otherwise gets migration plans rejected on the third slide:

- **Docker layer caching.** `COPY requirements.txt .` followed by `pip install -r requirements.txt` is a pattern every reviewer on your team already understands. The cache key is one file. Multi-stage uv-native builds work great (Post 6 covers them), but they're a larger change.
- **Legacy CI scripts.** Anything that greps `requirements.txt` for security scanning, license auditing, or vendor SBOM generation will keep working if the file is still there.
- **Ops handoffs.** Teams that deploy your code without touching it shouldn't have to learn a new tool to read your deps.
- **Public-facing reproducibility.** `pip install -r requirements.txt` is the universal "I can run this" contract for tutorials, blog posts, and Kaggle notebooks.

None of these are bad reasons. None of them are reasons to keep `pip` as the *installer*, though.

## The hybrid pattern

The middle ground that scales: `pyproject.toml` becomes the source of truth, and `requirements.txt` becomes an exported artifact.

```sh
uv export --format requirements-txt --no-hashes > requirements.txt
```

Drop hashes if your downstream tools choke on them; keep them (`--no-hashes` off) for hash-verified installs in production. Commit the generated file or regenerate it in CI — both are valid.

```yaml title=".github/workflows/export.yml" {6-8}
- uses: astral-sh/setup-uv@v6
- run: uv sync --locked
- run: uv export --format requirements-txt --no-hashes > requirements.txt
- uses: actions/upload-artifact@v4
  with:
    name: requirements
    path: requirements.txt
```

Now your Dockerfile, your security scanner, and your ops team all keep the file they expect. Your developers stop hand-editing it.

## Full migration: when `pyproject.toml` is worth it

You're ready to make `pyproject.toml` the source of truth when at least one of these is true:

- You have **multiple dependency groups** — dev, test, docs, lint — currently spread across `requirements-dev.txt`, `requirements-test.txt`, etc.
- You want **Python version pinning** baked into the project (`.python-version` + `[project.requires-python]`).
- You ship **console scripts** and want `uv run myapp` to Just Work.
- You want **deterministic builds**: `uv.lock` records exact resolved versions, hashes, and source URLs across every supported platform.

Converting a typical `requirements.txt` + `requirements-dev.txt` setup:

```diff title="pyproject.toml"
+ [project]
+ name = "myapp"
+ version = "0.1.0"
+ requires-python = ">=3.12"
+ dependencies = [
+   "fastapi>=0.115",
+   "httpx>=0.27",
+   "pydantic>=2.9",
+ ]
+
+ [dependency-groups]
+ dev = [
+   "pytest>=8.3",
+   "ruff>=0.7",
+   "mypy>=1.13",
+ ]
```

Then:

```sh
uv lock              # writes uv.lock
uv sync              # installs project + dev group
uv sync --no-dev     # production install, no dev tools
```

Delete `requirements*.txt` once the team is comfortable — or keep them as exported artifacts via the hybrid pattern above.

For **new projects**, skip the migration step entirely and start at `uv init` — covered in [Starting a new Python project in 2026 with uv](/blog/new-python-project-2026/).

## The pip-tools shop

If your project uses `pip-tools` — a `requirements.in` of top-level deps compiled into a pinned `requirements.txt` — uv has a drop-in:

```diff
- pip-compile requirements.in -o requirements.txt
+ uv pip compile requirements.in -o requirements.txt
```

Same input format. Same output format. Hashes, extras, constraints, custom indexes — all supported. This is the lowest-friction migration path of any of them: you keep your workflow, your file layout, your CI, and you get a faster compile.

When your team is ready, graduate from `requirements.in` to `[project.dependencies]` in `pyproject.toml` and from `uv pip compile` to `uv lock`. Until then, you've already won most of the speedup.

## Gotchas

- **Editable installs.** `uv pip install -e .` works inside a `uv venv` exactly like it does with pip. Inside a uv-managed project, prefer `uv sync` — it handles the editable install of the current package automatically.
- **Private indexes.** Move `--extra-index-url` into `pyproject.toml`:
  ```toml title="pyproject.toml"
  [[tool.uv.index]]
  name = "internal"
  url = "https://pypi.internal.example.com/simple/"
  explicit = true
  ```
  Set credentials via `UV_INDEX_INTERNAL_USERNAME` / `UV_INDEX_INTERNAL_PASSWORD` env vars in CI. `UV_INDEX_URL` is also honored if you'd rather configure entirely via env.
- **`--system` vs project mode.** `uv pip install --system` installs into the active Python without a venv — the right choice in Docker base images where you don't want `.venv/` indirection. Outside Docker, you almost never want this; uv will create a `.venv/` for you.
- **`uv pip` is not `uv add`.** `uv pip install fastapi` installs into the current venv but does **not** touch `pyproject.toml` or `uv.lock`. That's a feature during migration — and a footgun once you've adopted `pyproject.toml`. Switch to `uv add fastapi` the moment you commit a `pyproject.toml`.

*From Node:* if you've done the `npm` → `pnpm` move, you know this dance. Lockfile semantics tighten, the installer gets faster, and the legacy `package-lock.json` (or here, `requirements.txt`) sticks around as long as something downstream still reads it.

---

Next in series: ***`uv tool` and single-file scripts: pipx and shebang-Python, replaced.***

<!--
# Image prompt

cover (21:9): Editorial illustration of a winding path through layered geological strata, each stratum labeled implicitly by texture only — coarse sediment (pip), fine silt (venv), smooth shale (requirements.txt) — converging into a single polished river channel cut through them. Muted desert palette, warm rust and sand tones with a single cool teal accent in the river. No text, no logos, no watermarks. Soft directional light from upper left, painterly digital illustration, editorial magazine quality. 21:9 aspect ratio.

thumb (16:9): Same scene and palette, recomposed for 16:9 with the river channel centered and the strata occupying upper and lower thirds.
-->
