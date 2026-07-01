import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { client, urlFor } from "@/sanity/client";
import { searchQuery } from "@/lib/queries";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import styles from "./SearchPage.module.css";

export const metadata: Metadata = {
  title: "Search",
  // Search result pages shouldn't be indexed
  robots: { index: false },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

type Article = {
  _id: string;
  title: string;
  slug: string;
  featuredImage?: { asset: { _ref: string } };
  publishedAt?: string;
  categoryTitle?: string;
};
type Video = {
  _id: string;
  title: string;
  youtubeId: string;
  thumbnailUrl?: string;
  publishedAt?: string;
};
type Programme = {
  _id: string;
  title: string;
  slug: string;
  poster?: { asset: { _ref: string } };
  thumbnail?: { asset: { _ref: string } };
};

function formatDate(iso?: string) {
  return iso
    ? new Date(iso).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const term = (q || "").trim();

  const results = term
    ? await client.fetch(searchQuery, { q: `${term}*` })
    : null;

  const articles: Article[] = results?.articles ?? [];
  const videos: Video[] = results?.videos ?? [];
  const programmes: Programme[] = results?.programmes ?? [];
  const total = articles.length + videos.length + programmes.length;

  return (
    <>
      <Topbar />

      <main id="main-content">
        <div className={styles.header}>
          <h1 className={styles.heading}>Search</h1>
          <form className={styles.searchForm} action="/search" method="get" role="search">
            <input
              className={styles.searchInput}
              type="search"
              name="q"
              defaultValue={term}
              placeholder="Search news, videos, programmes…"
              aria-label="Search"
              autoFocus
            />
            <button className={styles.searchButton} type="submit">
              Search
            </button>
          </form>
          {term && (
            <p className={styles.resultCount}>
              {total > 0
                ? `${total} result${total === 1 ? "" : "s"} for “${term}”`
                : `No results for “${term}”.`}
            </p>
          )}
        </div>

        {!term && (
          <p className={styles.empty}>
            Type above to search across news, videos and programmes.
          </p>
        )}

        {articles.length > 0 && (
          <section className={styles.section} aria-label="News results">
            <h2 className={styles.sectionTitle}>News</h2>
            <div className={styles.grid}>
              {articles.map((a) => (
                <Link key={a._id} href={`/news/${a.slug}`} className={styles.card}>
                  <div className={styles.cardImage}>
                    {a.featuredImage?.asset && (
                      <Image
                        src={urlFor(a.featuredImage).width(480).height(270).url()}
                        alt={a.title}
                        fill
                        sizes="(max-width: 560px) 50vw, 240px"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </div>
                  {a.categoryTitle && (
                    <div className={styles.cardCategory}>{a.categoryTitle}</div>
                  )}
                  <h3 className={styles.cardTitle}>{a.title}</h3>
                  {formatDate(a.publishedAt) && (
                    <div className={styles.cardMeta}>{formatDate(a.publishedAt)}</div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {videos.length > 0 && (
          <section className={styles.section} aria-label="Video results">
            <h2 className={styles.sectionTitle}>Videos</h2>
            <div className={styles.grid}>
              {videos.map((v) => (
                <Link key={v._id} href={`/watch/${v.youtubeId}`} className={styles.card}>
                  <div className={styles.cardImage}>
                    <Image
                      src={
                        v.thumbnailUrl ||
                        `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`
                      }
                      alt={v.title}
                      fill
                      sizes="(max-width: 560px) 50vw, 240px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <h3 className={styles.cardTitle}>{v.title}</h3>
                  {formatDate(v.publishedAt) && (
                    <div className={styles.cardMeta}>{formatDate(v.publishedAt)}</div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {programmes.length > 0 && (
          <section className={styles.section} aria-label="Programme results">
            <h2 className={styles.sectionTitle}>Programmes</h2>
            <div className={styles.grid}>
              {programmes.map((p) => {
                const img = p.thumbnail || p.poster;
                return (
                  <Link key={p._id} href={`/browse/${p.slug}`} className={styles.card}>
                    <div className={styles.cardImage}>
                      {img?.asset && (
                        <Image
                          src={urlFor(img).width(480).height(270).url()}
                          alt={p.title}
                          fill
                          sizes="(max-width: 560px) 50vw, 240px"
                          style={{ objectFit: "cover" }}
                        />
                      )}
                    </div>
                    <h3 className={styles.cardTitle}>{p.title}</h3>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
