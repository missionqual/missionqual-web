"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { Article } from "@/src/lib/resources";
import type { TopicKey } from "@/src/lib/topics";
import { ArticleCard } from "./ArticleCard";
import s from "./resources.module.css";

// ?topic= filters the grid. useSearchParams() sits behind Suspense; the
// static shell (and search engines) get "All".

type Topic = { key: TopicKey; label: string };

function useTopic(topics: Topic[]): TopicKey | null {
  const asked = useSearchParams().get("topic");
  return topics.find((t) => t.key === asked)?.key ?? null;
}

/** The topic pills in the hero: All, then each topic with a published article. */
export function TopicPills({ topics }: { topics: Topic[] }) {
  return (
    <Suspense fallback={<Pills topics={topics} current={null} />}>
      <UrlPills topics={topics} />
    </Suspense>
  );
}

function UrlPills({ topics }: { topics: Topic[] }) {
  return <Pills topics={topics} current={useTopic(topics)} />;
}

function Pills({ topics, current }: { topics: Topic[]; current: TopicKey | null }) {
  const all: { key: TopicKey | null; label: string }[] = [{ key: null, label: "All" }, ...topics];
  return (
    <nav className={s.pills} aria-label="Filter by topic">
      {all.map((t) => (
        <Link
          key={t.key ?? "all"}
          href={t.key ? `/resources?topic=${t.key}` : "/resources"}
          scroll={false}
          className={t.key === current ? s.on : undefined}
          aria-current={t.key === current ? "true" : undefined}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

/** "N articles" and the grid, filtered by ?topic=. */
export function ArticleGrid({ articles, topics }: { articles: Article[]; topics: Topic[] }) {
  return (
    <Suspense fallback={<Grid articles={articles} />}>
      <UrlGrid articles={articles} topics={topics} />
    </Suspense>
  );
}

function UrlGrid({ articles, topics }: { articles: Article[]; topics: Topic[] }) {
  const topic = useTopic(topics);
  return <Grid articles={topic ? articles.filter((a) => a.section === topic) : articles} />;
}

function Grid({ articles }: { articles: Article[] }) {
  return (
    <>
      {/* The grid's heading, so the page goes h1 > h2 > card h3. */}
      <h2 className={s.cnt} aria-live="polite">
        {articles.length} {articles.length === 1 ? "article" : "articles"}
      </h2>
      <div className={s.cards}>
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </>
  );
}
