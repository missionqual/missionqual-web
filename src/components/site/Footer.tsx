import { cacheLife } from "next/cache";
import Link from "next/link";
import { Wordmark } from "@/src/components/landing/Wordmark";
import shared from "@/src/components/landing/shared.module.css";
import { AccountLink } from "./AccountLink";
import s from "./Footer.module.css";

// A sitemap, so it may list Transition Guide and Sign in (DESIGN_SPEC rule 7).
const EXPLORE = [
  { href: "/guide", label: "Transition Guide" },
  { href: "/jobs", label: "Jobs" },
  { href: "/resources", label: "Resources" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
];

const LEGAL = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

// Cached so the clock read is allowed in the prerendered shell.
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={`${shared.wrap} ${s.inner}`}>
        <div className={s.top}>
          <div>
            <Wordmark className={s.logo} />
            <p className={s.mission}>
              Helping industrial QA/QC and trades move into data center construction.
            </p>
          </div>
          <div className={s.cols}>
            <nav className={s.col} aria-labelledby="footer-explore">
              <div className={s.label} id="footer-explore">
                EXPLORE
              </div>
              {EXPLORE.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
              <AccountLink className="" />
            </nav>
            <nav className={s.col} aria-labelledby="footer-legal">
              <div className={s.label} id="footer-legal">
                LEGAL
              </div>
              {LEGAL.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className={s.bottom}>
          <span>
            © <CurrentYear /> MISSIONQUAL
          </span>
        </div>
      </div>
    </footer>
  );
}
