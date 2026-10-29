import { GuideCta } from "@/src/components/guide/GuideCta";
import s from "./FinalCta.module.css";
import shared from "./shared.module.css";

/** Last guide CTA; StickyCta hides while this #guide section is on screen. */
export function FinalCta() {
  return (
    <section className={`${s.final} ${shared.section}`} id="guide">
      <div className={`${shared.wrap} ${s.inner}`}>
        <h2 className={`${shared.h2} ${s.h2}`}>Not sure where your experience fits?</h2>
        <p>
          The guide shows the roles to target, the skills that transfer, and where the jobs are.
        </p>
        <GuideCta cta="final" className={s.btn} />
      </div>
    </section>
  );
}
