import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  devIndicators: false,
  experimental: {
    agentUpgrade: "security",
  },
  partialPrefetching: true,
  // The guide is an email modal now; old /guide links (PDF, emails, posts) open it.
  async redirects() {
    return [{ source: "/guide", destination: "/?guide=1", permanent: true }];
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

export default nextConfig;
