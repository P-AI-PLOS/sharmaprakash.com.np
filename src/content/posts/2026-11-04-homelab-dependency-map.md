---
title: "Build a Service Dependency Map You Can Use During an Outage"
date: "2026-11-04T10:30:00+05:45"
directory: "homelab"
category: ["Homelab"]
categories: ["technical"]
excerpt: "Map the path from a user request to persistent data, then distinguish required and optional dependencies."
tags: ["homelab", "practical guide"]
use_featured_image: true
cover: "/images/blog/editorial/homelab-restore-test-checklist/cover.png"
thumb: "/images/blog/editorial/homelab-restore-test-checklist/thumb.png"
draft: true
---

A network diagram and a service dependency map solve different problems. The first can tell you which machines are connected. The second should tell you why a user action fails when a particular service disappears.

Start with one application. A complete map of the estate is less useful than an accurate map of the service you are trying to recover.

## Trace a real request

Write the path from the user-facing address through the proxy to the application. Add the stores it reads and writes. Then add background work and external services only where the action actually depends on them.

Do not infer a dependency merely because two services share a host. Placement is a separate relationship. Two applications may fail together because their host is down without calling each other at all.

## Label the meaning of each connection

Use verbs: routes to, reads from, writes to, enqueues in, or authenticates through. An unlabeled arrow is easy to draw and hard to interpret under pressure.

Distinguish required dependencies from optional ones. If search is unavailable, can users still open a known record? If email delivery is delayed, can the application still save work? These distinctions help you recover useful behavior before every integration is healthy.

## Include identity and data boundaries

A database name alone is not enough when several applications share a server. Record the logical store and ownership boundary without exposing credentials. Do the same for file volumes and object storage.

Mark external dependencies as external. You may be able to diagnose an identity-provider outage without having authority to repair it. The map should make that operational limit visible.

## Verify the drawing

Compare the map against configuration and a representative request or job. Record what remains inferred. A diagram copied from an old deployment plan should not be presented as observed current state.

When placement changes, update the host relationship without renaming the service. When a dependency is removed from the application, remove the arrow after checking the active deployment.

## Use it to choose recovery order

The map should answer: what can start independently, what must be available before a useful action succeeds, and what can wait? It should also reveal shared failure points such as a single storage service supporting several applications.

Keep the map close to the [service inventory](/homelab/homelab-service-inventory-fields/). The inventory locates things; the dependency map explains the relationships that make them useful.
