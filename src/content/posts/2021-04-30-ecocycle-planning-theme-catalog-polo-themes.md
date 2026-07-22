---
title: "Ecocycle Planning: Which Themes to Retire, Refresh, or Launch"
date: "2021-04-30T10:00:00+05:45"
category: ["Product"]
categories: ["product-management"]
directory: product-management
excerpt: "Our theme catalog had forty-plus entries and nobody could say, in one sentence, which ones were dying, which were thriving, and which were still just an idea in a Figma file. Ecocycle Planning put every theme on one diagram and made the answer obvious."
tags: [liberating-structures, polo-themes]
series: ls-decide
seriesOrder: 3
use_featured_image: false
---

We had a theme catalog review that went the same way every quarter: someone pulled up a spreadsheet with forty-plus rows, sorted by install count, and we argued about the bottom ten for forty minutes without ever agreeing on what "bottom" meant. Bottom in installs? Bottom in revenue per merchant? Bottom in support tickets per week? The spreadsheet had one axis — rank — and rank can't tell you *why* a theme is struggling, which means it can't tell you whether the fix is to sunset it, invest in it, or leave it alone. We killed the spreadsheet review and ran an Ecocycle Planning session instead. It took ninety minutes and produced a shorter, sharper list than six quarters of spreadsheet arguments had.

## What the structure is

Ecocycle Planning comes from Deborah Frieze and Brenda Zimmerman, by way of Liberating Structures, and it borrows its shape from ecology: living systems don't move in a straight line from birth to decline, they move in a loop. The diagram is a figure-eight, two loops joined at birth. The **front loop** runs birth → maturity → growth and alignment, where a thing gets more efficient, more optimized, more locked into how it's always been done — and at the far right of that loop sits the **rigidity trap**, where past success has calcified into an inability to change even when change is obviously needed. The **back loop** runs creative destruction → release → exploration and uncertainty → renewal, back to birth — and partway along that loop sits the **poverty trap**, where something is stuck exploring, generating ideas nobody will fund into anything real.

Every practice, product, or project in a portfolio sits somewhere on that loop, whether anyone's said so out loud or not. The structure's entire value is forcing the room to say it out loud, together, on one diagram, instead of forty separate opinions living in forty separate heads.

## How it actually runs

**Individual generation, five minutes, silent.** Everyone writes one sticky note per theme in the catalog — one theme, one note, short label. Silent and individual first, same discipline as always: get the raw material down before anyone's opinion contaminates anyone else's.

**Placement, small groups of four or five, ten to fifteen minutes.** Groups get a large printed ecocycle diagram and physically place every sticky where the theme actually sits in its lifecycle right now — not where anyone wishes it sat. This step alone is where the disagreement surfaces: someone places the flagship theme in "maturity," someone else insists it's already drifting toward the rigidity trap, and now they have to talk about *why* instead of just voting on it.

**Two questions, whole group.** Once the diagram's populated, the room works two prompts: **what should we creatively destroy** — candidates in or heading for the rigidity trap — and **what's ready to be born** — candidates that have survived the poverty trap and earned real investment. Both questions get discussed openly rather than decided by whoever placed the most stickies.

**Harvest, small groups report back.** Each quad summarizes what it saw and argued about; the facilitator captures the pattern across groups, not just the individual placements. Total run time is forty-five to ninety minutes for a room of twelve to twenty; smaller catalogs run at the short end, bigger ones at the long end. It's the natural sequel to a portfolio-level pass like the one I ran with [recap CRM's feature list](/product-management/ecocycle-planning-feature-portfolio-recap-crm/) — same diagram, narrower scope, one catalog instead of one whole roadmap.

## Running it on the theme catalog

Polo Themes sells storefront themes — customizable Shopify/Next.js templates that merchants pick, tune in the theme customizer, and launch a store on. The catalog is the product, so the ecocycle isn't an abstraction here; it's literally the list of themes we sell, support, and demo.

Placement made the shape of the catalog visible in a way the install-count spreadsheet never had:

- **Maturity, front loop.** A handful of workhorse themes — clean, general-purpose, broad category fit — sitting in steady demand with predictable support load. Nobody argued about these; they were the easy middle of the diagram.
- **Rigidity trap.** The oldest theme in the catalog, the one that shipped near launch and still accounted for a real slice of active installs, went here without much debate. Its customizer options predated our current design tokens, every merchant on it was on a legacy checkout flow we didn't want to touch, and every attempt to modernize it broke someone's live store. It wasn't dying — it was calcified, generating just enough revenue that nobody had the nerve to sunset it, and too brittle to safely improve. That's the textbook rigidity-trap signature: success frozen into a shape nobody can afford to change.
- **Growth/alignment.** A newer conversion-focused theme built around a streamlined checkout and a merchandising layout that had been quietly climbing install share for two quarters. The group's argument here wasn't whether to invest — it was whether it was aligning toward maturity on its own or needed a push (a demo-store refresh, a spot on the pricing page) to get there faster.
- **Poverty trap.** A theme concept aimed at a niche vertical — something like a made-to-order or pre-order-heavy storefront pattern — that had lived as a Figma file and a couple of prototype demo stores for two release cycles. Every design review agreed it was interesting. Nobody had ever put engineering time against it, because it kept losing to catalog-wide priorities that had a spreadsheet number attached and it didn't. Textbook poverty trap: real exploration, zero resourcing, going nowhere without a deliberate decision to fund it.
- **Release/creative destruction.** Two early themes with single-digit active installs, both superseded by newer ones with equivalent functionality and a fraction of the support burden. The room's instinct going in was "just leave them, they're not hurting anything" — the ecocycle forced the harder question of what they *were* costing: customizer-code maintenance, QA surface on every theme-engine release, documentation upkeep. Both went on the sunset list with a migration path for the merchants still on them.

The two questions did the real work. "What should we creatively destroy" produced the sunset list above plus a decision to freeze new investment in the rigidity-trap theme rather than pretend a redesign was coming — we'd fund a hard migration path off it instead. "What's ready to be born" took the poverty-trap concept and gave it an actual decision point: either staff a scoped spike next quarter or kill it outright, because "someday" isn't a place on the diagram.

## Failure modes

**Placement becomes a popularity contest.** If the room defaults to plotting themes by install count instead of lifecycle behavior, you've rebuilt the spreadsheet with extra steps. A theme can have healthy installs and still be in the rigidity trap — the diagnostic question is "can we still change this without breaking it," not "is it selling."

**Running it with only the design or only the engineering half of the room.** Placement disagreements are the point, and they only surface real information when the group holds both perspectives — engineering knows what's brittle underneath, product and design know what's earning trust with merchants. A single-discipline group will place everything correctly by its own lights and miss the friction entirely.

**No resourcing decision attached to the harvest.** The two questions are worthless if "what's ready to be born" produces a nodding agreement and then nobody's calendar changes. Ecocycle Planning surfaces the poverty trap; it doesn't escape it. If the room can't commit real time against at least one "ready to be born" candidate, skip the exercise and go straight to a resourcing conversation instead — the diagram will just relitigate a decision everyone already knows they're avoiding.

**Doing it too often.** A catalog doesn't reshuffle its lifecycle positions monthly. Running this quarterly against a slow-moving theme catalog burns goodwill for no new information; twice a year, or after a major theme-engine release, is closer to the right cadence.
