import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/src/lib/resources";
import { SITE_URL } from "@/src/lib/seo";

const url = (path: string) => new URL(path, SITE_URL).toString();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles();
  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/jobs"), changeFrequency: "daily", priority: 0.9 },
    { url: url("/resources"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/resources/glossary"), changeFrequency: "monthly", priority: 0.7 },
    ...articles.map((a) => ({
      url: url(`/resources/${a.slug}`),
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
