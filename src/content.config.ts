import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Strip the `YYYY-MM-DD-` prefix from post filenames to get the URL slug.
const stripDatePrefix = (filename: string): string =>
  filename.replace(/\.(md|mdx)$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");

const posts = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/posts",
    generateId: ({ entry }) => stripDatePrefix(entry),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z
      .union([z.array(z.string()), z.string(), z.null()])
      .optional()
      .default([])
      .transform((v) => (Array.isArray(v) ? v : v ? [v] : [])),
    categories: z
      .union([z.array(z.string()), z.string(), z.null()])
      .optional()
      .default([])
      .transform((v) => (Array.isArray(v) ? v : v ? [v] : [])),
    cover: z.string().optional(),
    thumb: z.string().optional(),
    directory: z
      .union([z.string(), z.null()])
      .optional()
      .transform((v) => v || undefined),
    excerpt: z.string().optional().default(""),
    tags: z
      .union([z.array(z.string()), z.string(), z.null()])
      .optional()
      .default([])
      .transform((v) => (Array.isArray(v) ? v : v ? [v] : [])),
    comments: z.boolean().optional(),
    share: z.boolean().optional(),
    last_modified_at: z.coerce.date().optional(),
    use_featured_image: z.boolean().optional().default(false),
    series: z.string().optional(),
    seriesOrder: z.number().int().positive().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { posts };
