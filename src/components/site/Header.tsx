import Link from "next/link";
import { Suspense } from "react";
import { AuthLinks } from "./AuthLinks";
import { Container } from "./Container";
import { MobileMenu } from "./MobileMenu";
import { NAV_LINKS } from "./nav-links";
import { Wordmark } from "./Wordmark";

export function Header() {
  return (
    <header className="relative bg-navy text-white">
      <Container className="flex h-16 items-center justify-between gap-6 lg:h-20">
        <Wordmark tone="light" height={32} />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="font-medium text-white/90 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden lg:block">
          <Suspense fallback={<div className="h-11 w-56" aria-hidden="true" />}>
            <AuthLinks layout="row" />
          </Suspense>
        </div>

        <MobileMenu>
          <nav aria-label="Main mobile">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block py-2 text-lg font-medium text-white/90 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-4 border-t border-white/10 pt-4">
            <Suspense fallback={null}>
              <AuthLinks layout="stack" />
            </Suspense>
          </div>
        </MobileMenu>
      </Container>
    </header>
  );
}
