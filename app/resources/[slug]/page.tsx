import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import shared from "@/src/components/landing/shared.module.css";
import a from "@/src/components/resources/article.module.css";
import { ArticleCard } from "@/src/components/resources/ArticleCard";
import { EndCta } from "@/src/components/resources/EndCta";
import s from "@/src/components/resources/resources.module.css";
import { Toc } from "@/src/components/resources/Toc";
import { initials } from "@/src/lib/community/format";
import { getProjects, groupByState, type Project } from "@/src/lib/projects";
import { getArticle, getArticles, getRelated, getToc, topicLabel, type TocItem } from "@/src/lib/resources";
import { pageMetadata, SITE_NAME, SITE_URL } from "@/src/lib/seo";

// Ported from design/resources/article.html.

/** Placeholder param while nothing is published: Cache Components needs at least one. */
const NONE = "__none__";

export async function generateStaticParams() {
  const slugs = (await getArticles()).map((x) => ({ slug: x.slug }));
  return slugs.length ? slugs : [{ slug: NONE }];
}

export async function generateMetadata({ params }: PageProps<"/resources/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  const base = pageMetadata({ title: article.title, description: article.description, path: `/resources/${slug}` });
  return {
    ...base,
    authors: [{ name: article.author.name }],
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      section: topicLabel(article.section),
    },
    ...(article.status === "draft" && { robots: { index: false, follow: false } }),
  };
}

// updatedAt is a calendar date, so format it in UTC.
const monthYear = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

/** "On this page", with a state anchor per state wherever the article uses <ProjectList />. */
async function resolveToc(slug: string): Promise<TocItem[]> {
  const raw = await getToc(slug);
  if (!raw.some((x) => "projects" in x)) return raw as TocItem[];
  const projects = await getProjects().catch((): Project[] => []);
  const states = groupByState(projects).map((g) => ({ id: g.id, label: g.name, sub: true }));
  return raw.flatMap((x) => ("projects" in x ? states : [x]));
}

export default function ArticlePage(props: PageProps<"/resources/[slug]">) {
  // params sit behind Suspense so navigation stays instant; known slugs are prerendered in full.
  return (
    <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
      <Article params={props.params} />
    </Suspense>
  );
}

async function Article({ params }: { params: PageProps<"/resources/[slug]">["params"] }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const [{ default: Body }, toc, related] = await Promise.all([
    import(`@/content/resources/${slug}.mdx`),
    resolveToc(slug),
    getRelated(article),
  ]);
  const path = `/resources/${slug}`;
  const byline = [article.author.name, article.author.role].filter(Boolean).join(", ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: { "@type": "Person", name: article.author.name },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: new URL(path, SITE_URL).toString(),
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so the JSON can't close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <section className={a.hero}>
        <div className={`${shared.wrap} ${a.heroInner}`}>
          <p className={a.crumb}>
            <Link href="/resources">Resources</Link> /{" "}
            <Link href={`/resources?topic=${article.section}`}>{topicLabel(article.section)}</Link>
          </p>
          <h1>{article.title}</h1>
          <div className={a.by}>
            <span className={a.av} aria-hidden="true">
              {initials(article.author.name)}
            </span>
            <span>
              {byline} · {article.readMinutes} min read
            </span>
            <span className={a.updated}>· Updated {monthYear(article.updatedAt)}</span>
          </div>
          {article.status === "draft" && <p className={a.draftNote}>Draft: only visible in development</p>}
        </div>
      </section>

      <div className={`${shared.wrap} ${a.layout}`}>
        <article className={a.prose}>
          <Body />
        </article>
        {toc.length > 0 && <Toc items={toc} />}
      </div>

      {related.length > 0 && (
        <section className={`${shared.wrap} ${a.more}`} aria-labelledby="h-more">
          <h2 id="h-more">Keep reading</h2>
          <div className={s.cards}>
            {related.map((x) => (
              <ArticleCard key={x.slug} article={x} />
            ))}
          </div>
        </section>
      )}

      <EndCta kind={article.endCta} path={path} />
    </>
  );
}
