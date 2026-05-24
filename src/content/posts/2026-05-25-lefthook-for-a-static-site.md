---
title: "Lefthook for a Static Site: Four Hooks That Earn Their Keep"
date: "2026-05-25T14:00:00+05:45"
category: ["Technical Notes"]
categories: ["technical-notes"]
directory: technical-notes
excerpt: "A static Astro site doesn't need Husky-grade ceremony. But it does have four failure modes worth catching before they reach `main`: a broken type, a leaked key, a post without a `directory:` field, and a build that silently breaks production. Here's the lefthook.yml I landed on, and why each hook is there."
cover: "/images/blog/technical-notes/lefthook-for-a-static-site.png"
thumb: "/images/blog/technical-notes/lefthook-for-a-static-site.png"
last_modified_at: "2026-05-25T14:00:00+05:45"
use_featured_image: true
---

For most of this site's life I had no git hooks at all.

That was fine until it wasn't. Three things happened in the same month:

1. I shipped a post that routed to `/the-slug/` instead of `/technical-notes/the-slug/` because I forgot one line of frontmatter, and only noticed when a friend asked why the canonical URL looked wrong.
2. I pushed a commit where `astro check` would have caught a typed prop mismatch, but `pnpm build` happened to succeed locally on a cached run.
3. I almost — *almost* — committed a `.env` with a real ElevenLabs key in it.

Each of those was a five-second mistake. None of them needed a CI pipeline to catch. They needed something between *me typing `git commit`* and *the commit landing*. That's what git hooks are for, and that's what I'd been quietly avoiding for two years because the only tool I knew was Husky and Husky always felt like a lot of ceremony for a personal site.

Then I tried [lefthook](https://github.com/evilmartians/lefthook).

## What lefthook is, in one paragraph

Lefthook is a git hooks manager written in Go by Evil Martians. You declare your hooks in a single `lefthook.yml` at the repo root, install once, and from then on every `git commit` and `git push` runs the commands you listed — in parallel, scoped to globs you choose, against staged files. There's no Node dependency (it's a single binary you can install with `mise use -g lefthook` or `brew install lefthook`), no `.husky/` folder full of shell scripts, no `package.json` "prepare" dance. The config is the documentation.

I'd describe its appeal as: **the smallest config that still does the obvious right thing.**

## The four failure modes worth a hook

Before writing any YAML I sat down and listed what could plausibly go wrong on this repo between "edit a file" and "push to `main`." A static Astro 6.3 site, deployed as plain HTML, has a small surface area — most of the categories you'd hook on a Rails or Django app simply don't apply. What's left:

- **A broken TypeScript prop or import.** Astro's editor integration catches most of this, but I sometimes commit from a terminal session where the LSP isn't running. `astro check` is the source of truth.
- **A secret in a file I didn't mean to stage.** `.env`, `credentials.json`, anything under `podcast/` (which holds API-key-shaped strings for ElevenLabs and Resemble), the data modules under `src/data/` where I once typo-pasted a token into a "site" config.
- **A post without a `directory:` frontmatter field.** This is the only mistake on the list that's specific to *this* repo. The content schema treats `directory` as optional, but the URL builder uses it to construct `/<category>/<slug>/`. Forget it and the post quietly routes to `/<slug>/` instead, breaking the URL shape that the rest of the site (and Google's index) expects.
- **A build that fails on a clean checkout but succeeds in my warm dev server.** Rare, but the consequence is that `main` has a broken build for however long it takes me to notice. A pre-push `pnpm build` is the cheapest possible insurance.

Four hooks. That's the whole list.

## The file

```yaml
pre-commit:
  parallel: true
  commands:
    astro-check:
      glob: "src/**/*.{astro,ts,tsx,mts}"
      run: pnpm exec astro check

    gitleaks:
      glob: "{.env*,**/credentials*,**/*.pem,**/*.key,src/data/**,podcast/**}"
      run: gitleaks detect --staged --no-banner --redact --verbose

    post-frontmatter:
      glob: "src/content/posts/**/*.{md,mdx}"
      run: |
        fail=0
        for f in {staged_files}; do
          if ! rg -q '^directory:\s*\S' "$f"; then
            echo "✗ $f is missing a non-empty 'directory:' frontmatter field."
            echo "  Without it the post routes to /<slug>/ instead of /<category>/<slug>/."
            fail=1
          fi
        done
        exit $fail

pre-push:
  commands:
    build:
      run: pnpm build
```

Three things I want to call out, because they're the parts I'd have gotten wrong if I'd written this in a hurry:

**`glob:` is doing real work.** Without it, `astro check` would run on every commit no matter what changed — slow enough that I'd start using `--no-verify` within a week, which defeats the entire point. With the glob, the hook is skipped on commits that touch only markdown, only images, or only `lefthook.yml` itself. A hook you keep is worth more than a hook you bypass.

**`parallel: true` matters more than it looks.** `astro check` and `gitleaks` are independent — they read different files and don't share state. Running them serially adds two to three seconds to every commit; in parallel they finish in the time of the slower one. On a personal site that latency is the difference between *the hook fades into the background* and *the hook becomes the thing I curse at*.

**The frontmatter check is repo-specific, and that's fine.** A general-purpose linter wouldn't know about this site's URL convention. A hook *can* — it's allowed to encode the one rule I keep forgetting. The body is just `rg` (ripgrep) against each staged post, looking for a non-empty `directory:` line. It's not a markdown parser. It's not robust to comments-inside-frontmatter or YAML edge cases. It's six lines of shell that catch the exact mistake I made in October.

## What I deliberately left out

The temptation, every time I sit down to write a config like this, is to add hooks "while I'm here." I want to flag a few things I considered and didn't add:

- **`prettier --check` on staged files.** I format on save in the editor. A hook would catch nothing and slow down every commit. If I were on a team I'd add it; solo, it's noise.
- **A spell-checker on blog posts.** Tried it. Too many false positives on names, code identifiers, and Nepali words. The signal/noise wasn't worth the time it cost me to read the output.
- **Commit-message linting (Conventional Commits).** I don't release this site; the changelog is `git log`. Forcing `feat:` and `fix:` prefixes on a personal repo is cosplay.
- **Running the full Pagefind index in `pre-push`.** Pagefind runs as part of `pnpm build` already. Re-running it would double the push latency for no extra coverage.

The pattern, written out: **add a hook only when you can point at a specific past mistake it would have caught.** Everything else is theater.

## Installing it

```sh
# pick one
mise use -g lefthook
brew install lefthook

# then, in the repo:
pnpm add -D lefthook
pnpm exec lefthook install
```

`lefthook install` writes the actual `.git/hooks/pre-commit` and `pre-push` files that delegate to lefthook. From then on, every clone of the repo only needs `pnpm install && pnpm exec lefthook install` to be wired up. You can dry-run a hook without committing — `pnpm exec lefthook run pre-commit` — which is the single most useful command for debugging the config without making a junk commit.

## The part where I admit it's small

This is a static personal site. The blast radius of a bad commit is "I push again in three minutes." Nothing here is load-bearing the way a `lefthook.yml` in a payments codebase is load-bearing.

But the point of these four hooks isn't to defend against catastrophe. It's to stop a class of mistake I was making *every few weeks*, with no upstream signal until it was already on the live site. Lefthook turned out to be the right shape for that: small enough that the config fits on one screen, fast enough that I haven't reached for `--no-verify` once, scoped tightly enough that 80% of my commits skip 80% of the hooks.

I should have done this two years ago. The reason I didn't was that the last time I'd set up git hooks was with Husky in 2019, and I remembered it as a chore. Lefthook isn't a chore. It's a config file.

That's the whole post.
