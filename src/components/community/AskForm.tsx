"use client";

import Link from "next/link";
import { useActionState } from "react";
import { askQuestion } from "@/app/community/actions";
import shared from "@/src/components/landing/shared.module.css";
import { ASKABLE_TOPICS, BODY_MAX, TITLE_MAX, TOPICS, type Topic } from "@/src/lib/community/constants";
import a from "./ask.module.css";
import s from "./community.module.css";

export function AskForm({ defaultTitle = "", defaultTopic, jobId }: { defaultTitle?: string; defaultTopic?: Topic; jobId?: string }) {
  const [state, action, pending] = useActionState(askQuestion, {});
  return (
    <form action={action} className={`${s.card} ${a.form}`}>
      {jobId && <input type="hidden" name="job_id" value={jobId} />}
      <div>
        <label className={s.lab} htmlFor="ask-title">
          Your question
        </label>
        <input
          id="ask-title"
          className={s.inp}
          name="title"
          defaultValue={defaultTitle}
          required
          minLength={10}
          maxLength={TITLE_MAX}
          aria-describedby="ask-title-help"
        />
        <p id="ask-title-help" className={s.help}>
          One line, as you&rsquo;d ask it on site. &ldquo;Do CxA firms care about API 570?&rdquo; gets more answers
          than &ldquo;Need advice on certs.&rdquo;
        </p>
      </div>
      <fieldset className={a.fieldset}>
        <legend className={s.lab}>Topic</legend>
        <div className={a.topics}>
          {ASKABLE_TOPICS.map((t) => (
            <label key={t}>
              <input className={s.chipInput} type="radio" name="category" value={t} defaultChecked={t === defaultTopic} required />
              <span className={s.chip}>{TOPICS[t]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label className={s.lab} htmlFor="ask-body">
          Details
        </label>
        <textarea id="ask-body" className={`${s.inp} ${a.details}`} name="body" maxLength={BODY_MAX} aria-describedby="ask-body-help" />
        <p id="ask-body-help" className={s.help}>
          Your background, what you&rsquo;ve tried, and the state or type of site if it matters.
        </p>
      </div>
      <label className={s.check}>
        <input className={s.box} type="checkbox" name="follow" defaultChecked />
        Email me when someone answers
      </label>
      {state.error && (
        <p className={s.error} role="alert">
          {state.error}
        </p>
      )}
      <div className={a.acts3}>
        <button type="submit" className={shared.btn} disabled={pending}>
          {pending ? "Posting…" : "Post question"}
        </button>
        <Link className={s.btn2} href="/community">
          Cancel
        </Link>
      </div>
    </form>
  );
}
