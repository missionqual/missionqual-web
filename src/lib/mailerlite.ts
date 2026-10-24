import "server-only";

/**
 * Adds (or updates) a subscriber and puts them in a MailerLite group.
 * Never throws and never logs the address or the key; returns false on any failure.
 */
export async function addToGroup(
  email: string,
  groupId: string | undefined,
  fields?: Record<string, string>,
) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey || !groupId) {
    console.error("[mailerlite] sync skipped: MAILERLITE_API_KEY or the group id is not set");
    return false;
  }
  try {
    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, groups: [groupId], ...(fields && { fields }) }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`[mailerlite] sync failed: HTTP ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[mailerlite] sync failed: ${err instanceof Error ? err.name : "error"}`);
    return false;
  }
}
