---
title: "`uv tool` and Single-File Scripts: pipx and Shebang-Python, Replaced"
date: "2026-02-16T10:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "Two uv features outside project management — uv tool for global CLIs and PEP 723 inline-deps for single-file scripts — quietly close out the last reasons to reach for pip or pipx."
tags: [uv, python, tooling, pipx, scripts, pep-723]
cover: "/images/blog/uv-2026/uv-tool-and-scripts/cover.png"
thumb: "/images/blog/uv-2026/uv-tool-and-scripts/thumb.png"
last_modified_at: "2026-02-16T10:00:00+05:45"
use_featured_image: true
series: uv-2026
seriesOrder: 5
---

The first four posts in this series were about projects: why `uv` exists, why it beats the old stack, how to start a new project, and how to migrate one. All of that is the part of Python tooling that lives in a repo with a `pyproject.toml`.

Two things sit outside that boundary:

- **Global CLIs** — `ruff`, `mypy`, `httpie`, `pre-commit`, `cookiecutter`. Tools you invoke from anywhere, not deps of any one project.
- **Single-file scripts** — the 40-line utility you'd otherwise paste into a gist, where standing up a venv feels like overkill.

`uv` has a dedicated answer for each: `uv tool` (which replaces `pipx`) and PEP 723 inline-deps (which replaces "ugh, I need a venv just for this"). Individually small. Together, the last two reasons you reached for `pip` or `pipx` are gone.

---

## `uv tool install`: pipx, but it's the same binary

`uv tool install <pkg>` puts a CLI in its own isolated venv under `~/.local/share/uv/tools/<pkg>/` and drops a shim on your `PATH` (typically `~/.local/bin/`). No `pip install --user`, no global site-packages pollution, no shared venv where ruff's deps fight with httpie's.

```sh
uv tool install ruff
uv tool install mypy
uv tool install httpie

uv tool list
uv tool upgrade ruff
uv tool upgrade --all
uv tool uninstall mypy
```

That's the whole surface area. If you've used `pipx`, the mental model is identical — one venv per tool, shims on `PATH`. The differences are operational, not conceptual:

- **Speed.** Install is `uv`-fast (Rust resolver, parallel downloads, the global hardlink cache from Post 2). Upgrading every tool you have installed is a few seconds, not a few minutes.
- **One binary.** `uv` is already on your machine for projects. You don't install a second tool to manage your tools.
- **Shared cache.** Tool venvs hardlink from the same `~/.cache/uv/` that your projects use. Installing `mypy` as both a tool and a project dev-dep stores one copy of the wheels.

*From pipx:* the command mapping is one-to-one.

- `pipx install` → `uv tool install`
- `pipx list` → `uv tool list`
- `pipx upgrade-all` → `uv tool upgrade --all`
- `pipx run <pkg>` → `uvx <pkg>`

Migration recipe: run `pipx list`, reinstall each entry with `uv tool install`, then uninstall pipx.

*From Node:* this is `npm install -g`, except with venv isolation instead of one tangled global `node_modules`.

---

## `uvx`: the most underused `uv` command

`uvx <pkg>` (alias for `uv tool run <pkg>`) runs a CLI **without installing it**. It resolves, caches, and invokes — like `npx`.

```sh
uvx ruff check .
uvx cookiecutter gh:audreyfeldroy/cookiecutter-pypackage
uvx --from httpie http httpbin.org/get
uvx --python 3.11 mypy script.py
```

The first run pays the resolve/download cost. Subsequent runs hit the cache and start in milliseconds. Nothing ends up on `PATH`; nothing needs uninstalling.

I use `uvx` for two patterns:

1. **One-off invocations.** Running `cookiecutter` once to scaffold a project. Trying out a CLI before committing to `uv tool install`.
2. **Pinned versions in scripts.** `uvx ruff@0.6.9 check .` in a Makefile guarantees the version you tested with, regardless of what's globally installed. Useful in repos where `ruff` isn't a dev-dep but you want a deterministic lint command.

`--from` is the escape hatch when the package name and the command name differ. `uvx httpie` fails because the command is `http`, not `httpie`; `uvx --from httpie http` is the fix.

---

## PEP 723: dependencies live inside the script

[PEP 723](https://peps.python.org/pep-0723/) standardises a header that declares a script's Python version and dependencies inline. `uv run` implements it.

```python title="check_feeds.py"
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "httpx",
#   "feedparser",
#   "rich",
# ]
# ///

import httpx
import feedparser
from rich.console import Console

FEEDS = [
    "https://astral.sh/blog/feed.xml",
    "https://simonwillison.net/atom/everything/",
]

console = Console()

for url in FEEDS:
    resp = httpx.get(url, timeout=10.0, follow_redirects=True)
    parsed = feedparser.parse(resp.text)
    console.rule(parsed.feed.get("title", url))
    for entry in parsed.entries[:5]:
        console.print(f"[bold]{entry.title}[/]")
        console.print(f"  {entry.link}", style="dim")
```

On a fresh machine — no `.venv`, no `pip install`, no `requirements.txt`:

```sh
uv run check_feeds.py
```

`uv` reads the header, builds an ephemeral venv in its cache, installs `httpx` + `feedparser` + `rich`, and runs the script. Second invocation hits the cache and starts instantly. The script is the artifact. You can email it, paste it into a gist, drop it into a Slack thread, and the recipient runs the exact same thing.

The header is a regular Python comment, so `python check_feeds.py` still works on a machine where the deps are already importable — the script remains valid Python. `uv` is the runtime that knows how to provision.

### The shebang trick

Make it executable from anywhere `uv` is installed:

```python title="check_feeds.py" {1,3-9}
#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "httpx",
#   "feedparser",
#   "rich",
# ]
# ///

import httpx
# ...
```

```sh
chmod +x check_feeds.py
./check_feeds.py
```

`env -S` is what splits the multi-word interpreter into `uv run --script`. The script is now a self-contained executable. Drop it in `~/.local/bin/` and it behaves like any other command on your `PATH`, with its own pinned dependency set baked in.

This is the killer feature for the "shell scripts that grew teeth" problem — the bash script that turned into 200 lines of `jq` invocations and would be cleaner in Python, except every machine that runs it would need a venv. With the shebang trick, "every machine that runs it needs `uv`" — which is a tiny, single-binary install — and that's it.

### Pinning the Python version per script

`requires-python = ">=3.11"` lets `uv` pick any compatible interpreter. If you want exact reproducibility:

```python
# /// script
# requires-python = "==3.12.7"
# dependencies = ["pandas==2.2.3"]
# ///
```

`uv` will install `cpython-3.12.7` via `uv python install` if it's not already on disk, then run the script under it. The script carries its own runtime contract.

---

## When to use which

The three modes overlap, which makes the choice feel ambiguous. It isn't:

| Mode | When |
| --- | --- |
| `uv add` (project dep) | Code that lives in a repo with tests, multiple files, a `pyproject.toml`. |
| `uv tool install` (global CLI) | A command you invoke from your shell, across projects. |
| Inline-deps script | One file you'd otherwise paste into a gist or attach to a ticket. |

The decision tree:

- Is this a **library or app** I'll iterate on with tests? → `uv init` + `uv add`.
- Is this a **CLI I'll invoke from anywhere**, not tied to one project? → `uv tool install`.
- Is this **one file** with a few imports? → PEP 723 header + `uv run`.

If a script grows past ~200 lines, gains a second file, or needs tests — promote it. `uv init`, move the inline deps to `[project.dependencies]`, write a test, you're a project now. The transition costs you ten minutes.

---

## A small gallery: things worth `uv tool install`-ing today

Curated, not exhaustive. Each of these is something I'd reinstall on a fresh machine:

```sh
# Lint + format + types
uv tool install ruff
uv tool install mypy

# HTTP from the terminal
uv tool install httpie       # `http GET ...`
uv tool install xh           # Rust httpie alternative, also via cargo

# Project scaffolding + hooks
uv tool install cookiecutter
uv tool install pre-commit

# Cloud + ops
uv tool install awscli       # if you don't want the bundled installer
uv tool install ansible

# Media
uv tool install yt-dlp
uv tool install openai-whisper   # ships a `whisper` CLI for local transcription

# Notebooks without a project
uv tool install jupyterlab
```

The pattern that surprised me most: `uv tool install pre-commit`. `pre-commit` itself manages its own per-hook environments, so having it as a global CLI (rather than a dev-dep in every project) is the natural fit — install once, every repo's `.pre-commit-config.yaml` Just Works.

One caveat worth calling out: `openai-whisper` pulls in PyTorch, which is large and platform-specific. `uv` handles the resolution fine — on Apple Silicon you get the MPS-capable build from PyPI — but expect a multi-hundred-megabyte install and a slow first run. If you only need transcription occasionally, `uvx openai-whisper audio.mp3` runs it ephemerally without keeping the toolchain on disk.

---

Once your projects, your global CLIs, and your one-file scripts are all on `uv`, the last thing standing between you and a fully-uv workflow is the build pipeline. Next: **uv in Docker and CI: lockfile-driven builds that actually cache**.

<!--
# Image prompt

cover.png (21:9, no text/logos/watermarks, editorial)
"A minimalist editorial illustration in muted ochre and slate tones: a single Python script file rendered as a small parchment-like rectangle, levitating above a tidy row of tiny isolated toolboxes — each toolbox glowing softly from within. Thin geometric lines connect the script to the toolboxes like a constellation. Wide cinematic 21:9 framing, soft directional light from upper left, clean negative space on the right, subtle paper grain. No text, no symbols, no logos, no watermarks. Style: contemporary editorial illustration, flat-with-depth, magazine cover quality."

thumb.png (16:9 crop, same composition tightened)
"Same scene as the cover, recomposed for 16:9: the floating script slightly larger and centered, two or three of the small toolboxes visible below it. Muted ochre and slate palette, soft directional light, subtle paper grain, generous negative space. No text, no symbols, no logos, no watermarks."
-->
