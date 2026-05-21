import { getCollection, type CollectionEntry } from "astro:content";
import { createSlug } from "./index";
import { blogImageCategory } from "~/data/portfolios";

export type Post = CollectionEntry<"posts">;

export const POSTS_PER_PAGE = 10;

export const getAllPostsSorted = async (): Promise<Post[]> => {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  return posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );
};

export const getRecentPosts = async (limit = 5): Promise<Post[]> => {
  const all = await getAllPostsSorted();
  return all.slice(0, limit);
};

// Posts surfaced in the main blog feed (paginated index, sidebar, related).
// Excludes workshop chapters — those live under their own /workshop/ surface
// and the /course/ landing, not the blog stream.
export const getBlogPosts = async (): Promise<Post[]> => {
  const all = await getAllPostsSorted();
  return all.filter((p) => p.data.directory !== "workshop");
};

export const getRecentBlogPosts = async (limit = 5): Promise<Post[]> => {
  const all = await getBlogPosts();
  return all.slice(0, limit);
};

export const getAllCategories = async (): Promise<string[]> => {
  const all = await getAllPostsSorted();
  return all.flatMap((p) => p.data.category ?? []);
};

export const getUniqueCategories = async (): Promise<string[]> => {
  return [...new Set(await getAllCategories())];
};

export const getPostsByCategorySlug = async (
  categorySlug: string,
): Promise<Post[]> => {
  const all = await getAllPostsSorted();
  return all.filter((p) =>
    (p.data.category ?? []).map((c) => createSlug(c)).includes(categorySlug),
  );
};

export const getEntrepreneurialPosts = async (): Promise<Post[]> => {
  const all = await getAllPostsSorted();
  return all.filter((p) => (p.data.categories ?? []).includes("entrepreneurial"));
};

export const getTechnicalPosts = async (): Promise<Post[]> => {
  const all = await getAllPostsSorted();
  return all.filter((p) => (p.data.categories ?? []).includes("technical"));
};

export const getAiPosts = async (): Promise<Post[]> => {
  const all = await getAllPostsSorted();
  return all.filter((p) => (p.data.categories ?? []).includes("ai"));
};

/* -------------------------------------------------------------------------
 * Series helpers
 * ----------------------------------------------------------------------- */

export const getSeriesPosts = async (seriesSlug: string): Promise<Post[]> => {
  const all = await getAllPostsSorted();
  return all
    .filter((p) => p.data.series === seriesSlug)
    .sort((a, b) => (a.data.seriesOrder ?? 0) - (b.data.seriesOrder ?? 0));
};

export interface PostSeriesContext {
  slug: string;
  parts: Post[];
  index: number;       // 0-based index of the current post in `parts`
  prev?: Post;
  next?: Post;
}

export const getPostSeries = async (
  post: Post,
): Promise<PostSeriesContext | null> => {
  if (!post.data.series) return null;
  const parts = await getSeriesPosts(post.data.series);
  const index = parts.findIndex((p) => p.id === post.id);
  if (index < 0) return null;
  return {
    slug: post.data.series,
    parts,
    index,
    prev: index > 0 ? parts[index - 1] : undefined,
    next: index < parts.length - 1 ? parts[index + 1] : undefined,
  };
};

/* -------------------------------------------------------------------------
 * Adjacent posts (globally ordered by date, descending)
 * ----------------------------------------------------------------------- */

export interface AdjacentPosts {
  prev?: Post;
  next?: Post;
}

export const getAdjacentPosts = async (post: Post): Promise<AdjacentPosts> => {
  // Workshop chapters get prev/next within the workshop only; blog posts
  // skip workshop chapters so the prev/next stream stays editorially coherent.
  const all =
    post.data.directory === "workshop"
      ? (await getAllPostsSorted()).filter((p) => p.data.directory === "workshop")
      : await getBlogPosts();
  const i = all.findIndex((p) => p.id === post.id);
  if (i < 0) return {};
  return {
    next: i > 0 ? all[i - 1] : undefined,        // newer post = "next" to read
    prev: i < all.length - 1 ? all[i + 1] : undefined, // older = "prev"
  };
};

/* -------------------------------------------------------------------------
 * Reading time estimate. 220 words per minute, minimum 1 minute.
 * ----------------------------------------------------------------------- */

const WPM = 220;
export const estimateReadMinutes = (body: string | undefined): number => {
  if (!body) return 1;
  const words = body.match(/\S+/g)?.length ?? 0;
  return Math.max(1, Math.ceil(words / WPM));
};

export const postUrl = (post: Post): string => {
  const slug = post.id;
  return post.data.directory ? `/${post.data.directory}/${slug}/` : `/${slug}/`;
};

export const categoryFallbackImage = (post: Post): string => {
  const isEntrepreneurial = (post.data.category ?? [])[1] === "entrepreneurial";
  if (isEntrepreneurial) return "/images/blog/blog-image-12.jpg";
  const cat = (post.data.category ?? [])[0];
  const matched = blogImageCategory.find((c) => c.categoryName === cat);
  return matched?.imageLink ?? "/images/blog/blog-image-12.jpg";
};

export const postCoverImage = (post: Post): string => {
  if (post.data.use_featured_image && post.data.cover) return post.data.cover;
  if (post.data.use_featured_image && post.data.thumb) return post.data.thumb;
  return categoryFallbackImage(post);
};

export const postThumbnail = (post: Post): string => {
  if (post.data.use_featured_image && post.data.thumb) return post.data.thumb;
  if (post.data.use_featured_image && post.data.cover) return post.data.cover;
  return categoryFallbackImage(post);
};
