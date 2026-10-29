import type { MDXComponents } from "mdx/types";
import { MDX_COMPONENTS } from "@/src/components/resources/mdx";

// The article components are registered in src/components/resources/mdx.tsx.
export function useMDXComponents(): MDXComponents {
  return MDX_COMPONENTS;
}
