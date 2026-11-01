import "server-only";
import { excerpt, firstName } from "@/src/lib/community/format";
import { createAdminClient } from "@/src/lib/supabase/admin";

const SITE = "https://missionqual.com";
let warnedNoKey = false;

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

async function send(to: string, subject: string, html: string, text: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.NOTIFY_FROM, to: [to], subject, html, text }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

function renderEmail({ answerer, title, body, url }: { answerer: string; title: string; body: string; url: string }) {
  const account = `${SITE}/account`;
  const footer = "You're getting this because you follow this question. Turn off reply emails in your profile.";
  const html = `<!doctype html><html><body style="margin:0;background:#f4f6fa;font-family:Arial,Helvetica,sans-serif;color:#141c33">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:24px 0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden">
<tr><td style="background:#141c33;padding:18px 28px"><img src="${SITE}/email/wordmark-white.png" alt="MissionQual" height="22" style="display:block;height:22px"></td></tr>
<tr><td style="padding:28px">
<p style="margin:0 0 6px;font-size:14px;color:#4a5572">${escapeHtml(answerer)} answered</p>
<h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:#141c33">${escapeHtml(title)}</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#141c33">${escapeHtml(body)}</p>
<a href="${url}" style="display:inline-block;background:#57bcb3;color:#141c33;font-weight:700;font-size:15px;text-decoration:none;padding:12px 22px;border-radius:8px">See the answer</a>
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #e6eaf2;font-size:12px;line-height:1.5;color:#7e8aa6">
You're getting this because you follow this question. <a href="${account}" style="color:#2e7d74">Turn off reply emails in your profile.</a>
</td></tr></table></td></tr></table></body></html>`;
  const text = `${answerer} answered: ${title}\n\n${body}\n\nSee the answer: ${url}\n\n${footer}\n${account}\n`;
  return { html, text };
}

/**
 * Emails the question's author and followers about a new answer, except the
 * answerer and anyone with email_on_reply off. Call it from after(): it never
 * throws and never logs addresses.
 */
export async function notifyNewAnswer({
  postId,
  answererId,
  answerBody,
  onlyUserId,
}: {
  postId: string;
  answererId: string;
  answerBody: string;
  /** A welcome on an introduction: email just its author, if they follow the thread. */
  onlyUserId?: string;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.NOTIFY_FROM) {
    if (!warnedNoKey) console.log("[notify] notifications skipped: RESEND_API_KEY or NOTIFY_FROM is not set");
    warnedNoKey = true;
    return;
  }
  try {
    const admin = createAdminClient();
    const [{ data: post }, { data: follows }, { data: answerer }] = await Promise.all([
      admin.from("posts").select("title, author_id").eq("id", postId).maybeSingle(),
      admin.from("follows").select("user_id").eq("post_id", postId),
      admin.from("profiles").select("display_name").eq("id", answererId).maybeSingle(),
    ]);
    if (!post) return;

    const ids = new Set<string>((follows ?? []).map((f) => f.user_id));
    if (onlyUserId) {
      // "Email me when someone welcomes me" is the follow ticked when they posted their introduction.
      const follows = ids.has(onlyUserId);
      ids.clear();
      if (follows) ids.add(onlyUserId);
    } else if (post.author_id) ids.add(post.author_id);
    ids.delete(answererId);
    if (!ids.size) return;

    const { data: optedIn } = await admin
      .from("profiles")
      .select("id")
      .in("id", [...ids])
      .eq("email_on_reply", true);

    const name = firstName(answerer?.display_name);
    const subjectFull = `${name} answered: ${post.title}`;
    const subject = subjectFull.length > 80 ? `${subjectFull.slice(0, 79)}…` : subjectFull;
    const { html, text } = renderEmail({
      answerer: name,
      title: post.title,
      body: excerpt(answerBody, 200),
      url: `${SITE}/community/questions/${postId}`,
    });

    const results = await Promise.allSettled(
      (optedIn ?? []).map(async ({ id }) => {
        const { data } = await admin.auth.admin.getUserById(id);
        const email = data.user?.email;
        if (email) await send(email, subject, html, text);
      }),
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed) console.error(`[notify] ${failed} of ${results.length} reply emails failed`);
  } catch (err) {
    console.error(`[notify] reply notifications failed: ${err instanceof Error ? err.name : "error"}`);
  }
}
