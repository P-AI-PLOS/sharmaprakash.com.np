---
title: "uv vs pip + venv + pyenv: speed, lockfiles, and the death of `source activate`"
date: "2026-01-19T10:00:00+05:45"
excerpt: "Three axes where uv wins and they compound: raw speed from a Rust resolver and a global hardlink cache, a real lockfile instead of a pip freeze snapshot, and a workflow that finally retires source .venv/bin/activate."
category: "technical-notes"
categories: ["technical-notes"]
directory: technical-notes
tags: [uv, python, tooling, pip, venv, pyenv, lockfile]
cover: "/images/blog/uv-2026/uv-vs-the-old-stack/cover.png"
thumb: "/images/blog/uv-2026/uv-vs-the-old-stack/thumb.png"
last_modified_at: "2026-01-19T10:00:00+05:45"
use_featured_image: true
series: uv-2026
seriesOrder: 2
---

The first post in this series argued that Python tooling's pain was a coordination problem. This one is the receipt: three places where `uv` measurably beats the old stack, and where the wins compound on each other.

Speed makes you reach for it. Lockfiles make you trust it. The workflow is what makes you forget the old one.

## 1. Speed: it's not a 2× story

Astral's benchmarks consistently show `uv` resolving and installing dependencies **10–100× faster** than `pip`, depending on cache state. The headline numbers from [their launch post](https://astral.sh/blog/uv) — installing Trio's full dev dependencies in ~50ms with a warm cache vs. multiple seconds for `pip` — sound like a typo until you run it yourself on a fresh project.

Three things make this real, not theoretical:

- **A Rust resolver.** `pip`'s resolver is a correct-but-cautious Python program. `uv`'s is a parallel Rust implementation of PubGrub, the same algorithm Dart's `pub` and (a variant of) Cargo use.
- **Parallel downloads and builds.** `pip` is largely serial. `uv` saturates your network and CPU.
- **A global hardlink cache.** `uv` keeps one copy of every package on disk under `~/.cache/uv/` and hardlinks it into each project's `.venv/`. Installing `numpy` into your tenth project doesn't re-download anything and doesn't take meaningful disk space.

```sh
# The mental model
du -sh ~/.cache/pip/        # grows linearly with projects × dependencies
du -sh ~/.cache/uv/         # grows ~once per (package, version) pair
du -sh ./.venv/             # hardlinks, not copies — practically free
```

*From Node:* this is closer to `pnpm`'s content-addressable store than to `npm`'s flat `node_modules`. Disk usage is the most underrated win.

*From Rust:* same story as `cargo`'s shared registry cache — except `cargo` doesn't have to fight a 15-year-old per-project install convention.

The speed isn't a vanity metric. It changes what's tolerable. Re-running CI with a different Python version. Blowing away `.venv` to debug a weird import. Trying a dependency upgrade to see if anything breaks. All of these go from "I'll do it after lunch" to "I'll just do it now."

## 2. Lockfiles: `pip freeze` was never one

The terminology has been muddied for years. Let's be precise: `pip freeze > requirements.txt` produces a **snapshot** of whatever is currently installed in the active environment. That is not a lockfile.

A lockfile, in the sense that `package-lock.json`, `Cargo.lock`, `Gemfile.lock`, and `uv.lock` mean it, records:

- The full resolved dependency graph, including transitive deps.
- Cryptographic hashes for every artifact, so installs fail closed on tampering.
- The source index for each package (PyPI, a private mirror, a git URL).
- The Python versions and platforms the resolution applies to.
- Enough metadata that a fresh machine can reproduce the install bit-for-bit.

`pip freeze` records the first line of that list and nothing else.

```diff title="requirements.txt vs uv.lock"
- # pip freeze output
- fastapi==0.115.0
- httpx==0.27.2
- # ...transitive deps, in install order, no hashes, no sources
+ # uv.lock excerpt (TOML)
+ [[package]]
+ name = "fastapi"
+ version = "0.115.0"
+ source = { registry = "https://pypi.org/simple" }
+ dependencies = [
+     { name = "pydantic" },
+     { name = "starlette" },
+ ]
+ wheels = [
+     { url = "https://files.pythonhosted.org/.../fastapi-0.115.0-py3-none-any.whl",
+       hash = "sha256:..." },
+ ]
```

You commit `uv.lock`. You don't commit `pip freeze` output and call it reproducible — it isn't.

*From Node:* if you've worked with `pnpm-lock.yaml`, this is the same contract. If you've only worked with the old `npm shrinkwrap`, `uv.lock` is what you wished that had been.

## 3. The workflow: `activate` is gone

This is the smallest of the three wins on paper and the biggest in daily use. The old loop:

```sh
# Old
cd project/
source .venv/bin/activate    # forget this; pip installs to system Python
pip install -r requirements.txt
python script.py
deactivate                    # or just close the terminal and pray
```

The new loop:

```sh
# New
cd project/
uv run script.py              # creates .venv on first run, syncs deps, runs
```

`uv run` does the right thing without ceremony. There is no environment to activate, no shell state to leak between projects, no "wait, which Python is this" moment when you open a new tab.

The same flattening shows up in dependency management:

```sh
uv add fastapi                # updates pyproject.toml, resolves, updates uv.lock, installs
uv remove httpx               # the inverse
uv sync                       # "make my .venv match the lockfile" — the universal verb
uv sync --frozen              # the same, but fail if pyproject.toml drifted from the lockfile
```

Three commands cover everything that used to need `pip install`, `pip uninstall`, `pip-compile`, `pip-sync`, and a handful of editor restarts to pick up the new venv.

*From Node:* `uv add` is `pnpm add`. `uv sync` is `pnpm install --frozen-lockfile`. `uv run` is `pnpm exec`, except it also handles the Python version.

*From Rust:* `uv` is the closest thing Python has to `cargo`. Same project-as-the-unit-of-work assumption, same lockfile discipline, same single binary.

## 4. Python versions: one tool, not three

Pre-`uv`, the version-management story was its own swamp: `pyenv` for installing Pythons, `python -m venv` for environments, `pyenv-virtualenv` if you wanted them to cooperate. Each had its own shims and config files.

`uv` handles it natively:

```sh
uv python install 3.12        # downloads python-build-standalone, no compile
uv python pin 3.12            # writes .python-version
uv run script.py              # uses 3.12, no shims, no PATH games
```

**If you're a mise (or asdf) user** — and many readers of this site are — keep using it for Node, Ruby, Go, and the other languages you switch between. For Python specifically, let `uv` manage it. Both tools fetch the same [python-build-standalone](https://github.com/astral-sh/python-build-standalone) binaries under the hood, but `uv` integrates the Python version into the same workflow as the lockfile and the venv. Two sources of truth for "which Python" is one too many. The full sidebar on this lives in the next post.

## 5. What doesn't change

Worth being explicit about, because tooling churn fatigue is real:

- `pyproject.toml` is still the standard. `uv` reads and writes it; it doesn't invent a parallel format.
- PyPI is still the registry. `uv` doesn't host packages.
- Your application code doesn't move. Imports work the same. Your IDE keeps working.
- `uv pip install` still exists as a compatibility surface — useful for incremental migrations (covered in Post 4).

The change is the orchestration layer, not the ecosystem.

## What you give up

In the interest of not writing a marketing post:

- **Astral is one company.** `uv` is permissively licensed and open-source, but the project's direction is set by a single, VC-backed organisation. Worth knowing; not, in my view, disqualifying.
- **Plugin ecosystems are thinner.** `poetry` has a decade of plugins. `uv` has a smaller surface and fewer escape hatches if you need one.
- **Some older guides won't apply.** Tutorials that say "activate your venv first" need a mental translation step.

None of these have stopped me from using it on every new project for the last six months.

---

If all this sounds good, the next question is what a project actually looks like end-to-end — six commands, five files, no `activate`.

Next in series: *Starting a new Python project in 2026 with uv*.

<!--
# Image prompt

cover.png (21:9, 1920×823): Editorial illustration in the visual language of a stylised performance chart. Three thin horizontal tracks of light moving left to right across a deep indigo background, each track a different length — the shortest track ends near the left, the middle one halfway, the longest stretches the full width and ends in a soft bright burst. Subtle Rust-orange and Python-blue accent gradients on the tracks. Suggests speed, lockfile reproducibility, and frictionless workflow without being literal. No text, no logos, no watermarks, no UI mockups, no terminal screenshots. Cinematic, minimal, generous negative space, soft grain.

thumb.png (16:9, 1600×900): Same scene, recomposed as a tighter 16:9 crop. The three tracks of light remain the central motif; the bright burst at the end of the longest track is the visual focal point. Same indigo background, same Rust-orange and Python-blue accents, same editorial-illustration treatment. No text, no logos, no watermarks.
-->
