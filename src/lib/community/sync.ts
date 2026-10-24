import "server-only";
import { addToGroup } from "@/src/lib/mailerlite";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

export type SyncTarget = { userId: string; email: string; name: string };

/**
 * The signed-in member, if they still need the MailerLite community sync
 * (profiles.mailerlite_synced is false). Reads the session, so call it during
 * the request and pass the result to syncCommunityMember() inside after().
 */
export async function pendingCommunitySync(): Promise<SyncTarget | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    const email = claims?.email as string | undefined;
    if (!claims?.sub || !email) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, mailerlite_synced")
      .eq("id", claims.sub)
      .maybeSingle();
    if (!profile || profile.mailerlite_synced) return null;

    const metaName = (claims.user_metadata as { display_name?: string } | undefined)?.display_name;
    return { userId: claims.sub, email, name: profile.display_name || metaName || "" };
  } catch {
    return null;
  }
}

/**
 * Adds the member to the MailerLite "Community members" group (starts the
 * welcome emails, stops guide follow-ups) and marks the profile synced. Takes
 * plain data so it can run inside after(). Never throws; never logs the address.
 */
export async function syncCommunityMember({ userId, email, name }: SyncTarget) {
  try {
    const ok = await addToGroup(email, process.env.MAILERLITE_COMMUNITY_GROUP_ID, name ? { name } : undefined);
    if (!ok) return;

    // Members can't be trusted to set this flag, so the service role writes it.
    const { error } = await createAdminClient()
      .from("profiles")
      .update({ mailerlite_synced: true })
      .eq("id", userId);
    if (error) console.error(`[community] mailerlite_synced update failed: ${error.code ?? "unknown"}`);
    else console.log("[community] MailerLite community sync succeeded");
  } catch (err) {
    console.error(`[community] MailerLite community sync failed: ${err instanceof Error ? err.name : "error"}`);
  }
}
