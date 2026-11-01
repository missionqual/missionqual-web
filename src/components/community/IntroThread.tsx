import Link from "next/link";
import shared from "@/src/components/landing/shared.module.css";
import { firstName, plural, relativeTime } from "@/src/lib/community/format";
import { Avatar, INTRO_TITLE, PlainText, roleLine, TeamAvatar, TEAM_NAME } from "./bits";
import s from "./community.module.css";
import { BackIcon } from "./icons";
import it from "./intro.module.css";
import q from "./question.module.css";
import {
  DeleteButton,
  Editable,
  EditButton,
  IntroBox,
  ModAnswerTools,
  ModPostTools,
  ReplyButton,
  ReportButton,
} from "./QuestionControls";

type Reply = {
  id: string;
  body: string;
  created_at: string | null;
  author_id: string | null;
  status: string;
  author: { display_name: string | null; job_title: string | null; dc_status: string | null } | null;
};

/**
 * The pinned "introductions" thread (design/onboarding/intro-thread.html): a fixed
 * welcome instead of the stored body, introductions newest first, no votes or accept.
 */
export function IntroThread({
  post,
  replies,
  viewerId,
  mod,
  now,
}: {
  post: { id: string; author_id: string | null; author_name: string | null; pinned: boolean | null; status: string | null };
  replies: Reply[];
  viewerId: string;
  mod: boolean;
  now: number;
}) {
  const newest = [...replies].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  const members = new Set(replies.filter((r) => r.status === "visible").map((r) => r.author_id)).size;

  return (
    <div className={`${shared.wrap} ${it.page}`}>
      <div className={it.lay}>
        <div>
          <Link className={s.crumb} href="/community">
            <BackIcon /> All questions
          </Link>
          {post.status === "hidden" && (
            <p className={q.hiddenNote} style={{ marginTop: 16 }}>
              Hidden by a moderator. Only the author and moderators can see this question.
            </p>
          )}
          <div className={it.tags}>
            <span className={`${it.tg} ${it.tgPin}`}>Pinned</span>
            <span className={it.tg}>Start here</span>
          </div>
          <h1 className={it.h1}>{INTRO_TITLE}</h1>
          <div className={it.by}>
            {post.author_id ? <Avatar id={post.author_id} name={post.author_name} /> : <TeamAvatar className={it.qlogo} />}
            <span>
              <b>{post.author_id ? post.author_name || "Member" : TEAM_NAME}</b>
              <span>Pinned for new members</span>
            </span>
          </div>
          <p className={it.lead}>
            Welcome to MissionQual. Say hello in a few lines so members know who you are and can point you in the
            right direction.
          </p>
          <div className={it.ex}>
            <p className={it.kick}>Example</p>
            <p>
              Hi, I&rsquo;m Michael. QA/QC inspector, 10 years in refineries and LNG, based in Houston. Looking for my
              first data center QA/QC role.
            </p>
          </div>
          {mod && (
            <div className={it.modRow}>
              <ModPostTools postId={post.id} pinned={Boolean(post.pinned)} hidden={post.status === "hidden"} />
            </div>
          )}

          {post.status === "visible" && (
            <>
              <div className={`${it.ih} ${it.ihFirst}`}>
                <h2>Your introduction</h2>
              </div>
              <IntroBox postId={post.id} />
            </>
          )}

          <div className={it.ih}>
            <h2>Introductions</h2>
            <span>{plural(members, "member")}</span>
          </div>
          {newest.length > 0 && (
            <div className={it.intros}>
              {newest.map((r) => {
                const own = r.author_id === viewerId;
                const name = r.author?.display_name ?? "Member";
                return (
                  <article key={r.id} id={`answer-${r.id}`} className={it.ir}>
                    {r.status === "hidden" && (
                      <p className={q.hiddenNote}>
                        Hidden by a moderator. Only {own ? "you" : "the author"} and moderators can see this.
                      </p>
                    )}
                    <div className={it.who}>
                      <Avatar id={r.author_id} name={name} />
                      <span>
                        <b>{name}</b>
                        <span>
                          {[roleLine(r.author?.job_title, r.author?.dc_status), relativeTime(r.created_at, now)]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    </div>
                    <Editable target="answer" id={r.id} body={r.body}>
                      <PlainText text={r.body} className={it.text} />
                      <div className={it.acts}>
                        <ReplyButton name={firstName(name)} label="Say welcome" className={it.welcome} />
                        <span className={it.tools}>
                          {own && <EditButton />}
                          {own && <DeleteButton target="answer" id={r.id} />}
                          {!own && <ReportButton commentId={r.id} />}
                          {mod && <ModAnswerTools commentId={r.id} hidden={r.status === "hidden"} />}
                        </span>
                      </div>
                    </Editable>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className={it.side}>
          <div className={it.sc}>
            <h2>What to include</h2>
            <ul>
              <li>Your role</li>
              <li>Your industry</li>
              <li>Where you&rsquo;re based</li>
              <li>The kind of data center job you&rsquo;re after</li>
            </ul>
          </div>
          <div className={it.sc}>
            <h2>Keep it short</h2>
            <p>Two or three lines is plenty. Members will reply to welcome you and point you to the right people.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
