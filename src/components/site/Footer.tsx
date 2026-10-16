import { cacheLife } from "next/cache";
import Link from "next/link";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { AUDIENCE } from "./nav-links";

const FOOTER_LINKS = [
  { href: "/guide", label: "Transition Guide" },
  { href: "/jobs", label: "Jobs" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

// Cached so the clock read is allowed in the prerendered shell.
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function Footer() {
  return (
    <footer className="surface-dark bg-navy-dark text-fog">
      <Container className="flex flex-col gap-10 pb-8 pt-14">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-8">
          <div className="flex flex-col gap-3.5">
            <Logo height={22} className="self-start" />
            <p className="max-w-[280px] text-sm">
              Helping industrial QA/QC and trades move into data center construction.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-col gap-1">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block py-1.5 text-[15px] text-mist hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className="font-mono text-xs leading-[1.8] tracking-[0.08em]">{AUDIENCE}</p>
        </div>

        <div className="flex flex-wrap justify-between gap-3 border-t border-steel pt-6 text-[13px]">
          <span>
            © <CurrentYear /> MISSIONQUAL
          </span>
          <span className="flex gap-5">
            <Link href="/privacy" className="underline hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="underline hover:text-white">
              Terms
            </Link>
          </span>
        </div>
      </Container>
    </footer>
  );
}
