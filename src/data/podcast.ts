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
  /** Public Release asset URL — looks like https://github.com/<owner>/<repo>/releases/download/<tag>/<file>.mp3 */
  audioUrl: string;
  /** Total duration in seconds. */
  duration: number;
  /** Relative path to the transcript markdown, e.g. "podcast/ai-coding-setup/ep-01.transcript.md". */
  transcript: string;
  /** ISO-8601 publish timestamp. */
  publishedAt: string;
}

export const podcastEpisodes: PodcastEpisode[] = [];

export const findEpisode = (
  series: string | undefined,
  order: number | undefined,
): PodcastEpisode | null => {
  if (!series || !order) return null;
  return (
    podcastEpisodes.find((ep) => ep.series === series && ep.order === order) ?? null
  );
};
