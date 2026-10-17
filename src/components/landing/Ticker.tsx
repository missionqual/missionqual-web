import s from "./Ticker.module.css";

const AUDIENCE =
  "FOR API INSPECTORS · CWIs · NDT · QA/QC · PIPEFITTERS · WELDERS · ELECTRICIANS · TURNAROUND · REFINERY · LNG PROFESSIONALS ·";

export function Ticker() {
  return (
    <div className={s.ticker} aria-hidden="true">
      {/* Two copies so the -50% loop is seamless. */}
      <div className={s.track}>
        <span>{AUDIENCE}</span>
        <span>{AUDIENCE}</span>
      </div>
    </div>
  );
}
