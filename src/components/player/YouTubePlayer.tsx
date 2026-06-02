"use client";

import { getEmbedUrl } from "@/lib/youtube";
import styles from "./YouTubePlayer.module.css";

interface YouTubePlayerProps {
  videoId: string;
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
  return (
    <div className={styles.wrapper}>
      <iframe
        className={styles.iframe}
        src={getEmbedUrl(videoId, autoplay)}
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
