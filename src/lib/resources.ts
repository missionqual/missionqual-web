import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import type { TopicKey } from "./topics";

export { topicLabel, TOPICS, type TopicKey } from "./topics";

export type ArticleMeta = {
  title: string;
  description: string;
  /** The topic: the pill on /resources and the breadcrumb. */
  section: TopicKey;
  readMinutes: number;
  author: { name: string; role?: string };
  /** ISO dates, e.g. "2026-10-28". */
  publishedAt: string;
  updatedAt: string;
  status: "draft" | "published";
  /**
   * The one call to action after "Keep reading": the newest jobs, the postings
   * behind the pay numbers, none (InterviewQuestions has its own), or, unset,
   * the community box.
   */
  endCta?: "jobs" | "pay" | "interview";
};

export type Article = ArticleMeta & { slug: string };

const DIR = path.join(process.cwd(), "content/resources");

/** Drafts show in development only. */
const SHOW_DRAFTS = process.env.NODE_ENV !== "production";

async function loadAll(): Promise<Article[]> {
  const files = (await readdir(DIR)).filter((f) => f.endsWith(".mdx"));
  const all = await Promise.all(
    files.map(async (file) => {
      const slug = file.slice(0, -".mdx".length);
      const { meta } = await import(`@/content/resources/${slug}.mdx`);
      return { ...meta, slug };
    }),
  );
  return all.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/**
 * Articles a reader can open: published ones, plus drafts in development.
 * Newest first. Cached, since content only changes with a deploy.
 */
export async function getArticles(): Promise<Article[]> {
  "use cache";
  cacheLife("max");
  const all = await loadAll();
  return all.filter((a) => a.status === "published" || SHOW_DRAFTS);
}

/** Published articles only, for the sitemap (never drafts, even in development). */
export async function getPublishedArticles(): Promise<Article[]> {
  "use cache";
  cacheLife("max");
  return (await loadAll()).filter((a) => a.status === "published");
}

export async function getArticle(slug: string): Promise<Article | null> {
  return (await getArticles()).find((a) => a.slug === slug) ?? null;
}

/** Plain text of a heading, turned into its anchor id. */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type TocItem = { id: string; label: string; sub?: boolean };

/**
 * "On this page": each ## heading in the file, in order. Where the file uses
 * <ProjectList />, a { projects: true } marker holds the place of the state
 * anchors, which the page fills in from the projects table.
 */
export async function getToc(slug: string): Promise<(TocItem | { projects: true })[]> {
  "use cache";
  cacheLife("max");
  const source = await readFile(path.join(DIR, `${slug}.mdx`), "utf8");
  const items: (TocItem | { projects: true })[] = [];
  for (const [, heading] of source.matchAll(/^## (.+)$|^<ProjectList\b.*$/gm)) {
    if (!heading) {
      items.push({ projects: true });
      continue;
    }
    const label = heading.replace(/[*_`]/g, "").trim();
    items.push({ id: slugify(label), label });
  }
  return items;
}

/** Up to 3 other articles, same topic first, then newest. */
export async function getRelated(article: Article): Promise<Article[]> {
  const others = (await getArticles()).filter((a) => a.slug !== article.slug);
  const same = others.filter((a) => a.section === article.section);
  const rest = others.filter((a) => a.section !== article.section);
  return [...same, ...rest].slice(0, 3);
}
