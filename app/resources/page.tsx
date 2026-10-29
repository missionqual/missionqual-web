import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/src/components/landing/icons";
import shared from "@/src/components/landing/shared.module.css";
import { CommunityBox } from "@/src/components/resources/CommunityBox";
import { GlossaryIcon } from "@/src/components/resources/icons";
import { ArticleGrid, TopicPills } from "@/src/components/resources/Library";
import s from "@/src/components/resources/resources.module.css";
import { getPublishedArticles, TOPICS } from "@/src/lib/resources";
import { pageMetadata } from "@/src/lib/seo";

// Ported from design/resources/resources-v2.html: one library, one call to action.

const TITLE = "Data center work, explained by people doing it";
const DESCRIPTION =
  "The pay, the sites, life on site and the equipment, in plain field language for people coming from oil and gas.";

export const metadata: Metadata = pageMetadata({ title: "Resources", description: DESCRIPTION, path: "/resources" });

export default async function ResourcesPage() {
  const articles = await getPublishedArticles();
  const topics = TOPICS.filter((t) => articles.some((a) => a.section === t.key)).map(({ key, label }) => ({
    key,
    label,
  }));

  return (
    <>
      <section className={s.hero}>
        <div className={`${shared.wrap} ${s.heroInner}`}>
          <p className={s.kick}>Resources</p>
          <h1>{TITLE}.</h1>
          <p className={s.sub}>{DESCRIPTION}</p>
          <TopicPills topics={topics} />
        </div>
      </section>

      <div className={shared.wrap}>
        <Link href="/resources/glossary" className={s.gloss}>
          <span className={s.ic}>
            <GlossaryIcon />
          </span>
          <span className={s.glossCopy}>
            <b>Glossary</b>
            <span className={s.glossText}>Data center terms, matched to the oil and gas words you already use.</span>
          </span>
          <span className={s.go}>
            Look up a term <ArrowRight width={14} height={11} />
          </span>
        </Link>
      </div>

      <section className={`${shared.wrap} ${s.lib}`} aria-label="Articles">
        <ArticleGrid articles={articles} topics={topics} />
      </section>

      <CommunityBox
        title="Have a question these don't answer?"
        text="Ask the people already on data center sites. Members answer in the community, and see every job we post."
        back="/resources"
      />
    </>
  );
}
