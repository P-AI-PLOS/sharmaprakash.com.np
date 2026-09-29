---
title: "An SLO Needs a User-Visible Alert"
date: "2026-09-29T09:40:00+05:45"
directory: homelab
category: ["Homelab"]
categories: ["technical"]
excerpt: "A target and a Prometheus query are only part of an SLO. The measurement must run, missing data must matter, and alerts must reach someone."
tags: ["SLO", "observability", "Prometheus", "Uptime Kuma", "homelab"]
draft: false
---

Writing “99.5% availability” in a document does not make a service reliable. It does not even tell us whether the service was available.

For three homelab services, we recently connected user-path probes to Prometheus recording rules and Uptime Kuma monitors. That made the SLOs operational enough to alert, while leaving the targets provisional until a full measurement window had accumulated.

## Measure a user journey, not just a host

Host metrics answer questions such as “is the VM up?” A service-level indicator should follow a meaningful path. We chose HTTP health endpoints for two services and a DNS lookup for the LAN resolver.

The probes run from the monitoring host. That means an SLI can burn when the monitoring-to-service path fails too. In a single-site homelab, that is an intentional limitation: it measures whether this observer can use the service from its own network position, not whether every client everywhere can.

## Turn burn conditions into notifications

Prometheus records fast, slow, and ticket-level burn conditions as numeric series. Uptime Kuma checks those series through its JSON query monitor and treats a missing series as a failed check.

That missing-data behavior is important. If the probe disappears or Prometheus becomes unreachable, the dashboard should not quietly imply that everything is fine.

The monitors existed and reported healthy after deployment. They were configured to notify the homelab email channel, but we had not yet test-fired delivery for these monitors. So the measurement and alert objects were in place; end-to-end notification was still an open check.

## Provisional targets need a full window

The first targets used a 99.5% objective over 28 days. For one such window, that allows about 201.6 minutes of unavailability. The target was provisional because there was no measured 28-day history yet.

That is a reasonable starting hypothesis, not an observed reliability result. After the window completes, the target should be reviewed against actual service behavior and the cost of outages.

An error budget can then influence changes. If the budget is healthy, normal maintenance continues. As it burns down, changes to the affected service and host can be restricted, keeping reliability work ahead of feature changes. The alert should lead to a person checking impact, restoring service, and recording what consumed the budget.

## The complete SLO loop

For an SLO to matter operationally, I want to see:

1. A user-relevant journey and an explicit SLI.
2. A probe that runs from a known location.
3. Recording rules that calculate the agreed burn conditions.
4. Monitors that treat missing measurements as a problem.
5. A notification path that has been exercised end to end.
6. A policy for what the team does as the budget burns.
7. Enough history to judge whether the provisional target makes sense.

That is more work than publishing a percentage. It also makes the number useful when it is time to decide whether to ship, pause, or spend the next change window on reliability.
