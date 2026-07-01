"use client";

import { getEmbedUrl, getLiveChannelEmbedUrl } from "@/lib/youtube";
import styles from "./YouTubePlayer.module.css";

interface YouTubePlayerProps {
  videoId?: string;
  /** When set, embeds the channel's current live stream instead of a specific video. */
  liveChannelId?: string;
  autoplay?: boolean;
  isLive?: boolean;
  title?: string;
}

export default function YouTubePlayer({
  videoId,
  liveChannelId,
  autoplay = false,
  isLive = false,
  title = "VishTV video player",
}: YouTubePlayerProps) {
  const src = liveChannelId
    ? getLiveChannelEmbedUrl(liveChannelId, autoplay)
    : getEmbedUrl(videoId || "", autoplay);

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
