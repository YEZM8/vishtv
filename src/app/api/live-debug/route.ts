import { NextResponse } from "next/server";
import { getLiveStreamStatus } from "@/lib/youtube";

// TEMPORARY diagnostic — surfaces why live detection fails on Vercel. Remove after debugging.
export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.YOUTUBE_API_KEY;
  const channel = process.env.YOUTUBE_CHANNEL_ID || "UCeqWSlqqNO2F5zPWq-pQEcA";

  const out: Record<string, unknown> = {
    vercelEnv: process.env.VERCEL_ENV || null,
    keyPresent: !!key,
    keyLen: key ? key.length : 0,
    keyPrefix: key ? key.slice(0, 6) : null,
    channel,
  };

  // Raw channels call — reveals the HTTP status + error body YouTube returns to Vercel.
  if (key) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channel}&key=${key}`,
        { cache: "no-store" }
      );
      out.channelsStatus = res.status;
      const body = await res.text();
      out.channelsBody = body.slice(0, 400);
    } catch (e) {
      out.channelsError = e instanceof Error ? e.message : String(e);
    }
  }

  try {
    out.liveStatus = await getLiveStreamStatus();
  } catch (e) {
    out.liveStatusError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(out);
}
