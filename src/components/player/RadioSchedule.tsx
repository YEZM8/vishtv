"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  resolveOnNowUpNext,
  slotLabel,
  type ScheduleSlot,
} from "@/lib/radio";
import styles from "./RadioPlayer.module.css";

/** Format a 24h "HH:MM" string as a locale 12h time (e.g. "7:00 PM"). */
function formatTime(time: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!m) return time;
  const d = new Date();
  d.setHours(Number(m[1]), Number(m[2]), 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * "On now / Up next" panel for the radio page, derived from today's Sanity
 * schedule. Computed client-side against the viewer's clock, refreshed each
 * minute so it stays current without a page reload. Renders nothing when there
 * is no schedule for today (keeps the page clean rather than showing an empty
 * shell).
 */
export default function RadioSchedule({ slots }: { slots: ScheduleSlot[] }) {
  const { t } = useLanguage();
  // Recompute every minute. Start at -1 so the first client render (post-mount)
  // triggers a real computation; avoids using Date during SSR.
  const [nowMinutes, setNowMinutes] = useState<number>(-1);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNowMinutes(d.getHours() * 60 + d.getMinutes());
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!slots?.length || nowMinutes < 0) return null;

  const { onNow, upNext } = resolveOnNowUpNext(slots, nowMinutes);
  if (!onNow && !upNext) return null;

  return (
    <div className={styles.schedule}>
      {onNow && (
        <div className={`${styles.schedItem} ${styles.schedNow}`}>
          <div className={styles.schedHead}>
            {onNow.isLive ? (
              <span className="live-pill">
                <span className="dot" aria-hidden="true" />
                {t("radio.live")}
              </span>
            ) : (
              <span className={styles.schedTime}>{formatTime(onNow.time)}</span>
            )}
            <span className={styles.schedKicker}>{t("radio.onNow")}</span>
          </div>
          <div className={styles.schedTitle}>{slotLabel(onNow)}</div>
        </div>
      )}

      {upNext && (
        <div className={styles.schedItem}>
          <div className={styles.schedHead}>
            <span className={styles.schedTime}>{formatTime(upNext.time)}</span>
            <span className={styles.schedKicker}>{t("radio.upNext")}</span>
          </div>
          <div className={styles.schedTitle}>{slotLabel(upNext)}</div>
        </div>
      )}
    </div>
  );
}
