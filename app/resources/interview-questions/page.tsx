import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { INTERVIEW_QUESTIONS, type InterviewQuestion, type InterviewRole } from "@/content/resources/interview-questions";
import { ArrowRight } from "@/src/components/landing/icons";
import shared from "@/src/components/landing/shared.module.css";
import { CommunityBox } from "@/src/components/resources/CommunityBox";
import { MembersOnly } from "@/src/components/resources/MembersOnly";
import s from "@/src/components/resources/resources.module.css";
import { ToolHero } from "@/src/components/resources/ToolHero";
import t from "@/src/components/resources/tools.module.css";
import { pageMetadata } from "@/src/lib/seo";

const PATH = "/resources/interview-questions";
const TITLE = "Interview questions you're likely to get";
const DESCRIPTION =
  "Questions you're likely to get for QA/QC, commissioning and turnover roles, and how to answer them with your oil and gas experience.";
/** Everyone sees this many questions per role in full; members see the rest. */
const OPEN = 3;

/** Tab labels, in order. */
const ROLES: [InterviewRole, string][] = [
  ["qaqc-inspector", "QA/QC inspector"],
  ["qaqc-manager", "QA/QC manager"],
  ["commissioning", "Commissioning"],
  ["turnover", "Turnover and document control"],
];

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function InterviewQuestionsPage(props: PageProps<"/resources/interview-questions">) {
  return (
    <>
      <ToolHero crumb="Interview questions" title={TITLE}>
        {DESCRIPTION}
      </ToolHero>
      <div className={`${shared.wrap} ${t.page}`}>
        {/* ?role= is request data, so the tabs and questions stream in behind Suspense. */}
        <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
          <Questions searchParams={props.searchParams} />
        </Suspense>
      </div>
      <CommunityBox
        title="Got asked something that isn't here?"
        text="Post it in the community, and members who've sat that interview will tell you how they answered."
        back={PATH}
      />
    </>
  );
}

async function Questions({ searchParams }: { searchParams: PageProps<"/resources/interview-questions">["searchParams"] }) {
  const sp = await searchParams;
  const role = ROLES.find(([key]) => key === sp.role)?.[0] ?? ROLES[0][0];
  const questions = INTERVIEW_QUESTIONS.filter((q) => q.role === role);
  const open = questions.slice(0, OPEN);
  const rest = questions.slice(OPEN);
  const path = `${PATH}?role=${role}`;

  return (
    <>
      <nav aria-label="Roles">
        <ul className={t.chips}>
          {ROLES.map(([key, label]) => (
            <li key={key}>
              <Link
                href={`${PATH}?role=${key}`}
                scroll={false}
                className={t.chip}
                aria-current={key === role ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <ol className={t.questions}>
        {open.map((q, i) => (
          <FullQuestion key={q.question} q={q} n={i + 1} />
        ))}
      </ol>

      {rest.length > 0 && (
        <MembersOnly
          heading="Join the community to see how to answer the rest, and add questions you were asked."
          text={null}
          path={path}
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
          <Link
            href={`/community/ask?title=${encodeURIComponent("Interview question: ")}`}
            className={`${s.btnO} ${t.addQ}`}
          >
            Add a question you were asked <ArrowRight width={14} height={11} />
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
