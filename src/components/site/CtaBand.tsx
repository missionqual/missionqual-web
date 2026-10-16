import { Button } from "./Button";
import { Container } from "./Container";

export function CtaBand({
  heading = "Not sure where your experience fits?",
  text = "Get the free Transition Guide.",
  ctaLabel = "Get the free guide",
  ctaHref = "/guide",
}: {
  heading?: string;
  text?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <section className="w-full bg-navy py-12 text-white sm:py-16">
      <Container className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">{heading}</h2>
          <p className="mt-2 text-white/80">{text}</p>
        </div>
        <Button href={ctaHref}>{ctaLabel}</Button>
      </Container>
    </section>
  );
}
