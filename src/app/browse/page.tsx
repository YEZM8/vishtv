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

export default async function BrowsePage() {
  const data = await client.fetch(browsePageQuery);
  const programmes = data?.programmes || [];
  const categories = data?.categories || [];
  const hasSanityData = programmes.length > 0;

  // Pre-resolve poster image URLs on the server
  const posterUrls: Record<string, string> = {};
  for (const p of programmes) {
    if (p.poster?.asset) {
      posterUrls[p._id] = urlFor(p.poster).width(400).height(600).url();
    } else if (p.thumbnail?.asset) {
      posterUrls[p._id] = urlFor(p.thumbnail).width(400).height(600).url();
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
          <BrowseGrid
            programmes={programmes}
            categories={categories}
            posterUrls={posterUrls}
          />
        ) : (
          /* Catalog fallback: show videos grouped by programme */
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
