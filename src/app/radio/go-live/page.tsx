import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { siteSettingsQuery } from "@/lib/queries";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import GoLivePanel from "@/components/player/GoLivePanel";
import styles from "../RadioPage.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Go Live",
  description: "Broadcast live to VishTV Radio from your browser.",
  // Presenter-facing utility page — keep it out of search results.
  robots: { index: false, follow: false },
};

export default async function GoLivePage() {
  const settings = await client.fetch(siteSettingsQuery);
  const webDjUrl: string | null = settings?.radioWebDjUrl ?? null;

  return (
    <>
      <Topbar />

      <main id="main-content">
        <div className={styles.container}>
          <div className={styles.icon} aria-hidden="true">
            🎙️
          </div>
          <GoLivePanel webDjUrl={webDjUrl} />
        </div>
      </main>

      <Footer />
    </>
  );
}
