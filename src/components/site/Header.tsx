import Link from "next/link";
import { AccountLink } from "./AccountLink";
import { Button } from "./Button";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NAV_LINKS } from "./nav-links";

const desktopLink =
  "block whitespace-nowrap py-2.5 text-[15px] font-medium text-mist transition-colors hover:text-white";
const mobileLink = "block py-3 text-base font-medium text-mist hover:text-white";

export function Header() {
  return (
    <header className="surface-dark relative border-b border-white/14 bg-navy">
      <Container className="flex items-center justify-between gap-6 py-5">
        <Logo height={24} />

        {/* Below xl the full row doesn't fit, so phones and tablets get the menu. */}
        <div className="hidden items-center xl:flex">
          <nav aria-label="Main">
            <ul className="flex items-center gap-8">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={desktopLink}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <span aria-hidden="true" className="mx-8 h-5 w-px bg-white/20" />
          <AccountLink className={desktopLink} />
          <Button href="/guide" className="ml-9 whitespace-nowrap">
            Get the free guide
          </Button>
        </div>

        <MobileMenu>
          <nav aria-label="Main mobile">
            <ul className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={mobileLink}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-2 border-t border-white/14 pt-2">
            <AccountLink className={mobileLink} />
          </div>
          <Button href="/guide" className="mt-4 w-full text-center">
            Get the free guide
          </Button>
        </MobileMenu>
      </Container>
    </header>
  );
}
