import type { MDXComponents } from "mdx/types";
import { FromOilAndGas, H2, Placeholder, ScrollTable, ShortVersion } from "@/src/components/resources/mdx";

// Components every article in content/resources can use without importing.
const components: MDXComponents = {
  h2: H2,
  ShortVersion,
  ScrollTable,
  FromOilAndGas,
  Placeholder,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
