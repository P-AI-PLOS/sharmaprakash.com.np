import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import rehypePrettyCode from "rehype-pretty-code";
import tailwindcss from "@tailwindcss/vite";
import { unified } from "@astrojs/markdown-remark";
import { podcastFeeds } from "./src/integrations/podcast-feeds.ts";

const site = (process.env.WEBSITE_URL?.trim()) || "https://www.sharmaprakash.com.np/";

/** @type {import("rehype-pretty-code").Options} */
const prettyCodeOptions = {
  theme: "one-dark-pro",
  keepBackground: false,
  defaultLang: "plaintext",
  grid: true,
};

export default defineConfig({
  site,
  trailingSlash: "always",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    mdx({
      syntaxHighlight: false,
    }),
    sitemap(),
    podcastFeeds(),
  ],
  markdown: {
    syntaxHighlight: false,
    processor: unified({
      rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
    }),
  },
  redirects: {
    "/javascript/ie-alternative-to-inludes/": "/javascript/ie-alternative-to-includes/",
    "/technical-notes/ai-podcast-index-project-overview/": "/technical-notes/clipdex-project-overview/",
    "/technical-notes/react-frontend-for-podcast-index/": "/technical-notes/clipdex-react-frontend/",
    "/series/ai-podcast-index/": "/series/clipdex/",
  },
});
