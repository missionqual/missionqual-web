"use client";

import { createContext, useActionState, useContext, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import {
  deleteAnswer,
  deleteQuestion,
  editAnswer,
  editQuestion,
  postAnswer,
  reportContent,
  setAcceptedAnswer,
  toggleAnswerHelpful,
  toggleFollow,
  togglePostHelpful,
  type ActionState,
} from "@/app/community/actions";
import { setCommentStatus, setPinned, setPostStatus } from "@/app/community/moderation/actions";
import shared from "@/src/components/landing/shared.module.css";
import { BODY_MAX, TITLE_MAX } from "@/src/lib/community/constants";
import s from "./community.module.css";
import { BellIcon, HelpfulIcon } from "./icons";
import q from "./question.module.css";

const REPLY_EVENT = "mq:reply";

/** "Helpful · n". Disabled on your own content. */
export function HelpfulButton({
  target,
  id,
  count,
  on,
  own,
}: {
  target: "post" | "answer";
  id: string;
  count: number;
  on: boolean;
  own: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className={`${s.vote} ${on ? s.voteOn : ""}`}
      aria-pressed={on}
      disabled={own || pending}
      title={own ? "You can't vote on your own post" : undefined}
      onClick={() => startTransition(() => (target === "post" ? togglePostHelpful(id) : toggleAnswerHelpful(id)))}
    >
      <HelpfulIcon /> Helpful · {count}
    </button>
  );
}

export function FollowButton({ postId, following }: { postId: string; following: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className={`${s.vote} ${following ? s.voteOn : ""}`}
      aria-pressed={following}
      disabled={pending}
      onClick={() => startTransition(() => toggleFollow(postId))}
    >
      <BellIcon /> {following ? "Following" : "Follow"}
    </button>
  );
}

export function AcceptButton({ postId, commentId, accepted }: { postId: string; commentId: string; accepted: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className={s.link}
      disabled={pending}
      onClick={() => startTransition(() => setAcceptedAnswer(postId, accepted ? null : commentId))}
    >
      {accepted ? "Unmark" : "Mark as accepted answer"}
    </button>
  );
}

/** "Reply" scrolls to the answer box and pre-fills "@First name ". */
export function ReplyButton({ name }: { name: string }) {
  return (
    <button
      type="button"
      className={s.link}
      onClick={() => window.dispatchEvent(new CustomEvent(REPLY_EVENT, { detail: name }))}
    >
      Reply
    </button>
  );
}

/** Two-step delete without a browser dialog. */
export function DeleteButton({ target, id }: { target: "question" | "answer"; id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  if (!confirming) {
    return (
      <button type="button" className={s.quiet} onClick={() => setConfirming(true)}>
        Delete
      </button>
    );
  }
  return (
    <span className={q.confirm}>
      Delete this {target}?
      <button
        type="button"
        className={`${s.link} ${q.danger}`}
        disabled={pending}
        onClick={() => startTransition(() => (target === "question" ? deleteQuestion(id) : deleteAnswer(id)))}
      >
        {pending ? "Deleting…" : "Yes, delete"}
      </button>
      <button type="button" className={s.quiet} onClick={() => setConfirming(false)}>
        Cancel
      </button>
    </span>
  );
}

/** Own question or answer: swaps the read view for an inline form. */
// The page is a Server Component, so it can't hand Editable a render function:
// <EditButton /> inside the children reaches Editable through this context instead.
const StartEdit = createContext<(() => void) | null>(null);

/** "Edit" for a question or answer; only works inside <Editable>. */
export function EditButton() {
  const start = useContext(StartEdit);
  if (!start) return null;
  return (
    <button type="button" className={s.quiet} onClick={start}>
      Edit
    </button>
  );
}

export function Editable({
  target,
  id,
  title,
  body,
  children,
}: {
  target: "question" | "answer";
  id: string;
  title?: string;
  body: string;
  children: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(
    async (prev, fd) => {
      const result = await (target === "question" ? editQuestion(prev, fd) : editAnswer(prev, fd));
      if (result.ok) setEditing(false);
      return result;
    },
    {},
  );

  if (!editing) return <StartEdit.Provider value={() => setEditing(true)}>{children}</StartEdit.Provider>;
  return (
    <form action={action} className={q.editForm}>
      <input type="hidden" name={target === "question" ? "post_id" : "comment_id"} value={id} />
      {target === "question" && (
        <div>
          <label className={s.lab} htmlFor={`edit-title-${id}`}>
            Your question
          </label>
          <input id={`edit-title-${id}`} className={s.inp} name="title" defaultValue={title} maxLength={TITLE_MAX} required />
        </div>
      )}
      <div>
        <label className={s.lab} htmlFor={`edit-body-${id}`}>
          {target === "question" ? "Details" : "Your answer"}
        </label>
        <textarea id={`edit-body-${id}`} className={s.inp} name="body" defaultValue={body} maxLength={BODY_MAX} />
      </div>
      {state.error && (
        <p className={s.error} role="alert">
          {state.error}
        </p>
      )}
      <div className={q.editActs}>
        <button type="submit" className={`${shared.btn} ${shared.btnSm}`} disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </button>
        <button type="button" className={s.btn2} onClick={() => setEditing(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/** "Report" link + a small dialog that inserts into reports. */
export function ReportButton({ postId, commentId }: { postId?: string; commentId?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(reportContent, {});
  return (
    <>
      <button type="button" className={s.quiet} onClick={() => ref.current?.showModal()}>
        Report
      </button>
      <dialog
        ref={ref}
        className={q.reportDialog}
        aria-labelledby={`report-${commentId ?? postId}`}
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      >
        <div className={q.reportCard}>
          <h2 id={`report-${commentId ?? postId}`}>Report this {commentId ? "answer" : "question"}</h2>
          {state.ok ? (
            <>
              <p className={s.success} role="status">
                {state.message}
              </p>
              <button type="button" className={s.btn2} onClick={() => ref.current?.close()}>
                Close
              </button>
            </>
          ) : (
            <form action={action} className={q.editForm} style={{ marginTop: 0 }}>
              {postId && <input type="hidden" name="post_id" value={postId} />}
              {commentId && <input type="hidden" name="comment_id" value={commentId} />}
              <label className={s.lab} htmlFor={`reason-${commentId ?? postId}`}>
                What&rsquo;s wrong with it?
              </label>
              <textarea
                id={`reason-${commentId ?? postId}`}
                className={s.inp}
                name="reason"
                required
                minLength={3}
                maxLength={1000}
              />
              {state.error && (
                <p className={s.error} role="alert">
                  {state.error}
                </p>
              )}
              <div className={q.editActs}>
                <button type="submit" className={`${shared.btn} ${shared.btnSm}`} disabled={pending}>
                  {pending ? "Sending…" : "Send report"}
                </button>
                <button type="button" className={s.btn2} onClick={() => ref.current?.close()}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}

/** "Your answer" box. Listens for Reply clicks to pre-fill "@First name ". */
export function AnswerBox({ postId }: { postId: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, fd) => {
    const result = await postAnswer(prev, fd);
    if (result.ok && textRef.current) textRef.current.value = "";
    return result;
  }, {});

  useEffect(() => {
    const onReply = (e: Event) => {
      const name = (e as CustomEvent<string>).detail;
      const box = textRef.current;
      if (!box) return;
      const mention = `@${name} `;
      if (!box.value.startsWith(mention)) box.value = mention + box.value;
      wrapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      box.focus();
      box.setSelectionRange(box.value.length, box.value.length);
    };
    window.addEventListener(REPLY_EVENT, onReply);
    return () => window.removeEventListener(REPLY_EVENT, onReply);
  }, []);

  return (
    <div ref={wrapRef} className={q.reply} id="answer">
      <form ref={formRef} action={action}>
        <input type="hidden" name="post_id" value={postId} />
        <label className={s.lab} htmlFor="answer-body">
          Your answer
        </label>
        <textarea
          ref={textRef}
          id="answer-body"
          className={s.inp}
          name="body"
          required
          maxLength={BODY_MAX}
          placeholder="Share what you know. Be specific: the role, the site type, what actually happened."
        />
        {state.error && (
          <p className={s.error} role="alert" style={{ marginTop: 10 }}>
            {state.error}
          </p>
        )}
        <div className={q.row}>
          <label className={s.check}>
            <input className={s.box} type="checkbox" name="follow" defaultChecked />
            Email me when someone replies
          </label>
          <button type="submit" className={`${shared.btn} ${shared.btnSm}`} disabled={pending}>
            {pending ? "Posting…" : "Post answer"}
          </button>
        </div>
      </form>
    </div>
  );
}

/** Long threads show the first answers and a "Show n more answers" button. */
export function MoreAnswers({ children, extra }: { children: ReactNode; extra: ReactNode[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={s.stack}>
        {children}
        {open && extra}
      </div>
      {!open && extra.length > 0 && (
        <div className={s.center} style={{ marginTop: 16 }}>
          <button type="button" className={s.btn2} onClick={() => setOpen(true)}>
            Show {extra.length} more {extra.length === 1 ? "answer" : "answers"}
          </button>
        </div>
      )}
    </>
  );
}

// ---------- Moderator tools (the server re-checks isModerator in every action) ----------

export function ModPostTools({ postId, pinned, hidden }: { postId: string; pinned: boolean; hidden: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <>
      <button type="button" className={s.quiet} disabled={pending} onClick={() => startTransition(() => setPinned(postId, !pinned))}>
        {pinned ? "Unpin" : "Pin"}
      </button>
      <button
        type="button"
        className={s.quiet}
        disabled={pending}
        onClick={() => startTransition(() => setPostStatus(postId, hidden ? "visible" : "hidden"))}
      >
        {hidden ? "Unhide" : "Hide"}
      </button>
    </>
  );
}

export function ModAnswerTools({ commentId, hidden }: { commentId: string; hidden: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className={s.quiet}
      disabled={pending}
      onClick={() => startTransition(() => setCommentStatus(commentId, hidden ? "visible" : "hidden"))}
    >
      {hidden ? "Unhide" : "Hide"}
    </button>
  );
}
