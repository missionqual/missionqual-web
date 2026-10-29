import type { Metadata } from "next";
import { GLOSSARY } from "@/content/resources/glossary";
import shared from "@/src/components/landing/shared.module.css";
import { CommunityBox } from "@/src/components/resources/CommunityBox";
import { Glossary } from "@/src/components/resources/Glossary";
import { ToolHero } from "@/src/components/resources/ToolHero";
import t from "@/src/components/resources/tools.module.css";
import { pageMetadata, SITE_NAME, SITE_URL } from "@/src/lib/seo";

const PATH = "/resources/glossary";
const TITLE = "Data center terms, matched to oil and gas";
const DESCRIPTION = "Every term you'll hear on site, next to the word you already use for it.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function GlossaryPage() {
  const url = new URL(PATH, SITE_URL).toString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": url,
    name: `${SITE_NAME} data center glossary`,
    description: DESCRIPTION,
    url,
    hasDefinedTerm: GLOSSARY.map((x) => ({
      "@type": "DefinedTerm",
      "@id": `${url}#${x.slug}`,
      name: x.term,
      ...(x.aka && { alternateName: x.aka }),
      description: x.definition,
      url: `${url}#${x.slug}`,
      inDefinedTermSet: url,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so the JSON can't close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ToolHero crumb="Glossary" title={TITLE}>
        {DESCRIPTION}
      </ToolHero>
      <div className={`${shared.wrap} ${t.page}`}>
        <Glossary terms={GLOSSARY} />
      </div>
      <CommunityBox
        title="Heard a term that isn't here?"
        text="Ask the people already on site."
        back={PATH}
      />
    </>
  );
}
