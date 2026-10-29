import type { Metadata } from "next";
import Link from "next/link";
import { GuideCta } from "@/src/components/guide/GuideCta";
import { ArrowRight } from "@/src/components/landing/icons";
import shared from "@/src/components/landing/shared.module.css";
import { ArticleCard } from "@/src/components/resources/ArticleCard";
import { CommunityBox } from "@/src/components/resources/CommunityBox";
import { ToolIcon } from "@/src/components/resources/icons";
import s from "@/src/components/resources/resources.module.css";
import { getArticles, hasResources, liveTools, SECTIONS, type Article, type Tool } from "@/src/lib/resources";
import { pageMetadata } from "@/src/lib/seo";

// Ported from design/resources/resources.html.

const TITLE = "Data center work, explained by people doing it";
const DESCRIPTION =
  "The pay, the sites, life on site and the equipment, in plain field language for people coming from oil and gas.";

export async function generateMetadata(): Promise<Metadata> {
  const base = pageMetadata({ title: "Resources", description: DESCRIPTION, path: "/resources" });
  // Nothing published yet: keep the placeholder page out of search.
  return (await hasResources()) ? base : { ...base, robots: { index: false, follow: true } };
}

export default async function ResourcesPage() {
  const articles = await getArticles();
  const tools = liveTools();
  const sections = SECTIONS.map((sec) => ({
    ...sec,
    articles: articles.filter((a) => a.section === sec.key),
    tools: tools.filter((t) => t.inSection?.section === sec.key),
  })).filter((sec) => sec.articles.length + sec.tools.length > 0);

  if (!sections.length && !tools.length) {
    return (
      <>
        <Hero />
        <div className={`${shared.wrap} ${s.empty}`}>
          <p>The first articles are on the way. Get the Transition Guide in the meantime.</p>
          <GuideCta>Send me the transition guide</GuideCta>
        </div>
      </>
    );
  }

  return (
    <>
      <Hero jump={sections} />

      {tools.length > 0 && (
        <div className={shared.wrap}>
          <div className={s.tools}>
            {tools.map((tool) => (
              <ToolCard key={tool.key} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {sections.map((sec, i) => (
        <section
          key={sec.key}
          className={`${shared.wrap} ${s.sec} ${i === 0 && !tools.length ? s.secFirst : ""}`}
          aria-labelledby={`h-${sec.key}`}
        >
          <div className={s.head} id={sec.key}>
            <div className={s.headText}>
              <span className={s.num}>{String(i + 1).padStart(2, "0")}</span>
              <h2 id={`h-${sec.key}`}>{sec.label}</h2>
              <p>{sec.blurb}</p>
            </div>
          </div>
          <div className={s.cards}>
            {sec.articles.map((a: Article) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
            {sec.tools.map((t) => (
              <SectionToolCard key={t.key} tool={t} />
            ))}
          </div>
          {sec.key === "hired" && <GuideBand />}
        </section>
      ))}
      {!sections.some((sec) => sec.key === "hired") && (
        <div className={shared.wrap}>
          <GuideBand />
        </div>
      )}

      <CommunityBox
        title="Have a question these don't answer?"
        text="Ask the people already on data center sites. Members answer in the community."
        back="/resources"
      />
    </>
  );
}

function Hero({ jump = [] }: { jump?: { key: string; label: string }[] }) {
  return (
    <section className={s.hero}>
      <div className={`${shared.wrap} ${s.heroInner}`}>
        <p className={s.kick}>Resources</p>
        <h1>{TITLE}.</h1>
        <p className={s.sub}>{DESCRIPTION}</p>
        {jump.length > 0 && (
          <nav className={s.jump} aria-label="Sections">
            {jump.map((sec) => (
              <a key={sec.key} href={`#${sec.key}`}>
                {sec.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link href={tool.href} className={s.tool}>
      <span className={s.toolTop}>
        <span className={s.ic}>
          <ToolIcon tool={tool.key} />
        </span>
        {tool.membersMore && <span className={s.more}>Members get more</span>}
      </span>
      <span className={s.lab}>{tool.label}</span>
      <h3>{tool.title}</h3>
      <p>{tool.blurb}</p>
      <span className={s.go}>
        Open <ArrowRight width={14} height={11} />
      </span>
    </Link>
  );
}

function SectionToolCard({ tool }: { tool: Tool }) {
  return (
    <Link href={tool.href} className={`${s.card} ${s.cardTool}`}>
      <div className={s.meta}>
        <span className={s.tag}>Tool</span>
        {tool.membersMore && <span className={s.more}>Members get more</span>}
      </div>
      <span className={s.ic2}>
        <ToolIcon tool={tool.key} />
      </span>
      <h3>{tool.title}</h3>
      <p>{tool.inSection?.blurb ?? tool.blurb}</p>
      <span className={s.go}>
        Open <ArrowRight width={14} height={11} />
      </span>
    </Link>
  );
}

/** Opens the guide pop-up. */
function GuideBand() {
  return (
    <div className={s.guideband}>
      <div>
        <h3>The full path is in the Transition Guide.</h3>
        <p>The roles to target, what transfers, what changes, and the résumé rewrite, in one place.</p>
      </div>
      <GuideCta className={s.btn}>Send me the transition guide</GuideCta>
    </div>
  );
}
