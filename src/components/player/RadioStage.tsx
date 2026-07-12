"use client";

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

  const statusLine =
    status === "reconnecting"
      ? t("radio.reconnecting")
      : busy
        ? t("radio.buffering")
        : isPlaying
          ? t("radio.playing")
          : t("radio.nowStreaming");

  return (
    <div className={styles.stage}>
      <div className={styles.stageArt}>
        <Image
          src="/assets/vishvavahini-logo-primary-transparent.png"
          alt=""
          width={160}
          height={160}
          className={styles.stageArtImg}
          priority
        />
        {isPlaying && nowPlaying?.isLive && (
          <span className={`live-pill ${styles.stageLive}`}>
            <span className="dot" aria-hidden="true" />
            {t("radio.live")}
          </span>
        )}
      </div>

      <div className={styles.stageStatus}>{statusLine}</div>
      <div className={styles.stageTitle} aria-live="polite">
        {nowPlaying?.title || nowPlaying?.station || t("radio.title")}
      </div>
      {nowPlaying?.artist && <div className={styles.stageArtist}>{nowPlaying.artist}</div>}

      <div className={styles.controls}>
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
          {nowPlaying.listeners} {t("radio.listeners")}
        </div>
      )}
    </div>
  );
}
