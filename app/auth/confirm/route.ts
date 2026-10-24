import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/src/lib/community/format";
import { syncCommunityMember } from "@/src/lib/community/sync";
import { createClient } from "@/src/lib/supabase/server";

// Landing route for links in Supabase auth emails (signup confirmation and
// magic link). Handles both the PKCE `code` flow (default email templates)
// and the `token_hash` flow (custom templates).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // Only allow same-site relative redirects.
  const next = safeNext(searchParams.get("next"), "/account");

  const supabase = await createClient();
  let error: unknown = new Error("Missing auth parameters");

  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  }

  if (!error) {
    // First confirmed session: join the MailerLite community list (no-op once synced).
    await syncCommunityMember();
    return NextResponse.redirect(new URL(next, origin));
  }

  const url = new URL("/login", origin);
  url.searchParams.set("error", "link_invalid");
  return NextResponse.redirect(url);
}
