import type { Metadata } from "next";
import Link from "next/link";
import Topbar from "@/components/layout/Topbar";
import Footer from "@/components/layout/Footer";
import RadioStage from "@/components/player/RadioStage";
import styles from "./RadioPage.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Radio",
  description: "Listen to VishTV Radio — Sri Lankan community radio from Australia.",
};

export default function RadioPage() {
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

          {/* The stream URL + now-playing come from the global player (root
              layout), so playback started here follows the listener around. */}
          <RadioStage />

          <Link href="/radio/go-live" className={styles.presenterLink}>
            Presenter? Go live →
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
