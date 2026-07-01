import { NextResponse } from "next/server";
import { getVideosStatistics } from "@/lib/youtube";
import { writeClient } from "@/sanity/write-client";

/**
 * Refresh popularity stats. Runs daily (Vercel cron).
 *  - Videos: pull current YouTube view counts, store viewCount + a rolling snapshot,
 *    and compute weeklyViews (last-7-day increase).
 *  - Articles: snapshot the tracked viewCount and compute weeklyViews the same way.
 *
 * "This week" builds up over time — meaningful once ~7 days of snapshots exist.
 * Auth: CRON_SECRET (Bearer header or ?secret=).
 */

type Snapshot = { date: string; count: number };

// Keep ~8 daily snapshots so the oldest is ~7 days old → a rolling weekly window.
function nextSnapshots(existing: Snapshot[], count: number, nowIso: string): Snapshot[] {
  const eightDaysAgo = Date.now() - 8 * 86400_000;
  const kept = (existing || []).filter((s) => new Date(s.date).getTime() >= eightDaysAgo);
  return [...kept, { date: nowIso, count }].slice(-8);
}

function weeklyFrom(snapshots: Snapshot[], current: number): number {
  if (snapshots.length < 2) return 0;
  const baseline = snapshots[0].count; // oldest retained (~7–8 days ago)
  return Math.max(0, current - baseline);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const summary = { videos: 0, articles: 0, errors: 0 };

  try {
    // ---- Videos ----
    const videos: { _id: string; youtubeId?: string; viewSnapshots?: Snapshot[] }[] =
      (await writeClient.fetch(
        `*[_type == "video" && defined(youtubeId)]{ _id, youtubeId, viewSnapshots }`
      )) || [];

    const stats = await getVideosStatistics(
      videos.map((v) => v.youtubeId!).filter(Boolean)
    );

    let tx = writeClient.transaction();
    let pending = 0;
    for (const v of videos) {
      const current = stats.get(v.youtubeId!);
      if (current == null) continue; // stat unavailable this run — skip
      const snaps = nextSnapshots(v.viewSnapshots || [], current, now);
      tx = tx.patch(v._id, {
        set: { viewCount: current, weeklyViews: weeklyFrom(snaps, current), viewSnapshots: snaps },
      });
      summary.videos++;
      if (++pending >= 100) {
        await tx.commit({ autoGenerateArrayKeys: true });
        tx = writeClient.transaction();
        pending = 0;
      }
    }
    if (pending > 0) await tx.commit({ autoGenerateArrayKeys: true });

    // ---- Articles (only those actually viewed, to save writes) ----
    const articles: { _id: string; viewCount?: number; viewSnapshots?: Snapshot[] }[] =
      (await writeClient.fetch(
        `*[_type == "article" && viewCount > 0]{ _id, viewCount, viewSnapshots }`
      )) || [];

    tx = writeClient.transaction();
    pending = 0;
    for (const a of articles) {
      const current = a.viewCount || 0;
      const snaps = nextSnapshots(a.viewSnapshots || [], current, now);
      tx = tx.patch(a._id, {
        set: { weeklyViews: weeklyFrom(snaps, current), viewSnapshots: snaps },
      });
      summary.articles++;
      if (++pending >= 100) {
        await tx.commit({ autoGenerateArrayKeys: true });
        tx = writeClient.transaction();
        pending = 0;
      }
    }
    if (pending > 0) await tx.commit({ autoGenerateArrayKeys: true });

    return NextResponse.json({ ok: true, ...summary });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown", ...summary },
      { status: 500 }
    );
  }
}
