import { ArrowLink } from "./ArrowLink";
import { Container } from "./Container";

export function ClosingBand() {
  return (
    <section className="surface-dark bg-navy text-white">
      <Container className="flex flex-col items-center gap-6 py-20 text-center">
        <h2 className="max-w-[720px] font-heading text-[clamp(26px,3.2vw,38px)] font-extrabold leading-[1.12] font-stretch-125%">
          Not sure where your experience fits?
        </h2>
        <p className="max-w-[560px] text-lg text-mist">
          The guide shows the roles to target, the skills that transfer, and where the jobs are.
          Free, in one email.
        </p>
        <ArrowLink href="/guide" tone="dark">
          Get the free Transition Guide
        </ArrowLink>
      </Container>
    </section>
  );
}
