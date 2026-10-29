import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";

/** Index sections, in page order. The key is the jump-link anchor. */
export const SECTIONS = [
  { key: "money", label: "The money", blurb: "What the work pays, and the parts of an offer people get wrong." },
  { key: "boom", label: "The sites and the boom", blurb: "Where the work is, and how long it lasts." },
  { key: "site", label: "Life on site", blurb: "The parts the job ads leave out." },
  { key: "equipment", label: "The equipment", blurb: "What you'll be working around, explained for the trades." },
  { key: "hired", label: "Getting hired", blurb: "Picking the right door in." },
] as const;

export type SectionKey = (typeof SECTIONS)[number]["key"];

export function sectionLabel(key: SectionKey) {
  return SECTIONS.find((x) => x.key === key)?.label ?? key;
}

export type ToolKey = "glossary" | "interview" | "projects" | "pay";

export type Tool = {
  key: ToolKey;
  href: string;
  label: string;
  title: string;
  blurb: string;
  /** Off until the tool page ships; a tool that isn't live shows nowhere. */
  live: boolean;
  /** "Members get more" tag: visitors see part of it, members see all. */
  membersMore: boolean;
  /** Also listed as a card inside this section, with a shorter blurb. */
  inSection?: { section: SectionKey; blurb: string };
};

export const TOOLS: Tool[] = [
  {
    key: "glossary",
    href: "/resources/glossary",
    label: "Glossary",
    title: "Data center terms, matched to oil and gas",
    blurb: "Every term you'll hear on site, next to the word you already use for it.",
    live: false,
    membersMore: false,
  },
  {
    key: "interview",
    href: "/resources/interview-questions",
    label: "Interview prep",
    title: "Interview questions",
    blurb: "Real questions for QA/QC, commissioning and trade roles, and how to answer them.",
    live: false,
    membersMore: true,
    inSection: { section: "hired", blurb: "Real questions for QA/QC, commissioning and trade roles." },
  },
  {
    key: "projects",
    href: "/resources/projects-by-state",
    label: "Map",
    title: "Projects by state",
    blurb: "Major campuses under construction, and the jobs we've posted near them.",
    live: false,
    membersMore: true,
    inSection: { section: "boom", blurb: "Major campuses under construction, and the jobs near them." },
  },
  {
    key: "pay",
    href: "/resources/pay",
    label: "Live data",
    title: "Pay from real postings",
    blurb: "Rates, per diem and overtime from the jobs we post. Updated as we post.",
    live: false,
    membersMore: true,
  },
];

export const liveTools = () => TOOLS.filter((t) => t.live);

export type ArticleMeta = {
  title: string;
  description: string;
  section: SectionKey;
  readMinutes: number;
  author: { name: string; role?: string };
  /** ISO dates, e.g. "2026-10-28". */
  publishedAt: string;
  updatedAt: string;
  status: "draft" | "published";
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

/** Whether /resources has anything to show; otherwise it's hidden from the nav and noindexed. */
export async function hasResources(): Promise<boolean> {
  return (await getArticles()).length > 0 || liveTools().length > 0;
}

/** Plain text of a heading, turned into its anchor id. */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type TocItem = { id: string; label: string };

/** "On this page": the short version box, then each ## heading in the file. */
export async function getToc(slug: string): Promise<TocItem[]> {
  "use cache";
  cacheLife("max");
  const source = await readFile(path.join(DIR, `${slug}.mdx`), "utf8");
  const items: TocItem[] = [];
  if (source.includes("<ShortVersion")) items.push({ id: "short", label: "The short version" });
  for (const [, heading] of source.matchAll(/^## (.+)$/gm)) {
    const label = heading.replace(/[*_`]/g, "").trim();
    items.push({ id: slugify(label), label });
  }
  return items;
}

/** Up to 3 other articles, same section first, then newest. */
export async function getRelated(article: Article): Promise<Article[]> {
  const others = (await getArticles()).filter((a) => a.slug !== article.slug);
  const same = others.filter((a) => a.section === article.section);
  const rest = others.filter((a) => a.section !== article.section);
  return [...same, ...rest].slice(0, 3);
}
