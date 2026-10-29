import type { MetadataRoute } from "next";
import { getPublishedArticles, liveTools } from "@/src/lib/resources";
import { SITE_URL } from "@/src/lib/seo";

const url = (path: string) => new URL(path, SITE_URL).toString();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles();
  const resources: MetadataRoute.Sitemap =
    articles.length || liveTools().length
      ? [
          { url: url("/resources"), changeFrequency: "weekly", priority: 0.8 },
          ...articles.map((a) => ({
            url: url(`/resources/${a.slug}`),
            lastModified: a.updatedAt,
            changeFrequency: "monthly" as const,
            priority: 0.7,
          })),
        ]
      : [];

  return [{ url: url("/"), changeFrequency: "weekly", priority: 1 }, ...resources];
}
