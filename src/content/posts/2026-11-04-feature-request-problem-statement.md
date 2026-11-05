---
title: "Turn a Feature Request into a Problem You Can Evaluate"
date: "2026-11-04T10:30:00+05:45"
directory: "product-management"
category: ["Product Management"]
categories: ["product"]
excerpt: "Keep the requested solution, then uncover the trigger, workaround, and consequence behind it."
tags: ["product", "practical guide"]
use_featured_image: true
cover: "/images/blog/editorial/product-decisions/cover.png"
thumb: "/images/blog/editorial/product-decisions/thumb.png"
draft: true
---

“Can you add an export button?” is a useful request, but it leaves several possible problems unresolved. The person might need a monthly report, a one-time migration, or a way to share a single record. Those needs can lead to different solutions.

Do not discard the requested feature. Keep it as one candidate while clarifying the job it is meant to do.

## Ask about the last occurrence

Start with a specific recent example: what were they trying to accomplish, what triggered the need, and what did they do instead? Concrete behavior is easier to evaluate than a general statement that exports would be useful.

For a hypothetical operations manager, the sequence might be: month closes, manager gathers approved requests, copies them into a payroll worksheet, and checks the totals manually. That sequence reveals timing, data, and an existing workaround.

## Identify the consequence

Ask what happens when the workaround is slow or wrong. Does it delay another task, create rework, or prevent the job entirely? Keep the answer separate from your estimate of business value.

One customer's severe problem can deserve attention even if it is infrequent. A common request can still be low priority if the workaround is easy and the consequence small. Frequency alone is not a verdict.

## Write a neutral problem statement

A useful format is: when a named user reaches a specific situation, they need to achieve an outcome, but an observed obstacle forces a workaround or causes a consequence.

For the example: “At month-end, the manager needs a reliable list of approved absences for payroll, but must copy records individually and reconcile the result.” The export button remains a plausible solution, but the statement no longer assumes it is the only one.

## Check the scope

Clarify which records, fields, permissions, and date rules matter. An export can become a contract consumed by another system. A seemingly small button may carry important correctness and access requirements.

Look for similar requests, but preserve differences. A one-time migration and a recurring payroll workflow should not be merged solely because both mention CSV.

## Decide what evidence is missing

The next action might be observing the workaround, checking how many users encounter it, or testing a small prototype. It does not always need to be implementation.

A better problem statement does not guarantee a good feature. It gives the team a clearer basis for comparing solutions and recognizing whether the eventual change actually helps.
