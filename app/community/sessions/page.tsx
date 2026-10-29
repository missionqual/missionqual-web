import type { Metadata } from "next";
import { Suspense } from "react";
import { DateBlock } from "@/src/components/community/bits";
import { CommunityNav } from "@/src/components/community/CommunityNav";
import s from "@/src/components/community/community.module.css";
import { PlayIcon } from "@/src/components/community/icons";
import { RsvpButton } from "@/src/components/community/RsvpButton";
import shared from "@/src/components/landing/shared.module.css";
import { SESSION_PROPOSAL_MAILTO } from "@/src/lib/community/constants";
import { sessionTime } from "@/src/lib/community/format";
import { requireViewer, requestTime } from "@/src/lib/community/viewer";
import { createClient } from "@/src/lib/supabase/server";
import x from "@/src/components/community/sessions.module.css";

export const metadata: Metadata = { title: "Live sessions", robots: { index: false, follow: false } };

const HOUR_MS = 60 * 60 * 1000;

/** "Hosted by the MissionQual team" vs "With Kevin Hale, commissioning agent". */
function hostLine(host: string) {
  return /^the\s/i.test(host) ? `Hosted by ${host}` : `With ${host}`;
}

async function Sessions() {
  const viewer = await requireViewer("/community/sessions");
  const supabase = await createClient();
  const now = requestTime();
  const nowIso = new Date(now).toISOString();

  const [{ data: upcoming }, { data: past }] = await Promise.all([
    supabase
      .from("live_sessions")
      .select("id, title, description, host_name, starts_at, duration_minutes, join_url, live_session_rsvps(user_id)")
      .gte("starts_at", nowIso)
      .order("starts_at"),
    supabase
      .from("live_sessions")
      .select("id, title, starts_at, duration_minutes, recording_url")
      .lt("starts_at", nowIso)
      .not("recording_url", "is", null)
      .order("starts_at", { ascending: false })
      .limit(6),
  ]);

  return (
    <div className={`${shared.wrap} ${s.page}`}>
      <div className={s.layout}>
        <div>
          <div className={s.ph}>
            <div>
              <h1>Live sessions</h1>
              <p>Wednesday evenings, online. Ask your questions live or drop them in ahead of time.</p>
            </div>
          </div>
          <h2 className={s.ctitle} style={{ marginBottom: 14 }}>
            Upcoming
          </h2>
          {upcoming?.length ? (
            <div className={s.stack}>
              {upcoming.map((session) => {
                const t = sessionTime(session.starts_at);
                const rsvps = session.live_session_rsvps;
                const going = rsvps.some((r) => r.user_id === viewer.id);
                // The join link appears for people who RSVP'd, from an hour before the start.
                const showJoin = going && session.join_url && now >= new Date(session.starts_at).getTime() - HOUR_MS;
                return (
                  <div key={session.id} className={`${s.card} ${s.sess}`}>
                    <DateBlock month={t.month} day={t.day} />
                    <div className={x.body}>
                      <h3>{session.title}</h3>
                      <p className={s.meta} style={{ marginTop: 4, fontSize: ".9rem" }}>
                        {t.weekday} · {t.time} CT · {session.duration_minutes} min · Online
                      </p>
                      {session.description && <p className={x.desc}>{session.description}</p>}
                      <div className={x.srow}>
                        <span className={s.meta}>
                          {hostLine(session.host_name)} · {rsvps.length} going
                        </span>
                        <div className={s.rowEnd}>
                          {showJoin && (
                            <a className={s.link} href={session.join_url!} target="_blank" rel="noopener">
                              Join link
                            </a>
                          )}
                          <RsvpButton sessionId={session.id} going={going} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={s.empty}>
              <p>No sessions scheduled yet. Check back soon.</p>
            </div>
          )}
        </div>

        <aside className={s.stack}>
          {past && past.length > 0 && (
            <div className={s.card}>
              <h2 className={s.ctitle} style={{ marginBottom: 6 }}>
                Recordings
              </h2>
              {past.map((r) => (
                <a key={r.id} className={`${s.mini} ${x.rec}`} href={r.recording_url!} target="_blank" rel="noopener">
                  <span className={x.play}>
                    <PlayIcon />
                  </span>
                  <span>
                    <b>{r.title}</b>
                    <span>
                      {sessionTime(r.starts_at).date} · {r.duration_minutes} min
                    </span>
                  </span>
                </a>
              ))}
            </div>
          )}
          <div className={s.cardMuted}>
            <h2 className={s.ctitleSmall}>Want to run one?</h2>
            <p className={s.meta} style={{ marginTop: 6, fontSize: ".92rem", lineHeight: 1.55 }}>
              Made the move recently? A 30-minute &ldquo;how I got hired&rdquo; helps more people than you&rsquo;d think.
            </p>
            <a className={s.link} href={SESSION_PROPOSAL_MAILTO} style={{ marginTop: 12 }}>
              Tell us your story
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function SessionsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
      <CommunityNav current="sessions" />
      <Sessions />
    </Suspense>
  );
}
