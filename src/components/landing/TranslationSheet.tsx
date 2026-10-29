import { GuideTextButton } from "@/src/components/guide/GuideCta";
import { ArrowRight } from "./icons";
import shared from "./shared.module.css";
import s from "./TranslationSheet.module.css";

// Row order is fixed by DESIGN_SPEC rule 5: the 10-week turnaround leads, highlighted.
const ROWS = [
  { refinery: "10-week turnaround", dataCenter: "Multi-year campus build", highlight: true },
  { refinery: "ITPs, hold & witness points", dataCenter: "Witnessed Cx tests — FWT, SAT & L4 scripts" },
  { refinery: "Mechanical completion", dataCenter: "Commissioning levels L1–L5" },
  { refinery: "Process unit", dataCenter: "Data hall" },
];

export function TranslationSheet() {
  return (
    <section className={`${s.translate} ${shared.section}`} id="sheet">
      <div className={`${shared.wrap} ${s.inner}`}>
        <div className={s.copy}>
          <h2 className={`${shared.h2} ${s.h2}`}>
            Your experience, <span className={shared.accent}>translated</span>
          </h2>
          <p className={`${shared.lede} ${s.lede}`}>
            Most of what you do on a refinery job has a direct match on a data center build. Four
            of them here — the full sheet in the guide covers inspection, welding, piping,
            commissioning and turnover.
          </p>
          {/* Opens the guide pop-up (the full sheet is in the guide) instead of scrolling. */}
          <GuideTextButton
            className={`${shared.linkArrow} ${s.sheetLink}`}
            options={{ heading: "Where should we send the full Translation Sheet?", source: "translation-sheet" }}
          >
            Get the full sheet <ArrowRight width={14} height={11} />
          </GuideTextButton>
        </div>
        <div className={s.sheet}>
          <table>
            <thead>
              <tr>
                <th scope="col">On a refinery job</th>
                <th scope="col">On a data center build</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.refinery} className={row.highlight ? s.hl : undefined}>
                  <td>{row.refinery}</td>
                  <td className={s.dc}>{row.dataCenter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
