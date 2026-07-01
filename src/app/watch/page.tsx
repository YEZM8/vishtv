import { client } from "@/sanity/client";
import { siteSettingsQuery } from "@/lib/queries";
import { getLiveStreamStatus } from "@/lib/youtube";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import ContentRow from "@/components/rows/ContentRow";
import TileWide from "@/components/rows/TileWide";
import YouTubePlayer from "@/components/player/YouTubePlayer";

export const metadata = {
  title: "Watch Live",
  description: "Watch Vishvavahini TV live — Sri Lankan community television from Australia.",
};

// Cache the page (and the single YouTube live-status check) for 15 minutes. This keeps the
// quota-heavy search API to ~96 calls/day while auto-detecting a new live within ~15 min.
export const revalidate = 900;

const recentVideosQuery = `*[_type == "video" && defined(youtubeId)] | order(publishedAt desc) [0...12] {
  _id, title, youtubeId, thumbnailUrl, "programmeTitle": programme->title
}`;

export default async function WatchLivePage() {
  const [settings, recent] = await Promise.all([
    client.fetch(siteSettingsQuery),
    client.fetch(recentVideosQuery),
  ]);

  // Manual override (scheduled premiere) wins; otherwise auto-detect the channel's live stream.
  const overrideId: string | undefined = settings?.liveStreamVideoId;
  let liveId: string | null = overrideId || null;
  if (!liveId) {
    const status = await getLiveStreamStatus();
    if (status.isLive && status.videoId) liveId = status.videoId;
  }

  const recentVideos: {
    _id: string;
    title: string;
    youtubeId: string;
    thumbnailUrl?: string;
    programmeTitle?: string;
  }[] = recent || [];

  return (
    <>
      <Topbar />

      <main id="main-content">
        <div style={{ padding: "calc(var(--sp-7) + 60px) var(--safe) var(--sp-4)" }}>
          <h1
            style={{
              fontSize: "var(--fs-4)",
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "var(--sp-3)",
            }}
          >
            {liveId && (
              <span className="live-pill">
                <span className="dot" aria-hidden="true" />
                LIVE
              </span>
            )}
            Vishvavahini TV Live
          </h1>
        </div>

        <div style={{ padding: "0 var(--safe)" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            {liveId ? (
              <>
                <YouTubePlayer videoId={liveId} autoplay isLive title="Vishvavahini TV Live" />
                <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-0)", lineHeight: 1.6, marginTop: "var(--sp-4)" }}>
                  Watch Vishvavahini TV live — Sri Lankan community television broadcasting from
                  Melbourne to the world.
                </p>
              </>
            ) : (
              <div
                style={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--r-md)",
                  padding: "var(--sp-8) var(--sp-6)",
                  textAlign: "center",
                }}
              >
                <h2 style={{ fontSize: "var(--fs-2)", fontWeight: 700, color: "var(--text)", margin: 0 }}>
                  We&apos;re off air right now
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-0)", marginTop: "var(--sp-2)" }}>
                  Our live stream isn&apos;t running at the moment. Catch up on our latest videos below,
                  or check back soon.
                </p>
              </div>
            )}
          </div>
        </div>

        {recentVideos.length > 0 && (
          <ContentRow title="Latest videos" moreHref="/browse" variant="wide">
            {recentVideos.map((v) => (
              <TileWide
                key={v._id}
                title={v.title}
                youtubeId={v.youtubeId}
                thumbnailUrl={v.thumbnailUrl}
                eyebrow={v.programmeTitle}
                href={`/watch/${v.youtubeId}`}
              />
            ))}
          </ContentRow>
        )}
      </main>

      <Footer />
    </>
  );
}
