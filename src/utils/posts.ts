import { getCollection, type CollectionEntry } from "astro:content";
import { createSlug } from "./index";
import { blogImageCategory } from "~/data/portfolios";

export type Post = CollectionEntry<"posts">;

export const POSTS_PER_PAGE = 6;

export const getAllPostsSorted = async (): Promise<Post[]> => {
  const posts = await getCollection("posts");
  return posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );
};

export const getRecentPosts = async (limit = 5): Promise<Post[]> => {
  const all = await getAllPostsSorted();
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

export const postUrl = (post: Post): string => {
  const slug = post.id;
  return post.data.directory ? `/${post.data.directory}/${slug}/` : `/${slug}/`;
};

export const postThumbnail = (post: Post): string => {
  if (post.data.show_category_hero_image && post.data.thumb) return post.data.thumb;
  const isEntrepreneurial = (post.data.category ?? [])[1] === "entrepreneurial";
  if (isEntrepreneurial) return "/images/blog/blog-image-12.jpg";
  const cat = (post.data.category ?? [])[0];
  const matched = blogImageCategory.find((c) => c.categoryName === cat);
  return matched?.imageLink ?? "/images/blog/blog-image-12.jpg";
};
