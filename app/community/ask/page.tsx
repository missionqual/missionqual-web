import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import a from "@/src/components/community/ask.module.css";
import { AskForm } from "@/src/components/community/AskForm";
import { CommunityNav } from "@/src/components/community/CommunityNav";
import s from "@/src/components/community/community.module.css";
import { BackIcon } from "@/src/components/community/icons";
import shared from "@/src/components/landing/shared.module.css";
import { TITLE_MAX } from "@/src/lib/community/constants";
import { requireViewer } from "@/src/lib/community/viewer";
import { createClient } from "@/src/lib/supabase/server";

export const metadata: Metadata = { title: "Ask a question", robots: { index: false, follow: false } };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function Ask({ searchParams }: { searchParams: PageProps<"/community/ask">["searchParams"] }) {
  const sp = await searchParams;
  const jobParam = typeof sp.job === "string" && UUID_RE.test(sp.job) ? sp.job : null;
  // ?title=: a prefilled title from Resources. A trailing space stays, so "Interview question: " reads as a prompt.
  const titleParam = typeof sp.title === "string" ? sp.title.trimStart().slice(0, TITLE_MAX) : "";
  const back = new URLSearchParams();
  if (jobParam) back.set("job", jobParam);
  if (titleParam) back.set("title", titleParam);
  await requireViewer(back.size ? `/community/ask?${back}` : "/community/ask");

  // ?job=<id>: "About this job: {title}, {location}" under Getting hired.
  let job: { id: string; title: string; company: string | null; location: string | null } | null = null;
  if (jobParam) {
    const supabase = await createClient();
    const { data } = await supabase.from("jobs").select("id, title, company, location").eq("id", jobParam).maybeSingle();
    job = data;
  }
  const defaultTitle = job
    ? `About this job: ${[job.title, job.location].filter(Boolean).join(", ")}`.slice(0, TITLE_MAX)
    : titleParam;

  return (
    <div className={`${shared.wrap} ${s.page}`}>
      <div className={`${s.layout} ${a.asklay}`}>
        <div>
          <Link className={s.crumb} href="/community">
            <BackIcon /> All questions
          </Link>
          <div className={s.ph} style={{ marginTop: 16 }}>
            <div>
              <h1>Ask a question</h1>
              <p>Members who&rsquo;ve made the move answer here. We&rsquo;ll email you when someone replies.</p>
            </div>
          </div>
          {job && (
            <div className={`${s.job} ${a.jobCard}`}>
              <div className={s.jm}>
                <span>ASKING ABOUT</span>
              </div>
              <h3>{job.title}</h3>
              <p className={s.co}>{[job.company, job.location].filter(Boolean).join(" · ")}</p>
            </div>
          )}
          <AskForm defaultTitle={defaultTitle} defaultTopic={job ? "getting_hired" : undefined} jobId={job?.id} />
        </div>
        <aside className={s.stack}>
          <div className={s.card}>
            <h2 className={s.ctitle}>Tips for a better answer</h2>
            <ul className={a.tips}>
              <li>
                <b>Share your background.</b> Your trade, certifications and years of experience.
              </li>
              <li>
                <b>Keep it to one question.</b> If you have two, post them separately.
              </li>
              <li>
                <b>Asking about an offer?</b> Include the hourly rate, per diem, hours per week and how long the job lasts.
              </li>
            </ul>
          </div>
          <div className={s.cardMuted}>
            <h2 className={s.ctitleSmall}>Before you post</h2>
            <p className={s.meta} style={{ marginTop: 6, fontSize: ".92rem", lineHeight: 1.55 }}>
              No site drawings, photos, owner documents or anything under NDA. Don&rsquo;t name people in a bad
              light. <Link href="/community/rules">House rules</Link>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function AskPage(props: PageProps<"/community/ask">) {
  return (
    <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
      <CommunityNav current={null} />
      <Ask searchParams={props.searchParams} />
    </Suspense>
  );
}
