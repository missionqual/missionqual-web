import s from "./GuideCover.module.css";

export function GuideCover() {
  return (
    <div className={s.coverWrap}>
      <div
        className={s.cover}
        role="img"
        aria-label="The Transition Guide: From Oil and Gas to Data Center Construction"
      >
        <div className={s.kicker}>The Transition Guide</div>
        <div className={s.title}>From Oil &amp; Gas to Data Center Construction</div>
        <div className={s.bars} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className={s.coverLogo}>
          MISSION<span>QUAL</span>
        </div>
      </div>
      {/* Desktop-only teaser; hangs off bottom-right so it never covers the wordmark. */}
      <div className={s.chip} aria-hidden="true">
        <div className={s.chipKicker}>FROM THE TRANSLATION SHEET</div>
        <div className={s.chipLine}>
          Process unit <b>→ Data hall</b>
        </div>
      </div>
    </div>
  );
}
