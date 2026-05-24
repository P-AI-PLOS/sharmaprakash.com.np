---
title: "Starting a new Python project in 2026 with uv"
date: "2026-01-26T10:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "Six commands, five files, zero `source activate`. A walkthrough from `uv init` to a project that runs tests, ships a CLI, and is ready to dockerize."
cover: "/images/blog/uv-2026/new-python-project-2026/cover.png"
thumb: "/images/blog/uv-2026/new-python-project-2026/thumb.png"
last_modified_at: "2026-01-26T10:00:00+05:45"
use_featured_image: true
tags: ["uv", "python", "tooling", "pyproject", "ruff"]
series: uv-2026
seriesOrder: 3
---

[Post 2](/blog/uv-vs-the-old-stack/) made the case for `uv` over the old stack. This is the walkthrough: a new Python project from `uv init` to "ready to dockerize", in six commands and five files. No `source .venv/bin/activate`, no `pip install -r requirements.txt`, no `python -m venv` dance.

If you have an existing `pip + venv + requirements.txt` project you'd rather migrate than rewrite, skip ahead — [Post 4](/blog/migrating-to-uv-from-pip/) covers that path.

## The six commands

```sh title="bootstrap.sh"
uv init webhooks
cd webhooks
uv python pin 3.12
uv add fastapi httpx
uv add --dev pytest ruff
uv run pytest
```

That's it. By the last line, you have a working Python 3.12 project, a lockfile, a venv, runtime and dev dependencies installed, and the test runner working. No activation, no global pip, no `pyenv install` ceremony.

Walking through what each command did:

- `uv init webhooks` — scaffolds `pyproject.toml`, `README.md`, `.python-version`, `.gitignore`, and a placeholder `main.py`. No `.venv/` yet; uv is lazy about that.
- `uv python pin 3.12` — writes `3.12` to `.python-version` and downloads a [python-build-standalone](https://github.com/astral-sh/python-build-standalone) interpreter if you don't already have one. This is the contract: every `uv run` in this directory will use Python 3.12, regardless of what's on your system `PATH`.
- `uv add fastapi httpx` — resolves, downloads, installs, and *records* both packages in `[project.dependencies]` and `uv.lock`. The `.venv/` gets created on this call.
- `uv add --dev pytest ruff` — same, but written to `[dependency-groups.dev]`. Dev deps don't ship to production when you `uv sync --no-dev`.
- `uv run pytest` — the universal "run this command in the project environment" prefix. It implicitly does `uv sync` first (cheap if nothing changed), then executes `pytest`.

*From Node:* `uv run` is `npm run` for arbitrary commands — no script entry needed in `pyproject.toml`. *From Rust:* think `cargo run` but for any binary the project installed.

## Anatomy of the five files

After those six commands, your project root looks like this:

```text
webhooks/
├── .python-version
├── .venv/              # gitignored
├── pyproject.toml
├── uv.lock
├── main.py
└── README.md
```

Five files (plus `.venv/`, which doesn't count — it's gitignored and reproducible). Let's look at the two that matter most.

### `pyproject.toml`

```toml title="pyproject.toml"
[project]
name = "webhooks"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.115.0",
    "httpx>=0.27.0",
]

[dependency-groups]
dev = [
    "pytest>=8.3.0",
    "ruff>=0.7.0",
]
```

Three blocks worth knowing:

1. `[project]` — PEP 621 metadata. `requires-python = ">=3.12"` is what `uv` consults when resolving deps; bump it when you want to use newer syntax.
2. `[project.dependencies]` — runtime deps. These ship.
3. `[dependency-groups]` — PEP 735 groups. `dev` is conventional but you can have as many as you like (`docs`, `lint`, `test`). Sync a subset with `uv sync --group docs`.

There's no `[tool.uv]` section by default, and you mostly won't need one. When you do, it's for things like private indexes (`[[tool.uv.index]]`) or Python preference overrides — covered in [Post 4](/blog/migrating-to-uv-from-pip/).

### `uv.lock`

You commit `uv.lock`. Always. It's the lockfile equivalent — every transitive dep pinned to an exact version with a hash, the source URL, and the resolution context (Python version, platform markers). Anyone who clones this repo and runs `uv sync` gets the *exact* same bytes installed.

*From pip:* this is the gap `pip freeze` never quite filled. Snapshots aren't lockfiles.

*From Node:* `uv.lock` is to `pyproject.toml` what `pnpm-lock.yaml` is to `package.json` — generated, committed, frozen in CI.

Don't edit it by hand. `uv add`, `uv remove`, and `uv lock --upgrade` are the only sanctioned writers.

## The first real workflow

Open `main.py`, replace the placeholder with a function worth testing, and add a test file next to it:

```python title="main.py"
def normalize_event(payload: dict) -> dict:
    return {
        "id": payload["id"],
        "kind": payload.get("type", "unknown"),
        "received_at": payload.get("ts"),
    }
```

```python title="test_main.py"
from main import normalize_event


def test_normalize_event_defaults_unknown_kind():
    out = normalize_event({"id": "evt_1", "ts": 1717000000})
    assert out == {"id": "evt_1", "kind": "unknown", "received_at": 1717000000}
```

Run it:

```sh
uv run pytest
```

No activation, no `PYTHONPATH`, no `python -m pytest` — `uv run` resolves the interpreter (from `.python-version`), the venv (from `.venv/`), and the dependencies (from `uv.lock`) and hands `pytest` to the right one. If anything is out of date, it syncs first. If nothing has changed, the overhead is a few milliseconds.

This is the workflow loop. Edit, `uv run pytest`. Add a dep with `uv add`. Bump everything with `uv lock --upgrade`. There is no other ceremony.

## Sidebar: should I use mise to manage Python too?

If you already use mise (or asdf, or rtx) for Node and Ruby, you'll wonder whether to add Python to the same config. Short answer for a Python-primary project: **no — let uv manage Python**.

The longer answer: both mise and uv install Python from the same [python-build-standalone](https://github.com/astral-sh/python-build-standalone) project. The binaries are functionally identical. The difference is *integration*:

- `uv` reads `.python-version` natively and uses it for `uv run`, `uv sync`, and `uv venv` without any shim layer.
- mise installs Python and puts a shim on `PATH`. Fine on its own — but in a uv project, `uv run` bypasses the shim and goes straight to its own interpreter cache. You end up maintaining two sources of truth that mostly agree.

For polyglot repos (Node + Python + Ruby), keep mise for the non-Python runtimes and let uv own Python. The `.tool-versions` and `.python-version` files coexist cleanly.

If you *really* want mise's Python on `PATH` to be the one uv uses, set `UV_PYTHON_PREFERENCE=only-system` in your shell. I've tried it. It works. But you give up `uv python install` and the deterministic "this project pinned 3.12.7" guarantee. Not worth it.

*From pip:* `pyenv` is the closest analog. Same advice — uv supersedes it for Python-primary projects.

## Adding a CLI entrypoint

If your project ships a command-line tool, declare it in `[project.scripts]`:

```toml title="pyproject.toml" {3-4}
# ... existing config ...

[project.scripts]
webhooks = "webhooks.cli:main"
```

The left side is the binary name; the right side is `module.path:function`. After the next `uv sync`, you can run it via:

```sh
uv run webhooks --help
```

No `setup.py`, no `pip install -e .`, no entry-point ceremony — `uv` wires it up on sync.

## Linting and pre-commit, the one-liner version

Ruff is already in `[dependency-groups.dev]`, so `uv run ruff check .` works today. For a slightly nicer setup, install ruff as a global tool too — it's faster to invoke from outside any project:

```sh
uv tool install ruff
ruff check .   # no `uv run` needed; this hits the global install
```

Same binary, different installation modes. *Use the project version* when ruff's version needs to match what CI uses. *Use the global version* for ad-hoc invocations across many repos. [Post 5](/blog/uv-tool-and-scripts/) goes deep on `uv tool`, including why pre-commit, mypy, and httpie all belong there.

## What's missing for production

You have a project. You don't yet have:

- **Secrets** — env vars, `.env` files, a secret manager. Out of scope for uv; use your platform's pattern.
- **A Dockerfile** — `uv` is designed for this and the pattern is short. [Post 6](/blog/uv-in-docker-and-ci/) walks the multi-stage build.
- **CI** — `astral-sh/setup-uv@v6` + `uv sync --locked` + `uv run pytest` is roughly fifteen lines of YAML. Also Post 6.

But the project structure itself? Done. Five files, six commands, fully reproducible on any machine with `uv` installed.

## *From pip:* what about `uv pip`?

If you still reach for `pip install <pkg>` muscle memory, `uv pip install <pkg>` works inside this project and writes to `.venv/`. But it *won't* update `pyproject.toml` or `uv.lock` — so the next `uv sync` will remove it. Treat `uv pip` as a compat shim for migrating existing projects, not a workflow command in new ones. For new projects, `uv add` is the only correct verb.

---

Next in series: *"Migrating to uv from pip + venv + requirements.txt: a pragmatic path"* — for the projects you can't (or don't want to) rebuild from scratch.

<!--
# Image prompt

Editorial header for a technical blog post titled "Starting a new Python project in 2026 with uv".

Subject: a clean, minimalist still-life of a freshly opened developer workspace — an open laptop seen from a low three-quarter angle, the screen glowing with abstract code-shaped light (no readable text), a small stack of physical books to the side, a single ceramic mug, soft morning light raking across a wood desk. A faint suggestion of a snake silhouette woven into the steam from the mug, stylized and abstract — never literal.

Style: editorial photography, shallow depth of field, warm cinematic color grade with cool desaturated shadows, painterly grain. Composition leaves negative space on the right for type. No embedded text, no logos, no watermarks, no UI mockups, no readable code.

Crops:
- cover.png — 21:9, wide editorial banner, subject left of center.
- thumb.png — 16:9, tighter crop on the laptop and mug.
-->
