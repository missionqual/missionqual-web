import { Button } from "@/src/components/site/Button";
import { Container } from "@/src/components/site/Container";
import { pageMetadata } from "@/src/lib/seo";

export const metadata = pageMetadata({
  title: "Community",
  description: "The MISSIONQUAL Community is opening soon for Transition Guide readers.",
  path: "/community",
});

export default function CommunityPage() {
  return (
    <section className="bg-paper">
      <Container className="flex flex-col items-start gap-6 py-24">
        <h1 className="font-heading text-[clamp(28px,3.4vw,42px)] font-extrabold leading-[1.1] text-navy font-stretch-125%">
          The MISSIONQUAL Community
        </h1>
        <p className="text-[19px] leading-[1.6] text-body">
          Opening soon for Transition Guide readers.
        </p>
        <Button href="/guide" size="lg">
          Get the free Transition Guide
        </Button>
      </Container>
    </section>
  );
}
