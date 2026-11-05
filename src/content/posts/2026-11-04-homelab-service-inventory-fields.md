---
title: "What Belongs in a Homelab Service Inventory"
date: "2026-11-04T10:30:00+05:45"
directory: "homelab"
category: ["Homelab"]
categories: ["technical"]
excerpt: "Record the facts needed to find, change, and recover a service without turning the inventory into a diary."
tags: ["homelab", "practical guide"]
use_featured_image: true
cover: "/images/blog/editorial/homelab-restore-test-checklist/cover.png"
thumb: "/images/blog/editorial/homelab-restore-test-checklist/thumb.png"
draft: true
---

A list of virtual machines tells you where operating systems run. It does not necessarily tell you where an application keeps its data, how it is deployed, or what will break when its host disappears. A useful service inventory answers the questions that come up during a change.

Start with the service rather than the machine. Give it a stable name, a short purpose, and an owner. In a personal lab, the owner may always be you; the field still distinguishes your application from a shared service someone else operates.

## Record the operational path

For each service, record the user-facing address, the host or guest that runs it, its deployment source, and the command or runbook used to inspect it. Keep those relationships explicit. A repository path is not a deployment location, and a DNS name is not proof of where a process currently runs.

Record the data separately: database identity, uploaded files, attached volumes, and any external object store. Avoid credentials. Point to the mechanism that supplies a secret, not its value.

## Add the recovery questions

A recovery section needs the backup source, the location of the restore procedure, and the last verified scope. If only the database has been restored in a test, say exactly that. Do not let a green backup job imply that uploaded files or identity integrations were covered.

Include dependencies that affect a user's first successful action. For example, an application may start while its search service is unavailable. That matters if the first page relies on search.

## Use a small record

| Field | Useful answer |
| --- | --- |
| Service | Stable identifier and purpose |
| Runs on | Current verified placement |
| Entry point | User-facing address |
| Deployment | Repository and runbook |
| Persistent data | Stores and volume identities |
| Dependencies | Required services and external systems |
| Recovery | Procedure and verified scope |
| Verification | When and how the record was checked |

## Keep uncertainty visible

An unknown value is better than an inferred one. Mark placement unverified if it came from an old diagram. When you move a guest, update the placement while retaining the service identity. When a service is retired, remove it from the active inventory after checking its dependents.

The inventory should describe what exists now. Put the story of each migration in version history or an incident record. During a failure, the most useful document is the one that gets you to the correct machine, data, and recovery procedure without interpretation.
