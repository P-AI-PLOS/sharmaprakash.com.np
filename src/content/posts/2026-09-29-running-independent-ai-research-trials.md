---
title: "Running Independent AI Research Trials"
date: "2026-09-29T09:35:00+05:45"
directory: ai
category: ["AI"]
categories: ["technical"]
excerpt: "Two isolated research environments can work from the same source material while keeping their analysis independent and reviewable."
tags: ["AI", "research", "Hermes", "homelab", "evaluation"]
draft: false
---

When two AI teams review the same business question, giving them separate names is not enough to make their work independent. If they share scratch files, task boards, or prior conclusions, the second team may simply inherit the first team's assumptions.

For a recent research exercise, we set up two dedicated virtual machines. Both received the same source bundle. Each had its own task queue, notes, and output directory.

## Keep inputs equal and working state separate

The shared source pack included reference material and exercises. We copied the same files to both environments and verified their hashes. The teams could begin with identical evidence without seeing each other's interpretation.

That gives the comparison a simple structure:

- same source documents;
- separate research and discovery workspaces;
- independent findings;
- a later review that can compare claims and disagreements.

The goal is not to manufacture agreement. A useful second pass should be able to challenge the first team's framing.

## Search and extraction are different capabilities

One practical setup lesson came from web access. The configured DuckDuckGo search backend could find pages, but it did not extract their contents. We tested search and extraction separately and added an extraction-capable backend for page reading.

That distinction matters in research workflows. A list of promising URLs is not source material that an agent has actually read. The task instructions should also require citations or notes tied to retrieved passages, so a reviewer can inspect how a conclusion was reached.

## A running VM is not a completed study

Provisioning the two VMs and delivering their input bundles proved that the environments were ready to work. It did not prove that the research had been completed or that the findings were sound.

The acceptance sequence still needs to include:

1. A real research task that produces files in the expected output directory.
2. A separate discovery or review pass against those outputs.
3. A revision that preserves the original findings and records changes.
4. A check that references support the claims.
5. A final deliverable, such as a case file or presentation, reviewed by a person.

Until those steps finish, the honest status is “research infrastructure ready; final output pending.” That is still useful progress. It simply keeps the environment result separate from the intellectual result.

## When this pattern is useful

Independent runs can help with market research, policy review, product discovery, literature surveys, or red-team exercises. They work best when the prompt, source bundle, and evaluation criteria are explicit, while each team's intermediate work remains isolated.

The reviewer should compare not only the final recommendations but also the evidence each run used, what it missed, and where the teams disagree. Independence is valuable because it can expose different interpretations—not because it guarantees that one answer is correct.
