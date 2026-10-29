// Articles in content/resources export `meta` next to the default component.
declare module "*.mdx" {
  export const meta: import("@/src/lib/resources").ArticleMeta;
}
