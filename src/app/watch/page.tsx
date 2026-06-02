import { redirect } from "next/navigation";
import { client } from "@/sanity/client";
import { siteSettingsQuery } from "@/lib/queries";
import { videoCatalog } from "@/lib/video-catalog";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import ContentRow from "@/components/rows/ContentRow";
import TileWide from "@/components/rows/TileWide";

export const metadata = {
  title: "Watch",
  description: "Watch VishTV — Sri Lankan voices, Australian home.",
};

export default async function WatchLivePage() {
  const settings = await client.fetch(siteSettingsQuery);
  const liveId = settings?.liveStreamVideoId;

  // If a live stream ID is configured, redirect to the specific watch page
  if (liveId) {
    redirect(`/watch/${liveId}`);
  }

  // No live stream — show all videos from catalog
  return (
    <>
      <Topbar />

      <main id="main-content">
        <div style={{
          padding: "calc(var(--sp-7) + 60px) var(--safe) var(--sp-5)",
        }}>
          <h1 style={{
            fontSize: "var(--fs-4)",
            fontWeight: 700,
            color: "var(--text)",
            margin: 0,
          }}>
            Watch
          </h1>
          <p style={{
            color: "var(--text-muted)",
            fontSize: "var(--fs-0)",
            marginTop: "var(--sp-2)",
          }}>
            Browse all videos from VishTV
          </p>
        </div>

        <ContentRow title="All Videos" variant="wide">
          {videoCatalog.map((v) => (
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
      </main>

      <Footer />
    </>
  );
}
