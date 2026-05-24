---
draft: false
title: "Why uv Exists: The Pre-uv Python Tooling Mess, and What Astral Consolidated"
date: "2026-01-12T10:00:00+05:45"
category: ["technical-notes"]
categories:
  - technical-notes
directory: technical-notes
excerpt: "Before uv, a working Python project needed five tools and a working knowledge of how they fail at the seams. uv collapsed them into one Rust binary because the seams were the problem."
cover: "/images/blog/uv-2026/why-uv-exists/cover.png"
thumb: "/images/blog/uv-2026/why-uv-exists/thumb.png"
last_modified_at: "2026-01-12T10:00:00+05:45"
use_featured_image: true
series: uv-2026
seriesOrder: 1
tags:
  - uv
  - python
  - tooling
  - astral
  - packaging
---

It's 2024. You clone a Python repo to try the thing the README promises in two commands.

```sh
pyenv install 3.11.7
pyenv local 3.11.7
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
# something about a wheel failing to build
# something about pyenv shimming the wrong python
# something about pip and setuptools being too old or too new
```

Twenty minutes in, you're reading a Stack Overflow answer from 2019 about why `python -m venv` is picking up the system Python instead of the pyenv shim. The README still says two commands.

It's 2026. The same repo, now on uv:

```sh
uv sync
```

Done. The right Python is installed, the venv exists, the lockfile is honored, the dev deps are in.

The interesting question isn't "uv is faster" — every uv post leads with that. The interesting question is *why* the old setup was so bad in the first place. It wasn't one tool failing. It was five tools that didn't know about each other.

---

## The five-tool stack

Before uv, the working Python project assumed you'd assembled:

- **pip** — install packages into the current interpreter's `site-packages`. Knows nothing about virtual environments, lockfiles, or which Python it should be using. It just installs.
- **venv** (`python -m venv`) — make an isolated copy of an interpreter so `pip install` doesn't pollute your system. The unit of isolation, nothing more.
- **pyenv** — install and switch between Python versions via shims on PATH. Solves "I have 3.10 but this project needs 3.12."
- **pipx** — install Python CLI tools (ruff, httpie, poetry) into their own private venvs so they don't conflict with project deps. Each tool gets its own venv. Each venv is real.
- **pip-tools** — generate a pinned `requirements.txt` from a high-level `requirements.in`. The compile step that pip itself wouldn't do. Lockfile, almost.

Each tool was sharp on its own axis. Each one assumed the others didn't exist.

*From Node:* this is roughly `npm` + `nvm` + `npx` + `npm install -g`, except split across four projects with four maintainers and four release cadences.

*From Rust:* imagine if `cargo build`, `cargo test`, `cargo install`, and `rustup` were each a separate binary from a different organization, and they communicated only through environment variables and the filesystem.

---

## Where the seams leaked

The seams were the problem. A non-exhaustive tour:

**pip didn't know about your venv.** `pip install requests` installs into "the current Python's site-packages." Whether that's a venv or your system Python depends entirely on which `python` is on PATH at the moment you ran it. Forget to `source .venv/bin/activate` and you've quietly installed into the system Python. The error surfaces three days later as a permissions issue on a Mac or a "this works on my machine" on someone else's.

**pyenv shims fought `python -m venv`.** pyenv installs a `python` shim on your PATH that dispatches to the right version. `python -m venv .venv` copies that shim into the venv. The venv's `python` then re-dispatches through pyenv — which sometimes resolves to the wrong version, especially after a `pyenv global` change. The workaround was always "delete the venv and recreate it," which is the kind of advice that tells you the tools don't fit together.

**pip-tools required a separate workflow.** You don't `pip install` from `requirements.in`. You `pip-compile` it first, commit the resulting `requirements.txt`, and then `pip install -r requirements.txt`. Two-step. Easy to forget. Easy to commit one without the other. And `pip-compile` itself was slow on real projects — Python resolving Python dependencies, in Python.

**pipx duplicated venvs for every CLI.** Want ruff and mypy and httpie globally? That's three venvs, each with its own copy of any shared dependency, each with its own Python interpreter symlinked in. Disk usage was the smaller problem; the bigger one was that upgrading Python meant rebuilding every pipx venv.

**`pip freeze` was not a lockfile.** It captured "what is installed in this venv right now," without hashes, without source URLs, without the resolution context that produced it. A lockfile, by contrast, is a contract: given this lockfile and any compatible machine, you get the same bytes installed. `pip freeze` was a snapshot of one machine at one moment. People kept calling it a lockfile because nothing better was within reach.

None of these were bugs in any individual tool. They were the cost of coordination.

---

## Poetry and hatch tried

It's not like nobody noticed. Poetry shipped in 2018 with a unified CLI, a real resolver, and a real lockfile. Hatch followed with `pyproject.toml`-first project management and a plugin model. Both got the shape right.

Both also kept the seams in different places:

- **Speed.** Poetry's resolver, written in Python, was infamous for taking minutes on medium projects. Hatch was faster but not dramatically so. Neither was 10× faster than the thing they replaced — and 2× faster isn't enough to make people rewrite their CI.
- **Python version management.** Neither installed Python itself. You still needed pyenv (or asdf, or mise) underneath. The five-tool stack became a four-tool stack.
- **Pip compatibility.** Poetry's lockfile format wasn't pip-readable. If your CI used `pip install -r requirements.txt`, you couldn't just bolt Poetry on — you needed an `export` step and a workflow change.
- **Global CLI installs.** Still pipx's job. Poetry didn't try.

The standardization win was real: `pyproject.toml` is now *the* file, and that's largely because Poetry and hatch and PEP 517/518/621 hammered on it for years. uv inherited that win for free. But on the consolidation axis, neither tool went all the way.

---

## What Astral built

uv is one statically-linked Rust binary. Inside that binary:

- A real resolver — same algorithmic shape as `cargo`'s, but for PyPI. Fast enough that resolution stops being a thing you wait on.
- A package installer with a global hardlink cache. One copy of `numpy` on disk, hardlinked into every project's `.venv/`. Cold cache: download once. Warm cache: a few milliseconds per dependency.
- Native `pyproject.toml` support, no plugins.
- A native lockfile (`uv.lock`) with hashes, source URLs, and resolution context. Reproducible across machines and Python versions.
- A Python version manager — `uv python install 3.12` pulls a [python-build-standalone](https://github.com/astral-sh/python-build-standalone) build. No more "install pyenv to install Python to install uv to install your project."
- `uv tool install` for global CLIs — same mental model as pipx, faster, with a shared cache.
- A pip-compatible CLI (`uv pip install`, `uv pip compile`) so you can drop it into existing workflows without changing anything else. *More on this in [Migrating to uv from pip + venv + requirements.txt](/migrating-to-uv-from-pip/) — Post 4.*

*From pip:* the things you reach for separately — pip, venv, pip-tools, pipx, pyenv — are all subcommands of one binary now. The verbs you know mostly still work; `uv pip install -r requirements.txt` does exactly what `pip install -r requirements.txt` did, only faster and with shared cache.

*From Node:* think `pnpm` + `nvm` + `npx` + `npm install -g`, written in Rust, shipped as one binary.

*From Rust:* think `cargo`, including the toolchain installer, for Python.

---

## The bet underneath

The thesis isn't "Rust is faster than Python" — though it is, and that matters for resolver performance. The thesis is structural.

Most of Python tooling's pain wasn't a Python-language problem. It was a *coordination* problem. Five tools that didn't share state had to negotiate at the filesystem level: PATH order, shim resolution, "which Python is `python` right now," whether `pip` is the one pyenv installed or the one Homebrew installed or the one inside the venv. The bugs lived in the gaps between tools, not inside any of them.

You can fix coordination two ways. You can write a coordinator — a meta-tool that orchestrates the existing ones (this is roughly what asdf and mise do for language version managers). Or you can collapse the tools into one binary that shares state internally.

uv took the second path. The venv knows about the resolver knows about the cache knows about the Python installer knows about the lockfile knows about the tool installer — because they're all the same process, reading the same in-memory state, writing to a shared on-disk cache with a known layout.

That's why the speed numbers are what they are. Not just "Rust is fast" but "the cache hit path is one function call instead of two `subprocess.run` invocations." Not just "parallel downloads" but "the resolver and the installer share a queue."

It's also why the DX wins are what they are. `uv run script.py` can auto-create the venv, sync the deps, pick the right Python, and execute, because all four steps are the same binary. There's no boundary to leak through.

---

## Where this leaves us

The rest of this series gets concrete. Next: the head-to-head — speed, lockfiles, and the death of `source .venv/bin/activate`. Numbers, not vibes.

Up next: *uv vs pip + venv + pyenv: speed, lockfiles, and the death of `source activate`.*

<!--
# Image prompt

Cover (21:9, public/images/blog/uv-2026/why-uv-exists/cover.png):
Editorial illustration, no embedded text, no logos, no watermarks. A loose arrangement of five small disconnected tool silhouettes (a wrench, a small box, a pipe segment, a snap-clip, a measuring tape) on the left side, floating with subtle drop shadows, drawn in flat geometric style. On the right side, the same five shapes have visually merged into a single, denser, faceted object — suggesting consolidation. Muted editorial palette: deep navy background, off-white shapes, a single warm accent (terracotta or amber) on the merged object. Soft directional light from upper-left. Generous negative space. Aspect ratio 21:9. No type, no glyphs, no UI chrome, no Python or Rust logos.

Thumb (16:9, public/images/blog/uv-2026/why-uv-exists/thumb.png):
Same scene re-cropped tighter to 16:9 so the merged object on the right is the focal point and one or two of the scattered shapes are still visible on the left edge for narrative tension. Same palette and rendering style as the cover. No text, no logos, no watermarks.
-->
