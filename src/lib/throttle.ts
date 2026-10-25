import "server-only";

// In-memory, per server instance: a first line against repeat clicks. Supabase
// also limits auth emails per address, which covers requests to other instances.
const last = new Map<string, number>();

/**
 * True if `key` was already used within `ms`; otherwise records it and returns
 * false. Keys are kept only as long as their window.
 */
export function tooSoon(key: string, ms = 60_000) {
  const now = Date.now();
  for (const [k, at] of last) if (now - at >= ms) last.delete(k);
  if (last.has(key)) return true;
  last.set(key, now);
  return false;
}
