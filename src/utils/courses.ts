import { getEntry } from "astro:content";
import { courseRegistry, type CourseMeta, type CourseChapter } from "~/data/courses";
import type { Post } from "~/utils/posts";

export interface ResolvedChapter extends CourseChapter {
  index: number;
  post: Post;
}

export interface CourseContext {
  slug: string;
  meta: CourseMeta;
  chapters: ResolvedChapter[];
}

export const getCourse = async (slug: string): Promise<CourseContext | null> => {
  const meta = courseRegistry[slug];
  if (!meta) return null;
  const chapters: ResolvedChapter[] = [];
  for (let i = 0; i < meta.chapters.length; i++) {
    const ch = meta.chapters[i];
    const post = (await getEntry("posts", ch.postId)) as Post | undefined;
    if (!post) {
      throw new Error(
        `Course "${slug}" chapter "${ch.slug}" references missing post id "${ch.postId}".`,
      );
    }
    chapters.push({ ...ch, index: i, post });
  }
  return { slug, meta, chapters };
};

export const courseUrl = (slug: string): string => `/course/${slug}/`;

export const chapterUrl = (courseSlug: string, chapterSlug: string): string =>
  `/course/${courseSlug}/${chapterSlug}/`;
