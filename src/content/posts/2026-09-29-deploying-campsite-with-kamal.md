---
title: "Deploying Campsite with Kamal: Split Configs, Exact-Commit Images and a Secrets Preflight"
date: "2026-09-29T18:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "Campsite", "Kamal", "Docker", "Forgejo", "deployment"]
excerpt: "Six Kamal configs for six runtimes, a background worker that can't be started by accident, images tagged with the exact commit they came from, and a secrets check that never prints a value."
series: campsite-for-agents
seriesOrder: 3
cover: "/images/blog/campsite-for-agents/deploying-campsite-with-kamal/cover.png"
thumb: "/images/blog/campsite-for-agents/deploying-campsite-with-kamal/thumb.png"
use_featured_image: false
draft: false
comments: true
share: true
---

[Part 2](/homelab/where-campsite-runs-in-my-homelab/) put Campsite's pieces on three VMs. This part is about how code gets there.

I use [Kamal](https://kamal-deploy.org/) for all of it. There's no second deployment path: no hand-run `docker run`, no script that SSHes in and restarts things. Kamal uses SSH to reach the hosts, but SSH is its transport, not a procedure of its own. Commands run directly on a host are reserved for provisioning and break-glass recovery, and each one is a separately approved change.

The interesting parts are the choices around Kamal rather than Kamal itself.

## One config per runtime

Kamal deploys one application image per configuration file. Campsite has six runtimes, so it has six configs:

| Config | Runtime |
|---|---|
| `deploy.campsite-api.yml` | Rails API and auth, plus the MySQL, Redis and Elasticsearch accessory declarations |
| `deploy.campsite-worker.yml` | Sidekiq only |
| `deploy.campsite-web-home.yml` | The private Next.js web app |
| `deploy.campsite-sync.yml` | Collaborative-editing sync server |
| `deploy.campsite-styled-text.yml` | Rich-text conversion service |
| `deploy.campsite-html-to-image.yml` | HTML-to-image renderer |

They share host, registry, secret and network conventions, so they read like one system. But each can be deployed, rolled back and reasoned about on its own. When a release only touches the API, I deploy the API and the worker, and leave the other four alone. The 24 September release did exactly that.

Stateful services (MySQL, Redis, Elasticsearch) are Kamal *accessories*, declared alongside the API. Accessory commands and application deploys are scoped to their own hosts. I learned to keep that explicit: an unscoped command that resolves the wrong host isn't something I'd accept as evidence of anything.

## Writer custody: the worker deploys separately

The most deliberate split is between the API and the worker. Both run the same Rails image. They don't share a config.

That means deploying the API **can never start a queue consumer**. The only way to start Sidekiq is to deploy `deploy.campsite-worker.yml`, on purpose.

I call this writer custody. The worker sends mail, delivers webhooks, and does anything else with side effects outside the database. When I moved Campsite from its old VM to the current three, both stacks existed for a while, each with its own copy of the data. Only one of them ever had a running worker: the old stack's writers were stopped before the new worker started. The same rule earns its keep in normal releases, because I choose when the new worker starts, after the API has migrated and is healthy.

The scheduler inside the worker goes one step further. It's disabled by default, and turning it on is a separate promotion step, so scheduled jobs can't fire twice from two places.

## Migrations run before the API is healthy

The API role's start command runs `bin/rails db:migrate` and only starts Puma when the migration succeeds. Kamal won't route traffic to a container that hasn't passed its health check.

So a failed migration leaves the previous, healthy API serving. The schema is always advanced by the exact image being released, not by a developer laptop or a separate job.

Rolling the *code* back is one `kamal rollback` per runtime, because the previous immutable image stays available. Rolling the *schema* back is different: a newer release may already have written data that the old schema can't hold. That stays an explicit decision I make, not something a script does for me.

## Images built remotely, tagged with the exact commit

My laptop doesn't build production images. A builder VM in the lab does every linux/amd64 build and pushes to a private registry that only the lab machines that need it can reach. The hosts pull from there.

Base images and Elasticsearch are pinned to manifest digests rather than tags. Updating a base image means refreshing its digest and rebuilding. It can't happen silently because a tag on Docker Hub moved.

Every application image is tagged with the full git SHA it was built from. That sounds obvious. I got it wrong anyway.

Kamal appends `_uncommitted` to the tag when you deploy from a working tree with uncommitted changes. Before 24 September, the running API and worker were `…_uncommitted_…` images. They worked. But their tag no longer told me exactly what code was inside, which defeats the point of tagging.

The fix was procedural, not technical. Releases now deploy from a **clean, detached worktree at the merged commit** on the review server:

```sh
git fetch forgejo
git worktree add --detach ../campsite-release <merged-sha>
cd ../campsite-release
# preflight, then deploy the runtimes this release touches
```

The 24 September release deployed the API and worker this way, from the merged revision, with no `_uncommitted` suffix. The older images are still in the registry, so `kamal rollback` can still reach them. If you work with [git worktrees](/ai/git-worktrees-branches-as-places/) already, this costs nothing: a release is just another place to check out a commit.

## A secrets preflight that never prints a value

Kamal reads secrets through a value-free bridge file: it lists which environment variables each config needs, and the values come from an encrypted local profile loaded at deploy time. No value belongs in a deploy YAML, an image layer, git history or command output.

Before rendering, building or deploying any Campsite config, a preflight runs:

```sh
mise -E deploy exec -- script/check-campsite-kamal-secrets
```

It derives the required secret *names* from every `deploy.campsite-*.yml` file. It checks that each config points at the dedicated bridge file and that the bridge only contains environment references, not values. Then it reports each name as present or missing and exits non-zero if anything is missing. It never prints a value.

A narrower mode checks only the secrets a single image *build* needs. That exists so a build doesn't require runtime credentials it has no business touching. It doesn't count as deploy evidence: the full check still gates every application or accessory change.

By design, credentials are also grouped by what they're for (the backup group belongs to the backup setup, which isn't running yet):

- **runtime**: least privilege for normal reads and writes;
- **migration**: temporary source-read and destination-write access, revoked after the rollback window;
- **backup**: can append backups but isn't the runtime credential, so the application can't delete backup history;
- **operator**: provisioning and restore authority, never injected into an application.

## Review on Forgejo

Code review happens on a Forgejo instance on the NAS, not on GitHub. The upstream GitHub remote is read-only for me by rule: nothing gets pushed there.

Pull requests are opened with Forgejo's AGit flow. Instead of pushing a branch and then opening a PR in the web UI, you push to a special ref:

```sh
git push forgejo HEAD:refs/for/main
```

Forgejo turns that into a pull request against `main`. It suits agent-driven work well: a lane can open a PR with one git command and no API token for the forge. There's no CI on this repository, so I run the relevant tests, lint and builds locally, and the PR is where the evidence gets recorded.

## What a release checks

The 24 September release is typical. After the preflight passed and the API and worker were deployed:

- the API and auth health endpoints returned 200;
- Sidekiq showed two processes and empty queues;
- search matched the database: 768 of 768 posts and 69 of 69 notes, and known-record searches returned the right results.

A few failed mail retries and old dead jobs showed up too. They predated the release and weren't related, but I wrote them down so I wouldn't mistake them for a regression later.

A health endpoint returning 200 isn't the same as a working product, and I've written about [why exit codes aren't evidence](/ai/exit-0-is-not-evidence/). The design lists the synthetic checks that should back each release: the private web page, an authenticated API call, a WebSocket connection, a styled-text conversion, a rendered PNG, an object upload and download, a queued job, and a search. Some of those are covered. An authenticated browser flow, a two-client collaborative edit and a browser upload are still open. Until they pass, I describe the deployment as working with known gaps, not as done.

## What I'd do the same way again

- **One config per runtime.** It makes small releases small.
- **A worker you have to start on purpose.** Accidental side effects are the ones I can't undo.
- **Exact commit tags from a clean worktree.** The tag should answer "what's running?" without a follow-up question.
- **A preflight that checks names, never values.** It's safe to run anywhere, including inside an agent session.

That last point matters for [part 5](/homelab/letting-coding-agents-build-campsite/), where a lot of this work was done by coding agents. Before that, [part 4](/homelab/campsite-mysql-to-postgresql-patroni/) covers the biggest change the new release process has had to carry so far: moving from MySQL to PostgreSQL.

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
