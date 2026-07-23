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
  "continuous-discovery": {
    title: "Continuous Discovery, Hands-On",
    description:
      "Learn opportunity solution trees by running the whole discovery loop against one product — from outcome to opportunities to experiments — with interactive exercises and a tree of your own at the end.",
    intro:
      "Six modules, one running case. You'll follow the product team at Donut CRM — a relationship-first CRM for founders — as they define an outcome, mine interviews for opportunities, recruit and run discovery sessions, ideate solutions solo and as a group, and design assumption tests that kill bad ideas cheaply. Every module ends with work on your own product: an interactive tree builder persists your outcome, opportunities, and solutions across the course, and classification exercises train the distinctions (opportunity vs. solution vs. experiment) that make the method work. Reading it is the easy half; do the exercises.",
    cover: "/images/blog/series/continuous-discovery.png",
    chapters: [
      {
        slug: "tree",
        label: "The tree: outcomes, opportunities, solutions",
        postId: "opportunity-solution-trees-the-shape-of-good-discovery",
      },
      {
        slug: "opportunities",
        label: "Finding opportunities: interviews & JTBD",
        postId: "finding-opportunities-interviews-jtbd-and-the-opportunity-space",
      },
      {
        slug: "sessions",
        label: "Running discovery sessions",
        postId: "running-discovery-sessions-recruiting-outreach-and-no-shows",
      },
      {
        slug: "solutions",
        label: "From opportunities to solutions",
        postId: "from-opportunities-to-solutions-ideating-alone-and-together",
      },
      {
        slug: "experiments",
        label: "Assumption mapping & experiments",
        postId: "assumption-mapping-experiments-that-test-the-riskiest-thing-first",
      },
      {
        slug: "habit",
        label: "Making discovery a habit",
        postId: "making-discovery-a-habit-cdh-alongside-shape-up-okrs-and-agile",
      },
    ],
  },
  "ship-the-product-not-the-date": {
    title: "Ship the Product, Not the Date",
    description:
      "A short workshop course on what happens when organizations hold the date and move the definition of done — two documented case studies, then a ready-to-run TRIZ session to find the same failure mode in your own team.",
    intro:
      "Three chapters, one failure mode. First the evidence: Sonos held its launch window and shipped an app missing alarms and accessibility features, and the bill — apology, layoffs, a 16% revenue drop, the CEO's job — arrived over eight documented months. Then the other branch of the same fork: Cyberpunk 2077 moved its date three times and refused to move anything else, paying in crunch and a storefront delisting. The capstone is a facilitation script you can run with your own team: a 45-minute Liberating Structures TRIZ session where the group designs the disaster from scratch, discovers how much of the recipe it already practices, and commits to stopping one piece of it.",
    cover: "/images/blog/series/agile-first-principles.png",
    chapters: [
      {
        slug: "case-sonos",
        label: "Case: Sonos shipped the date",
        postId: "sonos-shipped-the-date-not-the-app",
      },
      {
        slug: "case-cyberpunk",
        label: "Case: the deadline that moved three times",
        postId: "the-deadline-that-moved-three-times",
      },
      {
        slug: "triz-workshop",
        label: "Workshop: the TRIZ session",
        postId: "triz-session-sonos-shipped-the-date",
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
        postId: "clipdex-project-overview",
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
        postId: "clipdex-react-frontend",
      },
      {
        slug: "ship",
        label: "Question generator & shipping locally",
        postId: "question-generator-and-shipping-locally",
      },
    ],
  },
};
