---
title: "FBI's Sentinel: Green Status Reports vs. Working Software"
date: "2026-07-08T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "The FBI spent roughly a decade and over half a billion dollars on two failed attempts to replace its paper case-management system — with reportedly 800-page requirements documents and status reports that stayed green right up until the products turned out not to exist. Then a small in-house team in the basement of the Hoover Building shipped it in about a year for roughly $30 million. The interesting question isn't which methodology won. It's why documentation can lie for years and a sprint demo can't."
use_featured_image: false
series: agile-first-principles
seriesOrder: 4
---

In 2005, the FBI scrapped a software project called the Virtual Case File after spending roughly $170 million and receiving, by the accounts of the Department of Justice's own Inspector General, about 700,000 lines of code that could not be used. Not "shipped late." Not "shipped with defects." *Never usable at all.* The system it was meant to replace — paper case files, physically routed between agents, in the bureau investigating the September 11th attacks — stayed in place. And here's the detail that makes it more than an expensive failure, the detail this whole series has been building toward: for years before the cancellation, the project's status reports said things were broadly on track. The requirements documents reportedly ran to something like 800 pages. The documentation was comprehensive, current, and healthy — right up until the moment the product turned out not to exist.

If the [manifesto post](/product-management/the-agile-manifesto-four-values-twelve-principles/) made "working software over comprehensive documentation" sound abstract, this is the value with a price tag attached. The FBI's decade-long attempt to digitize its case files is the sharpest documented illustration I know of two lines from that document — the value itself, and the principle behind it: *working software is the primary measure of progress*. Not because agile heroically beat waterfall in a fair fight. Because of something more mechanical, and more useful: **documentation can be wrong for years without anyone being forced to notice, while working software can only be wrong in ways that hurt immediately — and that pain is information, arriving while it's still cheap.**

## Attempt one: the Virtual Case File, or how 800 pages stayed green

The Virtual Case File began after 9/11, when the cost of agents unable to search and share case information had stopped being hypothetical. The FBI contracted SAIC to build it, and the project ran the way large government software ran: big-bang, requirements-first, everything specified up front, integration and delivery at the end. Requirements documents reportedly around 800 pages. Years of development. Then, in 2005, cancellation — roughly $170 million spent, the code abandoned, the paper system still standing.

The failure mode here is one I recognize from every large enterprise program I've been near, and it's worth naming precisely, because "waterfall bad" is not it. The real mechanism: **on a documentation-first project, every artifact that measures progress is itself a document.** The requirements are a document. The design is a document. The status report is a document about the other documents. Percent-complete is an estimate of how much of the described system has been described-as-built. At no point in that chain does reality get a vote. A spec can be wrong on page thirty — wrong about what agents need, wrong about what the architecture can bear — and nothing forces the error to surface, because nothing downstream of the spec is capable of contradicting it. Documents don't crash. Documents don't fail in front of a user. The wrongness just compounds quietly, fully funded, until the one event that *can* contradict it: someone tries to use the software.

Which is exactly what happened. The status reports weren't lies, mostly. They were accurate reports about the state of the paperwork. The paperwork was fine.

## Attempt two: Sentinel, the responsible version of the same mistake

To the government's credit, nobody concluded the FBI didn't need the system. In 2006 the bureau tried again — a new project, Sentinel, awarded to Lockheed Martin with a budget of roughly $425 million. And this attempt was, by all accounts, run more carefully: phased delivery, more oversight, lessons visibly learned from VCF. This is the part of the story I find most instructive, because it removes the easy out. This wasn't a rogue project. It was the responsible, chastened, extra-supervised second try.

By 2010, roughly $405 million of the $425 million was spent, two of four phases had been delivered, and independent estimates projected years more work and hundreds of millions more dollars to finish. The DOJ Inspector General's audit reports through this period make sober reading: schedule slips, cost growth, delivered phases that didn't add up to a usable whole. More phases, more oversight, more documentation about the state of the documentation — and the same underlying physics. The feedback loop between "work performed" and "an agent's job got easier" was still years long, and everything inside that loop was still, functionally, paperwork.

Two attempts, roughly a decade, more than half a billion dollars combined, and the FBI's case files were still on paper. That's where the story turns.

## The basement: forty-five people and a demo you can't fake

In 2010, the FBI's technology leadership — CIO Chad Fulgham, who'd come from Wall Street engineering organizations — made a decision that reads as insane in a government procurement context: stop the contract, take development in-house, and *shrink* the team. Reported numbers: around 45 people total, roughly 15 of them developers, working out of the basement of the Hoover Building. They ran Scrum-style iterations — short sprints, a prioritized backlog, and the practice that matters most for this story: **working software demonstrated at the end of every sprint.** Not a status report about the software. The software, running, in front of people who could react to it.

In July 2012, Sentinel deployed to all FBI agents. Reported cost of the final push: roughly $30 million of the remaining budget, and about a year of the team's work. The episode is documented in the Inspector General's audit reports and GAO reporting, and retold at length in Jeff Sutherland's *Scrum: The Art of Doing Twice the Work in Half the Time* — Sutherland consulted on the effort, so his account is the enthusiastic version, but the numbers survive contact with the audit trail.

Now, the comparison everyone reaches for — $170M plus ~$405M of failure versus $30M of success — is real, and it's also slightly the wrong frame. The basement team wasn't starting from zero; phases had been delivered, requirements were understood in a way they hadn't been in 2001, and half a billion dollars of failure is itself a brutally effective requirements-discovery process. The honest claim is narrower and, I think, more damning: *given the same organization, the same mission, and largely the same accumulated knowledge, the delivery model that measured progress in demos finished in a year what the model that measured progress in documents couldn't finish in a decade.*

## Why: wrongness that hurts early is a feature

So why did it work? Not, I'd argue, because standups have magic in them — the [previous post in this series](/product-management/agile-without-scrum-or-kanban/) made the case that the ceremonies are derived, replaceable, and inert on their own. The mechanism underneath Sentinel's turnaround is about the *falsifiability of the progress signal*, and it generalizes to any project you'll ever run.

Ask what it would take for each regime's progress measure to be wrong without anyone knowing. For a status report rolling up document-completion percentages, the answer is: almost nothing. Every hop in the reporting chain — engineer to lead to program office to oversight committee — is an opportunity for rounding-up, and there's no external event that punishes the rounding. Green can stay green for years on nothing but professional optimism, because no user ever touches a Gantt chart. The VCF's reports weren't a cover-up; they were the natural output of a system where **the measure of progress and the thing being measured never had to meet.**

Now run the same test on a sprint demo. Two weeks of work, and the team stands up and operates the actual system in front of stakeholders. If the search feature doesn't work, it doesn't work *in the room*. You can theater your way through one bad demo, maybe two — you cannot fake twenty-six of them a year, because the demo is the software, and software is the one artifact in the whole enterprise stack that refuses to flatter you. This is what "working software is the primary measure of progress" is actually claiming: not that code is morally superior to prose, but that running code is the only progress signal that is *expensive to fake and cheap to check*. Every wrong assumption surfaces at two-week granularity instead of at year eight. The pain arrives early — and early pain is just information with good timing. Late pain is the same information, plus interest, compounded at $400 million.

That's also why I resist telling this as "agile beat waterfall." The methodology framing lets you conclude that adopting sprints would have saved VCF, and I don't believe that for a second. A team running perfect two-week sprints whose "demo" is a slide deck has rebuilt the VCF reporting chain with more meetings.

## The caveats, because the story is usually told without them

Three honest complications, each of which did as much work as any ceremony.

**The talent was the intervention.** Fulgham didn't just change process; he brought serious engineering leadership in-house and cut the team to people who could actually build. Forty-five strong people with direct ownership beat a contractor org of hundreds not only because of the feedback loop, but because small senior teams have a coordination cost that large mixed ones simply can't match. If your takeaway from Sentinel is "adopt Scrum" and not "who, specifically, is building this and do they have the skill," you've taken the wrong half.

**Scope discipline had executive air-cover.** Shipping in a year meant ruthlessly cutting and sequencing what "done" meant, sprint over sprint — and a CIO willing to absorb the political heat of those cuts. The basement team could say no. Most enterprise teams running the same ceremonies can't, and the ceremonies don't help you say no; a sponsor does.

**Sentinel wasn't beloved on arrival.** Post-launch, agents filed real usability complaints — the deployed system had rough edges and workflow friction that took further iteration to sand down. Working software is the primary measure of progress; it is not a certificate of product quality. Sentinel in July 2012 was a starting point that existed, which after eleven years was the entire point — but "it shipped" and "it delighted its users" remain different claims, and the honest version of this story keeps them separate.

None of this weakens the core lesson. It sharpens it: the feedback loop is necessary, not sufficient. What the loop bought the FBI was the *ability to find out* — about scope, about usability, about what agents actually needed — while finding out could still change anything.

## Put it to work

1. **Audit your progress signals for falsifiability.** List every artifact your project's status rolls up from — tickets closed, percent complete, milestone reports — and for each one ask: what would force this to be visibly wrong within two weeks if the underlying work were failing? Any signal with no answer is a VCF status report, and if your whole dashboard is made of them, you don't know your project's status; you know its paperwork's status.
2. **Put running software in front of a real stakeholder every two weeks, and treat a missed demo as an incident.** Not a screenshot, not a deck, not staging-only — someone outside the team operating the actual thing. The first time you can't demo, resist the urge to reschedule; that gap *is* the finding. It's your project's year-eight problem, arriving in week two, while it's still cheap.
3. **Before your next process change, name the non-process interventions Sentinel needed.** Who are the fifteen developers, what scope gets cut, and which executive absorbs the heat for cutting it? If you can't answer all three, adopting the ceremonies will get you a team that sprints in circles with better vocabulary — the failure mode the whole [first post in this series](/product-management/the-agile-manifesto-four-values-twelve-principles/) exists to warn about.

## Further reading

- Jeff Sutherland, [*Scrum: The Art of Doing Twice the Work in Half the Time*](https://www.amazon.com/s?k=scrum+the+art+of+doing+twice+the+work+in+half+the+time+sutherland) — the Sentinel chapter is the insider retelling of the basement effort; enthusiastic, but the numbers hold up against the audits.
- U.S. Department of Justice, [Office of the Inspector General — Sentinel Audit reports](https://oig.justice.gov/reports/sentinel-audit-v-status-federal-bureau-investigations-case-management-system-redacted) — the audit report series, tracking cost, schedule, and delivery from the Lockheed years through the 2012 deployment; the primary source, and drier than fiction but more damning.
- Robert N. Charette, ["Why Software Fails"](https://spectrum.ieee.org/why-software-fails) (IEEE Spectrum, 2005) — the classic survey of large-scale software failure written the year VCF died, with VCF among its examples; the pattern language for everything above.
