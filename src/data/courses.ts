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
