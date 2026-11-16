---
title: "From MySQL to PostgreSQL with Patroni HA"
date: "2026-09-30T18:00:00+05:45"
last_modified_at: "2026-11-16T21:00:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
tags: ["homelab", "Campsite", "PostgreSQL", "MySQL", "Patroni", "etcd", "Rails"]
excerpt: "Campsite now runs on PostgreSQL with Patroni HA across two hosts. Getting there meant surfacing MySQL behaviour the code never mentioned, running one test suite on both databases, and replacing pgloader with a small Ruby copier."
series: campsite-for-agents
seriesOrder: 4
cover: "/images/blog/campsite-for-agents/campsite-mysql-to-postgresql-patroni/cover.png"
thumb: "/images/blog/campsite-for-agents/campsite-mysql-to-postgresql-patroni/thumb.png"
use_featured_image: false
draft: false
comments: true
share: true
---

Campsite ran on MySQL from its PlanetScale days. It now runs on PostgreSQL, with a two-member Patroni cluster deployed through [the same Kamal process as everything else](/homelab/deploying-campsite-with-kamal/). This part covers what MySQL was quietly doing for the application, how the code was made portable, how the data moved, and how the cluster is built.

## Why move at all?

Not for scale. The database is small and MySQL handled it fine.

The reason was that the database outlived the environment it was chosen for. Its configuration still described a managed primary and replica, and the application relied on MySQL behaviour the Ruby code never stated. Moving while the data is small was the cheapest time to write those rules down and test them. PostgreSQL also brings transactional schema changes and a conventional HA toolchain.

The rule throughout: **no user-facing behaviour changes.** A different login result, list order or page boundary after the move would be a bug.

## What MySQL was doing silently

The application depended on MySQL in three ways, only one of them visible in code:

1. **Collation.** All tables used `utf8mb4_0900_ai_ci`, which is case- and accent-insensitive. Looking up `Alex@Example.com` found `alex@example.com` without the code asking.
2. **NULL ordering.** MySQL sorts NULLs first ascending; PostgreSQL sorts them last. Cursor pagination relied on that.
3. **MySQL-only SQL.** About eleven call sites used functions like `CONVERT_TZ`, `IFNULL`, `GROUP_CONCAT` and `JSON_OVERLAPS`.

The third is easy to grep for. The first two would have changed logins and pagination without a single error.

## Portable code first, on MySQL

The first change added no dependency. It rewrote MySQL-only queries to be adapter-aware and shipped on MySQL. It also made the hidden behaviour explicit: identity lookups outside Devise normalise case themselves, pagination states its NULL ordering, and a bulk upsert names its unique key. Each rewrite came with a test pinning existing behaviour first.

Running that code against real PostgreSQL still found three bugs MySQL couldn't have shown: an untyped time bind, PostgreSQL's jsonb `?` operator being read by ActiveRecord as a placeholder, and an array reaching PostgreSQL as one string. Each was a one-line fix, and none appears if you only test against the database you're leaving.

## One test suite, two databases

The `pg` gem went in alongside the MySQL adapter, with a PostgreSQL 18 test configuration chosen by an environment variable. The full Minitest suite then passed on both databases.

The first PostgreSQL run looked far worse than it was. The largest group of errors, 414 of them, came from one missing test-only gem, `pg_query`, which the N+1 detector needs to parse PostgreSQL SQL. Group failures by cause before fixing them; a wall of red is often a few problems repeated.

## A small copier instead of pgloader

[pgloader](https://pgloader.io/) couldn't skip generated columns and crashed during the handshake with MySQL 8.4's `caching_sha2_password` authentication. A short Ruby copier replaced it. It reads each table in primary-key batches through the MySQL driver (no ActiveRecord callbacks), and writes with `COPY` into a schema Rails built. It skips generated columns, casts `tinyint(1)` to boolean, loads JSON into `jsonb`, keeps microseconds, copies Rails migration bookkeeping and resets every sequence.

A separate parity checker compares every table by row count and an order-stable checksum of canonicalised rows, normalising representation differences such as boolean form and JSON key order. It exits non-zero on any mismatch.

Identity columns became `citext`, which keeps case-insensitive matching and unique indexes but drops accent-insensitivity. Usernames and slugs are ASCII by validation, so that was acceptable. An audit for case-only duplicates found none.

## The Patroni cluster

| Member | VM | Host |
|---|---|---|
| `campsite-pg-a` | Groot | Talokan |
| `campsite-pg-b` | pg-b | Asgard |

Both are PostgreSQL 18 with [Patroni](https://patroni.readthedocs.io/), deployed as Kamal accessories, with etcd as the consensus store and an etcd member on Quill. Patroni only lets a member lead while it can reach a majority of etcd, which prevents two leaders.

Synchronous replication is on but not strict. A commit waits for the standby while it's up; if the standby goes down, the leader keeps accepting writes.

Clients use a multi-host libpq URL with `target_session_attrs=read-write`, so libpq finds the writable member itself. There's no proxy or virtual IP. After a failover, broken connections raise, Rails reconnects on the next checkout and Sidekiq retries failed jobs.

### Two bugs that only appeared at boot

1. **The wrong etcd library.** Patroni's etcd v3 support uses the library Debian ships as `python3-etcd`. I'd installed `python3-etcd3`, an unrelated client, so Patroni found no etcd implementation and exited.
2. **The wrong environment variable.** `PATRONI_ETCD_HOSTS` configures the *v2* backend and silently overrode the v3 section of the config file. etcd 3.6 has no v2 API, so Patroni waited forever. The right name is `PATRONI_ETCD3_HOSTS`.

The config file was correct both times. A helpful extra setting replaced it.

Verification also caught missing `pg_hba` rules that would have blocked replication between members.

## Trade-offs

**Database HA isn't application HA.** Patroni protects the data. It doesn't keep Campsite up if the host running the application goes away.

**More moving parts.** Patroni and etcd are more to monitor, upgrade and understand at 2 a.m. than a single database.

[Part 5 covers how coding agents did much of this work, and how each result was verified](/homelab/letting-coding-agents-build-campsite/).

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
