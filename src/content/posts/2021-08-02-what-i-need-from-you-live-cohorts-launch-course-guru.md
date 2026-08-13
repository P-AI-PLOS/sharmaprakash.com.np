---
title: "What I Need From You: Four Functions, Two Asks Each, One-Word Answers"
date: "2021-08-02T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Launching live cohort sessions needed four teams to depend on each other, and every dependency lived in someone's head as an assumption. WINFY forces the ask into the open — and permits exactly four replies."
tags: [liberating-structures, course-guru]
series: ls-alignment
seriesOrder: 9
use_featured_image: false
---

Course Guru's live cohort feature — scheduled sessions, a roster, attendance, a replay — was six weeks from launch and had the specific smell of a project that will be late for reasons nobody has said out loud. Every function was confident about its own work. Every function was quietly depending on another function doing something that function didn't know about.

The engineering lead assumed content ops would have the instructor onboarding guide ready before beta. Content ops assumed marketing was handling instructor recruitment. Marketing assumed the feature would have a demo environment they could record in. Support assumed someone had decided what happens when a session is cancelled ninety minutes before it starts, and nobody had.

None of these were secrets. They were assumptions, which are worse than secrets because everyone believes they've been communicated.

We ran **What I Need From You** — WINFY — for fifty minutes with four groups. It's the least comfortable structure in the set and the one I've had the most direct results from.

## What it is

WINFY exists to make cross-functional requests explicit and to make responses to them unambiguous. It runs in functional groups — engineering, content ops, marketing, support in our case — and it has a strict script.

First, each group meets alone and agrees on its **top two needs from each other group**, phrased as "What I need from you is…" Concrete, specific, and addressed to a group, not a person.

Then the plenary. One group at a time is in the spotlight. A representative states their needs to each other group in turn, out loud, in that phrasing. The receiving group's representative writes it down and, crucially, **does not respond yet**. You go all the way around: every group states every need first.

Then the responses, and this is the part everyone finds startling. A receiving group may reply with exactly one of four things:

- **Yes**
- **No**
- **I'll try**
- **Whatever it is you're asking for, it's unclear to me**

No explanation. No conditions. No "yes, but." One word — well, one phrase — per request, and then move on.

Lipmanowicz and McCandless are unusually firm about the ban on elaboration, and having run it a dozen times I understand why: elaboration is where accountability goes to die. "Yes, assuming we get the API docs by the 15th and nothing else lands" is a sentence that will be remembered as a yes by the asker and as a no by the answerer.

The "I'll try" option is the designed escape valve. It's an honest answer, and it's also a public flag that this dependency is at risk, which is exactly the information a launch plan needs.

## Running it before the cohort launch

Four groups, sixteen people, fifty minutes including the ten minutes of separate prep.

The asks that mattered:

Engineering to content ops: *"What I need from you is the instructor onboarding guide finished before beta opens, because we're not building in-product guidance for beta."* Answer: **I'll try.** In the room, that "I'll try" was the single most valuable output of the session — it converted a plan assumption into a visible risk with a name attached, six weeks early, in front of everyone.

Support to engineering: *"What I need from you is a decision on what happens to a cancelled session's attendees and their calendar invites."* Answer: **Whatever it is you're asking for, it's unclear to me.** The engineering lead genuinely didn't know whether this was a product decision or a technical one. That answer, which sounds like a failure, took a question that had been quietly rotting for a month and put it on a whiteboard with two people's names beside it.

Marketing to engineering: *"What I need from you is a demo environment with realistic seeded data by the 20th."* **Yes.** Ten seconds, done, and marketing stopped hedging its launch content plan on a maybe.

Content ops to marketing: *"What I need from you is instructor recruitment for the beta cohort — we don't have the list and we assumed you did."* **No.** Marketing had never had it on their plan. A flat, immediate no, in public, meant we spent the next fifteen minutes after the session assigning it rather than discovering in week five that nobody had.

That's four requests. There were twenty-four in total, most of them uneventful yeses. The four above were worth the meeting several times over, and three of them were surfaced by the *restricted* answers rather than despite them.

## Why the four answers are the whole design

Ordinary cross-functional planning is conducted in a dialect where nothing is ever refused. Requests get "sure, let's sync on that," "should be fine," "we can probably fit it in." Every one of those is a yes to the asker and a maybe to the answerer, and the gap between the two is where launches slip.

Restricting the reply set removes the dialect. There is no way to say "should be fine" in WINFY. You have to pick a category, in public, in front of the person who'll be affected, and every category has consequences you can plan around. A no is immediately actionable. An "I'll try" goes on the risk list. An "it's unclear" gets a follow-up owner before anyone leaves.

The stating-before-responding sequence does the other half. If groups respond as they're asked, the first few answers set a tone — one enthusiastic yes and the room calibrates toward yes for the rest of the hour. Hearing all twenty-four requests first means each group answers with the full picture of what's being asked of them, which is when honest nos become possible.

And phrasing requests as "what I need from you" rather than "can you do" matters more than it looks. It puts the asker's stake in the sentence. "Can you get me the onboarding guide" is a favor; "what I need from you is the onboarding guide finished before beta, because we're not building in-product guidance" is a dependency with a reason.

## Where it goes wrong

It goes wrong if you let people explain. One "yes, but only if—" and the format is gone for the rest of the session, because now everyone else expects to negotiate. Interrupt the first one, gently, and it holds.

It goes wrong with groups that aren't real functions. WINFY needs genuine interdependence between distinct groups; running it across three sub-teams of the same squad produces polite, low-stakes asks.

It goes wrong if the "I'll try" answers don't go somewhere. That answer is a gift — an honest, early risk signal — and if it evaporates when the meeting ends, people learn to just say yes next time.

And skip it entirely if the real blocker is that one group is under-resourced and everyone knows it. WINFY will produce a row of honest nos, which is accurate and demoralizing and tells you nothing you didn't already know. Fix the staffing, then run the structure.
