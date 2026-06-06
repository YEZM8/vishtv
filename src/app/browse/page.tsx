import type { Metadata } from "next";
import { client, urlFor } from "@/sanity/client";
import { browsePageQuery } from "@/lib/queries";
import { videoCatalog, getProgrammes, getVideosByProgramme } from "@/lib/video-catalog";
import { getThumbnailUrl } from "@/lib/youtube";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import ContentRow from "@/components/rows/ContentRow";
import TileWide from "@/components/rows/TileWide";
import BrowseGrid from "./BrowseGrid";
import styles from "./BrowsePage.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Browse Programmes",
  description: "Explore all VishTV programmes — drama, news, sport, lifestyle and more.",
};

interface SanityVideo {
  _id: string;
  title: string;
  youtubeId: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  programmeTitle?: string;
}

interface SanityProgramme {
  _id: string;
  title: string;
  slug: string;
  poster?: { asset: { _ref: string } };
  thumbnail?: { asset: { _ref: string } };
  description?: string;
  categoryTitle?: string;
  categorySlug?: string;
  videoCount?: number;
  sampleVideoId?: string;
}

export default async function BrowsePage() {
  const data = await client.fetch(browsePageQuery);
  const programmes: SanityProgramme[] = data?.programmes || [];
  const categories = data?.categories || [];
  const allVideos: SanityVideo[] = data?.allVideos || [];
  const totalVideoCount: number = data?.totalVideoCount || 0;
  const hasSanityData = programmes.length > 0 || allVideos.length > 0;

  // Pre-resolve poster image URLs on the server.
  // Fallback to a YouTube thumbnail from the programme's most recent video.
  const posterUrls: Record<string, string> = {};
  for (const p of programmes) {
    if (p.poster?.asset) {
      posterUrls[p._id] = urlFor(p.poster).width(400).height(600).url();
    } else if (p.thumbnail?.asset) {
      posterUrls[p._id] = urlFor(p.thumbnail).width(400).height(600).url();
    } else if (p.sampleVideoId) {
      posterUrls[p._id] = getThumbnailUrl(p.sampleVideoId, "high");
    }
  }

  // Catalog fallback: group videos by programme
  const catalogProgrammes = getProgrammes().filter((p) => p !== "Live Stream");

  return (
    <>
      <Topbar />

      <main id="main-content">
        <div className={styles.header}>
          <h1 className={styles.heading}>Programmes</h1>
        </div>

        {hasSanityData ? (
          <>
            {programmes.length > 0 && (
              <BrowseGrid
                programmes={programmes}
                categories={categories}
                posterUrls={posterUrls}
              />
            )}

            {allVideos.length > 0 && (
              <section className="section">
                <div className="section-head">
                  <h2>All videos {totalVideoCount > 0 && <small style={{ color: "var(--text-muted)", fontWeight: 400 }}>({totalVideoCount.toLocaleString()})</small>}</h2>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "var(--sp-4)",
                    padding: "0 var(--safe)",
                  }}
                >
                  {allVideos.map((v) => (
                    <TileWide
                      key={v._id}
                      title={v.title}
                      youtubeId={v.youtubeId}
                      thumbnailUrl={v.thumbnailUrl}
                      eyebrow={v.programmeTitle}
                      subtitle={
                        v.publishedAt
                          ? new Date(v.publishedAt).toLocaleDateString("en-AU", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : undefined
                      }
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          /* Catalog fallback: group videos by programme */
          catalogProgrammes.map((programmeName) => {
            const videos = getVideosByProgramme(programmeName);
            if (videos.length === 0) return null;
            return (
              <ContentRow key={programmeName} title={programmeName} variant="wide">
                {videos.map((v) => (
                  <TileWide
                    key={v.id}
                    title={v.title}
                    youtubeId={v.id}
                    eyebrow={v.category}
                    description={v.description}
                    programme={v.programme}
                    subtitle={new Date(v.publishedAt).toLocaleDateString("en-AU", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  />
                ))}
              </ContentRow>
            );
          })
        )}
      </main>

      <Footer />
    </>
  );
}
