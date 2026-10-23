import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Post-signup pages and the guide file itself stay out of search.
      disallow: ["/guide/thank-you", "/downloads/"],
    },
  };
}
