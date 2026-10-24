"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import {
  ANSWER_LIMIT_PER_DAY,
  ASKABLE_TOPICS,
  BODY_MAX,
  QUESTION_LIMIT_PER_DAY,
  TITLE_MAX,
  TITLE_MIN,
  type Topic,
} from "@/src/lib/community/constants";
import { notifyNewAnswer } from "@/src/lib/notify";
import { createClient } from "@/src/lib/supabase/server";

// Every action here runs as the member (session client), so row-level security
// applies. Ids of the acting member always come from the session, never the form.

export type ActionState = { error?: string; ok?: boolean; message?: string };

const DAY_MS = 24 * 60 * 60 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function member() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login?next=/community");
  return { supabase, userId };
}

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function id(value: unknown) {
  return typeof value === "string" && UUID_RE.test(value) ? value : null;
}

const FAILED = "Something went wrong. Try again.";

// ---------- Questions ----------

export async function askQuestion(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, userId } = await member();
  const title = str(formData, "title");
  const body = str(formData, "body");
  const category = str(formData, "category") as Topic;
  const jobId = id(str(formData, "job_id"));

  if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    return { error: `Your question needs ${TITLE_MIN} to ${TITLE_MAX} characters.` };
  }
  if (!ASKABLE_TOPICS.includes(category)) return { error: "Pick a topic." };
  if (body.length > BODY_MAX) return { error: "Details can be up to 10,000 characters." };

  const { count } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", userId)
    .gte("created_at", new Date(Date.now() - DAY_MS).toISOString());
  if ((count ?? 0) >= QUESTION_LIMIT_PER_DAY) {
    return { error: "You've asked 10 questions in the last 24 hours. Give the community a chance to catch up and try again tomorrow." };
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({ author_id: userId, category, title, body: body || null, job_id: jobId })
    .select("id")
    .single();
  if (error || !data) {
    console.error(`[community] ask failed: ${error?.code ?? "unknown"}`);
    return { error: FAILED };
  }

  if (formData.get("follow")) {
    await supabase.from("follows").insert({ user_id: userId, post_id: data.id });
  }
  redirect(`/community/questions/${data.id}`);
}

export async function editQuestion(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, userId } = await member();
  const postId = id(str(formData, "post_id"));
  const title = str(formData, "title");
  const body = str(formData, "body");
  if (!postId) return { error: FAILED };
  if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    return { error: `Your question needs ${TITLE_MIN} to ${TITLE_MAX} characters.` };
  }
  if (body.length > BODY_MAX) return { error: "Details can be up to 10,000 characters." };

  const { error } = await supabase
    .from("posts")
    .update({ title, body: body || null })
    .eq("id", postId)
    .eq("author_id", userId);
  if (error) return { error: FAILED };
  refresh();
  return { ok: true };
}

export async function deleteQuestion(postId: string) {
  const { supabase, userId } = await member();
  if (!id(postId)) return;
  await supabase.from("posts").delete().eq("id", postId).eq("author_id", userId);
  redirect("/community");
}

/** Question author only (RLS limits updates to the author). Pass null to unmark. */
export async function setAcceptedAnswer(postId: string, commentId: string | null) {
  const { supabase, userId } = await member();
  if (!id(postId) || (commentId !== null && !id(commentId))) return;
  await supabase.from("posts").update({ accepted_comment_id: commentId }).eq("id", postId).eq("author_id", userId);
  refresh();
}

// ---------- Answers ----------

export async function postAnswer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, userId } = await member();
  const postId = id(str(formData, "post_id"));
  const body = str(formData, "body");
  if (!postId) return { error: FAILED };
  if (!body) return { error: "Write your answer first." };
  if (body.length > BODY_MAX) return { error: "Answers can be up to 10,000 characters." };

  const { count } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("author_id", userId)
    .gte("created_at", new Date(Date.now() - DAY_MS).toISOString());
  if ((count ?? 0) >= ANSWER_LIMIT_PER_DAY) {
    return { error: "You've posted 50 answers in the last 24 hours. Thanks for helping out. Try again tomorrow." };
  }

  const { error } = await supabase.from("comments").insert({ post_id: postId, author_id: userId, body });
  if (error) {
    console.error(`[community] answer failed: ${error.code ?? "unknown"}`);
    return { error: FAILED };
  }

  if (formData.get("follow")) {
    // follows has no update policy, so this is insert-or-ignore, never an overwrite.
    await supabase.from("follows").upsert({ user_id: userId, post_id: postId }, { ignoreDuplicates: true });
  }
  // Emails go out after the response is sent.
  after(() => notifyNewAnswer({ postId, answererId: userId, answerBody: body }));
  refresh();
  return { ok: true };
}

export async function editAnswer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, userId } = await member();
  const commentId = id(str(formData, "comment_id"));
  const body = str(formData, "body");
  if (!commentId) return { error: FAILED };
  if (!body) return { error: "An answer can't be empty." };
  if (body.length > BODY_MAX) return { error: "Answers can be up to 10,000 characters." };
  const { error } = await supabase.from("comments").update({ body }).eq("id", commentId).eq("author_id", userId);
  if (error) return { error: FAILED };
  refresh();
  return { ok: true };
}

export async function deleteAnswer(commentId: string) {
  const { supabase, userId } = await member();
  if (!id(commentId)) return;
  await supabase.from("comments").delete().eq("id", commentId).eq("author_id", userId);
  refresh();
}

// ---------- Toggles ----------

export async function togglePostHelpful(postId: string) {
  const { supabase, userId } = await member();
  if (!id(postId)) return;
  const { data: post } = await supabase.from("posts").select("author_id").eq("id", postId).maybeSingle();
  if (!post || post.author_id === userId) return; // no votes on your own question
  const { data: existing } = await supabase
    .from("post_votes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) await supabase.from("post_votes").delete().eq("post_id", postId).eq("user_id", userId);
  else await supabase.from("post_votes").insert({ post_id: postId, user_id: userId });
  refresh();
}

export async function toggleAnswerHelpful(commentId: string) {
  const { supabase, userId } = await member();
  if (!id(commentId)) return;
  const { data: comment } = await supabase.from("comments").select("author_id").eq("id", commentId).maybeSingle();
  if (!comment || comment.author_id === userId) return; // no votes on your own answer
  const { data: existing } = await supabase
    .from("comment_votes")
    .select("comment_id")
    .eq("comment_id", commentId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) await supabase.from("comment_votes").delete().eq("comment_id", commentId).eq("user_id", userId);
  else await supabase.from("comment_votes").insert({ comment_id: commentId, user_id: userId });
  refresh();
}

export async function toggleFollow(postId: string) {
  const { supabase, userId } = await member();
  if (!id(postId)) return;
  const { data: existing } = await supabase
    .from("follows")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) await supabase.from("follows").delete().eq("post_id", postId).eq("user_id", userId);
  else await supabase.from("follows").insert({ post_id: postId, user_id: userId });
  refresh();
}

export async function toggleRsvp(sessionId: string) {
  const { supabase, userId } = await member();
  if (!id(sessionId)) return;
  const { data: existing } = await supabase
    .from("live_session_rsvps")
    .select("session_id")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) {
    await supabase.from("live_session_rsvps").delete().eq("session_id", sessionId).eq("user_id", userId);
  } else {
    await supabase.from("live_session_rsvps").insert({ session_id: sessionId, user_id: userId });
  }
  refresh();
}

// ---------- Reports ----------

export async function reportContent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, userId } = await member();
  const postId = id(str(formData, "post_id"));
  const commentId = id(str(formData, "comment_id"));
  const reason = str(formData, "reason");
  if (!postId === !commentId) return { error: FAILED };
  if (reason.length < 3) return { error: "Tell the moderators what's wrong." };
  if (reason.length > 1000) return { error: "Keep it under 1,000 characters." };
  const { error } = await supabase.from("reports").insert({
    reporter_id: userId,
    reason,
    ...(commentId ? { comment_id: commentId } : { post_id: postId }),
  });
  if (error) return { error: FAILED };
  return { ok: true, message: "Thanks. A moderator will take a look." };
}
