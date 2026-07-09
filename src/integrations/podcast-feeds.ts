import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import type { AstroIntegration } from "astro";
import { podcastEpisodes } from "../data/podcast";
import { seriesRegistry } from "../data/series";
import { information } from "../data/site";

const OWNER_EMAIL = "prakash@tremark.com.np";

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

const formatRfc822 = (iso: string) => new Date(iso).toUTCString();

const formatDuration = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
};

const buildFeed = (seriesSlug: string, origin: string) => {
  const meta = seriesRegistry[seriesSlug];
  const episodes = podcastEpisodes
    .filter((ep) => ep.series === seriesSlug)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  const feedUrl = `${origin}/podcast/${seriesSlug}/feed.xml`;
  const channelLink = `${origin}/series/${seriesSlug}/`;
  const channelImage = `${origin}${meta.cover}`;

  const items = episodes
    .map((ep) => {
      const epUrl = `${origin}${ep.postUrl}`;
      const pubDate = formatRfc822(ep.publishedAt);
      return `    <item>
      <title>${escape(ep.title)}</title>
      <description>${cdata(ep.summary)}</description>
      <link>${escape(epUrl)}</link>
      <guid isPermaLink="false">${escape(ep.audioUrl)}</guid>
      <pubDate>${pubDate}</pubDate>
      <enclosure url="${escape(ep.audioUrl)}" type="audio/mpeg" />
      <itunes:author>${escape(information.fullName)}</itunes:author>
      <itunes:summary>${escape(ep.summary)}</itunes:summary>
      <itunes:duration>${formatDuration(ep.duration)}</itunes:duration>
      <itunes:episode>${ep.order}</itunes:episode>
      <itunes:explicit>false</itunes:explicit>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(meta.title)}</title>
    <link>${escape(channelLink)}</link>
    <atom:link href="${escape(feedUrl)}" rel="self" type="application/rss+xml" />
    <description>${cdata(meta.description)}</description>
    <language>en</language>
    <copyright>© ${new Date().getFullYear()} ${escape(information.fullName)}</copyright>
    <itunes:author>${escape(information.fullName)}</itunes:author>
    <itunes:summary>${escape(meta.description)}</itunes:summary>
    <itunes:owner>
      <itunes:name>${escape(information.fullName)}</itunes:name>
      <itunes:email>${escape(OWNER_EMAIL)}</itunes:email>
    </itunes:owner>
    <itunes:image href="${escape(channelImage)}" />
    <itunes:category text="Technology" />
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    <image>
      <url>${escape(channelImage)}</url>
      <title>${escape(meta.title)}</title>
      <link>${escape(channelLink)}</link>
    </image>
${items}
  </channel>
</rss>
`;
};

/**
 * Writes podcast RSS feeds directly into the build output, bypassing Astro's
 * dynamic-route prerendering (which crashes on extension-terminated dynamic
 * endpoints under `trailingSlash: "always"` — see astro#<pending upstream fix>).
 */
export function podcastFeeds(): AstroIntegration {
  let origin = "https://www.sharmaprakash.com.np";

  return {
    name: "podcast-feeds",
    hooks: {
      "astro:config:done": ({ config }) => {
        if (config.site) origin = new URL(config.site).origin;
      },
      "astro:build:done": ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const slugs = Object.keys(seriesRegistry).filter((slug) =>
          podcastEpisodes.some((ep) => ep.series === slug),
        );

        for (const slug of slugs) {
          const feedDir = join(outDir, "podcast", slug);
          mkdirSync(feedDir, { recursive: true });
          writeFileSync(join(feedDir, "feed.xml"), buildFeed(slug, origin));
        }

        logger.info(`Generated ${slugs.length} podcast RSS feed(s).`);
      },
    },
  };
}
