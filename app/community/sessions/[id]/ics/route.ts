import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 20261105T010000Z */
function icsDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** RFC 5545 text escaping, folded to 75-octet lines. */
function text(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
}
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = " " + rest.slice(74);
  }
  out.push(rest);
  return out.join("\r\n");
}

/** "Add to calendar" for a live session (members only; the proxy also guards this path). */
export async function GET(request: NextRequest, ctx: RouteContext<"/community/sessions/[id]/ics">) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return new NextResponse("Sign in to download this event.", { status: 401 });
  if (!UUID_RE.test(id)) return new NextResponse("Not found", { status: 404 });

  const { data: session } = await supabase
    .from("live_sessions")
    .select("id, title, description, host_name, starts_at, duration_minutes")
    .eq("id", id)
    .maybeSingle();
  if (!session) return new NextResponse("Not found", { status: 404 });

  const start = new Date(session.starts_at);
  const end = new Date(start.getTime() + session.duration_minutes * 60000);
  const page = new URL("/community/sessions", request.nextUrl.origin).toString();
  const description = [session.description, `Host: ${session.host_name}`, `Join link and details: ${page}`]
    .filter(Boolean)
    .join("\n\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MissionQual//Community//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${session.id}@missionqual.com`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${text(session.title)}`,
    `DESCRIPTION:${text(description)}`,
    "LOCATION:Online",
    `URL:${page}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n");

  return new NextResponse(ics + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="missionqual-session-${session.id.slice(0, 8)}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}
