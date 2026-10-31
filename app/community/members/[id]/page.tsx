import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Avatar, PlainText } from "@/src/components/community/bits";
import { CommunityNav } from "@/src/components/community/CommunityNav";
import s from "@/src/components/community/community.module.css";
import { BackIcon } from "@/src/components/community/icons";
import m from "@/src/components/community/members.module.css";
import shared from "@/src/components/landing/shared.module.css";
import { DC_STATUS, isDcStatus } from "@/src/lib/community/constants";
import { monthYear, plural, relativeTime } from "@/src/lib/community/format";
import { requireViewer, requestTime } from "@/src/lib/community/viewer";
import { createClient } from "@/src/lib/supabase/server";

export const metadata: Metadata = { title: "Member", robots: { index: false, follow: false } };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Activity = { kind: "ASKED" | "ANSWERED"; postId: string; title: string; at: string; detail: string };

async function Profile({ params }: { params: PageProps<"/community/members/[id]">["params"] }) {
  const { id } = await params;
  const viewer = await requireViewer(`/community/members/${id}`);
  if (!UUID_RE.test(id)) notFound();
  const supabase = await createClient();

  const { data: p } = await supabase
    .from("profiles")
    .select("id, display_name, job_title, dc_status, location, years_experience, certifications, industry, came_from, about, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!p) notFound();

  const [{ data: posts }, { data: comments }] = await Promise.all([
    supabase
      .from("post_feed")
      .select("id, title, created_at, answer_count")
      .eq("author_id", id)
      .eq("status", "visible")
      .order("created_at", { ascending: false }),
    supabase
      .from("comments")
      .select("id, created_at, post:posts!comments_post_id_fkey(id, title, status, accepted_comment_id)")
      .eq("author_id", id)
      .eq("status", "visible")
      .order("created_at", { ascending: false }),
  ]);
  const myPosts = posts ?? [];
  // Answers on hidden questions don't count or link anywhere.
  const myAnswers = (comments ?? []).filter((c) => c.post && c.post.status === "visible");

  // Helpful votes received = votes on their questions + votes on their answers.
  const [{ count: postVotes }, { data: answerVotes }] = await Promise.all([
    myPosts.length
      ? supabase.from("post_votes").select("post_id", { count: "exact", head: true }).in("post_id", myPosts.map((x) => x.id!))
      : Promise.resolve({ count: 0 }),
    myAnswers.length
      ? supabase.from("comment_votes").select("comment_id").in("comment_id", myAnswers.map((x) => x.id))
      : Promise.resolve({ data: [] as { comment_id: string }[] }),
  ]);
  const perAnswer = new Map<string, number>();
  for (const v of answerVotes ?? []) perAnswer.set(v.comment_id, (perAnswer.get(v.comment_id) ?? 0) + 1);
  const helpfulReceived = (postVotes ?? 0) + (answerVotes?.length ?? 0);

  const now = requestTime();
  const activity: Activity[] = [
    ...myPosts.slice(0, 5).map((x) => ({
      kind: "ASKED" as const,
      postId: x.id!,
      title: x.title ?? "",
      at: x.created_at ?? "",
      detail: [plural(x.answer_count ?? 0, "answer"), relativeTime(x.created_at, now)].join(" · "),
    })),
    ...myAnswers.slice(0, 5).map((c) => ({
      kind: "ANSWERED" as const,
      postId: c.post!.id,
      title: c.post!.title,
      at: c.created_at ?? "",
      detail: [
        `${perAnswer.get(c.id) ?? 0} helpful`,
        c.post!.accepted_comment_id === c.id ? "Accepted" : null,
        relativeTime(c.created_at, now),
      ]
        .filter(Boolean)
        .join(" · "),
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 5);

  const own = viewer.id === p.id;

  return (
    <div className={`${shared.wrap} ${s.page}`}>
      <div className={s.layout}>
        <div className={s.stack} style={{ gap: 24 }}>
          <Link className={s.crumb} href="/community/members">
            <BackIcon /> All members
          </Link>
          <div className={s.card} style={{ padding: 32 }}>
            <div className={m.pf}>
              <Avatar id={p.id} name={p.display_name} size="xl" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={m.pfTop}>
                  <div>
                    <h1>{p.display_name ?? "Member"}</h1>
                    {p.job_title && <p className={m.pfRole}>{p.job_title}</p>}
                  </div>
                  {/* v1: no "Follow answers" on other members' profiles. */}
                  {own && (
                    <div className={m.pact}>
                      <Link className={s.btn2} href="/account">
                        Edit profile
                      </Link>
                    </div>
                  )}
                </div>
                <div className={s.tags} style={{ gap: 8, marginTop: 14 }}>
                  {isDcStatus(p.dc_status) && (
                    <span className={p.dc_status === "on_site" ? s.tag : s.tagGrey}>{DC_STATUS[p.dc_status]}</span>
                  )}
                  {p.location && <span className={s.tagGrey}>{p.location}</span>}
                  {p.years_experience !== null && <span className={s.tagGrey}>{plural(p.years_experience, "year")}</span>}
                  {p.created_at && <span className={s.tagGrey}>Member since {monthYear(p.created_at)}</span>}
                </div>
              </div>
            </div>
            <div className={m.pstats}>
              <div>
                <b>{myPosts.length}</b>
                <span>Questions</span>
              </div>
              <div>
                <b>{myAnswers.length}</b>
                <span>Answers</span>
              </div>
              <div>
                <b>{helpfulReceived}</b>
                <span>Helpful votes</span>
              </div>
            </div>
          </div>

          {p.about && (
            <div className={`${s.card} ${m.sec}`}>
              <h2>About</h2>
              <PlainText text={p.about} className={m.about} />
            </div>
          )}

          <div className={`${s.card} ${m.sec}`}>
            <h2>Recent activity</h2>
            {activity.length ? (
              activity.map((a) => (
                <Link key={`${a.kind}-${a.postId}-${a.at}`} className={s.mini} href={`/community/questions/${a.postId}`} style={{ marginTop: 4 }}>
                  <span className={m.label}>{a.kind === "ASKED" ? "Asked" : "Answered"}</span>
                  <b style={{ marginTop: 2 }}>{a.title}</b>
                  <span>{a.detail}</span>
                </Link>
              ))
            ) : (
              <p className={s.meta}>No questions or answers yet.</p>
            )}
          </div>
        </div>

        <aside className={s.stack}>
          {p.certifications && p.certifications.length > 0 && (
            <div className={`${s.card} ${m.sec}`}>
              <h2>Certifications</h2>
              <div className={s.tags}>
                {p.certifications.map((c) => (
                  <span key={c} className={s.tagGrey}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Older profiles have only the free-text "Came from"; show it until they pick an industry. */}
          {(p.industry || p.came_from) && (
            <div className={`${s.card} ${m.sec}`}>
              <h2>Industry</h2>
              <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: ".95rem" }}>{p.industry || p.came_from}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function MemberProfilePage(props: PageProps<"/community/members/[id]">) {
  return (
    <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
      <CommunityNav current="members" />
      <Profile params={props.params} />
    </Suspense>
  );
}
