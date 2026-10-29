import type { Metadata } from "next";
import { notFound } from "next/navigation";
import shared from "@/src/components/landing/shared.module.css";
import { MembersOnly } from "@/src/components/resources/MembersOnly";
import s from "@/src/components/resources/resources.module.css";
import t from "@/src/components/resources/tools.module.css";
import { getJobCountsByState } from "@/src/lib/jobs";

// Development only: MembersOnly and getJobCountsByState together, ahead of the tool pages.

export const metadata: Metadata = { title: "Gating example", robots: { index: false, follow: false } };

const PATH = "/resources/dev/gating";

export default async function GatingExample() {
  if (process.env.NODE_ENV === "production") notFound();

  const counts = await getJobCountsByState().catch((err) => {
    console.warn("Job counts unavailable:", err instanceof Error ? err.message : String(err));
    return [];
  });
  const top = [...counts].sort((x, y) => y.jobs - x.jobs)[0];
  const heading = top ? `${top.jobs} open ${top.jobs === 1 ? "job" : "jobs"} near this site` : "Open jobs near this site";

  return (
    <div className={`${shared.wrap} ${t.page}`}>
      <p className={t.kick}>Dev only</p>
      <h1 className={t.devTitle}>Gating example</h1>
      <p className={t.lede}>
        getJobCountsByState() is public: {counts.length ? counts.map((c) => `${c.state} ${c.jobs}`).join(", ") : "no counts"}.
        Below, visitors get the locked card and members get the list.
      </p>
      <MembersOnly heading={heading} path={PATH}>
        <div className={s.cards}>
          {counts.map((c) => (
            <div key={c.state} className={s.card}>
              <div className={s.meta}>
                <span className={s.tag}>{c.state}</span>
              </div>
              <h3>
                {c.jobs} open {c.jobs === 1 ? "job" : "jobs"}
              </h3>
              <p>Members-only content renders here.</p>
            </div>
          ))}
        </div>
      </MembersOnly>
    </div>
  );
}
