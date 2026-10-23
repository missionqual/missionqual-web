import { GuideCta } from "@/src/components/guide/GuideCta";
import { Container } from "@/src/components/site/Container";
import { pageMetadata } from "@/src/lib/seo";

export const metadata = pageMetadata({
  title: "Community",
  description:
    "The MissionQual Community is opening soon for Transition Guide readers: oil and gas professionals moving into data center construction.",
  path: "/community",
});

export default function CommunityPage() {
  return (
    <section className="bg-paper">
      <Container className="flex flex-col items-start gap-6 py-24">
        <h1 className="font-heading text-[clamp(28px,3.4vw,42px)] font-extrabold leading-[1.1] text-navy font-stretch-125%">
          The MissionQual Community
        </h1>
        <p className="text-[19px] leading-[1.6] text-body">
          Opening soon for Transition Guide readers.
        </p>
        <GuideCta />
      </Container>
    </section>
  );
}
