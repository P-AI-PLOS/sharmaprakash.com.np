---
title: "How I Actually Wrote This Site's design.md"
date: "2026-05-18T10:00:00+05:45"
category: ["AI"]
categories: ["ai"]
directory: ai
excerpt: "Parts 4–9 were the templates. This is the living artifact — a section-by-section tour of the design.md that powers this site, the calls I made, the rules that stuck, and the lines I would write differently if I started over."
cover: "/images/blog/ai/how-i-wrote-this-sites-design-md.png"
thumb: "/images/blog/ai/how-i-wrote-this-sites-design-md.png"
last_modified_at: "2026-05-18T10:00:00+05:45"
use_featured_image: true
series: agent-ready-react
seriesOrder: 12
---

Parts 4 through 9 of this series showed you the **shape** of a useful `design.md` — the meta-template plus three stack-specific versions (MUI, Chakra v3, Tailwind + shadcn). What I haven't done yet is point at a real one and walk through it.

The site you're reading right now is built with Astro, Tailwind v4 and a small set of React islands. The `design.md` at the repo root is 430 lines, in active use by every PR (and every agent session) since the rebuild. The full file is here:

[github.com/poudelprakash/personal_blog_2026/blob/main/design.md][repo-design-md]

This post is a tour of that file. Section by section: what I wrote, why I wrote it, what stuck after six months of use, and the two or three lines I would change if I were starting over.

If the earlier posts in the series were the *theory*, this is the *worked example*. It exists because every audit I describe in Part 1 ended with the same question: "OK but what does a *good* one actually look like?"

---

## Section 0 — Brand voice: write this even when you don't think you need it

The first section of the file isn't tokens or types. It's four bullets of voice.

```markdown
A founder who codes (and ships). The site should feel:

- Sharp — short sentences, no marketing fluff, type that earns its size.
- Technical without cosplay — no neon-on-black "hacker" tropes; we read
  like a notebook, not a terminal.
- Founder-ish, calm — confident defaults, generous whitespace, one accent
  color used like a highlighter, never wallpaper.
- Warm over cold — amber accent over the default tech blue.

If a design choice feels like a SaaS landing page, it's probably wrong.
```

The instinct is to skip this section for a personal blog ("it's just me, I know what I want"). Skipping it is the single biggest mistake I see in design.md files across the audits in Part 1. **The agent will fill the vacuum with priors from training data** — and the training data is saturated with SaaS landing pages, neon-on-black developer tools, and the same six gradient hero patterns.

The last line — "If a design choice feels like a SaaS landing page, it's probably wrong" — does more work than any token table. It tells the agent which priors to **suppress**, not just which to follow. Without it, every "add a hero section" prompt produces another centred-headline-with-gradient.

What I changed: until I wrote this post, the section had zero *references-we-draw-from / references-we-avoid* pairs — the half that Part 4 of the series argues is the more important half. The current file has the pairs in (Stripe Press / Linear / Vercel / Pirsig on the "draw from" side; Substack default / Notion marketing / Material Design defaults / generic SaaS gradient heroes on the "avoid"). Following my own advice three years late beats not following it.

---

## Section 1.1 — Why a full 11-step neutral scale instead of five

The neutral palette ranges from `--ink-50` to `--ink-950`. That's eleven values. The temptation when starting is to use Tailwind's `slate` directly and call it done.

```markdown
| --ink-50  | #F8FAFC | Page background (light surfaces, body bg)
| --ink-100 | #F1F5F9 | Subtle band background (alternating sections)
| --ink-200 | #E2E8F0 | Card border, divider line
| --ink-300 | #CBD5E1 | Disabled text, placeholder, faint icon
| --ink-400 | #94A3B8 | Caption, meta text (dates, reading time)
| --ink-500 | #64748B | Secondary body text
| --ink-600 | #475569 | Primary body text on light bg
| --ink-700 | #334155 | Headings on light bg
| --ink-800 | #1E293B | Inverse surface (dark hero, dark CTA band)
| --ink-900 | #0F172A | Deepest dark surface (footer, modal scrim)
| --ink-950 | #020617 | Pure depth — only for the hero base before the aurora
```

I renamed `slate` to `ink` for one reason: **agents and humans should never reach for `slate-700` directly in this codebase.** The rename forces every reference to go through the token. The token has a "Use" column. The "Use" column tells you that `--ink-700` is for headings on light backgrounds, full stop. You don't pick `--ink-700` because the number is bigger than `--ink-600`; you pick it because you're writing a heading.

The "Use" column is the only thing that makes this table earn its keep. If you list eleven hex values without telling the agent when each applies, you've documented Tailwind's source code with extra steps.

What stuck: the rename. Six months in, there is exactly one `class="text-slate-…"` in the entire repo, and it's in a `vendor/` CSS file targeting a third-party widget. The rest goes through `--ink-*` tokens.

What I'd change: `--ink-200` and `--ink-300` are doing too much double duty (border vs disabled). I should split `--border-default` / `--border-strong` (which already exist as semantic tokens — see Section 1.3 below) and drop `--ink-200`/`--ink-300` from the "use directly" surface. Today an agent can still grab `--ink-200` for a border; that ambiguity costs me about one PR comment per month.

---

## Section 1.2 — The accent palette and the inverted-convention paragraph

This is the section that did the most for agent consistency. The accent is amber.

```markdown
### 1.2 Accent — --accent-* (deep amber)

One signature color. Used like a highlighter: links, primary buttons,
focus rings, the underline in the hero, chart strokes, never a section
background.

| --accent-50  | #FFFBEB | Hover tint on cards, soft accent washes
| --accent-100 | #FEF3C7 | Selected chip background
| ...
| --accent-600 | #D97706 | Primary accent. Buttons, links, hero highlight
| --accent-700 | #B45309 | Pressed state of primary actions
```

Two non-obvious calls in here:

1. **"Used like a highlighter, never a section background."** This is the single most enforced rule in the file. Agents asked to "add a CTA section" will reach for accent-tinted backgrounds by default — they've seen thousands of SaaS sites do exactly that. The one-line ban kills it.

2. **The "Rationale" block right after the table.** It's three sentences, ends with: *"Fallback if it ever reads 'too Substack': electric violet `#7C3AED`."* This is unusual to commit to a design doc. It exists because I rewrote the accent twice during the build (orange → red → amber), and I wanted the next person — me, six months later, with fresh eyes — to know the decision was deliberate, not inertia. The fallback isn't even wired up; documenting it freezes the conversation. Without the line, the next "should we change the accent?" debate would start from scratch.

What stuck: every single accent reference goes through `--accent-600` or one of its lighter tints. Zero `#D97706` literals in the codebase. The pre-commit hook from Part 2 catches them before they land.

What I changed: the "(reserve)" entries (`--accent-200`, `-400`, `-800`, `-900`, `-950`) used to clutter this table. They were aspirational — five tokens documented but never used, giving the agent five extra wrong answers. The current file lists only the six accent steps that have a documented role; the remaining Tailwind amber steps stay defined in `tokens.css` for when they earn one. A small footnote on the table now states the rule.

---

## Section 1.3 — Semantic surfaces: the section that earns its keep weekly

This is the part of the file I reference most when reviewing PRs (or when an agent has produced something off-spec).

```markdown
| --surface-base     | --ink-50           | Main page background
| --surface-raised   | #FFFFFF            | Cards, dropdowns
| --surface-sunken   | --ink-100          | Alternate section, code bg
| --surface-inverse  | --ink-900          | Hero, CTA band, footer
| --surface-glow     | color-mix(…)       | Aurora blobs, button glow
| --text-strong      | --ink-900          | h1, h2
| --text-default     | --ink-700          | h3-h6, body
| --text-muted       | --ink-500          | secondary body, meta
| --text-faint       | --ink-400          | captions, breadcrumb separator
| --border-default   | --ink-200          | hairline divider
| --border-strong    | --ink-300          | input border
| --border-accent    | --accent-600       | focus outline base
```

These are **role tokens**. They resolve to value tokens, but you reference them by **what they do**, not by which value. An agent told to "add an alternating section band" goes to `--surface-sunken`. It doesn't matter that today `--surface-sunken` is `--ink-100`; if next year I lighten the alternating bands to `#FAFAFA`, every consumer updates for free.

The role-tokens-over-value-tokens rule is the single most leveraged decision in this file. It's also the part of the file I'd point at first if a teammate asked "why is your design.md three times longer than mine?"

What stuck: every new component uses semantic tokens by default. I haven't had to write a "use semantic tokens" PR comment in 4+ months. The agent learns it on the first session because the existing components in the repo all do it.

What I changed: added `--text-muted-on-raised` (`--ink-600`) — agents had been reaching for `--text-muted` on white cards, which sometimes lacks contrast against `--surface-raised`. One missing token would otherwise produce ten "looks slightly washed out" PRs over a year. The token and its design.md row both landed in the same commit (per Section 10's rule).

---

## Section 1.4 — Documenting what isn't built yet

```markdown
### 1.4 Dark mode (documented, not yet wired)

.dark { … } mirror in tokens.css. Inverts --surface-base ↔ --surface-inverse,
text-strong becomes --ink-50, accent stays the same (amber works on both).
Not turned on at runtime in v1 — the body class stays `light`.
```

This is a small section that punches above its weight. It documents an **intent** that doesn't exist in code yet.

Why bother? Because agents asked to "add a dark mode toggle" will otherwise improvise — and the improvisation will fork into shapes that don't match my plan. The four sentences here are a contract with future-me: when dark mode lands, it lands *this* way. An agent that proposes a different inversion strategy gets pushed back to this section.

This is also, I think, what Part 2's `MIGRATIONS.md` is doing for *code*: marking what's frozen, what's current, what's the target. Section 1.4 is doing it for *design*.

What I changed: added a `Last reviewed: 2026-05-18` line and a hard `Decision deadline: 2026-12-31`. If dark mode isn't wired by the deadline, the section gets deleted — keeping a "documented, not yet wired" promise alive longer than that is exactly the kind of drift the audit script in Part 11 is built to flag.

---

## Section 2 — Typography: three families, and why the second one matters

```markdown
- Inter (variable) — UI, headings, navigation, captions.
- Source Serif 4 (variable) — long-form post body only.
- JetBrains Mono — inline code, code blocks.
```

The unusual one is **Source Serif 4 for post body only**. Most personal sites pick one family and ride it. Source Serif costs me ~30KB extra on essay pages.

Reason: the site has two reading modes — UI text (skim) and essay text (linger). The same font for both makes long-form essays feel like documentation. Switching to a serif at the body level signals "stay a while" without any other UI affordance.

The relevant part for agents is that I document **which family applies where**:

```markdown
| Token       | Use
| display-2xl | Hero title (/)                    ← Inter
| display-xl  | Post hero title                   ← Inter
| body-lg     | Post body, intro paragraphs       ← Source Serif
| body        | Default UI body                   ← Inter
| body-sm     | Card meta, secondary copy         ← Inter
| mono        | Inline code (JetBrains Mono)      ← JetBrains Mono
```

An agent asked to "add a long-form section" reads the type scale, sees `body-lg` mapped to Source Serif, uses it. Without the annotation, the agent will pick `body` (Inter) and the section reads as UI not prose.

What stuck: zero hand-rolled font sizes in the codebase since shipping. Every text element uses a token.

What I'd change: I'd consolidate `display-2xl` / `display-xl` / `display-lg` into two — `display-hero` and `display-page`. Three sizes for "big title" is two more than I needed.

---

## Section 3 — Spacing: the line that does the most work

The spacing scale is unremarkable (4px base, Tailwind-aligned). What matters is the sentence after the table:

> "Use Tailwind's matching utility (`p-6` = `--space-6`). When the spec doesn't have a value you need, you're probably reaching for a token that doesn't exist yet — pause and ask."

That sentence is the one I quote when an agent has produced `p-[19px]` or `mt-[37px]`. There's no formal lint rule for arbitrary spacing utilities (yet); the line in design.md plus the convention of the rest of the codebase is enough to make the agent stop and pick the nearest scale value. Across 100+ PRs, I've had to add the rule manually once.

What stuck: arbitrary spacing classes in the codebase are countable on one hand, and each one has a comment explaining why.

What I'd change: write the lint gate. The rule is *"any `[NNpx]` value that isn't `[0.5px]` should be a token reference"* — a five-line grep would catch it. The fact that I haven't is laziness, not principle.

---

## Section 5 — Shadows: a token that pays for itself

Most design.md files have a shadow scale and a "use sparingly" line. Mine has that — plus one extra token:

```markdown
| --shadow-glow | 0 0 32px -4px rgb(217 119 6 / 0.25)  | Primary button hover,
                                                          hero accents
```

`--shadow-glow` is an amber-tinted shadow. It's used in exactly two places (the primary button on hover; the hero text underline). It exists because **agents will produce coloured shadows when asked to "make the button feel more interactive"** — and without a sanctioned coloured shadow, they'll invent one. The token sanctions the one I want, with the alpha and offset I want, and that becomes the answer.

This is the smallest possible illustration of the broader rule from Part 4: *document what you DO use AND what you don't.* The shadow section opens with: *"Never use Tailwind's defaults — they're too dark for amber."* That ban is the half that does the work; the four sanctioned shadows are the half that gets imitated.

What stuck: every coloured shadow in the codebase is `--shadow-glow`. No invented gradients-as-shadows, no hot-pink experiments.

What I'd change: nothing. This section is the right size.

---

## Section 6 — Motion: the principles section is the load-bearing one

The motion section opens with four principles before any tokens:

```markdown
1. Motion is feedback, never decoration that interrupts.
2. Default is fast (150-250ms).
3. Always respect prefers-reduced-motion.
4. One thing at a time.
```

Then the token table. Then five concrete patterns.

The principles section is the part agents reference most when proposing motion. "Add a fade-in to the testimonial section" → the agent reads principle 1 and proposes a CSS-only fade triggered by IntersectionObserver, not a 2-second framer-motion entrance. Principle 4 ("one thing at a time") shut down five separate proposals where the agent wanted to fade-AND-scale-AND-slide simultaneously.

This is also where I licensed one exception explicitly:

> "Exception: the hero aurora is allowed to be decorative because it lives at the page entry point and never blocks reading."

Without that line, the aurora would be in tension with principle 1. With it, the aurora is endorsed exactly once, in exactly one place, and any new "let's add a decorative animation to the about page" proposal can be rejected by citing the exception's narrowness.

What stuck: zero motion regressions in 6 months. Every animation in the codebase respects `prefers-reduced-motion`. The agent never had to be reminded.

What I changed: added an explicit Section 6.4 *Banned motions* sub-section. The bans used to be implicit in principles 1 and 4; the explicit list — no parallax, no scroll-jacking, no entrance animations on every scroll-into-view element, no animated success checkmarks, no pulsing skeletons, no hover-on-touch — saves the next argument by pre-empting it.

---

## Section 7 — Component primitives: state tables earn their keep

Section 7 is the longest section in the file (eleven primitives). Each has the same shape: anatomy, variants, state table.

The button section is the smallest illustrative example:

```markdown
| State    | primary                              | secondary                | ghost
| rest     | bg --accent-600, text white          | border --ink-700, ...    | text --text-default
| hover    | bg --accent-500, shadow-glow         | bg --ink-700, text white | bg --ink-100
| active   | bg --accent-700                      | bg --ink-800             | bg --ink-200
| focus    | + focus ring                         | same                     | same
| disabled | bg --ink-200, text --ink-400         | border --ink-200, ...    | text --ink-400
```

A state-by-state table is more work to write than "describe the button states in prose." It earns its keep because **agents writing a button extension (e.g., adding a `success` variant) will mirror the table's row structure.** I've added two new variants since shipping; both arrived with full state coverage on the first PR.

What stuck: every button instance in the codebase reads from these exact tokens. No "what does hover do?" PR comments.

What I'd change: I'd add a `loading` state row — but only *after* the button has a real loading state in code, which it doesn't yet. The design intent has been "the button shows a spinner during a mutation," but no `.is-loading` / `aria-busy` wiring exists in the actual `.btn` styles or any consumer component. So the honest move is to build the state first, then document it; documenting a state that isn't real would be the exact drift this series argues against. On the queue.

---

## Section 8 — Page archetypes: ASCII for the win

```
HOME
┌───────────────────────────────────────────────────┐
│ HomepageHero (full-bleed inverse, aurora bg)      │ inverse
├───────────────────────────────────────────────────┤
│ CurrentRoleStrip (the journey timeline)           │ base
├───────────────────────────────────────────────────┤
│ NowFocus (3 cards · what I'm focused on)          │ sunken
├───────────────────────────────────────────────────┤
│ RecentEssaysList (feature + reading list)         │ base
├───────────────────────────────────────────────────┤
│ RecentTechnicalPostsCarousel                      │ sunken
├───────────────────────────────────────────────────┤
│ ClientTestimonialsCarousel                        │ ink-900 (dark)
├───────────────────────────────────────────────────┤
│ NewsletterSignup (light card · breaks dark seam)  │ base
├───────────────────────────────────────────────────┤
│ SiteFooter (CTA + meta · scribble + glow)         │ inverse
└───────────────────────────────────────────────────┘
```

Three archetypes (Home, Essays Index, Essay Detail) with right-side surface annotation. Each diagram took ten minutes to make and saved ten arguments.

The right column — `inverse`, `base`, `sunken`, `ink-900` — is the part that matters. It enforces a **surface alternation rule** that's spelled out below the diagram:

> "Surface alternation pattern: inverse → base → sunken → base → sunken → ink-900 → base → inverse. No two adjacent sections share a tone."

That rule kills the most common "let's add a section between X and Y" proposal that would have placed two `base` sections back-to-back.

What stuck: the home page has gone through three layout iterations. The surface alternation has held every time. Adding a new section starts with "what surface tone does this need to be?" — answered by what comes before and after.

What I changed: added a fourth archetype for *series posts* (PostHero → SeriesNavStrip → body → SeriesContinueBlock → SiteFooter), since the shape is distinct from a standalone essay. Agents had been reading two posts to figure out the series layout; one archetype diagram makes it explicit, including the `RelatedPosts is intentionally suppressed on series posts` note that codifies the actual branching in `pages/[...slug].astro`.

---

## Section 10 — How to extend: the section that closes the loop

The last section is four bullets and one line:

```markdown
- New section on home → propose it in this doc first, then build it.
- New token → add to tokens.css + this doc in the same commit.
- Component needs a new state → document it in Section 7 before shipping.
- Page that doesn't fit an archetype → add a new archetype sketch in Section 8.

If you find yourself reaching for an inline hex / px / ms value, stop and
add a token.
```

This is the section that prevents drift. Every other section is enforcement; this one is the **process** that keeps the enforcement honest.

The "in the same commit" part of bullet 2 is the most violated rule across the audits in Part 1. Teams add tokens to the CSS but forget the doc, or update the doc without the code. Either way, the doc and the codebase fall out of sync. The single-commit rule is annoying and worth it.

The last line — "stop and add a token" — is the prompt I quote when reviewing a PR with `[19px]` or `rgb(…)` in it. The fix is never "use a different existing token"; the fix is **add the new token**, document it, then use it. Adding tokens is cheap; living with drift is expensive.

What stuck: the design.md and `tokens.css` have stayed in sync across 50+ commits since shipping. Every time they've drifted, the drift was caught in PR review within a day.

What I changed: instead of adding a fifth bullet, I added a whole new Section 9.5 *Anti-patterns* section that consolidates the bans previously scattered across Section 0, Section 1.2, Section 5, Section 6, and Section 10.1. Part 4 of the series argues the ban list is half the file's value; it now lives in one place where the agent will find it on the first read. Ten bullets, each cross-referenced to the section that originated the rule.

---

## Section 10.1 — Where to put styles: the smallest most important section

```markdown
- Tailwind utilities on the markup — first choice when ...
- A file under src/styles/components/<name>.css — when the rule needs ...
- A file under src/styles/vendor/<lib>.css — when the selector targets ...

Don't reach for CSS-in-JS, styled-components, or UnoCSS — the project is
intentionally CSS-first with Tailwind utilities and tokenized custom CSS
as the only two levers.
```

Three places, one rule each, plus an explicit ban on three libraries the agent might otherwise reach for.

The last sentence is the one that pays off. Every time I open a fresh Claude Code session and ask for a new component, the agent reads this section before writing styles. It never proposes `styled-components`. It never proposes UnoCSS. It never proposes a CSS-in-JS migration. Those proposals would be fine — the project is small enough that the rebuild would take an afternoon — and the agent never even raises them because the design.md ruled them out.

What stuck: the styling architecture has not changed since the file was written. Zero migrations attempted.

What I changed: added Emotion and CSS Modules to the ban list explicitly. CSS Modules aren't a current temptation for an Astro + Tailwind project, but the moment any future migration to Next App Router gets discussed, the agent will reach for them by default. Banning preemptively costs one line and saves a debate.

---

## What the file does not have

In the spirit of Part 4's "what NOT to put in design.md" section, here's what I deliberately left out of this file:

- **Component prop documentation.** That lives in the component source. The design.md says "Button has these variants and states." It does not list every prop or describe the TypeScript signature.
- **Code samples longer than ~10 lines.** Anything longer is in `src/`, linked.
- **Architecture decisions.** Where files go, naming conventions, the build system — all in `AGENTS.md` (which is the symlink target of `CLAUDE.md`; see Part 3). The design.md is purely about visual decisions.
- **Migration history.** This file describes what *is*, not what *was*. If I rip out Source Serif next year, the line goes away; the change is in the commit message and `MIGRATIONS.md`, not in here.
- **Marketing copy or product positioning.** Those belong in `src/data/site.ts` and the home page itself.

The file is 430 lines. Without the discipline above it would be 2,000 lines and unread.

---

## What I changed while writing this post, and what's still pending

Writing a post about your own design.md turns out to be the most efficient design.md review I've ever done. While sitting with each section above, I noticed eight amendments worth shipping right away — small, low-risk, doc-only or doc-plus-one-token edits. They're in the file linked above; the live document is the *post-amendment* version.

**Actioned in v1.1 (the version linked above)**:

1. ✅ Added explicit *Draw from / Avoid* reference pairs to Section 0 — Stripe Press / Linear / Vercel / Pirsig vs Substack / Notion marketing / Material Design defaults / SaaS gradient heroes.
2. ✅ Dropped `(reserve)` rows from the accent palette table — five tokens that were aspirational gave the agent five extra wrong answers.
3. ✅ Added `--text-muted-on-raised` (`--ink-600`) for white-card secondary text — and wired it in `tokens.css` in the same commit, per Section 10's rule.
4. ✅ Added `last_reviewed: 2026-05-18` and a `2026-12-31` decision deadline to Section 1.4 (dark mode), so the section can't sit silently for years.
5. ✅ Added a Section 6.4 *Banned motions* block — parallax, scroll-jacking, per-section entrance animations, pulsing skeletons, hover effects on touch-only contexts.
6. ✅ Added a fourth page archetype to Section 8 for series posts (PostHero → SeriesNavStrip → body → SeriesContinueBlock → SiteFooter), with the surface-tone annotation matching the alternation rule.
7. ✅ Added a Section 9.5 *Anti-patterns* block consolidating the bans previously scattered across Section 0, Section 1.2, Section 5, Section 6, Section 10.1 — the single most agent-relevant section in the file now lives in one place.
8. ✅ Expanded Section 10.1's banned-styling-system list to include Emotion and CSS Modules explicitly. The CSS Modules ban is preemptive: it's not a temptation today, but it would be the moment any future migration to Next App Router gets discussed.

**Still pending** (the changes that need real code work, not just doc edits):

1. 🔜 Split `--ink-200`/`--ink-300` direct usage — `--border-default`/`--border-strong` already exist, but a handful of components still reach for `--ink-200` directly. Mechanical refactor; one PR.
2. 🔜 Consolidate `display-2xl`/`display-xl`/`display-lg` into two sizes. Touches every page header.
3. 🔜 Write the lint gate for arbitrary spacing utilities (`[19px]`, `[37px]`, etc.). Five-line grep, but needs CI wiring.
4. 🔜 Add a `loading` state row to the button table — *first* the button needs a real loading state in code; today there isn't one, despite the design intent to have one. (I overclaimed in the Section 7.1 section above; that line is the most honest correction in this list.)

None of these are emergencies. The eight that shipped this week did so because writing them down made them obvious. The four that remain need a real change-set to land safely, and those will earn their own commit messages.

A design.md should evolve at the rate of *one observed agent mistake per amendment* — except for the day you sit down to audit it on purpose, when batching is fine. This post was that day.

---

## How this fits with the rest of the series

This is the **artifact** the rest of the series points at:

- Part 4 (the meta-template) is the **shape** of the file.
- Parts 7–9 (MUI / Chakra v3 / Tailwind + shadcn) are **stack-specific** complete templates.
- Part 11 (the audit) is the script that tells you whether the file is still working.
- This post is the **lived example** — the same shape, in real use, with the decisions footnoted.

If you've read the series to here and still feel "but I don't know what mine should look like," the answer is: read this site's design.md, copy the structure, and rewrite every word for your project. Don't copy the tokens, don't copy the brand voice, don't copy the components — copy the **shape of the decisions you need to make**, then make them for your team.

The file is here, MIT-licensed, in active use: [design.md on GitHub][repo-design-md]. The `git log` is also instructive — every meaningful design decision in the last six months left a fingerprint there.

[repo-design-md]: https://github.com/poudelprakash/personal_blog_2026/blob/main/design.md

The next time you open a fresh agent session in your own codebase, the question isn't "should I write a design.md." You should. The question is "which section should I write first." Pick the one your last bad PR would have prevented. Write fifty lines. Commit. Repeat.

That's the whole trick.
