import { Suspense } from "react";
import { CommunityNav } from "@/src/components/community/CommunityNav";
import { JoinPage } from "@/src/components/community/JoinPage";
import { MemberHome } from "@/src/components/community/MemberHome";
import { getViewer } from "@/src/lib/community/viewer";
import { pageMetadata } from "@/src/lib/seo";

export const metadata = pageMetadata({
  title: "The MissionQual Community",
  description:
    "A private community for oil and gas inspectors, QA/QC and trades moving into data center construction. Straight answers from people who made the move.",
  path: "/community",
});

/** Join page when signed out, member home when signed in. The session is read at request time. */
async function Community({ searchParams }: { searchParams: PageProps<"/community">["searchParams"] }) {
  const viewer = await getViewer();
  if (!viewer) return <JoinPage />;
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return (
    <>
      <CommunityNav current="questions" />
      <MemberHome viewer={viewer} search={{ topic: one(sp.topic), sort: one(sp.sort), page: one(sp.page) }} />
    </>
  );
}

export default function CommunityPage(props: PageProps<"/community">) {
  return (
    <Suspense fallback={<div style={{ minHeight: "70vh" }} />}>
      <Community searchParams={props.searchParams} />
    </Suspense>
  );
}
