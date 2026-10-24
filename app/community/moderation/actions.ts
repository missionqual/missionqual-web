"use server";

import { refresh } from "next/cache";
import { getViewer, isModerator } from "@/src/lib/community/viewer";
import { createAdminClient } from "@/src/lib/supabase/admin";

// Moderator-only writes (pinned, status, report resolution) are revoked for
// members, so these use the service role, but only after isModerator() passes.

async function moderator() {
  if (!(await isModerator())) throw new Error("Not a moderator");
  const viewer = await getViewer();
  return { admin: createAdminClient(), moderatorId: viewer!.id };
}

const VISIBILITY = ["visible", "hidden"] as const;

export async function setPostStatus(postId: string, status: (typeof VISIBILITY)[number]) {
  const { admin } = await moderator();
  if (!VISIBILITY.includes(status)) return;
  await admin.from("posts").update({ status }).eq("id", postId);
  refresh();
}

export async function setCommentStatus(commentId: string, status: (typeof VISIBILITY)[number]) {
  const { admin } = await moderator();
  if (!VISIBILITY.includes(status)) return;
  await admin.from("comments").update({ status }).eq("id", commentId);
  refresh();
}

export async function setPinned(postId: string, pinned: boolean) {
  const { admin } = await moderator();
  await admin.from("posts").update({ pinned }).eq("id", postId);
  refresh();
}

export async function resolveReport(reportId: string) {
  const { admin, moderatorId } = await moderator();
  await admin
    .from("reports")
    .update({ resolved_at: new Date().toISOString(), resolved_by: moderatorId })
    .eq("id", reportId)
    .is("resolved_at", null);
  refresh();
}
