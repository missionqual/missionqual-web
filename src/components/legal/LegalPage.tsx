import type { ComponentType } from "react";
import shared from "@/src/components/landing/shared.module.css";
import a from "@/src/components/resources/article.module.css";
import { Toc } from "@/src/components/resources/Toc";
import type { LegalMeta } from "@/src/lib/legal";
import type { TocItem } from "@/src/lib/resources";
import s from "./legal.module.css";

/**
 * Privacy and Terms: a short navy hero, then the MDX in one readable column
 * with the article prose styles. "On this page" on desktop only. No calls to action.
 */
export function LegalPage({ meta, toc, Body }: { meta: LegalMeta; toc: TocItem[]; Body: ComponentType }) {
  return (
    <>
      <section className={a.hero}>
        <div className={`${shared.wrap} ${a.heroInner} ${s.heroInner}`}>
          <p className={s.kick}>Legal</p>
          <h1>{meta.title}</h1>
          <p className={s.updated}>Last updated {meta.updated}</p>
        </div>
      </section>
      <div className={`${shared.wrap} ${a.layout} ${s.layout}`}>
        <article className={`${a.prose} ${s.prose}`}>
          <Body />
        </article>
        {toc.length > 0 && <Toc items={toc} />}
      </div>
    </>
  );
}
