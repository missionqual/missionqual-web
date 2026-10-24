import Link from "next/link";
import s from "@/src/components/community/community.module.css";
import { CheckIcon } from "@/src/components/community/icons";
import j from "@/src/components/community/join.module.css";
import shared from "@/src/components/landing/shared.module.css";
import { HOUSE_RULES } from "@/src/lib/community/constants";
import { pageMetadata } from "@/src/lib/seo";

export const metadata = pageMetadata({
  title: "Community rules",
  description: "The four house rules of the MissionQual community, and how reporting works.",
  path: "/community/rules",
});

/** Public. The four house rules from the join page, plus how reporting works. */
export default function RulesPage() {
  return (
    <div className={`${shared.wrap} ${s.page}`} style={{ maxWidth: 820 }}>
      <div className={s.ph}>
        <div>
          <p className={s.kicker}>The MissionQual community</p>
          <h1>Community rules</h1>
          <p>Four rules keep it useful. Break them and you&rsquo;re off the job.</p>
        </div>
      </div>
      <div className={s.card}>
        <ul className={j.rl}>
          {HOUSE_RULES.map((r) => (
            <li key={r.title}>
              <span className={j.ic}>
                <CheckIcon />
              </span>
              <div>
                <b>{r.title}</b>
                <span>{r.text}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className={s.cardMuted} style={{ marginTop: 16 }}>
        <h2 className={s.ctitle}>How reporting works</h2>
        <p style={{ margin: "8px 0 0", color: "var(--ink-soft)", lineHeight: 1.6 }}>
          Any member can report a question or answer with the Report link under it. A moderator reviews every
          report. If a post breaks the rules, the moderator hides it, and hidden posts disappear for everyone
          except the person who wrote them.
        </p>
      </div>
      <p className={s.meta} style={{ marginTop: 24 }}>
        <Link className={s.link} href="/community">
          Back to the community
        </Link>
      </p>
    </div>
  );
}
