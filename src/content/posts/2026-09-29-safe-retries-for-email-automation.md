---
title: "Safe Retries for Email Automation"
date: "2026-09-29T09:20:00+05:45"
directory: engineering
category: ["Engineering"]
categories: ["technical"]
excerpt: "An engineering pattern for preventing duplicate drafts when a mail provider may have completed a request but the application lost the response."
tags: ["email", "distributed systems", "idempotency", "retries", "PostgreSQL"]
draft: false
---

Consider an email assistant that creates a reply draft through a mail provider. The provider accepts the request, creates the draft, and then the network drops before the application receives the response.

The application sees a timeout. Did the provider create a draft, or did the request fail before it arrived?

If the assistant retries by creating another draft, the user may find two replies waiting in the same conversation. If it assumes success and records a draft identifier it never received, the saved action is false. This is a small distributed-systems problem hiding inside a familiar product interaction.

## A database transaction cannot cover the provider

The local database and a third-party mail API do not share a transaction. A database rollback cannot undo a draft the provider already created. The system needs to represent the uncertain interval explicitly.

One approach is to claim a durable intent before making the external call:

1. Derive a stable idempotency key for the requested action.
2. Claim that key in the database so concurrent workers cannot both proceed.
3. Ask the provider to create the draft.
4. Record the provider's draft identifier and the completed action.
5. Release the intent as part of the local transaction that stores the result.

If the provider returns a clear failure, the intent can be released so a later attempt may try again. If the process disappears after the provider call, the system may find only the intent row. That state is ambiguous: a draft could exist even though the application never stored its identifier.

## Prefer a visible pause to a duplicate side effect

In the ambiguous case, the safe retry is not another create request. It is to stop and surface that the result is unknown. An operator or a later reconciliation path can inspect the provider state and decide how to proceed.

This trades immediate completion for avoiding an irreversible duplicate. The user can be told that the action needs review, rather than silently receiving two drafts or being told that one definitely exists.

Idempotency keys help only where the receiver honors them. A locally generated key does not magically make an external API idempotent. The local intent protects concurrent attempts and preserves the uncertainty for recovery; provider-side search or reconciliation is a separate capability.

## Serialize work at the conversation boundary

An email conversation also creates a concurrency boundary. Two messages from one thread might be processed in separate jobs at the same time. If each job reads a different partial view, one can act on stale context while the other is already changing the conversation.

A durable lease keyed by mailbox integration and thread can ensure that only one worker performs thread-aware triage at once. The lease needs an owner, an expiry, and a way to check that it is still held immediately before side effects. If a worker loses the lease, it must stop before acting. A stale worker must not release a newer worker's lease.

This does not make all mail processing globally serial. It limits serialization to the conversation whose shared context makes ordering meaningful.

## Test the failure windows

Useful tests are not just “the provider returned a draft.” They include:

- the same action requested twice;
- two workers racing for one idempotency key;
- provider rejection before creating a draft;
- provider success followed by a lost response;
- process failure between provider success and database commit;
- lease expiry or takeover while analysis is running;
- a stale worker attempting a side effect after losing its lease.

The central design rule is simple: distinguish known failure, known success, and unknown outcome. Retries are safe only when the system preserves that distinction.
