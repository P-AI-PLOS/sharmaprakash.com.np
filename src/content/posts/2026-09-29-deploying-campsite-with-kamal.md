---
title: "Deploying Campsite with Kamal: Split Configs, Exact-Commit Images and a Secrets Preflight"
date: "2026-09-29T18:00:00+05:45"
last_modified_at: "2026-11-16T21:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "Campsite", "Kamal", "Docker", "Forgejo", "deployment"]
excerpt: "One Kamal config per runtime, a background worker that can't be started by accident, images tagged with the exact commit they came from, and a secrets check that never prints a value."
series: campsite-for-agents
seriesOrder: 3
cover: "/images/blog/campsite-for-agents/deploying-campsite-with-kamal/cover.png"
thumb: "/images/blog/campsite-for-agents/deploying-campsite-with-kamal/thumb.png"
use_featured_image: false
draft: false
comments: true
share: true
---

[Part 2 covers where Campsite runs](/homelab/where-campsite-runs-in-my-homelab/). This part covers how code gets there.

Everything goes through [Kamal](https://kamal-deploy.org/). There's no second path: no hand-run `docker run`, no script that SSHes in and restarts things. Commands run directly on a host are for provisioning and break-glass recovery only.

The useful parts are the choices around Kamal.

## One config per runtime

Kamal deploys one application image per config file, so each Campsite runtime has its own: API, worker, web, sync, styled-text and HTML-to-image. They share host, registry, secret and network conventions, so they read as one system. But each deploys and rolls back on its own. A release that only touches the API deploys the API and worker and leaves the rest alone.

Stateful services, including the PostgreSQL members, are Kamal *accessories*. Accessory commands are scoped to explicit hosts. An unscoped command that resolves the wrong host isn't evidence of anything.

## The worker deploys separately

The API and the worker run the same Rails image but don't share a config. Deploying the API **can never start a queue consumer**. Sidekiq only starts when its own config is deployed, on purpose.

The worker sends mail, delivers webhooks and does anything else with side effects outside the database. Keeping it separate means I choose when it starts: after the API has migrated and is healthy, and never on two stacks at once during a move. The scheduler inside the worker is off by default, so scheduled jobs can't fire from two places.

## Migrations gate the API

The API's start command runs `bin/rails db:migrate` and only starts Puma if it succeeds. Kamal won't route traffic to a container that fails its health check, so a failed migration leaves the previous API serving.

The schema is always advanced by the exact image being released. Rolling code back is one `kamal rollback` per runtime. Rolling schema back is a separate decision, because a newer release may have written data the old schema can't hold.

## Exact-commit images

My laptop doesn't build production images. A builder VM does every linux/amd64 build and pushes to a private registry. Base images are pinned to digests, so a moved tag upstream can't change a build silently.

Every image is tagged with the full git SHA. Kamal appends `_uncommitted` when you deploy from a dirty working tree, and such a tag no longer says what code is inside. So releases deploy from a **clean, detached worktree at the merged commit**:

```sh
git fetch forgejo
git worktree add --detach ../campsite-release <merged-sha>
cd ../campsite-release
# preflight, then deploy the runtimes this release touches
```

If you already use [git worktrees](/ai/git-worktrees-branches-as-places/), this costs nothing: a release is just another place to check out a commit.

## A secrets preflight that never prints a value

Kamal reads secrets through a bridge file that lists environment references only. The values come from an encrypted local profile at deploy time. No value belongs in a deploy YAML, an image layer, git history or command output.

Before any build or deploy, a preflight runs:

```sh
mise -E deploy exec -- script/check-campsite-kamal-secrets
```

It derives the required secret *names* from every Campsite deploy config, checks that each config uses the bridge and that the bridge holds no values, then reports each name as present or missing. It exits non-zero on anything missing and never prints a value, so it's safe to run inside an agent session.

A narrower mode checks only what an image build needs, so builds don't touch runtime credentials. Credentials are grouped by purpose: runtime (least privilege), migration (temporary), backup (append-only, not usable by the app) and operator (never injected into an application).

## Review on Forgejo

Review happens on a self-hosted Forgejo, not GitHub. The upstream GitHub remote is read-only for me. Pull requests use Forgejo's AGit flow:

```sh
git push forgejo HEAD:refs/for/main
```

That opens a PR against `main` with one git command and no forge API token, which suits agent work. There's no CI on this repository, so tests, lint and builds run locally and the PR records the evidence.

## What a release checks

After deploy: API and auth health endpoints return 200, Sidekiq shows its processes with sane queues, and search document counts match the database. Pre-existing failed jobs get written down so they aren't mistaken for regressions.

A 200 isn't a working product, as I've argued in [exit 0 is not evidence](/ai/exit-0-is-not-evidence/). Health checks are the floor; real flows such as signing in, uploading and searching are the proof.

## What I'd keep

- **One config per runtime.** Small releases stay small.
- **A worker you start on purpose.** Accidental side effects are the ones you can't undo.
- **Exact commit tags from a clean worktree.** The tag answers "what's running?"
- **A preflight that checks names, never values.**

Next: [moving the database from MySQL to PostgreSQL with Patroni](/homelab/campsite-mysql-to-postgresql-patroni/).

<!--
# Image prompt

Codex prompt for cover.png (21:9) and thumb.png (16:9), saved to
public/images/blog/campsite-for-agents/deploying-campsite-with-kamal/cover.png
and thumb.png.

Editorial illustration, no embedded text, no logos, no watermarks. A small
mountain supply line at dawn: six separate cable-car gondolas, each a distinct
simple shape, travel on parallel cables from a workshop on the left (a builder
shed with a soft glow) across a valley to a hilltop camp on the right. One
gondola stands apart on its own cable with a small closed padlock-shaped gate
at its station, suggesting a worker that must be released deliberately. Each
gondola carries a single sealed crate stamped with an abstract unique pattern
(no characters), suggesting exact, immutable images. Cool slate and blue
palette with a single warm amber accent on the moving gondolas. Calm,
geometric, slightly isometric composition with generous negative space. Matte
finish, restrained palette, no neon. Aspect ratios: 21:9 hero crop and 16:9 card
crop of the same composition.
-->
