/**
 * Registry of step-wise courses. A course is an ordered set of chapters,
 * where each chapter renders the body of an existing post (referenced by
 * its content-collection ID — the post filename with the YYYY-MM-DD prefix
 * stripped and no extension).
 *
 * Each chapter has its own slug used in the URL (/course/<course>/<chapter>/)
 * so chapters can be renamed without disturbing the post URL.
 *
 * Optional `audio` is a future hook for audio lessons — when present, the
 * chapter view renders a player above the prose. Stays null until recorded.
 */

export interface CourseChapter {
  /** URL segment for the chapter, e.g. "ingest-transcripts". */
  slug: string;
  /** Short label for the sidebar. */
  label: string;
  /** ID of the post whose body becomes this chapter's content. */
  postId: string;
  /** Optional path or URL to an audio lesson (mp3/m4a). */
  audio?: string;
}

export interface CourseMeta {
  title: string;
  /** One-sentence summary shown on the catalog card and landing. */
  description: string;
  /** Longer pitch shown on the landing page below the title. */
  intro: string;
  cover: string;
  chapters: CourseChapter[];
}

export const courseRegistry: Record<string, CourseMeta> = {
  "hooks-subagents-skills": {
    title: "Hooks · Subagents · Skills",
    description:
      "A hands-on workshop that turns the three-layer agent-ready stack into muscle memory: one hook, one subagent, one skill, against a planted bug in a starter repo.",
    intro:
      "Nine chapters. The first four are the trilogy of concept essays — hooks lifecycle, audit-to-enforcement, subagents, skills. The next five are labs: clone a starter repo with a planted barrel-import bug, then build the hook that blocks it, the subagent that audits its siblings, and the skill that wires both into a single slash command. Plan for ~90 minutes if you do the labs cold; ~65 minutes if you've already read the trilogy. The capstone is a 10-minute worksheet that lets you design the same triple for a rule you keep repeating in your own codebase.",
    cover: "/images/blog/series/agent-ready-react.png",
    chapters: [
      {
        slug: "hooks-lifecycle-primer",
        label: "The Claude hooks lifecycle",
        postId: "claude-hooks-lifecycle-primer",
      },
      {
        slug: "audit-to-hook",
        label: "From audit to hook enforcement",
        postId: "from-audit-to-hook-enforcement",
      },
      {
        slug: "subagents",
        label: "Subagents that catch what hooks can't",
        postId: "subagents-that-catch-what-hooks-cant",
      },
      {
        slug: "skills",
        label: "Skills: the user-facing workflow layer",
        postId: "skills-the-user-facing-workflow-layer",
      },
      {
        slug: "setup",
        label: "Lab setup: clone and plant the bug",
        postId: "setup",
      },
      {
        slug: "lab-hook",
        label: "Lab 1 — Hook",
        postId: "lab-hook",
      },
      {
        slug: "lab-subagent",
        label: "Lab 2 — Subagent",
        postId: "lab-subagent",
      },
      {
        slug: "lab-skill",
        label: "Lab 3 — Skill",
        postId: "lab-skill",
      },
      {
        slug: "capstone",
        label: "Capstone: design your own triple",
        postId: "capstone",
      },
    ],
  },
  "ai-podcast-index": {
    title: "Build an AI Podcast Index",
    description:
      "Ship a local tool that ingests a YouTube podcast channel, extracts guests and topics with Claude, and lets you clip-search by intent.",
    intro:
      "Eight chapters, one working artifact. You'll go from an empty repo to a Python + FastAPI + React app running on your laptop — ingesting transcripts, extracting structured data with Claude, resolving guest identities, full-text searching without embeddings, and generating grounded questions for the next episode.",
    cover: "/images/blog/series/ai-podcast-index.png",
    chapters: [
      {
        slug: "overview",
        label: "Project & stack overview",
        postId: "ai-podcast-index-project-overview",
      },
      {
        slug: "ingest-transcripts",
        label: "Ingesting YouTube transcripts",
        postId: "ingesting-youtube-transcripts",
      },
      {
        slug: "structured-extraction",
        label: "Structured extraction with Claude",
        postId: "structured-extraction-with-claude",
      },
      {
        slug: "entity-resolution",
        label: "Guest entity resolution",
        postId: "guest-entity-resolution",
      },
      {
        slug: "provider-switching",
        label: "Provider-switching LLM client",
        postId: "provider-switching-llm-client",
      },
      {
        slug: "search",
        label: "Search without embeddings",
        postId: "search-without-embeddings",
      },
      {
        slug: "react-frontend",
        label: "React frontend",
        postId: "react-frontend-for-podcast-index",
      },
      {
        slug: "ship",
        label: "Question generator & shipping locally",
        postId: "question-generator-and-shipping-locally",
      },
    ],
  },
};
