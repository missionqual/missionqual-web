import Link from "next/link";
import { CtaButton } from "@/src/components/landing/CtaButton";
import shared from "@/src/components/landing/shared.module.css";
import { HOUSE_RULES, SIGNIN_HREF, SIGNUP_HREF } from "@/src/lib/community/constants";
import c from "./community.module.css";
import { CheckIcon } from "./icons";
import s from "./join.module.css";

const FEATURES = [
  {
    title: "Questions and answers",
    text: "Certs, offers, contractors, a test you've never seen. Members on data center sites answer, and the most helpful answer rises to the top.",
  },
  {
    title: "Jobs This Week",
    text: "Hand-picked QA/QC, inspection, commissioning and trade openings, each with a note on why an oil and gas background fits. Visitors see three. Members see them all.",
  },
  {
    title: "Live sessions",
    text: "Q&As with recruiters who staff data center jobs, and “how I got hired” walk-throughs from members who just made the move.",
  },
  {
    title: "Members",
    text: "Find people with your background by role, certs and state. See who's already on a data center site and who's still making the move.",
  },
];

const STEPS = [
  { title: "Create your account", text: "Your email and a password. That's it." },
  { title: "Fill in your profile", text: "Your role, certs and where you're based, so the right people see your questions." },
  {
    title: "Ask your first question",
    text: "Or answer one. Most people start with “here's my background, where do I fit?”",
  },
];

/** Invented people, so: an "Example" label, role-only lines, grey avatars, no times or counts. */
function ExamplePreview() {
  const q = (tag: string, title: string, ex: string, role: string, extra = "") => (
    <div className={`${c.q} ${s.q} ${extra}`}>
      <div className={c.top}>
        <span className={c.tag}>{tag}</span>
        <span className={c.ok}>
          <CheckIcon /> Answered
        </span>
      </div>
      <h3>{title}</h3>
      <p className={`${c.ex} ${s.ex}`}>{ex}</p>
      <div className={c.bot}>
        <div className={c.who}>
          <span className={s.ghost} />
          <span className={c.r}>{role}</span>
        </div>
      </div>
    </div>
  );
  return (
    <div className={s.prev} aria-hidden="true">
      <p className={s.example}>Example</p>
      {q(
        "Commissioning",
        "Do CxA firms care about API 570, or should I get NETA first?",
        "Ten years of API 570 on refinery units, CWI too. Applying to commissioning agent roles and getting nowhere. Is NETA worth paying for before my first data center job?",
        "API 570 inspector · making the move",
      )}
      {q(
        "Pay & offers",
        "Staffing firm offered $58/hr plus $150/day per diem for QA/QC in Abilene. Fair?",
        "Six tens, 12-month assignment, they want an answer by Friday. I make more base on turnarounds, but this is steady. What should I push back on?",
        "QA/QC manager · making the move",
        s.q2,
      )}
      <div className={s.ans}>
        <span className={c.ok}>
          <CheckIcon /> Accepted answer
        </span>
        <p>
          &ldquo;They&rsquo;ll take you on the mechanical side without NETA. That&rsquo;s how I got in. Lead
          your résumé with pre-commissioning, not the API numbers.&rdquo;
        </p>
        <div className={`${c.who} ${s.ansWho}`}>
          <span className={s.ghost} />
          <span className={c.r}>Commissioning agent · was API 510 inspector</span>
        </div>
      </div>
    </div>
  );
}

/** /community for signed-out visitors (design/community/join.html). */
export function JoinPage() {
  return (
    <>
      <section className={s.jh}>
        <div className={`${shared.wrap} ${s.jhInner}`}>
          <div className={s.copy}>
            <p className={`${c.kicker} ${s.kickerDark}`}>The MissionQual community</p>
            <h1>
              Ask the people <em>already on site.</em>
            </h1>
            <p className={s.sub2}>
              A private community for oil and gas inspectors, QA/QC and trades moving into data center
              construction. Straight answers from people who made the move, and from people making it with you.
            </p>
            <div className={s.ctas}>
              <CtaButton href={SIGNUP_HREF} arrowWidth={16} className={s.btn}>
                Join the community
              </CtaButton>
              <span className={s.si}>
                Already a member? <Link href={SIGNIN_HREF}>Sign in</Link>
              </span>
            </div>
          </div>
          <ExamplePreview />
        </div>
      </section>

      <section className={`${s.section} ${s.white}`}>
        <div className={shared.wrap}>
          <p className={c.kicker}>What&rsquo;s inside</p>
          <h2 className={`${s.h2} ${s.featH2}`}>
            Everything you&rsquo;d ask a friend <em>on site.</em>
          </h2>
          <div className={s.feat}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className={s.f}>
                <span className={s.n}>{String(i + 1).padStart(2, "0")}</span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className={shared.wrap}>
          <p className={c.kicker}>How it works</p>
          <h2 className={s.h2}>
            In and asking in <em>five minutes.</em>
          </h2>
          <div className={s.steps}>
            {STEPS.map((step, i) => (
              <div key={step.title} className={s.step}>
                <span className={s.n}>{String(i + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${s.section} ${s.white}`}>
        <div className={`${shared.wrap} ${s.rules}`}>
          <div>
            <p className={c.kicker}>House rules</p>
            <h2 className={s.h2}>
              Run like a good <em>site.</em>
            </h2>
            <p className={s.lede}>Four rules keep it useful. Break them and you&rsquo;re off the job.</p>
          </div>
          <ul className={s.rl}>
            {HOUSE_RULES.map((r) => (
              <li key={r.title}>
                <span className={s.ic}>
                  <CheckIcon />
                </span>
                <div>
                  <b>{r.title}</b>
                  <span>{r.text}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={s.fin}>
        <div className={`${shared.wrap} ${s.finInner}`}>
          <h2>Bring your first question.</h2>
          <p>Someone on a data center site has already been where you are.</p>
          <CtaButton href={SIGNUP_HREF} arrowWidth={16} className={s.btn}>
            Join the community
          </CtaButton>
        </div>
      </section>
    </>
  );
}
