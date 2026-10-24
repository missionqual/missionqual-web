import "server-only";
import { addToGroup } from "@/src/lib/mailerlite";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

/**
 * First confirmed session: add the member to the MailerLite "Community members"
 * group (starts the welcome emails, stops guide follow-ups). Runs once per member
 * thanks to profiles.mailerlite_synced. Never throws; never blocks signup.
 */
export async function syncCommunityMember() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    const email = claims?.email as string | undefined;
    if (!claims?.sub || !email) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, mailerlite_synced")
      .eq("id", claims.sub)
      .maybeSingle();
    if (profile?.mailerlite_synced) return;

    const name =
      profile?.display_name ||
      (claims.user_metadata as { display_name?: string } | undefined)?.display_name ||
      "";
    const ok = await addToGroup(email, process.env.MAILERLITE_COMMUNITY_GROUP_ID, name ? { name } : undefined);
    if (!ok) return;

    // Members can't be trusted to set this flag, so the service role writes it.
    const { error } = await createAdminClient()
      .from("profiles")
      .update({ mailerlite_synced: true })
      .eq("id", claims.sub);
    if (error) console.error(`[community] mailerlite_synced update failed: ${error.code ?? "unknown"}`);
    else console.log("[community] MailerLite community sync succeeded");
  } catch (err) {
    console.error(`[community] MailerLite community sync failed: ${err instanceof Error ? err.name : "error"}`);
  }
}
