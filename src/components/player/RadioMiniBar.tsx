"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRadioPlayer } from "./RadioPlayerProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PlayIcon, PauseIcon } from "./PlayerIcons";
import styles from "./RadioPlayer.module.css";

/**
 * Persistent bottom bar shown once the listener has started the radio. Because
 * it lives inside the player provider (root layout), it stays put across route
 * changes so playback and controls follow the user around the site.
 */
export default function RadioMiniBar() {
  const {
    status,
    nowPlaying,
    hasStarted,
    toggle,
    stop,
    volume,
    muted,
    setVolume,
    toggleMuted,
  } = useRadioPlayer();
  const { t } = useLanguage();
  const pathname = usePathname();

  const titleRef = useRef<HTMLSpanElement | null>(null);
  const [marquee, setMarquee] = useState(0); // overflow distance in px, 0 = fits

  const busy = status === "loading" || status === "reconnecting";
  const isPlaying = status === "playing";
  const active = isPlaying || busy;
  const statusLabel =
    status === "reconnecting"
      ? t("radio.reconnecting")
      : busy
        ? t("radio.buffering")
        : nowPlaying?.title || t("radio.nowStreaming");

  // Marquee only when the title actually overflows its box.
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const check = () => setMarquee(Math.max(0, el.scrollWidth - el.clientWidth));
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [statusLabel]);

  // Nothing to show until the user has pressed play once.
  if (!hasStarted) return null;
  // The /radio page has the full player; the CMS studio is admin-only.
  if (pathname === "/radio" || pathname?.startsWith("/studio")) return null;

  return (
    <div className={styles.miniBar} role="region" aria-label={t("radio.title")}>
      <button
        type="button"
        className={styles.miniPlay}
        onClick={toggle}
        aria-label={active ? t("radio.pause") : t("radio.listenLive")}
        data-busy={busy || undefined}
      >
        {active ? <PauseIcon /> : <PlayIcon />}
      </button>

      <Link href="/radio" className={styles.miniMeta}>
        <span className={styles.miniStation}>
          {isPlaying && nowPlaying?.isLive && (
            <span className="live-pill">
              <span className="dot" aria-hidden="true" />
              {t("radio.live")}
            </span>
          )}
          {nowPlaying?.station || t("radio.title")}
        </span>
        <span className={styles.miniTitleWrap}>
          <span
            ref={titleRef}
            className={`${styles.miniTitle} ${marquee ? styles.miniTitleScroll : ""}`}
            style={marquee ? ({ "--mq": `${marquee}px` } as CSSProperties) : undefined}
          >
            {statusLabel}
          </span>
        </span>
      </Link>

      <div className={styles.miniVolume}>
        <button
          type="button"
          className={styles.volBtn}
          onClick={toggleMuted}
          aria-label={muted ? t("radio.unmute") : t("radio.mute")}
        >
          {muted || volume === 0 ? "🔇" : "🔊"}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label={t("radio.volume")}
          className={styles.miniVolSlider}
        />
      </div>

      <button
        type="button"
        className={styles.miniClose}
        onClick={stop}
        aria-label={t("radio.close")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
