/**
 * Registry of multi-part essay series. The `series` slug in a post's
 * frontmatter must match a key here for the series chrome (SeriesNavStrip,
 * SeriesContinueBlock) to render.
 *
 * To start a new series:
 *   1. Add an entry here.
 *   2. Set `series: <slug>` + `seriesOrder: N` on each post.
 */
export interface SeriesMeta {
  title: string;
  description: string;
}

export const seriesRegistry: Record<string, SeriesMeta> = {
  "agent-ready-react": {
    title: "Agent-ready React",
    description:
      "A three-part series plus companions on making legacy React codebases ready for AI coding agents.",
  },
};

export const getSeriesMeta = (slug: string | undefined): SeriesMeta | null =>
  slug && slug in seriesRegistry ? seriesRegistry[slug] : null;
