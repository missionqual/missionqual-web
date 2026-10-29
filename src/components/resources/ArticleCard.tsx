import Link from "next/link";
import { ArrowRight } from "@/src/components/landing/icons";
import type { Article } from "@/src/lib/resources";
import { topicLabel } from "@/src/lib/topics";
import s from "./resources.module.css";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/resources/${article.slug}`} className={s.card}>
      <div className={s.meta}>
        <span className={s.tag}>{topicLabel(article.section)}</span>
        <span>{article.readMinutes} min read</span>
        {article.status === "draft" && <span className={s.draft}>Draft</span>}
      </div>
      <h3>{article.title}</h3>
      <p>{article.description}</p>
      <span className={s.go}>
        Read <ArrowRight width={14} height={11} />
      </span>
    </Link>
  );
}
