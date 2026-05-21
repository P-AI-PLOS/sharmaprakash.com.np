// Client-side course progress helpers. Stored under
// `course-progress:<slug>` in localStorage as a JSON array of completed
// chapter slugs. Fires a `course-progress:change` CustomEvent on `window`
// whenever progress mutates, so multiple components on the page can react.

export type CourseProgressEvent = CustomEvent<{ slug: string; completed: string[] }>;

const key = (slug: string) => `course-progress:${slug}`;

export const readProgress = (slug: string): string[] => {
  try {
    const raw = localStorage.getItem(key(slug));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
};

const writeProgress = (slug: string, completed: string[]) => {
  localStorage.setItem(key(slug), JSON.stringify(completed));
  window.dispatchEvent(
    new CustomEvent("course-progress:change", {
      detail: { slug, completed },
    }) as CourseProgressEvent,
  );
};

export const isComplete = (slug: string, chapter: string): boolean =>
  readProgress(slug).includes(chapter);

export const setComplete = (slug: string, chapter: string, done: boolean): string[] => {
  const cur = readProgress(slug);
  const idx = cur.indexOf(chapter);
  if (done && idx < 0) cur.push(chapter);
  if (!done && idx >= 0) cur.splice(idx, 1);
  writeProgress(slug, cur);
  return cur;
};

export const toggleComplete = (slug: string, chapter: string): string[] => {
  const cur = readProgress(slug);
  const idx = cur.indexOf(chapter);
  if (idx >= 0) cur.splice(idx, 1);
  else cur.push(chapter);
  writeProgress(slug, cur);
  return cur;
};

export const resetProgress = (slug: string) => writeProgress(slug, []);

export const onProgressChange = (
  handler: (detail: { slug: string; completed: string[] }) => void,
): (() => void) => {
  const fn = (e: Event) => handler((e as CourseProgressEvent).detail);
  window.addEventListener("course-progress:change", fn);
  return () => window.removeEventListener("course-progress:change", fn);
};
