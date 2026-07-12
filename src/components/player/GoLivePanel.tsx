"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import styles from "./RadioPlayer.module.css";

/**
 * Presenter-facing "go live" panel. When a Web DJ URL is configured in the CMS
 * it links out to the browser broadcaster; otherwise it explains the feature is
 * not switched on yet. Kept gated so it stays dormant until AzuraCast (or any
 * Web DJ) is deployed and its URL is pasted into Site Settings.
 */
export default function GoLivePanel({ webDjUrl }: { webDjUrl: string | null }) {
  const { t } = useLanguage();

  return (
    <div className={styles.goLive}>
      <h1 className={styles.goLiveTitle}>{t("radio.goLiveTitle")}</h1>

      {webDjUrl ? (
        <>
          <p className={styles.goLiveText}>{t("radio.goLiveIntro")}</p>
          <a
            className="btn btn-brand"
            href={webDjUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            🎙️ {t("radio.goLiveOpen")}
          </a>
          <p className={styles.goLiveNote}>{t("radio.goLiveNote")}</p>
          <p className={styles.goLiveNote}>{t("radio.goLiveFallback")}</p>
        </>
      ) : (
        <p className={styles.goLiveText}>{t("radio.goLiveNotReady")}</p>
      )}
    </div>
  );
}
