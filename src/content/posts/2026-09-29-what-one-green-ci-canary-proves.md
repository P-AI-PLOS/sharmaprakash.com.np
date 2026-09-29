---
title: "What One Green CI Canary Proves"
date: "2026-09-29T09:15:00+05:45"
directory: engineering
category: ["Engineering"]
categories: ["technical"]
excerpt: "A CI runner can be registered, scheduled, and ready without having completed a real job. A narrow canary is evidence for one path, not the whole lifecycle."
tags: ["CI", "Kubernetes", "K3s", "Forgejo", "operations"]
draft: false
---

When a CI runner reports healthy, there are several possible meanings. Its pod may be running. The runner may be registered. The scheduler may have accepted its job template. None of those statements means a real job has completed.

In a recent homelab runner pilot, we used a deliberately small Forgejo workflow as a canary. One job was dispatched to a K3s-backed runner, completed, and the scaled runner returned to zero replicas.

That is good evidence. It is also narrow evidence.

## The layers before the job

The path included a K3s cluster, KEDA scaling, a repository-scoped Forgejo runner, a private certificate authority, and a short-lived job pod. The first useful failure was not a scheduling problem: the runner pod could not verify the Forgejo certificate because it did not trust the private CA.

Mounting the accepted CA into the relevant namespaces repaired that trust path. We then queried the generated job and runner conditions directly instead of treating a green deployment object as proof.

The canary exercised this full sequence:

1. Forgejo reported a matching pending job.
2. KEDA created a runner job.
3. The pod reached Forgejo with the expected certificate trust.
4. The workflow ran and completed.
5. The Kubernetes job exited successfully.
6. The scaler returned to zero active runners.

This proved that the basic dispatch path worked once for that repository and job.

## What it did not prove

The canary did not use product secrets or build and deploy a real application. It did not prove resource behavior for long jobs, simultaneous demand, or large images. It did not prove that a node can drain safely while jobs are running, that a retry cleans up correctly, or that the previous runner path can take over after rollback.

Those questions matter before replacing an existing runner. A successful smoke can be the entry ticket to broader testing, not the retirement criterion.

## A runner lifecycle acceptance plan

Before calling a runner platform ready for regular work, I would separately verify:

- a real representative workflow with its required toolchain;
- a bounded burst of queued jobs and scale-down afterward;
- a longer job that exercises expected memory, disk, and network use;
- cleanup after success, failure, timeout, and cancellation;
- node drain or eviction while a job is active;
- fallback to the retained runner and a tested rollback;
- the real secret and artifact boundaries for each repository.

There is a useful difference between “Kubernetes is ready,” “the runner registered,” “one job passed,” and “the provider workflow is accepted.” Naming that difference keeps a pilot honest and gives the next test a clear purpose.
