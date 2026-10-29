import Link from "next/link";
import type { ReactNode } from "react";
import shared from "@/src/components/landing/shared.module.css";
import a from "./article.module.css";

/** The article page's navy hero, for the tool pages: "Resources / <tool>", title, intro. */
export function ToolHero({ crumb, title, children }: { crumb: string; title: string; children?: ReactNode }) {
  return (
    <section className={a.hero}>
      <div className={`${shared.wrap} ${a.heroInner}`}>
        <p className={a.crumb}>
          <Link href="/resources">Resources</Link> / {crumb}
        </p>
        <h1>{title}</h1>
        {children && <p className={a.heroSub}>{children}</p>}
      </div>
    </section>
  );
}
