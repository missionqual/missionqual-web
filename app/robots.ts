import type { MetadataRoute } from "next";
import { SITE_URL } from "@/src/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Post-signup pages and the guide file itself stay out of search.
      disallow: ["/guide/thank-you", "/downloads/"],
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
