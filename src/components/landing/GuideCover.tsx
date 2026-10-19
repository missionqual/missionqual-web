import s from "./GuideCover.module.css";

const QUESTIONS = [
  {
    title: "Which jobs should I target?",
    text: "Role titles, search terms, and how to size up the scope.",
  },
  {
    title: "What do I need to learn?",
    text: "Mechanical, electrical, commissioning, and what the GC expects.",
  },
  {
    title: "How do I sell my experience?",
    text: "Resume examples and interview preparation.",
  },
];

/** "A look inside" preview card (design/update-hero.png). Mobile drops the
 *  descriptions and wordmark so the hero still fits the first viewport. */
export function GuideCover() {
  return (
    <div className={s.coverWrap}>
      <aside className={s.cover} aria-label="A look inside the transition guide">
        <p className={s.kicker}>The Transition Guide</p>
        <p className={s.title}>A look inside</p>
        <ol className={s.list}>
          {QUESTIONS.map((q, i) => (
            <li key={q.title} className={s.item}>
              <span className={s.num} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className={s.body}>
                <span className={s.q}>{q.title}</span>
                <span className={s.text}>{q.text}</span>
              </div>
            </li>
          ))}
        </ol>
        <p className={s.also}>
          <b>Also inside:</b> a practical first-month action plan.
        </p>
        <div className={s.coverLogo} aria-hidden="true">
          MISSION<span>QUAL</span>
        </div>
      </aside>
      {/* Desktop-only teaser; hangs off bottom-right so it never covers the wordmark. */}
      <div className={s.chip} aria-hidden="true">
        <div className={s.chipKicker}>FROM THE TRANSLATION SHEET</div>
        <div className={s.chipLine}>
          Process unit → <b>Data hall</b>
        </div>
      </div>
    </div>
  );
}
