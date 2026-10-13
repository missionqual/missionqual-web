import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

async function logout(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // 303 so a POST is followed by a GET to /login.
  return NextResponse.redirect(new URL("/login", request.nextUrl.origin), 303);
}

// Prefer POST (a form button). GET is supported for convenience, so link to it
// with a plain <a>, never <Link>, which could prefetch it and sign the user out.
export const POST = logout;
export const GET = logout;
