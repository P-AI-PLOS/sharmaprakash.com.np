---
title: "Restoring a VM Is Not the Same as Restoring a Service"
date: "2026-09-29T09:05:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
excerpt: "A virtual machine can boot while its database, workers, or network assumptions remain broken. An isolated restore needs application-level proof."
tags: ["homelab", "virtualization", "backup", "disaster recovery", "PostgreSQL"]
draft: false
---

When a virtual machine boots after a restore, it is tempting to call the recovery successful. The operating system started. The disks are attached. Perhaps a container is running.

That is a useful checkpoint, but it does not tell us whether the service came back.

During a recent VM move between hypervisors, I used an isolated restore to check more than the imported machine. The test had to show that the data was readable and that the application's background work could continue.

## Isolate before starting anything

The restored guest started with no virtual network interfaces. That prevented duplicate IP use and stopped the recovered copy from contacting production dependencies. Before Docker started, container restart policies were disabled so that workloads could not unexpectedly begin against production-like names or credentials.

The isolation is part of the test. If a restored copy can reach production, a verification step can accidentally become a second writer.

The guest was configured to get past waits for network services that could never become available in the isolated environment. That let the restore test evaluate the guest and its local data without pretending the production network existed.

## Verify the application's data

After the machine came up, the database check was application-aware. We inspected schemas and ran PostgreSQL's `pg_amcheck` against the restored database. A running database process alone would not have shown whether its internal structures were readable.

Then we checked the worker. The first attempt timed out during cold start, which was a useful failure: a stale health marker or process state could not count as fresh evidence. After the worker initialized, a new receipt proved that it had completed a real unit of work against the restored state.

That gave us separate evidence for three layers:

| Layer | Evidence |
| --- | --- |
| Virtual machine | Guest boots in the target hypervisor |
| Data | Schemas are present and database checks complete |
| Application work | A newly created worker receipt is observed |

Each layer answers a different question. None can stand in for the next one.

## Keep recovery material after the test

The restored copy was disposable; the export used to create it was not. We retained the VM export and a small verification record describing the isolated restore. A scheduled export had been configured, but the first scheduled run and a separate off-site copy still needed observation.

That last sentence is important. A configured schedule is not a completed backup. A completed backup job is not an isolated restore. A restore is not proof that every dependent service or external integration works.

## A practical restore definition

For a service backed by a VM, I now treat “restore succeeded” as a set of claims:

1. The correct backup artifact was selected and verified.
2. The guest starts in isolation, without competing for production identity.
3. The database opens and passes the relevant integrity checks.
4. The application starts with the expected schema and local configuration.
5. A fresh background job or other representative action completes.
6. Temporary recovery resources are removed, while the recovery artifact remains available.

There may be more for a particular system: object storage, identity providers, DNS, payment processors, or user-visible browser flows. The point is to name those dependencies rather than let a boot screen imply that they were tested.

Recovery evidence should describe exactly what was restored and what was exercised. That makes the next outage less dependent on optimism.
