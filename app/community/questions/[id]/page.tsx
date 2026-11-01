import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AnsweredBadge, Avatar, PlainText, roleLine, TeamAvatar, TEAM_NAME, TopicTag, Who } from "@/src/components/community/bits";
import { CommunityNav } from "@/src/components/community/CommunityNav";
import { IntroThread } from "@/src/components/community/IntroThread";
import s from "@/src/components/community/community.module.css";
import { BackIcon, CheckIcon } from "@/src/components/community/icons";
import q from "@/src/components/community/question.module.css";
import {
  AcceptButton,
  AnswerBox,
  DeleteButton,
  Editable,
  EditButton,
  FollowButton,
  HelpfulButton,
  ModAnswerTools,
  ModPostTools,
  MoreAnswers,
  ReplyButton,
  ReportButton,
} from "@/src/components/community/QuestionControls";
import shared from "@/src/components/landing/shared.module.css";
import { firstName, plural, relativeTime } from "@/src/lib/community/format";
import { isModerator, requireViewer, requestTime } from "@/src/lib/community/viewer";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

export const metadata: Metadata = { title: "Question", robots: { index: false, follow: false } };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Long threads show this many answers before "Show n more answers". */
const VISIBLE_ANSWERS = 3;

async function Question({ params }: { params: PageProps<"/community/questions/[id]">["params"] }) {
  const { id } = await params;
  const viewer = await requireViewer(`/community/questions/${id}`);
  if (!UUID_RE.test(id)) notFound();
  const mod = await isModerator();
  // Moderators read through the service role so they can see (and unhide) hidden content.
  const db = mod ? createAdminClient() : await createClient();
  const supabase = await createClient();

  const { data: post } = await db
    .from("post_feed")
    .select("id, title, body, category, pinned, status, accepted_comment_id, author_id, author_name, created_at, helpful_count")
    .eq("id", id)
    .maybeSingle();
  // Hidden questions disappear for everyone except the author (and moderators).
  if (!post?.id || (post.status === "hidden" && post.author_id !== viewer.id && !mod)) notFound();

  const [{ data: author }, { data: comments }, { data: myPostVote }, { data: follow }, { data: related }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, display_name, job_title, dc_status, location, years_experience, certifications")
        .eq("id", post.author_id ?? "")
        .maybeSingle(),
      db
        .from("comments")
        .select("id, body, created_at, author_id, status, author:profiles!comments_author_id_fkey(display_name, job_title, dc_status)")
        .eq("post_id", id),
      supabase.from("post_votes").select("post_id").eq("post_id", id).eq("user_id", viewer.id).maybeSingle(),
      supabase.from("follows").select("post_id").eq("post_id", id).eq("user_id", viewer.id).maybeSingle(),
      supabase
        .from("post_feed")
        .select("id, title, answer_count")
        .eq("status", "visible")
        .eq("category", post.category ?? "")
        .neq("id", id)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  const answers = comments ?? [];
  const now = requestTime();
  // The pinned "Start here" thread has its own layout (design/onboarding/intro-thread.html).
  if (post.category === "introductions") {
    return <IntroThread post={{ ...post, id }} replies={answers} viewerId={viewer.id} mod={mod} now={now} />;
  }
  const { data: votes } = answers.length
    ? await supabase.from("comment_votes").select("comment_id, user_id").in("comment_id", answers.map((a) => a.id))
    : { data: [] };
  const voteCount = new Map<string, number>();
  const myVotes = new Set<string>();
  for (const v of votes ?? []) {
    voteCount.set(v.comment_id, (voteCount.get(v.comment_id) ?? 0) + 1);
    if (v.user_id === viewer.id) myVotes.add(v.comment_id);
  }

  // Accepted first, then most helpful, then oldest.
  const ordered = [...answers].sort((a, b) => {
    if (a.id === post.accepted_comment_id) return -1;
    if (b.id === post.accepted_comment_id) return 1;
    const diff = (voteCount.get(b.id) ?? 0) - (voteCount.get(a.id) ?? 0);
    if (diff) return diff;
    return (a.created_at ?? "").localeCompare(b.created_at ?? "");
  });

  const isAuthor = post.author_id === viewer.id;
  const visibleCount = answers.filter((a) => a.status === "visible").length;

  const renderAnswer = (a: (typeof ordered)[number]): ReactNode => {
    const accepted = a.id === post.accepted_comment_id;
    const own = a.author_id === viewer.id;
    const name = a.author?.display_name ?? "Member";
    return (
      <div key={a.id} id={`answer-${a.id}`} className={`${q.an} ${accepted ? q.acc : ""}`}>
        {a.status === "hidden" && <p className={q.hiddenNote}>Hidden by a moderator. Only {own ? "you" : "the author"} and moderators can see this.</p>}
        {accepted && (
          <span className={q.accb}>
            <CheckIcon /> Accepted answer
          </span>
        )}
        <Who
          id={a.author_id}
          name={name}
          line={[roleLine(a.author?.job_title, a.author?.dc_status), relativeTime(a.created_at, now)].filter(Boolean).join(" · ")}
        />
        <Editable target="answer" id={a.id} body={a.body}>
          <>
            <PlainText text={a.body} className={q.ab} />
            <div className={q.af}>
              <div className={q.afLeft}>
                <HelpfulButton target="answer" id={a.id} count={voteCount.get(a.id) ?? 0} on={myVotes.has(a.id)} own={own} />
                <ReplyButton name={firstName(name)} />
                {isAuthor && <AcceptButton postId={id} commentId={a.id} accepted={accepted} />}
              </div>
              <div className={q.afRight}>
                {own && <EditButton />}
                {own && <DeleteButton target="answer" id={a.id} />}
                {!own && <ReportButton commentId={a.id} />}
                {mod && <ModAnswerTools commentId={a.id} hidden={a.status === "hidden"} />}
              </div>
            </div>
          </>
        </Editable>
      </div>
    );
  };

  const shown = ordered.length > VISIBLE_ANSWERS + 2 ? ordered.slice(0, VISIBLE_ANSWERS) : ordered;
  const extra = ordered.length > VISIBLE_ANSWERS + 2 ? ordered.slice(VISIBLE_ANSWERS) : [];

  return (
    <div className={`${shared.wrap} ${s.page}`}>
      <div className={s.layout}>
        <div className={q.qd}>
          <Link className={s.crumb} href="/community">
            <BackIcon /> All questions
          </Link>
          {post.status === "hidden" && (
            <p className={q.hiddenNote} style={{ marginTop: 16 }}>
              Hidden by a moderator. Only the author and moderators can see this question.
            </p>
          )}
          <div className={q.tagRow}>
            <TopicTag category={post.category} />
            {post.accepted_comment_id && <AnsweredBadge />}
          </div>
          <Editable target="question" id={id} title={post.title ?? ""} body={post.body ?? ""}>
            <>
              <h1>{post.title}</h1>
              <div style={{ marginTop: 16 }}>
                <Who
                  id={post.author_id}
                  name={post.author_name}
                  team={!post.author_id}
                  line={[roleLine(author?.job_title, author?.dc_status), `Asked ${relativeTime(post.created_at, now)}`]
                    .filter(Boolean)
                    .join(" · ")}
                />
              </div>
              <PlainText text={post.body} className={q.body} />
              <div className={q.acts2}>
                <HelpfulButton target="post" id={id} count={post.helpful_count ?? 0} on={Boolean(myPostVote)} own={isAuthor} />
                <FollowButton postId={id} following={Boolean(follow)} />
                <div className={q.owner}>
                  {isAuthor && <EditButton />}
                  {isAuthor && <DeleteButton target="question" id={id} />}
                  {!isAuthor && <ReportButton postId={id} />}
                  {mod && <ModPostTools postId={id} pinned={Boolean(post.pinned)} hidden={post.status === "hidden"} />}
                </div>
              </div>
            </>
          </Editable>

          <h2 className={q.ansh}>{plural(visibleCount, "answer")}</h2>
          {ordered.length > 0 && <MoreAnswers extra={extra.map(renderAnswer)}>{shown.map(renderAnswer)}</MoreAnswers>}

          {post.status === "visible" && <AnswerBox postId={id} />}
        </div>

        <aside className={s.stack}>
          <div className={s.card}>
            <h2 className={s.ctitle} style={{ marginBottom: 14 }}>
              Asked by
            </h2>
            <div className={s.who}>
              {post.author_id ? <Avatar id={post.author_id} name={post.author_name} /> : <TeamAvatar />}
              <div className={s.whoText}>
                <b>{post.author_id ? (post.author_name ?? "Member") : TEAM_NAME}</b>
                <span className={s.r}>{roleLine(author?.job_title, author?.dc_status)}</span>
              </div>
            </div>
            {author && (
              <p className={s.meta} style={{ marginTop: 14, fontSize: ".9rem" }}>
                {[
                  author.location,
                  author.years_experience !== null ? plural(author.years_experience, "year") : null,
                  author.certifications?.join(", "),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            {post.author_id && (
              <Link className={s.link} href={`/community/members/${post.author_id}`} style={{ marginTop: 12 }}>
                View profile
              </Link>
            )}
          </div>
          {related && related.length > 0 && (
            <div className={s.card}>
              <h2 className={s.ctitle} style={{ marginBottom: 6 }}>
                Related questions
              </h2>
              <div className={q.related}>
                {related.map((r) => (
                  <Link key={r.id} className={s.mini} href={`/community/questions/${r.id}`}>
                    <b>{r.title}</b>
                    <span>{plural(r.answer_count ?? 0, "answer")}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function QuestionPage(props: PageProps<"/community/questions/[id]">) {
  return (
    <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
      <CommunityNav current="questions" />
      <Question params={props.params} />
    </Suspense>
  );
}
