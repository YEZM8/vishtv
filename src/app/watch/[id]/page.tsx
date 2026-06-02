import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { watchPageQuery, siteSettingsQuery } from "@/lib/queries";
import { getVideoById, getThumbnailUrl } from "@/lib/youtube";
import { getVideoFromCatalog, getVideosByProgramme } from "@/lib/video-catalog";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import VideoWithIntro from "@/components/player/VideoWithIntro";
import ContentRow from "@/components/rows/ContentRow";
import TileWide from "@/components/rows/TileWide";
import styles from "./WatchPage.module.css";

interface WatchPageProps {
  params: Promise<{ id: string }>;
}

/* ---------- Metadata ---------- */

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const video = await client.fetch(watchPageQuery, { videoId: id });
  const catalog = getVideoFromCatalog(id);

  const title = video?.title || catalog?.title || "Watch";
  const description = video?.description?.slice(0, 160) || catalog?.description?.slice(0, 160) || "Watch on VishTV";
  const thumbnail = video?.thumbnailUrl || getThumbnailUrl(id, "maxres");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: thumbnail, width: 1280, height: 720 }],
      type: "video.other",
    },
  };
}

/* ---------- Page ---------- */

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;

  // 1. Try Sanity
  const video = await client.fetch(watchPageQuery, { videoId: id });

  // 2. Try YouTube API
  const ytFallback = !video ? await getVideoById(id) : null;

  // 3. Try static catalog
  const catalog = !video && !ytFallback ? getVideoFromCatalog(id) : null;

  const title = video?.title || ytFallback?.title || catalog?.title || "Video";
  const description = video?.description || ytFallback?.description || catalog?.description || "";
  const programmeName = video?.programme?.title || catalog?.programme;
  const programmeSlug = video?.programme?.slug;
  const publishedAt = video?.publishedAt || ytFallback?.publishedAt || catalog?.publishedAt;
  const isLive = ytFallback?.isLive || false;

  // Related videos: from Sanity, or from same programme in catalog
  const relatedVideos = video?.relatedVideos || [];
  const catalogRelated = relatedVideos.length === 0 && programmeName
    ? getVideosByProgramme(programmeName).filter((v) => v.id !== id)
    : [];

  // Check if this is the current live stream
  const settings = await client.fetch(siteSettingsQuery);
  const isLiveStream = settings?.liveStreamVideoId === id;

  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <Topbar />

      <main id="main-content">
        {/* Player */}
        <section className={styles.playerSection}>
          <VideoWithIntro
            videoId={id}
            autoplay
            isLive={isLive || isLiveStream}
            title={title}
          />
        </section>

        {/* Video Info */}
        <section className={styles.infoSection}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.meta}>
            {programmeName && programmeSlug ? (
              <a href={`/browse/${programmeSlug}`}>{programmeName}</a>
            ) : programmeName ? (
              <span>{programmeName}</span>
            ) : null}
            {programmeName && formattedDate && " · "}
            {formattedDate && <span>{formattedDate}</span>}
            {isLiveStream && (
              <span className="live-pill" style={{ marginLeft: "var(--sp-3)" }}>
                <span className="dot" aria-hidden="true" />
                LIVE
              </span>
            )}
          </p>
          {description && <p className={styles.description}>{description}</p>}
        </section>

        {/* Related Videos (Sanity) */}
        {relatedVideos.length > 0 && (
          <ContentRow
            title={`More from ${programmeName || "this programme"}`}
            variant="wide"
            moreHref={programmeSlug ? `/browse/${programmeSlug}` : undefined}
          >
            {relatedVideos.map(
              (v: { _id: string; title: string; youtubeId: string; thumbnailUrl?: string }) => (
                <TileWide
                  key={v._id}
                  title={v.title}
                  youtubeId={v.youtubeId}
                  thumbnailUrl={v.thumbnailUrl}
                />
              )
            )}
          </ContentRow>
        )}

        {/* Related Videos (Catalog fallback) */}
        {catalogRelated.length > 0 && (
          <ContentRow
            title={`More from ${programmeName}`}
            variant="wide"
          >
            {catalogRelated.map((v) => (
              <TileWide
                key={v.id}
                title={v.title}
                youtubeId={v.id}
                description={v.description}
                programme={v.programme}
                eyebrow={v.category}
              />
            ))}
          </ContentRow>
        )}
      </main>

      <Footer />
    </>
  );
}
