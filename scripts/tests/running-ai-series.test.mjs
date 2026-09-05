import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import matter from "gray-matter";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const posts = readdirSync(resolve(root, "src/content/posts"))
  .filter((name) => name.endsWith(".md"))
  .map((name) => ({ name, ...matter(read(`src/content/posts/${name}`)) }))
  .filter(({ data }) => data.series === "running-ai-yourself")
  .sort((a, b) => a.data.seriesOrder - b.data.seriesOrder);
const slug = ({ name }) => name.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");

test("six ordered published posts have complete editorial and image metadata", () => {
  assert.equal(posts.length, 6);
  assert.deepEqual(posts.map(({ data }) => data.seriesOrder), [1, 2, 3, 4, 5, 6]);
  for (const post of posts) {
    const { name, data, content } = post;
    assert.equal(data.draft, false, name);
    assert.equal(data.directory, "ai", name);
    assert.equal(data.date.slice(0, 10), name.slice(0, 10), name);
    assert.equal(data.use_featured_image, true, name);
    for (const field of ["cover", "thumb"]) {
      assert.ok(existsSync(resolve(root, `public${data[field]}`)), `${name}: ${field}`);
      const png = readFileSync(resolve(root, `public${data[field]}`));
      assert.equal(png.readUInt32BE(16), 1915);
      assert.equal(png.readUInt32BE(20), 821);
    }
    const words = content.match(/\b[\w’'-]+\b/g).length;
    assert.ok(words >= 1500 && words <= 2200, `${name}: ${words} words`);
    assert.match(content, /<ai-diagram data-diagram="[a-z]+">/);
    assert.match(content, /## Optional experiment:/);
    assert.match(content, /illustrative calculation/i);
    assert.match(content, /invoice/i);
    assert.match(content, /\]\(\/series\/ai-stack\/\)/);
  }
});

test("the three intended videos have accessible responsive embeds and fallback links", () => {
  const expected = new Map([[1, "o0gkdZBtwEg"], [3, "RfkeZ0HciA0"], [4, "SkM4k4SKvCM"]]);
  for (const { data, content } of posts) {
    const embeds = [...content.matchAll(/<iframe\b[^>]*>/g)].map(([tag]) => tag);
    const id = expected.get(data.seriesOrder);
    assert.equal(embeds.length, id ? 1 : 0);
    if (!id) continue;
    const [tag] = embeds;
    assert.ok(tag.includes(`https://www.youtube-nocookie.com/embed/${id}?controls=1`));
    assert.match(tag, /title="[^"]+"/);
    assert.match(tag, /loading="lazy"/);
    assert.match(tag, /width:100%;aspect-ratio:16\/9/);
    assert.match(tag, /allowfullscreen/);
    assert.doesNotMatch(tag, /autoplay/);
    assert.ok(content.includes(`href="https://www.youtube.com/watch?v=${id}"`));
    const position = content.indexOf(tag);
    assert.ok(position > content.length * 0.1 && position < content.length * 0.7);
  }
});

test("published series appears in routes, catalog, and sitemap", () => {
  assert.ok(existsSync(resolve(root, "dist/series/running-ai-yourself/index.html")));
  assert.match(read("dist/series/index.html"), /running-ai-yourself/);
  const sitemaps = readdirSync(resolve(root, "dist"))
    .filter(path => /^sitemap.*\.xml$/.test(path)).map(path => read(`dist/${path}`)).join("\n");
  for (const post of posts) {
    assert.ok(existsSync(resolve(root, `dist/ai/${slug(post)}/index.html`)));
    assert.ok(sitemaps.includes(`/ai/${slug(post)}/`));
  }
});

test("internal article links resolve to published routes", () => {
  const companionName = "2026-09-05-from-prompts-to-harness-engineering.md";
  const companion = { name: companionName, ...matter(read(`src/content/posts/${companionName}`)) };
  const linkedPosts = [...posts, companion];
  for (const { content, name } of linkedPosts) {
    for (const [, href] of content.matchAll(/\]\((\/[^)#]+)(?:#[^)]*)?\)/g)) {
      assert.ok(existsSync(resolve(root, `dist${href}index.html`)), `${name}: ${href}`);
    }
  }
});

test("harness companion stays a separate article with working article and glossary links", () => {
  const name = "from-prompts-to-harness-engineering";
  const { data, content } = matter(read(`src/content/posts/2026-09-05-${name}.md`));
  assert.equal(data.draft, false);
  assert.equal(data.directory, "ai");
  assert.equal(data.series, undefined);
  const words = content.match(/\b[\w’'-]+\b/g).length;
  assert.ok(words >= 1500 && words <= 2200, `${words} words`);
  assert.ok(existsSync(resolve(root, `public${data.cover}`)));
  assert.ok(existsSync(resolve(root, "public/images/blog/running-ai-yourself/harness.svg")));
  assert.ok(existsSync(resolve(root, `dist/ai/${name}/index.html`)));
  for (const id of ["agent-harness", "inference-server", "prompt-engineering", "context-engineering", "harness-engineering", "evaluation-harness"]) {
    assert.match(content, new RegExp(`/ai/glossary/#${id}`));
    assert.ok(read("src/data/ai-glossary.mjs").includes(`"${id}"`));
  }
});

test("older toolkit retrospective is released with its featured image", () => {
  const {data} = matter(read("src/content/posts/2026-05-13-ai-toolkit-four-weeks.md"));
  assert.equal(data.draft, false);
  assert.ok(existsSync(resolve(root, "dist/ai/ai-toolkit-four-weeks/index.html")));
  assert.ok(existsSync(resolve(root, `public${data.cover}`)));
});
