import type { Metadata } from "next";
import Image from "next/image";
import { client, urlFor } from "@/sanity/client";
import { homePageQuery } from "@/lib/queries";
import { videoCatalog, getVideosByProgramme } from "@/lib/video-catalog";
import { getThumbnailUrl } from "@/lib/youtube";
import Topbar from "@/components/layout/Topbar";
import Hero from "@/components/hero/Hero";
import ContentRow from "@/components/rows/ContentRow";
import TileWide from "@/components/rows/TileWide";
import TilePoster from "@/components/rows/TilePoster";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "VishTV — Sri Lankan voices, Australian home",
  description:
    "Live news, drama, music and sport from the Sri Lankan diaspora in Australia.",
};

export const revalidate = 60;

/* ---------- Page ---------- */

export default async function HomePage() {
  const data = await client.fetch(homePageQuery);

  const settings = data?.settings;
  const featuredVideos = data?.featuredVideos || [];
  const recentVideos = data?.recentVideos || [];
  const recentNews = data?.recentNews || [];
  const schedule = data?.schedule?.slots || [];
  const trendingVideos = data?.trendingVideos || [];
  const topVideos = data?.topVideos || [];
  const trendingNews = data?.trendingNews || [];
  const topNews = data?.topNews || [];

  // Trending row: real weekly views if available, else fall back to most recent.
  const trendingVideoList = trendingVideos.length > 0 ? trendingVideos : recentVideos;
  // Newsroom row: weekly-trending news if available, else most recent.
  const newsroomList = trendingNews.length > 0 ? trendingNews : recentNews;

  const newsImg = (n: { featuredImage?: { asset: { _ref: string } } }) =>
    n.featuredImage?.asset
      ? urlFor(n.featuredImage).width(600).height(340).url()
      : undefined;

  const hasSanityData = featuredVideos.length > 0 || recentVideos.length > 0;
  const hasSchedule = schedule.length > 0;

  // Live stream video from catalog
  const liveVideo = videoCatalog.find((v) => v.programme === "Live Stream");

  // Programme-grouped catalog data
  const catalogFeatured = videoCatalog.filter((v) => v.programme !== "Live Stream").slice(0, 6);
  const catalogTalkShow = getVideosByProgramme("යාරා තීරය");
  const catalogMore = videoCatalog.filter((v) => v.programme !== "Live Stream" && v.programme !== "යාරා තීරය").slice(0, 8);

  const FALLBACK_SCHEDULE = [
    { time: "6:00 pm", title: "ප්‍රජා සම්බන්ධතා", isLive: false },
    { time: "7:00 pm", title: "Evening News with Nirmali", isLive: true },
    { time: "8:00 pm", title: "යාරා තීරය", isLive: false },
    { time: "9:00 pm", title: "Sporting Live", isLive: false },
    { time: "10:00 pm", title: "Late-night replay", isLive: false },
  ];

  return (
    <>
      <Topbar transparent />

      <main id="main-content">
        <Hero
          headline={settings?.heroHeadline}
          subline={settings?.heroSubline}
        />

        {/* Live Stream — Large featured section */}
        {liveVideo && (
          <section className="section" style={{ paddingTop: 0, paddingBottom: "var(--sp-4)", paddingLeft: "var(--safe)", paddingRight: "var(--safe)", marginTop: 0 }}>
            <div className="section-head">
              <h2>
                <span className="live-pill" style={{ marginRight: "var(--sp-2)" }}>
                  <span className="dot" aria-hidden="true" />
                  LIVE
                </span>
                Watch Now
              </h2>
            </div>
            <a
              href={`/watch/${liveVideo.id}`}
              style={{
                display: "block",
                position: "relative",
                aspectRatio: "21/9",
                maxHeight: "420px",
                borderRadius: "var(--r-md)",
                overflow: "hidden",
                background: "#000",
              }}
            >
              <Image
                src={getThumbnailUrl(liveVideo.id, "maxres")}
                alt={liveVideo.title}
                fill
                sizes="100vw"
                style={{ objectFit: "cover" }}
                priority
              />
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 50%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "var(--sp-6)",
              }}>
                <div style={{ fontSize: "var(--fs-3)", fontWeight: 700, color: "#fff", marginBottom: "var(--sp-2)" }}>
                  {liveVideo.title}
                </div>
                <div style={{ fontSize: "var(--fs-0)", color: "rgba(255,255,255,0.7)", maxWidth: "60ch" }}>
                  {liveVideo.description}
                </div>
                <div style={{ marginTop: "var(--sp-3)" }}>
                  <span className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-2)" }}>
                    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}><path d="M8 5v14l11-7z" /></svg>
                    Watch live
                  </span>
                </div>
              </div>
            </a>
          </section>
        )}

        {/* Featured Videos */}
        <ContentRow title="Featured" variant="wide">
          {hasSanityData
            ? featuredVideos.map((v: { _id: string; title: string; youtubeId: string; thumbnailUrl?: string; programmeTitle?: string }) => (
                <TileWide
                  key={v._id}
                  title={v.title}
                  youtubeId={v.youtubeId}
                  thumbnailUrl={v.thumbnailUrl}
                  eyebrow={v.programmeTitle}
                />
              ))
            : catalogFeatured.map((v) => (
                <TileWide
                  key={v.id}
                  title={v.title}
                  youtubeId={v.id}
                  eyebrow={v.programme}
                  description={v.description}
                  programme={v.programme}
                  subtitle={v.category}
                />
              ))}
        </ContentRow>

        {/* යාරා තීරය */}
        {!hasSanityData && catalogTalkShow.length > 0 && (
          <ContentRow title="යාරා තීරය" variant="wide">
            {catalogTalkShow.map((v) => (
              <TileWide
                key={v.id}
                title={v.title}
                youtubeId={v.id}
                eyebrow="Talk Show"
                description={v.description}
                programme={v.programme}
                subtitle={timeAgo(v.publishedAt)}
              />
            ))}
          </ContentRow>
        )}

        {/* Recently Added (Sanity) */}
        {hasSanityData && recentVideos.length > 0 && (
          <ContentRow title="Recently added" variant="wide">
            {recentVideos.slice(0, 10).map((v: { _id: string; title: string; youtubeId: string; thumbnailUrl?: string; programmeTitle?: string }) => (
              <TileWide
                key={v._id}
                title={v.title}
                youtubeId={v.youtubeId}
                thumbnailUrl={v.thumbnailUrl}
                eyebrow={v.programmeTitle}
              />
            ))}
          </ContentRow>
        )}

        {/* More from VishTV (catalog fallback) */}
        {!hasSanityData && catalogMore.length > 0 && (
          <ContentRow title="More from VishTV" variant="wide">
            {catalogMore.map((v) => (
              <TileWide
                key={v.id}
                title={v.title}
                youtubeId={v.id}
                eyebrow={v.programme}
                description={v.description}
                programme={v.programme}
                subtitle={timeAgo(v.publishedAt)}
              />
            ))}
          </ContentRow>
        )}

        {/* Trending This Week — most-viewed videos (weekly), real thumbnails */}
        {trendingVideoList.length > 0 && (
          <ContentRow title="Trending this week" moreHref="/browse" variant="posters">
            {trendingVideoList.slice(0, 8).map((v: { _id: string; title: string; youtubeId: string; thumbnailUrl?: string; programmeTitle?: string }, i: number) => (
              <TilePoster
                key={v._id}
                title={v.title}
                subtitle={v.programmeTitle}
                eyebrow={`Trending #${i + 1}`}
                imageSrc={v.thumbnailUrl || getThumbnailUrl(v.youtubeId, "high")}
                href={`/watch/${v.youtubeId}`}
              />
            ))}
          </ContentRow>
        )}

        {/* Most Watched — all-time view count */}
        {topVideos.length > 0 && (
          <ContentRow title="Most watched" moreHref="/browse" variant="wide">
            {topVideos.slice(0, 10).map((v: { _id: string; title: string; youtubeId: string; thumbnailUrl?: string; programmeTitle?: string }) => (
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

        {/* From the Newsroom — trending news (weekly) with images, else latest */}
        {newsroomList.length > 0 && (
          <ContentRow title="From the newsroom" moreHref="/news">
            {newsroomList.map((n: { _id: string; title: string; slug: string; featuredImage?: { asset: { _ref: string } }; categoryTitle?: string; publishedAt?: string }) => (
              <TileWide
                key={n._id}
                title={n.title}
                thumbnailUrl={newsImg(n)}
                eyebrow={n.categoryTitle}
                subtitle={n.publishedAt ? timeAgo(n.publishedAt) : undefined}
                href={`/news/${n.slug}`}
              />
            ))}
          </ContentRow>
        )}

        {/* Most Read — all-time most-visited articles (appears once views accrue) */}
        {topNews.length > 0 && (
          <ContentRow title="Most read" moreHref="/news">
            {topNews.map((n: { _id: string; title: string; slug: string; featuredImage?: { asset: { _ref: string } }; categoryTitle?: string; publishedAt?: string }) => (
              <TileWide
                key={n._id}
                title={n.title}
                thumbnailUrl={newsImg(n)}
                eyebrow={n.categoryTitle}
                subtitle={n.publishedAt ? timeAgo(n.publishedAt) : undefined}
                href={`/news/${n.slug}`}
              />
            ))}
          </ContentRow>
        )}

        {/* Tonight's Schedule */}
        <section className="section" id="schedule">
          <div className="section-head">
            <h2>Tonight&apos;s schedule</h2>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "var(--sp-3)",
            padding: "0 var(--safe)",
          }}>
            {(hasSchedule ? schedule : FALLBACK_SCHEDULE).map((slot: { time: string; title?: string; programmeTitle?: string; episodeTitle?: string; isLive?: boolean }) => (
              <div
                key={slot.time}
                style={{
                  background: slot.isLive ? "var(--blue)" : "var(--bg-2)",
                  borderRadius: "var(--r-md)",
                  padding: "var(--sp-4)",
                  border: "1px solid var(--line)",
                  textAlign: "center",
                }}
              >
                <div style={{
                  fontSize: "var(--fs--1)",
                  color: slot.isLive ? "rgba(255,255,255,0.9)" : "var(--text-muted)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  marginBottom: "var(--sp-2)",
                }}>
                  {slot.isLive ? "On air" : slot.time}
                </div>
                <div style={{
                  fontSize: "var(--fs-0)",
                  fontWeight: 600,
                  color: "var(--text)",
                }}>
                  {slot.title || slot.programmeTitle || slot.episodeTitle}
                </div>
                {!slot.isLive && (
                  <div style={{
                    fontSize: "var(--fs--1)",
                    color: "var(--text-dim)",
                    marginTop: "var(--sp-1)",
                  }}>
                    {slot.time}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Sponsor / Community strip — with logo */}
        <section
          id="support"
          style={{
            background: "var(--bg-2)",
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
            padding: "var(--sp-7) var(--safe)",
            textAlign: "center",
            marginTop: "var(--sp-6)",
          }}
        >
          <Image
            src="/assets/vishvavahini-logo-primary-transparent.png"
            alt="VishTV"
            width={200}
            height={53}
            style={{ height: "2.5em", width: "auto", opacity: 1, margin: "0 auto var(--sp-4)" }}
          />
          <h2 style={{ fontSize: "var(--fs-3)", marginBottom: "var(--sp-3)" }}>
            Vishvavahini is yours
          </h2>
          <p style={{ color: "var(--text-muted)", maxWidth: "60ch", margin: "0 auto var(--sp-5)" }}>
            As a community-owned channel we rely on viewers, sponsors and
            advertisers to stay on air. Help us tell Sri Lankan stories from
            Australian soil.
          </p>
          <div className="cta-row" style={{ justifyContent: "center" }}>
            <a className="btn btn-brand" href="/advertise">
              Sponsor a show
            </a>
            <a className="btn btn-ghost" href="/contact">
              Get in touch
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

/* ---------- Helper ---------- */

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffHours = Math.floor((now - then) / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
}
