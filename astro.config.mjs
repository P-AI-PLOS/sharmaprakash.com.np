import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import rehypePrettyCode from "rehype-pretty-code";

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
  integrations: [
    react(),
    mdx({
      syntaxHighlight: false,
      rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
    }),
    sitemap(),
  ],
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
  },
  redirects: {
    "/javascript/ie-alternative-to-inludes/": "/javascript/ie-alternative-to-includes/",
  },
});
