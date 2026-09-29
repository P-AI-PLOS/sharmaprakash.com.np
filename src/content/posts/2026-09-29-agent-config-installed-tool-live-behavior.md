---
title: "Agent Config, Installed Tool, and Live Behavior Are Three Different Things"
date: "2026-09-29T09:45:00+05:45"
directory: ai
category: ["AI"]
categories: ["technical"]
excerpt: "A model or workflow can be correct in source and still be absent from the installed runtime. Verify each layer before claiming it works."
tags: ["AI agents", "developer tools", "configuration", "testing", "operations"]
draft: false
---

An agent's configuration can be correct in a repository while the installed tool still uses an older model, role, or workflow. Even when the tool reports the expected setting, that does not prove a real task succeeds.

Recent work across an agent fleet made it useful to treat this as three separate layers: source policy, installed runtime, and observed behavior.

## Source policy is the intended configuration

In one fleet update, the model identifiers changed in a shared resolver, the registry, and the defaults used by planning profiles. Editing just one file would have left other generated or installed consumers behind.

The source layer is where the intended role and model belong. It is reviewable and versioned. It is also not the thing the user's shell necessarily executes today.

## Installation is its own state

The Pi runtime used a generated bundle. After source changes, we rebuilt and installed the bundle, then checked the installed model catalog and ran the tool's doctor command. A previously running session could still retain an older model until it restarted or explicitly selected the new one.

The same boundary appears elsewhere: a commit does not deploy an application, a deployment does not prove a worker completed a job, and a dashboard prototype does not prove the production UI changed.

## Ask the running system to do real work

The last layer is observed behavior. For an agent, that may mean a small inference request using the intended provider, a tool call with the expected permissions, or a representative task whose output can be reviewed.

The proof should match the claim. A catalog listing proves that a model is available. A doctor command proves that the installation passes its checks. A real task shows that the selected model and tools can do something useful in the current environment.

This avoids two common mistakes:

- calling a source edit an installed change;
- calling a healthy process a successful workflow.

## A small verification table

| Claim | Evidence to collect |
| --- | --- |
| The repository defines the new default | Inspect the authoritative source and generated configuration |
| The installed binary knows the model | Read its catalog or managed settings after installation |
| A new session selects it | Inspect the session's effective provider and model |
| The workflow works | Run a bounded representative task and inspect its result |

This is a simple habit, but it makes reports much clearer. Instead of saying “the agent is updated,” say which layer changed and what the next check established.
