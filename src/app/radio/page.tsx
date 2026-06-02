import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { siteSettingsQuery } from "@/lib/queries";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import styles from "./RadioPage.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Radio",
  description: "Listen to VishTV Radio — Sri Lankan community radio from Australia.",
};

export default async function RadioPage() {
  const settings = await client.fetch(siteSettingsQuery);
  const streamUrl = settings?.radioStreamUrl;

  return (
    <>
      <Topbar />

      <main id="main-content">
        <div className={styles.container}>
          <div className={styles.icon} aria-hidden="true">
            📻
          </div>
          <h1 className={styles.title}>VishTV Radio</h1>
          <p className={styles.subtitle}>
            Sri Lankan community radio broadcasting from Melbourne.
            Music, talk shows and live coverage — listen anywhere.
          </p>

          {streamUrl ? (
            <div className={styles.player}>
              <div className={styles.playerLabel}>
                <span className="live-pill">
                  <span className="dot" aria-hidden="true" />
                  LIVE
                </span>
                Now streaming
              </div>
              <audio controls preload="none" src={streamUrl}>
                Your browser does not support audio playback.
              </audio>
            </div>
          ) : (
            <div className={styles.offline}>
              <p>Radio stream is currently offline.</p>
              <p>Check back soon or watch our TV programmes instead.</p>
              <a
                className="btn btn-brand"
                href="/browse"
                style={{ marginTop: "var(--sp-4)", display: "inline-block" }}
              >
                Browse programmes
              </a>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
