import type { Metadata } from "next";
import Image from "next/image";
import { client, urlFor } from "@/sanity/client";
import { programmeQuery } from "@/lib/queries";
import { decodeSlug } from "@/lib/slug";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import TileWide from "@/components/rows/TileWide";
import styles from "./ProgrammePage.module.css";

interface ProgrammePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProgrammePageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const programme = await client.fetch(programmeQuery, { slug: decodeSlug(rawSlug) });

  if (!programme) return { title: "Programme not found" };

  return {
    title: programme.title,
    description: programme.description?.slice(0, 160) || `Watch ${programme.title} on VishTV`,
  };
}

export default async function ProgrammePage({ params }: ProgrammePageProps) {
  const { slug: rawSlug } = await params;
  const programme = await client.fetch(programmeQuery, { slug: decodeSlug(rawSlug) });

  if (!programme) {
    return (
      <>
        <Topbar />
        <main id="main-content">
          <p className={styles.notFound}>Programme not found.</p>
        </main>
        <Footer />
      </>
    );
  }

  const episodes = programme.episodes || [];
  const posterUrl = programme.poster?.asset
    ? urlFor(programme.poster).width(400).height(600).url()
    : programme.thumbnail?.asset
    ? urlFor(programme.thumbnail).width(400).height(600).url()
    : null;

  return (
    <>
      <Topbar />

      <main id="main-content">
        {/* Programme header */}
        <div className={styles.header}>
          {posterUrl && (
            <div className={styles.poster}>
              <Image
                src={posterUrl}
                alt={programme.title}
                fill
                sizes="200px"
                style={{ objectFit: "cover" }}
              />
            </div>
          )}
          <div className={styles.info}>
            {programme.categoryTitle && (
              <div className={styles.category}>{programme.categoryTitle}</div>
            )}
            <h1 className={styles.title}>{programme.title}</h1>
            {programme.description && (
              <p className={styles.description}>{programme.description}</p>
            )}
          </div>
        </div>

        {/* Episodes */}
        <h2 className={styles.episodesHeading}>
          Episodes ({episodes.length})
        </h2>
        <div className={styles.episodes}>
          {episodes.length > 0 ? (
            episodes.map(
              (ep: {
                _id: string;
                title: string;
                youtubeId: string;
                thumbnailUrl?: string;
                publishedAt?: string;
              }) => (
                <TileWide
                  key={ep._id}
                  title={ep.title}
                  youtubeId={ep.youtubeId}
                  thumbnailUrl={ep.thumbnailUrl}
                  subtitle={
                    ep.publishedAt
                      ? new Date(ep.publishedAt).toLocaleDateString("en-AU", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : undefined
                  }
                />
              )
            )
          ) : (
            <p className={styles.empty}>No episodes available yet.</p>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
