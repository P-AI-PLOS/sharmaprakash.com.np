import { getEntry } from "astro:content";
import {
  workshopRegistry,
  type WorkshopMeta,
  type WorkshopChapter,
} from "~/data/workshops";
import type { Post } from "~/utils/posts";

export interface ResolvedWorkshopChapter extends WorkshopChapter {
  index: number;
  post: Post;
}

export interface WorkshopContext {
  slug: string;
  meta: WorkshopMeta;
  chapters: ResolvedWorkshopChapter[];
}

export const getWorkshop = async (
  slug: string,
): Promise<WorkshopContext | null> => {
  const meta = workshopRegistry[slug];
  if (!meta) return null;
  const chapters: ResolvedWorkshopChapter[] = [];
  for (let i = 0; i < meta.chapters.length; i++) {
    const ch = meta.chapters[i];
    const post = (await getEntry("posts", ch.postId)) as Post | undefined;
    if (!post) {
      throw new Error(
        `Workshop "${slug}" chapter "${ch.slug}" references missing post id "${ch.postId}".`,
      );
    }
    chapters.push({ ...ch, index: i, post });
  }
  return { slug, meta, chapters };
};

export const workshopUrl = (slug: string): string => `/workshop/${slug}/`;

export const workshopChapterUrl = (chapterSlug: string): string =>
  `/workshop/${chapterSlug}/`;
