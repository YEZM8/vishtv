"use client";

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
  const { status, nowPlaying, hasStarted, toggle } = useRadioPlayer();
  const { t } = useLanguage();
  const pathname = usePathname();

  // Nothing to show until the user has pressed play once.
  if (!hasStarted) return null;
  // The /radio page has the full player; the CMS studio is admin-only.
  if (pathname === "/radio" || pathname?.startsWith("/studio")) return null;

  const busy = status === "loading" || status === "reconnecting";
  const isPlaying = status === "playing";
  const active = isPlaying || busy;

  const statusLabel =
    status === "reconnecting"
      ? t("radio.reconnecting")
      : busy
        ? t("radio.buffering")
        : nowPlaying?.title || t("radio.nowStreaming");

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
        <span className={styles.miniTitle}>{statusLabel}</span>
      </Link>
    </div>
  );
}
