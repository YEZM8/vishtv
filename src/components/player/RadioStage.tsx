"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRadioPlayer } from "./RadioPlayerProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PlayIcon, PauseIcon } from "./PlayerIcons";
import styles from "./RadioPlayer.module.css";

/**
 * The radio landing-page player surface. Drives the same global player as the
 * mini-bar (via the shared provider), so pressing play here keeps playing when
 * the listener navigates elsewhere.
 */
export default function RadioStage() {
  const { status, nowPlaying, streamUrl, volume, muted, toggle, setVolume, toggleMuted } =
    useRadioPlayer();
  const { t } = useLanguage();
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: nowPlaying?.station || t("radio.title"),
      text: nowPlaying?.title
        ? `${t("radio.nowStreaming")}: ${nowPlaying.title}`
        : t("radio.subtitle"),
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      // User cancelled the share sheet, or the API is unavailable — no-op.
    }
  };

  // No stream configured in the CMS → keep the existing offline treatment.
  if (!streamUrl) {
    return (
      <div className={styles.offline}>
        <p>{t("radio.offline")}</p>
        <p>{t("radio.offlineHint")}</p>
        <Link className="btn btn-brand" href="/browse" style={{ marginTop: "var(--sp-4)" }}>
          {t("radio.browse")}
        </Link>
      </div>
    );
  }

  const busy = status === "loading" || status === "reconnecting";
  const isPlaying = status === "playing";
  const active = isPlaying || busy;
  const live = isPlaying && !!nowPlaying?.isLive;

  const statusLine =
    status === "reconnecting"
      ? t("radio.reconnecting")
      : busy
        ? t("radio.buffering")
        : isPlaying
          ? t("radio.playing")
          : t("radio.nowStreaming");

  return (
    <div className={styles.stage} data-active={isPlaying || undefined}>
      <div className={styles.cover} data-live={live || undefined}>
        <Image
          src="/assets/vishvavahini-logo-primary-transparent.png"
          alt=""
          width={140}
          height={140}
          className={styles.coverImg}
          priority
        />
        <div
          className={`${styles.eq} ${isPlaying ? styles.eqActive : ""}`}
          aria-hidden="true"
        >
          <span className={styles.eqBar} />
          <span className={styles.eqBar} />
          <span className={styles.eqBar} />
          <span className={styles.eqBar} />
          <span className={styles.eqBar} />
        </div>
      </div>

      <div className={styles.statusRow}>
        {live && (
          <span className="live-pill">
            <span className="dot" aria-hidden="true" />
            {t("radio.live")}
          </span>
        )}
        <span className={styles.statusLabel}>{statusLine}</span>
      </div>

      {busy && !nowPlaying ? (
        <div className={styles.titleSkeleton} aria-hidden="true" />
      ) : (
        <div className={styles.stageTitle} aria-live="polite">
          {nowPlaying?.title || nowPlaying?.station || t("radio.title")}
        </div>
      )}
      {nowPlaying?.artist && <div className={styles.stageArtist}>{nowPlaying.artist}</div>}

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.shareBtn}
          onClick={handleShare}
          aria-label={t("radio.share")}
          title={shared ? "✓" : t("radio.share")}
        >
          {shared ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
            </svg>
          )}
        </button>

        <button
          type="button"
          className={styles.bigPlay}
          onClick={toggle}
          aria-label={active ? t("radio.pause") : t("radio.listenLive")}
          data-busy={busy || undefined}
        >
          {active ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className={styles.volume}>
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
            className={styles.volSlider}
          />
        </div>
      </div>

      {nowPlaying?.listeners != null && nowPlaying.listeners > 0 && (
        <div className={styles.listeners}>
          <span className={styles.listenDot} aria-hidden="true" />
          {nowPlaying.listeners} {t("radio.listeners")}
        </div>
      )}
    </div>
  );
}
