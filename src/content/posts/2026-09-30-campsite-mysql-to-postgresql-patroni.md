---
title: "From MySQL to PostgreSQL with Patroni HA: A Migration in Progress"
date: "2026-09-30T18:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "Campsite", "PostgreSQL", "MySQL", "Patroni", "etcd", "Rails"]
excerpt: "Campsite is moving from MySQL to PostgreSQL. The test suite now passes on both, a small Ruby copier replaced pgloader, and a Patroni cluster is live across three hosts. Production still runs on MySQL, and here's why."
series: campsite-for-agents
seriesOrder: 4
cover: "/images/blog/campsite-for-agents/campsite-mysql-to-postgresql-patroni/cover.png"
thumb: "/images/blog/campsite-for-agents/campsite-mysql-to-postgresql-patroni/thumb.png"
use_featured_image: false
draft: false
comments: true
share: true
---

> **Work in progress.** This describes the migration as of 26 September 2026. Campsite still runs on MySQL in production. The PostgreSQL cluster is live but holds no production data, backups and failover drills aren't done, and the cutover is at least a month away. I'll update this post as it moves.

The first real project after I ended Campsite's patch-only stewardship on 23 September was the database. Campsite has run on MySQL since its days on PlanetScale. I'm moving it to PostgreSQL.

[The deployment walkthrough describes the Kamal release process and its safeguards for migrations, workers and immutable images](/homelab/deploying-campsite-with-kamal/). The database move is a change big enough to test that process: what MySQL was quietly doing for the application, how I got the test suite passing on both databases, why I dropped pgloader, and the high-availability cluster that is now running across three hosts.

## Why move at all?

The dataset is tiny. At the last release: 46 users, 768 posts and 5,230 messages, about 19.7 MB as a compressed dump. Size isn't the reason. Lock-in is.

The application depended on MySQL in three ways, only one of which was visible in the code:

1. **Collation.** All 95 tables use `utf8mb4_0900_ai_ci`, which is case- and accent-insensitive. Look up `Alex@Example.com` and you'll find `alex@example.com`. Nothing in the Ruby code asks for that. The database just does it.
2. **Sort order.** MySQL sorts NULLs first in ascending order. PostgreSQL sorts them last. Cursor pagination relied on MySQL's behaviour without saying so.
3. **MySQL-only SQL.** About eleven call sites used functions like `CONVERT_TZ`, `DAYOFWEEK`, `IFNULL`, `IF`, `GROUP_CONCAT`, `JSON_ARRAYAGG`, `JSON_OVERLAPS`, `JSON_CONTAINS_PATH` and `TIMESTAMPDIFF`.

The third one is easy to grep for. The first two are what I mean by "hidden": switch the database, and logins, list order and pagination could change without a single error.

PostgreSQL gives me things I want: schema changes that roll back inside a transaction if a migration fails, a mature high-availability story with Patroni, and point-in-time recovery. It also opens the option of testing PostgreSQL's own full-text search as a replacement for the separate Elasticsearch VM. That's a separate decision for later.

The rule for the whole migration: **no user-facing behaviour changes.** If anything looks different after cutover (who can log in with which email, the order of a list, how pages paginate), that's a bug.

The plan is an [OpenSpec](https://github.com/Fission-AI/OpenSpec) change with seven phases. Here's where each stands.

## Phase 1: make the code portable, on MySQL

The first phase added no new dependency. It rewrote every MySQL-only query to be adapter-aware and ran it on MySQL. It also made the hidden behaviours explicit:

- identity lookups that bypass Devise (the OAuth sign-in path, invitations, email bounces) now normalise case themselves, so they don't depend on the collation;
- cursor pagination states its NULL ordering outright instead of inheriting the engine default;
- a bulk upsert now names the unique key it relies on.

The plan paired each rewrite with a test that pins the current behaviour first, such as a notification schedule in a non-UTC time zone across a day boundary. The full suite ran 4,249 tests with no failures. It merged and shipped in the 24 September release, on MySQL.

Doing this first, on the current database, kept the risky part small. Everything after it lives on a long-lived branch, and `main` keeps releasing to MySQL throughout.

Even so, running the same code against real PostgreSQL found three bugs that MySQL tests couldn't have:

- **An untyped time bind.** A time value was bound into a query without a type. MySQL tolerated it; PostgreSQL didn't.
- **`?` inside jsonb.** PostgreSQL's jsonb "has key" operator is `?`. ActiveRecord read it as a bind placeholder.
- **An array bound as one string.** A list of values reached PostgreSQL as a single string rather than an array.

Each is a one-line fix once you see it. None shows up if you only ever test against the database you're leaving.

## Phase 2: one test suite, two databases

The branch adds the `pg` gem alongside the MySQL adapters and a PostgreSQL 18 test configuration selected by an environment variable. The goal was the full Minitest suite passing on both.

It now does: 4,273 runs on MySQL and 4,273 on PostgreSQL, with no failures on either.

The first PostgreSQL run looked much worse than it was. The biggest single bucket of errors, 414 of them, came from one missing test-only gem: `pg_query`, which the N+1 query detector needs to parse PostgreSQL SQL. Adding it cleared all 414 at once. The lesson I took: group failures by cause before you start fixing them. A wall of red is often a few problems repeated many times.

## Phase 4: a small copier instead of pgloader

[pgloader](https://pgloader.io/) was the original plan for moving data. It lost in the rehearsal, for two reasons. It couldn't express "skip the generated columns", and it crashed during the connection handshake with MySQL 8.4, which always opens with the `caching_sha2_password` authentication method.

I replaced it with a short Ruby copier. It reads each table in primary-key batches from a disposable MySQL restored from a dump, and writes into a schema that Rails itself built, using PostgreSQL's `COPY`. It:

- truncates the target first, resetting identities;
- takes column lists from the PostgreSQL tables and skips generated columns, which PostgreSQL recomputes;
- casts MySQL's `tinyint(1)` to `boolean`, loads JSON text into `jsonb`, and keeps microseconds;
- copies the Rails migration bookkeeping tables, so migration history continues;
- sets every sequence to the table's maximum id, so the next insert doesn't collide;
- prints only table names and counts.

Using the MySQL driver directly, not ActiveRecord models, means no callbacks run during the copy.

A separate parity checker compares every table: row count, plus an order-stable checksum of each row's primary key and a canonical text rendering of the row. It normalises the differences that are representation, not data (booleans, JSON key order, datetime precision) and exits non-zero on any mismatch. On synthetic data, all 100 tables matched after a copy, the sequences were reset, and a deliberately tampered row was caught. Its real test is the nightly rehearsal that the shadow run will add.

I also audited the live data for identity values that differ only by case: emails, usernames, organisation slugs, invitations and bounces. On PostgreSQL those columns become `citext`, which keeps case-insensitive matching and unique indexes, so a case-only duplicate would break a unique index. The audit found none. It reads counts only, and I'll run it again just before cutover.

## Phase 5: the Patroni cluster is live

On 26 September a [Patroni](https://patroni.readthedocs.io/) cluster came up across the homelab:

| Member | Where | Role |
|---|---|---|
| `pg-a` | Groot, on talokan | PostgreSQL 18 + Patroni, leader; etcd member |
| `pg-b` | New VM pinned to asgard | PostgreSQL 18 + Patroni, synchronous standby; etcd member |
| witness | Quill, on knowhere | etcd member only |

```text
     talokan                 asgard                  knowhere
 ┌──────────────┐       ┌──────────────┐        ┌──────────────┐
 │ Groot        │       │ pg-b VM      │        │ Quill        │
 │  pg-a leader │══════▶│  sync standby│        │  (apps)      │
 │  etcd        │◀─────▶│  etcd        │◀──────▶│  etcd witness│
 └──────────────┘       └──────────────┘        └──────────────┘
          ═══ streaming replication      ─── etcd quorum
```

The three etcd members sit on three different physical hosts. Patroni only lets a member lead while it can talk to a majority of etcd, so losing any one host can't produce two leaders.

`pg-b` is a small Debian VM: 2 vCPU, 2 GiB of memory and its own 40 GiB data disk. [The infrastructure overview explains the host placement and failure domains behind this choice](/homelab/where-campsite-runs-in-my-homelab/): it is on asgard because talokan had no room, and a standby on the primary's host would not protect against much. The witness was first meant to run on the NAS; I moved it to Quill because Docker on the Synology isn't usable as a Kamal host.

Synchronous mode is on but not strict. A commit waits for the standby while the standby is up. If the standby goes down, the leader keeps serving rather than stopping writes.

Clients will connect with a multi-host libpq URL and `target_session_attrs=read-write`. libpq tries the hosts and picks whichever accepts writes, so there's no proxy or virtual IP to run. After a failover, broken connections raise, Rails reconnects on the next checkout, and Sidekiq retries the jobs that failed.

At the end of the rollout, `patronictl` showed `pg-a` as leader and `pg-b` as a streaming synchronous standby with zero lag, and all three etcd members were healthy. Campsite's own health endpoints returned 200 throughout, and MySQL and Redis on Groot weren't touched.

### Two bugs that only appeared at boot

The image built fine. It failed when it started:

1. **The wrong etcd library.** Patroni's etcd v3 support is built on the Python library Debian ships as `python3-etcd`. I'd installed `python3-etcd3`, an unrelated client. Patroni found no etcd implementation and exited.
2. **The wrong environment variable.** I passed the etcd hosts as `PATRONI_ETCD_HOSTS`. Patroni reads that name natively as the configuration for the *v2* etcd backend, and it overrode the v3 section in my config file. etcd 3.6 has no v2 API, so Patroni waited on it forever. The v3 name is `PATRONI_ETCD3_HOSTS`.

The second one is my favourite kind of bug: the configuration file was correct, and an environment variable I'd added to be helpful silently replaced it.

Verification also caught missing client-authentication (`pg_hba`) rules that would have blocked replication between the members. And there's a follow-up on my list: the image's `postgres` user has the same numeric id as an unrelated monitoring user on Groot, so I'll rebuild with a dedicated id.

## The honest trade-offs

**Database HA isn't application HA.** Redis and Elasticsearch still run single-instance on talokan. If talokan dies, PostgreSQL can fail over to asgard, and Campsite is still down because its cache, queues and search went with talokan. The cluster protects the data and shortens one kind of recovery. It doesn't keep the app up on its own. I've accepted that for this change and will revisit it separately.

**Three new moving parts.** Patroni, etcd and (soon) pgBackRest are each things to monitor, upgrade and understand at 2 a.m. For a deployment this size, that's a real cost. The trade is worth it to me for recovery that I've tested rather than recovery I hope works.

**Accent sensitivity changes, deliberately.** `citext` keeps case-insensitive matching but not accent-insensitive matching. Usernames and slugs are ASCII-only by validation, and email addresses compare by case, so I accepted that difference rather than using a more surprising collation.

**Targets aren't measurements.** The design derives targets of failover within 60 seconds and switchover within 30 from Patroni's timing settings. I haven't drilled either yet, so those are targets, not results.

## What's next

In order:

1. **Backups and point-in-time recovery.** pgBackRest with continuous WAL archiving, plus a daily logical dump, with a restore rehearsal before I count any of it. WAL archiving is off until then.
2. **Failover drills.** A planned switchover, a hard power-off of the leader VM, a stopped standby, and losing an etcd member, with timings written down.
3. **A shadow run of at least 30 days.** A separate PostgreSQL copy of the API and web app, refreshed nightly from the MySQL backups through the copier and the parity checker, and redeployed on every `main` release. It has no worker, sends no mail, and writes to its own search indices and storage prefix, so it can't affect real users.
4. **An offline cutover.** Stop the writers, take a final dump, copy, check parity, switch the database URL, check again. If anything fails, redeploy the last MySQL release. The untouched MySQL volume stays available as a rollback for at least 30 days.

The nightly shadow refresh is the part I'm most looking forward to. It turns every night into a full rehearsal of the cutover, on real data.

[A separate engineering account describes how coding agents divided this work into implementation lanes, and how I checked each result before merge](/homelab/letting-coding-agents-build-campsite/).

<!--
# Image prompt

Codex prompt for cover.png (21:9) and thumb.png (16:9), saved to
public/images/blog/campsite-for-agents/campsite-mysql-to-postgresql-patroni/cover.png
and thumb.png.

Editorial illustration, no embedded text, no logos, no watermarks. A careful
river crossing at first light: on the left bank, an old wooden storehouse; on
the right bank, a new stone storehouse still partly under construction with
scaffolding. Between them, a line of small identical crates travels across a
narrow footbridge, each crate checked by a small lantern at a checkpoint midway.
On a low hill above the new storehouse, three small watchtowers stand on three
separate rocky outcrops, connected by thin glowing lines, suggesting a quorum
keeping watch. Cool slate and blue palette with a single warm amber accent on
the lanterns and the watchtower links. Calm, geometric, slightly isometric
composition with generous negative space. Matte finish, restrained palette, no
neon. Aspect ratios: 21:9 hero crop and 16:9 card crop of the same composition.
-->
