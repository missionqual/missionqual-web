import { ArrowLink } from "./ArrowLink";
import { Container } from "./Container";

export function ClosingBand() {
  return (
    <section className="surface-dark bg-navy text-white">
      <Container className="flex flex-col items-center gap-5 py-12 text-center md:gap-6 md:py-20">
        <h2 className="max-w-[720px] font-heading text-[26px] font-extrabold leading-[1.15] font-stretch-125% md:text-[clamp(26px,3.2vw,38px)] md:leading-[1.12]">
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
