import type { MetadataRoute } from "next";
import { getPublishedArticles, liveTools } from "@/src/lib/resources";
import { SITE_URL } from "@/src/lib/seo";

const url = (path: string) => new URL(path, SITE_URL).toString();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles();
  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/resources"), changeFrequency: "weekly", priority: 0.8 },
    ...liveTools().map((t) => ({ url: url(t.href), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...articles.map((a) => ({
      url: url(`/resources/${a.slug}`),
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
