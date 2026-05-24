import type { APIRoute, GetStaticPaths } from "astro";
import { podcastEpisodes } from "~/data/podcast";
import { seriesRegistry } from "~/data/series";
import { information } from "~/data/site";

const SITE = import.meta.env.WEBSITE_URL ?? "https://sharmaprakash.com.np/";
const OWNER_EMAIL = "prakash.poudel@varicon.com.au";

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

export const getStaticPaths: GetStaticPaths = () =>
  Object.keys(seriesRegistry)
    .filter((slug) => podcastEpisodes.some((ep) => ep.series === slug))
    .map((slug) => ({ params: { series: slug } }));

export const GET: APIRoute = ({ params, site }) => {
  const seriesSlug = params.series as string;
  const meta = seriesRegistry[seriesSlug];
  const episodes = podcastEpisodes
    .filter((ep) => ep.series === seriesSlug)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  const origin = (site ?? new URL(SITE)).origin;
  const feedUrl = `${origin}/podcast/${seriesSlug}.xml`;
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

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
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

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
