import Link from "next/link";
import { INTERVIEW_QUESTIONS, type InterviewQuestion, type InterviewRole } from "@/content/resources/interview-questions";
import { MembersOnly } from "./MembersOnly";
import { RoleTabs } from "./RoleTabs";
import t from "./tools.module.css";

/** Visitors see this many questions per role in full. */
const OPEN = 2;

/** Tab labels, in order. */
const ROLES: [InterviewRole, string][] = [
  ["qaqc-inspector", "QA/QC inspector"],
  ["qaqc-manager", "QA/QC manager"],
  ["commissioning", "Commissioning"],
  ["turnover", "Turnover and document control"],
];

/**
 * <InterviewQuestions />: role tabs over the questions. Visitors get the first
 * two in full, the rest as titles, then the article's only join box; members
 * get every answer and a link to add a question.
 */
export function InterviewQuestions() {
  return (
    <RoleTabs
      roles={ROLES.map(([key, label]) => ({ key, label, panel: <RolePanel role={key} /> }))}
    />
  );
}

function RolePanel({ role }: { role: InterviewRole }) {
  const questions = INTERVIEW_QUESTIONS.filter((q) => q.role === role);
  const open = questions.slice(0, OPEN);
  const rest = questions.slice(OPEN);

  return (
    <>
      <ol className={t.questions}>
        {open.map((q, i) => (
          <FullQuestion key={q.question} q={q} n={i + 1} />
        ))}
      </ol>
      {rest.length > 0 && (
        <MembersOnly
          heading="Join the community to see how to answer the rest, and add the questions you were asked."
          text={null}
          path={`/resources/interview-questions?role=${role}`}
          teaser={
            <ol className={t.questions} start={OPEN + 1}>
              {rest.map((q, i) => (
                <li key={q.question} className={`${t.q} ${t.qShort}`}>
                  <div className={t.qHead}>
                    <span className={t.qNum}>{OPEN + i + 1}</span>
                    <h3>{q.question}</h3>
                  </div>
                </li>
              ))}
            </ol>
          }
        >
          <ol className={t.questions} start={OPEN + 1}>
            {rest.map((q, i) => (
              <FullQuestion key={q.question} q={q} n={OPEN + i + 1} />
            ))}
          </ol>
          <Link href={`/community/ask?title=${encodeURIComponent("Interview question: ")}`} className={t.addQ}>
            Add a question you were asked
          </Link>
        </MembersOnly>
      )}
    </>
  );
}

function FullQuestion({ q, n }: { q: InterviewQuestion; n: number }) {
  return (
    <li className={t.q}>
      <div className={t.qHead}>
        <span className={t.qNum}>{n}</span>
        <div>
          <h3>{q.question}</h3>
          {q.asked && <span className={t.asked}>Asked in a real interview</span>}
        </div>
      </div>
      <dl className={t.parts}>
        <div>
          <dt>What they&apos;re checking</dt>
          <dd>{q.checking}</dd>
        </div>
        <div>
          <dt>How to answer it</dt>
          <dd>{q.answer}</dd>
        </div>
        <div className={t.mistake}>
          <dt>The common mistake</dt>
          <dd>{q.mistake}</dd>
        </div>
      </dl>
    </li>
  );
}
