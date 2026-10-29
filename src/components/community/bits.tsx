import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { dcStatusPhrase, topicLabel } from "@/src/lib/community/constants";
import { avatarTone, initials, relativeTime } from "@/src/lib/community/format";
import s from "./community.module.css";
import { AnswersIcon, CheckIcon, ChevronIcon, HelpfulIcon, PinIcon } from "./icons";

const TONES = { 1: s.c1, 2: s.c2, 3: s.c3, 4: s.c4 } as const;

export function Avatar({
  id,
  name,
  size = "md",
  teal = false,
  className = "",
}: {
  id?: string | null;
  name: string | null | undefined;
  size?: "sm" | "md" | "lg" | "xl";
  teal?: boolean;
  className?: string;
}) {
  const sizeClass = { sm: s.avSmall, md: "", lg: s.avMedium, xl: s.avLarge }[size];
  return (
    <span className={`${s.av} ${sizeClass} ${teal ? s.avTeal : TONES[avatarTone(id)]} ${className}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

/** "{job_title} · making the move" — the role line under a member's name. */
export function roleLine(title: string | null | undefined, dcStatus: string | null | undefined) {
  return [title?.trim(), dcStatusPhrase(dcStatus)].filter(Boolean).join(" · ");
}

export function Who({
  id,
  name,
  line,
  size = "sm",
}: {
  id?: string | null;
  name: string | null | undefined;
  line: string;
  size?: "sm" | "md";
}) {
  return (
    <div className={s.who}>
      <Avatar id={id} name={name} size={size} />
      <div className={s.whoText}>
        <b>{name || "Member"}</b>
        {line && <span className={s.r}>{line}</span>}
      </div>
    </div>
  );
}

export function TopicTag({ category }: { category: string | null | undefined }) {
  return <span className={s.tag}>{topicLabel(category)}</span>;
}

export function AnsweredBadge({ label = "Answered" }: { label?: string }) {
  return (
    <span className={s.ok}>
      <CheckIcon /> {label}
    </span>
  );
}

const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g;

function linkify(line: string) {
  return line.split(URL_RE).map((part, i) =>
    i % 2 === 1 ? (
      <a key={i} href={part} rel="nofollow noopener" target="_blank">
        {part}
      </a>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/**
 * Member text as plain text: blank lines start paragraphs, single newlines
 * become <br>, plain URLs are linked. React escapes everything else, so no HTML
 * or markdown ever renders.
 */
export function PlainText({ text, className }: { text: string | null | undefined; className?: string }) {
  const paras = (text ?? "").replace(/\r\n/g, "\n").trim().split(/\n{2,}/).filter(Boolean);
  if (!paras.length) return null;
  return (
    <div className={className}>
      {paras.map((p, i) => (
        <p key={i}>
          {p.split("\n").map((line, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {linkify(line)}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}

export type FeedPost = {
  id: string | null;
  title: string | null;
  body: string | null;
  category: string | null;
  pinned: boolean | null;
  accepted_comment_id: string | null;
  author_id: string | null;
  author_name: string | null;
  author_title: string | null;
  author_dc_status: string | null;
  created_at: string | null;
  answer_count: number | null;
  helpful_count: number | null;
};

export const FEED_COLUMNS =
  "id, title, body, category, pinned, accepted_comment_id, author_id, author_name, author_title, author_dc_status, created_at, answer_count, helpful_count";

/** One question in a list (feed, related). Pinned posts get the tinted style and no author row. */
export function QuestionCard({ post, now }: { post: FeedPost; now: number }) {
  const answers = post.answer_count ?? 0;
  const helpful = post.helpful_count ?? 0;
  if (post.pinned) {
    return (
      <Link className={`${s.q} ${s.qPinned}`} href={`/community/questions/${post.id}`}>
        <div className={s.top}>
          <span className={s.pin}>
            <PinIcon /> Pinned
          </span>
        </div>
        <h3>{post.title}</h3>
        {post.body && <p className={s.ex}>{post.body}</p>}
      </Link>
    );
  }
  return (
    <Link className={s.q} href={`/community/questions/${post.id}`}>
      <div className={s.top}>
        <TopicTag category={post.category} />
        {post.accepted_comment_id && <AnsweredBadge />}
        {answers === 0 && <span className={s.tagGrey}>No answers yet</span>}
      </div>
      <h3>{post.title}</h3>
      {post.body && <p className={s.ex}>{post.body}</p>}
      <div className={s.bot}>
        <Who
          id={post.author_id}
          name={post.author_name}
          line={[roleLine(post.author_title, post.author_dc_status), relativeTime(post.created_at, now)]
            .filter(Boolean)
            .join(" · ")}
        />
        <div className={s.stats}>
          <span>
            <AnswersIcon /> {answers} {answers === 1 ? "answer" : "answers"}
          </span>
          <span>
            <HelpfulIcon /> {helpful} helpful
          </span>
        </div>
      </div>
    </Link>
  );
}

/** A native <select> drawn like the reference's .sel pill. */
export function SelectBox({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`${s.selWrap} ${className}`}>
      {children}
      <span className={s.selChev}>
        <ChevronIcon />
      </span>
    </span>
  );
}

export function DateBlock({ month, day }: { month: string; day: string }) {
  return (
    <div className={s.date} aria-hidden="true">
      <div className={s.dateM}>{month}</div>
      <div className={s.dateD}>{day}</div>
    </div>
  );
}
