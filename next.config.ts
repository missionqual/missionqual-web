import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  devIndicators: false,
  // Articles in content/resources are imported as .mdx modules.
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // src/lib/resources.ts and src/lib/legal.ts read content/ with fs, so ship it with every route.
  outputFileTracingIncludes: { "/*": ["./content/resources/**/*", "./content/legal/**/*"] },
  experimental: {
    agentUpgrade: "security",
  },
  partialPrefetching: true,
  // The guide is an email modal now; old /guide links (PDF, emails, posts) open it.
  async redirects() {
    return [
      { source: "/guide", destination: "/?guide=1", permanent: true },
      // The old Resources tool pages are articles now.
      {
        source: "/resources/projects-by-state",
        destination: "/resources/where-data-centers-are-being-built",
        permanent: true,
      },
      { source: "/resources/pay", destination: "/resources/what-data-center-jobs-pay", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        // CSS Modules skip the Tailwind loader; `as: "*.css"` would turn them
        // into global CSS and their class names would come back undefined.
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default createMDX()(nextConfig);
