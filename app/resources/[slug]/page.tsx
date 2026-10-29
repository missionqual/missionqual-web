import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import shared from "@/src/components/landing/shared.module.css";
import a from "@/src/components/resources/article.module.css";
import { ArticleCard } from "@/src/components/resources/ArticleCard";
import { END_CTA_HEADINGS, EndCommunityBox, EndCta } from "@/src/components/resources/EndCta";
import s from "@/src/components/resources/resources.module.css";
import { Toc } from "@/src/components/resources/Toc";
import { initials } from "@/src/lib/community/format";
import { getProjects, groupByState, type Project } from "@/src/lib/projects";
import {
  getArticle,
  getArticles,
  getRelated,
  getToc,
  topicLabel,
  type Article,
  type TocItem,
} from "@/src/lib/resources";
import { DEFAULT_OG_IMAGE, pageMetadata, SITE_NAME, SITE_URL } from "@/src/lib/seo";

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
    // Search results cut titles at about 60 characters, so long ones skip the " | MissionQual" suffix.
    ...(article.title.length + ` | ${SITE_NAME}`.length > 60 && { title: { absolute: article.title } }),
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
async function resolveToc(slug: string, endCta: Article["endCta"]): Promise<TocItem[]> {
  const raw = await getToc(slug);
  let items = raw as TocItem[];
  if (raw.some((x) => "projects" in x)) {
    const projects = await getProjects().catch((): Project[] => []);
    const states = groupByState(projects).map((g) => ({ id: g.id, label: g.name, sub: true }));
    items = raw.flatMap((x) => ("projects" in x ? states : [x]));
  }
  // The jobs or pay section right after the body is part of the article.
  if (endCta === "jobs" || endCta === "pay") items = [...items, { id: "h-end", label: END_CTA_HEADINGS[endCta] }];
  return items;
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
    resolveToc(slug, article.endCta),
    getRelated(article),
  ]);
  const path = `/resources/${slug}`;
  const byline = [article.author.name, article.author.role].filter(Boolean).join(", ");

  const url = new URL(path, SITE_URL).toString();
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.description,
      image: [new URL(DEFAULT_OG_IMAGE, SITE_URL).toString()],
      author: { "@type": "Person", name: article.author.name },
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      url,
      mainEntityOfPage: url,
      articleSection: topicLabel(article.section),
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Resources", item: new URL("/resources", SITE_URL).toString() },
        {
          "@type": "ListItem",
          position: 2,
          name: topicLabel(article.section),
          item: new URL(`/resources?topic=${article.section}`, SITE_URL).toString(),
        },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ];

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
        <div className={a.main}>
          <article className={a.prose}>
            <Body />
          </article>
          <EndCta kind={article.endCta} path={path} />
        </div>
        {toc.length > 0 && <Toc items={toc} />}
      </div>

      {/* A separate band, so it reads as "the article is over". */}
      {related.length > 0 && (
        <section className={a.moreBand} aria-labelledby="h-more">
          <div className={shared.wrap}>
            <p className={a.moreKick}>More from Resources</p>
            <h2 id="h-more">Keep reading</h2>
            <div className={s.cards}>
              {related.map((x) => (
                <ArticleCard key={x.slug} article={x} />
              ))}
            </div>
          </div>
        </section>
      )}

      {!article.endCta && <EndCommunityBox path={path} />}
    </>
  );
}
