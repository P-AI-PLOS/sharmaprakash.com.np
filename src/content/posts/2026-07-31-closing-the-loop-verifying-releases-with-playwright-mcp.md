---
title: "Closing the Loop: Verifying Releases with Playwright MCP"
date: "2026-07-31T16:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "The series finale gives the product owner eyes and hands: Playwright MCP puts a real browser under the agent's control, so UAT scripts become supervised sessions, acceptance criteria get walked against staging with screenshots as evidence, bug reports arrive with reproduction steps attached, and a failing e2e test gets triaged — app bug or test bug — before it ever interrupts an engineer. The loop from signal to verified release, closed."
use_featured_image: false
series: pm-context-repo
seriesOrder: 12
---

Eleven posts have moved every product artifact — [signals](/product-management/the-signal-pipeline-tickets-calls-and-crm-into-one-weekly-digest/), [PRDs](/product-management/walkthrough-a-prd-from-signal-to-sign-off/), [estimates](/product-management/estimation-when-agents-do-the-typing/), [roadmaps](/product-management/walkthrough-assembling-the-quarterly-roadmap-from-signals/), [tickets](/product-management/from-prd-to-tickets-acceptance-criteria-that-survive-the-sprint/), [test registers](/product-management/the-test-register-tracing-acceptance-criteria-to-real-tests/) — into a system where claims carry citations and agents do the assembly under review. One artifact has stayed stubbornly analog: *the product itself.* Verifying that the running application actually does what the criteria say has meant a human, a browser, and twenty minutes that never quite exist — which is why UAT scripts rot and sprint-review demos walk only the happy path.

Playwright MCP closes that gap. It's an MCP server (open source, from the Playwright project) that gives an AI assistant a real browser — navigate, click, type, read the page, screenshot — driven not by brittle pixel-matching but by the page's accessibility tree, the same structured view assistive technology uses. Connected alongside the repo and tracker from [part four](/product-management/connecting-the-tools-tracker-docs-and-chat-without-drowning-in-integrations/), it means the assistant that *wrote* the acceptance criteria can now *walk them* against staging while you watch. For a product owner, this is the biggest single upgrade in the series: **the person who owns "done" finally has a way to check it that doesn't cost an evening.**

Ground rules first, because a browser is hands, not just eyes: staging environments and test accounts, never production with real customer data — the [privacy boundary](/product-management/connecting-the-tools-tracker-docs-and-chat-without-drowning-in-integrations/) applies to browsing exactly as it applied to reading the CRM. And destructive actions (deletes, sends, payments) stay behind confirmation, same write-gating philosophy as everywhere else in the system.

## UAT scripts become sessions

The [test register](/product-management/the-test-register-tracing-acceptance-criteria-to-real-tests/) for summary views left two manual rows. Release candidate's on staging; I open a session: *run UAT scripts 1 and 2 from the summary-views register against staging; screenshot each step; report pass/fail per criterion with evidence.*

The agent walks it: logs into the test workspace, opens Reports → Summary, reads the three sections *through the accessibility tree* (which incidentally smoke-tests that the new view is screen-reader-navigable — a freebie no manual UAT ever checked), compares section timestamps to the source reports in another tab, triggers the empty-state path on the test account with no billing data this period. Each step lands as a screenshot plus a claim tied to a criterion ID. Script 2 needs the reconciliation window; the agent can't conjure one, says so — *"T3b not verifiable now; reconciliation cycle next occurs ~14:00"* — and I rerun it at 14:00 rather than getting a guess. The [no-invented-facts guardrail](/product-management/avoiding-ai-slop-writing-user-stories-a-team-will-actually-build/), holding in a browser.

Twenty minutes of my attention becomes three of review. The register's manual rows flip to verified *with evidence attached* — the screenshots land in the PR that updates the register. "Done," inspectable, all the way down.

## Bug reports with the reproduction built in

Mid-walk, the agent flags something outside the scripts: the summary renders, but switching the workspace's date-range preference to fiscal-week start doubles one section's totals. Classic edge — nobody specified it, no criterion covers it (a *deliberate-gaps* miss the register will inherit). What happens next is the upgrade: *reproduce it, minimal steps, then file it.*

The agent replays the sequence fresh — new browser context, clean state — confirms it reproduces, narrows it to the fiscal-week setting plus one specific report type, and files a tracker item through the [staging gate](/product-management/connecting-the-tools-tracker-docs-and-chat-without-drowning-in-integrations/): numbered reproduction steps, environment, screenshots at each step, expected-vs-actual phrased against the nearest criterion, and — because the repo is in the same session — a note that `product/areas/reporting.md`'s eventual-consistency sharp edge is *not* the cause (it checked timestamps first, ruling out the obvious mis-triage an engineer would otherwise spend an hour disproving). Engineers describe tickets like this as the difference between a bug report and a rumor. The `ai-drafted` label still applies; I read the repro before it leaves triage. It reproduces. It ships to the sprint.

## Triaging the red e2e — app bug or test bug?

Third scene, the one that quietly changes the team's week. Tuesday morning, the e2e suite is red on `summary_view.spec: "renders three sections"` — a register row, so the drift check has already flipped the register to `drifted` and I see it in the morning review. The traditional flow: ping an engineer, who context-switches, spends forty minutes, and reports "the test was asserting on the old section heading — the copy change last sprint." A *test* bug, not an app bug, and an engineer-hour gone.

The new flow: the agent gets the failing test and the register row, replays the journey *manually* in the browser — does the app actually misbehave? — and reports: app behavior matches all four criteria on screen; the test fails because the heading it asserts on changed from "Billing summary" to "Billing overview" in the copy pass; here's the one-line assertion fix, referencing the current accessible name. Now the triage is *mine to rule on, with the facts assembled*: the app is right, the test is stale — but before accepting the patch, the criterion gets a check too, because a test that broke on copy is a test anchored too shallowly, and the fix-of-the-fix is asserting on the section's role and data, not its heading string. That refinement goes back through the [test-register PR](/product-management/the-test-register-tracing-acceptance-criteria-to-real-tests/), engineer-reviewed like any code change — the product owner didn't become the test suite's maintainer, but the red build stopped costing an engineer's morning to *diagnose*, and the register never lied while it was red.

That's the pattern one last time, at the finest grain the series reaches: **the agent assembles the facts of the failure; the human rules; the ruling improves the artifact that will run forever after.**

## The loop, closed

Follow the thread this arc has been pulling and it runs unbroken: an ops manager's Monday-morning complaint became a signal card with an ID; cards became a theme; the theme carried a [PRD](/product-management/walkthrough-a-prd-from-signal-to-sign-off/) whose every claim cited a card; the PRD became [sliced tickets](/product-management/from-prd-to-tickets-acceptance-criteria-that-survive-the-sprint/) whose criteria settled arguments in advance; criteria became [register rows](/product-management/the-test-register-tracing-acceptance-criteria-to-real-tests/) naming their proof; and this morning a browser walked the running product against those rows and attached the screenshots. Signal to verified release, every link citable, every artifact reviewed by a named human, every mechanical step done by an agent that was never once asked to be trusted.

That last clause is the series' actual thesis. None of the twelve posts made AI the authority on anything — the system's design puts models where they're strong (volume, assembly, recall, tirelessness) and humans where they're irreplaceable (rulings, slices, trade-offs, accountability), with git diffs and staging gates at every seam. Build it in that order — [repo](/product-management/the-product-context-repo-why-your-product-knowledge-belongs-in-git/), [structure](/product-management/designing-the-context-repo-structure-that-agents-and-humans-can-navigate/), pipeline, connections, [automation](/product-management/skills-hooks-and-the-always-on-agent-automating-the-context-repo/), discipline — and the artifacts of arc two stop being aspirational and start being Tuesday.

Start with the afternoon version: an `AGENTS.md`, five glossary terms, two area files, three decision records. The compounding starts there.
