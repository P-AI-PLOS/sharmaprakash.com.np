/**
 * Registry of workshops. A workshop is a self-paced, hands-on lab series with
 * its own landing page (`/workshop/<slug>/`) and chapter pages
 * (`/workshop/<chapter>/`). Workshops are intentionally separate from courses
 * and from the blog/series stream — they have a sales-page-style landing,
 * progress tracking, and a fixed lab order.
 *
 * Each chapter renders the body of an existing post (referenced by its
 * content-collection ID — the post filename with the YYYY-MM-DD prefix
 * stripped and no extension). Concept essays that pair with the workshop
 * stay as regular blog posts and are linked from the chapter sidebar.
 */

export interface WorkshopChapter {
  /** URL segment for the chapter, e.g. "lab-hook". */
  slug: string;
  /** Short label for the sidebar/syllabus. */
  label: string;
  /** ID of the post whose body becomes this chapter's content. */
  postId: string;
}

export interface WorkshopFaqItem {
  q: string;
  a: string;
}

export interface WorkshopAudience {
  for: string[];
  notFor: string[];
}

export interface WorkshopBuildArtifact {
  kicker: string;
  title: string;
  outcome: string;
  code: string;
  lang?: string;
}

export interface WorkshopPrereq {
  title: string;
  why: string;
}

export interface WorkshopRelatedReading {
  label: string;
  /** Absolute path on the site, e.g. "/claude-hooks-lifecycle-primer/". */
  href: string;
  blurb?: string;
}

export interface WorkshopMeta {
  title: string;
  /** One-sentence summary shown on cards and the homepage spotlight. */
  description: string;
  /** Short hero headline (often punchier than `title`). */
  tagline: string;
  /** Long pitch shown below the hero on the landing. */
  problem: string;
  /** Cover image used on the landing, spotlight, and card. */
  cover: string;
  durationLabel: string;
  format: string;
  chapters: WorkshopChapter[];
  build: WorkshopBuildArtifact[];
  audience: WorkshopAudience;
  prereqs: WorkshopPrereq[];
  faq: WorkshopFaqItem[];
  /** Concept essays (blog posts) that pair with the workshop. */
  relatedReading?: WorkshopRelatedReading[];
}

export const workshopRegistry: Record<string, WorkshopMeta> = {
  "hooks-subagents-skills": {
    title: "Prompts · Hooks · Subagents · Skills",
    description:
      "A hands-on workshop that turns the four-layer agent-ready stack into muscle memory: one prompt, one hook, one subagent, one skill, against a planted bug in a starter repo.",
    tagline: "Stop repeating yourself to your agent.",
    problem:
      "You've corrected your agent the same way three times this week. The barrel import that breaks tree-shaking. The test file that uses `any`. The migration that ships without a backfill. The rule lives in your head — until you encode it. A prompt writes it down. A hook blocks it at the lifecycle. A subagent audits the rest of the repo. A skill gives the workflow a name you can call.",
    cover: "/images/blog/series/agent-ready-react.png",
    durationLabel: "~100 minutes",
    format: "Six chapters · self-paced · free",
    chapters: [
      { slug: "setup", label: "Lab setup: clone and plant the bug", postId: "setup" },
      { slug: "lab-prompt", label: "Lab 1 — Prompt", postId: "lab-prompt" },
      { slug: "lab-hook", label: "Lab 2 — Hook", postId: "lab-hook" },
      { slug: "lab-subagent", label: "Lab 3 — Subagent", postId: "lab-subagent" },
      { slug: "lab-skill", label: "Lab 4 — Skill", postId: "lab-skill" },
      { slug: "capstone", label: "Capstone: design your own stack", postId: "capstone" },
    ],
    build: [
      {
        kicker: "01 · Prompt",
        title: "A prompt that defines the rule",
        outcome:
          "A definitive instruction document in `.claude/prompts/` — what counts as a violation, what doesn't, and the suggested fix. The source of truth the next three layers reference.",
        lang: "markdown",
        code: `# .claude/prompts/no-barrel-imports.md
## Rule
A barrel import is any import whose specifier
ends in /index or resolves to a re-exporting
directory. Rewrite to the leaf path. Do not
rename symbols.`,
      },
      {
        kicker: "02 · Hook",
        title: "A hook that rejects barrel imports",
        outcome:
          "A PreToolUse hook fires on every Write/Edit and blocks the diff before the agent finishes the turn.",
        lang: "bash",
        code: `# .claude/hooks/no-barrel-imports.sh
grep -nE "from ['\\"]\\..*/index['\\"]" "$CLAUDE_FILE_PATH" \\
  && { echo "Barrel import. Import the leaf instead." >&2; exit 2; }`,
      },
      {
        kicker: "03 · Subagent",
        title: "A subagent that audits the codebase",
        outcome:
          "An audit subagent sweeps the rest of the repo for siblings of the bug the hook just caught, and reports them grouped by file.",
        lang: "yaml",
        code: `# .claude/agents/barrel-auditor.md
---
name: barrel-auditor
description: Sweep for barrel-import siblings.
tools: [Grep, Read]
---
Find every \`from '.../index'\` outside tests.
Group by file. Suggest the leaf path.`,
      },
      {
        kicker: "04 · Skill",
        title: "A skill that wires both into one command",
        outcome:
          "/fix-barrels invokes the auditor, applies the codemod, and re-runs the hook to verify. One name, the whole workflow.",
        lang: "markdown",
        code: `# .claude/skills/fix-barrels.md
---
name: fix-barrels
description: Audit barrels, rewrite to leaves, verify.
---
1. Run barrel-auditor.
2. For each finding, rewrite the import.
3. Trigger the hook to confirm green.`,
      },
    ],
    audience: {
      for: [
        "You already use Claude Code daily and feel the friction of repeating the same correction.",
        "You want repo-local automation that ships with the code, not a vendor's dashboard.",
        "You read the agent-ready trilogy and want to build the muscle, not just the model.",
      ],
      notFor: [
        "You're brand-new to Claude Code — start with the lifecycle primer essay first.",
        "You're looking for prompt-engineering tips. This is about lifecycle code, not prompts.",
        "You want a video course. Every chapter is a written lab; bring your own terminal.",
      ],
    },
    prereqs: [
      { title: "Claude Code installed and authenticated", why: "Every lab runs against your local CLI." },
      { title: "Node ≥ 20 and git", why: "The starter repo is a small Node project; git lets you reset between labs." },
      { title: "A real repo you maintain", why: "The capstone asks you to port the triple to a rule you already repeat." },
      { title: "~90 minutes, end-to-end", why: "Labs build on each other — easier in one sitting than across days." },
    ],
    faq: [
      {
        q: "Is it really free?",
        a: "Yes. Every chapter is a public blog post. No login, no email gate, no upsell at the end.",
      },
      {
        q: "Do I need a paid Claude plan?",
        a: "A free Claude account is enough to run the hook and skill. The auditor subagent benefits from a higher quota — labs note where you can stub responses if you hit a limit.",
      },
      {
        q: "Can I use my own repo instead of the starter?",
        a: "After lab 1, yes. The starter exists so the planted bug is identical for everyone; once you've shipped one hook, point it at your own codebase.",
      },
      {
        q: "How long does this really take?",
        a: "~100 minutes cold. ~75 if you've already read the agent-ready trilogy. The capstone is a 10-minute worksheet — don't skip it.",
      },
      {
        q: "What if I get stuck on a lab?",
        a: "Each lab ends with a 'reset and re-run' block — drop the changes, copy the working snippet, then read the diff. Stuck for real? Ping me; the link is in the site footer.",
      },
    ],
    relatedReading: [
      {
        label: "Task-specific agent prompts that work",
        href: "/ai/task-prompts-that-work/",
        blurb: "The structure of a definitive instruction document — purpose, references, rules, checklist.",
      },
      {
        label: "The Claude hooks lifecycle",
        href: "/ai/claude-hooks-lifecycle-primer/",
        blurb: "Why hooks fire when they do, and which events you can intercept.",
      },
      {
        label: "From audit to hook enforcement",
        href: "/ai/from-audit-to-hook-enforcement/",
        blurb: "Promoting a repeated correction into a deterministic guardrail.",
      },
      {
        label: "Subagents that catch what hooks can't",
        href: "/ai/subagents-that-catch-what-hooks-cant/",
        blurb: "Where subagents fit between hooks and skills, and what they're best at.",
      },
      {
        label: "Skills: the user-facing workflow layer",
        href: "/ai/skills-the-user-facing-workflow-layer/",
        blurb: "Skills give a workflow a name you can call from the prompt.",
      },
    ],
  },
};
