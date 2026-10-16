import Link from "next/link";
import { Container } from "./Container";
import { CurrentYear } from "./CurrentYear";
import { NAV_LINKS } from "./nav-links";
import { Wordmark } from "./Wordmark";

const FOOTER_LINKS = [
  ...NAV_LINKS,
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

const PROOF = [
  "API inspectors",
  "CWIs",
  "NDT",
  "QA/QC",
  "pipefitters",
  "welders",
  "electricians",
  "turnaround",
  "refinery",
  "LNG professionals",
];

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <Container className="grid gap-10 py-12 sm:grid-cols-3 sm:gap-8">
        <div>
          <Wordmark tone="light" height={28} />
          <p className="mt-3 text-sm text-white/75">
            The mission critical quality network
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-1">
            {FOOTER_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-white/80 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-sm leading-relaxed tracking-wide text-white/70 [font-variant-caps:all-small-caps]">
          For {PROOF.join(" • ")}
        </p>
      </Container>

      <div className="border-t border-white/10">
        <Container className="py-5 text-sm text-white/60">
          © MISSIONQUAL <CurrentYear />
        </Container>
      </div>
    </footer>
  );
}
