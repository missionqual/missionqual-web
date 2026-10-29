import { HeaderGuideCta } from "@/src/components/guide/GuideCta";
import { Wordmark } from "@/src/components/landing/Wordmark";
import shared from "@/src/components/landing/shared.module.css";
import { AccountLink, GuideSlot } from "./AccountLink";
import s from "./Header.module.css";
import { MobileMenu } from "./MobileMenu";
import { NAV_LINKS } from "./nav-links";
import { NavLink } from "./NavLink";

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
                  <NavLink href={l.href} className={s.panelLink} activeClassName={s.on}>
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className={s.panelAccount}>
            <AccountLink className={`${s.panelLink} ${s.panelSignin}`} variant="avatar" />
          </div>
          <GuideSlot
            member={
              <HeaderGuideCta className={s.panelBtn} arrow={false} hideOnCommunity>
                Get the guide
              </HeaderGuideCta>
            }
          >
            <HeaderGuideCta className={s.panelBtn} arrow={false}>
              Get the guide
            </HeaderGuideCta>
          </GuideSlot>
        </MobileMenu>

        <nav className={s.navLinks} aria-label="Main">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.href} href={l.href} activeClassName={s.on}>
              {l.label}
            </NavLink>
          ))}
          <AccountLink className={s.signin} variant="avatar" />
          <GuideSlot
            member={
              <HeaderGuideCta size="sm" className={s.headerBtn} hideOnCommunity>
                Get the guide
              </HeaderGuideCta>
            }
          >
            <HeaderGuideCta size="sm" className={s.headerBtn}>
              Get the guide
            </HeaderGuideCta>
          </GuideSlot>
        </nav>
      </div>
    </header>
  );
}
