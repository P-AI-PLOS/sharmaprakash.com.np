---
title: "The PostgreSQL Spike That Found the Work"
date: "2026-09-29T09:25:00+05:45"
directory: engineering
category: ["Engineering"]
categories: ["technical"]
excerpt: "A database adapter spike is valuable when it turns an intimidating migration into a measured inventory of incompatibilities and tests."
tags: ["PostgreSQL", "MySQL", "Rails", "database migration", "testing"]
draft: false
---

The first useful PostgreSQL migration result was not a green test suite. It was a list of exactly where the application depended on MySQL behavior.

We started with an unchanged MySQL baseline: 4,226 tests, 13,814 assertions, and no failures, errors, or skips. Then we built a PostgreSQL schema and ran the existing suite serially to learn what broke. The run completed with 4,226 tests, 10,091 assertions, 7 failures, and 758 errors.

That is not a PostgreSQL port. It is a compatibility inventory.

## Preserve the old path while probing the new one

The spike generated a separate PostgreSQL schema instead of rewriting the MySQL schema in place. That let the original adapter remain the known-good baseline while the team explored JSON columns, generated columns, case-insensitive text, and identity differences.

The SQL review found several families of incompatibility:

- null-safe equality and inequality operators;
- date and time-zone functions;
- JSON key and array predicates;
- grouped string and JSON aggregation;
- boolean and timestamp bind behavior;
- generated columns and database-specific schema options.

Some targeted fixes were implemented with adapter-specific branches that preserved the MySQL form. Each change needed tests on both adapters. Otherwise a PostgreSQL fix could quietly change the existing production path.

## Why serial execution helped

Parallel test workers failed in the PostgreSQL connection setup before producing a useful report. Running the suite with one worker took longer but produced a stable inventory. For an investigation, a complete and interpretable failure report is more valuable than a faster run that obscures the source of failure.

The spike also caught environment issues: the right Ruby had to come from mise, a local search service needed to be available, and credentials had to stay out of the test process. Those details belong in the reproduction notes because they determine whether another engineer can reproduce the result.

## Measure parity, not just test completion

For a later data-copy experiment, the team used a direct Ruby copier and compared rows across 100 tables, then checked 97 sequences. The checker normalized adapter representations such as JSON and booleans, and reported table-level mismatch names without printing row contents.

That is a different question from whether the Rails suite passes. A migration needs both application behavior and data parity. A test suite can miss rows that copied incorrectly; a row comparison cannot prove that every query behaves the same.

## A spike should produce a decision surface

The migration plan became clearer once the work was grouped into:

1. Schema features that differ between engines.
2. Raw SQL that needs adapter-specific treatment.
3. Tests that pin the intended behavior on both databases.
4. Data-copy and sequence checks.
5. Remaining acceptance work that cannot be claimed from a local test.

At the end of the spike, the PostgreSQL suite still had hundreds of errors. The value was that those errors were no longer an abstract warning. They were a bounded set of compatibility questions to resolve before a cutover.

The right migration report does not hide red. It makes red useful. [The broader MySQL-to-PostgreSQL account follows how that initial compatibility inventory became dual-adapter test coverage, a validated data copier and a live Patroni cluster](/homelab/campsite-mysql-to-postgresql-patroni/).
