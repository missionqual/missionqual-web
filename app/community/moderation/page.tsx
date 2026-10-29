import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CommunityNav } from "@/src/components/community/CommunityNav";
import s from "@/src/components/community/community.module.css";
import { ReportActions } from "@/src/components/community/ReportActions";
import shared from "@/src/components/landing/shared.module.css";
import { relativeTime } from "@/src/lib/community/format";
import { isModerator, requireViewer, requestTime } from "@/src/lib/community/viewer";
import { createAdminClient } from "@/src/lib/supabase/admin";

export const metadata: Metadata = { title: "Moderation", robots: { index: false, follow: false } };

async function Moderation() {
  await requireViewer("/community/moderation");
  if (!(await isModerator())) notFound();

  // Reports are insert-only for members; moderators read them through the service role.
  const admin = createAdminClient();
  const { data: reports } = await admin
    .from("reports")
    .select(
      "id, reason, created_at, post_id, comment_id, reporter:profiles!reports_reporter_id_fkey(display_name), post:posts(id, title, status), comment:comments(id, post_id, body, status)",
    )
    .is("resolved_at", null)
    .order("created_at", { ascending: false });
  const now = requestTime();

  return (
    <div className={`${shared.wrap} ${s.page}`}>
      <div className={s.ph}>
        <div>
          <h1>Moderation</h1>
          <p>Open reports, newest first.</p>
        </div>
      </div>
      {reports?.length ? (
        <div className={s.stack}>
          {reports.map((r) => {
            const isAnswer = Boolean(r.comment_id);
            const postId = isAnswer ? r.comment?.post_id : r.post?.id;
            const href = postId ? `/community/questions/${postId}${isAnswer ? `#answer-${r.comment_id}` : ""}` : null;
            const hidden = (isAnswer ? r.comment?.status : r.post?.status) === "hidden";
            const label = isAnswer ? `Answer: ${(r.comment?.body ?? "").slice(0, 90)}` : `Question: ${r.post?.title ?? ""}`;
            return (
              <div key={r.id} className={s.card}>
                <div className={s.top}>
                  <span className={isAnswer ? s.tagGrey : s.tag}>{isAnswer ? "Answer" : "Question"}</span>
                  {hidden && <span className={s.tagGrey}>Hidden</span>}
                  <span className={s.meta}>
                    Reported by {r.reporter?.display_name ?? "a member"} · {relativeTime(r.created_at, now)}
                  </span>
                </div>
                <p style={{ margin: "0 0 10px", color: "var(--ink)" }}>&ldquo;{r.reason}&rdquo;</p>
                {href ? (
                  <Link className={s.link} href={href}>
                    {label}
                  </Link>
                ) : (
                  <span className={s.meta}>The reported content was deleted.</span>
                )}
                <ReportActions
                  reportId={r.id}
                  target={isAnswer ? { kind: "answer", id: r.comment_id! } : { kind: "question", id: r.post_id! }}
                  hidden={hidden}
                  exists={Boolean(href)}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className={s.empty}>
          <p>No open reports.</p>
        </div>
      )}
    </div>
  );
}

/** Moderators only; everyone else gets a 404. */
export default function ModerationPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
      <CommunityNav current={null} />
      <Moderation />
    </Suspense>
  );
}
