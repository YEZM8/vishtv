"use client";

import { getEmbedUrl } from "@/lib/youtube";
import styles from "./YouTubePlayer.module.css";

interface YouTubePlayerProps {
  videoId?: string;
  autoplay?: boolean;
  isLive?: boolean;
  title?: string;
}

export default function YouTubePlayer({
  videoId,
  autoplay = false,
  isLive = false,
  title = "VishTV video player",
}: YouTubePlayerProps) {
  // Guard against an empty embed (renders nothing rather than a broken /embed/ iframe).
  if (!videoId) return null;
  const src = getEmbedUrl(videoId, autoplay);

  return (
    <div className={styles.wrapper}>
      <iframe
        className={styles.iframe}
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
      {isLive && (
        <div className={styles.liveBadge}>
          <span className="live-pill">
            <span className="dot" aria-hidden="true" />
            LIVE
          </span>
        </div>
      )}
    </div>
  );
}
