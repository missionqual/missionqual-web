import Link from "next/link";
import shared from "@/src/components/landing/shared.module.css";
import { ASKABLE_TOPICS, FEED_PAGE_SIZE, TOPICS, isTopic } from "@/src/lib/community/constants";
import { firstName, profileCompleteness, sessionTime } from "@/src/lib/community/format";
import { requestTime, type Viewer } from "@/src/lib/community/viewer";
import { createClient } from "@/src/lib/supabase/server";
import { DateBlock, FEED_COLUMNS, QuestionCard, type FeedPost } from "./bits";
import s from "./community.module.css";
import { FilterSelect } from "./FilterSelect";
import { PlusIcon } from "./icons";
import { RsvpButton } from "./RsvpButton";

const SORTS = [
  { value: "", label: "Newest" },
  { value: "unanswered", label: "Unanswered" },
  { value: "helpful", label: "Most helpful" },
];
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type Search = { topic?: string; sort?: string; page?: string };

function feedHref(params: Search) {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]);
  const qs = q.toString();
  return qs ? `/community?${qs}` : "/community";
}

/** "{n} new answers on questions you follow": last 7 days, not by the viewer. */
async function followedAnswerCount(viewerId: string) {
  const supabase = await createClient();
  const { data: follows } = await supabase.from("follows").select("post_id").eq("user_id", viewerId);
  const ids = (follows ?? []).map((f) => f.post_id);
  if (!ids.length) return 0;
  const { count } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .in("post_id", ids)
    .neq("author_id", viewerId)
    .eq("status", "visible")
    .gte("created_at", new Date(Date.now() - WEEK_MS).toISOString());
  return count ?? 0;
}

/** /community for signed-in members (design/community/home.html). */
export async function MemberHome({ viewer, search }: { viewer: Viewer; search: Search }) {
  const supabase = await createClient();
  const topic = isTopic(search.topic) ? search.topic : "";
  const sort = SORTS.some((o) => o.value === search.sort) ? (search.sort as string) : "";
  const page = Math.max(1, Math.min(50, Number.parseInt(search.page ?? "1", 10) || 1));
  const now = requestTime();

  let feed = supabase
    .from("post_feed")
    .select(FEED_COLUMNS, { count: "exact" })
    .eq("status", "visible")
    .eq("pinned", false);
  if (topic) feed = feed.eq("category", topic);
  if (sort === "unanswered") feed = feed.eq("answer_count", 0);
  feed =
    sort === "helpful"
      ? feed.order("helpful_count", { ascending: false }).order("created_at", { ascending: false })
      : feed.order("created_at", { ascending: false });

  const [pinnedRes, feedRes, newAnswers, jobsRes, sessionRes] = await Promise.all([
    topic
      ? Promise.resolve({ data: [] as FeedPost[] })
      : supabase
          .from("post_feed")
          .select(FEED_COLUMNS)
          .eq("status", "visible")
          .eq("pinned", true)
          .order("created_at", { ascending: false }),
    feed.range(0, page * FEED_PAGE_SIZE - 1),
    followedAnswerCount(viewer.id),
    supabase
      .from("jobs")
      .select("id, title, company, location")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("live_sessions")
      .select("id, title, starts_at, live_session_rsvps(user_id)")
      .gte("starts_at", new Date(now).toISOString())
      .order("starts_at")
      .limit(1)
      .maybeSingle(),
  ]);

  const pinned = (pinnedRes.data ?? []) as FeedPost[];
  const posts = (feedRes.data ?? []) as FeedPost[];
  const total = feedRes.count ?? posts.length;
  const jobs = jobsRes.data ?? [];
  const session = sessionRes.data;
  const going = Boolean(session?.live_session_rsvps.some((r) => r.user_id === viewer.id));
  const percent = viewer.profile ? profileCompleteness(viewer.profile) : 0;
  const empty = !pinned.length && !posts.length;

  return (
    <div className={`${shared.wrap} ${s.page}`}>
      <div className={s.layout}>
        <div>
          <div className={s.ph}>
            <div>
              <h1>Welcome back, {firstName(viewer.name)}.</h1>
              {newAnswers > 0 && (
                <p>
                  {newAnswers} new {newAnswers === 1 ? "answer" : "answers"} on questions you follow.
                </p>
              )}
            </div>
            <Link href="/community/ask" className={`${shared.btn} ${s.mobOnly}`}>
              <PlusIcon /> Ask a question
            </Link>
          </div>

          <div className={`${s.chips} ${s.chipsScroll}`} style={{ marginBottom: 16 }}>
            <Link className={`${s.chip} ${!topic ? s.chipOn : ""}`} href={feedHref({ sort })} aria-current={!topic || undefined}>
              All
            </Link>
            {ASKABLE_TOPICS.map((t) => (
              <Link
                key={t}
                className={`${s.chip} ${topic === t ? s.chipOn : ""}`}
                href={feedHref({ topic: t, sort })}
                aria-current={topic === t || undefined}
              >
                {TOPICS[t]}
              </Link>
            ))}
          </div>

          <div className={s.toolbar}>
            <span className={s.meta}>
              {total} {total === 1 ? "question" : "questions"}
            </span>
            <FilterSelect param="sort" value={sort} options={SORTS} label="Sort questions" />
          </div>

          {empty ? (
            <div className={s.empty}>
              <p>No questions here yet. Ask the first one.</p>
              <Link href="/community/ask" className={shared.btn}>
                <PlusIcon /> Ask a question
              </Link>
            </div>
          ) : (
            <div className={s.stack}>
              {pinned.map((p) => (
                <QuestionCard key={p.id} post={p} now={now} />
              ))}
              {posts.map((p) => (
                <QuestionCard key={p.id} post={p} now={now} />
              ))}
            </div>
          )}

          {posts.length < total && (
            <div className={s.center}>
              <Link className={s.btn2} href={feedHref({ topic, sort, page: String(page + 1) })} scroll={false}>
                Load more questions
              </Link>
            </div>
          )}
        </div>

        <aside className={s.stack}>
          <div className={s.card}>
            <div className={s.chead}>
              <h2 className={s.ctitle}>Jobs This Week</h2>
              <Link className={s.link} href="/community/jobs">
                See all
              </Link>
            </div>
            {jobs.length ? (
              jobs.map((j) => (
                <Link key={j.id} className={s.mini} href="/community/jobs">
                  <b>{j.title}</b>
                  <span>{[j.company, j.location].filter(Boolean).join(" · ")}</span>
                </Link>
              ))
            ) : (
              <p className={s.meta}>New openings go up every Thursday.</p>
            )}
          </div>

          {session && (
            <div className={s.card}>
              <div className={s.chead} style={{ marginBottom: 14 }}>
                <h2 className={s.ctitle}>Next live session</h2>
              </div>
              {(() => {
                const t = sessionTime(session.starts_at);
                return (
                  <div className={s.sess}>
                    <DateBlock month={t.month} day={t.day} />
                    <div>
                      <b style={{ display: "block", fontSize: "1rem", lineHeight: 1.35 }}>{session.title}</b>
                      <span className={s.meta}>
                        {t.weekday} · {t.time} CT · Online
                      </span>
                    </div>
                  </div>
                );
              })()}
              {going ? (
                <div className={s.rowEnd} style={{ marginTop: 16 }}>
                  <RsvpButton sessionId={session.id} going />
                </div>
              ) : (
                <RsvpButton sessionId={session.id} going={false} variant="secondary" />
              )}
            </div>
          )}

          {percent < 100 && (
            <div className={s.cardMuted}>
              <h2 className={s.ctitleSmall}>Your profile is {percent}% done</h2>
              <p className={s.meta} style={{ marginTop: 4, fontSize: ".9rem" }}>
                Add your certs and location so the right people find your questions.
              </p>
              <div className={s.progress}>
                <div style={{ width: `${percent}%` }} />
              </div>
              <Link className={s.link} href="/account" style={{ marginTop: 14 }}>
                Finish your profile
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
