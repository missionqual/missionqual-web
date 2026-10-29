import "server-only";
import { cookies } from "next/headers";
import { createClient } from "./server";

// Set by /auth/confirm after a password-recovery link signs the member in, so
// /reset-password only opens for a session that came from that link.
export const RECOVERY_COOKIE = "mq_recovery";
export const RECOVERY_MAX_AGE = 15 * 60;

/** The signed-in member's id if this session came from a recovery link; otherwise null. */
export async function recoveryUserId() {
  const marker = (await cookies()).get(RECOVERY_COOKIE)?.value;
  if (!marker) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  return sub && sub === marker ? sub : null;
}
