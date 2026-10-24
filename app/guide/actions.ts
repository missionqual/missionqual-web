"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { addToGroup } from "@/src/lib/mailerlite";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { GUIDE_COOKIE, isValidEmail } from "@/src/lib/guide";

export type GuideSubmitResult = { error: "invalid" | "server" };

const ONE_YEAR = 60 * 60 * 24 * 365;

async function grantGuideAccess() {
  (await cookies()).set(GUIDE_COOKIE, "1", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
  });
}

export async function submitGuideEmail(formData: FormData): Promise<GuideSubmitResult> {
  // Honeypot: bots fill the hidden "company" field. Save nothing, act normal.
  if (String(formData.get("company") ?? "").trim()) {
    await grantGuideAccess();
    redirect("/guide/thank-you");
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!isValidEmail(email)) return { error: "invalid" };

  const rawReferrer = String(formData.get("referrer") ?? "");
  const referrer = rawReferrer.startsWith("/") ? rawReferrer.slice(0, 512) : null;
  const userAgent = (await headers()).get("user-agent")?.slice(0, 512) ?? null;

  const supabase = createAdminClient();
  // Upsert so a repeat signup refreshes the row instead of failing on the unique email.
  const { error } = await supabase.from("guide_leads").upsert(
    {
      email,
      source: "modal",
      referrer,
      user_agent: userAgent,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  );
  if (error) {
    console.error(`[guide] guide_leads upsert failed: ${error.code ?? "unknown"}`);
    return { error: "server" };
  }

  // A MailerLite failure never blocks the download; the row stays unsynced.
  if (await addToGroup(email, process.env.MAILERLITE_GROUP_ID)) {
    const { error: syncError } = await supabase
      .from("guide_leads")
      .update({ mailerlite_synced: true })
      .eq("email", email);
    if (syncError) console.error(`[guide] mailerlite_synced update failed: ${syncError.code ?? "unknown"}`);
  }

  await grantGuideAccess();
  redirect("/guide/thank-you");
}
