import Link from "next/link";
import { CtaButton } from "@/src/components/landing/CtaButton";
import { Wordmark } from "@/src/components/landing/Wordmark";
import shared from "@/src/components/landing/shared.module.css";
import { AccountLink } from "./AccountLink";
import s from "./Header.module.css";
import { MobileMenu } from "./MobileMenu";
import { NAV_LINKS } from "./nav-links";

// "/#guide" so the button also works from other pages.
const GUIDE_HREF = "/#guide";

export function Header() {
  return (
    <header className={s.header}>
      <div className={`${shared.wrap} ${s.inner}`}>
        <Wordmark />

        <MobileMenu wrapperClassName={s.mobileOnly} buttonClassName={s.toggle} panelClassName={s.panel}>
          <nav aria-label="Main mobile">
            <ul>
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={s.panelLink}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <AccountLink className={`${s.panelLink} ${s.panelSignin}`} />
          <CtaButton href={GUIDE_HREF} className={s.panelBtn} arrow={false}>
            Get the guide
          </CtaButton>
        </MobileMenu>

        <nav className={s.navLinks} aria-label="Main">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          <AccountLink className={s.signin} />
          <CtaButton href={GUIDE_HREF} size="sm" className={s.headerBtn}>
            Get the guide
          </CtaButton>
        </nav>
      </div>
    </header>
  );
}
