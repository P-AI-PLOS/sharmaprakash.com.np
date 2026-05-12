import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

const site = (process.env.WEBSITE_URL?.trim()) || "https://sharmaprakash.com.np/";

export default defineConfig({
  site,
  trailingSlash: "always",
  integrations: [react(), mdx(), sitemap()],
  redirects: {
    "/javascript/ie-alternative-to-inludes/": "/javascript/ie-alternative-to-includes/",
  },
});
