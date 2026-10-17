import { CtaButton } from "./CtaButton";
import s from "./FinalCta.module.css";
import shared from "./shared.module.css";

/** The #guide anchor target for every in-page CTA. */
export function FinalCta() {
  return (
    <section className={`${s.final} ${shared.section}`} id="guide">
      <div className={`${shared.wrap} ${s.inner}`}>
        <h2 className={`${shared.h2} ${s.h2}`}>Not sure where your experience fits?</h2>
        <p>
          The guide shows the roles to target, the skills that transfer, and where the jobs are.
        </p>
        {/* TODO: swap this link for the real email-capture form. */}
        <CtaButton href="/guide" cta="final" className={s.btn} />
      </div>
    </section>
  );
}
