import Link from "next/link";
import styles from "./Hero.module.css";

interface HeroProps {
  headline?: string;
  subline?: string;
  showTitle?: string;
  showTime?: string;
  isLive?: boolean;
}

const DEFAULT_HEADLINE = "Sri Lankan voices.\nAustralian home.";
const DEFAULT_SUBLINE =
  "Trusted news, current affairs, drama and music for the Sri Lankan diaspora — broadcasting live from Melbourne to the world.";

export default function Hero({
  headline,
  subline,
  showTitle = "Evening News with Nirmali",
  showTime = "7:00 pm — 8:00 pm AEST",
  isLive = true,
}: HeroProps) {
  // `||` (not a default param) so empty/null CMS values fall back too — default
  // params only cover `undefined`, and an empty Sanity field comes through as null.
  const headlineText = headline || DEFAULT_HEADLINE;
  const sublineText = subline || DEFAULT_SUBLINE;
  const headlineLines = headlineText.split("\n");

  return (
    <section className={styles.hero} aria-label="Featured: live now">
      <video
        className={styles.video}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/assets/vishvavahini-logo-animation-poster.jpg"
        aria-hidden="true"
      >
        <source
          src="/assets/vishvavahini-logo-animation.mp4"
          type="video/mp4"
        />
      </video>
      <div className={styles.fallback} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          {isLive && (
            <span className="live-pill">
              <span className="dot" aria-hidden="true" />
              LIVE
            </span>
          )}
          <span>{showTitle}</span>
          <span className={styles.sep}>&middot;</span>
          <span>{showTime}</span>
        </div>

        <h1>
          {headlineLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < headlineLines.length - 1 && <br />}
            </span>
          ))}
        </h1>

        <p className={styles.lede}>{sublineText}</p>

        <div className="cta-row">
          <Link
            className="btn btn-primary"
            href="/watch"
            aria-label="Watch live"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch live
          </Link>

          <Link className="btn btn-ghost" href="#schedule">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            Tonight&apos;s schedule
          </Link>

          <button className="btn btn-ghost" aria-label="Add to My List">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            My list
          </button>
        </div>
      </div>
    </section>
  );
}
