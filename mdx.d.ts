// Articles in content/resources export `meta` next to the default component.
declare module "*.mdx" {
  export const meta: import("@/src/lib/resources").ArticleMeta;
}

// Legal pages in content/legal export a smaller meta. The longer pattern wins.
declare module "@/content/legal/*.mdx" {
  import type { MDXProps } from "mdx/types";
  import type { JSX } from "react";
  export const meta: import("@/src/lib/legal").LegalMeta;
  export default function MDXContent(props: MDXProps): JSX.Element;
}
