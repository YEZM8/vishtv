import { NextResponse } from "next/server";
import { getChannelVideos } from "@/lib/youtube";
import { writeClient } from "@/sanity/write-client";

/**
 * YouTube Auto-Sync API Route
 *
 * Fetches recent videos from the VishTV YouTube channel and upserts
 * them into Sanity. Designed to run as a Vercel cron job every 6 hours.
 *
 * Auth: Requires CRON_SECRET header or query param for security.
 */
export async function GET(request: Request) {
  // Auth check
  const { searchParams } = new URL(request.url);
  const secret = request.headers.get("authorization")?.replace("Bearer ", "") ||
    searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const videos = await getChannelVideos(20);

    if (videos.length === 0) {
      return NextResponse.json({
        message: "No videos found from YouTube API",
        created: 0,
        updated: 0,
        skipped: 0,
      });
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const video of videos) {
      // Check if video already exists in Sanity
      const existing = await writeClient.fetch(
        `*[_type == "video" && youtubeId == $youtubeId][0]{ _id, title }`,
        { youtubeId: video.id }
      );

      if (existing) {
        // Update only if title changed (avoid unnecessary writes)
        if (existing.title !== video.title) {
          await writeClient
            .patch(existing._id)
            .set({
              title: video.title,
              description: video.description,
              thumbnailUrl: video.thumbnailUrl,
            })
            .commit();
          updated++;
        } else {
          skipped++;
        }
      } else {
        // Create new video document
        await writeClient.create({
          _type: "video",
          title: video.title,
          youtubeId: video.id,
          youtubeUrl: `https://www.youtube.com/watch?v=${video.id}`,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          publishedAt: video.publishedAt,
          language: "en",
          isFeatured: false,
        });
        created++;
      }
    }

    return NextResponse.json({
      message: "Sync complete",
      total: videos.length,
      created,
      updated,
      skipped,
    });
  } catch (error) {
    console.error("YouTube sync error:", error);
    return NextResponse.json(
      { error: "Sync failed", details: String(error) },
      { status: 500 }
    );
  }
}
