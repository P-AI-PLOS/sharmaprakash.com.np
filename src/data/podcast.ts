/**
 * Registry of published podcast episodes. Each entry pins a finalized MP3
 * stored as a GitHub Release asset to its source post (series + seriesOrder).
 *
 * The post detail page reads this registry: if the post being rendered has
 * a matching entry, <PodcastPlayer> appears between the hero and the body.
 *
 * Populated by scripts/podcast/publish.sh after a successful release upload.
 */
export interface PodcastEpisode {
  series: string;
  order: number;
  title: string;
  summary: string;
  /** Public URL of the source essay this episode is paired with. */
  postUrl: string;
  /** Public Release asset URL — looks like https://github.com/<owner>/<repo>/releases/download/<tag>/<file>.mp3 */
  audioUrl: string;
  /** Total duration in seconds. */
  duration: number;
  /** Relative path to the transcript markdown, or null if not generated yet. */
  transcript: string | null;
  /** ISO-8601 publish timestamp. */
  publishedAt: string;
}

export const podcastEpisodes: PodcastEpisode[] = [
  {
    series: "ai-coding-setup",
    order: 1,
    title: "The Two Configuration Layers Every AI Developer Needs",
    summary:
      "Global rules that follow you everywhere, project rules that stay with the code — and the hour you save by getting the layering right before your first agentic session.",
    postUrl: "/ai/two-configuration-layers-ai-developer/",
    audioUrl:
      "https://github.com/P-AI-PLOS/sharmaprakash.com.np/releases/download/podcast-ai-coding-setup-ep-01/ep-01.mp3",
    duration: 2774,
    transcript: "podcast/ai-coding-setup/ep-01.transcript.md",
    publishedAt: "2026-05-17T00:00:00+05:45",
  },
  {
    series: "ai-coding-setup",
    order: 2,
    title: "Writing CLAUDE.md That Agents Actually Follow",
    summary:
      "A 1,500-line CLAUDE.md doesn't make agents more consistent — it makes them less. The agents that work best have short rules backed by tooling, not long rules backed by hope.",
    postUrl: "/ai/writing-claude-md-agents-follow/",
    audioUrl:
      "https://github.com/P-AI-PLOS/sharmaprakash.com.np/releases/download/podcast-ai-coding-setup-ep-02/ep-02.mp3",
    duration: 1256,
    transcript: "podcast/ai-coding-setup/ep-02.transcript.md",
    publishedAt: "2026-05-17T08:30:00+05:45",
  },
  {
    series: "ai-coding-setup",
    order: 3,
    title: "Hooks That Pay for Themselves",
    summary:
      "A session-start hook runs once, costs nothing, and gives your agent context it would otherwise ask for or guess wrong. The highest-leverage 10 lines you'll write this week.",
    postUrl: "/ai/hooks-that-pay-for-themselves/",
    audioUrl:
      "https://github.com/P-AI-PLOS/sharmaprakash.com.np/releases/download/podcast-ai-coding-setup-ep-03/ep-03.mp3",
    duration: 1115,
    transcript: "podcast/ai-coding-setup/ep-03.transcript.md",
    publishedAt: "2026-05-17T08:31:00+05:45",
  },
  {
    series: "ai-coding-setup",
    order: 4,
    title: "Project Settings, Permissions, and Team Sharing",
    summary:
      "What your team shares, what stays personal, and how to stop the 'Claude asked me to approve running npm install' prompts that break every flow.",
    postUrl: "/ai/project-settings-permissions-team-sharing/",
    audioUrl:
      "https://github.com/P-AI-PLOS/sharmaprakash.com.np/releases/download/podcast-ai-coding-setup-ep-04/ep-04.mp3",
    duration: 1402,
    transcript: "podcast/ai-coding-setup/ep-04.transcript.md",
    publishedAt: "2026-05-17T08:32:00+05:45",
  },
  {
    series: "ai-coding-setup",
    order: 5,
    title: "Not on Claude? The Cross-Tool Configuration Guide",
    summary:
      "The concepts in this series aren't Claude-specific. Every major AI coding tool has a configuration layer. Here's how they map — and what Windows and Linux users need to know.",
    postUrl: "/ai/cross-tool-configuration-guide/",
    audioUrl:
      "https://github.com/P-AI-PLOS/sharmaprakash.com.np/releases/download/podcast-ai-coding-setup-ep-05/ep-05.mp3",
    duration: 3525,
    transcript: "podcast/ai-coding-setup/ep-05.transcript.md",
    publishedAt: "2026-05-17T08:33:00+05:45",
  },
  {
    series: "greenfield",
    order: 1,
    title: "The Rule Lives in Your Head",
    summary:
      "Why the corrections you give your coding agent keep evaporating — and the four places a rule can live so that it stops. A story about barrel imports, a UUID that broke staging, and the moment I stopped trusting my own memory as infrastructure.",
    postUrl: "/series/greenfield/",
    audioUrl:
      "https://github.com/P-AI-PLOS/sharmaprakash.com.np/releases/download/podcast-greenfield-ep-01/ep-01.mp3",
    duration: 1487,
    transcript: null,
    publishedAt: "2026-05-23T00:00:00+05:45",
  },
  {
    series: "greenfield",
    order: 2,
    title: "Static and Dynamic: When Each Wins",
    summary:
      "Prompts and subagents look similar from a distance — both are markdown files, both shape how the agent works. They are not the same tool. One is static, one is dynamic, and the line between them is sharper than people realize. A story about a 900-line prompt that paid for itself and a subagent that didn't.",
    postUrl: "/series/greenfield/",
    audioUrl:
      "https://github.com/P-AI-PLOS/sharmaprakash.com.np/releases/download/podcast-greenfield-ep-02/ep-02.mp3",
    duration: 829,
    transcript: null,
    publishedAt: "2026-05-23T00:01:00+05:45",
  },
  {
    series: "greenfield",
    order: 3,
    title: "The Subagent I Didn't Need",
    summary:
      "A confession about a subagent I wrote, ran for a month, and quietly deleted — and the broader taxonomy of agent-side artifacts that helped me see why. Five things live in a mature agent-ready repo, and they are not interchangeable. A field guide to when not to delegate.",
    postUrl: "/ai/the-subagent-i-deleted/",
    audioUrl:
      "https://github.com/P-AI-PLOS/sharmaprakash.com.np/releases/download/podcast-greenfield-ep-03/ep-03.mp3",
    duration: 902,
    transcript: null,
    publishedAt: "2026-05-23T00:02:00+05:45",
  },
];

export const findEpisode = (
  series: string | undefined,
  order: number | undefined,
): PodcastEpisode | null => {
  if (!series || !order) return null;
  return (
    podcastEpisodes.find((ep) => ep.series === series && ep.order === order) ?? null
  );
};
