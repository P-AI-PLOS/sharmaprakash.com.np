---
title: "Design Storyboards: Drawing the Path from `npx shortest` to a Merged Pull Request"
date: "2021-06-29T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Shortest's install command took eleven seconds and our activation numbers were dismal. Storyboarding the whole path — install, first run, first review, first merge — showed that the product ended two days before the moment that mattered."
tags: [liberating-structures, shortest]
series: ls-design
seriesOrder: 8
use_featured_image: false
---

Our install worked. `npx shortest init` picked up the test runner, wrote a config, and printed a cheerful next-step in eleven seconds. First-run completion was over 80%. And the number we actually cared about — repositories with generated tests still present a month later — was 9%.

Every proposed explanation was about the product's beginning — better defaults, a nicer init prompt, a tutorial. I didn't believe any of them, because the beginning was the part we'd measured and the part that worked. So we ran **Design Storyboards** on the whole thing, install to merged pull request, and the wall made it obvious that our product ended roughly two days before the moment that decided its fate.

## The structure

Two passes. First the **big picture**: groups draw four to eight panels for the major chapters, end to end, with time markers, in fifteen minutes. Sketches, not sentences. Then the **detailed pass**, expanding each panel into who does what, when, with what, and what the person knows at that point. A gallery walk closes it, and the facilitator harvests gaps rather than drawings.

For a developer tool I add one instruction: the storyboard must end at a *social* event, not a technical one. Not "tests are generated" — "another engineer approved the pull request." Developer tools are adopted by teams, and almost every one is designed up to the individual's first success and no further.

## Running it on the first week

Four groups, brief: *Dan runs `npx shortest init` on a Thursday afternoon in a real service repo. Draw everything up to the moment the generated tests are running in CI on main — or the moment he gives up.*

The big-picture panels agreed for the first three and diverged sharply after.

**Panel 1, install.** Eleven seconds, no drama. Everybody drew it the same way.

**Panel 2, first run.** Forty minutes of generation. One group drew Dan watching a progress bar; two drew him leaving to do something else; the fourth drew him closing the terminal, which nobody had ever considered as a supported case. We had no resume.

**Panel 3, ninety-one green tests.** Every group drew a happy face here. This is where our metrics stopped.

**Panel 4 is where the product actually was.** Dan opens a diff with ninety-one new files in it. Every group drew this panel differently and every version was bad: scrolling, picking three at random, opening the file with the scariest name. The fourth group drew him not opening the diff at all and just pushing the branch — then drew panel 5, which was a teammate's face.

**Panel 5, review.** Somebody who did not run the tool, did not choose it, and has no context is asked to approve ninety-one files. Two groups independently drew the same speech bubble: *what is this?*

**Panel 6, the fork.** Either the PR is merged and the tests live in CI, or the branch quietly rots. Nobody in the room could say what determined which, because nothing in the product touched panel 5 at all.

The "what does he know" question found the thing. At panel 4, Dan knows the tests pass. He doesn't know which are worth anything, and has no way to find out short of reading all ninety-one — so the rational move is to push without reading, which is precisely how he arrives at panel 5 with nothing to say.

We stopped working on the init flow. What shipped instead aimed entirely at panels 4 through 6: a generated summary at the top of the diff explaining what each group of tests covers, with one line per test on why the tool believes it would fail if the behaviour broke; tests ordered by that confidence; a "did not attempt" list; and a PR description written for the reviewer rather than the author. Repositories still using generated tests a month later went from 9% to the high thirties over two quarters. Install time never changed.

## Why the sequence exposed it

We had good instrumentation and it was all inside the tool. The failure lived in a moment the tool wasn't present for — a code review in someone else's browser tab — and no dashboard was going to show us that.

The chronological form made it inescapable. Panels 1 through 3 were the entire product. Panels 4 through 6 were three-quarters of the elapsed time and all of the decision, drawn by everyone, owned by no one. On a wall that imbalance is a fact you can point at; in a roadmap document those panels simply don't appear, so nobody notices the omission. Ending the storyboard at a social event is the other half of it — had the brief stopped at "tests generated," four groups would have drawn four cheerful panels and we'd have shipped a nicer init prompt.

## When it doesn't help

Storyboards need a sequence with duration. If your product's whole experience is one screen and one action, drawing it produces a picture of the screen.

They're also worthless if the room can't populate the panels honestly. Ours worked because two people in it had watched engineers review generated code. Guessed panels give you a fictional user who behaves the way the team wishes, and a wall of fiction is more persuasive than a document of fiction.

And a storyboard describes; it doesn't decide. Ours produced four candidate interventions and no ranking, and the argument about which to build first still needed the usual instruments — [an Agreement-Certainty Matrix](/product-management/agreement-certainty-matrix-flaky-test-detection-shortest/), in our case.
