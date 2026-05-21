# Brief: `uv-2026` blog series

A six-part series on `uv` — Astral's Rust-based Python toolchain — for `sharmaprakash.com.np`. Each post is fan-out-ready: a separate `claude` session takes one section below and drafts the post end-to-end (markdown + frontmatter + Codex image prompts).

## Series-wide constraints

- **Slug**: `uv-2026` (already registered in `src/data/series.ts`).
- **Category**: `technical-notes` for every post.
- **Filename pattern**: `src/content/posts/YYYY-MM-DD-<slug>.md` — date must match frontmatter `date`. Pick consecutive weekly dates starting from the first unclaimed Tuesday after 2026-05-17.
- **Required frontmatter**: `title`, `date`, `excerpt`, `category: technical-notes`, `directory: technical-notes` (**required — without it the post routes to `/<slug>/` instead of `/technical-notes/<slug>/` and breaks under the expected URL**), `tags: [uv, python, tooling, ...]`, `cover`, `thumb`, `series: uv-2026`, `seriesOrder: N` (1–6), `use_featured_image: true`.
- **Images**: under `public/images/blog/uv-2026/<post-slug>/cover.png` (21:9) and `thumb.png` (16:9). Generate with Codex per CLAUDE.md image rules — editorial, no embedded text/logos/watermarks. Document the prompt used in a `# Image prompt` HTML comment at the bottom of the post for future regen.
- **Audience**: Python devs on pip+venv today + polyglot devs new to Python. Use inline callouts: *From pip:* / *From Node:* / *From Rust:* — short paragraphs (2–3 sentences each), not full sections.
- **Benchmarks**: cite Astral's published numbers (link to their blog). Do not run local benchmarks.
- **Stance on `requirements.txt`**: pragmatic. Keep it where Docker layer caching, legacy CI, or ops handoffs justify it; export via `uv export --format requirements-txt`. New projects start with `pyproject.toml` + `uv.lock`.
- **Voice**: opinionated-but-pragmatic, terse, code-led. Follow the conventions of existing posts in `src/content/posts/`. Use the project's code-block features — `title=`, `{1-3,5}` highlights, `diff` fences — where they earn their keep.
- **Cross-links**: Posts 2 and 3 reference each other; Post 4 links to Post 3 as "for new projects, do this instead"; Post 6 references Post 4 for the export pattern. No outbound links to series 2 or 3 yet — they don't exist.
- **End each post** with a 1-sentence "next in series" tease that names the next post's title.

## Post 1 — Why uv exists

**Working title**: *"Why uv exists: the pre-uv Python tooling mess, and what Astral consolidated"*

**Slug**: `why-uv-exists`

**Thesis**: Before `uv`, a working Python project needed five tools (pip, venv, pyenv, pipx, pip-tools) and a working knowledge of how they fail at the seams. `uv` consolidates them into one Rust binary because the seams themselves were the problem.

**Outline**:
- Open with a concrete scene: cloning a Python repo in 2024 and the dance to get it running (pyenv → venv → pip install -r requirements.txt → pip install -r requirements-dev.txt → curse). Contrast with `uv sync` in 2026.
- The five-tool stack and what each owned: pip (install), venv (isolate), pyenv (Python versions), pipx (global CLIs), pip-tools (lockfiles). Brief paragraph each — what it did well, what it didn't.
- Where the seams leaked: pip not knowing about venv state; pyenv shims clashing with `python -m venv`; pip-tools requiring a separate `pip-compile` workflow; pipx duplicating venvs for every CLI.
- Poetry / hatch as prior attempts at consolidation — what they got right (`pyproject.toml`) and where they fell short (speed, Python version management, not pip-compatible).
- What Astral built: one binary, Rust, global hardlink cache, real resolver, native `pyproject.toml`, native lockfile, native Python version management, native CLI-tool installer.
- The bet: most of Python tooling's pain was *not* a Python problem — it was a coordination problem between tools that didn't share state. Solve coordination by collapsing into one tool.
- *From pip / From Node / From Rust* callouts where relevant.

**No code-heavy walkthrough** — that's Post 3. This is the "why" post.

## Post 2 — uv vs the old stack: speed, lockfiles, DX

**Working title**: *"uv vs pip + venv + pyenv: speed, lockfiles, and the death of `source activate`"*

**Slug**: `uv-vs-the-old-stack`

**Thesis**: `uv` wins on three axes that compound: raw speed (cited benchmarks), a real lockfile (vs `pip freeze`), and a workflow that removes `source .venv/bin/activate` from your life.

**Outline**:
- **Speed**: cite Astral's benchmarks (warm cache, cold install, resolution). Explain *why* — Rust resolver, parallel downloads, global hardlink cache (one copy of `numpy` on disk, hardlinked into every project). Show `du -sh ~/.cache/uv/` vs `du -sh ~/.cache/pip/` mental model.
- **Lockfiles**: `pip freeze` is a snapshot, not a lockfile — no hashes, no source URLs, no resolution context. `uv.lock` is reproducible across machines and Python versions. Compare side by side.
- **DX wins**: `uv run script.py` auto-creates and uses `.venv` — no `activate`. `uv add fastapi` updates `pyproject.toml` + lockfile + installs in one shot. `uv sync` is the universal "make this match the lockfile" command.
- **Python version management** (the mise callout): `uv python install 3.12` + `.python-version` files. *One-paragraph note: if you use mise for Node/Ruby/etc., keep doing so. For Python, let uv manage it — both tools use the same python-build-standalone binaries under the hood, and uv integrates more deeply with `uv run`/`uv sync`. Full sidebar in Post 3.*
- **What doesn't change**: `pyproject.toml` is still the standard; PyPI is still the registry; your code doesn't move.
- *From Node* callout: this is `npm` + `nvm` + `pnpm` collapsed. *From Rust*: this is `cargo` for Python.

**Closer**: tee up Post 3 — "if all this sounds good, here's how a new project actually starts."

## Post 3 — Starting a new Python project in 2026 with uv

**Working title**: *"Starting a new Python project in 2026 with uv"*

**Slug**: `new-python-project-2026`

**Thesis**: A walkthrough from `uv init` to first deploy. Six commands, five files, zero `activate`.

**Outline**:
- The six commands: `uv init`, `uv python pin 3.12`, `uv add fastapi httpx`, `uv add --dev pytest ruff`, `uv run pytest`, `uv lock`.
- Anatomy of generated files: `pyproject.toml` (annotated section by section), `uv.lock` (what's in it, why you commit it), `.python-version` (the contract with `uv python`), `.venv/` (created on first `uv run`, gitignored), `README.md` (skip the boilerplate).
- The first real workflow: write a function, write a test, `uv run pytest`. Show how `uv run` resolves Python + venv + deps without ceremony.
- **Sidebar: "Should I use mise to manage Python too?"** — full answer here. Quick verdict: no for Python-primary projects (uv handles it natively); yes-but-only-for-other-runtimes if you're polyglot. Explain the python-build-standalone overlap. Show the coexistence pattern (`UV_PYTHON_PREFERENCE=only-system`) for completeness but recommend against it.
- Adding a CLI entrypoint with `[project.scripts]` — runs via `uv run myapp` immediately.
- Pre-commit / ruff setup as a one-liner with `uv tool` (full coverage in Post 5).
- What's missing for production: secrets, Docker (Post 6), CI (Post 6).
- *From pip* callout: yes, `uv pip install` still works inside this project — but you'd rarely reach for it.

**Closer**: tee up Post 4 for readers who already have a pip+venv project they want to migrate.

## Post 4 — Migrating from pip + venv + requirements.txt

**Working title**: *"Migrating to uv from pip + venv + requirements.txt: a pragmatic path"*

**Slug**: `migrating-to-uv-from-pip`

**Thesis**: You don't have to commit to a full migration to get value from uv. The `uv pip` compat layer is a zero-effort speedup. Move source-of-truth to `pyproject.toml` only when you'd benefit from it.

**Outline**:
- **Day one: the free speedup**. Replace `python -m venv .venv && pip install -r requirements.txt` with `uv venv && uv pip install -r requirements.txt`. Same `requirements.txt`, same behavior, 10–100× faster. CI gets faster immediately. No other changes.
- **When to keep `requirements.txt`** (the honest section): Docker `COPY requirements.txt . && pip install -r requirements.txt` layer caching is still well-understood by most teams; legacy CI scripts that grep `requirements.txt`; ops handoffs to teams that don't want to learn a new tool. None of these are bad reasons.
- **The hybrid pattern**: `pyproject.toml` as source of truth + `uv export --format requirements-txt > requirements.txt` as an exported artifact (committed or generated in CI). Best of both worlds. Show the `uv export` command and a sample CI step.
- **Full migration**: when `pyproject.toml` is worth it (multiple environments, dev/prod groups, scripts, Python version pinning). Show converting a real `requirements.txt` + `requirements-dev.txt` setup to `[project.dependencies]` + `[dependency-groups.dev]` + `uv.lock`.
- **The `pip-tools` shop**: `uv pip compile requirements.in -o requirements.txt` is a drop-in replacement for `pip-compile`. Show it. This is the lowest-friction migration path for teams that already use pip-tools.
- **Gotchas**: editable installs, private indexes (the `[[tool.uv.index]]` block), `--system` vs project mode, `UV_INDEX_URL` envvar.
- *From Node*: this is the `npm ci` → `pnpm install --frozen-lockfile` story, except you keep your old lockfile working during the transition.

**Closer**: tee up Post 5 — once the project itself is on uv, the global tools are next.

## Post 5 — `uv tool` and PEP 723 single-file scripts

**Working title**: *"`uv tool` and single-file scripts: pipx and shebang-Python, replaced"*

**Slug**: `uv-tool-and-scripts`

**Thesis**: Two `uv` features outside project management — `uv tool install` for global CLIs (replaces pipx) and PEP 723 inline-deps for single-file scripts (replaces "ugh, I need a venv just for this") — are individually small but together they remove the last reasons you reached for `pip` or `pipx`.

**Outline**:
- **`uv tool install`**: install ruff, mypy, httpie, poetry-itself, whatever — each in its own isolated venv under `~/.local/share/uv/tools/`, with shims on PATH. Show install, list, upgrade, uninstall. Compare to pipx mental model.
- `uv tool run <pkg>` (alias `uvx`) for one-off invocations without installing — like `npx`. The most underused `uv` command.
- **PEP 723 single-file scripts**: the `# /// script` header. Show a real example — a 40-line script with inline deps that `uv run script.py` Just Works on a fresh machine. No `.venv`, no `pip install`, no `requirements.txt`.
- The shebang trick: `#!/usr/bin/env -S uv run --script` at the top of a Python file makes it executable as a standalone command anywhere uv is installed.
- When to use which: project (`uv add`) for code that lives in a repo with tests; tool (`uv tool install`) for CLIs you invoke from your shell; script (inline deps) for one-file utilities you'd otherwise paste into a gist.
- *From Node*: this is `npx` + `npm install -g` redone with venv isolation and zero global pollution.
- A small gallery of useful `uv tool install` candidates: `ruff`, `mypy`, `httpie`, `pre-commit`, `cookiecutter`, `awscli`, `youtube-dl` / `yt-dlp`.

**Closer**: tee up Post 6 — the last piece is making all this work in CI and Docker.

## Post 6 — uv in Docker and CI

**Working title**: *"uv in Docker and CI: lockfile-driven builds that actually cache"*

**Slug**: `uv-in-docker-and-ci`

**Thesis**: `uv` was designed for the install-from-lockfile path that CI and Docker care about. Two patterns — multi-stage Docker with `uv sync --frozen`, and GitHub Actions with the official setup-uv action — give you reproducible, fast builds with almost no boilerplate.

**Outline**:
- **Why `uv.lock` matters in CI**: deterministic resolution, hash-verified downloads, fails closed if the lockfile drifts. Contrast with `pip install -r requirements.txt` where transitive deps can change between runs.
- **The Docker pattern**: multi-stage build. Stage 1 (`uv` image) installs deps to a `.venv/` based on `pyproject.toml` + `uv.lock` only — the `COPY` of those two files is its own layer for cache hits. Stage 2 (`python:slim`) copies `.venv/` + app code. Show the full Dockerfile.
- **Cache mounts**: `RUN --mount=type=cache,target=/root/.cache/uv` keeps the global hardlink cache hot across builds. Cite the Astral docs example.
- **`uv sync --frozen` vs `uv sync --locked`**: when each fails, why you want `--frozen` in Docker and `--locked` in CI verification jobs.
- **GitHub Actions**: `astral-sh/setup-uv@v6` action — installs uv, caches the global cache, exposes `uv` on PATH. Show a minimal `.github/workflows/test.yml` running `uv sync --locked` + `uv run pytest`. ~15 lines total.
- **Python version in CI**: `.python-version` + `uv python install` in the workflow vs the action's `python-version` input. When to use each.
- **`uv export` for legacy CI**: if your CI grandfather-clauses `pip install -r requirements.txt`, generate `requirements.txt` from `uv.lock` as a build artifact. Brief callback to Post 4's hybrid pattern.
- **Gotchas**: lockfile in the Docker context, `.dockerignore` for `.venv/`, the difference between `uv sync` and `uv pip install -e .` for editable installs in dev containers.

**Closer**: series wrap — what's next? Tease the *Python Monorepos in 2026* series as the natural sequel for readers ready to scale uv past a single package.

## Drafting checklist (for each fan-out session)

When you take a section above and draft the post, do these in order:

1. Verify the slug isn't already taken under `src/content/posts/` (grep).
2. Pick a publish `date` consistent with the series order (one week apart from the previous post; check existing `src/content/posts/2026-*.md` for the most recent date and continue from there).
3. Write the markdown to `src/content/posts/<date>-<slug>.md` with full frontmatter per the series-wide constraints above.
4. Generate a Codex prompt for `cover.png` (21:9) and `thumb.png` (16:9) — paste it into the post as an HTML comment at the bottom (do not generate the images — that's a separate Codex session).
5. Add the cover/thumb paths to frontmatter pointing at `public/images/blog/uv-2026/<slug>/cover.png` and `.../thumb.png` even though the files don't exist yet — they'll be generated and committed alongside.
6. Run `pnpm check` from the repo root to validate frontmatter against `src/content.config.ts`.
7. Commit with message: `Add uv-2026 series post N: <title>`.

## Out of scope for this brief

- Series 2 (`python-monorepo-2026`) and series 3 (`ai-podcast-index`) have their own briefs — do not start drafting their posts from this file.
- Image generation — separate Codex session, references the prompt comment in each post.
- Cover image for the series itself (`public/images/blog/series/uv-2026.png`) — generated in the same Codex session as the per-post images.
