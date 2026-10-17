import { CtaButton } from "./CtaButton";
import s from "./GuideCards.module.css";
import shared from "./shared.module.css";

const CARDS = [
  {
    title: "The roles to target",
    text: "The exact titles employers post for QA/QC, inspection and commissioning — and who posts them.",
  },
  {
    title: "The skills that transfer",
    text: "Inspection, welding, piping, ITPs, hydrotests, turnover — what carries over as-is, and the gaps to close.",
  },
  {
    title: "Where the jobs are",
    text: "Texas, Louisiana and the national build-out — plus a 30-day plan: résumé lines, search terms, who to contact.",
  },
];

export function GuideCards() {
  return (
    <section className={`${s.yearzero} ${shared.section}`}>
      <div className={`${shared.wrap} ${s.inner}`}>
        <h2 className={`${shared.h2} ${s.h2}`}>
          Years of field experience shouldn&rsquo;t become{" "}
          <span className={shared.accent}>year zero</span>
        </h2>
        <p className={shared.lede}>
          Three things you need before you apply — in plain field language. All in the free guide:
        </p>
        <div className={s.cards}>
          {CARDS.map((card, i) => (
            <article key={card.title} className={s.gcard}>
              <div className={s.num}>{String(i + 1).padStart(2, "0")}</div>
              <div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            </article>
          ))}
        </div>
        <CtaButton href="#guide" cta="yearzero" className={s.btn} />
      </div>
    </section>
  );
}
