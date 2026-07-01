import { client } from "@/sanity/client";
import { siteSettingsQuery } from "@/lib/queries";
import { DEFAULT_CHANNEL_ID } from "@/lib/youtube";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import ContentRow from "@/components/rows/ContentRow";
import TileWide from "@/components/rows/TileWide";
import YouTubePlayer from "@/components/player/YouTubePlayer";

export const metadata = {
  title: "Watch Live",
  description: "Watch Vishvavahini TV live — Sri Lankan community television from Australia.",
};

// The live embed is dynamic; keep the page fresh.
export const revalidate = 60;

const recentVideosQuery = `*[_type == "video" && defined(youtubeId)] | order(publishedAt desc) [0...12] {
  _id, title, youtubeId, thumbnailUrl, "programmeTitle": programme->title
}`;

export default async function WatchLivePage() {
  const [settings, recent] = await Promise.all([
    client.fetch(siteSettingsQuery),
    client.fetch(recentVideosQuery),
  ]);

  // Optional manual override (e.g. a scheduled premiere); otherwise auto-play the channel's
  // current live stream via the YouTube live_stream embed.
  const overrideId = settings?.liveStreamVideoId;
  const channelId = process.env.YOUTUBE_CHANNEL_ID || DEFAULT_CHANNEL_ID;

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
            <span className="live-pill">
              <span className="dot" aria-hidden="true" />
              LIVE
            </span>
            Vishvavahini TV Live
          </h1>
        </div>

        <div style={{ padding: "0 var(--safe)" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <YouTubePlayer
              {...(overrideId ? { videoId: overrideId } : { liveChannelId: channelId })}
              autoplay
              isLive
              title="Vishvavahini TV Live"
            />
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "var(--fs-0)",
                lineHeight: 1.6,
                marginTop: "var(--sp-4)",
              }}
            >
              Watch Vishvavahini TV live — Sri Lankan community television broadcasting from
              Melbourne to the world. If we&apos;re currently off air, browse our latest videos below.
            </p>
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
