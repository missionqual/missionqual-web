import { CtaButton } from "./CtaButton";
import { GuideCover } from "./GuideCover";
import s from "./Hero.module.css";
import shared from "./shared.module.css";

export function Hero() {
  return (
    <section className={s.hero} id="top">
      <div className={`${shared.wrap} ${s.inner}`}>
        <GuideCover />
        <div className={s.copy}>
          <h1>
            From Oil &amp; Gas to Data Center Construction. <em>Without starting over.</em>
          </h1>
          <p className={s.sub}>
            A guide for API inspectors, CWIs, QA/QC and trades: the roles to target, the skills
            that transfer, and where the jobs are.
          </p>
          {/* No subtext under the hero CTA (DESIGN_SPEC rule 2). */}
          <CtaButton href="#guide" cta="hero" arrowWidth={16} className={s.btn} />
        </div>
      </div>
    </section>
  );
}
