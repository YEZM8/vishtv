"use client";

import Link from "next/link";
import { useRadioPlayer } from "./RadioPlayerProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PlayIcon, PauseIcon } from "./PlayerIcons";
import styles from "./RadioPlayer.module.css";

/**
 * Homepage "Listen live" radio promo. Drives the same global player, so tapping
 * play here starts the radio and the persistent mini-bar takes over as the user
 * scrolls or navigates. Renders nothing if no stream is configured, so the
 * homepage never shows a dead promo.
 */
export default function RadioPromo() {
  const { status, nowPlaying, streamUrl, toggle } = useRadioPlayer();
  const { t } = useLanguage();

  if (!streamUrl) return null;

  const busy = status === "loading" || status === "reconnecting";
  const isPlaying = status === "playing";
  const active = isPlaying || busy;
  const live = isPlaying && !!nowPlaying?.isLive;

  return (
    <div className={styles.promo}>
      <div className={styles.promoIcon} aria-hidden="true">
        📻
      </div>

      <div className={styles.promoMeta}>
        <div className={styles.promoKicker}>
          {live ? (
            <span className="live-pill">
              <span className="dot" aria-hidden="true" />
              {t("radio.live")}
            </span>
          ) : (
            <span className={styles.promoLabel}>{t("radio.title")}</span>
          )}
        </div>
        <div className={styles.promoTitle}>
          {isPlaying && nowPlaying?.title ? nowPlaying.title : t("radio.subtitle")}
        </div>
      </div>

      <div className={styles.promoActions}>
        <button
          type="button"
          className={styles.promoPlay}
          onClick={toggle}
          aria-label={active ? t("radio.pause") : t("radio.listenLive")}
          data-busy={busy || undefined}
        >
          {active ? <PauseIcon /> : <PlayIcon />}
          <span>{active ? t("radio.playing") : t("radio.listenLive")}</span>
        </button>
        <Link href="/radio" className={styles.promoLink}>
          {t("radio.openPlayer")} →
        </Link>
      </div>
    </div>
  );
}
