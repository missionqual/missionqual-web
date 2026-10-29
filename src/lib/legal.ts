import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { slugify, type TocItem } from "./resources";

/** What content/legal/*.mdx export. `updated` is display text, e.g. "October 29, 2026". */
export type LegalMeta = { title: string; description: string; updated: string };

/** "On this page" for a legal page: each ## heading, with the id the h2 component gives it. */
export async function getLegalToc(name: "privacy" | "terms"): Promise<TocItem[]> {
  "use cache";
  cacheLife("max");
  const source = await readFile(path.join(process.cwd(), "content/legal", `${name}.mdx`), "utf8");
  return [...source.matchAll(/^## (.+)$/gm)].map(([, heading]) => {
    const label = heading.replace(/[*_`]/g, "").trim();
    return { id: slugify(label), label };
  });
}
