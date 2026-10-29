import type { Metadata } from "next";
import Body, { meta } from "@/content/legal/privacy.mdx";
import { LegalPage } from "@/src/components/legal/LegalPage";
import { getLegalToc } from "@/src/lib/legal";
import { pageMetadata } from "@/src/lib/seo";

export const metadata: Metadata = pageMetadata({ title: meta.title, description: meta.description, path: "/privacy" });

export default async function Page() {
  return <LegalPage meta={meta} toc={await getLegalToc("privacy")} Body={Body} />;
}
