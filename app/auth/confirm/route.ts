import { type EmailOtpType } from "@supabase/supabase-js";
import { after, NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/src/lib/community/format";
import { pendingCommunitySync, syncCommunityMember } from "@/src/lib/community/sync";
import { RECOVERY_COOKIE, RECOVERY_MAX_AGE } from "@/src/lib/supabase/recovery";
import { createClient } from "@/src/lib/supabase/server";

// Landing route for links in Supabase auth emails (signup confirmation and
// password reset). Handles both the PKCE `code` flow (default email templates)
// and the `token_hash` flow (custom templates).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // Only allow same-site relative redirects.
  const next = safeNext(searchParams.get("next"), "/account");
  // The `code` flow doesn't say which email it came from, so the reset
  // destination marks a recovery link too.
  const recovery = type === "recovery" || next.startsWith("/reset-password");

  const supabase = await createClient();
  let error: unknown = new Error("Missing auth parameters");
  let userId: string | undefined;

  if (code) {
    const res = await supabase.auth.exchangeCodeForSession(code);
    ({ error } = res);
    userId = res.data.user?.id;
  } else if (tokenHash && type) {
    const res = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ({ error } = res);
    userId = res.data.user?.id;
  }

  if (!error) {
    // First confirmed session: join the MailerLite community list after the
    // redirect is sent (no-op once synced).
    const target = await pendingCommunitySync();
    if (target) after(() => syncCommunityMember(target));
    const res = NextResponse.redirect(new URL(next, origin));
    if (recovery && userId) {
      res.cookies.set(RECOVERY_COOKIE, userId, {
        httpOnly: true,
        secure: request.nextUrl.protocol === "https:",
        sameSite: "lax",
        path: "/",
        maxAge: RECOVERY_MAX_AGE,
      });
    }
    return res;
  }

  const url = new URL(recovery ? "/forgot-password" : "/login", origin);
  url.searchParams.set("error", "link_invalid");
  return NextResponse.redirect(url);
}
